import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, MapPin, User, Clock, Edit } from 'lucide-react';
import { subscribeToEvents, deleteEvent, getUserRole } from '../../utils/firebase';

interface Event {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  createdBy: string;
  createdAt: any;
}

const EventsManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [creatorNames, setCreatorNames] = useState<{[key: string]: string}>({});

  // Load events with real-time updates
  useEffect(() => {
    console.log('🔄 Setting up events subscription for admin panel');
    
    const unsubscribe = subscribeToEvents((eventsData) => {
      console.log('✅ Admin events update received:', eventsData.length, 'events');
      setEvents(eventsData);
      setLoading(false);
      
      // Fetch creator names for events
      fetchCreatorNames(eventsData);
    });

    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up admin events subscription');
        unsubscribe();
      }
    };
  }, []);

  // Fetch creator names for display
  const fetchCreatorNames = async (eventsData: Event[]) => {
    const uniqueUserIds = [...new Set(eventsData.map(event => event.createdBy))];
    const names: {[key: string]: string} = {};
    
    for (const userId of uniqueUserIds) {
      try {
        const role = await getUserRole(userId);
        // For now, we'll use the role as the display name
        // In a real app, you might want to fetch the actual user name
        names[userId] = role || 'Unknown User';
      } catch (error) {
        console.error('Error fetching user role for:', userId, error);
        names[userId] = 'Unknown User';
      }
    }
    
    setCreatorNames(names);
  };

  // Delete event handlers
  const handleDeleteClick = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventToDelete.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
        alert('Event deleted successfully!');
      } else {
        alert('Failed to delete event: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display (HH:MM to 12-hour format)
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Format creation date
  const formatCreatedAt = (createdAt: any) => {
    try {
      if (createdAt && createdAt.toDate) {
        return createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (createdAt) {
        return new Date(createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all events created by users and principals
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Events: {events.length}
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Events Found</h3>
          <p className="text-gray-600 dark:text-gray-400">No events have been created yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Calendar className="w-5 h-5 text-[#9b0101] mt-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {event.title}
                            </h3>
                            {event.type && (
                              <span className="px-2 py-1 bg-[#9b0101]/10 dark:bg-[#9b0101]/20 text-[#9b0101] text-xs rounded-full">
                                {event.type}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {event.date && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDate(event.date)}
                              {event.time && ` at ${formatTime(event.time)}`}
                            </span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {creatorNames[event.createdBy] || 'Loading...'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCreatedAt(event.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteClick(event.id, event.title)}
                          className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete event"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Event
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete the event{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    "{eventToDelete.title}"
                  </span>?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Event'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
