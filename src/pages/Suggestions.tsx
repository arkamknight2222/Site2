import React, { useState } from 'react';
import { Target, Star, TrendingUp, MapPin, Clock, DollarSign, Users, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Suggestions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommended');

  const suggestedJobs = [
    {
      id: 's1',
      title: 'Frontend Developer',
      company: 'StartupX',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 80000, max: 120000 },
      match: 95,
      reasons: ['Matches your React skills', 'Remote work preference', 'Salary range fits your expectations'],
      minimumPoints: 80,
      urgent: false,
    },
    {
      id: 's2',
      title: 'Senior UI/UX Designer',
      company: 'Design Studios Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 100000, max: 150000 },
      match: 88,
      reasons: ['High demand in your area', 'Your design portfolio is strong', 'Company culture match'],
      minimumPoints: 120,
      urgent: true,
    },
    {
      id: 's3',
      title: 'Full Stack Developer',
      company: 'Tech Solutions',
      location: 'New York, NY',
      type: 'contract',
      salary: { min: 90000, max: 130000 },
      match: 82,
      reasons: ['Matches your full-stack experience', 'Contract work preference', 'Growing company'],
      minimumPoints: 100,
      urgent: false,
    },
  ];

  const careerTips = [
    {
      title: 'Optimize Your Profile for Better Matches',
      description: 'Complete your skills section and update your experience to get more relevant job suggestions.',
      action: 'Update Profile',
      link: '/profile',
      icon: Users,
    },
    {
      title: 'Earn More Points',
      description: 'Apply to more jobs to earn points, or purchase points to access premium job listings.',
      action: 'View Tracker',
      link: '/tracker',
      icon: Target,
    },
    {
      title: 'Attend Career Events',
      description: 'Network with industry professionals and discover hidden job opportunities at career events.',
      action: 'Browse Events',
      link: '/events',
      icon: Star,
    },
  ];

  const trendingSkills = [
    { skill: 'React', demand: 'High', growth: '+15%' },
    { skill: 'TypeScript', demand: 'High', growth: '+25%' },
    { skill: 'Python', demand: 'Very High', growth: '+20%' },
    { skill: 'AWS', demand: 'High', growth: '+18%' },
    { skill: 'Machine Learning', demand: 'Growing', growth: '+30%' },
  ];

  const canAffordJob = (minimumPoints: number) => {
    return (user?.points || 0) >= minimumPoints;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Suggestions</h1>
        <p className="text-gray-600">
          Personalized recommendations based on your profile and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recommended Jobs
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'tips'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Career Tips
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'trends'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Market Trends
          </button>
        </div>

        {/* Recommended Jobs Tab */}
        {activeTab === 'recommended' && (
          <div className="p-6">
            <div className="space-y-6">
              {suggestedJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">{job.title}</h3>
                        {job.urgent && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Why this job matches you:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {job.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className={`text-2xl font-bold mb-1 ${
                          job.match >= 90 ? 'text-green-600' :
                          job.match >= 80 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {job.match}%
                        </div>
                        <div className="text-sm text-gray-600">Match</div>
                      </div>
                      <div className="mb-4">
                        <div className={`text-lg font-bold ${canAffordJob(job.minimumPoints) ? 'text-green-600' : 'text-red-600'}`}>
                          {job.minimumPoints} pts
                        </div>
                        <div className="text-xs text-gray-500">Required</div>
                        {!canAffordJob(job.minimumPoints) && (
                          <div className="text-xs text-red-500 mt-1">
                            Need {job.minimumPoints - (user?.points || 0)} more
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/job/${job.id}`}
                        className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          canAffordJob(job.minimumPoints)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAffordJob(job.minimumPoints) ? 'View Job' : 'Need Points'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Tips Tab */}
        {activeTab === 'tips' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careerTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{tip.title}</h3>
                    <p className="text-gray-600 mb-4">{tip.description}</p>
                    <Link
                      to={tip.link}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {tip.action}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">75%</div>
                  <div className="text-sm text-gray-600">Profile Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{user?.points || 0}</div>
                  <div className="text-sm text-gray-600">Points Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600">Applications Sent</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Trends Tab */}
        {activeTab === 'trends' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Skills in Your Field</h3>
              <div className="space-y-4">
                {trendingSkills.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.skill}</h4>
                      <p className="text-sm text-gray-600">Market Demand: {item.demand}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 font-semibold">{item.growth}</span>
                      </div>
                      <div className="text-xs text-gray-500">YoY Growth</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Market Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Average Salary Range</h4>
                  <p className="text-2xl font-bold text-blue-600">$85K - $135K</p>
                  <p className="text-sm text-gray-600">For your experience level</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Job Market Activity</h4>
                  <p className="text-2xl font-bold text-green-600">+22%</p>
                  <p className="text-sm text-gray-600">Increase in job postings</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}