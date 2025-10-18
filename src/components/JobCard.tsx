import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Star, Zap, Send, Bookmark, Ban } from 'lucide-react';
import { Job } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { blockJob, addSwipeAction, removeSwipeAction, isJobSaved, getAppliedJobs } from '../lib/swipeStorage';

interface JobCardProps {
  job: Job;
  showPoints?: boolean;
  onQuickApply?: (jobId: string) => void;
}

export default function JobCard({ job, showPoints = true, onQuickApply }: JobCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canAfford = !user || user.points >= job.minimumPoints;
  const [isSaved, setIsSaved] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setIsSaved(isJobSaved(job.id));
    setIsApplied(getAppliedJobs().includes(job.id));
  }, [job.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      removeSwipeAction(job.id, 'saved');
      setIsSaved(false);
      showToast(`${job.isEvent ? 'Event' : 'Job'} removed from favorites`, 'info');
    } else {
      addSwipeAction({
        jobId: job.id,
        actionType: 'saved',
        timestamp: Date.now(),
        userId: user?.id,
      });
      setIsSaved(true);
      showToast(`${job.isEvent ? 'Event' : 'Job'} saved to your favorites!`, 'success');
    }
  };

  const handleBlock = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsBlocking(true);
    blockJob(job.id);
    showToast(`${job.isEvent ? 'Event' : 'Job'} blocked. It will no longer appear.`, 'warning');

    setTimeout(() => {
      setIsBlocking(false);
      window.location.reload();
    }, 100);
  };

  const handleQuickApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickApply && canAfford) {
      onQuickApply(job.id);
      setIsApplied(true);
    }
  };

  if (isApplied && !showPoints) {
    return null;
  }

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border ${
        job.featured ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50' : 'border-gray-100'
      } ${!canAfford ? 'opacity-60' : ''}`}
    >

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1 pr-20">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-900 mr-2">{job.title}</h3>
            {job.featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </span>
            )}
            {!canAfford && showPoints && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                Need {job.minimumPoints - (user?.points || 0)} more points
              </span>
            )}
            {!job.isEvent && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleSave}
                  className={`${isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-200 p-2 rounded-lg transition-colors`}
                  title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleBlock}
                  disabled={isBlocking}
                  className={`bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors ${isBlocking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={`Block this ${job.isEvent ? 'event' : 'job'}`}
                >
                  <Ban className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <Link
            to={`/company/${encodeURIComponent(job.company)}`}
            className="text-lg text-gray-700 font-medium mb-2 hover:text-blue-600 transition-colors inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {job.company}
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
            </div>
            {!job.isEvent && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </div>
            )}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
            </div>
          </div>
          <p className="text-gray-600 line-clamp-2">{job.description}</p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end min-w-[180px]">
          {showPoints && (
            <div className="mb-3 text-center w-full">
              <div className="text-sm text-gray-500 text-center">Minimum Boost Point Spend</div>
              <div className={`text-lg font-bold flex items-center justify-center ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                <Zap className="h-4 w-4 mr-1" />
                {job.minimumPoints}
              </div>
            </div>
          )}
          {job.isEvent && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleSave}
                className={`${isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-200 p-2 rounded-lg transition-colors`}
                title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleBlock}
                disabled={isBlocking}
                className={`bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors ${isBlocking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={`Block this ${job.isEvent ? 'event' : 'job'}`}
              >
                <Ban className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className={`${job.isEvent && job.requiresApplication && onQuickApply ? 'flex flex-col gap-2 w-full' : 'flex gap-2'}`}>
            {job.isEvent && job.requiresApplication && onQuickApply && (
              <button
                onClick={handleQuickApply}
                disabled={!canAfford}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  canAfford
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4 mr-1" />
                Quick Apply
              </button>
            )}
            {!job.isEvent && onQuickApply && (
              <button
                onClick={handleQuickApply}
                disabled={!canAfford}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center ${
                  canAfford
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4 mr-1" />
                Quick Apply
              </button>
            )}
            <Link
              to={job.isEvent ? `/event/${job.id}` : `/job/${job.id}`}
              className={`px-6 py-3 rounded-lg font-semibold transition-all text-center ${
                job.isEvent ? 'w-full' : ''
              } ${
                canAfford
                  ? job.isEvent 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAfford ? (job.isEvent ? 'View Event' : 'View Details') : 'Need More Points'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}