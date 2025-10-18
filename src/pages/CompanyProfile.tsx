import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Star,
  Ban,
  Flag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Heart,
  UserPlus,
} from 'lucide-react';
import {
  getCompany,
  blockCompany,
  reportCompany,
  addCompanyReview,
  initializeCompanyFromJobs,
  followCompany,
  unfollowCompany,
  isCompanyFollowed,
  reportSalary,
  getCompanyFollowCount,
} from '../lib/companyApi';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';

export default function CompanyProfile() {
  const { companyName } = useParams<{ companyName: string }>();
  const { jobs, events } = useJobs();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    applicantStatus: 'not_applied' as const,
    jobTitle: '',
  });
  const [salaryData, setSalaryData] = useState({
    jobTitle: '',
    salaryAmount: '',
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    notes: '',
  });
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');

  useEffect(() => {
    if (companyName && user) {
      initializeCompanyFromJobs([...jobs, ...events]);
      const decodedCompanyName = decodeURIComponent(companyName);
      const companyData = getCompany(decodedCompanyName);
      setCompany(companyData);
      setIsFollowing(isCompanyFollowed(decodedCompanyName, user.id));
    }
  }, [companyName, jobs, events, user]);

  if (!company || !companyName) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-6">The company you're looking for doesn't exist.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const decodedCompanyName = decodeURIComponent(companyName);
  const companyJobs = jobs.filter(job => job.company === decodedCompanyName && !job.isEvent);
  const companyEvents = events.filter(event => event.company === decodedCompanyName);
  const currentJobs = companyJobs.filter(job => new Date(job.postedDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const previousJobs = companyJobs.filter(job => new Date(job.postedDate) <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

  const handleBlock = () => {
    blockCompany(decodedCompanyName);
    showToast(`${decodedCompanyName} has been blocked`, 'success');
    setShowBlockModal(false);
    navigate('/jobs');
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      showToast('Please provide a reason for reporting', 'warning');
      return;
    }
    reportCompany(decodedCompanyName, reportReason);
    showToast(`${decodedCompanyName} has been reported`, 'success');
    setShowReportModal(false);
    setReportReason('');
  };

  const handleFollowToggle = () => {
    if (!user) {
      showToast('Please sign in to follow companies', 'warning');
      return;
    }

    if (isFollowing) {
      unfollowCompany(decodedCompanyName, user.id);
      setIsFollowing(false);
      showToast(`Unfollowed ${decodedCompanyName}`, 'info');
    } else {
      followCompany(decodedCompanyName, user.id);
      setIsFollowing(true);
      showToast(`Now following ${decodedCompanyName}`, 'success');
    }

    const updatedCompany = getCompany(decodedCompanyName);
    setCompany(updatedCompany);
  };

  const handleSubmitReview = () => {
    if (!user) {
      showToast('Please sign in to leave a review', 'warning');
      return;
    }

    if (!reviewData.comment.trim()) {
      showToast('Please write a comment', 'warning');
      return;
    }

    addCompanyReview({
      companyName: decodedCompanyName,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      rating: reviewData.rating,
      comment: reviewData.comment,
      applicantStatus: reviewData.applicantStatus,
      jobTitle: reviewData.jobTitle || undefined,
    });

    showToast('Review submitted successfully', 'success');
    setShowReviewModal(false);
    setReviewData({
      rating: 5,
      comment: '',
      applicantStatus: 'not_applied',
      jobTitle: '',
    });

    const updatedCompany = getCompany(decodedCompanyName);
    setCompany(updatedCompany);
  };

  const handleSubmitSalary = () => {
    if (!user) {
      showToast('Please sign in to report salary', 'warning');
      return;
    }

    if (!salaryData.jobTitle.trim()) {
      showToast('Please enter a job title', 'warning');
      return;
    }

    const salaryAmount = parseFloat(salaryData.salaryAmount);
    if (isNaN(salaryAmount) || salaryAmount < 15000 || salaryAmount > 500000) {
      showToast('Salary must be between $15,000 and $500,000', 'warning');
      return;
    }

    try {
      reportSalary({
        userId: user.id,
        companyName: decodedCompanyName,
        jobTitle: salaryData.jobTitle,
        salaryAmount,
        employmentType: salaryData.employmentType,
        notes: salaryData.notes || undefined,
      });

      showToast('Salary reported successfully', 'success');
      setShowSalaryModal(false);
      setSalaryData({
        jobTitle: '',
        salaryAmount: '',
        employmentType: 'full-time',
        notes: '',
      });

      const updatedCompany = getCompany(decodedCompanyName);
      setCompany(updatedCompany);
    } catch (error) {
      showToast('Failed to report salary', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'interviewed':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'applied':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const gradientColors = company.profileColors
    ? `from-${company.profileColors.from} to-${company.profileColors.to}`
    : 'from-blue-600 to-blue-700';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/jobs"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Link>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className={`bg-gradient-to-r ${gradientColors} h-32`}></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
            <div className="flex items-end mb-4 md:mb-0">
              <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-white">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-24 w-24 object-contain" />
                ) : (
                  <Building2 className="h-24 w-24 text-gray-400" />
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                {company.industry && (
                  <p className="text-gray-600 mt-1">{company.industry}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  isFollowing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Heart className="h-4 w-4 fill-current" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </>
                )}
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
              <button
                onClick={() => setShowBlockModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Ban className="h-4 w-4" />
                Block Company
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
            {company.addresses && company.addresses.length > 0 && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {company.addresses[0]}
              </div>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-600"
              >
                <Globe className="h-4 w-4 mr-2" />
                {company.website}
              </a>
            )}
            {company.foundedYear && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Founded {company.foundedYear}
              </div>
            )}
            {company.companySize && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {company.companySize}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{company.biography}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Write Review
              </button>
            </div>

            {company.reviews && company.reviews.length > 0 ? (
              <div className="space-y-4">
                {company.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          {getStatusIcon(review.applicantStatus)}
                          <span>{getStatusLabel(review.applicantStatus)}</span>
                          {review.jobTitle && <span>• {review.jobTitle}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Postings</h2>
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('current')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'current'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Current ({currentJobs.length + companyEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('previous')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'previous'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Previous ({previousJobs.length})
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'current' ? (
                <>
                  {[...currentJobs, ...companyEvents].length > 0 ? (
                    [...currentJobs, ...companyEvents].map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No current job postings</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {previousJobs.length > 0 ? (
                    previousJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No previous job postings</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>Followers</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.followCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Hired</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.hired}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Interviewed</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.interviewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Rejected</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.rejected}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  <span>Total Jobs</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.totalJobPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Total Applications</span>
                </div>
                <span className="font-bold text-gray-900">{company.statistics.totalApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Avg Salary</span>
                </div>
                <span className="font-bold text-gray-900">
                  ${company.statistics.averageSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span>Avg Reported Salary</span>
                </div>
                <span className="font-bold text-gray-900">
                  {company.statistics.averageReportedSalary > 0
                    ? `$${company.statistics.averageReportedSalary.toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Avg Rating</span>
                </div>
                <span className="font-bold text-gray-900">
                  {company.statistics.averageRating || 'N/A'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSalaryModal(true)}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
            >
              Report Salary
            </button>
          </div>

          {company.addresses && company.addresses.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Locations</h2>
              <div className="space-y-3">
                {company.addresses.map((address: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Block Company</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to block {company.name}? You will no longer see job postings from this company.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Company</h3>
            <p className="text-gray-700 mb-4">
              Please provide a reason for reporting {company.name}:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the issue..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewData({ ...reviewData, rating })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicant Status</label>
              <select
                value={reviewData.applicantStatus}
                onChange={(e) => setReviewData({ ...reviewData, applicantStatus: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="not_applied">Not Applied</option>
                <option value="applied">Applied</option>
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title (Optional)</label>
              <input
                type="text"
                value={reviewData.jobTitle}
                onChange={(e) => setReviewData({ ...reviewData, jobTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewData({
                    rating: 5,
                    comment: '',
                    applicantStatus: 'not_applied',
                    jobTitle: '',
                  });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {showSalaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Salary</h3>
            <p className="text-gray-600 text-sm mb-4">
              Help others by sharing salary information for {company.name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={salaryData.jobTitle}
                onChange={(e) => setSalaryData({ ...salaryData, jobTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={salaryData.salaryAmount}
                  onChange={(e) => setSalaryData({ ...salaryData, salaryAmount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 pl-7 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75000"
                  min="15000"
                  max="500000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Between $15,000 and $500,000</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
              <select
                value={salaryData.employmentType}
                onChange={(e) => setSalaryData({ ...salaryData, employmentType: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={salaryData.notes}
                onChange={(e) => setSalaryData({ ...salaryData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional context about benefits, location, etc."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSalaryModal(false);
                  setSalaryData({
                    jobTitle: '',
                    salaryAmount: '',
                    employmentType: 'full-time',
                    notes: '',
                  });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSalary}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
