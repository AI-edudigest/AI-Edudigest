# Google Sign-In Setup Guide for AI-EduDigest

This guide walks you through setting up Google Authentication for your AI-EduDigest application.

## Table of Contents
1. [Firebase Console Setup](#firebase-console-setup)
2. [Google Cloud Console Setup (Optional)](#google-cloud-console-setup-optional)
3. [Environment Variables](#environment-variables)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## Firebase Console Setup

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ai-edudigestapp**

### Step 2: Enable Google Authentication Provider

1. In the left sidebar, click on **Build** → **Authentication**
2. Click on the **Sign-in method** tab
3. Find **Google** in the list of providers
4. Click on **Google** to configure it
5. Toggle the **Enable** switch to ON
6. Configure the following:
   - **Project support email**: Select your email from the dropdown (required)
   - **Project public-facing name**: `AI-EduDigest` (optional, but recommended)
7. Click **Save**

### Step 3: Add Authorized Domains

Firebase automatically authorizes `localhost` and your Firebase Hosting domain. If you're deploying to a custom domain:

1. In the **Authentication** section, go to **Settings** tab
2. Scroll down to **Authorized domains**
3. Click **Add domain**
4. Enter your production domain (e.g., `your-domain.com`)
5. Click **Add**

**Note**: You should add:
- `localhost` (already added by default)
- Your Firebase Hosting domain: `ai-edudigestapp.web.app` (already added by default)
- Any custom domains you're using for production

### Step 4: Verify Configuration

1. Return to **Sign-in method** tab
2. Confirm that **Google** shows as **Enabled**
3. Note the **Web SDK configuration** - you should already have these values in your `.env` file

---

## Google Cloud Console Setup (Optional)

**Note**: This is optional. Firebase automatically creates an OAuth 2.0 client for you. Only follow these steps if you need to customize OAuth settings or use a custom OAuth client.

### When to Use Custom OAuth Client:
- You need specific OAuth scopes beyond basic profile
- You want to use Google Sign-In across multiple platforms (iOS, Android, Web) with the same client
- You need to customize the consent screen with specific branding

### Steps (if needed):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (it should appear as a Cloud project)
3. Navigate to **APIs & Services** → **Credentials**
4. You'll see an existing OAuth 2.0 Client ID created by Firebase
5. If you need to customize it:
   - Click on the client ID
   - Under **Authorized JavaScript origins**, ensure these are added:
     - `http://localhost:5173` (for local development with Vite)
     - `http://localhost` 
     - `https://your-production-domain.com`
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:5173/__/auth/handler` (for local development)
     - `https://your-production-domain.com/__/auth/handler`
     - `https://ai-edudigestapp.firebaseapp.com/__/auth/handler`
6. Click **Save**

### Customizing OAuth Consent Screen (Optional):

1. Go to **APIs & Services** → **OAuth consent screen**
2. Configure:
   - **App name**: AI-EduDigest
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Application home page**: Your app URL
   - **Application privacy policy link**: Your privacy policy URL
   - **Application terms of service link**: Your terms URL
   - **Authorized domains**: Add your domains
   - **Developer contact information**: Your email
3. Click **Save and Continue**
4. On the **Scopes** screen, keep the default scopes (email, profile, openid)
5. Click **Save and Continue**
6. Review and click **Back to Dashboard**

---

## Environment Variables

Your Firebase configuration is already set up in your project. The relevant environment variables should be in your `.env.local` file:

### Required Variables (Already Configured):

```env
VITE_FIREBASE_API_KEY=AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q
VITE_FIREBASE_AUTH_DOMAIN=ai-edudigestapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-edudigestapp
VITE_FIREBASE_STORAGE_BUCKET=ai-edudigestapp.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=55946910635
VITE_FIREBASE_APP_ID=1:55946910635:web:8555fe63f46e286c6cd0ee
VITE_FIREBASE_MEASUREMENT_ID=G-5LH8CR2XQD
```

### Security Notes:
- ✅ The API key in your code is safe to expose (it's a public identifier, not a secret)
- ✅ Firebase security is controlled by Firestore Security Rules and Authentication
- ⚠️ Do NOT commit `.env.local` to version control
- ✅ For production, set these variables in your hosting environment

---

## Testing the Integration

### Local Development Testing

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google Sign-In on Login Page**:
   - Navigate to the login page (appears when not logged in)
   - Click **"Sign in with Google"** button
   - A Google account selection popup should appear
   - Select your Google account
   - You should be redirected to the main app

3. **Test Google Sign-In on Sign-Up Page**:
   - Navigate to the signup page
   - Click **"Continue with Google"** button
   - Complete the same flow as above
   - For new users, a user document will be created in Firestore

4. **Verify User Document Creation**:
   - Go to Firebase Console → Firestore Database
   - Check the `users` collection
   - You should see a new document with your UID containing:
     - `uid`: Your Firebase user ID
     - `email`: Your Google email
     - `firstName`: From your Google display name
     - `lastName`: From your Google display name
     - `photoURL`: Your Google profile picture URL
     - `role`: 'student' (default)
     - `provider`: 'google'
     - `createdAt`: Timestamp

### Testing Checklist

- [ ] Google Sign-In button appears on Login page
- [ ] Google Sign-In button appears on Sign-Up page
- [ ] Clicking button opens Google account selection
- [ ] Selecting account signs in successfully
- [ ] New user document is created in Firestore
- [ ] Existing user can sign in again (document updated with `lastLoginAt`)
- [ ] Sign-out works correctly
- [ ] Redirect to dashboard happens after successful sign-in
- [ ] Error messages display properly (try canceling the popup)
- [ ] Popup blocked fallback works (test by blocking popups in browser)

### Browser Compatibility Testing

Test on multiple browsers:
- [ ] Chrome/Edge (Chromium-based)
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Troubleshooting

### Issue: "Popup blocked" error

**Solution**: The app automatically falls back to redirect flow if popup is blocked.
- User action: Disable popup blocker for your domain or
- The app will redirect to Google sign-in page and redirect back

### Issue: "auth/unauthorized-domain" error

**Solution**: 
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add the domain you're testing from (e.g., `localhost`, your custom domain)
3. Wait a few minutes for changes to propagate

### Issue: "auth/account-exists-with-different-credential"

**Meaning**: User already has an account with email/password using the same email.

**Solution**: 
- User should sign in with email/password instead
- Or implement account linking (advanced feature, not included in basic setup)

### Issue: Google button doesn't appear

**Check**:
1. Browser console for errors
2. Firebase config is correct in `.env.local`
3. Google provider is enabled in Firebase Console
4. You've imported the new functions in your components

### Issue: User document not created in Firestore

**Check**:
1. Firestore Security Rules allow write access
2. Check browser console for errors
3. Verify the `ensureUserDocument` function is being called
4. Check Firestore Rules:
   ```javascript
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
     allow create: if request.auth != null;
   }
   ```

### Issue: Redirect loop on mobile

**Solution**:
- This can happen if `handleGoogleRedirectResult` has issues
- Check that the function is only called once on component mount
- Verify no conflicting authentication state listeners

### Development Tips

1. **Clear browser cache** if you see unexpected behavior
2. **Check browser console** for detailed error messages
3. **Use Firebase Emulator Suite** for local testing without affecting production
4. **Monitor Firebase Console** → Authentication tab to see successful sign-ins
5. **Test incognito mode** to simulate new user experience

---

## Advanced Configuration (Optional)

### Customizing User Profile Fields

After Google Sign-In, you may want to collect additional information (institution, role, etc.). The current implementation:
- Creates user with default `role: 'student'`
- Sets `institution: ''` (empty)

To prompt user for additional info after Google Sign-In:
1. Check if `institution` is empty after sign-in
2. Show a profile completion modal/page
3. Use the `updateUserProfile` function:
   ```typescript
   import { updateUserProfile, getCurrentUser } from './utils/firebase';
   
   const user = getCurrentUser();
   if (user) {
     await updateUserProfile(user.uid, {
       institution: 'Your College Name',
       institutionId: 'college-id',
       role: 'student'
     });
   }
   ```

### Account Linking (Advanced)

If you want to link a Google account with an existing email/password account:
1. Implement account linking flow (requires additional Firebase SDK methods)
2. Update error handling to guide users through linking process
3. This is not included in the basic implementation

---

## Support

If you encounter issues not covered in this guide:
1. Check the [Firebase Authentication Documentation](https://firebase.google.com/docs/auth/web/google-signin)
2. Review the implementation in `src/utils/firebase.ts`
3. Check browser console for detailed error messages
4. Verify all steps in this guide were completed

---

## Security Best Practices

✅ **Implemented**:
- User documents use `merge: true` to avoid overwriting data
- Error messages are user-friendly (don't expose system details)
- Firestore rules should restrict access to authenticated users
- Email verification can be added (optional enhancement)

✅ **Recommended**:
- Enable Firebase App Check (protects against abuse)
- Monitor Authentication usage in Firebase Console
- Set up billing alerts in Google Cloud Console
- Regularly review authorized domains
- Implement rate limiting for auth requests (Firebase has built-in protection)

---

## Next Steps

After completing this setup:
1. Test thoroughly on localhost
2. Deploy to staging environment and test
3. Update authorized domains for production
4. Deploy to production
5. Monitor Authentication logs in Firebase Console

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Project**: AI-EduDigest

