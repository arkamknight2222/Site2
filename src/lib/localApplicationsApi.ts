import { ApplicationStatus, ApplicantWithApplication, Applicant, Application } from './types';
import { generateMockApplicant, generateMockApplication } from './mockData';

const STORAGE_KEY = 'rushWorking_applications';

function getAllApplicationsData(): Record<string, ApplicantWithApplication[]> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveAllApplicationsData(data: Record<string, ApplicantWithApplication[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function fetchApplicationsForJob(jobId: string): ApplicantWithApplication[] {
  const allData = getAllApplicationsData();
  return allData[jobId] || [];
}

export function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  changedBy: string = 'employer'
): void {
  const allData = getAllApplicationsData();

  for (const jobId in allData) {
    const applications = allData[jobId];
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

    if (JSON.stringify(updatedApplications) !== JSON.stringify(applications)) {
      allData[jobId] = updatedApplications;
      saveAllApplicationsData(allData);
      break;
    }
  }
}

export function fetchStatusHistory(applicationId: string): any[] {
  const historyKey = 'rushWorking_statusHistory';
  const data = localStorage.getItem(historyKey);
  const allHistory = data ? JSON.parse(data) : {};
  return allHistory[applicationId] || [];
}

export function createMockApplicationsForJob(jobId: string, count: number = 50): boolean {
  const applications: ApplicantWithApplication[] = [];
  const randomCount = Math.floor(Math.random() * 15) + 20;

  for (let i = 0; i < count; i++) {
    const isPoints = i >= randomCount;
    const applicant = generateMockApplicant(i);
    const application = generateMockApplication(jobId, applicant.id, isPoints);

    applications.push({
      ...applicant,
      application
    });
  }

  const allData = getAllApplicationsData();
  allData[jobId] = applications;
  saveAllApplicationsData(allData);

  return true;
}
