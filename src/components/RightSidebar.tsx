import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Zap, 
  Target,
  FileText,
  Newspaper,
  X
} from 'lucide-react';
import { getResourceTabs, subscribeToNewsUpdates, getMagazineCovers } from '../utils/firebase';

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
  const [newsUpdates, setNewsUpdates] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [magazineSlides, setMagazineSlides] = useState<any[]>([]);
  const [loadingCovers, setLoadingCovers] = useState(true);

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
            } else if (tabName.includes('e-guide') || tabName.includes('eguide')) {
              resourceType = 'eguide';
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

  // Subscribe to news updates
  useEffect(() => {
    const unsubscribe = subscribeToNewsUpdates((updates) => {
      setNewsUpdates(updates);
      setLoadingNews(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch magazine covers from Firebase
  useEffect(() => {
    const fetchMagazineCovers = async () => {
      try {
        const result = await getMagazineCovers();
        if (result.covers && result.covers.length > 0) {
          const activeCovers = result.covers
            .filter((cover: any) => cover.active !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((cover: any) => ({
              src: cover.imageUrl,
              alt: cover.alt || 'Magazine Cover'
            }));
          
          if (activeCovers.length > 0) {
            setMagazineSlides(activeCovers);
          } else {
            // Fallback to default covers if no active covers
            setMagazineSlides([
              { src: '/Documents/magzine.png', alt: 'AI-EduDigest Magazine - September 2025' },
              { src: '/Documents/magzineM2.png', alt: 'AI-EduDigest Magazine - October 2025' }
            ]);
          }
        } else {
          // Fallback to default covers if no covers found
          setMagazineSlides([
            { src: '/Documents/magzine.png', alt: 'AI-EduDigest Magazine - September 2025' },
            { src: '/Documents/magzineM2.png', alt: 'AI-EduDigest Magazine - October 2025' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching magazine covers:', error);
        // Fallback to default covers on error
        setMagazineSlides([
          { src: '/Documents/magzine.png', alt: 'AI-EduDigest Magazine - September 2025' },
          { src: '/Documents/magzineM2.png', alt: 'AI-EduDigest Magazine - October 2025' }
        ]);
      } finally {
        setLoadingCovers(false);
      }
    };

    fetchMagazineCovers();
  }, []);

  const filteredResources = dynamicResources.filter(resource => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    return resource.name.toLowerCase().includes(searchLower);
  });

  const hasSearchResults = searchTerm.trim().length > 0;

  // Duplicate news updates for infinite scroll
  const duplicatedNews = [...newsUpdates, ...newsUpdates];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (magazineSlides.length === 0) return;
    
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
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search resources (e.g., AI Tools, Events, Books)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Summary */}
          {hasSearchResults && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredResources.length > 0 ? (
                  <span>
                    Found <span className="font-semibold text-[#9b0101]">{filteredResources.length}</span> result{filteredResources.length !== 1 ? 's' : ''} for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No results found for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Search Results - Show immediately after search summary when searching */}
        {hasSearchResults && (
          <div className="space-y-3">
            {loadingResources ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No resources found</p>
                <p className="text-xs">Try searching with different keywords</p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                const highlightText = (text: string, search: string) => {
                  if (!search.trim()) return text;
                  const parts = text.split(new RegExp(`(${search})`, 'gi'));
                  return parts.map((part, index) => 
                    part.toLowerCase() === search.toLowerCase() ? (
                      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white px-1 rounded">
                        {part}
                      </mark>
                    ) : (
                      part
                    )
                  );
                };

                return (
                  <button
                    key={resource.id}
                    onClick={() => onResourceClick(resource.id)}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:scale-105 group hover:border-[#9b0101]/50 dark:hover:border-[#9b0101]/50"
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-[#9b0101]/10 dark:group-hover:bg-[#9b0101]/20 transition-colors duration-200`}>
                      <span className="text-2xl">{resource.icon}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#9b0101] transition-colors duration-200 text-left flex-1">
                      {highlightText(resource.name, searchTerm)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Latest Updates - Hide when searching */}
        {!hasSearchResults && (
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-white shadow-lg border border-gray-700 dark:border-gray-600"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-lg">Latest Updates</h4>
            </div>
            <div 
              ref={scrollContainerRef}
              className="overflow-hidden"
              style={{ height: '280px' }}
            >
              {loadingNews ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : duplicatedNews.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No updates available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicatedNews.map((update, index) => (
                    <div 
                      key={`${update.id}-${index}`}
                      className="block border-t border-gray-700 dark:border-gray-600 pt-3 first:border-t-0 first:pt-0 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {update.type === 'news' ? (
                          <Newspaper className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-purple-400" />
                        )}
                        <h5 className="font-medium transition-colors">{update.title}</h5>
                      </div>
                      <p className="text-sm text-gray-300 dark:text-gray-400 mb-2">{update.description}</p>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-gray-700 dark:bg-gray-600 text-xs rounded">
                          {update.type === 'news' ? 'News' : 'AI Tool'}
                        </span>
                        {update.link && (
                          <a
                            href={update.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-[#9b0101] text-white text-xs rounded hover:bg-red-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resource Links - Show only when NOT searching */}
        {!hasSearchResults && (
          <div className="space-y-3">
            {loadingResources ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No resources available</p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                return (
                  <button
                    key={resource.id}
                    onClick={() => onResourceClick(resource.id)}
                    className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:scale-105 group hover:border-[#9b0101]/50 dark:hover:border-[#9b0101]/50"
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-[#9b0101]/10 dark:group-hover:bg-[#9b0101]/20 transition-colors duration-200`}>
                      <span className="text-2xl">{resource.icon}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#9b0101] transition-colors duration-200 text-left flex-1">
                      {resource.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Magazine Editions Slides */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">Latest Editions</h4>
          </div>
          <div className="relative rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
            {loadingCovers ? (
              <div className="flex items-center justify-center h-68">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
              </div>
            ) : magazineSlides.length === 0 ? (
              <div className="flex items-center justify-center h-68 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No magazine covers available</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;