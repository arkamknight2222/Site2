
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

export interface ApplicantWithApplication {
  id: string;
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
  application: Application;
}
