import React, { createContext, useContext, useState, ReactNode } from 'react';

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

// Mock data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: { min: 120000, max: 180000 },
    description: 'We are looking for an experienced frontend developer to join our team and work on cutting-edge web applications.',
    requirements: ['React', 'TypeScript', '5+ years experience', 'Team leadership'],
    experienceLevel: 'senior',
    educationLevel: 'bachelor',
    minimumPoints: 100,
    postedDate: '2025-01-08',
    featured: true,
  },
  {
    id: '2',
    title: 'Marketing Specialist',
    company: 'Growth Labs',
    location: 'New York, NY',
    type: 'full-time',
    salary: { min: 60000, max: 80000 },
    description: 'Join our marketing team to drive growth and engagement across digital channels.',
    requirements: ['Digital Marketing', 'Analytics', '2+ years experience'],
    experienceLevel: 'mid',
    educationLevel: 'bachelor',
    minimumPoints: 85,
    postedDate: '2025-01-07',
  },
  {
    id: '3',
    title: 'Remote Data Analyst',
    company: 'Data Solutions LLC',
    location: 'Remote',
    type: 'remote',
    salary: { min: 70000, max: 95000 },
    description: 'Analyze large datasets and provide insights to drive business decisions.',
    requirements: ['Python', 'SQL', 'Statistics', '3+ years experience'],
    experienceLevel: 'mid',
    educationLevel: 'bachelor',
    minimumPoints: 92,
    postedDate: '2025-01-06',
  },
];

const mockEvents: Job[] = [
  {
    id: 'e1',
    title: 'Tech Career Fair 2025',
    company: 'City Career Center',
    location: 'Los Angeles, CA',
    type: 'full-time',
    salary: { min: 0, max: 0 },
    description: 'Meet with top tech companies and explore career opportunities in the tech industry.',
    requirements: ['Bring resume', 'Professional attire'],
    experienceLevel: 'entry',
    educationLevel: 'high-school',
    minimumPoints: 0,
    postedDate: '2025-01-08',
    isEvent: true,
    eventDate: '2025-01-25',
    requiresApplication: true,
  },
  {
    id: 'e2',
    title: 'Networking Mixer for Professionals',
    company: 'Business Network Group',
    location: 'Chicago, IL',
    type: 'part-time',
    salary: { min: 0, max: 0 },
    description: 'Connect with industry professionals and expand your network.',
    requirements: ['Business casual', 'LinkedIn profile'],
    experienceLevel: 'mid',
    educationLevel: 'bachelor',
    minimumPoints: 0,
    postedDate: '2025-01-07',
    isEvent: true,
    eventDate: '2025-01-20',
    requiresApplication: false,
  },
];

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [events, setEvents] = useState<Job[]>(mockEvents);

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0],
    };

    if (jobData.isEvent) {
      setEvents(prev => [newJob, ...prev]);
    } else {
      setJobs(prev => [newJob, ...prev]);
    }

    return newJob;
  };

  const getJob = (id: string): Job | undefined => {
    return [...jobs, ...events].find(job => job.id === id);
  };

  const applyToJob = (jobId: string, userId: string): boolean => {
    // Simulate application logic
    console.log(`User ${userId} applied to job ${jobId}`);
    return true;
  };

  const updateJob = (id: string, updates: Partial<Job>): boolean => {
    try {
      // Find and update in jobs array
      const jobIndex = jobs.findIndex(job => job.id === id);
      if (jobIndex !== -1) {
        const updatedJob = { ...jobs[jobIndex], ...updates };
        const newJobs = [...jobs];
        newJobs[jobIndex] = updatedJob;
        setJobs(newJobs);
        return true;
      }

      // Find and update in events array
      const eventIndex = events.findIndex(event => event.id === id);
      if (eventIndex !== -1) {
        const updatedEvent = { ...events[eventIndex], ...updates };
        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating job:', error);
      return false;
    }
  };

  const deleteJob = (id: string): boolean => {
    try {
      // Try to delete from jobs array
      const jobExists = jobs.some(job => job.id === id);
      if (jobExists) {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
        return true;
      }

      // Try to delete from events array
      const eventExists = events.some(event => event.id === id);
      if (eventExists) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        return true;
      }

      return false;
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