import React, { useState, useEffect } from 'react';
import { Zap, Calendar, Book, Lightbulb, GraduationCap, ExternalLink, Clock, MapPin, Star, Download, ChevronLeft, Check, Plus, X, Trash2, BookOpen } from 'lucide-react';
import { BackButtonProps } from '../../types/common';
import { getResourceContent as getFirebaseResourceContent, getAITools, getResourceTabs, getResourceTabContent, addEvent, deleteEvent, getEvents, subscribeToEvents } from '../../utils/firebase';
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
  
  // Event creation modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    type: '',
    description: '',
    date: '',
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
      const result = await addEvent(eventFormData);
      
      if (result.success) {
        // Reset form and close modal
        setEventFormData({
          title: '',
          type: '',
          description: '',
          date: '',
          location: ''
        });
        setShowEventModal(false);
        
        // Show success message
        alert('Event added successfully!');
      } else {
        setEventSubmitError(result.error || 'Failed to add event. Please try again.');
      }
    } catch (error: any) {
      console.error('Error adding event:', error);
      setEventSubmitError(error.message || 'Failed to add event. Please try again.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const openEventModal = () => {
    setShowEventModal(true);
    setEventSubmitError('');
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEventFormData({
      title: '',
      type: '',
      description: '',
      date: '',
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
        
        // Find the tab that matches the current resource type
        const matchingTab = tabs.find(tab => {
          const tabName = tab.name.toLowerCase();
          if (resourceType === 'aiTools') return tabName.includes('ai tools') || tabName.includes('tools');
          if (resourceType === 'recommendedBooks') return tabName.includes('books') || tabName.includes('recommended');
          if (resourceType === 'freeCourses') return tabName.includes('courses') || tabName.includes('free');
          if (resourceType === 'promptTemplates') return tabName.includes('templates') || tabName.includes('prompt');
          return false;
        });
        
        console.log('🔍 Looking for tab matching resourceType:', resourceType);
        console.log('🔍 Available tabs:', tabs.map(t => ({ name: t.name, id: t.id })));
        console.log('🔍 Found matching tab:', matchingTab);
        
        if (matchingTab) {
          console.log('✅ Found matching tab:', matchingTab.name);
          // Fetch content for other resource types
          const { contents, error: contentError } = await getResourceTabContent(matchingTab.id);
          if (contentError) {
            console.error('❌ Error fetching tab content:', contentError);
            setDynamicItems([]);
          } else {
            console.log('✅ Loaded content items:', contents.length);
            // Filter only active content
            const activeContents = contents.filter((content: any) => content.active);
            setDynamicItems(activeContents);
          }
        } else {
          console.log('❌ No matching tab found for:', resourceType);
          setDynamicItems([]);
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

  const getCollectionName = (type: string) => {
    switch (type) {
      case 'aiTools': return 'aiTools';
      case 'upcomingEvents': return 'upcomingEvents';
      case 'recommendedBooks': return 'recommendedBooks';
      case 'promptTemplates': return 'promptTemplates';
      case 'freeCourses': return 'freeCourses';
      case 'eguide': return 'eguideContent';
      default: return null;
    }
  };

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
          categories: [
            {
              name: 'Leaders',
              description: 'For College Principals, Directors, and Management',
              icon: '👔',
              color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
              templates: [
                {
                  name: 'College Strategic Vision Planner',
                  description: 'Create a comprehensive 5-year strategic plan for college improvement focusing on academics, infrastructure, and student success',
                  template: 'Create a detailed 5-year strategic plan for our college focusing on academic excellence, infrastructure development, faculty enhancement, and student success. Include specific goals, timelines, and resource requirements.'
                },
                {
                  name: 'Convocation Speech Writer',
                  description: 'Write inspiring speeches for college convocation ceremonies and graduation events',
                  template: 'Write an inspiring convocation speech for college students emphasizing the importance of continuous learning, career readiness, and contributing to society. Make it motivational and relevant to today\'s job market.'
                },
                {
                  name: 'Faculty Meeting Minutes Generator',
                  description: 'Summarize faculty meetings and create actionable follow-up plans',
                  template: 'Summarize our faculty meeting discussion about improving student attendance and academic performance. Create a clear action plan with responsibilities and deadlines for each department.'
                },
                {
                  name: 'College Event Planning Assistant',
                  description: 'Plan major college events like annual day, tech fests, and cultural programs',
                  template: 'Help plan our college annual tech fest including event schedule, budget allocation, vendor coordination, and student engagement activities. Include logistics and marketing strategies.'
                },
                {
                  name: 'Academic Policy Decision Tool',
                  description: 'Compare different academic approaches and make informed decisions',
                  template: 'Compare the benefits and challenges of implementing blended learning vs traditional classroom teaching in our college. Provide a recommendation based on student needs, faculty readiness, and infrastructure requirements.'
                },
                {
                  name: 'Stakeholder Communication Generator',
                  description: 'Create professional communications for parents, alumni, and industry partners',
                  template: 'Write a professional email to college alumni requesting their participation in our mentorship program for current students. Include program benefits and how they can contribute.'
                },
                {
                  name: 'College Leadership Time Management',
                  description: 'Create efficient schedules for college leadership responsibilities',
                  template: 'Create a weekly schedule for college principal including faculty meetings, student interactions, administrative tasks, and strategic planning. Ensure balance between leadership duties and personal time.'
                },
                {
                  name: 'Academic Policy Framework',
                  description: 'Draft comprehensive academic policies for college operations',
                  template: 'Draft a comprehensive academic integrity policy for our college covering plagiarism prevention, examination conduct, and research ethics. Make it clear and enforceable for both students and faculty.'
                },
                {
                  name: 'College Performance Report Builder',
                  description: 'Create detailed reports on college performance metrics and achievements',
                  template: 'Create a comprehensive monthly college performance report including student enrollment, academic results, faculty achievements, placement statistics, and infrastructure developments for board presentation.'
                }
              ]
            },
            {
              name: 'Admin Staff',
              description: 'For College Administrative Staff, Office Personnel, and Clerks',
              icon: '📋',
              color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
              templates: [
                {
                  name: 'Vendor Communication Manager',
                  description: 'Create professional communications with suppliers and service providers',
                  template: 'Write a formal email to IT equipment vendors requesting quotations for 50 desktop computers, 10 laptops, and networking equipment for our college computer lab upgrade project.'
                },
                {
                  name: 'Fee Collection Reminder System',
                  description: 'Generate automated reminders for college fee payments and dues',
                  template: 'Create a series of SMS reminders for college students about pending semester fees, including payment deadlines, online payment options, and consequences of late payment.'
                },
                {
                  name: 'Student Database Management',
                  description: 'Organize and structure student information for efficient record keeping',
                  template: 'Design a comprehensive student database structure including personal details, academic records, fee payments, attendance, and contact information for efficient college administration.'
                },
                {
                  name: 'College Notice Generator',
                  description: 'Draft official college notices and circulars for various announcements',
                  template: 'Draft an official college notice announcing the mid-semester break, examination schedule, and important dates for the upcoming academic session.'
                },
                {
                  name: 'Procurement Meeting Recorder',
                  description: 'Document supplier meetings and procurement decisions',
                  template: 'Summarize our procurement committee meeting discussing the purchase of laboratory equipment, including supplier presentations, cost comparisons, and final recommendations.'
                },
                {
                  name: 'Financial Management Helper',
                  description: 'Create Excel formulas and templates for college financial tracking',
                  template: 'Create Excel formulas to calculate total monthly revenue from different sources (tuition fees, government grants, donations) and generate expense reports for college financial management.'
                },
                {
                  name: 'Multilingual Document Translator',
                  description: 'Translate college documents and notices for diverse student populations',
                  template: 'Translate our college admission notice from English to Hindi, ensuring it\'s clear and accessible for students from different linguistic backgrounds.'
                },
                {
                  name: 'Student Services Procedure Guide',
                  description: 'Create step-by-step guides for student service requests',
                  template: 'Create a comprehensive guide for students on how to apply for transfer certificates, migration certificates, and other official documents from the college administration.'
                },
                {
                  name: 'Monthly Operations Report',
                  description: 'Generate regular reports on college administrative activities',
                  template: 'Create a monthly administrative report template covering admissions processed, fees collected, student services provided, and pending tasks for college management review.'
                },
                {
                  name: 'Daily Administrative Checklist',
                  description: 'Create systematic checklists for daily administrative tasks',
                  template: 'Create a comprehensive daily checklist for college administrative staff covering student inquiries, document processing, fee collection, and coordination with different departments.'
                }
              ]
            },
            {
              name: 'Educators',
              description: 'For College Professors, Lecturers, and Teaching Faculty',
              icon: '🎓',
              color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
              templates: [
                {
                  name: 'Advanced Lesson Planning System',
                  description: 'Create comprehensive lesson plans for college-level courses',
                  template: 'Create a detailed 90-minute lesson plan for teaching [Advanced Topic] to final year college students, including learning objectives, interactive activities, assessment methods, and real-world applications.'
                },
                {
                  name: 'College-Level Assessment Creator',
                  description: 'Generate sophisticated quizzes and exams for college students',
                  template: 'Design a comprehensive assessment for [Subject] covering theoretical concepts, practical applications, and critical thinking questions suitable for college-level students.'
                },
                {
                  name: 'Complex Topic Simplifier',
                  description: 'Break down advanced academic concepts for better student understanding',
                  template: 'Explain [Advanced Academic Concept] in clear, accessible language that college students can understand, using analogies and real-world examples to illustrate complex ideas.'
                },
                {
                  name: 'Academic Doubt Resolution System',
                  description: 'Address common student questions and academic challenges',
                  template: 'List the most common questions college students ask about [Subject Area] and provide detailed, accurate answers that help them understand the concepts better.'
                },
                {
                  name: 'Project-Based Learning Designer',
                  description: 'Create engaging project assignments for college students',
                  template: 'Design three comprehensive project assignments for [Subject] that challenge college students to apply theoretical knowledge to real-world problems and develop critical thinking skills.'
                },
                {
                  name: 'Collaborative Learning Activities',
                  description: 'Plan group activities that enhance college student collaboration',
                  template: 'Create five collaborative learning activities for college students that promote teamwork, peer learning, and knowledge sharing in [Subject Area].'
                },
                {
                  name: 'Academic Feedback Generator',
                  description: 'Provide constructive feedback on student assignments and projects',
                  template: 'Write detailed feedback for a college student\'s research project, highlighting strengths in analysis and methodology while suggesting specific improvements for academic writing and research depth.'
                },
                {
                  name: 'Professional Presentation Builder',
                  description: 'Create presentation outlines for academic and professional contexts',
                  template: 'Create a comprehensive presentation outline for college students presenting their research findings, including introduction, methodology, results, discussion, and conclusions with time allocations.'
                },
                {
                  name: 'Academic Communication Tool',
                  description: 'Draft communications with students and academic stakeholders',
                  template: 'Write a professional email to college students about upcoming academic deadlines, examination schedules, and important announcements while maintaining an encouraging and supportive tone.'
                },
                {
                  name: 'Research Integration Assistant',
                  description: 'Incorporate latest research findings into college curriculum',
                  template: 'Summarize the latest research developments in [Field] and suggest how to integrate these findings into our college curriculum to keep students updated with current industry trends.'
                }
              ]
            }
          ]
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
  let displayItems, displayCategories;
  if (resourceType === 'promptTemplates') {
    // For prompt templates, we'll show only hardcoded categories for now
    // In the future, we can enhance this to support dynamic categories
    displayCategories = content.categories || [];
    displayItems = [];
  } else {
    // For other resource types, combine dynamic items with hardcoded items
    displayItems = [...dynamicItems, ...content.items];
    displayCategories = [];
  }

  // Debug logging for upcoming events
  if (resourceType === 'upcomingEvents') {
    console.log('🎯 Upcoming Events Debug:');
    console.log('📊 dynamicItems:', dynamicItems);
    console.log('📋 content.items:', content.items);
    console.log('📝 displayItems:', displayItems);
    console.log('🔄 loading:', loading);
  }
  

  const renderItem = (item: any, index: number) => {
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
                {/* Delete button - visible only for principals and admins */}
                {resourceType === 'upcomingEvents' && (userRole === 'leaders' || userRole === 'admin') && item.id && (
                  <button
                    onClick={() => handleDeleteClick(item.id, item.name)}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete event"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
            <div className="space-y-2">
              {item.date && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{item.date}</span>
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
                {item.templates.length} Templates
              </span>
            </div>
            <div className="space-y-3">
              {item.templates.map((template, templateIndex) => (
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
              ))}
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Event</h2>
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
                    {isSubmittingEvent ? 'Adding...' : 'Add Event'}
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