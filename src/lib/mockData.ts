export type ApplicationStatus =
  | 'applicant'
  | 'interested'
  | 'in_review'
  | 'interviewing'
  | 'interviewed'
  | 'offer_extended'
  | 'accepted'
  | 'rejected'
  | 'waitlisted';

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; description: string }> = {
  applicant: {
    label: 'Applicant',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Initial application submitted'
  },
  interested: {
    label: 'Interested',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Employer has shown interest'
  },
  in_review: {
    label: 'In Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Application is being reviewed'
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Candidate is in interview process'
  },
  interviewed: {
    label: 'Interviewed',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    description: 'Interviews have been completed'
  },
  offer_extended: {
    label: 'Offer Extended',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    description: 'Job offer has been sent'
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Offer accepted by candidate'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Application has been rejected'
  },
  waitlisted: {
    label: 'Waitlisted',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Candidate placed on waitlist'
  }
};

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  application_type: 'random' | 'points';
  points_used: number;
  status: string;
  application_status: ApplicationStatus;
  applied_at: string;
}

export interface Applicant {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  experience: string | null;
  degree: string | null;
  citizenship: string | null;
  criminal_record: string | null;
  resume_url: string | null;
}

export interface ApplicantWithApplication extends Applicant {
  application: Application;
}

const FIRST_NAMES = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Jennifer', 'Richard', 'Amanda', 'Thomas', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Betty', 'Matthew', 'Margaret', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Dorothy', 'Steven', 'Kimberly'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright'];
const GENDERS = ['Male', 'Female', 'Non-binary'];
const EXPERIENCES = ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)', 'Expert Level (10+ years)'];
const DEGREES = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
const CITIZENSHIPS = ['US Citizen', 'Permanent Resident', 'Work Visa (H1B)', 'Work Authorization (EAD)'];
const STATUSES: ApplicationStatus[] = ['applicant', 'interested', 'in_review', 'interviewing', 'interviewed', 'offer_extended', 'accepted', 'rejected', 'waitlisted'];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAge(): number {
  return Math.floor(Math.random() * 30) + 22;
}

function randomPhone(): string {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

export function generateMockApplicant(index: number): Applicant {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  return {
    id: `applicant-${Date.now()}-${index}`,
    user_id: `user-${Date.now()}-${index}`,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: randomPhone(),
    age: randomAge(),
    gender: randomItem(GENDERS),
    experience: randomItem(EXPERIENCES),
    degree: randomItem(DEGREES),
    citizenship: randomItem(CITIZENSHIPS),
    criminal_record: Math.random() > 0.9 ? 'Yes - Minor offense' : 'No',
    resume_url: `/resumes/${name.replace(' ', '_')}_resume.pdf`
  };
}

export function generateMockApplication(jobId: string, applicantId: string, isPoints: boolean, statusOverride?: ApplicationStatus): Application {
  const status = statusOverride || (Math.random() > 0.7 ? randomItem(STATUSES.filter(s => s !== 'applicant')) : 'applicant');

  return {
    id: `application-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    job_id: jobId,
    applicant_id: applicantId,
    application_type: isPoints ? 'points' : 'random',
    points_used: isPoints ? Math.floor(Math.random() * 150) + 50 : 0,
    status: 'pending',
    application_status: status,
    applied_at: randomDate(30)
  };
}

export function generateMockApplicationsForJob(jobId: string, count: number = 50): ApplicantWithApplication[] {
  const applications: ApplicantWithApplication[] = [];
  const randomCount = Math.floor(Math.random() * 15) + 20;
  const pointsCount = count - randomCount;

  for (let i = 0; i < count; i++) {
    const isPoints = i >= randomCount;
    const applicant = generateMockApplicant(i);
    const application = generateMockApplication(jobId, applicant.id, isPoints);

    applications.push({
      ...applicant,
      application
    });
  }

  return applications;
}
