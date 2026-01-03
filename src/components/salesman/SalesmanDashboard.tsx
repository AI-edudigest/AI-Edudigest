import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  LogOut, 
  BarChart3,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  getCollegesBySalesman, 
  addCollege,
  deleteCollege,
  getCollegeAdminsBySalesman,
  addCollegeAdmin,
  deleteCollegeAdmin,
  getCollegeUserStats,
  subscribeToCollegeUserStats,
  getCurrentUser
} from '../../utils/firebase';

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
  createdBySalesman: string;
  createdAt: any;
  planDurationDays?: number;
  userLimit?: number;
  planStartDate?: any;
  planEndDate?: any;
}

interface CollegeAdmin {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  institution: string;
  institutionId: string;
  createdBySalesman: string;
}

interface CollegeStats {
  leaders: number;
  educators: number;
  faculty: number;
  students: number;
  total: number;
}

interface SalesmanDashboardProps {
  onLogout: () => void;
}

const SalesmanDashboard: React.FC<SalesmanDashboardProps> = ({ onLogout }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeAdmins, setCollegeAdmins] = useState<CollegeAdmin[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [collegeStats, setCollegeStats] = useState<{ [collegeId: string]: CollegeStats }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add College Modal State
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollege, setNewCollege] = useState({
    name: '',
    shortName: '',
    type: '',
    affiliation: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    website: ''
  });
  
  // Add College Admin Modal State
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    collegeId: '',
    collegeName: ''
  });

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Set up real-time subscriptions for college user stats
  useEffect(() => {
    if (!currentUser || colleges.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    // Set up real-time subscriptions for each college
    colleges.forEach((college: College) => {
      const unsubscribe = subscribeToCollegeUserStats(
        college.id,
        currentUser.uid,
        (stats) => {
          if (stats) {
            setCollegeStats(prev => ({
              ...prev,
              [college.id]: stats
            }));
          }
        }
      );
      unsubscribers.push(unsubscribe);
    });

    // Cleanup subscriptions on unmount or when colleges change
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [colleges, currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verify user is salesman and active
      const { getUserProfile } = await import('../../utils/firebase');
      const { profile } = await getUserProfile(currentUser.uid);
      
      if (profile?.role !== 'salesman') {
        setError('Access denied: You are not a salesman.');
        setLoading(false);
        return;
      }
      
      if (profile?.active !== true) {
        setError('Your account is not activated yet. Please contact admin.');
        setLoading(false);
        return;
      }

      // Load colleges
      const collegesResult = await getCollegesBySalesman(currentUser.uid);
      if (collegesResult.error) {
        console.error('Error loading colleges:', collegesResult.error);
        // Check if it's a permission error
        if (collegesResult.error.includes('permission') || collegesResult.error.includes('insufficient')) {
          setError(`Permission error: ${collegesResult.error}. Please ensure Firestore rules are deployed and your account is active.`);
        } else if (collegesResult.error.includes('index')) {
          setError(`Database index required: ${collegesResult.error}. The query will work without sorting. Please create the index in Firebase Console.`);
          // Still try to load without error message if it's just an index issue
          setColleges(collegesResult.colleges || []);
        } else {
          setError(collegesResult.error);
        }
      } else {
        setColleges(collegesResult.colleges as College[]);
      }

      // Load college admins
      const adminsResult = await getCollegeAdminsBySalesman(currentUser.uid);
      if (adminsResult.error) {
        console.error('Error loading admins:', adminsResult.error);
        // Only set error if colleges didn't already set one
        if (!collegesResult.error) {
          if (adminsResult.error.includes('permission') || adminsResult.error.includes('insufficient')) {
            setError(`Permission error loading admins: ${adminsResult.error}`);
          } else {
            setError(adminsResult.error);
          }
        }
      } else {
        setCollegeAdmins(adminsResult.admins as CollegeAdmin[]);
      }

      // Load stats for all colleges
      if (collegesResult.colleges) {
        const statsPromises = collegesResult.colleges.map(async (college: College) => {
          const statsResult = await getCollegeUserStats(college.id, currentUser.uid);
          if (statsResult.stats) {
            return { collegeId: college.id, stats: statsResult.stats };
          }
          return null;
        });
        
        const statsResults = await Promise.all(statsPromises);
        const statsMap: { [collegeId: string]: CollegeStats } = {};
        statsResults.forEach(result => {
          if (result) {
            statsMap[result.collegeId] = result.stats;
          }
        });
        setCollegeStats(statsMap);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = async () => {
    if (!newCollege.name.trim()) {
      setError('College name is required');
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await addCollege(newCollege, currentUser.uid);
      if (result.success) {
        setShowAddCollege(false);
        setNewCollege({
          name: '',
          shortName: '',
          type: '',
          affiliation: '',
          location: '',
          city: '',
          state: '',
          pincode: '',
          website: ''
        });
        await loadData();
      } else {
        setError(result.error || 'Failed to add college');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add college');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email.trim() || !newAdmin.firstName.trim() || !newAdmin.lastName.trim() || !newAdmin.password.trim() || !newAdmin.collegeId) {
      setError('All fields are required');
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await addCollegeAdmin(newAdmin, currentUser.uid);
      if (result.success) {
        setShowAddAdmin(false);
        setNewAdmin({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          collegeId: '',
          collegeName: ''
        });
        await loadData();
      } else {
        setError(result.error || 'Failed to add college admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add college admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm('Are you sure you want to delete this college admin? This action cannot be undone.')) {
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteCollegeAdmin(adminId, currentUser.uid);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error || 'Failed to delete college admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete college admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege = async (collegeId: string, collegeName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${collegeName}"? This action cannot be undone and will also affect all associated college admins and users.`)) {
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteCollege(collegeId, currentUser.uid);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error || 'Failed to delete college');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete college');
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeSelect = (collegeId: string) => {
    setSelectedCollege(selectedCollege === collegeId ? null : collegeId);
  };

  const getAdminsForCollege = (collegeId: string) => {
    return collegeAdmins.filter(admin => admin.institutionId === collegeId);
  };

  if (loading && colleges.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salesman Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage colleges and college admins</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Colleges</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{colleges.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">College Admins</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{collegeAdmins.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {Object.values(collegeStats).reduce((sum, stats) => sum + stats.total, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowAddCollege(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add College</span>
          </button>
          <button
            onClick={() => setShowAddAdmin(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add College Admin</span>
          </button>
        </div>

        {/* Colleges List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Colleges</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {colleges.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No colleges found. Add your first college to get started.
              </div>
            ) : (
              colleges.map((college) => {
                const admins = getAdminsForCollege(college.id);
                const stats = collegeStats[college.id] || { leaders: 0, educators: 0, faculty: 0, students: 0, total: 0 };
                const isExpanded = selectedCollege === college.id;

                return (
                  <div key={college.id} className="p-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleCollegeSelect(college.id)}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{college.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollege(college.id, college.name);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete College"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="ml-4">
                        {isExpanded ? (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {college.city && <span>📍 {college.city}</span>}
                      {college.type && <span>🏫 {college.type}</span>}
                      <span>👥 {stats.total} users</span>
                      <span>👨‍💼 {admins.length} admins</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 space-y-4">
                        {/* College Details */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">College Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {college.shortName && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Short Name:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.shortName}</span>
                              </div>
                            )}
                            {college.affiliation && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Affiliation:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.affiliation}</span>
                              </div>
                            )}
                            {college.location && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.location}</span>
                              </div>
                            )}
                            {college.state && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">State:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.state}</span>
                              </div>
                            )}
                            {college.website && (
                              <div className="col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">Website:</span>
                                <a href={college.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                                  {college.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subscription Plan */}
                        {(college.planDurationDays || college.userLimit) && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Subscription Plan</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {college.planDurationDays && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white font-medium">{college.planDurationDays} Days</span>
                                </div>
                              )}
                              {college.userLimit && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">User Limit:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white font-medium">{college.userLimit}</span>
                                </div>
                              )}
                              {college.planStartDate && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    {college.planStartDate.toDate ? college.planStartDate.toDate().toLocaleDateString() : new Date(college.planStartDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {college.planEndDate && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                                  <span className={`ml-2 font-medium ${
                                    (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date()
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {college.planEndDate.toDate ? college.planEndDate.toDate().toLocaleDateString() : new Date(college.planEndDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* User Statistics */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.leaders}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Leader</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.educators}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Educator</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.faculty}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.students}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                            </div>
                          </div>
                        </div>

                        {/* College Admins */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">College Admins</h4>
                            <button
                              onClick={() => {
                                setNewAdmin({ ...newAdmin, collegeId: college.id, collegeName: college.name });
                                setShowAddAdmin(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 text-sm bg-[#9b0101] text-white rounded hover:bg-[#7a0101] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Admin</span>
                            </button>
                          </div>
                          {admins.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No college admins yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {admins.map((admin) => (
                                <div key={admin.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {admin.firstName} {admin.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Admin"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add College Modal */}
      {showAddCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New College</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter college name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Name</label>
                  <input
                    type="text"
                    value={newCollege.shortName}
                    onChange={(e) => setNewCollege({ ...newCollege, shortName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <input
                    type="text"
                    value={newCollege.type}
                    onChange={(e) => setNewCollege({ ...newCollege, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Engineering, Arts, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affiliation</label>
                <input
                  type="text"
                  value={newCollege.affiliation}
                  onChange={(e) => setNewCollege({ ...newCollege, affiliation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={newCollege.city}
                    onChange={(e) => setNewCollege({ ...newCollege, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    value={newCollege.state}
                    onChange={(e) => setNewCollege({ ...newCollege, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newCollege.location}
                    onChange={(e) => setNewCollege({ ...newCollege, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newCollege.pincode}
                    onChange={(e) => setNewCollege({ ...newCollege, pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={newCollege.website}
                  onChange={(e) => setNewCollege({ ...newCollege, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddCollege(false);
                  setNewCollege({
                    name: '',
                    shortName: '',
                    type: '',
                    affiliation: '',
                    location: '',
                    city: '',
                    state: '',
                    pincode: '',
                    website: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollege}
                disabled={loading}
                className="px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add College'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add College Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add College Admin</h3>
            </div>
            <div className="p-6 space-y-4">
              {!newAdmin.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select College <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={newAdmin.collegeId}
                    onChange={(e) => {
                      const college = colleges.find(c => c.id === e.target.value);
                      setNewAdmin({ ...newAdmin, collegeId: e.target.value, collegeName: college?.name || '' });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a college</option>
                    {colleges.map(college => (
                      <option key={college.id} value={college.id}>{college.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {newAdmin.collegeId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>College:</strong> {newAdmin.collegeName}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdmin({
                    email: '',
                    firstName: '',
                    lastName: '',
                    password: '',
                    collegeId: '',
                    collegeName: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={loading || !newAdmin.collegeId}
                className="px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmanDashboard;

