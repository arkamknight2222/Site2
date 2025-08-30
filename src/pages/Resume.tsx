import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, Folder, FileText, Star, StarOff, Eye, Download, Trash2, Plus, Search, SortAsc, SortDesc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

export default function Resume() {
  const { user, updateUser } = useAuth();
  const [folders, setFolders] = useState<ResumeFolder[]>([
    { id: 'all', name: 'All Resumes', sortBy: 'date', sortOrder: 'desc' },
    { id: 'default', name: 'General', sortBy: 'date', sortOrder: 'desc' },
  ]);
  const [resumes, setResumes] = useState<ResumeFile[]>([
    {
      id: '1',
      name: 'Software Developer Resume',
      fileName: 'john_doe_developer.pdf',
      size: 245760, // 240KB
      uploadDate: '2025-01-08T10:30:00Z',
      isDefault: true,
      folderId: 'default',
      url: 'uploads/resumes/john_doe_developer.pdf',
    },
    {
      id: '2',
      name: 'Marketing Specialist Resume',
      fileName: 'john_doe_marketing.pdf',
      size: 198432, // 194KB
      uploadDate: '2025-01-05T14:20:00Z',
      isDefault: false,
      folderId: 'default',
      url: 'uploads/resumes/john_doe_marketing.pdf',
    },
  ]);
  
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('rushWorkingResumeFolders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('rushWorkingResumes', JSON.stringify(resumes));
  }, [resumes]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFolders = localStorage.getItem('rushWorkingResumeFolders');
    const savedResumes = localStorage.getItem('rushWorkingResumes');
    
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
    if (savedResumes) {
      setResumes(JSON.parse(savedResumes));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    const newResume: ResumeFile = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      fileName: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      isDefault: resumes.length === 0, // First resume becomes default
      folderId: selectedFolder === 'all' ? 'default' : selectedFolder,
      url: `uploads/resumes/${Date.now()}_${file.name}`,
    };

    setResumes(prev => [newResume, ...prev]);
    alert('Resume uploaded successfully!');
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: ResumeFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      sortBy: 'date',
      sortOrder: 'desc',
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderForm(false);
  };

  const setDefaultResume = (resumeId: string) => {
    setResumes(prev => prev.map(resume => ({
      ...resume,
      isDefault: resume.id === resumeId
    })));
    
    // Update user's default resume
    const defaultResume = resumes.find(r => r.id === resumeId);
    if (defaultResume) {
      updateUser({ 
        resumeUrl: defaultResume.url,
        resumeFileName: defaultResume.fileName 
      });
    }
  };

  const deleteResume = (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;
    
    if (window.confirm(`Are you sure you want to delete "${resume.name}"?`)) {
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      
      // If deleted resume was default, set another as default
      if (resume.isDefault) {
        const remainingResumes = resumes.filter(r => r.id !== resumeId);
        if (remainingResumes.length > 0) {
          setDefaultResume(remainingResumes[0].id);
        }
      }
    }
  };

  const updateSort = (folderId: string, sortBy: 'name' | 'date' | 'size') => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        const newOrder = folder.sortBy === sortBy && folder.sortOrder === 'asc' ? 'desc' : 'asc';
        return { ...folder, sortBy, sortOrder: newOrder };
      }
      return folder;
    }));
  };

  const getFilteredAndSortedResumes = () => {
    let filtered = selectedFolder === 'all' 
      ? resumes 
      : resumes.filter(resume => resume.folderId === selectedFolder);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(resume => 
        resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
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
  const currentFolder = folders.find(f => f.id === selectedFolder);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Manager</h1>
        <p className="text-gray-600">
          Upload, organize, and manage your resumes for different job applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Folders</h2>
              <button
                onClick={() => setShowNewFolderForm(true)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            {showNewFolderForm && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Folder name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={createFolder}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFolderForm(false);
                      setNewFolderName('');
                    }}
                    className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                      <Folder className="h-4 w-4 mr-2" />
                      <span>{folder.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {folderResumeCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {folders.find(f => f.id === selectedFolder)?.name || 'Resumes'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {filteredResumes.length} resume{filteredResumes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resumes..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Upload Button */}
                  <label className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Sort Controls */}
              {currentFolder && selectedFolder !== 'all' && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                  <button
                    onClick={() => updateSort(selectedFolder, 'name')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      currentFolder.sortBy === 'name'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Name
                    {currentFolder.sortBy === 'name' && (
                      currentFolder.sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => updateSort(selectedFolder, 'date')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      currentFolder.sortBy === 'date'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Date
                    {currentFolder.sortBy === 'date' && (
                      currentFolder.sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => updateSort(selectedFolder, 'size')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      currentFolder.sortBy === 'size'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Size
                    {currentFolder.sortBy === 'size' && (
                      currentFolder.sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Resume List */}
            <div className="p-6">
              {filteredResumes.length > 0 ? (
                <div className="space-y-4">
                  {filteredResumes.map((resume) => (
                    <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 mr-2">{resume.name}</h3>
                              {resume.isDefault && (
                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{resume.fileName}</p>
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span>{formatFileSize(resume.size)}</span>
                              <span>Uploaded {formatDate(resume.uploadDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setDefaultResume(resume.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              resume.isDefault
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                            }`}
                            title={resume.isDefault ? 'Default resume' : 'Set as default'}
                          >
                            {resume.isDefault ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button
                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View resume"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                            title="Download resume"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteResume(resume.id)}
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete resume"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Upload your first resume to get started'}
                  </p>
                  <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Resume
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}