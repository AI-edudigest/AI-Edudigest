import React, { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface SidebarTabContentProps {
  tabId: string;
}

interface SidebarTab {
  id: string;
  name: string;
  label: string;
  icon: string;
  section: string;
  order: number;
  active: boolean;
  topic?: string;
  content?: string;
  youtubeUrl?: string;
  topicName?: string;
  subTopic?: string;
  headingText?: string;
  headingColor?: string;
  fontSize?: string;
  fontStyle?: string;
}

const SidebarTabContent: React.FC<SidebarTabContentProps> = ({
  tabId
}) => {
  const [tab, setTab] = useState<SidebarTab | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTabContent = async () => {
      try {
        setLoading(true);
        const { getSidebarTabs } = await import('../../utils/firebase');
        const { tabs } = await getSidebarTabs();
        const foundTab = tabs.find((t: SidebarTab) => t.id === tabId);
        setTab(foundTab || null);
      } catch (error) {
        console.error('Error fetching tab content:', error);
        setTab(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTabContent();
  }, [tabId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Content Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested content could not be found or may have been removed.
          </p>
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="bg-[#9b0101] text-white px-6 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          style={{ 
            color: tab.headingColor || '#000000',
            fontSize: tab.fontSize || '32px',
            fontStyle: tab.fontStyle || 'normal'
          }}
        >
          {tab.headingText || tab.topicName || tab.label}
        </h1>
        
        {tab.subTopic && (
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {tab.subTopic}
          </h2>
        )}
        
        {tab.topicName && tab.topicName !== tab.headingText && (
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {tab.topicName}
          </p>
        )}
      </div>

      {/* YouTube Video */}
      {tab.youtubeUrl && (
        <div className="mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Play className="w-5 h-5 mr-2 text-[#9b0101]" />
              Video Content
            </h3>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                src={tab.youtubeUrl.replace('watch?v=', 'embed/')}
                title={tab.topicName || 'Video'}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <a
              href={tab.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-[#9b0101] hover:text-[#7a0101] transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in YouTube
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      {tab.content && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content
          </h3>
          <div 
            className="text-gray-900 dark:text-white leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tab.content }}
            style={{
              fontSize: tab.fontSize || '16px',
              fontStyle: tab.fontStyle || 'normal'
            }}
          />
        </div>
      )}

      {/* No Content Message */}
      {!tab.content && !tab.youtubeUrl && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Content Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This section doesn't have any content yet. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default SidebarTabContent;
