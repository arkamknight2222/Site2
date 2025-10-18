import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Calendar, Target, Zap, Star, TrendingUp, TrendingDown, ArrowRight, Upload, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import PointsDisplay from '../components/PointsDisplay';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { 
      title: 'Applications Sent', 
      value: '12', 
      icon: Target, 
      color: 'blue' as const,
      trend: { value: '+3 this week', isPositive: true }
    },
    { 
      title: 'Points Available', 
      value: user?.points || 0, 
      icon: Zap, 
      color: 'green' as const,
      description: 'Ready to use'
    },
    { 
      title: 'Profile Views', 
      value: '48', 
      icon: Users, 
      color: 'purple' as const,
      trend: { value: '+12 this week', isPositive: true }
    },
    { 
      title: 'Events Attended', 
      value: '3', 
      icon: Calendar, 
      color: 'orange' as const,
      description: 'This month'
    },
  ];

  const recentActivity = [
    { action: 'Applied to Senior Developer position at TechCorp', date: '2 hours ago', type: 'application' },
    { action: 'Earned 10 points for completing profile', date: '1 day ago', type: 'points' },
    { action: 'Registered for Tech Career Fair 2025', date: '2 days ago', type: 'event' },
    { action: 'Profile viewed by Growth Labs recruiter', date: '3 days ago', type: 'view' },
  ];

  const recentPointsHistory = [
    {
      id: '1',
      type: 'earned',
      amount: 10,
      description: 'Applied to Senior Frontend Developer',
      date: '2 hours ago',
      category: 'application',
    },
    {
      id: '2',
      type: 'spent',
      amount: -25,
      description: 'Added points boost to application',
      date: '1 day ago',
      category: 'boost',
    },
    {
      id: '3',
      type: 'earned',
      amount: 50,
      description: 'Profile completion bonus',
      date: '2 days ago',
      category: 'bonus',
    },
    {
      id: '4',
      type: 'earned',
      amount: 10,
      description: 'Registered for Tech Career Fair',
      date: '3 days ago',
      category: 'event',
    },
  ];

  const getPointsIcon = (category: string) => {
    switch (category) {
      case 'application':
        return '📝';
      case 'boost':
        return '🚀';
      case 'bonus':
        return '🎁';
      case 'event':
        return '📅';
      case 'purchase':
        return '💳';
      default:
        return '⭐';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          return <StatsCard key={stat.title} {...stat} />;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/jobs"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 hover:from-blue-100 hover:to-purple-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  Browse Jobs
                </span>
              </Link>
              <Link
                to="/tracker"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 hover:from-green-100 hover:to-blue-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                  Track Applications
                </span>
              </Link>
              <Link
                to="/events"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                  Find Events
                </span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 hover:from-orange-100 hover:to-red-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                  Update Profile
                </span>
              </Link>
              <Link
                to="/resume"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 hover:from-cyan-100 hover:to-blue-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg mr-3">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
                  Resume Manager
                </span>
              </Link>
              <Link
                to="/purchase-history"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all group"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                  Purchase History
                </span>
              </Link>
            </div>
          </div>

          {/* Points Status */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white mb-6">
            <PointsDisplay showDetails={false} />
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/tracker"
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm inline-block text-center"
              >
                Manage Points
              </Link>
              <Link
                to="/purchase-history"
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm inline-block text-center"
              >
                View Purchases
              </Link>
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Quick Tip</h3>
            <p className="text-blue-700 text-sm">
              Apply to more jobs to earn points automatically, or purchase points to access premium listings with higher visibility.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link to="/tracker" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'application' ? 'bg-blue-100' :
                      activity.type === 'points' ? 'bg-green-100' :
                      activity.type === 'event' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {activity.type === 'application' && <Target className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'points' && <Zap className="h-4 w-4 text-green-600" />}
                      {activity.type === 'event' && <Calendar className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'view' && <Users className="h-4 w-4 text-orange-600" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-sm mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Points Activity</h2>
              <Link 
                to="/points-history" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                View Full History
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPointsHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-xl mr-3">
                      {getPointsIcon(item.category)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {item.type === 'earned' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`font-bold text-sm ${
                      item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Current Balance:</span>
                <span className="text-blue-900 font-bold text-lg">{user?.points || 0} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}