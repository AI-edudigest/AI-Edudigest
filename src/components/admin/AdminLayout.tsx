import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Megaphone, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Calendar
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ArticlesManager from './ArticlesManager';
import SponsorsManager from './SponsorsManager';
import AdsManager from './AdsManager';
import UsersManager from './UsersManager';
import SettingsManager from './SettingsManager';
import ResourceTabsManager from './ResourceTabsManager';
import ResourceTabContentManager from './ResourceTabContentManager';
import SidebarTabsManager from './SidebarTabsManager';
import EventsManager from './EventsManager';

interface AdminLayoutProps {
  onLogout: () => void;
  onBackToHome?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentManagerTab, setContentManagerTab] = useState<{tabId: string, tabName: string} | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'sponsors', label: 'Sponsors', icon: Megaphone },
    { id: 'ads', label: 'Ads', icon: Megaphone },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'resourceTabs', label: 'Resource Tabs', icon: BookOpen },
    { id: 'sidebarTabs', label: 'Sidebar Tabs', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveTab} />;
      case 'articles':
        return <ArticlesManager />;
      case 'sponsors':
        return <SponsorsManager />;
      case 'ads':
        return <AdsManager />;
      case 'events':
        return <EventsManager />;
      case 'resourceTabs':
        return contentManagerTab ? (
          <ResourceTabContentManager 
            tabId={contentManagerTab.tabId}
            tabName={contentManagerTab.tabName}
            onBack={() => setContentManagerTab(null)}
          />
        ) : (
          <ResourceTabsManager onManageContent={(tabId, tabName) => setContentManagerTab({tabId, tabName})} />
        );
      case 'sidebarTabs':
        return <SidebarTabsManager />;
      case 'users':
        return <UsersManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#9b0101] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium">{tab.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && (
              <span className="ml-3 font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Admin Panel'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'dashboard' && 'Overview and quick actions'}
                  {activeTab === 'articles' && 'Manage articles and content'}
                  {activeTab === 'sponsors' && 'Manage sponsors and partnerships'}
                  {activeTab === 'resourceTabs' && 'Manage resource content and information'}
                  {activeTab === 'sidebarTabs' && 'Manage sidebar navigation menu'}
                  {activeTab === 'users' && 'Manage user accounts and roles'}
                  {activeTab === 'settings' && 'Configure site settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Admin Access
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
