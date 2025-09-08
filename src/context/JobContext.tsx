import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: {
    min: number;
    max: number;
  };
  description: string;
  requirements: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  educationLevel: 'high-school' | 'bachelor' | 'master' | 'phd';
  minimumPoints: number;
  postedDate: string;
  isEvent?: boolean;
  eventDate?: string;
  featured?: boolean;
  requiresApplication?: boolean;
}

interface JobContextType {
  jobs: Job[];
  events: Job[];
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  getJob: (id: string) => Job | undefined;
  applyToJob: (jobId: string, userId: string) => boolean;
  updateJob: (id: string, updates: Partial<Job>) => boolean;
  deleteJob: (id: string) => boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Job[]>([]);

  // Load jobs and events from database
  useEffect(() => {
    loadJobs();
    loadEvents();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_event', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading jobs:', error);
        return;
      }

      const formattedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type as any,
        salary: { min: job.salary_min, max: job.salary_max },
        description: job.description,
        requirements: job.requirements,
        experienceLevel: job.experience_level as any,
        educationLevel: job.education_level as any,
        minimumPoints: job.minimum_points,
        postedDate: job.created_at.split('T')[0],
        featured: job.featured,
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_event', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      const formattedEvents: Job[] = data.map(event => ({
        id: event.id,
        title: event.title,
        company: event.company,
        location: event.location,
        type: event.type as any,
        salary: { min: 0, max: 0 },
        description: event.description,
        requirements: event.requirements,
        experienceLevel: event.experience_level as any,
        educationLevel: event.education_level as any,
        minimumPoints: event.minimum_points,
        postedDate: event.created_at.split('T')[0],
        isEvent: true,
        eventDate: event.event_date,
        requiresApplication: event.requires_application,
        featured: event.featured,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          type: jobData.type,
          salary_min: jobData.salary.min,
          salary_max: jobData.salary.max,
          description: jobData.description,
          requirements: jobData.requirements,
          experience_level: jobData.experienceLevel,
          education_level: jobData.educationLevel,
          minimum_points: jobData.minimumPoints,
          is_event: jobData.isEvent || false,
          event_date: jobData.eventDate,
          requires_application: jobData.requiresApplication !== false,
          featured: jobData.featured || false,
          posted_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        return null;
      }

      const newJob: Job = {
        id: data.id,
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type as any,
        salary: { min: data.salary_min, max: data.salary_max },
        description: data.description,
        requirements: data.requirements,
        experienceLevel: data.experience_level as any,
        educationLevel: data.education_level as any,
        minimumPoints: data.minimum_points,
        postedDate: data.created_at.split('T')[0],
        isEvent: data.is_event,
        eventDate: data.event_date,
        requiresApplication: data.requires_application,
        featured: data.featured,
      };

      if (jobData.isEvent) {
        setEvents(prev => [newJob, ...prev]);
      } else {
        setJobs(prev => [newJob, ...prev]);
      }

      return newJob;
    } catch (error) {
      console.error('Error adding job:', error);
      return null;
    }
  };

  const getJob = (id: string): Job | undefined => {
    return [...jobs, ...events].find(job => job.id === id);
  };

  const applyToJob = async (jobId: string, userId: string): Promise<boolean> => {
    try {
      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          points_used: 0,
          status: 'pending',
        });

      if (applicationError) {
        console.error('Error creating application:', error);
        return false;
      }

      // Add points history for application
      await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          type: 'earned',
          amount: 10,
          description: `Applied to ${jobs.find(j => j.id === jobId)?.title || 'job'}`,
          category: 'application',
          related_job_id: jobId,
        });

      // Update user points
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: (user?.points || 0) + 10 })
        .eq('id', userId);

      if (pointsError) {
        console.error('Error updating points:', pointsError);
      }

      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      return false;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: updates.title,
          company: updates.company,
          location: updates.location,
          type: updates.type,
          salary_min: updates.salary?.min,
          salary_max: updates.salary?.max,
          description: updates.description,
          requirements: updates.requirements,
          experience_level: updates.experienceLevel,
          education_level: updates.educationLevel,
          minimum_points: updates.minimumPoints,
          is_event: updates.isEvent,
          event_date: updates.eventDate,
          requires_application: updates.requiresApplication,
          featured: updates.featured,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating job:', error);
        return false;
      }

      // Update local state
      if (updates.isEvent) {
        setEvents(prev => prev.map(event => 
          event.id === id ? { ...event, ...updates } : event
        ));
      } else {
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, ...updates } : job
        ));
      }

      return true;
    } catch (error) {
      console.error('Error updating job:', error);
      return false;
    }
  };

  const deleteJob = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting job:', error);
        return false;
      }

      // Update local state
      const jobExists = jobs.some(job => job.id === id);
      if (jobExists) {
        setJobs(prev => prev.filter(job => job.id !== id));
      } else {
        setEvents(prev => prev.filter(event => event.id !== id));
      }

      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        events,
        addJob,
        getJob,
        applyToJob,
        updateJob,
        deleteJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}