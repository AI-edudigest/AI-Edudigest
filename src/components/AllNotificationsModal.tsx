import React, { useState, useEffect } from 'react';
import { X, Bell, Trash2, Check, CheckCheck, Clock, AlertCircle, Info, BookOpen, Wrench, Calendar, GraduationCap, Trophy } from 'lucide-react';
import { getAllNotifications, markAllNotificationsAsRead, clearAllNotifications, deleteNotification } from '../utils/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'article' | 'tool' | 'event' | 'book' | 'course' | 'system';
  actionUrl?: string;
  isRead: boolean;
  createdAt: any;
}

interface AllNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AllNotificationsModal: React.FC<AllNotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [error, setError] = useState('');

  // Load all notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllNotifications();
    }
  }, [isOpen]);

  const loadAllNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications as Notification[]);
    } catch (error: any) {
      console.error('Error loading all notifications:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your account permissions.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAsRead(true);
    setError('');
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      } else {
        setError(result.error || 'Failed to mark notifications as read');
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. You cannot modify notifications.');
      } else {
        setError('Failed to mark notifications as read');
      }
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    setError('');
    try {
      const result = await clearAllNotifications();
      if (result.success) {
        setNotifications([]);
      } else {
        setError(result.error || 'Failed to clear notifications');
      }
    } catch (error: any) {
      console.error('Error clearing all notifications:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. You cannot delete notifications.');
      } else {
        setError('Failed to clear notifications');
      }
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      } else {
        setError(result.error || 'Failed to delete notification');
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. You cannot delete this notification.');
      } else {
        setError('Failed to delete notification');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'tool':
        return <Wrench className="w-4 h-4 text-green-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-orange-500" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationTime.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in-50 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#9b0101]/10 rounded-lg">
              <Bell className="w-5 h-5 text-[#9b0101]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Notifications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAsRead || unreadCount === 0}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {markingAsRead ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCheck className="w-3 h-3" />
              )}
              <span>Mark All Read</span>
            </button>
            
            <button
              onClick={handleClearAll}
              disabled={clearing || notifications.length === 0}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {clearing ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>Clear All</span>
            </button>
          </div>
          
          <button
            onClick={loadAllNotifications}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-[#9b0101] rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </span>
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </div>
                        
                        {/* Actions - Now properly positioned */}
                        <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => {
                                setNotifications(prev => 
                                  prev.map(n => 
                                    n.id === notification.id ? { ...n, isRead: true } : n
                                  )
                                );
                              }}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You'll see notifications here when they arrive
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Total: {notifications.length} notifications</span>
            <span>Unread: {unreadCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllNotificationsModal;
