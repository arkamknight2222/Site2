import { supabase } from '../lib/supabase';

export interface ResumeFile {
  id: string;
  name: string;
  fileName: string;
  size: number;
  uploadDate: string;
  isDefault: boolean;
  folderId: string;
  url: string;
}

export interface ResumeFolder {
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
        console.error('Error loading resumes:', error);
        return [];
      }

      return data.map(resume => ({
        id: resume.id,
        name: resume.name,
        fileName: resume.file_name,
        size: resume.file_size,
        uploadDate: resume.created_at,
        isDefault: resume.is_default,
        folderId: resume.folder_id,
        url: resume.file_url,
      }));
    } catch (error) {
      console.error('Error loading resumes:', error);
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
        console.error('Error loading folders:', error);
        return [];
      }

      return data.map(folder => ({
        id: folder.id,
        name: folder.name,
        sortBy: folder.sort_by as any,
        sortOrder: folder.sort_order as any,
      }));
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  },

  async createFolder(userId: string, name: string): Promise<ResumeFolder | null> {
    try {
      const { data, error } = await supabase
        .from('resume_folders')
        .insert({
          user_id: userId,
          name,
          sort_by: 'date',
          sort_order: 'desc',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating folder:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        sortBy: data.sort_by as any,
        sortOrder: data.sort_order as any,
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  },

  async deleteFolder(folderId: string): Promise<boolean> {
    try {
      // First, move all resumes in this folder to uncategorized
      const { error: moveError } = await supabase
        .from('resumes')
        .update({ folder_id: 'uncategorized' })
        .eq('folder_id', folderId);

      if (moveError) {
        console.error('Error moving resumes:', moveError);
        return false;
      }

      // Then delete the folder
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

  async uploadResume(userId: string, file: File, name: string, folderId: string = 'uncategorized'): Promise<ResumeFile | null> {
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `resumes/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Check if this is the first resume (should be default)
      const { data: existingResumes } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', userId);

      const isFirstResume = !existingResumes || existingResumes.length === 0;

      // Create resume record
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          name,
          file_name: file.name,
          file_size: file.size,
          file_url: publicUrl,
          folder_id: folderId,
          is_default: isFirstResume,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating resume record:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        fileName: data.file_name,
        size: data.file_size,
        uploadDate: data.created_at,
        isDefault: data.is_default,
        folderId: data.folder_id,
        url: data.file_url,
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      return null;
    }
  },

  async setDefaultResume(resumeId: string, userId: string): Promise<boolean> {
    try {
      // First, unset all other resumes as default
      const { error: unsetError } = await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (unsetError) {
        console.error('Error unsetting default resumes:', unsetError);
        return false;
      }

      // Then set the selected resume as default
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

  async deleteResume(resumeId: string): Promise<boolean> {
    try {
      // Get resume info first
      const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('file_url, user_id, is_default')
        .eq('id', resumeId)
        .single();

      if (fetchError) {
        console.error('Error fetching resume:', fetchError);
        return false;
      }

      // Delete from storage
      const filePath = resume.file_url.split('/').slice(-2).join('/');
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) {
        console.error('Error deleting resume:', error);
        return false;
      }

      // If deleted resume was default, set another as default
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

  async moveResume(resumeId: string, folderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ folder_id: folderId })
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
};