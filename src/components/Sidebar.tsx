import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronDown,
  Wrench,
  Sparkles,
  Users,
  TrendingUp,
  Files,
  Shield,
  GraduationCap,
  Briefcase,
  Database,
  BookOpen,
  Target,
  Award,
  TrendingUp as Growth,
  Globe,
  BookOpen as Magazine,
  Settings
} from 'lucide-react';
import { getSidebarTabs, getCurrentUser, getUserProfile } from '../utils/firebase';

interface SidebarProps {
  isCollapsed: boolean;
  activeSection: string;
  setActiveSection: (section: string, tabId?: string) => void;
  expandedMenus: { [key: string]: boolean };
  setExpandedMenus: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  activeSidebarTabId?: string | null;
}

interface SidebarTab {
  id: string;
  name: string;
  label: string;
  icon: string;
  section: string;
  order: number;
  active: boolean;
  hasSubmenu?: boolean;
  submenu?: Array<{
    id: string;
    label: string;
    section: string;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  activeSection,
  setActiveSection,
  expandedMenus,
  setExpandedMenus,
  activeSidebarTabId,
}) => {
  const [dynamicMenuItems, setDynamicMenuItems] = useState<SidebarTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionName, setInstitutionName] = useState<string>('');

  // Icon mapping
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Home,
    Wrench,
    Sparkles,
    Users,
    TrendingUp,
    Shield,
    GraduationCap,
    Briefcase,
    Database,
    BookOpen,
    Target,
    Award,
    Globe,
    FileText: Files
  };

  // Load dynamic menu items from Firebase
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        console.log('Loading sidebar tabs from Firebase...');
        const { tabs, error } = await getSidebarTabs();
        console.log('Firebase response:', { tabs, error });
        
        if (error) {
          console.error('Error loading sidebar tabs:', error);
          // No fallback - show empty sidebar if Firebase fails
          setDynamicMenuItems([]);
        } else {
          // Filter only active tabs and ensure proper typing
          const activeTabs = tabs.filter((tab: any) => tab.active && tab.name && tab.icon);
          console.log('Active tabs found:', activeTabs);
          setDynamicMenuItems(activeTabs);
        }
      } catch (error) {
        console.error('Error loading sidebar tabs:', error);
        setDynamicMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
    
    // Listen for storage events to refresh when tabs are updated
    const handleStorageChange = () => {
      console.log('Storage changed, reloading sidebar tabs...');
      loadMenuItems();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load logged-in user's institution for branding subtitle
  useEffect(() => {
    const loadInstitution = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;
        const { profile } = await getUserProfile(user.uid);
        if (profile?.institution) {
          setInstitutionName(profile.institution);
        }
      } catch (e) {
        // silent
      }
    };
    loadInstitution();
  }, []);


  const toggleMenu = (menu: string) => {
    if (!isCollapsed) {
      setExpandedMenus(prev => ({
        ...prev,
        [menu]: !prev[menu]
      }));
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col h-full`}>
      {/* Fixed Logo and Branding - Always at top */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <img 
              src="/AI-Edu app logo  .png" 
              alt="AI-EduApp Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                <span style={{ color: '#000000' }}>AI-Edu</span>
                <span style={{ color: '#9b0101' }}>App</span>
              </h1>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">
                {institutionName ? `AI for ${institutionName}` : 'AI for Colleges'}
              </p>
            </div>
          </div>
        ) : (
          <img 
            src="/AI-Edu app logo  .png" 
            alt="AI-EduApp Logo" 
            className="w-32 h-32 mx-auto"
          />
        )}
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b0101]"></div>
          </div>
        ) : dynamicMenuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Settings className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No navigation items available.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              Contact administrator to add sidebar tabs.
            </p>
          </div>
        ) : (
          <ul className="space-y-1 pt-4">
            {dynamicMenuItems.map((item) => {
              const IconComponent = iconMap[item.icon] || Home;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.hasSubmenu && !isCollapsed) {
                        toggleMenu(item.id);
                      } else {
                        // Special handling for Home tab - navigate to actual home page
                        if (item.section === 'home' || item.name.toLowerCase() === 'home') {
                          setActiveSection('home');
                        } else {
                          // For other dynamic sidebar tabs, use 'sidebarTab' section and pass the tab ID
                          setActiveSection('sidebarTab', item.id);
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${
                      (activeSection === 'home' && (item.section === 'home' || item.name.toLowerCase() === 'home')) ||
                      (activeSection === 'sidebarTab' && activeSidebarTabId === item.id)
                        ? 'bg-[#9b0101]/10 dark:bg-[#9b0101]/20 text-[#9b0101] dark:text-[#9b0101] border border-[#9b0101]/30 dark:border-[#9b0101]/50' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </div>
                    {item.hasSubmenu && !isCollapsed && (
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenus[item.id] ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.hasSubmenu && !isCollapsed && expandedMenus[item.id] && (
                    <ul className="mt-2 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.submenu?.map((subItem) => (
                        <li key={subItem.id}>
                          <button 
                            onClick={() => setActiveSection(subItem.section)}
                            className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-200 hover:scale-105 ${
                              activeSection === subItem.section
                                ? 'text-[#9b0101] dark:text-[#9b0101] bg-[#9b0101]/10 dark:bg-[#9b0101]/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            {subItem.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;