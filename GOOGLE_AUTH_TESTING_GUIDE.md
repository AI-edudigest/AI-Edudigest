# Google Authentication Testing & Implementation Guide

## Quick Start

This guide helps you test and verify that Google Sign-In is working correctly in your AI-EduDigest application.

---

## Pre-Testing Setup

### 1. Verify Firebase Console Configuration

Before testing, ensure you've completed these steps in Firebase Console:

- [ ] Google provider is **enabled** in Firebase Authentication
- [ ] Project support email is set
- [ ] Authorized domains include `localhost`
- [ ] Your production domain is added (if applicable)

**How to verify**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **ai-edudigestapp** project
3. Go to **Authentication** → **Sign-in method**
4. Confirm **Google** shows as **Enabled**

### 2. Verify Environment Variables

- [ ] `.env.local` file exists (or environment variables are set)
- [ ] All Firebase config variables are present
- [ ] Development server starts without errors

**How to verify**:
```bash
# Start dev server
npm run dev

# Check browser console for Firebase initialization
# Should see: "Firebase initialized successfully" (or no errors)
```

### 3. Verify Code Changes

- [ ] `src/utils/firebase.ts` includes Google auth functions
- [ ] `src/components/pages/LoginPage.tsx` has Google button
- [ ] `src/components/pages/SignUpPage.tsx` has Google button

---

## Testing Scenarios

### Test 1: Login Page - New User (First-Time Google Sign-In)

**Objective**: Verify a new user can sign in with Google and their account is created.

**Steps**:
1. Open app in browser: `http://localhost:5173`
2. If already logged in, sign out first
3. On the **Login page**, click **"Sign in with Google"** button
4. Google account selection popup should appear
5. Select a Google account you haven't used before
6. Grant permissions (if prompted)
7. You should be redirected to the app dashboard

**Expected Results**:
- ✅ Google popup opens without errors
- ✅ Account selection works
- ✅ User is redirected to app after selection
- ✅ Welcome screen appears (if enabled)
- ✅ User lands on the home/dashboard page
- ✅ User is shown as logged in

**Firestore Verification**:
1. Go to Firebase Console → Firestore Database
2. Open `users` collection
3. Find document with your UID
4. Verify it contains:
   ```json
   {
     "uid": "your-firebase-uid",
     "email": "your-email@gmail.com",
     "firstName": "Your",
     "lastName": "Name",
     "photoURL": "https://...",
     "role": "student",
     "institution": "",
     "institutionId": "",
     "provider": "google",
     "createdAt": "timestamp",
     "updatedAt": "timestamp"
   }
   ```

### Test 2: Login Page - Existing Google User

**Objective**: Verify an existing Google user can sign in again.

**Steps**:
1. Sign out from the app
2. On the **Login page**, click **"Sign in with Google"**
3. Select the same Google account as Test 1
4. You should be signed in immediately

**Expected Results**:
- ✅ Sign-in is faster (no permission prompts)
- ✅ User is redirected to dashboard
- ✅ User document in Firestore is updated with `lastLoginAt` timestamp

### Test 3: Sign-Up Page - New User

**Objective**: Verify Google Sign-In works from the Sign-Up page.

**Steps**:
1. Sign out from the app
2. On Login page, click **"Sign up here"**
3. On the **Sign-Up page**, click **"Continue with Google"** button
4. Select a different Google account (not used in Test 1)
5. Complete sign-in

**Expected Results**:
- ✅ Google button appears at the top of the sign-up form
- ✅ Click opens Google account selection
- ✅ New user document is created in Firestore
- ✅ User is redirected to app
- ✅ Success message appears briefly

### Test 4: Error Handling - Popup Closed

**Objective**: Verify error handling when user closes popup.

**Steps**:
1. Sign out
2. Click **"Sign in with Google"**
3. When Google popup appears, close it immediately (click X or press Escape)

**Expected Results**:
- ✅ Error message appears: "Sign-in was cancelled. Please try again."
- ✅ App remains on login page
- ✅ No console errors
- ✅ User can try again

### Test 5: Error Handling - Popup Blocked

**Objective**: Verify fallback to redirect when popup is blocked.

**Steps**:
1. Enable popup blocker in browser
2. Sign out
3. Click **"Sign in with Google"**

**Expected Results**:
- ✅ App automatically falls back to redirect method
- ✅ Page redirects to Google sign-in page
- ✅ After signing in, redirects back to app
- ✅ User is signed in successfully

**How to test**:
- Chrome: Settings → Privacy and security → Site settings → Pop-ups → Add site to "Not allowed to send pop-ups"
- Firefox: Preferences → Privacy & Security → Permissions → Block pop-up windows

### Test 6: Existing Email/Password User Tries Google

**Objective**: Verify error handling when Google email matches existing email/password account.

**Prerequisites**: 
- Create an account using email/password with email: `test@gmail.com`
- Sign out

**Steps**:
1. Click **"Sign in with Google"**
2. Select Google account with email `test@gmail.com` (same as email/password account)

**Expected Results**:
- ✅ Error message appears: "An account already exists with this email using a different sign-in method. Please use your email and password to sign in."
- ✅ User remains on login page
- ✅ User can sign in with email/password instead

**Note**: Account linking is an advanced feature and not implemented in basic setup.

### Test 7: Sign-Out Functionality

**Objective**: Verify sign-out works for Google-authenticated users.

**Steps**:
1. Sign in with Google
2. Click user profile icon or sign-out button
3. Confirm sign-out

**Expected Results**:
- ✅ User is signed out
- ✅ Redirected to login page
- ✅ Cannot access protected routes
- ✅ Can sign in again with Google or email/password

### Test 8: Protected Routes Access

**Objective**: Verify authenticated state persists across page refreshes.

**Steps**:
1. Sign in with Google
2. Navigate to various pages in the app
3. Refresh the browser (F5 or Cmd+R)
4. Observe behavior

**Expected Results**:
- ✅ User remains signed in after refresh
- ✅ Welcome screen may appear briefly on refresh
- ✅ User sees the same page they were on
- ✅ No need to sign in again

### Test 9: Multiple Browser/Incognito Testing

**Objective**: Verify Google Sign-In works in different browser contexts.

**Steps**:
1. Open app in incognito/private window
2. Sign in with Google
3. Verify sign-in works
4. Close incognito window
5. Reopen incognito window and navigate to app
6. Verify user is NOT signed in (session doesn't persist in incognito)

**Expected Results**:
- ✅ Google Sign-In works in incognito mode
- ✅ Session doesn't persist after closing incognito window
- ✅ No issues with cookies or storage

---

## Browser Compatibility Testing

Test Google Sign-In on multiple browsers and devices:

### Desktop Browsers

| Browser | Version | Popup Method | Redirect Method | Notes |
|---------|---------|--------------|-----------------|-------|
| Chrome | Latest | ☐ Pass | ☐ Pass | |
| Firefox | Latest | ☐ Pass | ☐ Pass | |
| Safari | Latest | ☐ Pass | ☐ Pass | May have stricter popup blocking |
| Edge | Latest | ☐ Pass | ☐ Pass | |

### Mobile Browsers

| Device | Browser | Method | Notes |
|--------|---------|--------|-------|
| iOS Safari | Latest | ☐ Pass | Uses redirect method |
| iOS Chrome | Latest | ☐ Pass | May redirect to Safari |
| Android Chrome | Latest | ☐ Pass | |
| Android Firefox | Latest | ☐ Pass | |

**Note**: Mobile devices typically use the redirect flow instead of popups.

---

## Performance Testing

### Loading Times

**Objective**: Ensure Google Sign-In doesn't slow down the app.

**Metrics to check**:
- [ ] Login page loads quickly (< 2 seconds)
- [ ] Google button is immediately clickable
- [ ] Popup opens within 1 second of clicking
- [ ] Redirect after sign-in is smooth

**Tools**:
- Browser DevTools → Network tab
- Lighthouse performance audit
- Chrome DevTools → Performance tab

### User Experience

**Checklist**:
- [ ] Loading states are clear (spinner when signing in)
- [ ] Error messages are user-friendly
- [ ] Success flow is smooth (no jarring transitions)
- [ ] Google logo and styling look professional
- [ ] Button is easily discoverable
- [ ] Mobile experience is touch-friendly

---

## Security Testing

### Test 10: Authorization Domain Restriction

**Objective**: Verify that unauthorized domains are blocked.

**Steps**:
1. Deploy app to a domain NOT listed in Firebase authorized domains
2. Try to sign in with Google

**Expected Results**:
- ❌ Error: "auth/unauthorized-domain"
- ✅ Clear error message to user
- ✅ Sign-in is blocked for security

**Fix**: Add domain to authorized domains in Firebase Console.

### Test 11: User Data Privacy

**Objective**: Ensure only necessary user data is collected.

**Verification**:
1. Sign in with Google
2. Check Firestore user document
3. Verify only these fields are stored:
   - uid, email, firstName, lastName, photoURL
   - role, institution, institutionId
   - provider, createdAt, updatedAt, lastLoginAt

**Expected Results**:
- ✅ No sensitive data stored (passwords, tokens, etc.)
- ✅ Only Google profile info is used
- ✅ No unnecessary scopes requested

### Test 12: Firestore Security Rules

**Objective**: Verify users can only access their own data.

**Steps**:
1. Sign in as User A
2. Try to read User B's document (using browser console):
   ```javascript
   import { doc, getDoc } from 'firebase/firestore';
   import { db } from './utils/firebase';
   
   // Try to access another user's document
   const otherUserDoc = await getDoc(doc(db, 'users', 'other-user-uid'));
   console.log(otherUserDoc.data()); // Should fail
   ```

**Expected Results**:
- ❌ Access denied error
- ✅ Security rules prevent unauthorized access
- ✅ Each user can only read/write their own document

---

## Edge Cases & Advanced Scenarios

### Test 13: Network Interruption

**Steps**:
1. Click "Sign in with Google"
2. Disable network (airplane mode or DevTools offline)
3. Try to complete sign-in

**Expected Results**:
- ✅ Error message: "Network error. Please check your internet connection."
- ✅ User can retry when network is restored

### Test 14: Slow Network

**Steps**:
1. Use Chrome DevTools to throttle network to "Slow 3G"
2. Sign in with Google
3. Observe behavior

**Expected Results**:
- ✅ Loading spinner shows while processing
- ✅ No timeout errors
- ✅ Sign-in eventually succeeds

### Test 15: Multiple Sign-In Attempts

**Steps**:
1. Click "Sign in with Google"
2. Cancel the popup
3. Click "Sign in with Google" again
4. Complete sign-in

**Expected Results**:
- ✅ Second attempt works normally
- ✅ No duplicate requests
- ✅ No stale state issues

### Test 16: Rapid Clicking

**Steps**:
1. Rapidly click "Sign in with Google" button 5-10 times

**Expected Results**:
- ✅ Only one popup/redirect is triggered
- ✅ Button is disabled while processing
- ✅ No duplicate sign-in attempts

---

## Automated Testing (Optional)

### Unit Tests

Example test for `signInWithGoogle` function:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { signInWithGoogle } from './firebase';

describe('signInWithGoogle', () => {
  it('should sign in successfully with popup', async () => {
    // Mock Firebase auth methods
    const mockUser = { uid: '123', email: 'test@gmail.com' };
    vi.mock('firebase/auth', () => ({
      signInWithPopup: vi.fn().mockResolvedValue({ user: mockUser })
    }));
    
    const result = await signInWithGoogle();
    expect(result.user).toBe(mockUser);
    expect(result.error).toBeNull();
  });
  
  it('should handle popup closed by user', async () => {
    // Mock error
    vi.mock('firebase/auth', () => ({
      signInWithPopup: vi.fn().mockRejectedValue({
        code: 'auth/popup-closed-by-user'
      })
    }));
    
    const result = await signInWithGoogle();
    expect(result.user).toBeNull();
    expect(result.error).toContain('cancelled');
  });
});
```

### Integration Tests

Use Cypress or Playwright for end-to-end testing:

```typescript
// Example Cypress test
describe('Google Sign-In', () => {
  it('should display Google button on login page', () => {
    cy.visit('/login');
    cy.contains('Sign in with Google').should('be.visible');
  });
  
  it('should open Google popup when button is clicked', () => {
    cy.visit('/login');
    cy.contains('Sign in with Google').click();
    // Note: Testing actual Google OAuth is complex and usually mocked
  });
});
```

---

## Debugging Tips

### Common Issues and Solutions

#### Issue: "Popup blocked" every time

**Debug**:
- Check browser popup settings
- Ensure HTTPS in production (HTTP may block popups)
- Try incognito mode to rule out extensions

**Solution**: App should automatically fall back to redirect method

#### Issue: "auth/unauthorized-domain"

**Debug**:
- Check current URL/domain
- Check authorized domains in Firebase Console

**Solution**: 
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain
3. Wait a few minutes for propagation

#### Issue: User document not created

**Debug**:
- Check browser console for errors
- Verify Firestore rules allow writes
- Check `ensureUserDocument` function is called

**Solution**:
1. Update Firestore rules to allow user creation:
   ```javascript
   match /users/{userId} {
     allow create: if request.auth != null;
     allow read, write: if request.auth.uid == userId;
   }
   ```

#### Issue: Infinite redirect loop on mobile

**Debug**:
- Check if `handleGoogleRedirectResult` is called multiple times
- Verify useEffect dependencies

**Solution**: Ensure the useEffect for redirect result only runs once on mount

#### Issue: Google button not visible

**Debug**:
- Check browser console for component errors
- Verify imports are correct
- Check if loading states hide the button

**Solution**: 
- Check component rendering logic
- Verify button isn't hidden by CSS
- Check if error states are blocking display

---

## Production Deployment Checklist

Before deploying to production:

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Google Sign-In tested on multiple browsers
- [ ] Error handling tested and user-friendly
- [ ] Production domain added to authorized domains in Firebase
- [ ] Environment variables set in hosting platform
- [ ] Firestore security rules are properly configured
- [ ] Firebase App Check enabled (recommended)

### Post-Deployment
- [ ] Test Google Sign-In on production URL
- [ ] Verify authorized domains work
- [ ] Check SSL certificate is valid
- [ ] Monitor Firebase Authentication logs for errors
- [ ] Monitor Firestore usage and costs
- [ ] Set up alerts for authentication failures

### Monitoring
- [ ] Set up Firebase Analytics to track sign-in events
- [ ] Monitor error rates in Firebase Console
- [ ] Track sign-in method usage (Google vs email/password)
- [ ] Monitor user growth and retention

---

## Testing Report Template

After completing tests, use this template to document results:

```markdown
# Google Authentication Testing Report

**Date**: [Date]
**Tester**: [Your Name]
**Environment**: [Local / Staging / Production]
**Browser**: [Chrome 120 / Firefox 119 / etc.]

## Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

## Test Results

### Functional Tests
- [ ] Test 1: Login - New User - PASS/FAIL
- [ ] Test 2: Login - Existing User - PASS/FAIL
- [ ] Test 3: Sign-Up - New User - PASS/FAIL
- [ ] Test 4: Error - Popup Closed - PASS/FAIL
- [ ] Test 5: Error - Popup Blocked - PASS/FAIL
- [ ] Test 6: Error - Email Conflict - PASS/FAIL
- [ ] Test 7: Sign-Out - PASS/FAIL
- [ ] Test 8: Protected Routes - PASS/FAIL

### Browser Compatibility
- [ ] Chrome Desktop - PASS/FAIL
- [ ] Firefox Desktop - PASS/FAIL
- [ ] Safari Desktop - PASS/FAIL
- [ ] Mobile iOS - PASS/FAIL
- [ ] Mobile Android - PASS/FAIL

### Issues Found
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected:
   - Actual:

## Recommendations
- [List any improvements or fixes needed]

## Sign-Off
- [ ] Ready for production deployment
- [ ] Requires fixes before deployment
```

---

## Support & Resources

### Documentation
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In Web Docs](https://developers.google.com/identity/sign-in/web)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode)

### Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

### Firebase Console Links
- [Authentication Dashboard](https://console.firebase.google.com/project/ai-edudigestapp/authentication/users)
- [Firestore Database](https://console.firebase.google.com/project/ai-edudigestapp/firestore)
- [Project Settings](https://console.firebase.google.com/project/ai-edudigestapp/settings/general)

---

## Next Steps After Testing

1. ✅ Complete all functional tests
2. ✅ Verify on multiple browsers
3. ✅ Document any issues found
4. ✅ Fix critical bugs
5. ✅ Retest after fixes
6. ✅ Deploy to staging environment
7. ✅ Test on staging
8. ✅ Deploy to production
9. ✅ Monitor for 24-48 hours
10. ✅ Collect user feedback

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Project**: AI-EduDigest

