import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, Folder, FileText, Star, StarOff, Eye, Download, Trash2, Plus, Search, SortAsc, SortDesc, CheckSquare, Square, X } from 'lucide-react';
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
  fileContent?: string; // Base64 content for viewing
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
  ]);
  const [resumes, setResumes] = useState<ResumeFile[]>([
    {
      id: '1',
      name: 'Software Developer Resume',
      fileName: 'john_doe_developer.pdf',
      size: 245760, // 240KB
      uploadDate: '2025-01-08T10:30:00Z',
      isDefault: true,
      folderId: 'uncategorized',
      url: 'uploads/resumes/john_doe_developer.pdf',
    },
    {
      id: '2',
      name: 'Marketing Specialist Resume',
      fileName: 'john_doe_marketing.pdf',
      size: 198432, // 194KB
      uploadDate: '2025-01-05T14:20:00Z',
      isDefault: false,
      folderId: 'uncategorized',
      url: 'uploads/resumes/john_doe_marketing.pdf',
    },
  ]);
  
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingResume, setViewingResume] = useState<ResumeFile | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [resumeToMove, setResumeToMove] = useState<ResumeFile | null>(null);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'folder' | 'resume'; id: string; name: string; resumesInFolder?: number } | null>(null);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);

  const setDefaultResume = (resumeId: string) => {
    setResumes(prev => prev.map(resume => ({
      ...resume,
      isDefault: resume.id === resumeId
    })));
    alert('Default resume updated successfully!');
  };

  const viewResume = (resume: ResumeFile) => {
    setViewingResume(resume);
  };

  const downloadResume = (resume: ResumeFile) => {
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the actual file URL
    link.download = resume.fileName;
    
    // Create a mock blob for demonstration
    const mockContent = `Mock resume content for ${resume.name}\nFilename: ${resume.fileName}\nUploaded: ${formatDate(resume.uploadDate)}`;
    const blob = new Blob([mockContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Downloading ${resume.fileName}...`);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'folder') {
      const folderResumes = resumes.filter(r => r.folderId === itemToDelete.id);
      
      if (folderResumes.length > 0) {
        // Move all resumes to uncategorized
        setResumes(prev => prev.map(resume => 
          resume.folderId === itemToDelete.id 
            ? { ...resume, folderId: 'uncategorized' }
            : resume
        ));
      }
      
      setFolders(prev => prev.filter(f => f.id !== itemToDelete.id));
      
      // If we're currently viewing the deleted folder, switch to all
      if (selectedFolder === itemToDelete.id) {
        setSelectedFolder('all');
      }
      
      alert(`Folder "${itemToDelete.name}" deleted successfully!`);
    } else if (itemToDelete.type === 'resume') {
      setResumes(prev => prev.filter(r => r.id !== itemToDelete.id));
      
      // If deleted resume was default, set another as default
      const deletedResume = resumes.find(r => r.id === itemToDelete.id);
      if (deletedResume?.isDefault) {
        const remainingResumes = resumes.filter(r => r.id !== itemToDelete.id);
        if (remainingResumes.length > 0) {
          setDefaultResume(remainingResumes[0].id);
        }
      }
      
      alert(`Resume "${itemToDelete.name}" deleted successfully!`);
    }
    
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const clearSelection = () => {
    setSelectedResumes([]);
    setIsSelectionMode(false);
  };

  const toggleResumeSelection = (resumeId: string) => {
    setSelectedResumes(prev => 
      prev.includes(resumeId)
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    );
  };

  const selectAllResumes = () => {
    const allResumeIds = filteredResumes.map(r => r.id);
    setSelectedResumes(allResumeIds);
  };

  const bulkDeleteResumes = () => {
    if (selectedResumes.length === 0) return;
    
    const resumeNames = selectedResumes.map(id => {
      const resume = resumes.find(r => r.id === id);
      return resume?.name || 'Unknown';
    }).join(', ');
    
    setItemToDelete({
      type: 'resume',
      id: 'bulk',
      name: resumeNames
    });
    setShowDeleteConfirmation(true);
  };

  const bulkMoveResumes = (targetFolderId: string) => {
    setResumes(prev => prev.map(resume => 
      selectedResumes.includes(resume.id)
        ? { ...resume, folderId: targetFolderId }
        : resume
    ));
    
    const targetFolderName = targetFolderId === 'uncategorized' ? 'Uncategorized' : folders.find(f => f.id === targetFolderId)?.name;
    alert(`${selectedResumes.length} resume${selectedResumes.length !== 1 ? 's' : ''} moved to "${targetFolderName}" successfully!`);
    
    setShowBulkMoveModal(false);
    clearSelection();
  };

  const bulkDownloadResumes = () => {
    if (selectedResumes.length === 0) return;
    
    selectedResumes.forEach(resumeId => {
      const resume = resumes.find(r => r.id === resumeId);
      if (resume) {
        // Create a mock download for each resume
        const mockContent = `Mock resume content for ${resume.name}\nFilename: ${resume.fileName}\nUploaded: ${formatDate(resume.uploadDate)}`;
        const blob = new Blob([mockContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = resume.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
    
    alert(`Downloading ${selectedResumes.length} resume${selectedResumes.length !== 1 ? 's' : ''}...`);
    clearSelection();
  };

  const [allResumesSorting, setAllResumesSorting] = useState<{ sortBy: 'name' | 'date' | 'size'; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'date',
    sortOrder: 'desc'
  });

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
      fileContent: '', // In real app, this would be the actual file content
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

  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const folderResumes = resumes.filter(r => r.folderId === folderId);
    
    setItemToDelete({
      type: 'folder',
      id: folderId,
      name: folder.name,
      resumesInFolder: folderResumes.length
    });
    setShowDeleteConfirmation(true);
  };

  const deleteResume = (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;
    
    setItemToDelete({
      type: 'resume',
      id: resumeId,
      name: resume.name
    });
    setShowDeleteConfirmation(true);
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

  const moveResumeToFolder = (resumeId: string, targetFolderId: string) => {
    setResumes(prev => prev.map(resume => 
      resume.id === resumeId 
        ? { ...resume, folderId: targetFolderId }
        : resume
    ));
    setShowMoveModal(false);
    setResumeToMove(null);
    
    const targetFolderName = targetFolderId === 'uncategorized' ? 'Uncategorized' : folders.find(f => f.id === targetFolderId)?.name;
    alert(`Resume moved to "${targetFolderName}" successfully!`);
  };

  const updateAllResumesSorting = (sortBy: 'name' | 'date' | 'size') => {
    const currentSortOrder = allResumesSorting.sortBy === sortBy && allResumesSorting.sortOrder === 'asc' ? 'desc' : 'asc';
    setAllResumesSorting({ sortBy, sortOrder: currentSortOrder });
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
    let sortBy: 'name' | 'date' | 'size';
    let sortOrder: 'asc' | 'desc';
    
    if (selectedFolder === 'all') {
      sortBy = allResumesSorting.sortBy;
      sortOrder = allResumesSorting.sortOrder;
    } else {
      const currentFolder = folders.find(f => f.id === selectedFolder);
      if (currentFolder) {
        sortBy = currentFolder.sortBy;
        sortOrder = currentFolder.sortOrder;
      } else {
        sortBy = 'date';
        sortOrder = 'desc';
      }
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
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
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* All Resumes Button */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedFolder('all')}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                  selectedFolder === 'all'
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  <span>All Resumes</span>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {resumes.length}
                </span>
              </button>
            </div>
            
            {/* Custom Folders */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Custom Folders</h2>
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
                  const folderResumeCount = resumes.filter(r => r.folderId === folder.id).length;
                  
                  return (
                    <div
                      key={folder.id}
                      className={`p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedFolder === folder.id
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedFolder(folder.id)}
                        className="flex items-center flex-1 text-left hover:text-gray-900 transition-colors"
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        <span>{folder.name}</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {folderResumeCount}
                        </span>
                        <button
                          onClick={() => deleteFolder(folder.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {folders.length === 0 && !showNewFolderForm && (
                  <div className="text-center py-6">
                    <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-3">No custom folders yet</p>
                    <button
                      onClick={() => setShowNewFolderForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Folder
                    </button>
                  </div>
                )}
              </div>
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
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48"
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

              {/* Sort Controls and Selection Actions */}
              {(currentFolder || selectedFolder === 'all') && (
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
                  {!isSelectionMode ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                        <button
                          onClick={() => selectedFolder === 'all' ? updateAllResumesSorting('name') : updateSort(selectedFolder, 'name')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                            (selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'name'
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Name
                          {(selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'name' && (
                            (selectedFolder === 'all' ? allResumesSorting.sortOrder : currentFolder?.sortOrder) === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                          )}
                        </button>
                        <button
                          onClick={() => selectedFolder === 'all' ? updateAllResumesSorting('date') : updateSort(selectedFolder, 'date')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                            (selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'date'
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Date
                          {(selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'date' && (
                            (selectedFolder === 'all' ? allResumesSorting.sortOrder : currentFolder?.sortOrder) === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                          )}
                        </button>
                        <button
                          onClick={() => selectedFolder === 'all' ? updateAllResumesSorting('size') : updateSort(selectedFolder, 'size')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                            (selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'size'
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Size
                          {(selectedFolder === 'all' ? allResumesSorting.sortBy : currentFolder?.sortBy) === 'size' && (
                            (selectedFolder === 'all' ? allResumesSorting.sortOrder : currentFolder?.sortOrder) === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => setIsSelectionMode(true)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Quick Select"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {selectedResumes.length} selected
                        </span>
                        <button
                          onClick={selectAllResumes}
                          className="px-3 py-1 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Select All
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedResumes.length > 0 && (
                          <>
                            <button
                              onClick={() => setShowBulkMoveModal(true)}
                              className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors flex items-center"
                            >
                              <FolderPlus className="h-3 w-3 mr-1" />
                              Move
                            </button>
                            <button
                              onClick={bulkDownloadResumes}
                              className="px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-600 hover:bg-green-200 transition-colors flex items-center"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                            <button
                              onClick={bulkDeleteResumes}
                              className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </>
                        )}
                        <button
                          onClick={clearSelection}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Cancel Selection"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Resume List */}
            <div className="p-6">
              {filteredResumes.length > 0 ? (
                <div className="space-y-4">
                  {filteredResumes.map((resume) => (
                    <div key={resume.id} className={`border rounded-lg p-4 transition-all ${
                      selectedResumes.includes(resume.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:shadow-md'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          {isSelectionMode && (
                            <button
                              onClick={() => toggleResumeSelection(resume.id)}
                              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {selectedResumes.includes(resume.id) ? (
                                <CheckSquare className="h-6 w-6 text-blue-600" />
                              ) : (
                                <Square className="h-6 w-6 text-gray-400" />
                              )}
                            </button>
                          )}
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
                        {!isSelectionMode && (
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
                              onClick={() => viewResume(resume)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                              title="Download resume"
                              onClick={() => downloadResume(resume)}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setResumeToMove(resume);
                                setShowMoveModal(true);
                              }}
                              className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                              title="Move to folder"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteResume(resume.id)}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete resume"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
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

      {/* Resume Viewer Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingResume.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{viewingResume.fileName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadResume(viewingResume)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setViewingResume(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                <div className="border-b-4 border-blue-600 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">{viewingResume.name}</h1>
                  <p className="text-gray-600 mt-1">{user?.email || 'email@example.com'} • {user?.phone || '(555) 123-4567'}</p>
                  <p className="text-gray-600">United States</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Bachelor's Degree in Computer Science</p>
                    <p className="text-gray-600">University Name • 2020</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="font-semibold text-gray-900">Senior Position</p>
                    <p className="text-gray-600 text-sm mb-2">Company Name • 2020 - Present</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Led development of key features and improvements</li>
                      <li>Collaborated with cross-functional teams</li>
                      <li>Mentored junior developers</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Previous Position</p>
                    <p className="text-gray-600 text-sm mb-2">Another Company • 2018 - 2020</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Developed and maintained applications</li>
                      <li>Implemented best practices</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'Agile'].map(skill => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Resume Modal */}
      {showMoveModal && resumeToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Move Resume</h2>
            <p className="text-gray-600 mb-4">
              Move "{resumeToMove.name}" to a different folder:
            </p>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {/* Uncategorized option */}
              {resumeToMove.folderId !== 'uncategorized' && (
                <button
                  onClick={() => moveResumeToFolder(resumeToMove.id, 'uncategorized')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
                >
                  <Folder className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="font-medium text-gray-900">Uncategorized</span>
                </button>
              )}
              
              {/* Custom folders */}
              {folders
                .filter(folder => folder.id !== resumeToMove.folderId)
                .map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => moveResumeToFolder(resumeToMove.id, folder.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Folder className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="font-medium text-gray-900">{folder.name}</span>
                  </button>
                ))}
              
              {folders.filter(folder => folder.id !== resumeToMove.folderId).length === 0 && resumeToMove.folderId === 'uncategorized' && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No other folders available</p>
                  <button
                    onClick={() => {
                      setShowMoveModal(false);
                      setResumeToMove(null);
                      setShowNewFolderForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-3"
                  >
                    Create New Folder
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setResumeToMove(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
            <div className="mb-6">
              {itemToDelete.type === 'folder' ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete the folder "{itemToDelete.name}"?
                  </p>
                  {itemToDelete.resumesInFolder && itemToDelete.resumesInFolder > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Warning:</strong> This folder contains {itemToDelete.resumesInFolder} resume{itemToDelete.resumesInFolder !== 1 ? 's' : ''}. 
                        All resumes will be moved to "Uncategorized".
                      </p>
                    </div>
                  )}
                </div>
              ) : itemToDelete.id === 'bulk' ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete the selected resumes?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      <strong>Warning:</strong> This action cannot be undone.
                    </p>
                    <p className="text-red-700 text-xs mt-2">
                      {itemToDelete.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete "{itemToDelete.name}"?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      <strong>Warning:</strong> This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setItemToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (itemToDelete.id === 'bulk') {
                    // Handle bulk delete
                    const hasDefault = selectedResumes.some(id => {
                      const resume = resumes.find(r => r.id === id);
                      return resume?.isDefault;
                    });
                    
                    setResumes(prev => prev.filter(r => !selectedResumes.includes(r.id)));
                    
                    // If deleted resume was default, set another as default
                    if (hasDefault) {
                      const remainingResumes = resumes.filter(r => !selectedResumes.includes(r.id));
                      if (remainingResumes.length > 0) {
                        setDefaultResume(remainingResumes[0].id);
                      }
                    }
                    
                    alert(`${selectedResumes.length} resume${selectedResumes.length !== 1 ? 's' : ''} deleted successfully!`);
                    clearSelection();
                  } else {
                    handleConfirmDelete();
                  }
                  setShowDeleteConfirmation(false);
                  setItemToDelete(null);
                }}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete {itemToDelete.type === 'folder' ? 'Folder' : itemToDelete.id === 'bulk' ? 'Selected' : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Move Modal */}
      {showBulkMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Move Selected Resumes</h2>
            <p className="text-gray-600 mb-4">
              Move {selectedResumes.length} selected resume{selectedResumes.length !== 1 ? 's' : ''} to:
            </p>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {/* Uncategorized option */}
              <button
                onClick={() => bulkMoveResumes('uncategorized')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
              >
                <Folder className="h-4 w-4 mr-3 text-gray-500" />
                <span className="font-medium text-gray-900">Uncategorized</span>
              </button>
              
              {/* Custom folders */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => bulkMoveResumes(folder.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
                >
                  <Folder className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="font-medium text-gray-900">{folder.name}</span>
                </button>
              ))}
              
              {folders.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No folders available</p>
                  <button
                    onClick={() => {
                      setShowBulkMoveModal(false);
                      setShowNewFolderForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-3"
                  >
                    Create New Folder
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkMoveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}