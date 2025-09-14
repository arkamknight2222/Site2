import React, { useState, useEffect } from 'react';
import { FileText, Download, X, Plus, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';
import LoadingSpinner from './LoadingSpinner';

interface ResumeFile {
  id: string;
  name: string;
  fileName: string;
  size: number;
  uploadDate: string;
  isDefault: boolean;
  folderId: string;
  url: string;
}

interface ResumeSelectorProps {
  onSelect: (resumeId: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function ResumeSelector({ onSelect, onClose, title = 'Select a Resume', description = 'Choose the resume you want to use for this application.' }: ResumeSelectorProps) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showNewResumePrompt, setShowNewResumePrompt] = useState(false);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const data = await resumeService.getResumes(user!.id);
      setResumes(data);
      const defaultResume = data.find(r => r.isDefault);
      if (defaultResume) {
        setSelectedResumeId(defaultResume.id);
      } else if (data.length > 0) {
        setSelectedResumeId(data.id); // Select the first one if no default
      }
    } catch (error) {
      console.error('Error loading resumes for selector:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, DOC, or DOCX file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Resume must be smaller than 10MB');
      return;
    }

    const resumeName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const targetFolderId = 'uncategorized'; // Default to uncategorized for new uploads

    const success = await resumeService.uploadResume(user.id, file, resumeName, targetFolderId);
    
    if (success) {
      await loadResumes();
      setShowNewResumePrompt(false);
      alert('Resume uploaded successfully!');
    } else {
      alert('Failed to upload resume. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <LoadingSpinner text="Loading resumes..." />
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
              <p className="text-gray-600 mb-6">
                Please upload a resume to proceed.
              </p>
              <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Upload New Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedResumeId === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedResumeId(resume.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{resume.name}</h3>
                        <p className="text-gray-600 text-sm mb-1">{resume.fileName}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>{formatFileSize(resume.size)}</span>
                          <span>Uploaded {formatDate(resume.uploadDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {resume.isDefault && (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                          Default
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resume.url, '_blank');
                        }}
                        className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="View resume"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-6">
                <label className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Another Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedResumeId && onSelect(selectedResumeId)}
            disabled={!selectedResumeId || loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Resume
          </button>
        </div>
      </div>
    </div>
  );
}