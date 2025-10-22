import { useState, useEffect } from 'react';
import { onAuthStateChange, getUserRole } from './utils/firebase';
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
import SignUpPage from './components/pages/SignUpPage';
import AdminLayout from './components/admin/AdminLayout';
import SidebarTabContent from './components/pages/SidebarTabContent';
import ProfileCompletionModal from './components/ProfileCompletionModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [isSignupProcess, setIsSignupProcess] = useState(false);
  
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
    // Only show welcome screen if not in signup process
    if (!isSignupProcess) {
      setWelcomeMode('login');
      setShowSplash(true);
    }
  };

  const handleLogout = async () => {
    try {
      const { signOutUser } = await import('./utils/firebase');
      await signOutUser();
      setShowSignUp(false);
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

  const handleShowSignUp = () => {
    setShowSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    // Mark that we're in signup process to prevent double welcome screen
    setIsSignupProcess(true);
    // Show welcome screen for new user after successful signup
    setWelcomeMode('login');
    setShowSplash(true);
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

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
          
          // Check if this is a Google user with incomplete profile
          const { getUserProfile } = await import('./utils/firebase');
          const { profile } = await getUserProfile(user.uid);
          
          // Show profile completion modal if:
          // 1. User signed in with Google (has photoURL and provider is google)
          // 2. Institution is empty or not specified
          // 3. Not in signup process (to avoid double modals)
          if (user.photoURL && 
              (!profile?.institution || profile.institution === '' || profile.institution === 'Not specified') &&
              !isSignupProcess) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
              setShowProfileCompletion(true);
            }, 1000);
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('user');
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole('user');
        setIsAdmin(false);
        setCurrentUser(null);
        setShowProfileCompletion(false);
      }
      setCheckingAuth(false);
      
      // Reset signup process flag after auth check
      if (isSignupProcess) {
        setIsSignupProcess(false);
      }
    });

    return () => unsubscribe();
  }, [isSignupProcess]);

  // Show welcome screen on every app load/refresh
  useEffect(() => {
    // Reset welcome screen state on every app load
    setWelcomeMode('refresh'); // Default to refresh mode
    setShowSplash(true);
  }, []); // Empty dependency array means this runs on every mount/refresh

  const getPageContent = () => {
    switch (activeSection) {
              case 'home':
                return <HomePage onResourceClick={handleResourceClick} isAdmin={isAdmin} onAdminPanelToggle={handleAdminPanelToggle} onGoBack={handleGoBack} canGoBack={navigationHistory.length > 0} />;
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


  // Show sign up page if sign up is requested
  if (!isLoggedIn && showSignUp) {
    return (
      <SignUpPage 
        onSignUpSuccess={handleSignUpSuccess} 
        onBackToLogin={handleBackToLogin} 
      />
    );
  }

  // Show simple welcome screen while checking authentication or if splash is active
  if (checkingAuth || showSplash) {
    // Use 3 seconds for login mode (new account users), 3.5 seconds for refresh
    const duration = welcomeMode === 'login' ? 3000 : 3500;
    
    return (
      <SimpleWelcome
        appName="AI-EduApp"
        logoSrc="/AI-Edu_Digest__logo_-removebg-preview.png"
        mode={welcomeMode}
        durationMs={duration}
        onFinish={handleSplashFinish}
      />
    );
  }

  // Show login page if not logged in (after splash)
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onShowSignUp={handleShowSignUp} />;
  }

  // Show admin panel if admin user and admin panel is toggled
  if (isAdmin && showAdminPanel) {
    return <AdminLayout onLogout={handleLogout} onBackToHome={handleBackToHome} />;
  }

  return (
    <SearchProvider>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
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
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            activeSection={activeSection} 
            onLogout={handleLogout} 
            pageInfo={getPageInfo(activeSection)}
            isAdmin={isAdmin}
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
              <div className="hidden xl:block w-80 flex-shrink-0 fixed right-0 top-24 h-[calc(100vh-6rem)] z-30">
                <RightSidebar 
                  onResourceClick={handleResourceClick} 
                  onMagazineClick={() => setActiveSection('eMagazine')}
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
    </SearchProvider>
  );
}

export default App;