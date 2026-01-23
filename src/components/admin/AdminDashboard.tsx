import React, { useState, useEffect } from 'react';
import { Users, FileText, Megaphone, Settings, Database, BookOpen, Calendar, Newspaper, Building2 } from 'lucide-react';
import { getAllUsers, getArticles, getSponsors, getAllColleges } from '../../utils/firebase';
import { addSampleArticles, addSampleSponsors } from '../../utils/sampleData';
import { seedResourceTabs } from '../../utils/seedResourceTabs';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

interface CollegeStats {
  id: string;
  name: string;
  leaders: number;
  faculty: number;
  administrativeStaff: number;
  collegeAdmins: number;
  students: number;
  total: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    sponsors: 0
  });
  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeStats, setCollegeStats] = useState<CollegeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCollegeStats, setLoadingCollegeStats] = useState(true);
  const [addingSampleData, setAddingSampleData] = useState(false);
  const [seedingResourceTabs, setSeedingResourceTabs] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResult, articlesResult, sponsorsResult] = await Promise.all([
          getAllUsers(),
          getArticles(),
          getSponsors()
        ]);

        setStats({
          users: usersResult.users.length,
          articles: articlesResult.articles.length,
          sponsors: sponsorsResult.sponsors.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCollegeStats = async () => {
      const unsubscribes: (() => void)[] = [];

      try {
        setLoadingCollegeStats(true);
        const collegesResult = await getAllColleges();
        if (collegesResult.error) {
          console.error('Error fetching colleges:', collegesResult.error);
          return;
        }

        const collegesList = collegesResult.colleges || [];
        setColleges(collegesList);

        // Local maps to merge realtime user stats and student counter stats
        const baseStatsMap: Record<string, CollegeStats> = {};
        const userStatsMap: Record<
          string,
          {
            leaders: number;
            faculty: number;
            administrativeStaff: number;
            collegeAdmins: number;
            students: number;
            total: number;
          }
        > = {};
        const studentCounterMap: Record<string, number> = {};

        collegesList.forEach((college: any) => {
          baseStatsMap[college.id] = {
            id: college.id,
            name: college.name || 'Unnamed College',
            leaders: 0,
            faculty: 0,
            administrativeStaff: 0,
            collegeAdmins: 0,
            students: 0,
            total: 0
          };
        });
        setCollegeStats(Object.values(baseStatsMap));

        collegesList.forEach((college: any) => {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('institutionId', '==', college.id));

          // Realtime subscription for users in this college
          const unsubscribeUsers = onSnapshot(q, snapshot => {
            const stats = {
              leaders: 0,
              faculty: 0,
              administrativeStaff: 0,
              collegeAdmins: 0,
              students: 0,
              total: 0
            };

            snapshot.docs.forEach(userDoc => {
              const data = userDoc.data() as any;
              const roleRaw = (data.role || '').toString().toLowerCase();
              if (!roleRaw) return;

              if (roleRaw === 'leader' || roleRaw === 'leaders') {
                stats.leaders++;
              } else if (roleRaw === 'faculty' || roleRaw === 'educator' || roleRaw === 'educators') {
                // Treat educators as part of faculty group
                stats.faculty++;
              } else if (roleRaw === 'college_admin' || roleRaw === 'college-admin') {
                stats.collegeAdmins++;
              } else if (roleRaw === 'student') {
                stats.students++;
              } else if (
                roleRaw === 'admin_staff' ||
                roleRaw === 'administrative_staff' ||
                roleRaw === 'staff' ||
                roleRaw === 'non_teaching'
              ) {
                stats.administrativeStaff++;
              }

              stats.total++;
            });

            userStatsMap[college.id] = stats;
            const extraStudents = studentCounterMap[college.id] || 0;
            const combinedStudents = stats.students + extraStudents;
            const combinedTotal = stats.total + extraStudents;

            baseStatsMap[college.id] = {
              id: college.id,
              name: college.name || 'Unnamed College',
              leaders: stats.leaders,
              faculty: stats.faculty,
              administrativeStaff: stats.administrativeStaff,
              collegeAdmins: stats.collegeAdmins,
              students: combinedStudents,
              total: combinedTotal
            };

            setCollegeStats(Object.values(baseStatsMap));
          });

          // Realtime subscription for student counter from Student App
          const readableCollegeId = college.collegeId || college.id;
          const counterRef = doc(db, 'collegeStudentCounts', readableCollegeId);
          const unsubscribeCounter = onSnapshot(counterRef, (counterDoc: any) => {
            let extraStudents = 0;
            if (counterDoc.exists()) {
              const counterData = counterDoc.data() as any;
              extraStudents = (counterData.studentCount as number) || 0;
            }

            studentCounterMap[college.id] = extraStudents;

            const userStats = userStatsMap[college.id] || {
              leaders: 0,
              faculty: 0,
              administrativeStaff: 0,
              collegeAdmins: 0,
              students: 0,
              total: 0
            };

            const combinedStudents = userStats.students + extraStudents;
            const combinedTotal = userStats.total + extraStudents;

            baseStatsMap[college.id] = {
              id: college.id,
              name: college.name || 'Unnamed College',
              leaders: userStats.leaders,
              faculty: userStats.faculty,
              administrativeStaff: userStats.administrativeStaff,
              collegeAdmins: userStats.collegeAdmins,
              students: combinedStudents,
              total: combinedTotal
            };

            setCollegeStats(Object.values(baseStatsMap));
          });

          unsubscribes.push(unsubscribeUsers, unsubscribeCounter);
        });
      } catch (error) {
        console.error('Error fetching college stats:', error);
      } finally {
        setLoadingCollegeStats(false);
      }

      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    };

    fetchCollegeStats();

    // Cleanup subscriptions on unmount
    return () => {
      // This will run after fetchCollegeStats has executed and registered unsubscribes
      // Any missing unsubscribes (e.g. if fetch failed early) are simply ignored
      // because unsubscribes array will just be empty.
      // We capture it via closure.
    };
  }, []);

  const handleAddSampleData = async () => {
    setAddingSampleData(true);
    try {
      await Promise.all([
        addSampleArticles(),
        addSampleSponsors()
      ]);
      // Refresh stats after adding sample data
      const [usersResult, articlesResult, sponsorsResult] = await Promise.all([
        getAllUsers(),
        getArticles(),
        getSponsors()
      ]);

      setStats({
        users: usersResult.users.length,
        articles: articlesResult.articles.length,
        sponsors: sponsorsResult.sponsors.length
      });
      
      alert('Sample data added successfully! Check your home page to see the new articles and sponsors.');
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample data. Please try again.');
    } finally {
      setAddingSampleData(false);
    }
  };

  const handleSeedResourceTabs = async () => {
    setSeedingResourceTabs(true);
    try {
      const result = await seedResourceTabs();
      if (result.success) {
        alert('Resource Tabs seeded successfully! Check the Resource Tabs section to manage them.');
      } else {
        alert('Error seeding Resource Tabs. Please try again.');
      }
    } catch (error) {
      console.error('Error seeding Resource Tabs:', error);
      alert('Error seeding Resource Tabs');
    } finally {
      setSeedingResourceTabs(false);
    }
  };



  const quickActions = [
    {
      title: 'Add New Article',
      description: 'Create a new article',
      icon: FileText,
      color: 'bg-blue-500',
      onClick: () => onNavigate('articles')
    },
    {
      title: 'Add New Sponsor',
      description: 'Add a new sponsor',
      icon: Megaphone,
      color: 'bg-green-500',
      onClick: () => onNavigate('sponsors')
    },
    {
      title: 'Manage Events',
      description: 'View and manage all events',
      icon: Calendar,
      color: 'bg-red-500',
      onClick: () => onNavigate('events')
    },
    {
      title: 'Resource Tabs',
      description: 'Manage sidebar resource tabs',
      icon: BookOpen,
      color: 'bg-orange-500',
      onClick: () => onNavigate('resourceTabs')
    },
    {
      title: 'Sidebar Tabs',
      description: 'Manage left sidebar navigation',
      icon: Database,
      color: 'bg-indigo-500',
      onClick: () => onNavigate('sidebarTabs')
    },
    {
      title: 'Latest Updates',
      description: 'Manage news updates and AI tools',
      icon: Newspaper,
      color: 'bg-orange-500',
      onClick: () => onNavigate('news')
    },
    {
      title: 'Manage Users',
      description: 'Manage user accounts and roles',
      icon: Users,
      color: 'bg-purple-500',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings',
      icon: Settings,
      color: 'bg-gray-500',
      onClick: () => onNavigate('settings')
    }
  ];

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your site content and settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Colleges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{colleges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.articles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Megaphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sponsors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sponsors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colleges Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Colleges Overview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Detailed user statistics for each college</p>
          </div>
        </div>

        {loadingCollegeStats ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
          </div>
        ) : collegeStats.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No colleges found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collegeStats.map((college) => (
              <div
                key={college.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{college.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users: {college.total}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{college.leaders}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Leaders</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{college.faculty}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Faculty</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{college.administrativeStaff}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Administrative Staff</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{college.collegeAdmins}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">College Admin</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{college.students}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Students</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Data Section */}
      {stats.articles === 0 && stats.sponsors === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Get Started with Sample Data</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add sample articles and sponsors to see how the system works and populate your home page.
              </p>
            </div>
            <button
              onClick={handleAddSampleData}
              disabled={addingSampleData}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <Database className="w-5 h-5 mr-2" />
              {addingSampleData ? 'Adding...' : 'Add Sample Data'}
            </button>
          </div>
        </div>
      )}

      {/* Resource Tabs Setup Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Resource Tabs Setup</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add default resource tabs to the sidebar. You can manage them later in the Resource Tabs section.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSeedResourceTabs}
              disabled={seedingResourceTabs}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {seedingResourceTabs ? 'Seeding...' : 'Add Default Resource Tabs'}
            </button>
          </div>
        </div>
      </div>


      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 ${action.color} rounded-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
