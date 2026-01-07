import { useState, useEffect } from 'react';
import { onAuthStateChange, getUserRole, getUserProfile, subscribeToSession, checkPlanExpiryStatus } from './utils/firebase';
import { SearchProvider } from './contexts/SearchContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RightSidebar from './components/RightSidebar';
import SearchResults from './components/SearchResults';
import SimpleWelcome from './components/SimpleWelcome';
import HomePage from './components/pages/HomePage';
import NotebookPage from './components/pages/NotebookPage';
import GenericPage from './components/pages/GenericPage';
import ResourcePage from './components/pages/ResourcePages';
import PromptToContextPage from './components/pages/PromptToContextPage';
import AIAdoptionPage from './components/pages/AIAdoptionpage';
import ResponsibleAIFrameworkGuide from './components/pages/ResponsibleAIFrameworkGuide';
import ManagementMatters from './components/pages/ManagementMatters';
import AIForStudentSuccess from './components/pages/AIForStudentSuccess';
import InsightChronicles from './components/pages/InsightChronicles';
import AIForCostCutting from './components/pages/AIForCostCutting';
import AIForCollegeBranding from './components/pages/AIForCollegeBranding';
import EMagazinePage from './components/pages/EMagazinePage';
import LoginPage from './components/pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import SidebarTabContent from './components/pages/SidebarTabContent';
import ProfileCompletionModal from './components/ProfileCompletionModal';
import SponsorsCarousel from './components/SponsorsCarousel';
import SalesmanDashboard from './components/salesman/SalesmanDashboard';
import CollegeDashboard from './components/college-admin/CollegeDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSalesman, setIsSalesman] = useState(false);
  const [isSalesmanActive, setIsSalesmanActive] = useState(false);
  const [isCollegeAdmin, setIsCollegeAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeSidebarTabId, setActiveSidebarTabId] = useState<string | null>(null);
  const [currentTopicName, setCurrentTopicName] = useState<string | null>(null);
  
  // Profile completion modal states
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Simple welcome screen states
  const [showSplash, setShowSplash] = useState(true);
  const [welcomeMode, setWelcomeMode] = useState<'login' | 'refresh'>('refresh');
  
  // Plan expiry states
  const [planExpired, setPlanExpired] = useState(false);
  const [planExpiringSoon, setPlanExpiringSoon] = useState(false);
  const [planExpiringDays, setPlanExpiringDays] = useState<number | null>(null);
  
  const handleResourceClick = (resource: string) => {
    console.log('🔍 Resource clicked:', resource);
    console.log('🔍 Current activeResource:', activeResource);
    if (activeResource !== resource) {
      setNavigationHistory(prev => [...prev, activeSection]);
      setActiveResource(resource);
      setActiveSection('resource');
      console.log('✅ Resource set to:', resource);
    }
  };

  const handleSectionChange = async (section: string, tabId?: string) => {
    // Check if we're switching sections OR switching tabs within the same section
    const isSectionChange = activeSection !== section;
    const isTabChange = activeSection === 'sidebarTab' && section === 'sidebarTab' && activeSidebarTabId !== tabId;
    
    if (isSectionChange || isTabChange) {
      if (isSectionChange) {
        setNavigationHistory(prev => [...prev, activeSection]);
        setActiveSection(section);
        setActiveResource(null);
      }
      
      // Only set activeSidebarTabId if it's a sidebarTab section
      setActiveSidebarTabId(section === 'sidebarTab' ? (tabId || null) : null);
      
      // Fetch topic name for sidebar tabs
      if (section === 'sidebarTab' && tabId) {
        try {
          const { getSidebarTabs } = await import('./utils/firebase');
          const { tabs } = await getSidebarTabs();
          const foundTab = tabs.find((t: any) => t.id === tabId);
          setCurrentTopicName((foundTab as any)?.topicName || (foundTab as any)?.label || (foundTab as any)?.name || null);
        } catch (error) {
          console.error('Error fetching topic name:', error);
          setCurrentTopicName(null);
        }
      } else {
        setCurrentTopicName(null);
      }
    }
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const previousSection = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActiveSection(previousSection);
      setActiveResource(null);
      setActiveSidebarTabId(null);
      setCurrentTopicName(null);
    }
  };

  const handleLoginSuccess = () => {
    // Authentication state will be handled by Firebase auth state change
    setWelcomeMode('login');
    setShowSplash(true);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('sessionId');
      const { signOutUser } = await import('./utils/firebase');
      await signOutUser();
      setShowAdminPanel(false);
      setActiveSection('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAdminPanelToggle = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  const handleBackToHome = () => {
    setShowAdminPanel(false);
  };


  const handleSplashFinish = () => {
    setShowSplash(false);
    console.log('🎉 Splash screen finished, app is ready!');
  };

  const handleProfileCompletionClose = () => {
    setShowProfileCompletion(false);
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate to the section based on the search result
    if (result.section) {
      setActiveSection(result.section);
    }
  };

  // Handle responsive sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Firebase Authentication Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCheckingAuth(true);
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        try {
          const role = await getUserRole(user.uid);
          setUserRole(role);
          setIsAdmin(role === 'admin');
          
          // Check for salesman role and active status
          const { profile } = await getUserProfile(user.uid);
          if (role === 'salesman') {
            setIsSalesman(true);
            const active = profile?.active !== undefined ? profile.active : false;
            setIsSalesmanActive(active);
            setIsCollegeAdmin(false);
          } else {
            setIsSalesman(false);
            setIsSalesmanActive(false);
          }
          
          // Check for college_admin role (support both college_admin and college-admin for backward compatibility)
          if (role === 'college_admin' || role === 'college-admin') {
            setIsCollegeAdmin(true);
          } else {
            setIsCollegeAdmin(false);
          }
          
          // Check plan expiry status for college users (college_admin, leader, educator)
          if (role === 'college_admin' || role === 'college-admin' || role === 'leader' || role === 'leaders' || role === 'educator' || role === 'educators') {
            const planStatus = await checkPlanExpiryStatus(user.uid);
            if (planStatus.status === 'expired') {
              setPlanExpired(true);
              setPlanExpiringSoon(false);
            } else if (planStatus.status === 'expiring_soon') {
              setPlanExpired(false);
              setPlanExpiringSoon(true);
              setPlanExpiringDays(planStatus.daysRemaining || null);
            } else {
              setPlanExpired(false);
              setPlanExpiringSoon(false);
              setPlanExpiringDays(null);
            }
          } else {
            setPlanExpired(false);
            setPlanExpiringSoon(false);
            setPlanExpiringDays(null);
          }
          
          // Check if this is a Google user with incomplete profile
          
          // Show profile completion modal if:
          // 1. User signed in with Google (has photoURL and provider is google)
          // 2. Institution is empty or not specified
          // 3. Not in signup process (to avoid double modals)
          // 4. Not a salesman (salesmen don't need profile completion)
          if (user.photoURL && 
              (!profile?.institution || profile.institution === '' || profile.institution === 'Not specified') &&
              role !== 'salesman') {
            // Small delay to ensure UI is ready
            setTimeout(() => {
              setShowProfileCompletion(true);
            }, 1000);
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('user');
          setIsAdmin(false);
          setIsSalesman(false);
          setIsSalesmanActive(false);
          setIsCollegeAdmin(false);
          setPlanExpired(false);
          setPlanExpiringSoon(false);
          setPlanExpiringDays(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole('user');
        setIsAdmin(false);
        setIsSalesman(false);
        setIsSalesmanActive(false);
        setCurrentUser(null);
        setShowProfileCompletion(false);
        setPlanExpired(false);
        setPlanExpiringSoon(false);
        setPlanExpiringDays(null);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to session id
  useEffect(() => {
    if (!currentUser || !isLoggedIn) return;
    // Subscribe to session id
    const unsub = subscribeToSession(currentUser.uid, (remoteSessionId) => {
      const local = localStorage.getItem('sessionId');
      if (remoteSessionId && local && remoteSessionId !== local) {
        // Session changed elsewhere: log out here!
        localStorage.removeItem('sessionId');
        alert('You have been logged out because you logged in from another device.');
        handleLogout();
      }
    });
    return () => unsub();
  }, [currentUser, isLoggedIn]);

  // Show welcome screen on every app load/refresh
  useEffect(() => {
    // Reset welcome screen state on every app load
    setWelcomeMode('refresh'); // Default to refresh mode
    setShowSplash(true);
  }, []); // Empty dependency array means this runs on every mount/refresh

  const getPageContent = () => {
    switch (activeSection) {
              case 'home':
                return <HomePage onResourceClick={handleResourceClick} isAdmin={isAdmin} isCollegeAdmin={isCollegeAdmin} onAdminPanelToggle={handleAdminPanelToggle} onCollegeDashboardClick={() => handleSectionChange('college-dashboard')} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
      case 'college-dashboard':
        return <CollegeDashboard onBackToHome={() => handleSectionChange('home')} onLogout={handleLogout} />;
      case 'notebookLM':
        return <NotebookPage onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
      case 'aiAdoptionGuideMain':
        return <AIAdoptionPage />;
      case 'responsibleAIFrameworkGuide':
        return <ResponsibleAIFrameworkGuide />;
      case 'managementMatters':
        return <ManagementMatters />;
      case 'aiStudentSuccess':
        return <AIForStudentSuccess />;
      case 'insightChronicles':
        return <InsightChronicles />;
      case 'aiCostCutting':
        return <AIForCostCutting />;
      case 'aiCollegeBrandBuilding':
        return <AIForCollegeBranding />;
      case 'eMagazine':
        return <EMagazinePage />;
      case 'promptToContextEngineeringSeries':
        return <PromptToContextPage />;
      case 'facultyFocus':
      case 'dataLiteracyTrack':
      case 'aiAccreditation':
      case 'aiStrategicGrowth':
      case 'aiGlobalCompetitiveness':
        const pageInfo = getPageInfo(activeSection);
        return (
          <GenericPage
            title={pageInfo?.title || 'Page'}
            description={pageInfo?.subtitle || 'Page description'}
            section={activeSection}
          />
        );
      case 'resource':
        return activeResource ? <ResourcePage resourceType={activeResource} userRole={userRole} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} /> : <HomePage onResourceClick={handleResourceClick} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
      case 'sidebarTab':
        return activeSidebarTabId ? <SidebarTabContent tabId={activeSidebarTabId} /> : <HomePage onResourceClick={handleResourceClick} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
      default:
        return <HomePage onResourceClick={handleResourceClick} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
    }
  };

  const getPageInfo = (section: string) => {
    switch (section) {
      case 'home': return { 
        title: 'AI Buzz - News & Updates', 
        subtitle: 'Latest AI news and updates for educational institutions',
        icon: 'Home'
      };
      case 'notebookLM': return { 
        title: 'Notebook LM', 
        subtitle: 'AI-powered notebook for educational content',
        icon: 'BookOpen'
      };
      case 'aiAdoptionGuideMain': return { 
        title: 'AI Adoption Guide', 
        subtitle: 'Strategic guide for implementing AI in educational institutions',
        icon: 'Lightbulb'
      };
      case 'responsibleAIFrameworkGuide': return { 
        title: 'Responsible AI Framework Guide for Colleges', 
        subtitle: 'Comprehensive framework for implementing responsible AI across college operations',
        icon: 'Shield'
      };
      case 'facultyFocus': return { 
        title: 'Faculty Focus (Educators)', 
        subtitle: 'Comprehensive resources and tools for educators to integrate AI into their teaching practices',
        icon: 'BookOpen'
      };
      case 'managementMatters': return { 
        title: 'Management Matters', 
        subtitle: 'How AI Makes College Administration Simple',
        icon: 'Users'
      };
      case 'dataLiteracyTrack': return { 
        title: 'Data Literacy Track', 
        subtitle: 'Building data literacy skills and understanding for the AI-driven educational landscape',
        icon: 'BarChart3'
      };
      case 'insightChronicles': return { 
        title: 'Insight Chronicles', 
        subtitle: 'Latest Changes: How AI Is Transforming Colleges',
        icon: 'BookOpen'
      };
      case 'aiCollegeBrandBuilding': return { 
        title: 'AI for College Brand Building', 
        subtitle: 'Making Your College Famous with AI: Smart Marketing for Better Student Attraction',
        icon: 'Megaphone'
      };
      case 'aiCostCutting': return { 
        title: 'AI For Cost Cutting', 
        subtitle: 'Smart AI Tools to Reduce Operational Expenses in Colleges',
        icon: 'DollarSign'
      };
      case 'aiStudentSuccess': return { 
        title: 'AI For Student Success', 
        subtitle: 'Empowering Learners Through Technology',
        icon: 'Target'
      };
      case 'aiAccreditation': return { 
        title: 'AI & Accreditation', 
        subtitle: 'AI integration strategies that support and enhance institutional accreditation processes',
        icon: 'Award'
      };
      case 'aiStrategicGrowth': return { 
        title: 'AI For Strategic Growth', 
        subtitle: 'Strategic AI implementation for sustainable institutional growth and development',
        icon: 'TrendingUp'
      };
      case 'aiGlobalCompetitiveness': return { 
        title: 'AI For Global Competitiveness', 
        subtitle: 'Global AI strategies to position your institution competitively in the international education market',
        icon: 'Globe'
      };
      case 'eMagazine': return { 
        title: 'E-Magazine', 
        subtitle: 'Latest insights, trends, and innovations in AI education',
        icon: 'BookOpen'
      };
      case 'promptToContextEngineeringSeries': return { 
        title: 'Prompt to Context Engineering Series', 
        subtitle: 'Master the art of crafting effective prompts and managing context in AI systems',
        icon: 'Sparkles'
      };
      case 'resource': return { 
        title: 'Resources', 
        subtitle: 'Educational resources and materials for AI implementation',
        icon: 'FileText'
      };
      default: return null;
    }
  };



  // Show simple welcome screen while checking authentication or if splash is active
  if (checkingAuth || showSplash) {
    // Use 3 seconds for login mode, 2.8 seconds for refresh mode
    const duration = welcomeMode === 'login' ? 3000 : 2800;
    
    return (
      <SimpleWelcome
        appName="AI-TODAY"
        logoSrc="/AI-TODAY-logo.png"
        mode={welcomeMode}
        durationMs={duration}
        onFinish={handleSplashFinish}
      />
    );
  }

  // Show login page if not logged in (after splash)
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin panel if admin user and admin panel is toggled
  if (isAdmin && showAdminPanel) {
    return <AdminLayout onLogout={handleLogout} onBackToHome={handleBackToHome} />;
  }

  // Show salesman activation message if salesman but not active
  if (isSalesman && !isSalesmanActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Not Activated</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your account is not activated yet. Please contact admin to activate your salesman account.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show salesman dashboard if salesman is active
  if (isSalesman && isSalesmanActive) {
    return <SalesmanDashboard onLogout={handleLogout} />;
  }

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-200">
        {/* Plan Expiring Soon Notification Banner */}
        {isLoggedIn && planExpiringSoon && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Your subscription plan expires in {planExpiringDays === 1 ? '1 day' : `${planExpiringDays} days`}. Please contact the app owner to renew your plan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPlanExpiringSoon(false);
                  }}
                  className="ml-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-1">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-40">
          <Sidebar
            isCollapsed={isCollapsed}
            activeSection={activeSection}
            setActiveSection={handleSectionChange}
            expandedMenus={expandedMenus}
            setExpandedMenus={setExpandedMenus}
            activeSidebarTabId={activeSidebarTabId}
          />
        </div>

        {/* Main Content with Sidebar Offset */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} max-lg:ml-0`}>
          {/* Top Header */}
          <TopBar 
            activeSection={activeSection} 
            onLogout={handleLogout} 
            pageInfo={getPageInfo(activeSection)}
            isAdmin={isAdmin}
            isCollegeAdmin={isCollegeAdmin}
            onAdminPanelToggle={handleAdminPanelToggle}
            currentTopicName={currentTopicName}
          />

          <div className="flex-1 flex min-h-0">
            {/* Main Content Area */}
            <main className={`flex-1 pt-2 px-6 pb-6 overflow-y-auto transition-all duration-300 ${!isCollapsed ? 'xl:mr-80' : ''}`}>
              <div className="max-w-full">
                {getPageContent()}
              </div>
            </main>

            {/* Right Sidebar - Only show on larger screens and when not collapsed */}
            {!isCollapsed && (
              <div className="hidden xl:block w-80 flex-shrink-0 fixed right-0 top-[6rem] bottom-0 z-40 pr-4 overflow-hidden">
                <RightSidebar 
                  onResourceClick={handleResourceClick} 
                  onMagazineClick={() => handleResourceClick('eguide')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Results Overlay */}
        <SearchResults onResultClick={handleSearchResultClick} />
        
        {/* Profile Completion Modal */}
        {showProfileCompletion && currentUser && (
          <ProfileCompletionModal
            isOpen={showProfileCompletion}
            onClose={handleProfileCompletionClose}
            user={{
              uid: currentUser.uid,
              email: currentUser.email || '',
              firstName: currentUser.displayName?.split(' ')[0] || '',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              photoURL: currentUser.photoURL || undefined
            }}
          />
        )}
        </div>
        {/* Global Sponsors Footer */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0 z-30">
          <SponsorsCarousel />
        </div>
      </div>
    </SearchProvider>
  );
}

export default App;