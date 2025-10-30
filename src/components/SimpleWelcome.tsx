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
          <div className={`inline-block transition-transform duration-300 ease-out animate-fade-in-scale logo-container-wrapper ${mode === 'refresh' ? 'mb-0' : 'mb-8'}`}>
            <div className="logo-backdrop">
              <img
                src={logoSrc}
                alt={`${appName} Logo`}
                className={`mx-auto rounded-2xl shadow-lg transition-all duration-300 ease-out cursor-pointer logo-hover-effect relative z-10 ${
                  mode === 'refresh' ? 'w-48 h-48' : 'w-40 h-40'
                }`}
                style={{
                  animation: 'fadeInScale 0.8s ease-out'
                }}
              />
            </div>
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
      <style>{`
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

        .logo-container-wrapper {
          position: relative;
          padding: 10px;
        }

        .logo-container-wrapper:hover {
          transform: translateY(-5px);
        }

        .logo-backdrop {
          position: relative;
          display: inline-block;
        }

        .logo-backdrop::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          background: radial-gradient(circle, rgba(155, 1, 1, 0.3) 0%, rgba(155, 1, 1, 0) 70%);
          opacity: 0;
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          z-index: 1;
          pointer-events: none;
        }

        .logo-backdrop::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          border-radius: 1.2rem;
          border: 3px solid rgba(155, 1, 1, 0);
          transition: border-color 0.3s ease-out, box-shadow 0.3s ease-out;
          z-index: 0;
          pointer-events: none;
          box-shadow: 0 0 0 0 rgba(155, 1, 1, 0);
        }

        .logo-container-wrapper:hover .logo-backdrop::before {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.2);
        }

        .logo-container-wrapper:hover .logo-backdrop::after {
          border-color: rgba(155, 1, 1, 0.5);
          box-shadow: 
            0 0 30px rgba(155, 1, 1, 0.6),
            0 0 60px rgba(155, 1, 1, 0.4),
            inset 0 0 30px rgba(155, 1, 1, 0.2);
        }

        .logo-hover-effect:hover {
          transform: scale(1.1);
          box-shadow: 
            0 20px 60px rgba(155, 1, 1, 0.5),
            0 0 50px rgba(155, 1, 1, 0.4),
            0 0 80px rgba(155, 1, 1, 0.2),
            inset 0 0 20px rgba(155, 1, 1, 0.1);
          filter: brightness(1.1);
        }

        .logo-hover-effect {
          position: relative;
        }

        .logo-hover-effect::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 1.5rem;
          background: radial-gradient(ellipse at center, rgba(155, 1, 1, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease-out;
          z-index: -1;
          pointer-events: none;
        }

        .logo-hover-effect:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default SimpleWelcome;
