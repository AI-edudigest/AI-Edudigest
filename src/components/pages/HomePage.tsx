import React, { useState, useEffect } from 'react';
import { Layers, Zap, BookOpen, Users, X, Plus } from 'lucide-react';
import { BackButtonProps } from '../../types/common';
import { getSponsors, subscribeToArticles, getCurrentUser, getUserRole, getUserProfile } from '../../utils/firebase';
import ArticleTTS from '../common/ArticleTTS';

interface HomePageProps extends BackButtonProps {
  onResourceClick?: (resource: string) => void;
  isAdmin?: boolean;
  isCollegeAdmin?: boolean;
  onAdminPanelToggle?: () => void;
  onCollegeDashboardClick?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onResourceClick, isAdmin, isCollegeAdmin, onAdminPanelToggle, onCollegeDashboardClick }) => {
  const [articles, setArticles] = useState<any[]>([]);
  // Sponsors are handled by SponsorsCarousel component
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Hardcoded news items removed - news is now managed dynamically through articles

  const quickAccessItems = [
    { icon: Layers, title: 'Flashcards', color: 'bg-[#9b0101]', action: 'flashcards' },
    { icon: Zap, title: 'AI Tools', color: 'bg-[#9b0101]', action: 'aiTools' },
    { icon: BookOpen, title: 'Courses', color: 'bg-[#9b0101]', action: 'courses' },
    { icon: Users, title: 'Community', color: 'bg-[#9b0101]', action: 'community' }
  ];


  // Load user role and name
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          const role = await getUserRole(user.uid);
          setUserRole(role);
          
          const { profile } = await getUserProfile(user.uid);
          if (profile?.firstName) {
            // Combine firstName and lastName for full name
            const fullName = profile.lastName 
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : profile.firstName;
            setUserName(fullName);
          }
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  // Fetch data from Firebase with real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupData = async () => {
      try {
        setLoading(true);
        
        // Setup real-time subscription for articles (only published articles)
        unsubscribe = subscribeToArticles((articles) => {
          console.log('✅ Real-time articles update received:', articles.length, 'articles');
          setArticles(articles);
          setLoading(false);
        });
        
        // Fetch sponsors (one-time load)
        try {
          const sponsorsResult = await getSponsors();
          if (sponsorsResult.sponsors) {
            // Sponsors are handled by SponsorsCarousel component
            // Filter and map sponsors for potential future use
            sponsorsResult.sponsors
              .filter((sponsor: any) => sponsor.active)
              .map((sponsor: any) => ({
                name: sponsor.name,
                logo: sponsor.logo,
                link: sponsor.website
              }));
          } else {
            // No sponsors found
          }
        } catch (sponsorError) {
          console.error('Error fetching sponsors:', sponsorError);
        }
      } catch (error) {
        console.error('Error setting up data:', error);
        setLoading(false);
      }
    };

    setupData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up articles subscription');
        unsubscribe();
      }
    };
  }, []);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get role display name
  const getRoleDisplayName = (role: string | null): string => {
    if (!role) return '';
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'college_admin': 'College Admin',
      'college-admin': 'College Admin',
      'leader': 'Leader',
      'leaders': 'Leader',
      'educator': 'Educator',
      'educators': 'Educator',
      'salesman': 'Salesman'
    };
    return roleMap[role.toLowerCase()] || role;
  };


  const handleQuickAccess = (action: string) => {
    switch (action) {
      case 'flashcards':
        alert('🎴 Flashcards feature coming soon! Create and study AI flashcards.');
        break;
      case 'aiTools':
        if (onResourceClick) {
          onResourceClick('aiTools');
        }
        break;
      case 'courses':
        if (onResourceClick) {
          onResourceClick('freeCourses');
        }
        break;
      case 'community':
        alert('👥 Community - Join our AI education community!');
        break;
      default:
        break;
    }
  };

  const handleTTSPlayStateChange = (isPlaying: boolean, articleId: string) => {
    if (isPlaying) {
      setPlayingArticleId(articleId);
    } else {
      setPlayingArticleId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  // If college admin, show College User Dashboard card and latest articles
  if (isCollegeAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500 pb-20">
        {/* College User Dashboard Card */}
        <div 
          onClick={onCollegeDashboardClick}
          className="bg-gradient-to-r from-[#9b0101] to-[#7a0101] rounded-lg p-8 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-white" />
              <h3 className="text-2xl font-bold mb-2">colllege_admin panel</h3>
              <p className="text-white/80">Add and manage users for your college</p>
            </div>
          </div>
        </div>

        {/* Welcome Greeting - Role Based */}
        {userRole && (
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-2">
              <span style={{ color: '#000000' }}>{getTimeBasedGreeting()}</span>
              {userName && (
                <>
                  <span style={{ color: '#000000' }}>, </span>
                  <span style={{ color: '#9b0101' }}>{userName}</span>
                </>
              )}
              <span style={{ color: '#000000' }}>!</span>
            </h2>
            <p className="text-xl" style={{ color: '#9b0101' }}>
              Welcome, {getRoleDisplayName(userRole)}
            </p>
          </div>
        )}

        {/* Latest Articles */}
        <div className="space-y-4">
          <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Latest Articles</h3>
            </div>
          </div>
          
          {articles.length > 0 ? (
            <div className="space-y-6">
              {articles.slice(0, 6).map((article: any) => (
                <div 
                  key={article.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer relative"
                  onClick={() => setSelectedArticle(article)}
                >
                  {/* TTS Button - Top Right Corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <ArticleTTS
                      articleText={article.excerpt || article.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || ''}
                      articleTitle={article.title}
                      articleId={article.id}
                      isActive={playingArticleId === article.id}
                      onPlayStateChange={handleTTSPlayStateChange}
                      className="transition-opacity duration-200"
                    />
                  </div>
                  
                  <div className="flex items-start justify-between pr-12">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {article.title}
                      </h3>
                      {(article.excerpt || article.content) && (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 150) + '...' : '')}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">By {article.author}</span>
                        <span>
                          {article.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Articles Yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Check back soon for the latest AI education articles.
              </p>
            </div>
          )}
        </div>

        {/* Article Popup Modal */}
        {selectedArticle && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedArticle(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">By {selectedArticle.author}</span>
                    <span>
                      {selectedArticle.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* TTS Button for Modal */}
                  <ArticleTTS
                    articleText={selectedArticle.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                    articleTitle={selectedArticle.title}
                    articleId={`modal-${selectedArticle.id}`}
                    isActive={playingArticleId === `modal-${selectedArticle.id}`}
                    onPlayStateChange={handleTTSPlayStateChange}
                    className="transition-opacity duration-200"
                  />
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="leading-relaxed"
                    style={{ color: '#000000' }}
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-20">

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-[#9b0101] to-[#7a0101] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Admin Quick Actions</h3>
            <button
              onClick={onAdminPanelToggle}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Open Admin Panel
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center"
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Article</span>
            </button>
            <button
              onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Sponsor</span>
            </button>
            <button
              onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center"
            >
              <Layers className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button
              onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors text-center"
            >
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Greeting - Role Based */}
      {userRole && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-2">
            <span style={{ color: '#000000' }}>{getTimeBasedGreeting()}</span>
            {userName && (
              <>
                <span style={{ color: '#000000' }}>, </span>
                <span style={{ color: '#9b0101' }}>{userName}</span>
              </>
            )}
            <span style={{ color: '#000000' }}>!</span>
          </h2>
          <p className="text-xl" style={{ color: '#9b0101' }}>
            Welcome, {getRoleDisplayName(userRole)}
          </p>
        </div>
      )}

      {/* Latest Articles - Sticky Header */}
      <div className="space-y-4">
        <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Latest Articles</h3>
            {isAdmin && (
              <button
                onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Article
              </button>
            )}
          </div>
        </div>
        
        {articles.length > 0 ? (
          <div className="space-y-6">
            {articles.slice(0, 6).map((article: any) => (
              <div 
                key={article.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer relative"
                onClick={() => setSelectedArticle(article)}
              >
                {/* TTS Button - Top Right Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <ArticleTTS
                    articleText={article.excerpt || article.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || ''}
                    articleTitle={article.title}
                    articleId={article.id}
                    isActive={playingArticleId === article.id}
                    onPlayStateChange={handleTTSPlayStateChange}
                    className="transition-opacity duration-200"
                  />
                </div>
                
                <div className="flex items-start justify-between pr-12">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {article.title}
                    </h3>
                    {(article.excerpt || article.content) && (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 150) + '...' : '')}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">By {article.author}</span>
                      <span>
                        {article.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Articles Yet</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isAdmin 
                ? "Start creating content by adding your first article!" 
                : "Check back soon for the latest AI education articles."
              }
            </p>
            {isAdmin && (
              <button
                onClick={() => onAdminPanelToggle && onAdminPanelToggle()}
                className="bg-[#9b0101] text-white px-6 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Article
              </button>
            )}
          </div>
        )}
      </div>

      {/* News Feed removed - news is now managed through articles */}

      {/* Quick Access */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccessItems.map((item, index) => (
            <div 
              key={index} 
              onClick={() => handleQuickAccess(item.action)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer active:scale-95"
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
      {/* Article Popup Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">By {selectedArticle.author}</span>
                  <span>
                    {selectedArticle.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* TTS Button for Modal */}
                <ArticleTTS
                  articleText={selectedArticle.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                  articleTitle={selectedArticle.title}
                  articleId={`modal-${selectedArticle.id}`}
                  isActive={playingArticleId === `modal-${selectedArticle.id}`}
                  onPlayStateChange={handleTTSPlayStateChange}
                  className="transition-opacity duration-200"
                />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="leading-relaxed"
                  style={{ color: '#000000' }}
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;