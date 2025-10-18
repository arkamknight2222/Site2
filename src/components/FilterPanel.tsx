import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  isEvent?: boolean;
  onClear?: () => void;
}

export default function FilterPanel({ filters, setFilters, isEvent = false, onClear }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Always start collapsed on component mount
  useEffect(() => {
    setIsExpanded(false);
  }, []);
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      location: '',
      distance: '',
      jobType: '',
      experienceLevel: '',
      educationLevel: '',
      salaryMin: '',
      salaryMax: '',
      minimumPoints: '',
    };
    setFilters(clearedFilters);
    onClear?.();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Filter {isEvent ? 'Events' : 'Jobs'}
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </button>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${isEvent ? 'events' : 'jobs'}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        <div className="relative">
          <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.distance}
            onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
          >
            <option value="">Any Distance</option>
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
            <option value="100">Within 100 miles</option>
          </select>
        </div>
        {!isEvent && (
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        )}
        <select
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.experienceLevel}
          onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
        >
          <option value="">All Experience Levels</option>
          <option value="entry">Entry Level</option>
          <option value="mid">Mid Level</option>
          <option value="senior">Senior Level</option>
        </select>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-gray-200">
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.educationLevel}
            onChange={(e) => setFilters({ ...filters, educationLevel: e.target.value })}
          >
            <option value="">All Education Levels</option>
            <option value="high-school">High School</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
          {!isEvent && (
            <>
              <input
                type="number"
                placeholder="Min Salary"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.salaryMin}
                onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Salary"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.salaryMax}
                onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
              />
            </>
          )}
          {!isEvent && (
            <input
              type="number"
              placeholder="Min Points Required"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.minimumPoints}
              onChange={(e) => setFilters({ ...filters, minimumPoints: e.target.value })}
            />
          )}
        </div>
      </>
      )}
      </div>
    </>
  );
}