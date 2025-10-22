# Environment Variables Guide

## Overview

This document describes all environment variables used in the AI-EduDigest application, with a focus on Firebase and Google Authentication configuration.

---

## Required Environment Variables

All environment variables for this Vite React application should be prefixed with `VITE_` to be accessible in the browser.

### Firebase Configuration

```env
# Firebase API Key (public identifier, safe to expose)
VITE_FIREBASE_API_KEY=AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q

# Firebase Auth Domain
VITE_FIREBASE_AUTH_DOMAIN=ai-edudigestapp.firebaseapp.com

# Firebase Project ID
VITE_FIREBASE_PROJECT_ID=ai-edudigestapp

# Firebase Storage Bucket
VITE_FIREBASE_STORAGE_BUCKET=ai-edudigestapp.firebasestorage.app

# Firebase Messaging Sender ID
VITE_FIREBASE_MESSAGING_SENDER_ID=55946910635

# Firebase App ID
VITE_FIREBASE_APP_ID=1:55946910635:web:8555fe63f46e286c6cd0ee

# Firebase Measurement ID (Google Analytics)
VITE_FIREBASE_MEASUREMENT_ID=G-5LH8CR2XQD
```

---

## How to Set Up Environment Variables

### For Local Development

1. **Create `.env.local` file** in the project root (if not already exists)

2. **Add the following content**:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q
   VITE_FIREBASE_AUTH_DOMAIN=ai-edudigestapp.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=ai-edudigestapp
   VITE_FIREBASE_STORAGE_BUCKET=ai-edudigestapp.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=55946910635
   VITE_FIREBASE_APP_ID=1:55946910635:web:8555fe63f46e286c6cd0ee
   VITE_FIREBASE_MEASUREMENT_ID=G-5LH8CR2XQD
   ```

3. **Verify `.env.local` is in `.gitignore`** (it should be by default)

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

### For Production Deployment

#### Vercel
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select the environment: **Production**, **Preview**, or **Development**
5. Click **Save**
6. Redeploy your application

#### Netlify
1. Go to your site in Netlify Dashboard
2. Navigate to **Site Settings** → **Build & Deploy** → **Environment**
3. Click **Edit variables**
4. Add each variable with its value
5. Click **Save**
6. Trigger a new deployment

#### Firebase Hosting
Firebase Hosting automatically has access to your Firebase project configuration. No additional environment variables needed if deploying to Firebase Hosting.

#### Custom Server/VPS
Add environment variables to your server's environment:

```bash
# Add to ~/.bashrc or ~/.zshrc or server config
export VITE_FIREBASE_API_KEY="AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q"
export VITE_FIREBASE_AUTH_DOMAIN="ai-edudigestapp.firebaseapp.com"
# ... etc
```

---

## Variable Details

### VITE_FIREBASE_API_KEY
- **Purpose**: Identifies your Firebase project to the Firebase backend
- **Security**: Safe to expose publicly (it's a public identifier, not a secret)
- **Source**: Firebase Console → Project Settings → General → Web apps
- **Required**: Yes

### VITE_FIREBASE_AUTH_DOMAIN
- **Purpose**: Domain used for Firebase Authentication redirects
- **Format**: `{project-id}.firebaseapp.com`
- **Source**: Firebase Console → Project Settings → General
- **Required**: Yes

### VITE_FIREBASE_PROJECT_ID
- **Purpose**: Unique identifier for your Firebase project
- **Source**: Firebase Console → Project Settings → General
- **Required**: Yes

### VITE_FIREBASE_STORAGE_BUCKET
- **Purpose**: Default Cloud Storage bucket for file uploads
- **Format**: `{project-id}.firebasestorage.app` or `{project-id}.appspot.com`
- **Source**: Firebase Console → Storage
- **Required**: Yes (if using Firebase Storage)

### VITE_FIREBASE_MESSAGING_SENDER_ID
- **Purpose**: Used for Firebase Cloud Messaging (push notifications)
- **Source**: Firebase Console → Project Settings → Cloud Messaging
- **Required**: Optional (for push notifications)

### VITE_FIREBASE_APP_ID
- **Purpose**: Unique identifier for your Firebase web app
- **Source**: Firebase Console → Project Settings → General → Web apps
- **Required**: Yes

### VITE_FIREBASE_MEASUREMENT_ID
- **Purpose**: Google Analytics measurement ID
- **Format**: `G-XXXXXXXXXX`
- **Source**: Firebase Console → Project Settings → General → Web apps
- **Required**: Optional (for Google Analytics)

---

## Optional Configuration

### Custom Google OAuth Client ID

If you're using a custom OAuth 2.0 Client ID (advanced use case):

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your-custom-client-id.apps.googleusercontent.com
```

**When to use**: 
- Customizing OAuth consent screen
- Using Google Sign-In across multiple platforms
- Requiring additional OAuth scopes

**How to get**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Create or use existing **OAuth 2.0 Client ID**
5. Copy the Client ID

### App Environment

```env
VITE_APP_ENV=development
# Options: development, staging, production
```

**Purpose**: Enable/disable features based on environment

### Debug Mode

```env
VITE_ENABLE_DEBUG_MODE=true
# Options: true, false
```

**Purpose**: Enable detailed logging for debugging

---

## Fallback Values

The application includes fallback values in `src/utils/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-edudigestapp.firebaseapp.com",
  // ... etc
};
```

This means the app will work even without `.env.local` for development, using the hardcoded production values.

**Note**: While convenient, it's best practice to use environment variables to:
- Keep configuration separate from code
- Enable different configs for different environments
- Make it easier to update values without code changes

---

## Security Best Practices

### ✅ Safe to Commit to Git:
- Variable names (in documentation)
- `.env.example` files with dummy values
- References to required variables in README

### ❌ Never Commit to Git:
- `.env.local`
- `.env.production`
- Any file with actual secret values
- Firebase service account keys

### ✅ Security is Enforced By:
- **Firestore Security Rules**: Control database access
- **Firebase Authentication**: Verify user identity
- **Authorized Domains**: Restrict which domains can use your Firebase project
- **Firebase App Check**: Protect against abuse

### ⚠️ Important Notes:
- The Firebase API key is **NOT** a secret - it's safe to expose in client-side code
- Real security comes from properly configured Firestore rules and Authentication
- Never use Firebase Admin SDK credentials in client-side code

---

## Accessing Environment Variables in Code

In your React/TypeScript code:

```typescript
// Access environment variable
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Type safety (add to vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  // ... etc
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Troubleshooting

### Environment variables not loading

**Solution**:
1. Ensure file is named exactly `.env.local`
2. Ensure variables start with `VITE_`
3. Restart dev server after creating/modifying `.env.local`
4. Check for syntax errors (no spaces around `=`)

### Variables undefined in production

**Solution**:
1. Verify variables are set in hosting platform
2. Check deployment logs for errors
3. Ensure variables are set for correct environment (production/preview)
4. Rebuild/redeploy application

### Firebase initialization errors

**Solution**:
1. Verify all required Firebase variables are set
2. Check values match Firebase Console
3. Ensure no typos in variable names
4. Check browser console for specific error messages

---

## Verification Checklist

After setting up environment variables:

- [ ] `.env.local` file exists in project root
- [ ] All required Firebase variables are present
- [ ] Values match Firebase Console → Project Settings
- [ ] `.env.local` is listed in `.gitignore`
- [ ] Development server starts without errors
- [ ] Firebase connection works (check browser console)
- [ ] Google Sign-In works on localhost
- [ ] Production environment variables are set in hosting platform

---

## Example .env.local File

Create a file named `.env.local` in your project root with this content:

```env
# Firebase Configuration for AI-EduDigest
# DO NOT commit this file to Git

# Firebase Core
VITE_FIREBASE_API_KEY=AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q
VITE_FIREBASE_AUTH_DOMAIN=ai-edudigestapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-edudigestapp
VITE_FIREBASE_STORAGE_BUCKET=ai-edudigestapp.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=55946910635
VITE_FIREBASE_APP_ID=1:55946910635:web:8555fe63f46e286c6cd0ee
VITE_FIREBASE_MEASUREMENT_ID=G-5LH8CR2XQD

# Optional: Enable debug mode
# VITE_ENABLE_DEBUG_MODE=true
```

---

## Support

For issues with environment variables:
1. Check this documentation
2. Verify values in Firebase Console
3. Check Vite documentation: https://vitejs.dev/guide/env-and-mode.html
4. Review browser console for errors

---

**Last Updated**: December 2024  
**Project**: AI-EduDigest  
**Framework**: Vite + React + TypeScript

