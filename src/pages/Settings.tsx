import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, Trash2, Settings as SettingsIcon, CreditCard, Receipt, ArrowRight, Edit, Palette, Upload, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCompany, createOrUpdateCompany } from '../lib/companyApi';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [deleteCompanyModal, setDeleteCompanyModal] = useState<{ isOpen: boolean; companyId: string | null; companyName: string }>({
    isOpen: false,
    companyId: null,
    companyName: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    biography: '',
    logo: '',
    colorFrom: 'blue-600',
    colorTo: 'blue-700',
  });

  const [verifiedCompanies, setVerifiedCompanies] = useState([
    { id: '1', name: 'TechCorp Inc.', address: '123 Tech Street, San Francisco, CA 94105' },
    { id: '2', name: 'Innovation Labs', address: '456 Innovation Ave, New York, NY 10001' }
  ]);
  const [newCompany, setNewCompany] = useState({ name: '', address: '' });
  const [showAddCompany, setShowAddCompany] = useState(false);

  const addCompany = () => {
    if (newCompany.name.trim() && newCompany.address.trim()) {
      const company = {
        id: Date.now().toString(),
        name: newCompany.name.trim(),
        address: newCompany.address.trim()
      };
      setVerifiedCompanies([...verifiedCompanies, company]);
      setNewCompany({ name: '', address: '' });
      setShowAddCompany(false);
      showToast('Company verification submitted! It will be reviewed within 1-2 business days.', 'success');
    }
  };

  const removeCompany = (companyId: string) => {
    const company = verifiedCompanies.find(c => c.id === companyId);
    if (!company) return;

    setDeleteCompanyModal({
      isOpen: true,
      companyId: companyId,
      companyName: company.name
    });
  };

  const confirmRemoveCompany = () => {
    if (!deleteCompanyModal.companyId) return;

    setVerifiedCompanies(verifiedCompanies.filter(c => c.id !== deleteCompanyModal.companyId));
    showToast('Company verification removed successfully!', 'success');
    setDeleteCompanyModal({ isOpen: false, companyId: null, companyName: '' });
  };

  const openEditModal = (companyName: string) => {
    const company = getCompany(companyName);
    if (company) {
      setEditingCompany(companyName);
      setEditData({
        biography: company.biography || '',
        logo: company.logo || '',
        colorFrom: company.profileColors?.from || 'blue-600',
        colorTo: company.profileColors?.to || 'blue-700',
      });
      setShowEditModal(true);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditData({ ...editData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!editingCompany) return;

    const company = getCompany(editingCompany);
    if (company) {
      createOrUpdateCompany(editingCompany, {
        ...company,
        biography: editData.biography,
        logo: editData.logo,
        profileColors: {
          from: editData.colorFrom,
          to: editData.colorTo,
        },
      });

      showToast('Company profile updated successfully!', 'success');
      setShowEditModal(false);
      setEditingCompany(null);
    }
  };

  const colorOptions = [
    { name: 'Blue', from: 'blue-600', to: 'blue-700' },
    { name: 'Green', from: 'green-600', to: 'emerald-700' },
    { name: 'Red', from: 'red-600', to: 'rose-700' },
    { name: 'Orange', from: 'orange-600', to: 'amber-700' },
    { name: 'Teal', from: 'teal-600', to: 'cyan-700' },
    { name: 'Pink', from: 'pink-600', to: 'fuchsia-700' },
    { name: 'Gray', from: 'gray-600', to: 'slate-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-8 w-8 text-gray-900 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-start">
            <HelpCircle className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                Contact our support team for assistance with verification, account settings, or any other questions.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Contact Support
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">Job Poster Verification</h2>
            <p className="text-blue-100 mt-1">Verify your company to post jobs and hire candidates</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification ID
              </label>
              <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-900 font-mono">
                {user?.companyId || 'Not verified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Verified Companies
              </label>
              <div className="space-y-3">
                {verifiedCompanies.map((company) => (
                  <div key={company.id} className="bg-gray-50 p-4 rounded-lg flex items-start justify-between hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Building className="h-4 w-4 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{company.address}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(company.name)}
                        className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                        title="Edit Profile"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCompany(company.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {showAddCompany ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Company Address"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newCompany.address}
                        onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={addCompany}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Submit for Verification
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCompany(false);
                            setNewCompany({ name: '', address: '' });
                          }}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddCompany(true)}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-3 px-4 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center font-medium"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Verify Another Company
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Settings</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Coming Soon</p>
                    <p className="text-sm text-blue-700">
                      Manage your payment methods, billing information, and subscription preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <Receipt className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">View Your Transactions</p>
                      <p className="text-sm text-gray-700">
                        Access your complete purchase history and transaction details.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/purchase-history"
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center whitespace-nowrap"
                  >
                    View History
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteCompanyModal.isOpen}
        title="Remove Company Verification"
        message={`Are you sure you want to remove "${deleteCompanyModal.companyName}" from your verified companies?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveCompany}
        onCancel={() => setDeleteCompanyModal({ isOpen: false, companyId: null, companyName: '' })}
        variant="warning"
      />

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Company Profile</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {editData.logo && (
                    <img src={editData.logo} alt="Logo preview" className="h-20 w-20 object-contain rounded-lg border border-gray-200" />
                  )}
                  <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, or SVG. Max 5MB.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About / Biography
                </label>
                <textarea
                  value={editData.biography}
                  onChange={(e) => setEditData({ ...editData, biography: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your company..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Palette className="inline h-4 w-4 mr-1" />
                  Profile Header Colors
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setEditData({ ...editData, colorFrom: color.from, colorTo: color.to })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        editData.colorFrom === color.from
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`h-8 rounded bg-gradient-to-r from-${color.from} to-${color.to} mb-2`}></div>
                      <p className="text-xs font-medium text-gray-700 text-center">{color.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCompany(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
