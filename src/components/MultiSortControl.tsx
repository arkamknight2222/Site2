import React, { useState } from 'react';
import { ArrowUpDown, Plus, Trash2, ChevronDown, X } from 'lucide-react';

export type SortField = 'name' | 'date' | 'experience' | 'degree' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortCriterion {
  field: SortField;
  direction: SortDirection;
  label: string;
}

interface MultiSortControlProps {
  criteria: SortCriterion[];
  onChange: (criteria: SortCriterion[]) => void;
  availableFields: { field: SortField; label: string }[];
  themeColor?: string;
}

const SORT_OPTIONS = {
  name: [
    { direction: 'asc' as SortDirection, label: 'Name (A-Z)' },
    { direction: 'desc' as SortDirection, label: 'Name (Z-A)' }
  ],
  date: [
    { direction: 'desc' as SortDirection, label: 'Date Applied (Newest)' },
    { direction: 'asc' as SortDirection, label: 'Date Applied (Oldest)' }
  ],
  experience: [
    { direction: 'asc' as SortDirection, label: 'Experience (Entry to Expert)' },
    { direction: 'desc' as SortDirection, label: 'Experience (Expert to Entry)' }
  ],
  degree: [
    { direction: 'asc' as SortDirection, label: 'Education (Low to High)' },
    { direction: 'desc' as SortDirection, label: 'Education (High to Low)' }
  ],
  status: [
    { direction: 'asc' as SortDirection, label: 'Status (Applicant to Waitlisted)' },
    { direction: 'desc' as SortDirection, label: 'Status (Waitlisted to Applicant)' }
  ]
};

export default function MultiSortControl({ criteria, onChange, availableFields, themeColor = 'blue' }: MultiSortControlProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [addingCriteria, setAddingCriteria] = useState(false);

  const addCriterion = (field: SortField, direction: SortDirection, label: string) => {
    const alreadyExists = criteria.some(c => c.field === field && c.direction === direction);
    if (!alreadyExists) {
      onChange([...criteria, { field, direction, label }]);
    }
    setAddingCriteria(false);
    setShowMenu(false);
  };

  const removeCriterion = (index: number) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onChange([]);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium ${
          criteria.length > 0 ? `border-${themeColor}-300 bg-${themeColor}-50` : ''
        }`}
      >
        <ArrowUpDown className="h-4 w-4 mr-2" />
        Sort
        {criteria.length > 0 && (
          <span className={`ml-2 bg-${themeColor}-600 text-white px-2 py-0.5 rounded-full text-xs`}>
            {criteria.length}
          </span>
        )}
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Sort Criteria</span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {criteria.length > 0 && (
              <button
                onClick={clearAll}
                className={`text-xs text-${themeColor}-600 hover:text-${themeColor}-700 font-medium`}
              >
                Clear All
              </button>
            )}
          </div>

          {criteria.length > 0 && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2 font-medium">Active Sorts (in order):</p>
              <div className="space-y-2">
                {criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{criterion.label}</span>
                    </div>
                    <button
                      onClick={() => removeCriterion(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!addingCriteria ? (
            <div className="p-3">
              <button
                onClick={() => setAddingCriteria(true)}
                className={`w-full flex items-center justify-center px-4 py-2 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-lg transition-colors text-sm font-medium`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sort Criteria
              </button>
            </div>
          ) : (
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Select Sort Option:</p>
                <button
                  onClick={() => setAddingCriteria(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              {availableFields.map(({ field, label }) => (
                <div key={field} className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
                  <div className="space-y-1">
                    {SORT_OPTIONS[field].map(option => {
                      const alreadyAdded = criteria.some(c => c.field === field && c.direction === option.direction);
                      return (
                        <button
                          key={option.label}
                          onClick={() => !alreadyAdded && addCriterion(field, option.direction, option.label)}
                          disabled={alreadyAdded}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            alreadyAdded
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {option.label}
                          {alreadyAdded && <span className="ml-2 text-xs">(Added)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
