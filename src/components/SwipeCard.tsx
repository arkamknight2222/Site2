import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, Star, Zap, ExternalLink, X, Bookmark, Send, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

interface SwipeCardProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  style?: React.CSSProperties;
  isTop?: boolean;
  isFullscreen?: boolean;
}

export default function SwipeCard({ job, onSwipe, style = {}, isTop = false, isFullscreen = false }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const canAfford = !user || user.points >= job.minimumPoints;

  const SWIPE_THRESHOLD = 100;

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleEnd = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);

    const absX = Math.abs(dragOffset.x);
    const absY = Math.abs(dragOffset.y);

    if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
      if (absX > absY) {
        onSwipe(dragOffset.x > 0 ? 'right' : 'left');
      } else {
        onSwipe(dragOffset.y > 0 ? 'down' : 'up');
      }
    }

    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveGlobal = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const handleMouseUpGlobal = () => handleEnd();

      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);

      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDragging, dragStart]);

  const rotation = isDragging ? (dragOffset.x / 20) : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) / 500) : 1;

  let overlayColor = '';
  let overlayText = '';
  let overlayIcon = null;
  const absX = Math.abs(dragOffset.x);
  const absY = Math.abs(dragOffset.y);

  if (isDragging && (absX > 30 || absY > 30)) {
    if (absX > absY) {
      if (dragOffset.x > 0) {
        overlayColor = 'bg-green-500';
        overlayText = 'APPLY';
        overlayIcon = <Send className="h-16 w-16" />;
      } else {
        overlayColor = 'bg-red-500';
        overlayText = 'IGNORE';
        overlayIcon = <X className="h-16 w-16" />;
      }
    } else {
      if (dragOffset.y > 0) {
        overlayColor = 'bg-orange-500';
        overlayText = 'BLOCK';
        overlayIcon = <Ban className="h-16 w-16" />;
      } else {
        overlayColor = 'bg-yellow-500';
        overlayText = 'SAVE';
        overlayIcon = <Bookmark className="h-16 w-16" />;
      }
    }
  }

  return (
    <div
      ref={cardRef}
      className={`${isFullscreen ? 'fixed inset-0 rounded-none' : 'absolute w-full rounded-2xl'} bg-white shadow-2xl border border-gray-200 overflow-hidden select-none ${
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
      style={{
        ...(!isFullscreen ? style : {}),
        transform: isFullscreen ? 'none' : `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity: isFullscreen ? 1 : opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
        height: isFullscreen ? '100vh' : '600px',
        minHeight: isFullscreen ? '100vh' : '600px',
        maxHeight: isFullscreen ? '100vh' : '600px',
        zIndex: isFullscreen ? 9999 : style.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {overlayColor && (
        <div className={`absolute inset-0 ${overlayColor} bg-opacity-80 flex flex-col items-center justify-center text-white z-10 transition-opacity`}>
          {overlayIcon}
          <p className="text-3xl font-bold mt-4">{overlayText}</p>
        </div>
      )}

      <div className={`${isFullscreen ? 'p-8' : 'p-6'} h-full overflow-y-auto pb-28`}>
        {job.featured && (
          <div className="mb-4 flex items-center justify-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Featured {job.isEvent ? 'Event' : 'Job'}
            </span>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
        <Link
          to={`/company/${encodeURIComponent(job.company)}`}
          className="text-xl text-gray-700 font-medium mb-4 hover:text-blue-600 transition-colors inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          {job.company}
        </Link>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-sm text-gray-700">{job.location}</span>
          </div>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-sm text-gray-700">
              {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
            </span>
          </div>
          {!job.isEvent && (
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
              <DollarSign className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Users className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-sm text-gray-700">
              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">
              Need {job.minimumPoints - (user?.points || 0)} more points to apply
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.minimumPoints > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Minimum Boost Point Spend</span>
              <div className={`flex items-center text-lg font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                <Zap className="h-5 w-5 mr-1" />
                {job.minimumPoints}
              </div>
            </div>
          </div>
        )}

        <Link
          to={job.isEvent ? `/event/${job.id}` : `/job/${job.id}`}
          className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          View Full Details
        </Link>
      </div>

      {isTop && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('left');
            }}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all"
            title="Ignore"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('down');
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all"
            title="Block"
          >
            <Ban className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('up');
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-all"
            title="Save"
          >
            <Bookmark className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canAfford) onSwipe('right');
            }}
            className={`${
              canAfford
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            } text-white p-4 rounded-full shadow-lg transition-all`}
            title="Apply"
            disabled={!canAfford}
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
