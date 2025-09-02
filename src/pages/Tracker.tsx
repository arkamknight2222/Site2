import React, { useState } from 'react';
import { BarChart3, MessageCircle, Zap, Target, Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applicationService, Application } from '../services/applicationService';
import { pointsService } from '../services/pointsService';

export default function Tracker() {
  const { user, updateUser } = useAuth();
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showRemovePointsModal, setShowRemovePointsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);

  // Load applications from database
  React.useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    const applicationsData = await applicationService.getUserApplications(user.id);
    setApplications(applicationsData);
  };

  const handleBuyPoints = async () => {
    if (!user) return;
    
    const pointsToAdd = 100;
    const cost = 9.99;
    
    const success = await pointsService.purchasePoints(user.id, pointsToAdd, cost);
    
    if (success) {
      const currentPoints = user.points || 0;
      updateUser({ points: currentPoints + pointsToAdd });
      setShowPointsModal(false);
      alert(`Successfully purchased ${pointsToAdd} points!`);
    } else {
      alert('Failed to purchase points. Please try again.');
    }
  };

  const handleAddPoints = async (pointsToAdd: number) => {
    if (!selectedApplication) return;
    
    const currentUserPoints = user?.points || 0;
    if (currentUserPoints < pointsToAdd) {
      alert('You don\'t have enough points!');
      return;
    }

    const application = applications.find(app => app.id === selectedApplication);
    if (!application) return;

    // Update application points in database
    const success = await applicationService.updateApplicationPoints(
      selectedApplication,
      pointsToAdd,
      user.id
    );

    if (success) {
      // Update user points (deduct)
      const newUserPoints = currentUserPoints - pointsToAdd;
      await pointsService.updateUserPoints(user.id, newUserPoints);
      updateUser({ points: newUserPoints });

      // Add points transaction
      await pointsService.addPointsTransaction(
        user.id,
        'spent',
        -pointsToAdd,
        `Added points boost to ${application.job?.title || 'application'}`,
        'boost',
        application.jobId
      );

      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApplication 
            ? { ...app, addedPoints: app.addedPoints + pointsToAdd }
            : app
        )
      );

      setShowAddPointsModal(false);
      setSelectedApplication(null);
      alert(`Successfully added ${pointsToAdd} points to your application!`);
    } else {
      alert('Failed to add points. Please try again.');
    }
  };

  const handleRemovePoints = async (pointsToRemove: number) => {
    if (!selectedApplication) return;
    
    const application = applications.find(app => app.id === selectedApplication);
    if (!application || application.addedPoints < pointsToRemove) {
      alert('Cannot remove more points than you have added!');
      return;
    }

    // Update application points in database (remove points)
    const success = await applicationService.updateApplicationPoints(
      selectedApplication,
      -pointsToRemove,
      user.id
    );

    if (success) {
      const currentUserPoints = user?.points || 0;
      
      // Update user points (refund)
      const newUserPoints = currentUserPoints + pointsToRemove;
      await pointsService.updateUserPoints(user.id, newUserPoints);
      updateUser({ points: newUserPoints });

      // Add points transaction
      await pointsService.addPointsTransaction(
        user.id,
        'earned',
        pointsToRemove,
        `Removed points boost from ${application.job?.title || 'application'}`,
        'refund',
        application.jobId
      );

      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApplication 
            ? { ...app, addedPoints: app.addedPoints - pointsToRemove }
            : app
        )
      );

      setShowRemovePointsModal(false);
      setSelectedApplication(null);
      alert(`Successfully removed ${pointsToRemove} points from your application!`);
    } else {
      alert('Failed to remove points. Please try again.');
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'interviewed':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPointsUsed = applications.reduce((sum, app) => sum + app.pointsUsed, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Tracker</h1>
        <p className="text-gray-600">
          Monitor your job applications and manage your points effectively.
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Available Points</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{user?.points || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Points Used</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalPointsUsed}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">25%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowPointsModal(true)}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center"
          >
            <Zap className="h-5 w-5 mr-2" />
            Buy Points
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {applications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {application.job?.title || 'Unknown Job'}
                      </h3>
                      <p className="text-gray-600">{application.job?.company || 'Unknown Company'}</p>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(application.status)}
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                  {application.response && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium mb-1">Company Response:</p>
                      <p className="text-sm text-gray-600">{application.response}</p>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium mb-2">Points Information:</p>
                        <div className="text-sm text-blue-600 font-semibold">
                          {application.addedPoints}/{application.job?.minimumPoints || 0} points
                        </div>
                      </div>
                      {application.addedPoints === 0 ? (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium flex items-center">
                          No Boost Applied
                        </span>
                      ) : application.addedPoints < (application.job?.minimumPoints || 0) ? (
                        <span className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium flex items-center">
                          Not Enough
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium flex items-center">
                          Boost Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 space-y-2 flex flex-col items-center">
                  <button
                    onClick={() => setShowConversationModal(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Direct Message
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application.id);
                      setShowAddPointsModal(true);
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add Points
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application.id);
                      setShowRemovePointsModal(true);
                    }}
                    disabled={application.addedPoints === 0}
                    className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center ${
                      application.addedPoints === 0
                        ? 'w-full bg-gray-300 text-gray-500 cursor-not-allowed justify-center'
                        : 'w-full bg-red-600 text-white hover:bg-red-700 justify-center'
                    }`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Remove Points
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buy Points</h2>
            <p className="text-gray-600 mb-6">
              Purchase points to apply for more jobs and increase your visibility.
            </p>
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">100 Points</p>
                    <p className="text-sm text-gray-600">Perfect for 1-2 premium applications</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">$9.99</p>
                </div>
              </div>
              <div className="border border-blue-500 bg-blue-50 rounded-lg p-4 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">500 Points</p>
                    <p className="text-sm text-gray-600">Best value for serious job seekers</p>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Most Popular</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">$39.99</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBuyPoints}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Purchase
              </button>
              <button
                onClick={() => setShowPointsModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Points Modal */}
      {showRemovePointsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Remove Points from Application</h2>
            <p className="text-gray-600 mb-6">
              Remove points from your application. The points will be refunded to your account.
            </p>
            {(() => {
              const application = applications.find(app => app.id === selectedApplication);
              const maxRemovable = application?.addedPoints || 0;
              
              if (maxRemovable === 0) {
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                      No points have been added to this application yet.
                    </p>
                  </div>
                );
              }
              
              const removeOptions = [];
              if (maxRemovable >= 25) removeOptions.push(25);
              if (maxRemovable >= 50) removeOptions.push(50);
              if (maxRemovable >= 100) removeOptions.push(100);
              if (!removeOptions.includes(maxRemovable)) removeOptions.push(maxRemovable);
              
              return (
                <div className="space-y-4 mb-6">
                  {removeOptions.map(points => (
                    <div 
                      key={points}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-500 cursor-pointer transition-colors"
                      onClick={() => handleRemovePoints(points)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{points} Points</p>
                          <p className="text-sm text-gray-600">
                            {points === maxRemovable ? 'Remove all added points' : 'Partial removal'}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-red-600">-{points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Points added to this application:</strong> {applications.find(app => app.id === selectedApplication)?.addedPoints || 0}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemovePointsModal(false);
                  setSelectedApplication(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Points Modal */}
      {showAddPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Points to Application</h2>
            <p className="text-gray-600 mb-6">
              Add more points to boost your application visibility and increase your chances of being noticed.
            </p>
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition-colors"
                   onClick={() => handleAddPoints(25)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">25 Points</p>
                    <p className="text-sm text-gray-600">Small boost to visibility</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">25 pts</p>
                </div>
              </div>
              <div className="border border-green-500 bg-green-50 rounded-lg p-4 cursor-pointer"
                   onClick={() => handleAddPoints(50)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">50 Points</p>
                    <p className="text-sm text-gray-600">Significant visibility boost</p>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Recommended</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">50 pts</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition-colors"
                   onClick={() => handleAddPoints(100)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">100 Points</p>
                    <p className="text-sm text-gray-600">Maximum visibility boost</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">100 pts</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Your available points:</strong> {user?.points || 0}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPointsModal(false);
                  setSelectedApplication(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Conversations Modal */}
      {showConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full h-96 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Direct Messages</h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-1">TechCorp Inc.</p>
                  <p className="text-sm text-gray-600">We've received your application and are reviewing it. We'll be in touch soon!</p>
                  <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-1">Growth Labs</p>
                  <p className="text-sm text-gray-600">Thank you for your interest in our Marketing Specialist position. Can you tell us more about your experience with digital marketing?</p>
                  <p className="text-xs text-gray-400 mt-2">1 day ago</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowConversationModal(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}