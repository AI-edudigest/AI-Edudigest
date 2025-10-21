import React from 'react';
import { Search, X, FileText, BookOpen, Lightbulb, Users, BarChart3, Target, Award, TrendingUp, Globe, Sparkles } from 'lucide-react';
import { useSearch, SearchResult } from '../contexts/SearchContext';

interface SearchResultsProps {
  onResultClick?: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onResultClick }) => {
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    showSearchResults, 
    setShowSearchResults, 
    clearSearch 
  } = useSearch();

  const getIconForType = (type: string, section?: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'page': FileText,
      'section': BookOpen,
      'content': Lightbulb,
      'home': BookOpen,
      'aiAdoptionGuideMain': TrendingUp,
      'responsibleAIFrameworkGuide': Award,
      'facultyFocus': Users,
      'managementMatters': BarChart3,
      'dataLiteracyTrack': BarChart3,
      'insightChronicles': BookOpen,
      'aiStudentSuccess': Target,
      'aiAccreditation': Award,
      'aiStrategicGrowth': TrendingUp,
      'aiGlobalCompetitiveness': Globe,
      'eMagazine': BookOpen,
      'promptToContextEngineeringSeries': Sparkles
    };

    return iconMap[section || type] || FileText;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page': return 'Page';
      case 'section': return 'Section';
      case 'content': return 'Content';
      default: return 'Item';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setShowSearchResults(false);
  };

  if (!showSearchResults) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowSearchResults(false)}>
      <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isSearching ? 'Searching...' : `Found ${searchResults.length} results`}
              </span>
            </div>
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Searching for "{searchQuery}"...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((result) => {
                  const Icon = getIconForType(result.type, result.section);
                  
                  return (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-[#9b0101]/10 dark:bg-[#9b0101]/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[#9b0101] dark:text-[#9b0101]" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          
                          <h4 
                            className="font-medium text-gray-900 dark:text-white text-sm mb-2"
                            dangerouslySetInnerHTML={{ 
                              __html: result.highlightedContent || result.title 
                            }}
                          />
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {result.content}
                          </p>
                          
                          {result.section && (
                            <div className="mt-2">
                              <span className="text-xs text-[#9b0101] dark:text-[#9b0101] font-medium">
                                {result.section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No content found for "{searchQuery}"
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  <p>Try searching for headings like:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• AI Tools Series</li>
                    <li>• Faculty Focus</li>
                    <li>• Management Matters</li>
                    <li>• AI Student Success</li>
                    <li>• E-Magazine</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Search Footer */}
          {searchResults.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
