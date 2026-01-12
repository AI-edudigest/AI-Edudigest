import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  LogOut, 
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  getCollegesBySalesman, 
  addCollege,
  deleteCollege,
  updateCollegeBySalesman,
  getCollegeAdminsBySalesman,
  addCollegeAdmin,
  deleteCollegeAdmin,
  getCollegeUserStats,
  subscribeToCollegeUserStats,
  getCurrentUser,
  formatPlanDuration
} from '../../utils/firebase';

interface College {
  id: string;
  name: string;
  collegeId?: string; // Human-readable short ID stored in Firestore (max 5 chars)
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
  totalStudents?: number;
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
  administrativeStaff: number;
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
  
  // Add College Modal State (combined form for college and admin)
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollege, setNewCollege] = useState({
    name: '',
    type: '',
    state: '',
    city: '',
    email: '',
    password: '',
    userLimit: 10,
    planDurationDays: 30 // Default to 1 month (30 days)
  });

  // Edit Plan Modal State
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null);
  const [planData, setPlanData] = useState({
    userLimit: 10,
    planDurationDays: 30 // Default to 1 month (30 days)
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
    if (!newCollege.name.trim() || !newCollege.type.trim() || !newCollege.state.trim() || !newCollege.city.trim() || !newCollege.email.trim() || !newCollege.password.trim()) {
      setError('All fields are required');
      return;
    }

    if (newCollege.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // First, create the college
      const collegeData = {
        name: newCollege.name,
        type: newCollege.type,
        state: newCollege.state,
        city: newCollege.city,
        shortName: '',
        affiliation: '',
        location: '',
        pincode: '',
        website: '',
        userLimit: newCollege.userLimit,
        planDurationDays: newCollege.planDurationDays
      };
      
      const collegeResult = await addCollege(collegeData, currentUser.uid);
      if (!collegeResult.success) {
        setError(collegeResult.error || 'Failed to add college');
        setLoading(false);
        return;
      }

      // Then, create the college admin
      const adminData = {
        email: newCollege.email,
        firstName: newCollege.name.split(' ')[0] || 'Admin',
        lastName: newCollege.name.split(' ').slice(1).join(' ') || '',
        password: newCollege.password,
        collegeId: collegeResult.collegeId || '',
        collegeName: newCollege.name
      };

      const adminResult = await addCollegeAdmin(adminData, currentUser.uid);
      if (!adminResult.success) {
        setError(adminResult.error || 'College created but failed to add admin');
        setLoading(false);
        return;
      }

      // Reset form and close modal
      setShowAddCollege(false);
      setNewCollege({
        name: '',
        type: '',
        state: '',
        city: '',
        email: '',
        password: '',
        userLimit: 10,
        planDurationDays: 30
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add college');
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

  const handleEditPlan = (college: College) => {
    setEditingCollegeId(college.id);
    setPlanData({
      userLimit: college.userLimit || 10,
      planDurationDays: college.planDurationDays || 30
    });
    setShowEditPlan(true);
  };

  const handleUpdatePlan = async () => {
    if (!editingCollegeId || !currentUser) return;

    if (planData.userLimit < 1 || planData.userLimit > 30) {
      setError('User limit must be between 1 and 30');
      return;
    }

    const validDurations = [5, 15, 30, 90, 180, 270, 360];
    if (!validDurations.includes(planData.planDurationDays)) {
      setError('Plan duration must be 5 days, 15 days, 1 month, 3 months, 6 months, 9 months, or 12 months');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateCollegeBySalesman(editingCollegeId, planData, currentUser.uid);
      if (result.success) {
        setShowEditPlan(false);
        setEditingCollegeId(null);
        await loadData();
      } else {
        setError(result.error || 'Failed to update plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
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
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{college.name}</h3>
                          {college.collegeId && (
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                              ID: <span className="text-gray-900 dark:text-white">{college.collegeId}</span>
                            </span>
                          )}
                        </div>
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
                            {college.type && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.type}</span>
                              </div>
                            )}
                            {college.city && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">City:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.city}</span>
                              </div>
                            )}
                            {college.state && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">State:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{college.state}</span>
                              </div>
                            )}
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
                            {college.website && (
                              <div className="col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">Website:</span>
                                <a href={college.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                                  {college.website}
                                </a>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                {typeof college.totalStudents === 'number' ? college.totalStudents : stats.students}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Subscription Plan */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Subscription Plan</h4>
                            <button
                              onClick={() => handleEditPlan(college)}
                              className="px-3 py-1 text-sm bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
                            >
                              Edit Plan
                            </button>
                          </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {/* Plan Status */}
                              {college.planEndDate && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                  <span
                                    className={`ml-2 font-semibold ${
                                      (college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date()
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-green-700 dark:text-green-400'
                                    }`}
                                  >
                                    {(college.planEndDate.toDate ? college.planEndDate.toDate() : new Date(college.planEndDate)) < new Date()
                                      ? 'Expired'
                                      : 'Active'}
                                  </span>
                                </div>
                              )}
                              {college.planDurationDays && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white font-medium">{formatPlanDuration(college.planDurationDays)}</span>
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

                        {/* User Statistics */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">User Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.leaders}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Leader</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.educators + stats.faculty}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.administrativeStaff}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Administrative staff</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New College</h3>
              <button
                onClick={() => {
                  setShowAddCollege(false);
                  setNewCollege({
                    name: '',
                    type: '',
                    state: '',
                    city: '',
                    email: '',
                    password: '',
                    userLimit: 10,
                    planDurationDays: 30
                  });
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCollege.type}
                  onChange={(e) => setNewCollege({ ...newCollege, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Engineering, Arts, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCollege.state}
                  onChange={(e) => setNewCollege({ ...newCollege, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCollege.city}
                  onChange={(e) => setNewCollege({ ...newCollege, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={newCollege.email}
                  onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="admin@college.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={newCollege.password}
                  onChange={(e) => setNewCollege({ ...newCollege, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Limit <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCollege.userLimit}
                  onChange={(e) => setNewCollege({ ...newCollege, userLimit: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Between 1 and 30 users</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Duration <span className="text-red-600">*</span>
                </label>
                <select
                  value={newCollege.planDurationDays}
                  onChange={(e) => setNewCollege({ ...newCollege, planDurationDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value={5}>5 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>1 month</option>
                  <option value={90}>3 months</option>
                  <option value={180}>6 months</option>
                  <option value={270}>9 months</option>
                  <option value={360}>12 months</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
              <button
                onClick={() => {
                  setShowAddCollege(false);
                  setNewCollege({
                    name: '',
                    type: '',
                    state: '',
                    city: '',
                    email: '',
                    password: '',
                    userLimit: 10,
                    planDurationDays: 30 // Default to 1 month
                  });
                  setError(null);
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

      {/* Edit Plan Modal */}
      {showEditPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Plan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Limit <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={planData.userLimit}
                  onChange={(e) => setPlanData({ ...planData, userLimit: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Between 1 and 30 users</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Duration <span className="text-red-600">*</span>
                </label>
                <select
                  value={planData.planDurationDays}
                  onChange={(e) => setPlanData({ ...planData, planDurationDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value={5}>5 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>1 month</option>
                  <option value={90}>3 months</option>
                  <option value={180}>6 months</option>
                  <option value={270}>9 months</option>
                  <option value={360}>12 months</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditPlan(false);
                  setEditingCollegeId(null);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlan}
                disabled={loading}
                className="px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesmanDashboard;

