# 🚀 Google Sign-In Quick Start

## 5-Minute Setup Guide

This is the fastest way to get Google Sign-In working. For detailed information, see the other documentation files.

---

## Step 1: Enable Google in Firebase (2 minutes)

1. Go to https://console.firebase.google.com/
2. Select your project: **ai-edudigestapp**
3. Click **Authentication** in the left sidebar
4. Click the **Sign-in method** tab
5. Find **Google** in the list
6. Click on it and toggle **Enable** to ON
7. Select your email from the **Project support email** dropdown
8. Click **Save**

✅ **Done!** Google authentication is now enabled.

---

## Step 2: Test Locally (3 minutes)

### Option A: Test Right Away (No .env needed)

The app has fallback Firebase config values, so you can test immediately:

```bash
# Start the dev server
npm run dev
```

Open http://localhost:5173 and you should see the login page with a "Sign in with Google" button!

### Option B: Use Environment Variables (Recommended)

If you want to use environment variables instead of hardcoded values:

1. Create a file named `.env.local` in your project root
2. Add this content:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q
   VITE_FIREBASE_AUTH_DOMAIN=ai-edudigestapp.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=ai-edudigestapp
   VITE_FIREBASE_STORAGE_BUCKET=ai-edudigestapp.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=55946910635
   VITE_FIREBASE_APP_ID=1:55946910635:web:8555fe63f46e286c6cd0ee
   VITE_FIREBASE_MEASUREMENT_ID=G-5LH8CR2XQD
   ```
3. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## Step 3: Try It Out!

1. Open http://localhost:5173
2. You'll see the login page
3. Click **"Sign in with Google"**
4. A popup will appear with Google account selection
5. Choose your Google account
6. You'll be signed in and redirected to the dashboard!

### First-time sign-in:
- A user document will be created in Firestore automatically
- Your name and email will be fetched from your Google account
- Your profile picture will be saved

### Next time:
- Just click "Sign in with Google" and you're in instantly!

---

## Verify It's Working

### Check 1: See the User in Firebase
1. Go to Firebase Console → Authentication → Users
2. You should see your Google account listed
3. Note the **Provider** column shows "google.com"

### Check 2: See the User Document
1. Go to Firebase Console → Firestore Database
2. Open the `users` collection
3. Find the document with your UID
4. You should see:
   - Your email
   - First and last name
   - Photo URL
   - Role (default: "student")
   - provider: "google"

---

## That's It! 🎉

Google Sign-In is now working! Your users can:
- ✅ Sign in with one click
- ✅ No password to remember
- ✅ Fast and secure authentication
- ✅ Auto-filled profile info

---

## What Was Implemented?

### On Login Page:
- "Sign in with Google" button added
- Popup-based authentication (with redirect fallback)
- Error handling

### On Sign-Up Page:
- "Continue with Google" button added
- Same functionality as login

### Behind the Scenes:
- Automatic user document creation in Firestore
- Error handling for edge cases
- Loading states for better UX

---

## Common Issues

### "Popup blocked" Error
**Solution**: The app automatically falls back to redirect. Just allow popups for localhost in your browser settings, or use the redirect flow.

### Google Button Doesn't Appear
**Solution**: 
1. Check browser console for errors
2. Make sure you've enabled Google in Firebase Console
3. Try refreshing the page

### "Unauthorized domain" Error
**Solution**: 
1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Make sure `localhost` is in the list (it should be by default)

---

## Next Steps

### For Production Deployment:

1. **Add your production domain** to authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Enter your domain (e.g., `your-app.com`)

2. **Set environment variables** in your hosting platform
   - See `ENVIRONMENT_VARIABLES.md` for details

3. **Test on production** after deployment

### Optional Enhancements:

- Prompt users to complete their profile (add institution/role) after Google sign-in
- Add more OAuth providers (Facebook, Apple, Microsoft)
- Enable account linking for users with existing email/password accounts

---

## Documentation

For more detailed information:

- 📚 **GOOGLE_AUTH_SETUP_GUIDE.md** - Complete setup and troubleshooting
- 📚 **GOOGLE_AUTH_TESTING_GUIDE.md** - Testing procedures and checklists
- 📚 **ENVIRONMENT_VARIABLES.md** - Environment configuration details
- 📚 **GOOGLE_AUTH_IMPLEMENTATION_SUMMARY.md** - Technical overview

---

## Support

Need help? Check:
1. Browser console for error messages
2. Firebase Console → Authentication for sign-in logs
3. The troubleshooting sections in `GOOGLE_AUTH_SETUP_GUIDE.md`

---

**Happy Coding! 🚀**

---

**Last Updated**: December 2024  
**Project**: AI-EduDigest

