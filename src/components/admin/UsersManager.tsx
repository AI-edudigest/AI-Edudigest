import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../../utils/firebase';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await getAllUsers();
      if (result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
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

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Users</h3>
          {users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : 'User'
                            }
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            <span>Last login: {formatDate(user.lastLoginAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      
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
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
