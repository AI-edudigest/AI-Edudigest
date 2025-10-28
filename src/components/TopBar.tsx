import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, LogOut, X, Home, BookOpen, Lightbulb, Shield, Users, BarChart3, Megaphone, DollarSign, Target, Award, TrendingUp, Globe, Sparkles, FileText, Settings, User as UserIcon, Mail, Building2, Briefcase } from 'lucide-react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, getCurrentUser, getUserProfile } from '../utils/firebase';
import { useSearch } from '../contexts/SearchContext';
import AdsCarousel from './AdsCarousel';
import AllNotificationsModal from './AllNotificationsModal';

interface PageInfo {
  title: string;
  subtitle: string;
  icon: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'article' | 'tool' | 'event' | 'book' | 'course' | 'system';
  actionUrl?: string;
  isRead: boolean;
  createdAt: any;
}

interface TopBarProps {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  activeSection: string;
  onLogout?: () => void;
  pageInfo?: PageInfo | null;
  isAdmin?: boolean;
  onAdminPanelToggle?: () => void;
  currentTopicName?: string | null;
}

const TopBar: React.FC<TopBarProps> = ({ isDarkMode, setIsDarkMode, onLogout, pageInfo, isAdmin, onAdminPanelToggle, currentTopicName }) => {
  const { searchQuery, setSearchQuery, performSearch, showSearchResults, setShowSearchResults } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  
  // User profile states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    institution: string;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load notifications from Firebase
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const [notificationsData, unreadCountData] = await Promise.all([
          getNotifications(10),
          getUnreadNotificationCount()
        ]);
        setNotifications(notificationsData as Notification[]);
        setUnreadCount(unreadCountData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load user profile from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setLoadingProfile(true);
        try {
          const { profile, error } = await getUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            console.error('Error loading user profile:', error);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown-container')) {
        if (showProfileDropdown) setShowProfileDropdown(false);
        if (showProfileModal) setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showProfileModal]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Home,
      BookOpen,
      Lightbulb,
      Shield,
      Users,
      BarChart3,
      Megaphone,
      DollarSign,
      Target,
      Award,
      TrendingUp,
      Globe,
      Sparkles,
      FileText
    };
    return iconMap[iconName] || BookOpen;
  };

  const formatTimeAgo = (date: any) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const notificationDate = date.toDate ? date.toDate() : new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    }
    
    // Handle action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleViewAllNotifications = () => {
    setShowAllNotificationsModal(true);
    setShowNotifications(false);
  };


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setShowProfileDropdown(false);
      if (onLogout) {
        onLogout();
      }
    }
  };

  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'leaders': return 'Leader';
      case 'faculty': return 'Faculty';
      case 'college-admin': return 'College Administration Staff';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-200 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentTopicName && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#9b0101] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentTopicName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Topic Content
                </p>
              </div>
            </div>
          )}
          {!currentTopicName && pageInfo && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#9b0101] rounded-lg flex items-center justify-center">
                {React.createElement(getIconComponent(pageInfo.icon), { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pageInfo.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Ads Carousel Section */}
        <div className="flex-1 flex justify-center px-4">
          <AdsCarousel institutionName={userProfile?.institution} />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative z-50">
            <Search className="w-3 h-3 absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchSubmit}
              onFocus={handleSearchFocus}
              className="pl-6 pr-2 py-1 w-48 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 relative transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9b0101] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101] mx-auto"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[#9b0101] rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications yet
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleViewAllNotifications}
                    className="text-sm text-[#9b0101] hover:underline font-medium transition-colors"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Panel Button */}
          {isAdmin && onAdminPanelToggle && (
            <button 
              onClick={onAdminPanelToggle}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#9b0101] dark:hover:text-[#9b0101] transition-colors duration-200"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative profile-dropdown-container">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#9b0101] dark:hover:text-[#9b0101] transition-colors duration-200 flex items-center space-x-2"
              title="User Profile"
            >
              <div className="w-8 h-8 bg-[#9b0101] rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <button
                    onClick={handleViewProfile}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Popover Panel (anchored) */}
            {showProfileModal && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#9b0101] to-[#7a0101] rounded-t-2xl p-5">
                  <button
                    onClick={handleCloseProfileModal}
                    className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close profile"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                      <UserIcon className="w-7 h-7 text-[#9b0101]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">User Profile</h3>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {loadingProfile ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
                    </div>
                  ) : userProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{userProfile.firstName} {userProfile.lastName}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{userProfile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{getRoleDisplayName(userProfile.role)}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">College/Institution</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{userProfile.institution || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">Unable to load profile information</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={showAllNotificationsModal}
        onClose={() => setShowAllNotificationsModal(false)}
      />

      {/* Removed centered modal; using anchored popover above */}
    </header>
  );
};

export default TopBar;