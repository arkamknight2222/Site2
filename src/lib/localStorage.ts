import { ApplicantWithApplication, ApplicationStatus } from './mockData';

const STORAGE_KEYS = {
  APPLICATIONS: 'rushWorking_applications',
  APPLICANTS: 'rushWorking_applicants',
  JOBS: 'rushWorking_jobs',
  EVENTS: 'rushWorking_events',
  POSTED_ITEMS: 'rushWorkingPostedItems'
} as const;

export function saveApplicationsForJob(jobId: string, applications: ApplicantWithApplication[]): void {
  const allApplications = getAllApplications();
  allApplications[jobId] = applications;
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(allApplications));
}

export function getApplicationsForJob(jobId: string): ApplicantWithApplication[] {
  const allApplications = getAllApplications();
  return allApplications[jobId] || [];
}

function getAllApplications(): Record<string, ApplicantWithApplication[]> {
  const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
  return data ? JSON.parse(data) : {};
}

export function updateApplicationStatus(
  jobId: string,
  applicationId: string,
  newStatus: ApplicationStatus
): void {
  const applications = getApplicationsForJob(jobId);
  const updatedApplications = applications.map(app => {
    if (app.application.id === applicationId) {
      return {
        ...app,
        application: {
          ...app.application,
          application_status: newStatus
        }
      };
    }
    return app;
  });
  saveApplicationsForJob(jobId, updatedApplications);
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export function exportData(): string {
  const data: Record<string, any> = {};
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey);
    if (value) {
      data[key] = JSON.parse(value);
    }
  });
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (data[key]) {
        localStorage.setItem(storageKey, JSON.stringify(data[key]));
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
