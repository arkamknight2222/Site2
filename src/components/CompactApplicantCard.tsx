import React, { useState } from 'react';
import { User, FileText, MessageSquare, ChevronDown, Briefcase, GraduationCap } from 'lucide-react';
import { ApplicationStatus, STATUS_CONFIG } from '../lib/types';

interface ExtendedApplicant {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  experience: string | null;
  degree: string | null;
  applicationStatus: ApplicationStatus;
  applicantType: 'random' | 'points';``
  pointsUsed: number;
  appliedDate: string;
}

interface CompactApplicantCardProps {
  applicant: ExtendedApplicant;
  onViewDetails: (applicant: ExtendedApplicant) => void;
  onViewResume: (applicant: ExtendedApplicant) => void;
  onMessage: (applicant: ExtendedApplicant) => void;
  onStatusChange: (applicant: ExtendedApplicant, status: ApplicationStatus) => void;
  showStatus: boolean;
}

export default function CompactApplicantCard({
  applicant,
  onViewDetails,
  onViewResume,
  onMessage,
  onStatusChange,
  showStatus
}: CompactApplicantCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const poolType = applicant.applicantType;

  return (
    <div
      className={`border rounded-lg p-3 hover:shadow-md transition-all ${
        showStatus
          ? 'border-emerald-200 bg-emerald-50'
          : poolType === 'points'
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full flex-shrink-0 ${
            showStatus ? 'bg-emerald-100' : poolType === 'points' ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <User
            className={`h-4 w-4 ${
              showStatus ? 'text-emerald-600' : poolType === 'points' ? 'text-blue-600' : 'text-gray-600'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">{applicant.name}</h3>
            <p className="text-xs text-gray-600">
              {applicant.age} yrs • {applicant.gender}
            </p>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Briefcase className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-700 truncate" title={applicant.experience || ''}>
              {applicant.experience}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <GraduationCap className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-700 truncate" title={applicant.degree || ''}>
              {applicant.degree}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showStatus && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[applicant.applicationStatus].bgColor} ${STATUS_CONFIG[applicant.applicationStatus].color}`}
              >
                {STATUS_CONFIG[applicant.applicationStatus].label}
              </span>
            )}
            {poolType === 'points' && !showStatus && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                {applicant.pointsUsed} pts
              </span>
            )}
            {showStatus && (
              <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                {poolType === 'points' ? `${applicant.pointsUsed} pts` : 'Random'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors text-xs font-medium flex items-center gap-1"
            >
              Status
              <ChevronDown className="h-3 w-3" />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto min-w-[180px]">
                {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusChange(applicant, status);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-xs ${
                      applicant.applicationStatus === status ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}
                    >
                      {STATUS_CONFIG[status].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onViewResume(applicant)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="View Resume"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMessage(applicant)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Send Message"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewDetails(applicant)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              showStatus
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : poolType === 'points'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-800 text-white'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Applied {new Date(applicant.appliedDate).toLocaleDateString()}
      </div>
    </div>
  );
}
