import React from 'react';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { ApplicationStatus, STATUS_CONFIG } from '../lib/mockData';

interface StatusChangeConfirmationProps {
  isOpen: boolean;
  applicantName: string;
  currentStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StatusChangeConfirmation({
  isOpen,
  applicantName,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel
}: StatusChangeConfirmationProps) {
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
