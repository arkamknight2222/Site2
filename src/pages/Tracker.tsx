import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, MessageCircle, Zap, Target, Calendar, CheckCircle, XCircle, Clock, Search, X, MessageSquare, Bookmark, Ban, History, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMessages, Message, sendMessage as sendMessageApi } from '../lib/messagesApi';
import { updateMessage, deleteMessage } from '../lib/localMessagesApi';
import MessageBubble from '../components/MessageBubble';
import { createPurchase, savePurchase } from '../lib/purchaseApi';
import { addPointsHistoryEntry } from '../lib/pointsHistoryApi';
import { useJobs } from '../context/JobContext';
import {
  getSavedJobs,
  getBlockedJobs,
  getIgnoredJobs,
  getAppliedJobs,
  unblockJob,
  clearIgnoredHistory,
  removeSwipeAction,
} from '../lib/swipeStorage';
import StatusHistoryModal from '../components/StatusHistoryModal';

interface ApplicantMessageModalProps {
  application: any;
  onClose: () => void;
}

function ApplicantMessageModal({ application, onClose }: ApplicantMessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isScrolledToBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    loadMessages();
  }, [application.jobId, application.applicantId]);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      scrollToBottom();
    }
  }, [loading]);

  const loadMessages = async () => {
    setLoading(true);
    const fetchedMessages = await getMessages(application.jobId, application.applicantId);
    setMessages(fetchedMessages);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const message = sendMessageApi(
      application.jobId,
      application.applicantId,
      'applicant',
      application.applicantId,
      messageText
    );

    if (message) {
      setMessageText('');
      showToast('Message sent!', 'success');
      const wasScrolledToBottom = isScrolledToBottom();
      await loadMessages();

      if (wasScrolledToBottom) {
        setTimeout(scrollToBottom, 100);
      }
    } else {
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  const handleCopy = (content: string) => {
    showToast('Message copied to clipboard!', 'success');
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    const success = updateMessage(messageId, newContent);
    if (success) {
      showToast('Message updated!', 'success');
      await loadMessages();
    } else {
      showToast('Failed to update message', 'error');
    }
  };

  const handleDelete = async (messageId: string) => {
    const success = deleteMessage(messageId, application.applicantId);
    if (success) {
      showToast('Message deleted', 'success');
      await loadMessages();
    } else {
      showToast('Failed to delete message', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[80vh]">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Direct Message</h2>
            <p className="text-sm text-gray-600 mt-1">Conversation with {application.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_type === 'applicant'}
                  senderName={message.sender_type === 'applicant' ? 'You' : application.company}
                  onCopy={handleCopy}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLastMessage={index === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Press Enter to send, Shift+Enter for new line</p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tracker() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { jobs, events } = useJobs();
  const [activeTab, setActiveTab] = useState<'applied' | 'saved' | 'history' | 'blocked'>('applied');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showRemovePointsModal, setShowRemovePointsModal] = useState(false);
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [selectedApplicationForMessage, setSelectedApplicationForMessage] = useState<any>(null);
  const [selectedApplicationForStatusHistory, setSelectedApplicationForStatusHistory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [applications, setApplications] = useState([
    {
      id: '1',
      jobId: 'job-1',
      applicantId: 'applicant-123',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      appliedDate: '2025-01-08',
      status: 'pending',
      pointsUsed: 100,
      addedPoints: 0,
      minimumPoints: 120,
      response: null,
      hasDirectMessage: false,
    },
    {
      id: '2',
      jobId: 'job-2',
      applicantId: 'applicant-123',
      jobTitle: 'Marketing Specialist',
      company: 'Growth Labs',
      appliedDate: '2025-01-07',
      status: 'interviewed',
      pointsUsed: 75,
      addedPoints: 25,
      minimumPoints: 100,
      response: 'Thank you for your application. We\'d like to schedule an interview.',
      hasDirectMessage: true,
    },
    {
      id: '3',
      jobId: 'job-3',
      applicantId: 'applicant-123',
      jobTitle: 'Data Analyst',
      company: 'Data Solutions LLC',
      appliedDate: '2025-01-06',
      status: 'rejected',
      pointsUsed: 80,
      addedPoints: 0,
      minimumPoints: 90,
      response: 'Thank you for your interest. We have decided to move forward with another candidate.',
      hasDirectMessage: true,
    },
    {
      id: '4',
      jobId: 'job-4',
      applicantId: 'applicant-123',
      jobTitle: 'UX Designer',
      company: 'Creative Studios',
      appliedDate: '2025-01-05',
      status: 'accepted',
      pointsUsed: 90,
      addedPoints: 30,
      minimumPoints: 110,
      response: 'Congratulations! We would like to offer you the position.',
      hasDirectMessage: true,
    },
  ]);

  const handleBuyPoints = (pointsToAdd: number, amountPaid: number, packageName: string) => {
    if (!user) return;

    const currentPoints = user.points || 0;
    updateUser({ points: currentPoints + pointsToAdd });

    const purchase = createPurchase(user.id, pointsToAdd, amountPaid, packageName);
    const saved = savePurchase(purchase);

    if (saved) {
      // Add to points history
      addPointsHistoryEntry({
        type: 'earned',
        amount: pointsToAdd,
        description: `Purchased ${packageName}`,
        category: 'purchase',
        userId: user.id,
      });

      setShowPointsModal(false);
      showToast(`Successfully purchased ${pointsToAdd} points!`, 'success');
    } else {
      showToast('Purchase completed but failed to save transaction history', 'error');
      setShowPointsModal(false);
    }
  };

  const handleAddPoints = (pointsToAdd: number) => {
    if (!selectedApplication || !user) return;

    const currentUserPoints = user.points || 0;
    if (currentUserPoints < pointsToAdd) {
      showToast('You don\'t have enough points!', 'error');
      return;
    }

    const application = applications.find(app => app.id === selectedApplication);
    if (!application) return;

    // Update user points (deduct)
    updateUser({ points: currentUserPoints - pointsToAdd });

    // Add to points history
    addPointsHistoryEntry({
      type: 'spent',
      amount: -pointsToAdd,
      description: `Boosted application for ${application.jobTitle} at ${application.company}`,
      category: 'boost',
      userId: user.id,
    });

    // Update application with added points
    setApplications(prevApps =>
      prevApps.map(app =>
        app.id === selectedApplication
          ? { ...app, addedPoints: app.addedPoints + pointsToAdd }
          : app
      )
    );

    setShowAddPointsModal(false);
    setSelectedApplication(null);
    showToast(`Successfully added ${pointsToAdd} points to your application!`, 'success');
  };

  const handleRemovePoints = (pointsToRemove: number) => {
    if (!selectedApplication || !user) return;

    const application = applications.find(app => app.id === selectedApplication);
    if (!application || application.addedPoints < pointsToRemove) {
      showToast('Cannot remove more points than you have added!', 'error');
      return;
    }

    const currentUserPoints = user.points || 0;

    // Update user points (refund)
    updateUser({ points: currentUserPoints + pointsToRemove });

    // Add to points history
    addPointsHistoryEntry({
      type: 'earned',
      amount: pointsToRemove,
      description: `Refunded ${pointsToRemove} points from ${application.jobTitle} at ${application.company}`,
      category: 'refund',
      userId: user.id,
    });

    // Update application with removed points
    setApplications(prevApps =>
      prevApps.map(app =>
        app.id === selectedApplication
          ? { ...app, addedPoints: app.addedPoints - pointsToRemove }
          : app
      )
    );

    setShowRemovePointsModal(false);
    setSelectedApplication(null);
    showToast(`Successfully removed ${pointsToRemove} points from your application!`, 'success');
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

  const allJobsAndEvents = [...jobs, ...events];
  const savedJobIds = getSavedJobs();
  const blockedJobIds = getBlockedJobs();
  const ignoredJobIds = getIgnoredJobs();
  const appliedJobIds = getAppliedJobs();

  const filterJobsBySearch = (items: any[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.company.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  };

  const savedItems = filterJobsBySearch(allJobsAndEvents.filter(item => savedJobIds.includes(item.id)));
  const blockedItems = filterJobsBySearch(allJobsAndEvents.filter(item => blockedJobIds.includes(item.id)));
  const ignoredItems = filterJobsBySearch(allJobsAndEvents.filter(item => ignoredJobIds.includes(item.id)));

  const handleUnblock = (jobId: string) => {
    unblockJob(jobId);
    showToast('Job unblocked successfully', 'success');
  };

  const handleClearHistory = () => {
    clearIgnoredHistory();
    showToast('Ignored history cleared', 'success');
  };

  const handleRestoreIgnored = (jobId: string) => {
    removeSwipeAction(jobId, 'ignored');
    showToast('Job restored', 'success');
  };

  const handleUnsave = (jobId: string) => {
    removeSwipeAction(jobId, 'saved');
    showToast('Job removed from saved', 'success');
  };

  const handleDeleteApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    if (window.confirm(`Are you sure you want to delete the application for ${application.jobTitle} at ${application.company}?`)) {
      setApplications(applications.filter(app => app.id !== applicationId));
      showToast('Application deleted successfully', 'success');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.jobTitle.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Tracker</h1>
        <p className="text-gray-600">
          Monitor your job applications and manage your swipe history.
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
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center"
          >
            <Zap className="h-5 w-5 mr-2" />
            Buy Points
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabs centered */}
      <div className="mb-6 flex justify-center">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('applied')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'applied'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            Applied
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-600'
            }`}
          >
            <Bookmark className="h-5 w-5" />
            Saved ({savedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-600'
            }`}
          >
            <History className="h-5 w-5" />
            History ({ignoredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'blocked'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
            }`}
          >
            <Ban className="h-5 w-5" />
            Blocked ({blockedItems.length})
          </button>
        </div>
      </div>

      {activeTab === 'applied' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
          </div>
          <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link
                        to={`/job/${application.jobId}`}
                        className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors inline-block"
                      >
                        {application.jobTitle}
                      </Link>
                      <Link
                        to={`/company/${encodeURIComponent(application.company)}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors block mt-1"
                      >
                        {application.company}
                      </Link>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(application.status)}
                      <button
                        onClick={() => {
                          setSelectedApplicationForStatusHistory(application);
                          setShowStatusHistoryModal(true);
                        }}
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                        title="View status history"
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    Applied on {new Date(application.appliedDate).toLocaleDateString()}
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
                          {application.addedPoints}/{application.minimumPoints} points
                        </div>
                      </div>
                      {application.addedPoints === 0 ? (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium flex items-center">
                          No Boost Applied
                        </span>
                      ) : application.addedPoints < application.minimumPoints ? (
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
                    onClick={() => {
                      setSelectedApplicationForMessage(application);
                      setShowConversationModal(true);
                    }}
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
                  <button
                    onClick={() => handleDeleteApplication(application.id)}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
          </div>
          {savedItems.length === 0 ? (
            <div className="p-12 text-center">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs</h3>
              <p className="text-gray-600">Jobs you save will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {savedItems.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <button
                      onClick={() => handleUnsave(job.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Ignored Jobs</h2>
            {ignoredItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Clear History
              </button>
            )}
          </div>
          {ignoredItems.length === 0 ? (
            <div className="p-12 text-center">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No ignored jobs</h3>
              <p className="text-gray-600">Jobs you ignore in swipe mode will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ignoredItems.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreIgnored(job.id)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Blocked Jobs</h2>
          </div>
          {blockedItems.length === 0 ? (
            <div className="p-12 text-center">
              <Ban className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blocked jobs</h3>
              <p className="text-gray-600">Jobs you block will never appear again unless unblocked here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {blockedItems.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(job.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buy Points</h2>
            <p className="text-gray-600 mb-6">
              Purchase points to apply for more jobs and increase your visibility.
            </p>
            <div className="space-y-4 mb-6">
              <div
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => handleBuyPoints(100, 9.99, '100 Points Package')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">100 Points</p>
                    <p className="text-sm text-gray-600">Perfect for 1-2 premium applications</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">$9.99</p>
                </div>
              </div>
              <div
                className="border border-blue-500 bg-blue-50 rounded-lg p-4 cursor-pointer"
                onClick={() => handleBuyPoints(500, 39.99, '500 Points Package')}
              >
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
      {showConversationModal && selectedApplicationForMessage && (
        <ApplicantMessageModal
          application={selectedApplicationForMessage}
          onClose={() => {
            setShowConversationModal(false);
            setSelectedApplicationForMessage(null);
          }}
        />
      )}
      {/* Status History Modal */}
      {showStatusHistoryModal && selectedApplicationForStatusHistory && (
        <StatusHistoryModal
          applicationId={selectedApplicationForStatusHistory.id}
          applicationTitle={`${selectedApplicationForStatusHistory.jobTitle} at ${selectedApplicationForStatusHistory.company}`}
          onClose={() => {
            setShowStatusHistoryModal(false);
            setSelectedApplicationForStatusHistory(null);
          }}
        />
      )}
    </div>
  );
}