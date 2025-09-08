import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number };
  description: string;
  requirements: string[];
  experienceLevel: string;
  educationLevel: string;
  minimumPoints: number;
  postedDate: string;
  featured: boolean;
  isEvent?: boolean;
  eventDate?: string;
  requiresApplication?: boolean;
}

interface JobContextType {
  jobs: Job[];
  events: Job[];
  loading: boolean;
  getJob: (id: string) => Job | undefined;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => Promise<boolean>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<boolean>;
  deleteJob: (id: string) => Promise<boolean>;
  applyToJob: (jobId: string, resumeId?: string) => Promise<boolean>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const getMockJobs = (): Job[] => {
  return [
    {
      id: 'mock-1',
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 120000, max: 180000 },
      description: 'We are looking for an experienced React developer to join our growing team. You will be responsible for building scalable web applications using modern React patterns and best practices.',
      requirements: [
        '5+ years of React experience',
        'Strong TypeScript skills',
        'Experience with state management (Redux/Zustand)',
        'Knowledge of testing frameworks (Jest, React Testing Library)',
        'Familiarity with modern build tools (Vite, Webpack)'
      ],
      experienceLevel: 'senior',
      educationLevel: 'bachelor',
      minimumPoints: 100,
      postedDate: '2025-01-08',
      featured: true,
    },
    {
      id: 'mock-2',
      title: 'Frontend Developer',
      company: 'StartupX',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 80000, max: 120000 },
      description: 'Join our innovative startup as a Frontend Developer. Work with cutting-edge technologies and help shape the future of our product.',
      requirements: [
        '3+ years of JavaScript experience',
        'React or Vue.js experience',
        'CSS/SCSS proficiency',
        'Responsive design skills',
        'Git version control'
      ],
      experienceLevel: 'mid',
      educationLevel: 'bachelor',
      minimumPoints: 50,
      postedDate: '2025-01-07',
      featured: false,
    },
    {
      id: 'mock-3',
      title: 'Junior Web Developer',
      company: 'Digital Agency',
      location: 'New York, NY',
      type: 'full-time',
      salary: { min: 60000, max: 80000 },
      description: 'Perfect opportunity for a junior developer to grow their skills in a supportive environment. You will work on various client projects and learn from experienced developers.',
      requirements: [
        '1+ years of web development experience',
        'HTML, CSS, JavaScript knowledge',
        'Basic React or Angular experience',
        'Willingness to learn',
        'Strong communication skills'
      ],
      experienceLevel: 'entry',
      educationLevel: 'bachelor',
      minimumPoints: 25,
      postedDate: '2025-01-06',
      featured: false,
    },
  ];
};

const getMockEvents = (): Job[] => {
  return [
    {
      id: 'mock-event-1',
      title: 'Tech Career Fair 2025',
      company: 'City Career Center',
      location: 'Los Angeles Convention Center',
      type: 'full-time',
      salary: { min: 0, max: 0 },
      description: 'Join us for the biggest tech career fair of the year! Meet with top employers, attend workshops, and network with industry professionals.',
      requirements: [
        'Bring multiple copies of your resume',
        'Business professional attire',
        'Portfolio or work samples (optional)',
        'Networking mindset'
      ],
      experienceLevel: 'entry',
      educationLevel: 'high-school',
      minimumPoints: 0,
      postedDate: '2025-01-05',
      isEvent: true,
      eventDate: '2025-01-25',
      requiresApplication: false,
      featured: true,
    },
    {
      id: 'mock-event-2',
      title: 'Senior Developer Networking Mixer',
      company: 'Tech Professionals Network',
      location: 'San Francisco, CA',
      type: 'part-time',
      salary: { min: 0, max: 0 },
      description: 'Exclusive networking event for senior developers. Connect with CTOs, lead engineers, and other senior professionals in an intimate setting.',
      requirements: [
        'Minimum 5 years experience',
        'Current or recent senior role',
        'Business cards',
        'Professional attire'
      ],
      experienceLevel: 'senior',
      educationLevel: 'bachelor',
      minimumPoints: 75,
      postedDate: '2025-01-04',
      isEvent: true,
      eventDate: '2025-01-20',
      requiresApplication: true,
      featured: false,
    },
  ];
};

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.log('Error loading jobs:', error);
        // Use mock data as fallback
        setJobs(getMockJobs());
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.log('Error loading jobs:', error);
      // Use mock data as fallback
      setJobs(getMockJobs());
    } finally {
      setLoading(false);
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
        console.log('Error loading events:', error);
        // Use mock data as fallback
        setEvents(getMockEvents());
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.log('Error loading events:', error);
      // Use mock data as fallback
      setEvents(getMockEvents());
    }
  };

  const getJob = (id: string): Job | undefined => {
    return [...jobs, ...events].find(job => job.id === id);
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          posted_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding job:', error);
        return false;
      }

      // Refresh jobs list
      await loadJobs();
      return true;
    } catch (error) {
      console.error('Error adding job:', error);
      return false;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating job:', error);
        return false;
      }

      // Refresh jobs list
      await loadJobs();
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

      // Refresh jobs list
      await loadJobs();
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  };

  const applyToJob = async (jobId: string, resumeId?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          resume_id: resumeId,
          points_used: 10, // Default points cost
        });

      if (error) {
        console.error('Error applying to job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      return false;
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        events,
        loading,
        getJob,
        addJob,
        updateJob,
        deleteJob,
        applyToJob,
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