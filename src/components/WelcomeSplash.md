# WelcomeSplash Component

A professional, animated splash screen component for React + TypeScript applications with localStorage and Firebase UID tracking.

## Features

- ✅ **Two Modes**: Welcome (first-time users) and Logo-only (returning users)
- ✅ **User Tracking**: localStorage + Firebase UID integration
- ✅ **Configurable Timing**: Minimum display durations (welcome: 2500ms, logo-only: 2000ms)
- ✅ **Smooth Animations**: Fade-in, scale, and pulse effects with CSS keyframes
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Accessibility**: ARIA-compliant with keyboard navigation
- ✅ **Logo Preloading**: Automatic preloading with error fallback
- ✅ **Dark/Light Mode**: Automatic theme detection
- ✅ **Skip Functionality**: Keyboard accessible skip button (welcome mode only)
- ✅ **Professional Design**: Clean, modern educational SaaS appearance

## Props

```typescript
interface WelcomeSplashProps {
  logoSrc: string;           // Logo image source
  appName: string;           // Application name
  mode: 'welcome' | 'logo-only';  // Display mode
  minDurationMs: number;     // Minimum display duration in milliseconds
  appReady: boolean;         // Whether the app is ready to show
  onFinish: () => void;      // Callback when splash finishes
  uid?: string;              // Optional Firebase UID for user tracking
  className?: string;        // Optional additional CSS classes
}
```

## Usage

### Basic Usage

```tsx
import WelcomeSplash from './components/WelcomeSplash';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  return (
    <>
      {showSplash && (
        <WelcomeSplash
          logoSrc="/path/to/logo.png"
          appName="Your App Name"
          mode="welcome"
          minDurationMs={2500}
          appReady={appReady}
          onFinish={() => setShowSplash(false)}
          uid="user-firebase-uid"
        />
      )}
      {/* Your main app content */}
    </>
  );
}
```

### With Firebase Integration

```tsx
import { useEffect, useState } from 'react';
import { onAuthStateChange } from './utils/firebase';
import WelcomeSplash from './components/WelcomeSplash';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [userUid, setUserUid] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUserUid(user.uid);
      }
      setAppReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Initialize your app here
  };

  return (
    <>
      {showSplash && (
        <WelcomeSplash
          logoSrc="/AI-Edu_Digest__logo_-removebg-preview.png"
          appName="AI-EduApp"
          mode="welcome"
          minDurationMs={2500}
          appReady={appReady}
          onFinish={handleSplashFinish}
          uid={userUid}
        />
      )}
      {/* Your main app content */}
    </>
  );
}
```

## User Tracking

The component automatically tracks users using localStorage with the key `ai-eduapp-splash-state`:

```typescript
interface UserSplashState {
  hasSeenWelcome: boolean;  // Whether user has seen welcome screen
  lastSeen: number;         // Timestamp of last splash
  uid?: string;             // Firebase UID for user identification
}
```

## Modes

### Welcome Mode
- Shows full welcome screen with app name, description, and feature icons
- Displays skip button after 1 second
- Minimum duration: 2500ms (recommended)
- Saves state to localStorage after completion

### Logo-Only Mode
- Shows only logo and app name
- No skip button
- Minimum duration: 2000ms (recommended)
- Used for returning users

## Animations

The component includes several CSS animations:

- **fade-in-scale**: Logo entrance animation
- **fade-in-up**: Text and content animations
- **pulse**: Sparkle effects
- **bounce**: Loading indicators

All animations are optimized for performance and include proper timing delays.

## Accessibility

- **ARIA Labels**: Proper role, aria-modal, aria-labelledby, aria-describedby
- **Keyboard Navigation**: ESC key to skip (welcome mode only)
- **Focus Management**: Automatic focus on skip button
- **Screen Reader Support**: Semantic HTML structure

## Styling

The component uses Tailwind CSS classes and includes:

- **Gradient Backgrounds**: Different for light/dark modes
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Automatic theme detection
- **Custom Animations**: CSS keyframes for smooth transitions

## Error Handling

- **Logo Preloading**: Automatic preloading with loading states
- **Fallback Logo**: Shows default icon if logo fails to load
- **localStorage Errors**: Graceful handling of storage issues
- **Network Errors**: Proper error states for failed resources

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- ES6+ features (arrow functions, destructuring, etc.)
- localStorage API support

## Performance

- **Optimized Animations**: Hardware-accelerated CSS transforms
- **Memory Efficient**: Proper cleanup of timers and listeners
- **Lazy Loading**: Logo preloading with proper error handling
- **Minimal Re-renders**: Efficient state management

## Customization

You can customize the component by:

1. **Modifying CSS**: Update the inline styles for different animations
2. **Changing Colors**: Update gradient backgrounds and accent colors
3. **Adding Features**: Extend the component with additional props
4. **Styling**: Override with custom className prop

## Example Integration

See `WelcomeSplashExample.tsx` for a complete integration example with your AI-EduApp.
