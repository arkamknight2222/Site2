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

export type MessageStatus = 'sending' | 'delivered' | 'viewed';

export interface Message {
  id: string;
  job_id: string;
  applicant_id: string;
  sender_type: 'employer' | 'applicant';
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  status: MessageStatus;
  edited: boolean;
  edited_at?: string;
  original_content?: string;
  deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

export type PurchaseStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Purchase {
  id: string;
  userId: string;
  purchaseDate: string;
  pointsPurchased: number;
  amountPaid: number;
  paymentMethod: string;
  transactionId: string;
  status: PurchaseStatus;
  packageName?: string;
}

export interface CompanyReview {
  id: string;
  companyName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  applicantStatus: 'not_applied' | 'applied' | 'interviewed' | 'hired' | 'rejected';
  jobTitle?: string;
  createdAt: string;
}

export interface CompanyStatistics {
  hired: number;
  interviewed: number;
  rejected: number;
  totalJobPosts: number;
  averageSalary: number;
  averageReportedSalary: number;
  totalReviews: number;
  averageRating: number;
  followCount: number;
  totalApplications: number;
}

export interface SalaryReport {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  salaryAmount: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  notes?: string;
  reportedAt: string;
}

export interface Company {
  name: string;
  logo?: string;
  biography: string;
  addresses: string[];
  website?: string;
  industry?: string;
  foundedYear?: number;
  companySize?: string;
  profileColors?: {
    from: string;
    to: string;
  };
  statistics: CompanyStatistics;
  reviews: CompanyReview[];
  jobPostings: string[];
  eventPostings: string[];
  isBlocked?: boolean;
  reportCount?: number;
}
