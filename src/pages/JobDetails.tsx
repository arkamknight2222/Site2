import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Building, Calendar, Star, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { resumeService } from '../services/resumeService';
import { applicationService } from '../services/applicationService';
import { pointsService } from '../services/pointsService';
import ResumeSelector from '../components/ResumeSelector';
import LoadingSpinner from '../components/LoadingSpinner';

interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id && jobs.length > 0) {
      const foundJob = jobs.find(j => j.id === id);
      setJob(foundJob);
      setLoading(false);
    }
  }, [id, jobs]);

  useEffect(() => {
    if (user) {
      loadResumes();
      checkApplicationStatus();
    }
  }, [user, id]);

  const loadResumes = async () => {
    if (!user) return;
    
    try {
      const userResumes = await resumeService.getResumes(user.id);
      const resumeData = userResumes.map(resume => ({
        id: resume.id,
        name: resume.name,
        fileName: resume.fileName,
        fileUrl: resume.url,
        isDefault: resume.isDefault
      }));
      setResumes(resumeData);
      
      // Set default resume if available
      const defaultResume = resumeData.find(r => r.isDefault);
      if (defaultResume) {
        setSelectedResume(defaultResume);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;
    
    try {
      const applications = await applicationService.getUserApplications(user.id);
      const hasAppliedToJob = applications.some(app => app.jobId === id);
      setHasApplied(hasAppliedToJob);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!user || !job || !selectedResume) return;

    setApplying(true);
    try {
      const success = await applicationService.submitApplication({
        jobId: job.id,
        userId: user.id,
        resumeId: selectedResume.id,
        pointsUsed: job.minimumPoints || 0
      });

      if (success) {
        // Deduct points if required
        if (job.minimumPoints > 0) {
          await pointsService.deductPoints(
            user.id,
            job.minimumPoints,
            `Applied to ${job.title} at ${job.company}`,
            'application',
            job.id
          );
        }

        setHasApplied(true);
        alert('Application submitted successfully!');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred while submitting your application.');
    } finally {
      setApplying(false);
    }
  };

  const handleQuickApply = async () => {
    if (!selectedResume) {
      setShowResumeSelector(true);
      return;
    }
    await handleApply();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building className="w-5 h-5 mr-2" />
                  <span className="text-lg font-medium">{job.company}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.type}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {job.featured && (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-1" />
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Job Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Experience Level:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">{job.experienceLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Education Level:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">{job.educationLevel}</span>
                    </div>
                    {job.minimumPoints > 0 && (
                      <div>
                        <span className="text-gray-600">Points Required:</span>
                        <span className="ml-2 font-medium text-gray-900">{job.minimumPoints}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Section */}
                {user && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Apply for this Job</h3>
                    
                    {hasApplied ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-800 font-medium">Application Submitted</p>
                        <p className="text-green-600 text-sm mt-1">You have already applied to this job</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedResume && (
                          <div className="text-sm">
                            <span className="text-gray-600">Selected Resume:</span>
                            <div className="mt-1 p-2 bg-white rounded border">
                              <span className="font-medium text-gray-900">{selectedResume.name}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <button
                            onClick={handleQuickApply}
                            disabled={applying || (job.minimumPoints > 0 && user.points < job.minimumPoints)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            {applying ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Quick Apply
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setShowResumeSelector(true)}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Choose Different Resume
                          </button>
                        </div>

                        {job.minimumPoints > 0 && user.points < job.minimumPoints && (
                          <p className="text-red-600 text-sm">
                            You need {job.minimumPoints - user.points} more points to apply for this job.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-3">Sign in to apply for this job</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Selector Modal */}
      {showResumeSelector && (
        <ResumeSelector
          isOpen={showResumeSelector}
          onClose={() => setShowResumeSelector(false)}
          onSelect={(resume) => {
            setSelectedResume({
              id: resume.id,
              name: resume.name,
              fileName: resume.fileName,
              fileUrl: resume.url,
              isDefault: resume.isDefault
            });
            setShowResumeSelector(false);
          }}
        />
      )}
    </div>
  );
}