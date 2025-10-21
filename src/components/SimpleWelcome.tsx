import React, { useState, useEffect } from 'react';

interface SimpleWelcomeProps {
  appName: string;
  logoSrc?: string;
  mode?: 'login' | 'refresh';
  durationMs?: number;
  onFinish: () => void;
  className?: string;
}

const SimpleWelcome: React.FC<SimpleWelcomeProps> = ({
  appName,
  logoSrc,
  mode = 'login',
  durationMs = 3500,
  onFinish,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start the timer when component mounts
    const timer = setTimeout(() => {
      // Start fade out animation
      setIsAnimating(true);
      
      // Hide component after fade out completes
      setTimeout(() => {
        setIsVisible(false);
        onFinish();
      }, 300); // 300ms fade out duration
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      } ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Main Content */}
      <div className="text-center">
        {/* App Logo */}
        {logoSrc && (
          <div className={`animate-fade-in-scale ${mode === 'refresh' ? 'mb-0' : 'mb-8'}`}>
            <img
              src={logoSrc}
              alt={`${appName} Logo`}
              className={`mx-auto rounded-2xl shadow-lg ${
                mode === 'refresh' ? 'w-32 h-32' : 'w-24 h-24'
              }`}
              style={{
                animation: 'fadeInScale 0.8s ease-out'
              }}
            />
          </div>
        )}
        
        {/* Welcome Text - Only show for login mode */}
        {mode === 'login' && (
          <>
            <h1
              id="welcome-title"
              className="text-6xl font-bold text-[#9b0101] mb-4 animate-fade-in-scale"
              style={{
                textShadow: '0 4px 8px rgba(155, 1, 1, 0.3)',
                animation: 'fadeInScale 0.8s ease-out 0.2s both'
              }}
            >
              Welcome to {appName}
            </h1>
            
            {/* Subtitle */}
            <p
              className="text-xl text-gray-600 animate-fade-in-up"
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.5s both'
              }}
            >
              Your AI-powered educational journey begins here
            </p>
          </>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
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
          animation: fadeInScale 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
};

export default SimpleWelcome;
