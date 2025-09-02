import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, Folder, FileText, Star, StarOff, Eye, Download, Trash2, Plus, Search, SortAsc, SortDesc, CheckSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeService, ResumeFile, ResumeFolder } from '../services/resumeService';

export default function Resume() {
  const { user, updateUser } = useAuth();
  const [folders, setFolders] = useState<ResumeFolder[]>([]);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  
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

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadResumes();
      loadFolders();
    }
  }, [user]);

  const loadResumes = async () => {
    if (!user) return;
    const resumesData = await resumeService.getResumes(user.id);
    setResumes(resumesData);
  };

  const loadFolders = async () => {
    if (!user) return;
    const foldersData = await resumeService.getFolders(user.id);
    setFolders(foldersData);
  };

  const setDefaultResume = async (resumeId: string) => {
    if (!user) return;
    
    const success = await resumeService.setDefaultResume(resumeId, user.id);
    if (success) {
      setResumes(prev => prev.map(resume => ({
        ...resume,
        isDefault: resume.id === resumeId
      })));
      alert('Default resume updated successfully!');
    } else {
      alert('Failed to update default resume. Please try again.');
    }
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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'folder') {
      const success = await resumeService.deleteFolder(itemToDelete.id);
      if (success) {
        setFolders(prev => prev.filter(f => f.id !== itemToDelete.id));
        
        // Move resumes to uncategorized in local state
        setResumes(prev => prev.map(resume => 
          resume.folderId === itemToDelete.id 
            ? { ...resume, folderId: 'uncategorized' }
            : resume
        ));
        
        // If we're currently viewing the deleted folder, switch to all
        if (selectedFolder === itemToDelete.id) {
          setSelectedFolder('all');
        }
        
        alert(`Folder "${itemToDelete.name}" deleted successfully!`);
      } else {
        alert('Failed to delete folder. Please try again.');
      }
    } else if (itemToDelete.type === 'resume') {
      const success = await resumeService.deleteResume(itemToDelete.id);
      if (success) {
        setResumes(prev => prev.filter(r => r.id !== itemToDelete.id));
        alert(`Resume "${itemToDelete.name}" deleted successfully!`);
      } else {
        alert('Failed to delete resume. Please try again.');
      }
    }
    
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
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
    const targetFolderId = selectedFolder === 'all' ? 'uncategorized' : selectedFolder;

    const newResume = await resumeService.uploadResume(user.id, file, resumeName, targetFolderId);
    
    if (newResume) {
      setResumes(prev => [newResume, ...prev]);
      alert('Resume uploaded successfully!');
    } else {
      alert('Failed to upload resume. Please try again.');
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return;
    
    const newFolder = await resumeService.createFolder(user.id, newFolderName.trim());
    
    if (newFolder) {
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderForm(false);
      alert('Folder created successfully!');
    } else {
      alert('Failed to create folder. Please try again.');
    }
  };

  const moveResumeToFolder = async (resumeId: string, targetFolderId: string) => {
    const success = await resumeService.moveResume(resumeId, targetFolderId);
    
    if (success) {
      setResumes(prev => prev.map(resume => 
        resume.id === resumeId 
          ? { ...resume, folderId: targetFolderId }
          : resume
      ));
      setShowMoveModal(false);
      setResumeToMove(null);
      
      const targetFolderName = targetFolderId === 'uncategorized' ? 'Uncategorized' : folders.find(f => f.id === targetFolderId)?.name;
      alert(`Resume moved to "${targetFolderName}" successfully!`);
    } else {
      alert('Failed to move resume. Please try again.');
    }
  };

  const bulkMoveResumes = async (targetFolderId: string) => {
    if (!user) return;
    
    try {
      // Move all selected resumes
      const movePromises = selectedResumes.map(resumeId => 
        resumeService.moveResume(resumeId, targetFolderId)
      );
      
      const results = await Promise.all(movePromises);
      const allSuccessful = results.every(result => result);
      
      if (allSuccessful) {
        setResumes(prev => prev.map(resume => 
          selectedResumes.includes(resume.id)
            ? { ...resume, folderId: targetFolderId }
            : resume
        ));
        
        const targetFolderName = targetFolderId === 'uncategorized' ? 'Uncategorized' : folders.find(f => f.id === targetFolderId)?.name;
        alert(`${selectedResumes.length} resume${selectedResumes.length !== 1 ? 's' : ''} moved to "${targetFolderName}" successfully!`);
        
        setShowBulkMoveModal(false);
        clearSelection();
      } else {
        alert('Some resumes failed to move. Please try again.');
      }
    } catch (error) {
      console.error('Error moving resumes:', error);
      alert('Failed to move resumes. Please try again.');
    }
  };

  const deleteResume = async (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;
    
    setItemToDelete({
      type: 'resume',
      id: resumeId,
      name: resume.name
    });
    setShowDeleteConfirmation(true);
  };

  const deleteFolder = async (folderId: string) => {
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

  const updateSort = async (folderId: string, sortBy: 'name' | 'date' | 'size') => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || !user) return;
    
    const newOrder = folder.sortBy === sortBy && folder.sortOrder === 'asc' ? 'desc' : 'asc';
    
    try {
      const { error } = await supabase
        .from('resume_folders')
        .update({
          sort_by: sortBy,
          sort_order: newOrder,
        })
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating folder sort:', error);
        return;
      }

      setFolders(prev => prev.map(f => {
        if (f.id === folderId) {
          return { ...f, sortBy, sortOrder: newOrder };
        }
        return f;
      }));
    } catch (error) {
      console.error('Error updating folder sort:', error);
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
      return resume?.name || 'Unknown';
    }).join(', ');
  const [allResumesSorting, setAllResumesSorting] = useState<{ sortBy: 'name' | 'date' | 'size'; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'date',
    sortOrder: 'desc'
  });

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

              {/* Sort Controls */}
              {(currentFolder || selectedFolder === 'all') && ( /* Ensure this div is always present for sorting */
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2"> {/* Group for sort controls */}
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
                  {/* Quick Select Button */}
                  {isSelectionMode ? (
                    <button
                      onClick={clearSelection}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Cancel Selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Quick Select"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                  )}
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
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingResume.name}</h2>
                <p className="text-gray-600 text-sm">{viewingResume.fileName}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => downloadResume(viewingResume)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setViewingResume(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Resume Preview</h3>
                  <p className="text-gray-600 mb-4">
                    {viewingResume.fileName}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Size: {formatFileSize(viewingResume.size)}</p>
                    <p>Uploaded: {formatDate(viewingResume.uploadDate)}</p>
                    {viewingResume.isDefault && (
                      <p className="text-green-600 font-medium">✓ Default Resume</p>
                    )}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => downloadResume(viewingResume)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Resume
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Note: In a production environment, this would show the actual PDF/document content
                  </p>
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
                        const deletePromises = selectedResumes.map(resumeId => 
                          resumeService.deleteResume(resumeId)
                        );
                        
                        Promise.all(deletePromises).then(results => {
                          const allSuccessful = results.every(result => result);
                          if (allSuccessful) {
                            setResumes(prev => prev.filter(r => !selectedResumes.includes(r.id)));
                            alert(`${selectedResumes.length} resume${selectedResumes.length !== 1 ? 's' : ''} deleted successfully!`);
                            clearSelection();
                          } else {
                            alert('Some resumes failed to delete. Please try again.');
                    setResumes(prev => prev.filter(r => !selectedResumes.includes(r.id)));
                        });
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