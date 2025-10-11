import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star, Building, CheckCircle, AlertCircle, ArrowLeft, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { resumeService } from '../services/resumeService';
import { applicationService } from '../services/applicationService';
import { pointsService } from '../services/pointsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ResumeSelector from '../components/ResumeSelector';

interface ResumeFile {
  id: string;
  name: string;
  fileName: string;
  size: number;
  uploadDate: string;
  isDefault: boolean;
  folderId: string;
  url: string;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const event = jobs.find(job => job.id === id && job.isEvent);

  useEffect(() => {
    if (!event) return;
    
    // Check if user has already registered for this event
    const checkRegistration = async () => {
      if (!user) return;
      
      try {
        const applications = await applicationService.getUserApplications(user.id);
        const eventApplication = applications.find(app => app.jobId === event.id);
        
        if (eventApplication) {
          setHasRegistered(true);
          setRegistrationStatus(eventApplication.status as 'pending' | 'accepted' | 'rejected');
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };

    checkRegistration();
  }, [event, user]);

  const handleQuickRegister = async () => {
    if (!user || !event) return;

    try {
      setIsRegistering(true);

      // Get user's resumes from Supabase
      const resumes = await resumeService.getResumes(user.id);
      const defaultResume = resumes.find(resume => resume.isDefault);

      if (!defaultResume) {
        alert('Please upload and set a default resume before registering for events.');
        navigate('/resume');
        return;
      }

      // Check if user has enough points
      if (user.points < (event.minimumPoints || 0)) {
        alert(`You need at least ${event.minimumPoints} points to register for this event.`);
        return;
      }

      // Submit registration
      const success = await applicationService.submitApplication({
        jobId: event.id,
        userId: user.id,
        resumeId: defaultResume.id,
        pointsUsed: event.minimumPoints || 0,
      });

      if (success) {
        // Add points transaction
        await pointsService.addPointsTransaction(
          user.id,
          'spent',
          -(event.minimumPoints || 0),
          `Event registration: ${event.title}`,
          'event_registration',
          event.id
        );

        setHasRegistered(true);
        setRegistrationStatus('pending');
        alert('Successfully registered for the event!');
      } else {
        alert('Failed to register for the event. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred while registering. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterWithResume = async (selectedResumeId: string) => {
    if (!user || !event) return;

    try {
      setIsRegistering(true);

      // Check if user has enough points
      if (user.points < (event.minimumPoints || 0)) {
        alert(`You need at least ${event.minimumPoints} points to register for this event.`);
        return;
      }

      // Submit registration
      const success = await applicationService.submitApplication({
        jobId: event.id,
        userId: user.id,
        resumeId: selectedResumeId,
        pointsUsed: event.minimumPoints || 0,
      });

      if (success) {
        // Add points transaction
        await pointsService.addPointsTransaction(
          user.id,
          'spent',
          -(event.minimumPoints || 0),
          `Event registration: ${event.title}`,
          'event_registration',
          event.id
        );

        setHasRegistered(true);
        setRegistrationStatus('pending');
        setShowResumeSelector(false);
        alert('Successfully registered for the event!');
      } else {
        alert('Failed to register for the event. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred while registering. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Building className="h-5 w-5 mr-2" />
                <span className="font-medium">{event.company}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.eventDate!)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatTime(event.eventDate!)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            {event.featured && (
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>

              {event.requirements && event.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900 capitalize">{event.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience Level</span>
                    <span className="font-medium text-gray-900 capitalize">{event.experienceLevel}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Education Level</span>
                    <span className="font-medium text-gray-900 capitalize">{event.educationLevel}</span>
                  </div>
                  
                  {event.minimumPoints && event.minimumPoints > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Points Required</span>
                      <span className="font-medium text-gray-900">{event.minimumPoints}</span>
                    </div>
                  )}
                </div>

                {/* Registration Status or Button */}
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to register for this event</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                ) : hasRegistered ? (
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mb-4 ${getStatusColor(registrationStatus)}`}>
                      {getStatusIcon(registrationStatus)}
                      <span className="ml-2 capitalize">{registrationStatus}</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {registrationStatus === 'pending' && 'Your registration is being reviewed'}
                      {registrationStatus === 'accepted' && 'You are registered for this event'}
                      {registrationStatus === 'rejected' && 'Your registration was not accepted'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleQuickRegister}
                      disabled={isRegistering || (event.minimumPoints && user.points < event.minimumPoints)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isRegistering ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Quick Register
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowResumeSelector(true)}
                      disabled={isRegistering || (event.minimumPoints && user.points < event.minimumPoints)}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Choose Resume
                    </button>

                    {event.minimumPoints && user.points < event.minimumPoints && (
                      <p className="text-red-600 text-sm text-center">
                        You need {event.minimumPoints - user.points} more points to register
                      </p>
                    )}
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
          onSelect={handleRegisterWithResume}
          onClose={() => setShowResumeSelector(false)}
          title="Select Resume for Event Registration"
          description={`Choose the resume you'd like to use for registering to "${event.title}"`}
        />
      )}
    </div>
  );
}