import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { ApplicationStatus, STATUS_CONFIG } from '../lib/types';
import { getStatusHistory, StatusHistoryEntry } from '../lib/statusHistoryApi';

interface StatusChangeConfirmationProps {
  isOpen: boolean;
  applicantName: string;
  applicationId: string;
  currentStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StatusChangeConfirmation({
  isOpen,
  applicantName,
  applicationId,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel
}: StatusChangeConfirmationProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadStatusHistory();
    }
  }, [isOpen, applicationId]);

  const loadStatusHistory = () => {
    setLoadingHistory(true);
    const history = getStatusHistory(applicationId);
    setStatusHistory(history);
    setLoadingHistory(false);
  };

  if (!isOpen) return null;

  const getStatusChangeMessage = () => {
    const messages: Record<ApplicationStatus, string> = {
      applicant: 'This will move the applicant back to the initial application pool.',
      interested: 'This indicates you have reviewed the application and are interested in proceeding.',
      in_review: 'The application is being actively reviewed by your team.',
      interviewing: 'The applicant will be marked as currently in the interview process.',
      interviewed: 'This indicates that all interviews have been completed.',
      offer_extended: 'An official job offer has been sent to this candidate.',
      accepted: 'The candidate has accepted your job offer.',
      rejected: 'The application will be marked as rejected. This action may notify the applicant.',
      waitlisted: 'The candidate will be placed on the waitlist for future consideration.'
    };
    return messages[newStatus];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Confirm Status Change</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Applicant:</p>
            <p className="text-lg font-bold text-gray-900">{applicantName}</p>
          </div>

          <div className="flex items-center justify-center space-x-3 py-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1 text-center">Current Status</p>
              <div className="flex justify-center">
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold ${STATUS_CONFIG[currentStatus].bgColor} ${STATUS_CONFIG[currentStatus].color}`}>
                  {STATUS_CONFIG[currentStatus].label}
                </span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1 text-center">New Status</p>
              <div className="flex justify-center">
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold ${STATUS_CONFIG[newStatus].bgColor} ${STATUS_CONFIG[newStatus].color}`}>
                  {STATUS_CONFIG[newStatus].label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-1">What this means:</p>
            <p className="text-sm text-blue-800">{STATUS_CONFIG[newStatus].description}</p>
            <p className="text-xs text-blue-700 mt-2">{getStatusChangeMessage()}</p>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to change the status for this applicant?
          </p>

          {statusHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">Status History</h3>
              </div>
              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-600 mt-2">Loading history...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {statusHistory.map((entry, index) => (
                    <div key={entry.id} className="flex items-start gap-2 text-xs">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'}`} />
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 h-full min-h-[16px] bg-gray-300 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[entry.old_status].bgColor} ${STATUS_CONFIG[entry.old_status].color}`}>
                            {STATUS_CONFIG[entry.old_status].label}
                          </span>
                          <ArrowRight className="h-2.5 w-2.5 text-gray-400" />
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[entry.new_status].bgColor} ${STATUS_CONFIG[entry.new_status].color}`}>
                            {STATUS_CONFIG[entry.new_status].label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(entry.changed_at).toLocaleDateString()} at {new Date(entry.changed_at).toLocaleTimeString()}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-600 mt-0.5 italic">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}
