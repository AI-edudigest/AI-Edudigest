import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'section' | 'content';
  section?: string;
  url?: string;
  highlightedContent?: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Sample content data - in a real app, this would come from your CMS/database
  const searchableContent: SearchResult[] = [
    // Home page content
    {
      id: 'home-1',
      title: 'AI Buzz - News & Updates',
      content: 'Latest AI news and updates for educational institutions. Stay informed about the latest developments in artificial intelligence for colleges and universities.',
      type: 'page',
      section: 'home'
    },
    {
      id: 'home-2',
      title: 'AI Tools Series',
      content: 'Comprehensive series covering essential AI tools for educational institutions. Learn about the latest AI technologies and how to implement them in your college.',
      type: 'section',
      section: 'home'
    },
    {
      id: 'home-3',
      title: 'Prompt Engineering',
      content: 'Master the art of crafting effective prompts for AI systems. Learn prompt engineering techniques for better AI interactions.',
      type: 'content',
      section: 'home'
    },
    
    // AI Adoption Guide
    {
      id: 'adoption-1',
      title: 'AI Adoption Guide',
      content: 'Strategic guide for implementing AI in educational institutions. Step-by-step approach to AI adoption in colleges and universities.',
      type: 'page',
      section: 'aiAdoptionGuideMain'
    },
    {
      id: 'adoption-2',
      title: 'Implementation Strategy',
      content: 'Learn how to create a comprehensive AI implementation strategy for your educational institution.',
      type: 'content',
      section: 'aiAdoptionGuideMain'
    },
    {
      id: 'adoption-3',
      title: 'AI Tools for Education',
      content: 'Discover the best AI tools specifically designed for educational purposes and how to integrate them.',
      type: 'content',
      section: 'aiAdoptionGuideMain'
    },

    // Responsible AI Framework
    {
      id: 'responsible-1',
      title: 'Responsible AI Framework Guide',
      content: 'Comprehensive framework for implementing responsible AI across college operations. Ethical AI practices for educational institutions.',
      type: 'page',
      section: 'responsibleAIFrameworkGuide'
    },
    {
      id: 'responsible-2',
      title: 'Ethical AI Practices',
      content: 'Learn about ethical considerations when implementing AI in educational settings.',
      type: 'content',
      section: 'responsibleAIFrameworkGuide'
    },
    {
      id: 'responsible-3',
      title: 'AI Governance',
      content: 'Establish proper governance structures for AI implementation in colleges.',
      type: 'content',
      section: 'responsibleAIFrameworkGuide'
    },

    // Faculty Focus
    {
      id: 'faculty-1',
      title: 'Faculty Focus (Educators)',
      content: 'Comprehensive resources and tools for educators to integrate AI into their teaching practices.',
      type: 'page',
      section: 'facultyFocus'
    },
    {
      id: 'faculty-2',
      title: 'AI in Teaching',
      content: 'How to use AI tools to enhance teaching methods and improve student learning outcomes.',
      type: 'content',
      section: 'facultyFocus'
    },
    {
      id: 'faculty-3',
      title: 'Educational AI Tools',
      content: 'Best AI tools for educators including ChatGPT, Claude, and specialized educational AI platforms.',
      type: 'content',
      section: 'facultyFocus'
    },

    // Management Matters
    {
      id: 'management-1',
      title: 'Management Matters',
      content: 'How AI Makes College Administration Simple. Streamline administrative tasks with AI-powered solutions.',
      type: 'page',
      section: 'managementMatters'
    },
    {
      id: 'management-2',
      title: 'Administrative AI',
      content: 'AI solutions for college administration including student services, admissions, and financial management.',
      type: 'content',
      section: 'managementMatters'
    },
    {
      id: 'management-3',
      title: 'Process Automation',
      content: 'Automate routine administrative processes with AI to improve efficiency and reduce costs.',
      type: 'content',
      section: 'managementMatters'
    },

    // Data Literacy Track
    {
      id: 'data-1',
      title: 'Data Literacy Track',
      content: 'Building data literacy skills and understanding for the AI-driven educational landscape.',
      type: 'page',
      section: 'dataLiteracyTrack'
    },
    {
      id: 'data-2',
      title: 'Data Analysis Skills',
      content: 'Essential data analysis skills for educators and administrators in the AI era.',
      type: 'content',
      section: 'dataLiteracyTrack'
    },
    {
      id: 'data-3',
      title: 'AI Data Tools',
      content: 'Tools and techniques for working with data in AI-powered educational environments.',
      type: 'content',
      section: 'dataLiteracyTrack'
    },

    // Insight Chronicles
    {
      id: 'insight-1',
      title: 'Insight Chronicles',
      content: 'Latest Changes: How AI Is Transforming Colleges. Stay updated with the latest AI trends in education.',
      type: 'page',
      section: 'insightChronicles'
    },
    {
      id: 'insight-2',
      title: 'AI for College Brand Building',
      content: 'Making Your College Famous with AI: Smart Marketing for Better Student Attraction.',
      type: 'content',
      section: 'aiCollegeBrandBuilding'
    },
    {
      id: 'insight-3',
      title: 'AI For Cost Cutting',
      content: 'Smart AI Tools to Reduce Operational Expenses in Colleges.',
      type: 'content',
      section: 'aiCostCutting'
    },

    // AI Student Success
    {
      id: 'student-1',
      title: 'AI For Student Success',
      content: 'Empowering Learners Through Technology. AI tools and strategies for improving student outcomes.',
      type: 'page',
      section: 'aiStudentSuccess'
    },
    {
      id: 'student-2',
      title: 'Personalized Learning',
      content: 'How AI enables personalized learning experiences for students.',
      type: 'content',
      section: 'aiStudentSuccess'
    },
    {
      id: 'student-3',
      title: 'Student Support AI',
      content: 'AI-powered student support systems for academic success.',
      type: 'content',
      section: 'aiStudentSuccess'
    },

    // AI & Accreditation
    {
      id: 'accreditation-1',
      title: 'AI & Accreditation',
      content: 'AI integration strategies that support and enhance institutional accreditation processes.',
      type: 'page',
      section: 'aiAccreditation'
    },
    {
      id: 'accreditation-2',
      title: 'Accreditation Standards',
      content: 'How AI can help meet and exceed accreditation standards.',
      type: 'content',
      section: 'aiAccreditation'
    },

    // AI Strategic Growth
    {
      id: 'growth-1',
      title: 'AI For Strategic Growth',
      content: 'Strategic AI implementation for sustainable institutional growth and development.',
      type: 'page',
      section: 'aiStrategicGrowth'
    },
    {
      id: 'growth-2',
      title: 'Growth Strategies',
      content: 'AI-driven strategies for institutional growth and expansion.',
      type: 'content',
      section: 'aiStrategicGrowth'
    },

    // AI Global Competitiveness
    {
      id: 'global-1',
      title: 'AI For Global Competitiveness',
      content: 'Global AI strategies to position your institution competitively in the international education market.',
      type: 'page',
      section: 'aiGlobalCompetitiveness'
    },
    {
      id: 'global-2',
      title: 'International AI',
      content: 'AI strategies for competing in the global education market.',
      type: 'content',
      section: 'aiGlobalCompetitiveness'
    },

    // E-Magazine
    {
      id: 'magazine-1',
      title: 'E-Magazine',
      content: 'Latest insights, trends, and innovations in AI education. Monthly publication covering AI developments.',
      type: 'page',
      section: 'eMagazine'
    },
    {
      id: 'magazine-2',
      title: 'AI Trends',
      content: 'Current trends and future predictions in AI for education.',
      type: 'content',
      section: 'eMagazine'
    },

    // Prompt Engineering Series
    {
      id: 'prompt-1',
      title: 'Prompt to Context Engineering Series',
      content: 'Master the art of crafting effective prompts and managing context in AI systems.',
      type: 'page',
      section: 'promptToContextEngineeringSeries'
    },
    {
      id: 'prompt-2',
      title: 'Prompt Templates',
      content: 'Ready-to-use prompt templates for various educational scenarios.',
      type: 'content',
      section: 'promptToContextEngineeringSeries'
    },
    {
      id: 'prompt-3',
      title: 'Context Management',
      content: 'Advanced techniques for managing context in AI conversations.',
      type: 'content',
      section: 'promptToContextEngineeringSeries'
    }
  ];

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  };

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const results = searchableContent
        .filter(item => {
          const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
          const contentMatch = item.content.toLowerCase().includes(query.toLowerCase());
          
          // Only show results that match the title/heading
          return titleMatch;
        })
        .sort((a, b) => {
          const aStartsWith = a.title.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.title.toLowerCase().startsWith(query.toLowerCase());
          
          // Sort exact matches first, then starts with, then contains
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // If both start with query, sort alphabetically
          if (aStartsWith && bStartsWith) {
            return a.title.localeCompare(b.title);
          }
          
          return 0;
        })
        .map(item => ({
          ...item,
          highlightedContent: highlightText(item.title, query) // Highlight the title instead of content
        }))
        .slice(0, 10); // Limit to 10 results

      setSearchResults(results);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    performSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
