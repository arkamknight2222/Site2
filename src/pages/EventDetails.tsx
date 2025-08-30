import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Star, Building, ArrowLeft, Zap } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import ResumeSelector from '../components/ResumeSelector';

export default function EventDetails() {
  const { id } = useParams();
  const { getJob } = useJobs();
  const { user, updateUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);

  const event = getJob(id || '');

  if (!event || !event.isEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/events"
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
          >
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  const canAfford = !user || user.points >= event.minimumPoints;
  const eventDate = new Date(event.eventDate || '');

  const handleQuickRegister = async () => {
    if (!user) {
      return;
    }

    // Use default resume for quick register
    const savedResumes = localStorage.getItem('rushWorkingResumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
      const defaultResume = resumes.find((r: any) => r.isDefault);
      if (defaultResume) {
        await submitRegistration(defaultResume);
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

  const submitRegistration = async (resume: any) => {
    setIsRegistering(true);
    
    // Simulate API call
    setTimeout(() => {
      // Award 10 points for registering
      const currentPoints = user.points || 0;
      updateUser({ points: currentPoints + 10 });
      setHasRegistered(true);
      alert(`Registration successful with "${resume.name}"! You earned 10 points. Check your email for event details.`);
      setIsRegistering(false);
      setShowResumeSelector(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`p-8 ${event.featured ? 'bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200' : 'border-b border-gray-200'}`}>
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
                <h1 className="text-3xl font-bold text-gray-900 mr-3">{event.title}</h1>
                {event.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-xl text-gray-700 font-medium">{event.company}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  {eventDate.toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  {event.experienceLevel.charAt(0).toUpperCase() + event.experienceLevel.slice(1)} Level
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    FREE
                  </div>
                  <div className="text-gray-600">Event Registration</div>
                </div>
                {event.requiresApplication && (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className={`h-5 w-5 mr-2 ${canAfford ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-lg font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        {event.minimumPoints} points
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 text-center">Points Boost Minimum Spend Requirement</div>
                    {user && !canAfford && (
                      <div className="text-xs text-red-500 mt-1 text-center">
                        You need {event.minimumPoints - user.points} more points
                      </div>
                    )}
                  </div>
                )}
                {!user ? (
                  event.requiresApplication ? (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all text-center block"
                      >
                        Sign In to Register
                      </Link>
                      <Link
                        to="/register"
                        className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-all text-center block"
                      >
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold mb-3">
                        No Registration Required
                      </div>
                      <p className="text-sm text-gray-600 mb-4">This is an open event. Just show up!</p>
                      <Link
                        to="/events"
                        className="w-full border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-all text-center block"
                      >
                        Browse Other Events
                      </Link>
                    </div>
                  )
                ) : hasRegistered ? (
                  <button
                    disabled
                    className="w-full bg-green-100 text-green-600 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    ✓ Registered Successfully
                  </button>
                ) : event.requiresApplication ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleQuickRegister}
                      disabled={isRegistering || !canAfford}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isRegistering ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registering...
                        </div>
                      ) : canAfford ? (
                        'Quick Register'
                      ) : (
                        'Need More Points'
                      )}
                    </button>
                    <button
                      onClick={handleSelectResume}
                      disabled={isRegistering || !canAfford}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Register with Resume' : 'Need More Points'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold mb-3">
                      No Registration Required
                    </div>
                    <p className="text-sm text-gray-600 mb-4">This is an open event. Just show up!</p>
                    <Link
                      to="/events"
                      className="w-full border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:border-green-600 hover:text-green-600 transition-all text-center block"
                    >
                      Browse Other Events
                    </Link>
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
              {/* Event Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* What to Bring */}
              {event.requirements && event.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
                  <ul className="space-y-3">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Date & Time</div>
                    <div className="font-medium text-gray-900">
                      {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium text-gray-900">{event.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Target Audience</div>
                    <div className="font-medium text-gray-900 capitalize">{event.experienceLevel} Level</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Education Level</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {event.educationLevel.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Posted Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(event.postedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Share this event</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Invite your friends and colleagues
                </p>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors">
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
        onSelect={(resume) => submitRegistration(resume)}
        jobTitle={event.title}
      />
    </div>
  );
}