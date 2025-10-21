import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Brain, 
  Zap, 
  Calendar, 
  Book, 
  Lightbulb, 
  GraduationCap,
  Wrench,
  BookOpen,
  Sparkles,
  Users,
  Target,
  Trophy,
  Globe,
  TrendingUp,
  FileText,
  Megaphone,
  DollarSign,
  Award,
  BarChart3,
  Shield,
  MessageSquare
} from 'lucide-react';
import { getResourceTabs } from '../utils/firebase';

interface RightSidebarProps {
  onResourceClick: (resource: string) => void;
  onMagazineClick?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onResourceClick, onMagazineClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dynamicResources, setDynamicResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Fetch dynamic resource tabs from Firebase
  useEffect(() => {
    const fetchResourceTabs = async () => {
      try {
        console.log('RightSidebar: Fetching resource tabs from Firebase...');
        const result = await getResourceTabs();
        console.log('RightSidebar: Fetch result:', result);
        if (result.tabs) {
          // Filter only active tabs
          const activeTabs = result.tabs.filter((tab: any) => tab.active);
          console.log('RightSidebar: Active resource tabs:', activeTabs);
          
          // Map tab names to resource types for navigation
          const mappedTabs = activeTabs.map((tab: any) => {
            const tabName = tab.name.toLowerCase();
            let resourceType = tab.id; // Default to Firebase ID
            
            // Map tab names to expected resource types
            if (tabName.includes('ai tools') || tabName.includes('tools')) {
              resourceType = 'aiTools';
            } else if (tabName.includes('events') || tabName.includes('upcoming')) {
              resourceType = 'upcomingEvents';
            } else if (tabName.includes('books') || tabName.includes('recommended')) {
              resourceType = 'recommendedBooks';
            } else if (tabName.includes('courses') || tabName.includes('free')) {
              resourceType = 'freeCourses';
            } else if (tabName.includes('templates') || tabName.includes('prompt')) {
              resourceType = 'promptTemplates';
            } else if (tabName.includes('feedback') || tabName.includes('recommendation')) {
              resourceType = 'feedback';
            }
            
            return {
              ...tab,
              id: resourceType, // Use mapped resource type for navigation
              originalId: tab.id // Keep original Firebase ID
            };
          });
          
          console.log('RightSidebar: Mapped resource tabs:', mappedTabs);
          setDynamicResources(mappedTabs);
        } else {
          console.log('RightSidebar: No resource tabs found, using fallback');
          // Fallback to default resources if Firebase fails
          setDynamicResources([
            { id: 'upcomingEvents', name: 'Upcoming Events', category: 'events', icon: '📅', color: 'text-green-500' },
            { id: 'recommendedBooks', name: 'Recommended Books', category: 'books', icon: '📚', color: 'text-purple-500' },
            { id: 'promptTemplates', name: 'Prompt Templates', category: 'templates', icon: '💡', color: 'text-yellow-500' },
            { id: 'freeCourses', name: 'Free Courses', category: 'courses', icon: '🎓', color: 'text-indigo-500' },
            { id: 'feedback', name: 'Feedback & Recommendation', category: 'feedback', icon: '💬', color: 'text-pink-500' }
          ]);
        }
      } catch (error) {
        console.error('RightSidebar: Error fetching resource tabs:', error);
        // Fallback to default resources if Firebase fails
        setDynamicResources([
          { id: 'upcomingEvents', name: 'Upcoming Events', category: 'events', icon: '📅', color: 'text-green-500' },
          { id: 'recommendedBooks', name: 'Recommended Books', category: 'books', icon: '📚', color: 'text-purple-500' },
          { id: 'promptTemplates', name: 'Prompt Templates', category: 'templates', icon: '💡', color: 'text-yellow-500' },
          { id: 'freeCourses', name: 'Free Courses', category: 'courses', icon: '🎓', color: 'text-indigo-500' },
          { id: 'feedback', name: 'Feedback & Recommendation', category: 'feedback', icon: '💬', color: 'text-pink-500' }
        ]);
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResourceTabs();
  }, []);

  const aiModels = [
    {
      name: 'ChatGPT-4',
      description: 'Advanced conversational AI with multimodal capabilities',
      provider: 'OpenAI',
      type: 'GPT',
      link: 'https://chat.openai.com'
    },
    {
      name: 'Claude 3 Sonnet',
      description: 'High-performance AI assistant for complex tasks',
      provider: 'Anthropic',
      type: 'Claude',
      link: 'https://claude.ai'
    },
    {
      name: 'Gemini Pro',
      description: 'Google\'s most capable AI model for complex reasoning',
      provider: 'Google',
      type: 'Gemini',
      link: 'https://gemini.google.com'
    },
    {
      name: 'Perplexity AI',
      description: 'AI-powered search engine with real-time answers',
      provider: 'Perplexity',
      type: 'Search AI',
      link: 'https://perplexity.ai'
    },
    {
      name: 'DeepSeek',
      description: 'Advanced AI model for coding and technical tasks',
      provider: 'DeepSeek',
      type: 'Code AI',
      link: 'https://chat.deepseek.com'
    }
  ];

  const filteredResources = dynamicResources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Duplicate models for infinite scroll
  const duplicatedModels = [...aiModels, ...aiModels];

  // Magazine slides data
  const magazineSlides = [
    {
      src: '/Documents/magzine.png',
      alt: 'AI-EduDigest Magazine - September 2025'
    },
    {
      src: '/Documents/magzineM2.png',
      alt: 'AI-EduDigest Magazine - October 2025'
    }
  ];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % magazineSlides.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [magazineSlides.length]);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isPaused) return;

    const scrollSpeed = 1; // pixels per interval
    const scrollInterval = 30; // ms

    const scroll = setInterval(() => {
      if (container.scrollTop >= container.scrollHeight / 2) {
        container.scrollTop = 0;
      } else {
        container.scrollTop += scrollSpeed;
      }
    }, scrollInterval);

    return () => clearInterval(scroll);
  }, [isPaused]);

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6 pt-12 transition-colors duration-200 h-full overflow-y-auto shadow-lg">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-gradient-to-r from-[#9b0101] to-red-600 rounded-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h3>
      </div>
      
      <div className="space-y-6">
        {/* Search Resources */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
          />
        </div>

        {/* Top LLMs */}
        <div 
          className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-white shadow-lg border border-gray-700 dark:border-gray-600"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-lg">Top LLMs</h4>
          </div>
          <div 
            ref={scrollContainerRef}
            className="overflow-hidden"
            style={{ height: '280px' }}
          >
            <div className="space-y-4">
              {duplicatedModels.map((model, index) => (
                <a 
                  key={index} 
                  href={model.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-t border-gray-700 dark:border-gray-600 pt-3 first:border-t-0 first:pt-0 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-all duration-200 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h5 className="font-medium mb-1 hover:text-[#9b0101] transition-colors">{model.name}</h5>
                  <p className="text-sm text-gray-300 dark:text-gray-400 mb-2">{model.description}</p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-600 text-xs rounded">{model.provider}</span>
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-600 text-xs rounded">{model.type}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Links */}
        <div className="space-y-3">
          {loadingResources ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
            </div>
          ) : (
            filteredResources.map((resource) => {
              return (
                <button
                  key={resource.id}
                  onClick={() => onResourceClick(resource.id)}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:scale-105 group"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors duration-200`}>
                    <span className="text-2xl">{resource.icon}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#9b0101] transition-colors duration-200">{resource.name}</span>
                </button>
              );
            })
          )}
          
          {filteredResources.length === 0 && searchTerm && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No resources found for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Magazine Editions Slides */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">Latest Editions</h4>
          </div>
          <div className="relative rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
            {/* Slides Container */}
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {magazineSlides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <img 
                      src={slide.src} 
                      alt={slide.alt}
                      className="w-full h-68 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      onClick={onMagazineClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;