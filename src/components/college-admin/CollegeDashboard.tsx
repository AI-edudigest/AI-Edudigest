import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  LogOut, 
  UserPlus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { 
  getCollegeUsersByCollegeAdmin,
  getCollegeInfoByCollegeAdmin,
  addCollegeUser,
  deleteCollegeUser,
  getCurrentUser,
  formatPlanDuration
} from '../../utils/firebase';

interface CollegeUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'leader' | 'faculty' | 'administrative_staff';
  institution?: string;
  institutionId?: string;
}

interface College {
  id: string;
  name: string;
  collegeId?: string;
  planDurationDays?: number;
  userLimit?: number;
  planStartDate?: any;
  planEndDate?: any;
}

interface CollegeDashboardProps {
  onBackToHome: () => void;
  onLogout: () => void;
}

const CollegeDashboard: React.FC<CollegeDashboardProps> = ({ onBackToHome, onLogout }) => {
  const [users, setUsers] = useState<CollegeUser[]>([]);
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add User Modal State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'leader' as 'leader' | 'faculty' | 'administrative_staff',
    password: ''
  });
  const [addingUser, setAddingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verify user is college_admin (support both college_admin and college-admin for backward compatibility)
      const { getUserProfile } = await import('../../utils/firebase');
      const { profile } = await getUserProfile(currentUser.uid);
      
      if (profile?.role !== 'college_admin' && profile?.role !== 'college-admin') {
        setError('Access denied: You are not a college admin.');
        setLoading(false);
        return;
      }

      // Load college info
      const collegeResult = await getCollegeInfoByCollegeAdmin(currentUser.uid);
      if (collegeResult.error) {
        setError(collegeResult.error);
        setLoading(false);
        return;
      }
      setCollege(collegeResult.college as College);

      // Load users
      const usersResult = await getCollegeUsersByCollegeAdmin(currentUser.uid);
      if (usersResult.error) {
        setError(usersResult.error);
      } else {
        setUsers(usersResult.users as CollegeUser[]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (!newUser.email.trim() || !newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAddingUser(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await addCollegeUser(newUser, currentUser.uid);
      if (result.success) {
        setSuccessMessage(`User ${newUser.email} added successfully!`);
        setNewUser({
          email: '',
          firstName: '',
          lastName: '',
          role: 'leader',
          password: ''
        });
        // Reload users
        await loadData();
        // Close modal after 2 seconds to show success message
        setTimeout(() => {
          setShowAddUser(false);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(result.error || 'Failed to add user');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError(error.message || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!currentUser) return;
    
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const result = await deleteCollegeUser(userId, currentUser.uid);
      if (result.success) {
        setSuccessMessage(`User ${userEmail} deleted successfully!`);
        // Reload users
        await loadData();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !college) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">College User Management</h1>
                {college && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>{college.name}</span>
                    {college.collegeId && (
                      <span className="ml-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                        (ID: <span className="text-gray-700 dark:text-gray-300 font-semibold">{college.collegeId}</span>)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto"
            >
              <XCircle className="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-800" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800" />
            </button>
          </div>
        )}

        {/* Plan Information */}
        {college && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan Duration</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {(() => {
                    if (college.planDurationDays) {
                      return formatPlanDuration(college.planDurationDays);
                    }
                    // Calculate duration from dates if planDurationDays is not set
                    if (college.planStartDate && college.planEndDate) {
                      const startDate = college.planStartDate.toDate ? college.planStartDate.toDate() : new Date(college.planStartDate);
                      const endDate = college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate);
                      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return `${diffDays} Days`;
                    }
                    return 'No Plan';
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Users Used / Limit</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {users.length} / {college.userLimit || 'Unlimited'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan Start Date</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {college.planStartDate 
                    ? (college.planStartDate.toDate ? college.planStartDate.toDate().toLocaleDateString() : new Date(college.planStartDate).toLocaleDateString())
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan Expiry Date</p>
                <p className={`text-lg font-medium ${
                  college.planEndDate && (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date()
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {college.planEndDate 
                    ? (college.planEndDate.toDate ? college.planEndDate.toDate().toLocaleDateString() : new Date(college.planEndDate).toLocaleDateString())
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add User Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddUser(true)}
            disabled={
              !college || 
              (college.userLimit !== undefined && users.length >= college.userLimit) ||
              (college.planEndDate && (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date())
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              !college || 
              (college.userLimit !== undefined && users.length >= college.userLimit) ||
              (college.planEndDate && (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date())
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#9b0101] text-white hover:bg-[#7a0101]'
            }`}
            title={
              !college 
                ? 'College information not available'
                : (college.userLimit !== undefined && users.length >= college.userLimit)
                  ? 'User limit reached. Please upgrade plan.'
                  : (college.planEndDate && (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date())
                    ? 'Plan expired. Contact support.'
                    : 'Add User'
            }
          >
            <UserPlus className="w-5 h-5" />
            <span>Add User</span>
          </button>
          {college && (
            <div className="mt-2">
              {college.userLimit !== undefined && users.length >= college.userLimit && (
                <p className="text-sm text-red-600 dark:text-red-400">User limit reached. Please upgrade plan.</p>
              )}
              {college.planEndDate && (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date() && (
                <p className="text-sm text-red-600 dark:text-red-400">Plan expired. Contact support.</p>
              )}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Users ({users.length})
            </h2>
          </div>
          {users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No users found. Click "Add User" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'leader' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center space-x-1 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add User</h3>
                <button
                  onClick={() => {
                    setShowAddUser(false);
                    setError(null);
                    setNewUser({
                      email: '',
                      firstName: '',
                      lastName: '',
                      role: 'leader',
                      password: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {/* Success/Error Messages inside Modal */}
              {successMessage && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-green-800 dark:text-green-200 text-sm flex-1">{successMessage}</p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="flex-shrink-0"
                    type="button"
                  >
                    <XCircle className="w-5 h-5 text-green-600 dark:text-green-400 hover:text-green-800" />
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-red-800 dark:text-red-200 text-sm flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0"
                    type="button"
                  >
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800" />
                  </button>
                </div>
              )}

              {/* College Name (Disabled) */}
              {college && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={college.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              )}

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'leader' | 'faculty' | 'administrative_staff' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="leader">Leader</option>
                  <option value="faculty">Faculty</option>
                  <option value="administrative_staff">Administrative staff</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={addingUser}
                  className="flex-1 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUser(false);
                    setError(null);
                    setNewUser({
                      email: '',
                      firstName: '',
                      lastName: '',
                      role: 'leader',
                      password: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeDashboard;

