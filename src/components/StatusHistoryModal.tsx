import React from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import { getStatusHistory, StatusHistoryEntry } from '../lib/statusHistoryApi';
import { STATUS_CONFIG } from '../lib/types';

interface StatusHistoryModalProps {
  applicationId: string;
  applicationTitle: string;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes === 1) return '1 minute ago';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

export default function StatusHistoryModal({ applicationId, applicationTitle, onClose }: StatusHistoryModalProps) {
  const history = getStatusHistory(applicationId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Status History</h2>
            <p className="text-sm text-gray-600 mt-1">{applicationTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="relative pl-8 pb-6">
                  {index !== history.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className="absolute left-0 top-0 bg-white">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Changed from</span>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[entry.old_status]?.bgColor} ${STATUS_CONFIG[entry.old_status]?.color}`}
                        >
                          {STATUS_CONFIG[entry.old_status]?.label || entry.old_status}
                        </span>
                        <span className="text-sm text-gray-500">to</span>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[entry.new_status]?.bgColor} ${STATUS_CONFIG[entry.new_status]?.color}`}
                        >
                          {STATUS_CONFIG[entry.new_status]?.label || entry.new_status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(entry.changed_at)}
                    </div>
                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Note:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No status changes recorded yet</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
