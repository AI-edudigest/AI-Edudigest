import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, BookOpen, Target, Zap } from 'lucide-react';

interface WelcomeSplashProps {
  logoSrc: string;
  appName: string;
  mode: 'welcome' | 'logo-only';
  minDurationMs: number;
  appReady: boolean;
  onFinish: () => void;
  uid?: string;
  className?: string;
  userName?: string; // Optional user name for personalization
}

interface UserSplashState {
  hasSeenWelcome: boolean;
  lastSeen: number;
  uid?: string;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({
  logoSrc,
  appName,
  mode,
  minDurationMs,
  appReady,
  onFinish,
  uid,
  className = '',
  userName
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user has seen welcome splash before
  const getUserSplashState = (): UserSplashState => {
    try {
      const stored = localStorage.getItem('ai-eduapp-splash-state');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasSeenWelcome: parsed.hasSeenWelcome || false,
          lastSeen: parsed.lastSeen || 0,
          uid: parsed.uid
        };
      }
    } catch (error) {
      console.warn('Error reading splash state from localStorage:', error);
    }
    return { hasSeenWelcome: false, lastSeen: 0 };
  };

  // Save user splash state
  const saveUserSplashState = (state: UserSplashState) => {
    try {
      localStorage.setItem('ai-eduapp-splash-state', JSON.stringify({
        ...state,
        lastSeen: Date.now(),
        uid: uid || state.uid
      }));
    } catch (error) {
      console.warn('Error saving splash state to localStorage:', error);
    }
  };

  // Preload logo
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoError(true);
    img.src = logoSrc;
  }, [logoSrc]);

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Check if user is new (hasn't seen welcome before)
  useEffect(() => {
    const userState = getUserSplashState();
    const isNew = !userState.hasSeenWelcome || (uid && userState.uid !== uid);
    setIsNewUser(isNew);
  }, [uid]);

  // Handle splash timing and completion
  useEffect(() => {
    if (!appReady || !logoLoaded) return;

    const userState = getUserSplashState();
    const shouldShowWelcome = mode === 'welcome' && !userState.hasSeenWelcome;
    const actualMode = shouldShowWelcome ? 'welcome' : 'logo-only';
    
    // Show skip button after 1 second for welcome mode
    if (actualMode === 'welcome') {
      const skipTimer = setTimeout(() => {
        setShowSkipButton(true);
      }, 1000);
      return () => clearTimeout(skipTimer);
    }
  }, [appReady, logoLoaded, mode, uid]);

  // Handle minimum duration and completion
  useEffect(() => {
    if (!appReady || !logoLoaded) return;

    const userState = getUserSplashState();
    const shouldShowWelcome = mode === 'welcome' && !userState.hasSeenWelcome;
    const actualMode = shouldShowWelcome ? 'welcome' : 'logo-only';
    
    const handleFinish = () => {
      // Save state for welcome mode
      if (actualMode === 'welcome') {
        saveUserSplashState({
          ...userState,
          hasSeenWelcome: true,
          uid: uid || userState.uid
        });
      }

      // Start fade out animation
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        onFinish();
      }, 300);
    };

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);
    
    const timer = setTimeout(handleFinish, remaining);
    return () => clearTimeout(timer);
  }, [appReady, logoLoaded, minDurationMs, mode, uid, onFinish]);

  // Handle skip button
  const handleSkip = () => {
    const userState = getUserSplashState();
    saveUserSplashState({
      ...userState,
      hasSeenWelcome: true,
      uid: uid || userState.uid
    });
    
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 300);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSkipButton) {
        handleSkip();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, showSkipButton]);

  // Focus management
  useEffect(() => {
    if (showSkipButton && skipButtonRef.current) {
      skipButtonRef.current.focus();
    }
  }, [showSkipButton]);

  if (!isVisible) return null;

  const userState = getUserSplashState();
  const shouldShowWelcome = mode === 'welcome' && !userState.hasSeenWelcome;
  const actualMode = shouldShowWelcome ? 'welcome' : 'logo-only';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      } ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
      aria-describedby="splash-description"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Blur and Sparkle Effects */}
        <div className="absolute inset-0 backdrop-blur-sm">
          {/* Sparkle Effects */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-pulse opacity-30 animation-delay-3000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-scale">
          {logoError ? (
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#9b0101] to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          ) : (
            <div className="relative">
              <img
                src={logoSrc}
                alt={`${appName} Logo`}
                className={`w-24 h-24 mx-auto rounded-2xl shadow-2xl transition-opacity duration-500 ${
                  logoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoError(true)}
              />
              {!logoLoaded && !logoError && (
                <div className="absolute inset-0 w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
              )}
            </div>
          )}
        </div>

        {/* App Name */}
        <h1
          id="splash-title"
          className={`text-4xl font-bold mb-4 animate-fade-in-up animation-delay-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {appName}
        </h1>

        {/* Welcome Mode Content */}
        {actualMode === 'welcome' && (
          <>
            {/* Personalized Welcome Message */}
            <div className="mb-8 animate-fade-in-up animation-delay-700">
              {isNewUser ? (
                <div>
                  <p
                    id="splash-description"
                    className={`text-2xl font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {userName ? `Welcome to ${appName}, ${userName}!` : `Welcome to ${appName}!`}
                  </p>
                  <p
                    className={`text-lg ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Your journey into AI-powered education begins now
                  </p>
                </div>
              ) : (
                <p
                  id="splash-description"
                  className={`text-lg ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Welcome back to the future of AI-powered education
                </p>
              )}
            </div>

            {/* Feature Icons */}
            <div className="flex justify-center space-x-8 mb-8 animate-fade-in-up animation-delay-1000">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  AI Tools
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Smart Learning
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Innovation
                </span>
              </div>
            </div>
          </>
        )}

        {/* Skip Button (Welcome Mode Only) */}
        {actualMode === 'welcome' && showSkipButton && (
          <button
            ref={skipButtonRef}
            onClick={handleSkip}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
            } shadow-lg animate-fade-in-up animation-delay-1200`}
            aria-label="Skip welcome screen"
          >
            <X className="w-4 h-4 inline mr-2" />
            Skip
          </button>
        )}

        {/* Loading Indicator */}
        {!appReady && (
          <div className="mt-8 animate-fade-in-up animation-delay-1000">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#9b0101] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#9b0101] rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-[#9b0101] rounded-full animate-bounce animation-delay-200"></div>
            </div>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading your experience...
            </p>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default WelcomeSplash;
