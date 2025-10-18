import { Company, CompanyReview, CompanyStatistics, SalaryReport } from './types';
import { Job } from '../context/JobContext';

const COMPANIES_KEY = 'rushWorking_companies';
const COMPANY_REVIEWS_KEY = 'rushWorking_companyReviews';
const BLOCKED_COMPANIES_KEY = 'rushWorking_blockedCompanies';
const FOLLOWED_COMPANIES_KEY = 'rushWorking_followedCompanies';
const SALARY_REPORTS_KEY = 'rushWorking_salaryReports';

export function getCompany(companyName: string): Company | null {
  try {
    const data = localStorage.getItem(COMPANIES_KEY);
    const companies: Record<string, Company> = data ? JSON.parse(data) : {};
    return companies[companyName] || null;
  } catch (error) {
    console.error('Error reading company:', error);
    return null;
  }
}

export function getAllCompanies(): Record<string, Company> {
  try {
    const data = localStorage.getItem(COMPANIES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading companies:', error);
    return {};
  }
}

export function createOrUpdateCompany(companyName: string, companyData: Partial<Company>): void {
  try {
    const companies = getAllCompanies();
    const existingCompany = companies[companyName];

    companies[companyName] = {
      name: companyName,
      biography: companyData.biography || existingCompany?.biography || '',
      addresses: companyData.addresses || existingCompany?.addresses || [],
      logo: companyData.logo || existingCompany?.logo,
      website: companyData.website || existingCompany?.website,
      industry: companyData.industry || existingCompany?.industry,
      foundedYear: companyData.foundedYear || existingCompany?.foundedYear,
      companySize: companyData.companySize || existingCompany?.companySize,
      profileColors: companyData.profileColors || existingCompany?.profileColors,
      statistics: companyData.statistics || existingCompany?.statistics || {
        hired: 0,
        interviewed: 0,
        rejected: 0,
        totalJobPosts: 0,
        averageSalary: 0,
        averageReportedSalary: 0,
        totalReviews: 0,
        averageRating: 0,
        followCount: 0,
        totalApplications: 0,
      },
      reviews: companyData.reviews || existingCompany?.reviews || [],
      jobPostings: companyData.jobPostings || existingCompany?.jobPostings || [],
      eventPostings: companyData.eventPostings || existingCompany?.eventPostings || [],
      isBlocked: companyData.isBlocked || existingCompany?.isBlocked || false,
      reportCount: companyData.reportCount || existingCompany?.reportCount || 0,
    };

    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  } catch (error) {
    console.error('Error updating company:', error);
  }
}

export function initializeCompanyFromJobs(jobs: Job[]): void {
  const companies = getAllCompanies();

  jobs.forEach(job => {
    if (!companies[job.company]) {
      const companyJobs = jobs.filter(j => j.company === job.company);
      const jobPostings = companyJobs.filter(j => !j.isEvent).map(j => j.id);
      const eventPostings = companyJobs.filter(j => j.isEvent).map(j => j.id);

      const salaries = companyJobs
        .filter(j => !j.isEvent)
        .map(j => (j.salary.min + j.salary.max) / 2);

      const averageSalary = salaries.length > 0
        ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
        : 0;

      createOrUpdateCompany(job.company, {
        biography: `${job.company} is a leading company in the industry.`,
        addresses: [job.location],
        statistics: {
          hired: 0,
          interviewed: 0,
          rejected: 0,
          totalJobPosts: jobPostings.length,
          averageSalary,
          averageReportedSalary: 0,
          totalReviews: 0,
          averageRating: 0,
          followCount: 0,
          totalApplications: 0,
        },
        jobPostings,
        eventPostings,
      });
    }
  });
}

export function getCompanyReviews(companyName: string): CompanyReview[] {
  try {
    const data = localStorage.getItem(COMPANY_REVIEWS_KEY);
    const allReviews: CompanyReview[] = data ? JSON.parse(data) : [];
    return allReviews.filter(review => review.companyName === companyName);
  } catch (error) {
    console.error('Error reading company reviews:', error);
    return [];
  }
}

export function addCompanyReview(review: Omit<CompanyReview, 'id' | 'createdAt'>): void {
  try {
    const data = localStorage.getItem(COMPANY_REVIEWS_KEY);
    const reviews: CompanyReview[] = data ? JSON.parse(data) : [];

    const newReview: CompanyReview = {
      ...review,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    localStorage.setItem(COMPANY_REVIEWS_KEY, JSON.stringify(reviews));

    const company = getCompany(review.companyName);
    if (company) {
      const companyReviews = reviews.filter(r => r.companyName === review.companyName);
      const totalRating = companyReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / companyReviews.length;

      createOrUpdateCompany(review.companyName, {
        ...company,
        reviews: companyReviews,
        statistics: {
          ...company.statistics,
          totalReviews: companyReviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
        },
      });
    }
  } catch (error) {
    console.error('Error adding company review:', error);
  }
}

export function blockCompany(companyName: string): void {
  try {
    const data = localStorage.getItem(BLOCKED_COMPANIES_KEY);
    const blocked: string[] = data ? JSON.parse(data) : [];

    if (!blocked.includes(companyName)) {
      blocked.push(companyName);
      localStorage.setItem(BLOCKED_COMPANIES_KEY, JSON.stringify(blocked));
    }

    const company = getCompany(companyName);
    if (company) {
      createOrUpdateCompany(companyName, {
        ...company,
        isBlocked: true,
      });
    }
  } catch (error) {
    console.error('Error blocking company:', error);
  }
}

export function unblockCompany(companyName: string): void {
  try {
    const data = localStorage.getItem(BLOCKED_COMPANIES_KEY);
    const blocked: string[] = data ? JSON.parse(data) : [];
    const filtered = blocked.filter(name => name !== companyName);

    localStorage.setItem(BLOCKED_COMPANIES_KEY, JSON.stringify(filtered));

    const company = getCompany(companyName);
    if (company) {
      createOrUpdateCompany(companyName, {
        ...company,
        isBlocked: false,
      });
    }
  } catch (error) {
    console.error('Error unblocking company:', error);
  }
}

export function isCompanyBlocked(companyName: string): boolean {
  try {
    const data = localStorage.getItem(BLOCKED_COMPANIES_KEY);
    const blocked: string[] = data ? JSON.parse(data) : [];
    return blocked.includes(companyName);
  } catch (error) {
    console.error('Error checking if company is blocked:', error);
    return false;
  }
}

export function reportCompany(companyName: string, reason: string): void {
  try {
    const company = getCompany(companyName);
    if (company) {
      const reportCount = (company.reportCount || 0) + 1;
      createOrUpdateCompany(companyName, {
        ...company,
        reportCount,
      });
    }
    console.log(`Company ${companyName} reported for: ${reason}`);
  } catch (error) {
    console.error('Error reporting company:', error);
  }
}

export function updateCompanyStatistics(
  companyName: string,
  updates: Partial<CompanyStatistics>
): void {
  try {
    const company = getCompany(companyName);
    if (company) {
      createOrUpdateCompany(companyName, {
        ...company,
        statistics: {
          ...company.statistics,
          ...updates,
        },
      });
    }
  } catch (error) {
    console.error('Error updating company statistics:', error);
  }
}

export function followCompany(companyName: string, userId: string): void {
  try {
    const data = localStorage.getItem(FOLLOWED_COMPANIES_KEY);
    const follows: Record<string, { companyName: string; followedAt: string; userId: string }[]> = data ? JSON.parse(data) : {};

    if (!follows[userId]) {
      follows[userId] = [];
    }

    if (!follows[userId].some(f => f.companyName === companyName)) {
      follows[userId].push({
        companyName,
        followedAt: new Date().toISOString(),
        userId,
      });
      localStorage.setItem(FOLLOWED_COMPANIES_KEY, JSON.stringify(follows));

      const followCount = getCompanyFollowCount(companyName);
      updateCompanyStatistics(companyName, { followCount });
    }
  } catch (error) {
    console.error('Error following company:', error);
  }
}

export function unfollowCompany(companyName: string, userId: string): void {
  try {
    const data = localStorage.getItem(FOLLOWED_COMPANIES_KEY);
    const follows: Record<string, { companyName: string; followedAt: string; userId: string }[]> = data ? JSON.parse(data) : {};

    if (follows[userId]) {
      follows[userId] = follows[userId].filter(f => f.companyName !== companyName);
      localStorage.setItem(FOLLOWED_COMPANIES_KEY, JSON.stringify(follows));

      const followCount = getCompanyFollowCount(companyName);
      updateCompanyStatistics(companyName, { followCount });
    }
  } catch (error) {
    console.error('Error unfollowing company:', error);
  }
}

export function isCompanyFollowed(companyName: string, userId: string): boolean {
  try {
    const data = localStorage.getItem(FOLLOWED_COMPANIES_KEY);
    const follows: Record<string, { companyName: string; followedAt: string; userId: string }[]> = data ? JSON.parse(data) : {};

    if (!follows[userId]) return false;
    return follows[userId].some(f => f.companyName === companyName);
  } catch (error) {
    console.error('Error checking if company is followed:', error);
    return false;
  }
}

export function getFollowedCompanies(userId: string): { companyName: string; followedAt: string }[] {
  try {
    const data = localStorage.getItem(FOLLOWED_COMPANIES_KEY);
    const follows: Record<string, { companyName: string; followedAt: string; userId: string }[]> = data ? JSON.parse(data) : {};

    return follows[userId] || [];
  } catch (error) {
    console.error('Error getting followed companies:', error);
    return [];
  }
}

export function getCompanyFollowCount(companyName: string): number {
  try {
    const data = localStorage.getItem(FOLLOWED_COMPANIES_KEY);
    const follows: Record<string, { companyName: string; followedAt: string; userId: string }[]> = data ? JSON.parse(data) : {};

    let count = 0;
    Object.values(follows).forEach(userFollows => {
      if (userFollows.some(f => f.companyName === companyName)) {
        count++;
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting company follow count:', error);
    return 0;
  }
}

export function getBlockedCompanies(): string[] {
  try {
    const data = localStorage.getItem(BLOCKED_COMPANIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting blocked companies:', error);
    return [];
  }
}

export function reportSalary(report: Omit<SalaryReport, 'id' | 'reportedAt'>): void {
  try {
    if (report.salaryAmount < 15000 || report.salaryAmount > 500000) {
      throw new Error('Salary must be between $15,000 and $500,000');
    }

    const data = localStorage.getItem(SALARY_REPORTS_KEY);
    const reports: SalaryReport[] = data ? JSON.parse(data) : [];

    const newReport: SalaryReport = {
      ...report,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportedAt: new Date().toISOString(),
    };

    reports.push(newReport);
    localStorage.setItem(SALARY_REPORTS_KEY, JSON.stringify(reports));

    const averageReportedSalary = calculateAverageReportedSalary(report.companyName);
    updateCompanyStatistics(report.companyName, { averageReportedSalary });
  } catch (error) {
    console.error('Error reporting salary:', error);
    throw error;
  }
}

export function getSalaryReports(companyName: string): SalaryReport[] {
  try {
    const data = localStorage.getItem(SALARY_REPORTS_KEY);
    const reports: SalaryReport[] = data ? JSON.parse(data) : [];
    return reports.filter(r => r.companyName === companyName);
  } catch (error) {
    console.error('Error getting salary reports:', error);
    return [];
  }
}

export function calculateAverageReportedSalary(companyName: string): number {
  try {
    const reports = getSalaryReports(companyName);
    if (reports.length === 0) return 0;

    const total = reports.reduce((sum, report) => sum + report.salaryAmount, 0);
    return Math.round(total / reports.length);
  } catch (error) {
    console.error('Error calculating average reported salary:', error);
    return 0;
  }
}
