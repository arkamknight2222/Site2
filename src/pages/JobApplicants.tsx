import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, User, Mail, Phone, FileText, MessageSquare, X, Download, MapPin, Award, GraduationCap, Briefcase, AlertCircle, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { ApplicationStatus, STATUS_CONFIG, ApplicantWithApplication, generateMockApplicationsForJob } from '../lib/mockData';
import { getApplicationsForJob, saveApplicationsForJob, updateApplicationStatus as updateStorageStatus } from '../lib/localStorage';

interface ExtendedApplicant extends ApplicantWithApplication {
  applicantType: 'random' | 'points';
  pointsUsed: number;
  appliedDate: string;
  criminalRecord: string;
  resumeUrl: string;
  applicationStatus: ApplicationStatus;
  applicationId: string;
}

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [allApplicants, setAllApplicants] = useState<ExtendedApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<ExtendedApplicant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchRandom, setSearchRandom] = useState('');
  const [searchPoints, setSearchPoints] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterDegree, setFilterDegree] = useState('all');
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    loadJobAndApplicants();
  }, [jobId]);

  const loadJobAndApplicants = () => {
    setLoading(true);
    const savedItems = localStorage.getItem('rushWorkingPostedItems');
    if (savedItems) {
      const items = JSON.parse(savedItems);
      const job = items.find((item: any) => item.id === jobId);
      setJobInfo(job);
    }

    try {
      let applications = getApplicationsForJob(jobId!);

      if (applications.length === 0) {
        applications = generateMockApplicationsForJob(jobId!, 50);
        saveApplicationsForJob(jobId!, applications);
      }

      setAllApplicants(mapApplicationsToApplicants(applications));
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapApplicationsToApplicants = (applications: ApplicantWithApplication[]): ExtendedApplicant[] => {
    return applications.map(app => ({
      ...app,
      applicantType: app.application.application_type as 'random' | 'points',
      pointsUsed: app.application.points_used || 0,
      appliedDate: app.application.applied_at,
      criminalRecord: app.criminal_record || 'No',
      resumeUrl: app.resume_url || `/resumes/${app.name.replace(' ', '_')}_resume.pdf`,
      applicationStatus: app.application.application_status as ApplicationStatus,
      applicationId: app.application.id
    }));
  };

  const handleStatusChange = (applicant: ExtendedApplicant, newStatus: ApplicationStatus) => {
    try {
      updateStorageStatus(jobId!, applicant.applicationId, newStatus);

      setAllApplicants(prev =>
        prev.map(a =>
          a.id === applicant.id
            ? { ...a, applicationStatus: newStatus }
            : a
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleViewDetails = (applicant: ExtendedApplicant) => {
    setSelectedApplicant(applicant);
    setShowDetailsModal(true);
  };

  const handleViewResume = (applicant: ExtendedApplicant) => {
    setSelectedApplicant(applicant);
    setShowResumeModal(true);
  };

  const handleMessage = (applicant: ExtendedApplicant) => {
    setSelectedApplicant(applicant);
    setShowMessageModal(true);
    setMessageText('');
  };

  const sendMessage = () => {
    alert(`Message sent to ${selectedApplicant?.name}!`);
    setShowMessageModal(false);
    setMessageText('');
  };

  const filterApplicants = (applicants: ExtendedApplicant[], searchTerm: string) => {
    return applicants.filter(applicant => {
      const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExperience = filterExperience === 'all' || (applicant.experience && applicant.experience.includes(filterExperience));
      const matchesDegree = filterDegree === 'all' || (applicant.degree && applicant.degree.includes(filterDegree));
      return matchesSearch && matchesExperience && matchesDegree;
    });
  };

  const statusApplicants = allApplicants.filter(a => a.applicationStatus !== 'applicant');
  const randomApplicants = allApplicants.filter(a => a.applicationStatus === 'applicant' && a.applicantType === 'random');
  const pointsApplicants = allApplicants.filter(a => a.applicationStatus === 'applicant' && a.applicantType === 'points');

  const filteredStatusApplicants = filterApplicants(
    selectedStatuses.length > 0
      ? statusApplicants.filter(a => selectedStatuses.includes(a.applicationStatus))
      : statusApplicants,
    searchStatus
  );
  const filteredRandomApplicants = filterApplicants(randomApplicants, searchRandom);
  const filteredPointsApplicants = filterApplicants(pointsApplicants, searchPoints);

  const toggleStatusFilter = (status: ApplicationStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const getStatusCount = (status: ApplicationStatus) => {
    return statusApplicants.filter(a => a.applicationStatus === status).length;
  };

  if (!jobInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <button
            onClick={() => navigate('/hire')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Posts
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/hire')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Posts
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobInfo.title}</h1>
            <div className="flex items-center text-gray-600 space-x-4">
              <span className="font-medium">{jobInfo.company}</span>
              <span>•</span>
              <span>{jobInfo.location}</span>
              <span>•</span>
              <span>Posted {new Date(jobInfo.postedDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Applicants</p>
            <p className="text-3xl font-bold text-blue-600">{allApplicants.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Applicants
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Experience:</label>
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Expert">Expert Level</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Degree:</label>
              <select
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate</option>
                <option value="Bachelor">Bachelor's</option>
                <option value="Master">Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            {(filterExperience !== 'all' || filterDegree !== 'all') && (
              <button
                onClick={() => {
                  setFilterExperience('all');
                  setFilterDegree('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {statusApplicants.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Status Viewer</h2>
            <p className="text-emerald-100 text-sm">Applicants with active status changes</p>
            <div className="mt-4">
              <span className="inline-block bg-white text-emerald-900 px-4 py-2 rounded-full font-bold text-lg">
                {filteredStatusApplicants.length} Applicants
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors text-sm font-medium"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Status
                  {selectedStatuses.length > 0 && (
                    <span className="ml-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {selectedStatuses.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                {showStatusFilter && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Filter by Status</span>
                        {selectedStatuses.length > 0 && (
                          <button
                            onClick={() => setSelectedStatuses([])}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {(Object.keys(STATUS_CONFIG) as ApplicationStatus[])
                        .filter(status => status !== 'applicant')
                        .map(status => {
                          const count = getStatusCount(status);
                          if (count === 0) return null;
                          const isSelected = selectedStatuses.includes(status);
                          return (
                            <button
                              key={status}
                              onClick={() => toggleStatusFilter(status)}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                            >
                              <div className="flex items-center space-x-2">
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}>
                                  {STATUS_CONFIG[status].label}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 font-medium">{count}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {selectedStatuses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedStatuses.map(status => (
                  <span
                    key={status}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}
                  >
                    {STATUS_CONFIG[status].label}
                    <button
                      onClick={() => toggleStatusFilter(status)}
                      className="ml-2 hover:opacity-75"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredStatusApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onViewDetails={handleViewDetails}
                onViewResume={handleViewResume}
                onMessage={handleMessage}
                onStatusChange={handleStatusChange}
                showStatus={true}
              />
            ))}
            {filteredStatusApplicants.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No applicants found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Random Pool</h2>
            <p className="text-gray-100 text-sm">Standard applicants without point usage</p>
            <div className="mt-4">
              <span className="inline-block bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-lg">
                {filteredRandomApplicants.length} Applicants
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchRandom}
                onChange={(e) => setSearchRandom(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto">
            {filteredRandomApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onViewDetails={handleViewDetails}
                onViewResume={handleViewResume}
                onMessage={handleMessage}
                onStatusChange={handleStatusChange}
                showStatus={false}
              />
            ))}
            {filteredRandomApplicants.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No applicants found</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Points Pool</h2>
            <p className="text-blue-100 text-sm">Priority applicants who used points</p>
            <div className="mt-4">
              <span className="inline-block bg-white text-blue-900 px-4 py-2 rounded-full font-bold text-lg">
                {filteredPointsApplicants.length} Applicants
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchPoints}
                onChange={(e) => setSearchPoints(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto">
            {filteredPointsApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onViewDetails={handleViewDetails}
                onViewResume={handleViewResume}
                onMessage={handleMessage}
                onStatusChange={handleStatusChange}
                showStatus={false}
              />
            ))}
            {filteredPointsApplicants.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No applicants found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && selectedApplicant && (
        <DetailsModal
          applicant={selectedApplicant}
          onClose={() => setShowDetailsModal(false)}
          onViewResume={() => {
            setShowDetailsModal(false);
            setShowResumeModal(true);
          }}
          onMessage={() => {
            setShowDetailsModal(false);
            setShowMessageModal(true);
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {showResumeModal && selectedApplicant && (
        <ResumeModal
          applicant={selectedApplicant}
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {showMessageModal && selectedApplicant && (
        <MessageModal
          applicant={selectedApplicant}
          messageText={messageText}
          setMessageText={setMessageText}
          onSend={sendMessage}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
}

interface ApplicantCardProps {
  applicant: ExtendedApplicant;
  onViewDetails: (applicant: ExtendedApplicant) => void;
  onViewResume: (applicant: ExtendedApplicant) => void;
  onMessage: (applicant: ExtendedApplicant) => void;
  onStatusChange: (applicant: ExtendedApplicant, status: ApplicationStatus) => void;
  showStatus: boolean;
}

function ApplicantCard({ applicant, onViewDetails, onViewResume, onMessage, onStatusChange, showStatus }: ApplicantCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const poolType = applicant.applicantType;

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${
      showStatus ? 'border-emerald-200 bg-emerald-50' :
      poolType === 'points' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-full ${
            showStatus ? 'bg-emerald-100' :
            poolType === 'points' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <User className={`h-5 w-5 ${
              showStatus ? 'text-emerald-600' :
              poolType === 'points' ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{applicant.name}</h3>
            <p className="text-sm text-gray-600">
              {applicant.age} years • {applicant.gender}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showStatus && (
            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
              {poolType === 'points' ? `Points: ${applicant.pointsUsed}` : 'Random'}
            </span>
          )}
          {poolType === 'points' && !showStatus && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {applicant.pointsUsed} pts
            </span>
          )}
        </div>
      </div>

      {showStatus && (
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[applicant.applicationStatus].bgColor} ${STATUS_CONFIG[applicant.applicationStatus].color}`}>
            {STATUS_CONFIG[applicant.applicationStatus].label}
          </span>
        </div>
      )}

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
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center justify-between ${
                  applicant.applicationStatus === status ? 'bg-gray-100' : ''
                }`}
              >
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}>
                  {STATUS_CONFIG[status].label}
                </span>
                {applicant.applicationStatus === status && (
                  <span className="text-xs text-gray-500">Current</span>
                )}
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
            showStatus
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : poolType === 'points'
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

interface DetailsModalProps {
  applicant: ExtendedApplicant;
  onClose: () => void;
  onViewResume: () => void;
  onMessage: () => void;
  onStatusChange: (applicant: ExtendedApplicant, status: ApplicationStatus) => void;
}

function DetailsModal({ applicant, onClose, onViewResume, onMessage, onStatusChange }: DetailsModalProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Applicant Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{applicant.name}</h3>
              <p className="text-gray-600">{applicant.age} years old • {applicant.gender}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Application Status</span>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Change Status
              </button>
            </div>
            <div className="relative">
              <span className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold ${STATUS_CONFIG[applicant.applicationStatus].bgColor} ${STATUS_CONFIG[applicant.applicationStatus].color}`}>
                {STATUS_CONFIG[applicant.applicationStatus].label}
              </span>
              <p className="text-xs text-gray-600 mt-2">
                {STATUS_CONFIG[applicant.applicationStatus].description}
              </p>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
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
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}>
                        {STATUS_CONFIG[status].label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Email</span>
              </div>
              <p className="text-gray-700">{applicant.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Phone</span>
              </div>
              <p className="text-gray-700">{applicant.phone}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Experience</span>
              </div>
              <p className="text-gray-700">{applicant.experience}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Education</span>
              </div>
              <p className="text-gray-700">{applicant.degree}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Citizenship</span>
              </div>
              <p className="text-gray-700">{applicant.citizenship}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Criminal Record</span>
              </div>
              <p className="text-gray-700">{applicant.criminalRecord}</p>
            </div>
          </div>

          {applicant.pointsUsed > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Points Used: {applicant.pointsUsed}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">This applicant used points for priority placement</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Applied:</span> {new Date(applicant.appliedDate).toLocaleDateString()} at {new Date(applicant.appliedDate).toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Application Type:</span> {applicant.applicantType === 'points' ? 'Points Pool' : 'Random Pool'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onViewResume}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Resume
            </button>
            <button
              onClick={onMessage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResumeModalProps {
  applicant: ExtendedApplicant;
  onClose: () => void;
}

function ResumeModal({ applicant, onClose }: ResumeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{applicant.name}'s Resume</h2>
            <p className="text-sm text-gray-600 mt-1">{applicant.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Resume download started!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <div className="border-b-4 border-blue-600 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{applicant.name}</h1>
              <p className="text-gray-600 mt-1">{applicant.email} • {applicant.phone}</p>
              <p className="text-gray-600">{applicant.citizenship}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{applicant.degree}</p>
                <p className="text-gray-600">University Name • 2020</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="font-semibold text-gray-900">Senior Position</p>
                <p className="text-gray-600 text-sm mb-2">Company Name • 2020 - Present</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Led development of key features and improvements</li>
                  <li>Collaborated with cross-functional teams</li>
                  <li>Mentored junior developers</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">Previous Position</p>
                <p className="text-gray-600 text-sm mb-2">Another Company • 2018 - 2020</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Developed and maintained applications</li>
                  <li>Implemented best practices</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'Agile'].map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageModalProps {
  applicant: ExtendedApplicant;
  messageText: string;
  setMessageText: (text: string) => void;
  onSend: () => void;
  onClose: () => void;
}

function MessageModal({ applicant, messageText, setMessageText, onSend, onClose }: MessageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
            <p className="text-sm text-gray-600 mt-1">To: {applicant.name} ({applicant.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">Messages are sent directly to the applicant's email</p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSend}
                disabled={!messageText.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
