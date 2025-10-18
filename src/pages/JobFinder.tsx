import React, { useState } from 'react';
import { Search, List, Layers } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SwipeStack from '../components/SwipeStack';
import FilterPanel from '../components/FilterPanel';
import PointsDisplay from '../components/PointsDisplay';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getBlockedJobs, getAppliedJobs } from '../lib/swipeStorage';
import { addPointsHistoryEntry } from '../lib/pointsHistoryApi';

export default function JobFinder() {
  const { jobs } = useJobs();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useLocalStorage<'list' | 'swipe'>('jobFinder_viewMode', 'list');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    distance: '',
    jobType: '',
    experienceLevel: '',
    educationLevel: '',
    salaryMin: '',
    salaryMax: '',
    minimumPoints: '',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const blockedJobs = getBlockedJobs();
  const appliedJobs = getAppliedJobs();

  const filteredJobs = jobs.filter(job => {
    if (blockedJobs.includes(job.id) || appliedJobs.includes(job.id)) {
      return false;
    }
    if (debouncedSearch && !job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !job.company.toLowerCase().includes(debouncedSearch.toLowerCase())) {
      return false;
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.jobType && job.type !== filters.jobType) {
      return false;
    }
    if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) {
      return false;
    }
    if (filters.educationLevel && job.educationLevel !== filters.educationLevel) {
      return false;
    }
    if (filters.salaryMin && job.salary.min < parseInt(filters.salaryMin)) {
      return false;
    }
    if (filters.salaryMax && job.salary.max > parseInt(filters.salaryMax)) {
      return false;
    }
    if (filters.minimumPoints && job.minimumPoints > parseInt(filters.minimumPoints)) {
      return false;
    }
    return true;
  });

  const handleQuickApply = (jobId: string) => {
    if (!user) {
      showToast('Please sign in to apply for jobs', 'warning');
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Award 10 points for applying
    const currentPoints = user.points || 0;
    updateUser({ points: currentPoints + 10 });

    // Add to points history
    addPointsHistoryEntry({
      type: 'earned',
      amount: 10,
      description: `Applied to ${job.title} at ${job.company}`,
      category: job.isEvent ? 'event' : 'application',
      userId: user.id,
    });

    // Simulate quick application
    showToast('Application submitted successfully! You earned 10 points. You can track it in your dashboard.', 'success');
    // In a real app, this would make an API call
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Find Your Perfect Job
            </h1>
            <p className="text-gray-600 text-lg">
              Discover opportunities that match your skills and boost your career with our point system.
            </p>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'swipe' : 'list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'swipe'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600'
            }`}
          >
            {viewMode === 'list' ? (
              <>
                <Layers className="h-5 w-5" />
                Quick Apply Mode
              </>
            ) : (
              <>
                <List className="h-5 w-5" />
                List View
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          <FilterPanel filters={filters} setFilters={setFilters} />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-600">
              Showing {filteredJobs.length} jobs
            </p>
            {user && <PointsDisplay />}
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => {
              return <JobCard key={job.id} job={job} onQuickApply={handleQuickApply} />;
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <FilterPanel filters={filters} setFilters={setFilters} />
          {user && (
            <div className="flex justify-center mb-6">
              <PointsDisplay />
            </div>
          )}
          <SwipeStack jobs={filteredJobs} onApply={handleQuickApply} />
        </>
      )}
    </div>
  );
}