import React, { useState, useEffect } from 'react';
import { Users, FileText, Megaphone, Settings, Plus, Edit, Trash2, Eye, Database, BookOpen, Calendar } from 'lucide-react';
import { getAllUsers, getArticles, getSponsors } from '../../utils/firebase';
import { addSampleArticles, addSampleSponsors } from '../../utils/sampleData';
import { seedResourceTabs } from '../../utils/seedResourceTabs';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    sponsors: 0
  });
  const [loading, setLoading] = useState(true);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
