import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Star, Zap, Send, Bookmark } from 'lucide-react';
import { Job } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface JobCardProps {
  job: Job;
  showPoints?: boolean;
  onQuickApply?: (jobId: string) => void;
}

export default function JobCard({ job, showPoints = true, onQuickApply }: JobCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canAfford = !user || user.points >= job.minimumPoints;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement save functionality
    showToast(`${job.isEvent ? 'Event' : 'Job'} saved to your favorites!`, 'success');
  };

  const handleQuickApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickApply && canAfford) {
      onQuickApply(job.id);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border ${
        job.featured ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50' : 'border-gray-100'
      } ${!canAfford ? 'opacity-60' : ''}`}
    >
      {/* Save Button */}
      <button
        onClick={handleSave}
        className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
        title={`Save this ${job.isEvent ? 'event' : 'job'}`}
      >
        <Bookmark className="h-4 w-4" />
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1">
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
          </div>
          <p className="text-lg text-gray-700 font-medium mb-2">{job.company}</p>
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
        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
          {showPoints && (
            <div className="mb-3 text-center">
              <div className="text-sm text-gray-500 text-center">Points Boost Minimum Spend Requirement</div>
              <div className={`text-lg font-bold flex items-center justify-center ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                <Zap className="h-4 w-4 mr-1" />
                {job.minimumPoints}
              </div>
            </div>
          )}
          <div className={`${job.isEvent && job.requiresApplication && onQuickApply ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
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