import React, { useState, useEffect } from 'react';
import { FileText, Star, X } from 'lucide-react';

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

interface ResumeFolder {
  id: string;
  name: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

interface ResumeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (resume: ResumeFile) => void;
  jobTitle?: string;
}

export default function ResumeSelector({ isOpen, onClose, onSelect, jobTitle }: ResumeSelectorProps) {
  const [folders, setFolders] = useState<ResumeFolder[]>([]);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');

  useEffect(() => {
    if (isOpen) {
      // Load data from localStorage
      const savedFolders = localStorage.getItem('rushWorkingResumeFolders');
      const savedResumes = localStorage.getItem('rushWorkingResumes');
      
      if (savedFolders) {
        const foldersData = JSON.parse(savedFolders);
        setFolders(foldersData);
        setSelectedFolder('all');
      }
      if (savedResumes) {
        setResumes(JSON.parse(savedResumes));
      }
    }
  }, [isOpen]);

  const getFilteredAndSortedResumes = () => {
    let filtered = selectedFolder === 'all' 
      ? resumes 
      : resumes.filter(resume => resume.folderId === selectedFolder);

    // Apply sorting based on folder settings
    const currentFolder = folders.find(f => f.id === selectedFolder);
    if (currentFolder) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (currentFolder.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
        }
        
        return currentFolder.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
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

  const filteredResumes = getFilteredAndSortedResumes();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Resume</h2>
              {jobTitle && (
                <p className="text-gray-600 mt-1">Applying for: {jobTitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-96">
          {/* Folders Sidebar */}
          <div className="w-1/3 border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
            <div className="space-y-2">
              {folders.map((folder) => {
                const folderResumeCount = folder.id === 'all' 
                  ? resumes.length 
                  : resumes.filter(r => r.folderId === folder.id).length;
                
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                      selectedFolder === folder.id
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {folderResumeCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resume List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredResumes.length > 0 ? (
              <div className="space-y-3">
                {filteredResumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => onSelect(resume)}
                    className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h4 className="font-semibold text-gray-900 mr-2">{resume.name}</h4>
                          {resume.isDefault && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{resume.fileName}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                          <span>{formatFileSize(resume.size)}</span>
                          <span>Uploaded {formatDate(resume.uploadDate)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
                <p className="text-gray-600">
                  {selectedFolder === 'all' ? 'Upload your first resume to get started' : 'This folder is empty'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Select a resume to use for this application
            </p>
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}