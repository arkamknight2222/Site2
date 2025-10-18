import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Search, Filter, CheckCircle, Clock, XCircle, DollarSign, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPurchases, filterPurchases, calculatePurchaseStats } from '../lib/purchaseApi';
import { Purchase, PurchaseStatus } from '../lib/types';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | PurchaseStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalAmountSpent: 0,
    totalPointsAcquired: 0,
    completedPurchases: 0,
  });

  useEffect(() => {
    if (user) {
      const userPurchases = getPurchases(user.id);
      setPurchases(userPurchases);
      setFilteredPurchases(userPurchases);
      setStats(calculatePurchaseStats(userPurchases));
    }
  }, [user]);

  useEffect(() => {
    const filters: any = { searchQuery };
    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }
    const filtered = filterPurchases(purchases, filters);
    setFilteredPurchases(filtered);
  }, [filterStatus, searchQuery, purchases]);

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refunded':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
        <p className="text-gray-600">
          View all your points purchases and transaction history
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPurchases}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.totalAmountSpent)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Points Acquired</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalPointsAcquired}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedPurchases}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase) => (
              <div key={purchase.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className="bg-blue-100 p-3 rounded-xl mr-4">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {purchase.packageName || `${purchase.pointsPurchased} Points`}
                        </h3>
                        <div className="flex items-center ml-3">
                          {getStatusIcon(purchase.status)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(purchase.purchaseDate)} ({formatRelativeTime(purchase.purchaseDate)})
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Transaction ID:</strong> {purchase.transactionId}</p>
                        <p><strong>Payment Method:</strong> {purchase.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(purchase.amountPaid)}
                      </p>
                      <p className="text-sm text-gray-600">{purchase.pointsPurchased} points</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : "You haven't made any purchases yet. Start by buying points to boost your applications!"}
              </p>
              {!searchQuery && (
                <Link
                  to="/tracker"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Points
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {filteredPurchases.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Need More Points?</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/tracker"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Buy More Points
            </Link>
            <Link
              to="/points-history"
              className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-center"
            >
              View Points Activity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
