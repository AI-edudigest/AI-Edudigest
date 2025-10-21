import React, { useState, useEffect } from 'react';
import WelcomeSplash from './WelcomeSplash';

// Example usage of WelcomeSplash component
const WelcomeSplashExample: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [userUid, setUserUid] = useState<string | undefined>();

  // Simulate app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 2000); // Simulate 2 second loading time

    return () => clearTimeout(timer);
  }, []);

  // Get user UID (replace with your Firebase auth logic)
  useEffect(() => {
    // Example: Get UID from Firebase auth or props
    // const uid = firebase.auth().currentUser?.uid;
    // setUserUid(uid);
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Your app initialization logic here
    console.log('Splash finished, app is ready!');
  };

  if (!showSplash) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to AI-EduApp!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your app content goes here...
          </p>
        </div>
      </div>
    );
  }

  return (
    <WelcomeSplash
      logoSrc="/AI-Edu_Digest__logo_-removebg-preview.png"
      appName="AI-EduApp"
      mode="welcome" // or "logo-only" for returning users
      minDurationMs={2500} // 2.5 seconds for welcome mode
      appReady={appReady}
      onFinish={handleSplashFinish}
      uid={userUid}
    />
  );
};

export default WelcomeSplashExample;
