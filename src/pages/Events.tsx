import React, { useState } from 'react';
import { Calendar, List, Layers } from 'lucide-react';
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

export default function Events() {
  const { events } = useJobs();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useLocalStorage<'list' | 'swipe'>('events_viewMode', 'list');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    distance: '',
    eventType: '',
    experienceLevel: '',
    educationLevel: '',
    minimumPoints: '',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const blockedEvents = getBlockedJobs();
  const appliedEvents = getAppliedJobs();

  const filteredEvents = events.filter(event => {
    if (blockedEvents.includes(event.id) || appliedEvents.includes(event.id)) {
      return false;
    }
    if (debouncedSearch && !event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !event.company.toLowerCase().includes(debouncedSearch.toLowerCase())) {
      return false;
    }
    if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.experienceLevel && event.experienceLevel !== filters.experienceLevel) {
      return false;
    }
    if (filters.educationLevel && event.educationLevel !== filters.educationLevel) {
      return false;
    }
    if (filters.minimumPoints && event.minimumPoints > parseInt(filters.minimumPoints)) {
      return false;
    }
    return true;
  });

  const handleQuickApply = (eventId: string) => {
    if (!user) {
      showToast('Please sign in to register for events', 'warning');
      return;
    }

    // Award 10 points for registering
    const currentPoints = user.points || 0;
    updateUser({ points: currentPoints + 10 });

    // Simulate quick registration
    showToast('Registration successful! You earned 10 points. Check your email for event details.', 'success');
    // In a real app, this would make an API call
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Career Events & Networking
            </h1>
            <p className="text-gray-600 text-lg">
              Discover networking events, career fairs, and professional workshops to advance your career.
            </p>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'swipe' : 'list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              viewMode === 'swipe'
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-600'
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
          <FilterPanel filters={filters} setFilters={setFilters} isEvent={true} />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-600">
              Showing {filteredEvents.length} events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              return (
                <JobCard
                  key={event.id}
                  job={event}
                  showPoints={false}
                  onQuickApply={event.requiresApplication ? handleQuickApply : undefined}
                />
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <FilterPanel filters={filters} setFilters={setFilters} isEvent={true} />
          {user && (
            <div className="flex justify-center mb-6">
              <PointsDisplay />
            </div>
          )}
          <SwipeStack jobs={filteredEvents} onApply={handleQuickApply} />
        </>
      )}
    </div>
  );
}