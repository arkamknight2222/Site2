import React, { useState } from 'react';
import { User, FileText, MessageSquare, ChevronDown, Briefcase, GraduationCap } from 'lucide-react';
import { ApplicationStatus, STATUS_CONFIG } from '../lib/mockData';

interface ExtendedApplicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  experience: string | null;
  degree: string | null;
  citizenship: string | null;
  applicationStatus: ApplicationStatus;
  applicantType: 'random' | 'points';
  pointsUsed: number;
  appliedDate: string;
}

interface DetailedApplicantCardProps {
  applicant: ExtendedApplicant;
  onViewDetails: (applicant: ExtendedApplicant) => void;
  onViewResume: (applicant: ExtendedApplicant) => void;
  onMessage: (applicant: ExtendedApplicant) => void;
  onStatusChange: (applicant: ExtendedApplicant, status: ApplicationStatus) => void;
}

export default function DetailedApplicantCard({
  applicant,
  onViewDetails,
  onViewResume,
  onMessage,
  onStatusChange
}: DetailedApplicantCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const poolType = applicant.applicantType;

  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-md transition-all ${
        poolType === 'points'
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div
            className={`p-2 rounded-full ${
              poolType === 'points' ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <User
              className={`h-5 w-5 ${
                poolType === 'points' ? 'text-blue-600' : 'text-gray-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{applicant.name}</h3>
            <p className="text-sm text-gray-600">
              {applicant.age} years • {applicant.gender}
            </p>
          </div>
        </div>
        {poolType === 'points' && (
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {applicant.pointsUsed} pts
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <Briefcase className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{applicant.experience}</span>
        </div>
        <div className="flex items-start">
          <GraduationCap className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{applicant.degree}</span>
        </div>
      </div>

      <div className="relative mb-3">
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors text-sm font-medium"
        >
          <span>Change Status</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        {showStatusDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(status => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(applicant, status);
                  setShowStatusDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
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

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewResume(applicant)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <FileText className="h-4 w-4 mr-1" />
          Resume
        </button>
        <button
          onClick={() => onMessage(applicant)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Message
        </button>
        <button
          onClick={() => onViewDetails(applicant)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            poolType === 'points'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-800 text-white'
          }`}
        >
          More Details
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Applied {new Date(applicant.appliedDate).toLocaleDateString()}
      </p>
    </div>
  );
}
