import React, { useState } from 'react';
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Calendar, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PointsHistory() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'spent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock points history data
  const pointsHistory = [
    {
      id: '1',
      type: 'earned',
      amount: 10,
      description: 'Applied to Senior Frontend Developer at TechCorp Inc.',
      date: '2025-01-08T14:30:00Z',
      category: 'application',
    },
    {
      id: '2',
      type: 'spent',
      amount: -25,
      description: 'Added points boost to Marketing Specialist application',
      date: '2025-01-08T10:15:00Z',
      category: 'boost',
    },
    {
      id: '3',
      type: 'earned',
      amount: 50,
      description: 'Profile completion bonus',
      date: '2025-01-07T16:45:00Z',
      category: 'bonus',
    },
    {
      id: '4',
      type: 'earned',
      amount: 10,
      description: 'Registered for Tech Career Fair 2025',
      date: '2025-01-07T09:20:00Z',
      category: 'event',
    },
    {
      id: '5',
      type: 'spent',
      amount: -50,
      description: 'Added points boost to Data Analyst application',
      date: '2025-01-06T13:10:00Z',
      category: 'boost',
    },
    {
      id: '6',
      type: 'earned',
      amount: 100,
      description: 'Purchased points package',
      date: '2025-01-06T11:30:00Z',
      category: 'purchase',
    },
    {
      id: '7',
      type: 'earned',
      amount: 10,
      description: 'Applied to UX Designer at Creative Studios',
      date: '2025-01-05T15:45:00Z',
      category: 'application',
    },
    {
      id: '8',
      type: 'earned',
      amount: 50,
      description: 'Welcome bonus for new members',
      date: '2025-01-05T08:00:00Z',
      category: 'bonus',
    },
  ];

  const filteredHistory = pointsHistory.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchQuery === '' || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEarned = pointsHistory
    .filter(item => item.type === 'earned')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpent = Math.abs(pointsHistory
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0));

  const getIcon = (category: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Points History</h1>
        <p className="text-gray-600">
          Track all your points earnings and spending activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{user?.points || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earned</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalEarned}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totalSpent}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('earned')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'earned'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Earned
              </button>
              <button
                onClick={() => setFilterType('spent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'spent'
                    ? 'bg-red-100 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Spent
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">
                      {getIcon(item.category)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'earned' ? '+' : ''}{item.amount}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {item.category}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'Your points activity will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/tracker"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Buy More Points
          </Link>
          <Link
            to="/jobs"
            className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-center"
          >
            Browse Jobs to Earn Points
          </Link>
        </div>
      </div>
    </div>
  );
}