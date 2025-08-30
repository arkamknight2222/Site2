import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Star, Building, Calendar, ArrowLeft, Zap } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import ResumeSelector from '../components/ResumeSelector';

export default function JobDetails() {
  const { id } = useParams();
  const { getJob, applyToJob } = useJobs();
  const { user, updateUser } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any>(null);

  const job = getJob(id || '');

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/jobs"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Browse Other Jobs
          </Link>
        </div>
      </div>
    );
  }

  const canAfford = !user || user.points >= job.minimumPoints;

  const handleQuickApply = async () => {
    if (!user) {
      return;
    }

    // Use default resume for quick apply
    const savedResumes = localStorage.getItem('rushWorkingResumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
      const defaultResume = resumes.find((r: any) => r.isDefault);
      if (defaultResume) {
        await submitApplication(defaultResume);
      } else {
        setShowResumeSelector(true);
      }
    } else {
      alert('Please upload a resume first');
    }
  };

  const handleSelectResume = () => {
    if (!user) {
      return;
    }
    setShowResumeSelector(true);
  };

  const submitApplication = async (resume: any) => {
    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = applyToJob(job.id, user.id);
      if (success) {
        // Award 10 points for applying
        const currentPoints = user.points || 0;
        updateUser({ points: currentPoints + 10 });
        setHasApplied(true);
        alert(`Application submitted successfully with "${resume.name}"! You earned 10 points.`);
      }
      setIsApplying(false);
      setShowResumeSelector(false);
      setSelectedResume(null);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/jobs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`p-8 ${job.featured ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200' : 'border-b border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
            <div className="flex-1">
              {/* Save Button */}
              <div className="flex justify-end mb-4">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center mb-3">
                <h1 className="text-3xl font-bold text-gray-900 mr-3">{job.title}</h1>
                {job.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-xl text-gray-700 font-medium">{job.company}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  {job.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-green-600" />
                  {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                  Posted {new Date(job.postedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Annual Salary</div>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className={`h-5 w-5 mr-2 ${canAfford ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-lg font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                      {job.minimumPoints} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 text-center">Points Boost Minimum Spend Requirement</div>
                  {user && !canAfford && (
                    <div className="text-xs text-red-500 mt-1 text-center">
                      You need {job.minimumPoints - user.points} more points
                    </div>
                  )}
                </div>
                {!user ? (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-center block"
                    >
                      Sign In to Apply
                    </Link>
                    <Link
                      to="/register"
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all text-center block"
                    >
                      Create Account
                    </Link>
                  </div>
                ) : hasApplied ? (
                  <button
                    disabled
                    className="w-full bg-green-100 text-green-600 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    ✓ Applied Successfully
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleQuickApply}
                      disabled={isApplying || !canAfford}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isApplying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </div>
                      ) : canAfford ? (
                        'Quick Apply'
                      ) : (
                        'Need More Points'
                      )}
                    </button>
                    <button
                      onClick={handleSelectResume}
                      disabled={!canAfford}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Apply with Resume' : 'Need More Points'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                      </div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Experience Level</div>
                    <div className="font-medium text-gray-900 capitalize">{job.experienceLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Education Level</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {job.educationLevel.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Job Type</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {job.type.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Posted Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Share this job</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Help others discover this opportunity
                </p>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Share
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Selector Modal */}
      <ResumeSelector
        isOpen={showResumeSelector}
        onClose={() => setShowResumeSelector(false)}
        onSelect={(resume) => submitApplication(resume)}
        jobTitle={job.title}
      />
    </div>
  );
}