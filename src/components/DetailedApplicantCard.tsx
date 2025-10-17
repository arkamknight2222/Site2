import React, { useState } from 'react';
import { User, FileText, MessageSquare, ChevronDown, Briefcase, GraduationCap, Award, Mail, Phone, MapPin, Calendar } from 'lucide-react';
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
      className={`border rounded-xl p-5 hover:shadow-lg transition-all ${
        poolType === 'points'
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`p-3 rounded-full flex-shrink-0 ${
            poolType === 'points' ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <User
            className={`h-6 w-6 ${
              poolType === 'points' ? 'text-blue-600' : 'text-gray-600'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{applicant.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span>{applicant.age} years old</span>
                <span>•</span>
                <span>{applicant.gender}</span>
              </div>
            </div>
            {poolType === 'points' && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1">
                <Award className="h-4 w-4" />
                {applicant.pointsUsed} pts
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">{applicant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{applicant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{applicant.experience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{applicant.degree}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{applicant.citizenship}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">
                Applied {new Date(applicant.appliedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                Change Status
                <ChevronDown className="h-4 w-4" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto min-w-[200px]">
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

            <button
              onClick={() => onViewResume(applicant)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Resume
            </button>

            <button
              onClick={() => onMessage(applicant)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </button>

            <button
              onClick={() => onViewDetails(applicant)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                poolType === 'points'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-800 text-white'
              }`}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
