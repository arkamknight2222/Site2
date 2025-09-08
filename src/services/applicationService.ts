import { supabase } from '../lib/supabase';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeId?: string;
  pointsUsed: number;
  addedPoints: number;
  status: 'pending' | 'interviewed' | 'accepted' | 'rejected';
  response?: string;
  hasDirectMessage: boolean;
  createdAt: string;
  updatedAt: string;
  job?: {
    title: string;
    company: string;
    minimumPoints: number;
  };
}

export const applicationService = {
  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            title,
            company,
            minimum_points
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading applications:', error);
        return [];
      }

      return data.map(app => ({
        id: app.id,
        jobId: app.job_id,
        userId: app.user_id,
        resumeId: app.resume_id,
        pointsUsed: app.points_used,
        addedPoints: app.added_points,
        status: app.status as any,
        response: app.response,
        hasDirectMessage: app.has_direct_message,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        job: app.jobs ? {
          title: app.jobs.title,
          company: app.jobs.company,
          minimumPoints: app.jobs.minimum_points,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  },

  async createApplication(
    jobId: string,
    userId: string,
    resumeId?: string,
    pointsUsed: number = 0
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          resume_id: resumeId,
          points_used: pointsUsed,
          status: 'pending',
        });

      if (error) {
        console.error('Error creating application:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating application:', error);
      return false;
    }
  },

  async updateApplicationPoints(
    applicationId: string,
    addedPoints: number,
    userId: string
  ): Promise<boolean> {
    try {
      // Get current application
      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('added_points')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching application:', fetchError);
        return false;
      }

      const newAddedPoints = application.added_points + addedPoints;

      // Update application
      const { error } = await supabase
        .from('applications')
        .update({ added_points: newAddedPoints })
        .eq('id', applicationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating application points:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating application points:', error);
      return false;
    }
  },
};