import React, { useState, useEffect } from 'react';
import { Zap, Calendar, Book, Lightbulb, GraduationCap, ExternalLink, Clock, MapPin, Star, Download, ChevronLeft, Check, Plus, X, Trash2, BookOpen, Edit } from 'lucide-react';
import { BackButtonProps } from '../../types/common';
import { getResourceTabs, getResourceTabContent, addEvent, updateEvent, deleteEvent, subscribeToEvents } from '../../utils/firebase';
import FeedbackPage from './FeedbackPage';
import EguideViewer from './EguideViewer';

interface ResourcePageProps extends BackButtonProps {
  resourceType: string;
  userRole?: string;
}

const ResourcePage: React.FC<ResourcePageProps> = ({ resourceType, onGoBack, canGoBack, userRole }) => {
  console.log('🔍 ResourcePage received resourceType:', resourceType);
  console.log('🔍 ResourcePage - resourceType === "feedback":', resourceType === 'feedback');
  const [copiedTemplates, setCopiedTemplates] = useState<Set<string>>(new Set());
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Event creation/editing modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    type: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventSubmitError, setEventSubmitError] = useState('');
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyTemplate = async (templateText: string, templateId: string) => {
    try {
      await navigator.clipboard.writeText(templateText);
      setCopiedTemplates(prev => new Set(prev).add(templateId));
      
      // Remove the "copied" state after 2 seconds
      setTimeout(() => {
        setCopiedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy template:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = templateText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedTemplates(prev => new Set(prev).add(templateId));
      setTimeout(() => {
        setCopiedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
      }, 2000);
    }
  };

  // Event creation handlers
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setEventSubmitError('');
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!eventFormData.title.trim() || !eventFormData.date) {
      setEventSubmitError('Title and date are required fields.');
      return;
    }

    setIsSubmittingEvent(true);
    setEventSubmitError('');

    try {
      let result;
      if (editingEventId) {
        // Update existing event
        result = await updateEvent(editingEventId, eventFormData);
        if (result.success) {
          alert('Event updated successfully!');
        }
      } else {
        // Create new event
        result = await addEvent(eventFormData);
        if (result.success) {
          alert('Event added successfully!');
        }
      }
      
      if (result.success) {
        // Reset form and close modal
        setEventFormData({
          title: '',
          type: '',
          description: '',
          date: '',
          time: '',
          location: ''
        });
        setEditingEventId(null);
        setShowEventModal(false);
      } else {
        setEventSubmitError(result.error || `Failed to ${editingEventId ? 'update' : 'add'} event. Please try again.`);
      }
    } catch (error: any) {
      console.error(`Error ${editingEventId ? 'updating' : 'adding'} event:`, error);
      setEventSubmitError(error.message || `Failed to ${editingEventId ? 'update' : 'add'} event. Please try again.`);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const openEventModal = () => {
    setEditingEventId(null);
    setShowEventModal(true);
    setEventSubmitError('');
  };

  const openEditEventModal = (event: any) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.name || event.title || '',
      type: event.type || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || ''
    });
    setShowEventModal(true);
    setEventSubmitError('');
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEventId(null);
    setEventFormData({
      title: '',
      type: '',
      description: '',
      date: '',
      time: '',
      location: ''
    });
    setEventSubmitError('');
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

  // Load dynamic content from Firebase
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadDynamicContent = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading dynamic content for:', resourceType);
        
        // For upcoming events, use real-time subscription
        if (resourceType === 'upcomingEvents') {
          console.log('🔄 Setting up real-time events subscription for upcomingEvents');
          unsubscribe = subscribeToEvents((events) => {
            console.log('✅ Real-time events update received:', events.length, 'events');
            console.log('📋 Raw events data:', events);
            
            // Transform events to match the expected format
            const transformedEvents = events.map((event: any) => {
              const transformed = {
                id: event.id, // Keep the event ID for deletion
                name: event.title,
                type: event.type,
                description: event.description,
                date: event.date,
                time: event.time || '',
                location: event.location,
                link: null // Events don't have links by default
              };
              console.log('🔄 Transformed event:', transformed);
              return transformed;
            });
            
            console.log('📝 Setting dynamicItems to:', transformedEvents);
            setDynamicItems(transformedEvents);
            setLoading(false);
          });
          return;
        }
        
        // For other resource types, use the existing logic
        // First, get all resource tabs to find the matching tab
        const { tabs, error: tabsError } = await getResourceTabs();
        if (tabsError) {
          console.error('❌ Error fetching resource tabs:', tabsError);
          setDynamicItems([]);
          return;
        }
        
        // Helper to safely lowercase possibly undefined values
        const lc = (v: any) => (typeof v === 'string' ? v.toLowerCase() : '');
        
        // Find the tab that matches the current resource type
        const matchingTab = tabs.find(tab => {
          const tabName = lc((tab as any).name);
          const tabCategory = lc((tab as any).category);
          const tabLink = lc((tab as any).link);
          if (resourceType === 'aiTools') return tabName.includes('ai tools') || tabName.includes('tools');
          if (resourceType === 'recommendedBooks') return tabName.includes('books') || tabName.includes('recommended');
          if (resourceType === 'freeCourses') return tabName.includes('courses') || tabName.includes('free');
          if (resourceType === 'promptTemplates') {
            return tabName.includes('templates') || tabName.includes('prompt') || tabCategory === 'templates' || tabLink.includes('prompttemplates');
          }
          return false;
        });
        
        console.log('🔍 Looking for tab matching resourceType:', resourceType);
        console.log('🔍 Available tabs:', tabs.map(t => ({ name: (t as any).name, id: t.id })));
        console.log('🔍 Found matching tab:', matchingTab);
        
        if (matchingTab) {
          console.log('✅ Found matching tab:', (matchingTab as any).name);
          // Fetch content for other resource types
          const { contents, error: contentError } = await getResourceTabContent(matchingTab.id);
          if (contentError) {
            console.error('❌ Error fetching tab content:', contentError);
            setDynamicItems([]);
          } else {
            console.log('✅ Loaded content items:', contents.length);
            // Filter only active content
            const activeContents = contents.filter((content: any) => content.active);
            
            // Special handling for prompt templates - organize by categories
            if (resourceType === 'promptTemplates') {
              console.log('🎯 PROMPT TEMPLATES LOADING DEBUG:');
              console.log('🎯 Active contents:', activeContents);
              console.log('🎯 Contents length:', activeContents.length);
              
              // Define available categories with their metadata
              const categoryConfig: { [key: string]: { description: string; icon: string; color: string } } = {
                'Leaders': {
                  description: 'For College Principals, Directors, and Management',
                  icon: '👔',
                  color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                },
                'Administration': {
                  description: 'For College Administrative Staff, Office Personnel, and Clerks',
                  icon: '📋',
                  color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                },
                'Educators': {
                  description: 'For College Professors, Lecturers, and Teaching Faculty',
                  icon: '🎓',
                  color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                }
              };
              
              // Organize templates by category
              const organizedTemplates = Object.keys(categoryConfig).map(categoryName => {
                const categoryTemplates = activeContents.filter((template: any) => template.category === categoryName);
                console.log(`🎯 Category ${categoryName}:`, categoryTemplates.length, 'templates');
                
                return {
                  name: categoryName,
                  description: categoryConfig[categoryName].description,
                  icon: categoryConfig[categoryName].icon,
                  color: categoryConfig[categoryName].color,
                  templates: categoryTemplates.map((template: any) => ({
                    name: template.name,
                    description: template.description,
                    template: template.template
                  }))
                };
              }).filter(category => category.templates.length > 0);
              
              console.log('🎯 Organized templates:', organizedTemplates);
              console.log('🎯 Setting dynamicItems to:', organizedTemplates);
              setDynamicItems(organizedTemplates);
            } else {
              // Sort by createdAt descending for events (most recent first)
              if (resourceType === 'upcomingEvents') {
                const sortedContents = [...activeContents].sort((a: any, b: any) => {
                  let dateA: Date;
                  let dateB: Date;
                  
                  if (a.createdAt) {
                    dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                  } else {
                    dateA = new Date(0);
                  }
                  
                  if (b.createdAt) {
                    dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                  } else {
                    dateB = new Date(0);
                  }
                  
                  return dateB.getTime() - dateA.getTime();
                });
                setDynamicItems(sortedContents);
              } else {
                setDynamicItems(activeContents);
              }
            }
          }
        } else {
          // Fallback: try to locate any tab by category/link for prompt templates
          if (resourceType === 'promptTemplates') {
            const altTab = tabs.find(t => lc((t as any).category) === 'templates' || lc((t as any).link).includes('prompttemplates'));
            if (altTab) {
              const { contents } = await getResourceTabContent(altTab.id);
              const activeContents = (contents || []).filter((c: any) => c.active);
              const categoryConfig: { [key: string]: { description: string; icon: string; color: string } } = {
                'Leaders': { description: 'For College Principals, Directors, and Management', icon: '👔', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                'Administration': { description: 'For College Administrative Staff, Office Personnel, and Clerks', icon: '📋', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
                'Educators': { description: 'For College Professors, Lecturers, and Teaching Faculty', icon: '🎓', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' }
              };
              const organized = Object.keys(categoryConfig).map(key => ({
                name: key,
                description: categoryConfig[key].description,
                icon: categoryConfig[key].icon,
                color: categoryConfig[key].color,
                templates: activeContents.filter((t: any) => t.category === key).map((t: any) => ({ name: t.name, description: t.description, template: t.template }))
              })).filter(cat => cat.templates.length > 0);
              setDynamicItems(organized);
            } else {
              setDynamicItems([]);
            }
          } else {
            setDynamicItems([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading dynamic content:', error);
        setDynamicItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicContent();

    // Cleanup function to unsubscribe from real-time listener
    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up events subscription');
        unsubscribe();
      }
    };
  }, [resourceType]);


  const getResourceContent = (type: string) => {
    switch (type) {
      case 'aiTools':
        return {
          title: 'AI Tools',
          icon: Zap,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          items: [] // Empty - AI Tools are disabled
        };
      
      case 'upcomingEvents':
        return {
          title: 'Upcoming Events',
          icon: Calendar,
          iconColor: 'text-[#9b0101]',
          bgColor: 'bg-[#9b0101]/10 dark:bg-[#9b0101]/20',
          borderColor: 'border-[#9b0101]/30 dark:border-[#9b0101]/50',
          items: [] // Empty - Events are now managed dynamically
        };
      
      case 'recommendedBooks':
        return {
          title: 'Recommended Books',
          icon: Book,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          items: [] // Empty - Books are now managed dynamically
        };
      
      case 'promptTemplates':
        return {
          title: 'Prompt Templates',
          icon: Lightbulb,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          categories: [] // Empty - Templates are now loaded dynamically
        };
      
      case 'freeCourses':
        return {
          title: 'Free Courses',
          icon: GraduationCap,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          items: [] // Empty - Courses are now managed dynamically
        };
      
      case 'eguide':
        return {
          title: 'E-Guide',
          icon: BookOpen,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          items: [] // Empty - E-Guide content is handled separately
        };
      
      default:
        return {
          title: 'Resources',
          icon: Zap,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          items: []
        };
    }
  };

  const content = getResourceContent(resourceType);
  const Icon = content.icon;

  // For prompt templates, use categories structure
  let displayItems: any[], displayCategories: any[];
  if (resourceType === 'promptTemplates') {
    // For prompt templates, use dynamic items (organized by categories)
    displayCategories = dynamicItems || [];
    displayItems = [];
  } else {
    // For other resource types, combine dynamic items with hardcoded items
    displayItems = [...(dynamicItems || []), ...(content.items || [])];
    displayCategories = [];
  }

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

  // Debug logging for upcoming events
  if (resourceType === 'upcomingEvents') {
    console.log('🎯 Upcoming Events Debug:');
    console.log('📊 dynamicItems:', dynamicItems);
    console.log('📋 content.items:', content.items);
    console.log('📝 displayItems:', displayItems);
    console.log('🔄 loading:', loading);
  }
  
  // Debug logging for prompt templates
  if (resourceType === 'promptTemplates') {
    console.log('🎯 PROMPT TEMPLATES DISPLAY DEBUG:');
    console.log('📊 dynamicItems:', dynamicItems);
    console.log('📋 displayCategories:', displayCategories);
    console.log('🔄 loading:', loading);
  }
  

  const renderItem = (item: any, index: number) => {
    console.log(`🎯 Rendering item ${index}:`, item);
    
    switch (resourceType) {
      case 'aiTools':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              {item.category && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full">
                  {item.category}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
            <div className="flex items-center justify-between">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#9b0101] dark:text-[#9b0101] hover:text-[#7a0101] dark:hover:text-[#7a0101] transition-colors"
                >
                  <span className="text-sm">Visit Tool</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      
      case 'upcomingEvents':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            
            <div className="flex items-start justify-between mb-3">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 cursor-pointer hover:underline flex-1 pr-4"
                >
                  {item.name}
                </a>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-4">{item.name}</h3>
              )}
              <div className="flex items-center space-x-2">
                {item.type && (
                  <span className="px-3 py-1 bg-[#9b0101]/10 dark:bg-[#9b0101]/20 text-[#9b0101] dark:text-[#9b0101] text-sm rounded-full">
                    {item.type}
                  </span>
                )}
                {/* Edit and Delete buttons - visible only for leaders and admins */}
                {resourceType === 'upcomingEvents' && (userRole === 'leaders' || userRole === 'admin') && item.id && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditEventModal(item)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit event"
                      aria-label="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id, item.name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete event"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
            <div className="space-y-2">
              {item.date && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {item.date}
                    {item.time && ` at ${formatTime(item.time)}`}
                  </span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
            {item.link && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 text-sm font-medium"
                >
                  <span>Visit Official Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        );
      
      case 'recommendedBooks':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 cursor-pointer hover:underline"
                >
                  {item.name}
                </a>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              )}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">by {item.author}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-full">
                {item.category}
              </span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 text-sm font-medium"
                >
                  <span>Get Book</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      
      case 'promptTemplates':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${item.color}`}>
                {item.templates?.length || 0} Templates
              </span>
            </div>
            <div className="space-y-3">
              {item.templates && item.templates.length > 0 ? (
                item.templates.map((template: any, templateIndex: number) => (
                <div key={templateIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{template.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
                    <p className="text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed">{template.template}</p>
                  </div>
                  <button 
                    onClick={() => handleCopyTemplate(template.template, `${item.name}-${template.name}-${templateIndex}`)}
                    className="mt-2 flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors text-xs"
                  >
                    {copiedTemplates.has(`${item.name}-${template.name}-${templateIndex}`) ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No templates available for this category
                </div>
              )}
            </div>
          </div>
        );
      
      case 'freeCourses':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 cursor-pointer hover:underline"
                >
                  {item.name}
                </a>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              )}
              {item.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.rating}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
            <div className="space-y-2 mb-4">
              {item.provider && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.provider}</span>
                </div>
              )}
              {item.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-900 dark:text-white">{item.duration}</span>
                </div>
              )}
              {item.level && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    item.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {item.level}
                  </span>
                </div>
              )}
            </div>
            {item.link && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[#9b0101] hover:text-[#7a0101] dark:text-[#9b0101] dark:hover:text-[#7a0101] transition-colors duration-200 text-sm font-medium"
                >
                  <span>Visit Course</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Handle feedback page separately
  if (resourceType === 'feedback') {
    console.log('ResourcePages: Rendering FeedbackPage for resourceType:', resourceType);
    return <FeedbackPage onGoBack={onGoBack} canGoBack={canGoBack} />;
  }

  // Handle E-Guide page separately
  if (resourceType === 'eguide') {
    console.log('ResourcePages: Rendering EguideViewer for resourceType:', resourceType);
    return <EguideViewer />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {canGoBack && (
              <button
                onClick={onGoBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <div className={`w-12 h-12 ${content.bgColor} ${content.borderColor} border rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${content.iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {resourceType === 'aiTools' && 'Discover powerful AI tools for education and productivity'}
                {resourceType === 'upcomingEvents' && 'Stay updated with the latest AI events and conferences'}
                {resourceType === 'recommendedBooks' && 'Essential reading for AI education and research'}
                {resourceType === 'promptTemplates' && 'Ready-to-use prompt templates for various AI tasks'}
                {resourceType === 'freeCourses' && 'High-quality free courses to advance your AI knowledge'}
              </p>
            </div>
          </div>
          
          {/* Add Event Button - Only show for leaders and admin on upcoming events page */}
          {resourceType === 'upcomingEvents' && (userRole === 'leaders' || userRole === 'admin') && (
            <button
              onClick={openEventModal}
              className="flex items-center space-x-2 bg-[#9b0101] hover:bg-[#7a0101] text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
        </div>
      ) : resourceType === 'promptTemplates' ? (
        <div className="grid grid-cols-1 gap-6">
          {displayCategories.map((category, index) => renderItem(category, index))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayItems.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {!loading && ((resourceType === 'promptTemplates' && displayCategories.length === 0) || 
        (resourceType !== 'promptTemplates' && displayItems.length === 0)) && (
        <div className="text-center py-12">
          <Icon className={`w-16 h-16 ${content.iconColor} mx-auto mb-4 opacity-50`} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No {content.title} Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Check back later for updates.</p>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEventId ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={closeEventModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventFormData.title}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    name="type"
                    value={eventFormData.type}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select event type</option>
                    <option value="Summit">Summit</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={eventFormData.description}
                    onChange={handleEventInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter event description"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={eventFormData.date}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Event Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={eventFormData.time}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={eventFormData.location}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter event location"
                  />
                </div>

                {/* Error Message */}
                {eventSubmitError && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {eventSubmitError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEventModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEvent}
                    className="flex-1 px-4 py-2 bg-[#9b0101] hover:bg-[#7a0101] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingEvent ? (editingEventId ? 'Updating...' : 'Adding...') : (editingEventId ? 'Update Event' : 'Add Event')}
                  </button>
                </div>
              </form>
            </div>
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

export default ResourcePage;