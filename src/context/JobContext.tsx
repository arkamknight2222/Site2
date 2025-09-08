import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
  featured?: boolean;
  isEvent?: boolean;
  eventDate?: string;
  requiresApplication?: boolean;
}

interface JobContextType {
  jobs: Job[];
  events: Job[];
  addJob: (jobData: any) => Job;
  updateJob: (jobId: string, jobData: any) => boolean;
  deleteJob: (jobId: string) => boolean;
  getJob: (jobId: string) => Job | undefined;
  applyToJob: (jobId: string, userId: string) => boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Job[]>([]);

  useEffect(() => {
    loadJobs();
    loadEvents();
  }, []);

  const loadJobs = async () => {
    try {
      console.log('[JobContext] Loading jobs from database');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_event', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading jobs:', error);
        
        // Check if it's a network error
        if (error.message && error.message.includes('Failed to fetch')) {
          console.log('[JobContext] Network error detected, using mock jobs');
          setJobs(getMockJobs());
          return;
        }
        
        setJobs([]);
        return;
      }

      const jobsData = data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type as any,
        salary: {
          min: job.salary_min,
          max: job.salary_max,
        },
        description: job.description,
        requirements: job.requirements || [],
        experienceLevel: job.experience_level as any,
        educationLevel: job.education_level as any,
        minimumPoints: job.minimum_points,
        postedDate: job.created_at,
        featured: job.featured,
      }));

      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      console.log('[JobContext] Exception loading jobs, using mock data');
      setJobs(getMockJobs());
    }
  };

  const loadEvents = async () => {
    try {
      console.log('[JobContext] Loading events from database');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_event', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading events:', error);
        
        // Check if it's a network error
        if (error.message && error.message.includes('Failed to fetch')) {
          console.log('[JobContext] Network error detected, using mock events');
          setEvents(getMockEvents());
          return;
        }
        
        setEvents([]);
        return;
      }

      const eventsData = data.map(event => ({
        id: event.id,
        title: event.title,
        company: event.company,
        location: event.location,
        type: event.type as any,
        salary: { min: 0, max: 0 },
        description: event.description,
        requirements: event.requirements || [],
        experienceLevel: event.experience_level as any,
        educationLevel: event.education_level as any,
        minimumPoints: event.minimum_points,
        postedDate: event.created_at,
        featured: event.featured,
        isEvent: true,
        eventDate: event.event_date,
        requiresApplication: event.requires_application,
      }));

      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      console.log('[JobContext] Exception loading events, using mock data');
      setEvents(getMockEvents());
    }
  };

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

  const addJob = (jobData: any): Job => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type,
      salary: jobData.salary,
      description: jobData.description,
      requirements: jobData.requirements,
      experienceLevel: jobData.experienceLevel,
      educationLevel: jobData.educationLevel,
      minimumPoints: jobData.minimumPoints,
      postedDate: new Date().toISOString(),
      featured: jobData.featured,
      isEvent: jobData.isEvent,
      eventDate: jobData.eventDate,
      requiresApplication: jobData.requiresApplication,
    };

    if (jobData.isEvent) {
      setEvents(prev => [newJob, ...prev]);
    } else {
      setJobs(prev => [newJob, ...prev]);
    }

    return newJob;
  };

  const updateJob = (jobId: string, jobData: any): boolean => {
    const updateArray = (prev: Job[]) =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, ...jobData, id: jobId }
          : job
      );

    setJobs(updateArray);
    setEvents(updateArray);
    return true;
  };

  const deleteJob = (jobId: string): boolean => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setEvents(prev => prev.filter(event => event.id !== jobId));
    return true;
  };

  const getJob = (jobId: string): Job | undefined => {
    return [...jobs, ...events].find(job => job.id === jobId);
  };

  const applyToJob = (jobId: string, userId: string): boolean => {
    // In a real app, this would create an application record
    console.log(`Applied to job ${jobId} for user ${userId}`);
    return true;
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        events,
        addJob,
        updateJob,
        deleteJob,
        getJob,
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