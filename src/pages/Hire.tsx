import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, DollarSign, MapPin, Building, Edit, Trash2, Eye } from 'lucide-react';
import { Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { getApplicationsForJob } from '../lib/localStorage';
import { ApplicationStatus, STATUS_CONFIG } from '../lib/types';

export default function Hire() {
  const navigate = useNavigate();
  const { addJob, updateJob, deleteJob } = useJobs();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'jobs' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; jobId: string | null; jobTitle: string; isEvent: boolean }>({ isOpen: false, jobId: null, jobTitle: '', isEvent: false });
  const [jobStats, setJobStats] = useState<Record<string, {
    total: number;
    reviewed: number;
    statusCounts: Record<ApplicationStatus, number>;
  }>>({});

  // Mock verified companies - in real app this would come from user profile
  const verifiedCompanies = [
    { id: '1', name: 'TechCorp Inc.', address: '123 Tech Street, San Francisco, CA 94105' },
    { id: '2', name: 'Innovation Labs', address: '456 Innovation Ave, New York, NY 10001' }
  ];
  
  const [allPostedItems, setAllPostedItems] = useState(() => {
    const savedItems = localStorage.getItem('rushWorkingPostedItems');
    if (savedItems) {
      return JSON.parse(savedItems);
    }
    return [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        type: 'full-time',
        location: 'San Francisco, CA',
        postedDate: '2025-01-08',
        applications: 24,
        isEvent: false,
      },
      {
        id: '2',
        title: 'Marketing Specialist',
        company: 'Growth Labs',
        type: 'full-time',
        location: 'New York, NY',
        postedDate: '2025-01-07',
        applications: 18,
        isEvent: false,
      },
      {
        id: '3',
        title: 'Tech Career Fair 2025',
        company: 'City Career Center',
        type: 'full-time',
        location: 'Los Angeles, CA',
        postedDate: '2025-01-06',
        applications: 45,
        isEvent: true,
        eventDate: '2025-01-25',
        requiresApplication: true,
      },
      {
        id: '4',
        title: 'Networking Mixer for Professionals',
        company: 'Business Network Group',
        type: 'part-time',
        location: 'Chicago, IL',
        postedDate: '2025-01-05',
        applications: 32,
        isEvent: true,
        eventDate: '2025-01-20',
        requiresApplication: false,
      },
    ];
  });
  
  // Save to localStorage whenever allPostedItems changes
  React.useEffect(() => {
    localStorage.setItem('rushWorkingPostedItems', JSON.stringify(allPostedItems));
  }, [allPostedItems]);

  // Calculate applicant statistics for all jobs
  React.useEffect(() => {
    const stats: Record<string, {
      total: number;
      reviewed: number;
      statusCounts: Record<ApplicationStatus, number>;
    }> = {};

    allPostedItems.forEach((job) => {
      const applications = getApplicationsForJob(job.id);
      const total = applications.length;
      const reviewed = applications.filter(app => app.application.application_status !== 'applicant').length;

      const statusCounts: Record<ApplicationStatus, number> = {
        applicant: 0,
        interested: 0,
        in_review: 0,
        interviewing: 0,
        interviewed: 0,
        offer_extended: 0,
        accepted: 0,
        rejected: 0,
        waitlisted: 0
      };

      applications.forEach(app => {
        const status = app.application.application_status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      stats[job.id] = { total, reviewed, statusCounts };
    });

    setJobStats(stats);
  }, [allPostedItems]);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'remote',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: [''],
    experienceLevel: 'mid' as 'entry' | 'mid' | 'senior',
    educationLevel: 'bachelor' as 'high-school' | 'bachelor' | 'master' | 'phd',
    minimumPoints: '',
    isEvent: false,
    eventDate: '',
    requiresApplication: true,
  });

  // Filter posts based on selected filter type
  const filteredItems = allPostedItems.filter(item => {
    // Search filter
    if (debouncedSearchQuery && 
        !item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
        !item.company.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filterType === 'all') return true;
    if (filterType === 'jobs') return !item.isEvent;
    if (filterType === 'events') return item.isEvent;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.isVerified) {
      showToast('You need to verify your company information first!', 'warning');
      return;
    }

    if (editingJob) {
      // Update existing job
      const success = updateJob(editingJob.id, {
        ...formData,
        salary: {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0,
        },
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        minimumPoints: 0,
        featured: false,
      });
      
      if (success) {
        // Update local posted items
        setAllPostedItems(prevItems => 
          prevItems.map(item => 
            item.id === editingJob.id 
              ? {
                  ...item,
                  title: formData.title,
                  company: formData.company,
                  type: formData.type,
                  location: formData.location,
                  isEvent: formData.isEvent || false,
                  eventDate: formData.eventDate,
                  requiresApplication: formData.requiresApplication !== false,
                }
              : item
          )
        );
      }
      
      showToast('Job updated successfully!', 'success');
    } else {
      // Create new job
      const jobData = {
        ...formData,
        salary: {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
        },
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        minimumPoints: 0, // Will be determined by applicant activity
        featured: false,
      };

      const newJob = addJob(jobData);
      
      // Add to local posted items for "Your Posts" section
      const newPostedItem = {
        id: newJob.id,
        title: newJob.title,
        company: newJob.company,
        type: newJob.type,
        location: newJob.location,
        postedDate: newJob.postedDate,
        applications: 0,
        isEvent: newJob.isEvent || false,
        eventDate: newJob.eventDate,
        requiresApplication: newJob.requiresApplication !== false,
      };
      
      setAllPostedItems(prevItems => [newPostedItem, ...prevItems]);
      
      showToast(`${formData.isEvent ? 'Event' : 'Job'} posted successfully! $${formData.isEvent ? '0.50' : '1.00'} has been charged to your account.`, 'success');
    }
    
    setShowPostForm(false);
    setEditingJob(null);
    
    // Reset form
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      salaryMin: '',
      salaryMax: '',
      description: '',
      requirements: [''],
      experienceLevel: 'mid',
      educationLevel: 'bachelor',
      minimumPoints: '',
      isEvent: false,
      eventDate: '',
      requiresApplication: true,
    });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const handleVerifyCompany = () => {
    // Mock verification process
    updateUser({
      isEmployer: true,
      isVerified: true,
      companyName: 'Your Company Name',
      companyId: 'COMP123456',
      companyLocation: 'City, State',
    });
    showToast('Company verification completed!', 'success');
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.isEvent ? job.location : '',
      type: job.type,
      salaryMin: '',
      salaryMax: '',
      description: '',
      requirements: [''],
      experienceLevel: 'mid',
      educationLevel: 'bachelor',
      minimumPoints: '',
      isEvent: job.isEvent || false,
      eventDate: job.eventDate || '',
      requiresApplication: job.requiresApplication !== false,
    });
    setShowPostForm(true);
  };

  const handleDeleteJob = (jobId: string) => {
    const jobToDelete = allPostedItems.find(item => item.id === jobId);
    if (!jobToDelete) return;

    setDeleteConfirmModal({
      isOpen: true,
      jobId: jobId,
      jobTitle: jobToDelete.title,
      isEvent: jobToDelete.isEvent || false
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirmModal.jobId) return;

    const success = deleteJob(deleteConfirmModal.jobId);

    if (success) {
      setAllPostedItems(prevItems => prevItems.filter(item => item.id !== deleteConfirmModal.jobId));
      showToast(`${deleteConfirmModal.isEvent ? 'Event' : 'Job'} deleted successfully!`, 'success');
    } else {
      showToast('Failed to delete. Please try again.', 'error');
    }

    setDeleteConfirmModal({ isOpen: false, jobId: null, jobTitle: '', isEvent: false });
  };

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'jobs', label: 'Job' },
    { value: 'events', label: 'Event' }
  ];

  const handleTypeSelect = (value: 'all' | 'jobs' | 'events') => {
    setFilterType(value);
    setIsTypeDropdownOpen(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to post jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Post</h1>
        <p className="text-gray-600">
          Post jobs, manage applications, and find the perfect candidates for your company.
        </p>
      </div>

      {/* Verification Status */}
      {!user.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Company Verification Required</h2>
          <p className="text-yellow-700 mb-4">
            To post jobs, you need to verify your company information including company name, ID, and location.
          </p>
          <button
            onClick={handleVerifyCompany}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
          >
            Verify Company
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{allPostedItems.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-green-600 mt-1">42</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">$24</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">2.4h</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setFormData({ ...formData, isEvent: false });
              setShowPostForm(true);
            }}
            disabled={!user.isVerified}
            className={`${
              user.isVerified
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } px-6 py-3 rounded-lg font-semibold transition-all flex items-center`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Job ($1)
          </button>
          <button
            onClick={() => {
              setFormData({ ...formData, isEvent: true });
              setShowPostForm(true);
            }}
            disabled={!user.isVerified}
            className={`${
              user.isVerified
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } px-6 py-3 rounded-lg font-semibold transition-all flex items-center`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Event ($0.50)
          </button>
        </div>
      </div>

      {/* Posted Jobs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Your Posts</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 relative">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <div className="relative">
                  <button
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm bg-white min-w-[80px] text-left flex items-center justify-between"
                  >
                    <span>{typeOptions.find(option => option.value === filterType)?.label}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {typeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleTypeSelect(option.value as 'all' | 'jobs' | 'events')}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            filterType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div 
                className="relative"
                onClick={() => setIsTypeDropdownOpen(false)}
                >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-4">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                      item.isEvent 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.isEvent ? 'Event' : 'Job'}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    {item.company}
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted {new Date(item.postedDate).toLocaleDateString()}
                    {item.isEvent && item.eventDate && (
                      <>
                        <span className="mx-2">•</span>
                        Event: {new Date(item.eventDate).toLocaleDateString()}
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    {item.applications} {item.isEvent ? 'registrants' : 'applications'}
                  </div>
                  {jobStats[item.id] && jobStats[item.id].total > 0 && (
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-700">{jobStats[item.id].reviewed}</span>
                        <span className="text-gray-500">/</span>
                        <span className="font-semibold text-blue-700">{jobStats[item.id].total}</span>
                        <span className="text-gray-600">reviewed</span>
                      </div>
                      <div className="h-3 w-px bg-gray-300" />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[])
                          .filter(status => status !== 'applicant' && jobStats[item.id].statusCounts[status] > 0)
                          .map(status => (
                            <span
                              key={status}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}
                            >
                              {STATUS_CONFIG[status].label}: {jobStats[item.id].statusCounts[status]}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/hire/job/${item.id}/applicants`)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                    title="View Applicants"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditJob(item)}
                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(item.id)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterType === 'all' ? 'No posts yet' : 
               filterType === 'jobs' ? 'No jobs posted yet' : 
               'No events posted yet'}
            </h3>
            <p className="text-gray-600">
              {filterType === 'all' ? 'Start by posting your first job or event.' :
               filterType === 'jobs' ? 'Start by posting your first job to attract talented candidates.' :
               'Start by posting your first event to connect with professionals.'}
            </p>
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8 mt-20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingJob ? `Edit ${editingJob.isEvent ? 'Event' : 'Job'}` : `Post a New ${formData.isEvent ? 'Event' : 'Job'}`}
                </h2>
                <button
                  onClick={() => {
                    setShowPostForm(false);
                    setEditingJob(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Job Type Toggle */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postType"
                    checked={!formData.isEvent}
                    onChange={() => setFormData({ ...formData, isEvent: false })}
                    className="mr-2"
                  />
                  Job Posting
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postType"
                    checked={formData.isEvent}
                    onChange={() => setFormData({ ...formData, isEvent: true })}
                    className="mr-2"
                  />
                  Event Posting
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.isEvent ? 'Event' : 'Job'} Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.company}
                    onChange={(e) => {
                      const selectedCompany = verifiedCompanies.find(c => c.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        company: e.target.value,
                        location: formData.isEvent && selectedCompany ? selectedCompany.address : formData.location
                      });
                    }}
                  >
                    <option value="">Select a verified company</option>
                    {verifiedCompanies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  {formData.isEvent ? (
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter event location"
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      value={formData.company ? verifiedCompanies.find(c => c.name === formData.company)?.address || '' : ''}
                      readOnly
                      placeholder="Select a company first"
                    />
                  )}
                </div>

                {formData.isEvent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                )}

                {!formData.isEvent && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Type *
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Salary *
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Salary *
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })}
                  >
                    <option value="high-school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

              </div>

              {formData.isEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Application
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requiresApplication"
                        checked={!formData.requiresApplication}
                        onChange={() => setFormData({ ...formData, requiresApplication: false })}
                        className="mr-2"
                      />
                      No application needed (Open event)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requiresApplication"
                        checked={formData.requiresApplication}
                        onChange={() => setFormData({ ...formData, requiresApplication: true })}
                        className="mr-2"
                      />
                      Requires application
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={formData.isEvent ? "Describe the event, what attendees can expect, networking opportunities, etc." : "Describe the role, responsibilities, company culture, etc."}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.isEvent ? 'What to Bring/Requirements' : 'Job Requirements'}
                </label>
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={formData.isEvent ? "e.g. Bring resume, Business casual attire" : "e.g. 5+ years React experience"}
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Requirement
                </button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">
                    {editingJob ? 'Editing existing post' : `Posting Fee: ${formData.isEvent ? '$0.50' : '$1.00'}`}
                  </p>
                  {!editingJob && <p>Your {formData.isEvent ? 'event' : 'job'} will be live for 30 days</p>}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostForm(false);
                      setEditingJob(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                  >
                    {editingJob ? 'Update' : `Post ${formData.isEvent ? 'Event ($0.50)' : 'Job ($1)'}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        title={`Delete ${deleteConfirmModal.isEvent ? 'Event' : 'Job'}`}
        message={`Are you sure you want to delete "${deleteConfirmModal.jobTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, jobId: null, jobTitle: '', isEvent: false })}
        variant="danger"
      />
    </div>
  );
}