import { Company, CompanyReview, CompanyStatistics } from './types';
import { Job } from '../context/JobContext';

const COMPANIES_KEY = 'rushWorking_companies';
const COMPANY_REVIEWS_KEY = 'rushWorking_companyReviews';
const BLOCKED_COMPANIES_KEY = 'rushWorking_blockedCompanies';

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
      statistics: companyData.statistics || existingCompany?.statistics || {
        hired: 0,
        interviewed: 0,
        rejected: 0,
        totalJobPosts: 0,
        averageSalary: 0,
        totalReviews: 0,
        averageRating: 0,
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
          totalReviews: 0,
          averageRating: 0,
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
