import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Maximize, Minimize } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { Job } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  addSwipeAction,
  getBlockedJobs,
  getIgnoredJobs,
  getAppliedJobs
} from '../lib/swipeStorage';
import { addPointsHistoryEntry } from '../lib/pointsHistoryApi';

interface SwipeStackProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
}

interface PendingAction {
  jobId: string;
  action: 'left' | 'right' | 'up' | 'down';
  timestamp: number;
}

export default function SwipeStack({ jobs, onApply }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const filteredJobs = jobs.filter(job => {
    const blocked = getBlockedJobs();
    const ignored = getIgnoredJobs();
    const applied = getAppliedJobs();

    return !blocked.includes(job.id) &&
           !ignored.includes(job.id) &&
           !applied.includes(job.id);
  });

  const currentJob = filteredJobs[currentIndex];
  const remainingCount = filteredJobs.length - currentIndex;

  useEffect(() => {
    if (pendingAction) {
      setShowUndo(true);
      const timer = setTimeout(() => {
        commitAction(pendingAction);
        setShowUndo(false);
        setPendingAction(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [pendingAction]);

  const commitAction = (action: PendingAction) => {
    const { jobId, action: direction } = action;
    const job = filteredJobs.find(j => j.id === jobId);
    if (!job) return;

    switch (direction) {
      case 'left':
        addSwipeAction({
          jobId,
          actionType: 'ignored',
          timestamp: Date.now(),
          userId: user?.id,
        });
        showToast(`${job.isEvent ? 'Event' : 'Job'} ignored`, 'info');
        break;
      case 'right':
        addSwipeAction({
          jobId,
          actionType: 'applied',
          timestamp: Date.now(),
          userId: user?.id,
        });
        if (user) {
          const currentPoints = user.points || 0;
          updateUser({ points: currentPoints + 10 });
          addPointsHistoryEntry({
            type: 'earned',
            amount: 10,
            description: `Applied to ${job.title} at ${job.company}`,
            category: job.isEvent ? 'event' : 'application',
            userId: user.id,
          });
        }
        if (onApply) onApply(jobId);
        showToast(`Application submitted! You earned 10 points.`, 'success');
        break;
      case 'up':
        addSwipeAction({
          jobId,
          actionType: 'saved',
          timestamp: Date.now(),
          userId: user?.id,
        });
        showToast(`${job.isEvent ? 'Event' : 'Job'} saved for later`, 'success');
        break;
      case 'down':
        addSwipeAction({
          jobId,
          actionType: 'blocked',
          timestamp: Date.now(),
          userId: user?.id,
        });
        showToast(`${job.isEvent ? 'Event' : 'Job'} blocked permanently`, 'warning');
        break;
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!currentJob || animatingOut) return;

    if (direction === 'right') {
      if (!user) {
        showToast('Please sign in to apply for jobs', 'warning');
        return;
      }
      if (user.points < currentJob.minimumPoints) {
        showToast(`You need ${currentJob.minimumPoints - user.points} more points to apply`, 'warning');
        return;
      }
    }

    setAnimatingOut(true);
    setPendingAction({
      jobId: currentJob.id,
      action: direction,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingOut(false);
    }, 300);
  };

  const handleUndo = () => {
    if (!pendingAction) return;

    setShowUndo(false);
    setPendingAction(null);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    showToast('Action undone', 'info');
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'left': return 'ignored';
      case 'right': return 'applied';
      case 'up': return 'saved';
      case 'down': return 'blocked';
      default: return '';
    }
  };

  if (filteredJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mb-6">
          <RotateCcw className="h-16 w-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No more jobs available</h3>
        <p className="text-gray-600 text-center max-w-md">
          You've reviewed all available jobs. Check back later for new opportunities or adjust your filters.
        </p>
      </div>
    );
  }

  if (currentIndex >= filteredJobs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gradient-to-r from-green-100 to-blue-100 w-32 h-32 rounded-full flex items-center justify-center mb-6">
          <RotateCcw className="h-16 w-16 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          You've reviewed all available jobs. Great work! Check your saved jobs or come back later for new opportunities.
        </p>
      </div>
    );
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your ignored job history? This action cannot be undone.')) {
      const { clearIgnoredHistory } = require('../lib/swipeStorage');
      clearIgnoredHistory();
      showToast('Ignored history cleared successfully', 'success');
      window.location.reload();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      showToast('Unable to toggle fullscreen mode', 'error');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col p-4' : ''}`}>
      <div className="mb-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold text-gray-700">
            {remainingCount} {remainingCount === 1 ? 'job' : 'jobs'} remaining
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Swipe Left: Ignore</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Swipe Up: Save</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Swipe Right: Apply</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Swipe Down: Block</span>
          </div>
        </div>
      </div>

      <div className={`relative ${isFullscreen ? 'flex-1 max-w-full' : 'h-[600px] max-w-2xl'} mx-auto`}>
        {filteredJobs.slice(currentIndex, currentIndex + 3).map((job, index) => {
          const scale = 1 - index * 0.05;
          const translateY = index * 10;
          const zIndex = 10 - index;

          return (
            <SwipeCard
              key={job.id}
              job={job}
              onSwipe={handleSwipe}
              isTop={index === 0}
              style={{
                zIndex,
                transform: `scale(${scale}) translateY(${translateY}px)`,
              }}
            />
          );
        })}
      </div>

      {showUndo && pendingAction && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 animate-slide-in">
          <span className="font-medium">
            Job {getActionText(pendingAction.action)}
          </span>
          <button
            onClick={handleUndo}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
