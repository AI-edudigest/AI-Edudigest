import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, X, Calendar, Users, AlertCircle } from 'lucide-react';
import { getAllColleges, createCollegeByAdmin, updateCollegeByAdmin, getAllUsers, getCurrentUser } from '../../utils/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface College {
  id: string;
  name: string;
  shortName?: string;
  type?: string;
  affiliation?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  createdBySalesman?: string;
  planDurationDays?: number;
  userLimit?: number;
  planStartDate?: any;
  planEndDate?: any;
  createdAt?: any;
}

const CollegesManager: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    type: '',
    affiliation: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    userLimit: 10,
    planDurationDays: 30,
    createdBySalesman: ''
  });

  useEffect(() => {
    fetchColleges();
    fetchSalesmen();
  }, []);

  const fetchSalesmen = async () => {
    try {
      const result = await getAllUsers();
      if (result.users) {
        const salesmenList = result.users.filter((user: any) => user.role === 'salesman');
        setSalesmen(salesmenList);
      }
    } catch (error) {
      console.error('Error fetching salesmen:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllColleges();
      if (result.error) {
        setError(result.error);
      } else {
        setColleges(result.colleges || []);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('College name is required');
      return;
    }

    try {
      if (editingCollege) {
        const result = await updateCollegeByAdmin(editingCollege.id, formData);
        if (result.success) {
          await fetchColleges();
          handleCancel();
          alert('College updated successfully!');
        } else {
          setError(result.error || 'Failed to update college');
        }
      } else {
        const result = await createCollegeByAdmin(formData);
        if (result.success) {
          await fetchColleges();
          handleCancel();
          alert('College created successfully!');
        } else {
          setError(result.error || 'Failed to create college');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save college');
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name: college.name || '',
      shortName: college.shortName || '',
      type: college.type || '',
      affiliation: college.affiliation || '',
      location: college.location || '',
      city: college.city || '',
      state: college.state || '',
      pincode: college.pincode || '',
      website: college.website || '',
      userLimit: college.userLimit || 10,
      planDurationDays: college.planDurationDays || 30,
      createdBySalesman: college.createdBySalesman || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (collegeId: string, collegeName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${collegeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'colleges', collegeId));
      await fetchColleges();
      alert('College deleted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to delete college');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCollege(null);
    setFormData({
      name: '',
      shortName: '',
      type: '',
      affiliation: '',
      location: '',
      city: '',
      state: '',
      pincode: '',
      website: '',
      userLimit: 10,
      planDurationDays: 30,
      createdBySalesman: ''
    });
    setError(null);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const isPlanExpired = (planEndDate: any) => {
    if (!planEndDate) return false;
    const endDate = planEndDate.toDate ? planEndDate.toDate() : new Date(planEndDate);
    return endDate < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Colleges Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage colleges and subscription plans</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {!showForm ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add College</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">College Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Limit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {colleges.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No colleges found. Add your first college to get started.
                      </td>
                    </tr>
                  ) : (
                    colleges.map((college) => {
                      const expired = isPlanExpired(college.planEndDate);
                      return (
                        <tr key={college.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{college.name}</div>
                            {college.shortName && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{college.shortName}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              expired 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {college.planDurationDays ? `${college.planDurationDays} Days` : 'No Plan'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {college.userLimit || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className={expired ? 'text-red-600 dark:text-red-400' : ''}>
                              {formatDate(college.planEndDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {college.city || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(college)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(college.id, college.name)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCollege ? 'Edit College' : 'Add New College'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Name
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Limit <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Duration <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.planDurationDays}
                  onChange={(e) => setFormData({ ...formData, planDurationDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value={2}>2 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign to Salesman (Optional)
                </label>
                <select
                  value={formData.createdBySalesman}
                  onChange={(e) => setFormData({ ...formData, createdBySalesman: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">None</option>
                  {salesmen.map((salesman) => (
                    <option key={salesman.id} value={salesman.id}>
                      {salesman.firstName} {salesman.lastName} ({salesman.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Engineering, Arts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affiliation</label>
                <input
                  type="text"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 bg-[#9b0101] hover:bg-[#7a0101] text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Building2 className="w-4 h-4" />
                <span>{editingCollege ? 'Update College' : 'Create College'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CollegesManager;

