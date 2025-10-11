import { supabase } from '../lib/supabase';

interface ResumeFile {
  id: string;
  name: string;
  fileName: string;
  size: number;
  uploadDate: string;
  isDefault: boolean;
  folderId: string;
  url: string;
}

interface ResumeFolder {
  id: string;
  name: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

export const resumeService = {
  async getResumes(userId: string): Promise<ResumeFile[]> {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resumes:', error);
        return [];
      }

      return data?.map(resume => ({
        id: resume.id,
        name: resume.name,
        fileName: resume.file_name,
        size: resume.file_size,
        uploadDate: resume.created_at,
        isDefault: resume.is_default,
        folderId: resume.folder_id || 'uncategorized',
        url: resume.file_url,
      })) || [];
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }
  },

  async getFolders(userId: string): Promise<ResumeFolder[]> {
    try {
      const { data, error } = await supabase
        .from('resume_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching folders:', error);
        return [];
      }

      return data?.map(folder => ({
        id: folder.id,
        name: folder.name,
        sortBy: folder.sort_by as 'name' | 'date' | 'size',
        sortOrder: folder.sort_order as 'asc' | 'desc',
      })) || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  },

  async uploadResume(userId: string, file: File, name: string, folderId: string): Promise<boolean> {
    try {
      // Upload file to Supabase storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${userId}/${fileName}`, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return false;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(`${userId}/${fileName}`);

      // Check if this is the first resume (should be default)
      const { data: existingResumes } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      const isFirstResume = !existingResumes || existingResumes.length === 0;

      // Save resume metadata to database
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          name,
          file_name: file.name,
          file_size: file.size,
          file_url: publicUrl,
          folder_id: folderId === 'all' ? 'uncategorized' : folderId,
          is_default: isFirstResume,
        });

      if (dbError) {
        console.error('Error saving resume metadata:', dbError);
        // Clean up uploaded file
        await supabase.storage
          .from('resumes')
          .remove([`${userId}/${fileName}`]);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error uploading resume:', error);
      return false;
    }
  },

  async createFolder(userId: string, name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resume_folders')
        .insert({
          user_id: userId,
          name,
          sort_by: 'date',
          sort_order: 'desc',
        });

      if (error) {
        console.error('Error creating folder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      return false;
    }
  },

  async deleteFolder(folderId: string): Promise<boolean> {
    try {
      // Move all resumes in this folder to uncategorized
      await supabase
        .from('resumes')
        .update({ folder_id: 'uncategorized' })
        .eq('folder_id', folderId);

      // Delete the folder
      const { error } = await supabase
        .from('resume_folders')
        .delete()
        .eq('id', folderId);

      if (error) {
        console.error('Error deleting folder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  },

  async deleteResume(resumeId: string): Promise<boolean> {
    try {
      // Get resume details first
      const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (fetchError || !resume) {
        console.error('Error fetching resume:', fetchError);
        return false;
      }

      // Delete file from storage
      const filePath = resume.file_url.split('/').slice(-2).join('/'); // Extract user_id/filename
      await supabase.storage
        .from('resumes')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) {
        console.error('Error deleting resume:', error);
        return false;
      }

      // If this was the default resume, set another as default
      if (resume.is_default) {
        const { data: remainingResumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', resume.user_id)
          .limit(1);

        if (remainingResumes && remainingResumes.length > 0) {
          await this.setDefaultResume(remainingResumes[0].id, resume.user_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    }
  },

  async setDefaultResume(resumeId: string, userId: string): Promise<boolean> {
    try {
      // First, unset all default resumes for this user
      await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the specified resume as default
      const { error } = await supabase
        .from('resumes')
        .update({ is_default: true })
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error setting default resume:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting default resume:', error);
      return false;
    }
  },

  async moveResume(resumeId: string, targetFolderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ folder_id: targetFolderId })
        .eq('id', resumeId);

      if (error) {
        console.error('Error moving resume:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error moving resume:', error);
      return false;
    }
  },

  async bulkDeleteResumes(resumeIds: string[], userId: string): Promise<boolean> {
    try {
      // Get resume details for file cleanup
      const { data: resumes, error: fetchError } = await supabase
        .from('resumes')
        .select('*')
        .in('id', resumeIds)
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching resumes for deletion:', fetchError);
        return false;
      }

      // Delete files from storage
      if (resumes && resumes.length > 0) {
        const filePaths = resumes.map(resume => {
          const filePath = resume.file_url.split('/').slice(-2).join('/');
          return filePath;
        });

        await supabase.storage
          .from('resumes')
          .remove(filePaths);
      }

      // Delete from database
      const { error } = await supabase
        .from('resumes')
        .delete()
        .in('id', resumeIds)
        .eq('user_id', userId);

      if (error) {
        console.error('Error bulk deleting resumes:', error);
        return false;
      }

      // Check if any deleted resume was default and set a new default if needed
      const hasDefault = resumes?.some(resume => resume.is_default);
      if (hasDefault) {
        const { data: remainingResumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (remainingResumes && remainingResumes.length > 0) {
          await this.setDefaultResume(remainingResumes[0].id, userId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error bulk deleting resumes:', error);
      return false;
    }
  },

  async bulkMoveResumes(resumeIds: string[], targetFolderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ folder_id: targetFolderId })
        .in('id', resumeIds);

      if (error) {
        console.error('Error bulk moving resumes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error bulk moving resumes:', error);
      return false;
    }
  },
};