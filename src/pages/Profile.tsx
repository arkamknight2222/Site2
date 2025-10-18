import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Upload, Save, Edit, Camera, Settings, ArrowRight, Building2, Ban, Heart, Search, SortAsc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getBlockedCompanies, unblockCompany, getFollowedCompanies, unfollowCompany, getCompany } from '../lib/companyApi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profilePicture || null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || '',
    isVeteran: user?.isVeteran || false,
    isCitizen: user?.isCitizen || false,
    highestDegree: user?.highestDegree || '',
    hasCriminalRecord: user?.hasCriminalRecord || false,
    bio: '',
    skills: [] as string[],
    experience: '',
    location: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [blockedCompanies, setBlockedCompanies] = useState<string[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<Array<{ companyName: string; followedAt: string }>>([]);
  const [blockedSearch, setBlockedSearch] = useState('');
  const [followedSearch, setFollowedSearch] = useState('');
  const [blockedSort, setBlockedSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [followedSort, setFollowedSort] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  useEffect(() => {
    if (user) {
      setBlockedCompanies(getBlockedCompanies());
      setFollowedCompanies(getFollowedCompanies(user.id));
    }
  }, [user]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB', 'error');
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        updateUser({ profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        showToast('Please select a PDF, DOC, or DOCX file', 'error');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Resume must be smaller than 10MB', 'error');
        return;
      }
      
      // Simulate upload process
      const fileName = file.name;
      const resumeUrl = `uploads/resumes/${Date.now()}_${fileName}`;
      
      updateUser({
        resumeUrl: resumeUrl,
        resumeFileName: fileName
      });

      showToast('Resume uploaded successfully!', 'success');
    }
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleUnblock = (companyName: string) => {
    unblockCompany(companyName);
    setBlockedCompanies(getBlockedCompanies());
    showToast(`${companyName} has been unblocked`, 'success');
  };

  const handleUnfollow = (companyName: string) => {
    if (user) {
      unfollowCompany(companyName, user.id);
      setFollowedCompanies(getFollowedCompanies(user.id));
      showToast(`Unfollowed ${companyName}`, 'info');
    }
  };

  const filteredBlockedCompanies = blockedCompanies
    .filter(name => name.toLowerCase().includes(blockedSearch.toLowerCase()))
    .sort((a, b) => {
      if (blockedSort === 'name-asc') return a.localeCompare(b);
      return b.localeCompare(a);
    });

  const filteredFollowedCompanies = followedCompanies
    .filter(item => item.companyName.toLowerCase().includes(followedSearch.toLowerCase()))
    .sort((a, b) => {
      if (followedSort === 'date-desc') return new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime();
      if (followedSort === 'date-asc') return new Date(a.followedAt).getTime() - new Date(b.followedAt).getTime();
      if (followedSort === 'name-asc') return a.companyName.localeCompare(b.companyName);
      return b.companyName.localeCompare(a.companyName);
    });


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <label className={`w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer hover:bg-white/30 transition-colors' : ''}`}>
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12" />
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                )}
              </label>
              <label className={`absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-lg ${isEditing ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}>
                <Camera className="h-4 w-4" />
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                )}
              </label>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-blue-100 mb-2">{user?.email}</p>
              <div className="flex items-center justify-center md:justify-start">
                <div className="bg-white/20 px-4 py-2 rounded-full flex items-center">
                  <span className="font-semibold">{user?.points || 0} Points Available</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <Edit className="h-5 w-5 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900">
                        {formData.firstName || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900">
                        {formData.lastName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg text-gray-600">
                      {formData.email}
                      <span className="text-xs ml-2">(Cannot be changed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900">
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="16"
                        max="100"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900">
                        {formData.age || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900 capitalize">
                        {formData.gender || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highest Degree
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.highestDegree}
                        onChange={(e) => setFormData({ ...formData, highestDegree: e.target.value })}
                      >
                        <option value="">Select Degree</option>
                        <option value="high-school">High School</option>
                        <option value="associate">Associate Degree</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900 capitalize">
                        {formData.highestDegree?.replace('-', ' ') || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Bio</h2>
                {isEditing ? (
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-700 min-h-[120px]">
                    {formData.bio || 'No bio provided. Add a bio to help employers learn more about you.'}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Status Information and Resume */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Veteran Status:</span>
                      <span className={`font-medium ${formData.isVeteran ? 'text-green-600' : 'text-gray-900'}`}>
                        {formData.isVeteran ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Citizenship:</span>
                      <span className={`font-medium ${formData.isCitizen ? 'text-green-600' : 'text-gray-900'}`}>
                        {formData.isCitizen ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Background Check:</span>
                      <span className={`font-medium ${formData.hasCriminalRecord ? 'text-orange-600' : 'text-green-600'}`}>
                        {formData.hasCriminalRecord ? 'Has Record' : 'Clean'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resume */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      {(() => {
                        const savedResumes = localStorage.getItem('rushWorkingResumes');
                        const resumeCount = savedResumes ? JSON.parse(savedResumes).length : 0;
                        return `You have ${resumeCount} resume${resumeCount !== 1 ? 's' : ''} uploaded`;
                      })()}
                    </p>
                    <Link
                      to="/resume"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors inline-block"
                    >
                      See Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Link */}
            <div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Settings className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Account Settings</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Manage your job poster verification, purchase settings, and view your transaction history.
                      </p>
                      <Link
                        to="/settings"
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Go to Settings
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              {isEditing && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Ban className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blocked Companies</h2>
              <p className="text-sm text-gray-600 mt-1">
                {blockedCompanies.length} {blockedCompanies.length === 1 ? 'company' : 'companies'} blocked
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={blockedSearch}
                onChange={(e) => setBlockedSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={blockedSort}
              onChange={(e) => setBlockedSort(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {filteredBlockedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlockedCompanies.map((companyName) => {
              const company = getCompany(companyName);
              return (
                <div key={companyName} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      {company?.logo ? (
                        <img src={company.logo} alt={companyName} className="h-12 w-12 object-contain rounded-lg mr-3" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{companyName}</h3>
                        <p className="text-sm text-gray-600 mt-1">Blocked company</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/company/${encodeURIComponent(companyName)}`)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleUnblock(companyName)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {blockedSearch ? 'No companies found' : 'No blocked companies'}
            </h3>
            <p className="text-gray-600">
              {blockedSearch
                ? 'Try adjusting your search'
                : 'Companies you block will appear here'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-pink-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Followed Companies</h2>
              <p className="text-sm text-gray-600 mt-1">
                {followedCompanies.length} {followedCompanies.length === 1 ? 'company' : 'companies'} followed
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={followedSearch}
                onChange={(e) => setFollowedSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={followedSort}
              onChange={(e) => setFollowedSort(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="date-desc">Recently Followed</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {filteredFollowedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFollowedCompanies.map((item) => {
              const company = getCompany(item.companyName);
              return (
                <div key={item.companyName} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      {company?.logo ? (
                        <img src={company.logo} alt={item.companyName} className="h-12 w-12 object-contain rounded-lg mr-3" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.companyName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Followed {new Date(item.followedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/company/${encodeURIComponent(item.companyName)}`)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleUnfollow(item.companyName)}
                      className="flex-1 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {followedSearch ? 'No companies found' : 'No followed companies'}
            </h3>
            <p className="text-gray-600">
              {followedSearch
                ? 'Try adjusting your search'
                : 'Companies you follow will appear here'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}