import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Mail, Calendar, Edit, Clock, AlertCircle } from 'lucide-react';
import { getAllUsers, updateUserRole, getCurrentUser } from '../../utils/firebase';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: any;
  lastLoginAt?: any;
}

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      console.log('Fetching users...');
      const result = await getAllUsers();
      console.log('getAllUsers result:', result);
      
      if (result.error) {
        console.error('Error from getAllUsers:', result.error);
        
        // Check if it's a permission error
        if (result.error.includes('permission') || result.error.includes('insufficient')) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setError(`Permission denied. Your account (${currentUser.email}) needs to have 'admin' role in Firestore. 
            
Please check:
1. Firebase Console → Firestore Database → users collection
2. Find your user document (ID: ${currentUser.uid})
3. Ensure it has a 'role' field set to 'admin'
4. Deploy the updated Firestore rules using: firebase deploy --only firestore:rules`);
          } else {
            setError('Permission denied. Please ensure you are logged in and have admin role.');
          }
        } else {
          setError(`Error: ${result.error}`);
        }
        setUsers([]);
        return;
      }
      
      if (result.users && Array.isArray(result.users)) {
        console.log('Users fetched:', result.users.length);
        // Sort users by signup date (newest first)
        const sortedUsers = result.users.sort((a: User, b: User) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setUsers(sortedUsers);
        setError(null);
      } else {
        console.warn('No users array in result');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(`Unexpected error: ${error.message || error}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const result = await updateUserRole(userId, role);
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
        setEditingUser(null);
      } else {
        console.error('Error updating user role:', result.error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'faculty':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'leaders':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    return 'User';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage user accounts and roles</p>
      </div>

      {/* User Count Summary */}
      <div className="bg-gradient-to-r from-[#9b0101] to-[#7a0101] rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Permission Error</h4>
              <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-line">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Users</h3>
          {users.length === 0 && !error ? (
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
          ) : users.length === 0 && error ? (
            <p className="text-gray-500 dark:text-gray-400">Unable to load users. Please check the error message above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Email ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Signup Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Login Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getUserName(user)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{formatDateTime(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{formatDateTime(user.lastLoginAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center">
                          {editingUser?.id === user.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Administrator</option>
                                <option value="leaders">Leaders</option>
                              </select>
                              <button
                                onClick={() => handleRoleChange(user.id, newRole)}
                                className="px-3 py-1 bg-[#9b0101] text-white rounded text-sm hover:bg-[#7a0101] transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setNewRole(user.role);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Edit Role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Role Information</h4>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span><strong>Admin:</strong> Full access to all features and content management</span>
          </div>
          <div className="flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            <span><strong>Editor:</strong> Can create and edit content but cannot manage users</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span><strong>User:</strong> Can view content and access basic features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManager;
