import React from 'react';
import { Zap, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PointsDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export default function PointsDisplay({ showDetails = false, className = '' }: PointsDisplayProps) {
  const { user } = useAuth();

  if (!user) return null;

  const pointsColor = user.points >= 100 ? 'text-green-600' : user.points >= 50 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = user.points >= 100 ? 'bg-green-100' : user.points >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className={`${className}`}>
      {showDetails ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Points</h3>
            <Zap className={`h-5 w-5 ${pointsColor}`} />
          </div>
          <div className={`text-3xl font-bold ${pointsColor} mb-2`}>
            {user.points}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {user.points >= 100 ? 'Excellent! You can apply to premium jobs' :
             user.points >= 50 ? 'Good! You can apply to most jobs' :
             'Consider earning more points for better opportunities'}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Target className="h-3 w-3 mr-1" />
              <span>Applications: 12</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>This week: +25</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${bgColor} ${pointsColor} px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
          <Zap className="h-4 w-4 mr-1" />
          {user.points} points
        </div>
      )}
    </div>
  );
}