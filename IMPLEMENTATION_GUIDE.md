# Recommended Solution: Firebase Cloud Functions

Since you already have Firebase configured, **Firebase Cloud Functions** is the best option.

## Quick Summary

✅ **Admin stays logged in** after creating users  
✅ **No separate server needed**  
✅ **Integrated with your existing Firebase setup**  
✅ **Scales automatically**

---

## Step-by-Step Implementation

### Step 1: Initialize Firebase Functions

```bash
# Make sure you're in the project root
cd "C:\Users\Mohammed Amer\ai-eduapp\AI-Edudigest"

# Initialize Functions (if not already done)
firebase init functions
```

**When prompted:**
- Language: **JavaScript** or **TypeScript** (recommended)
- ESLint: **Yes**
- Install dependencies: **Yes**

### Step 2: Install Firebase Admin SDK

```bash
cd functions
npm install firebase-admin
cd ..
```

### Step 3: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ai-edudigestapp**
3. Go to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `service-account-key.json` in your project root (or functions folder)

### Step 4: Create Cloud Function

Edit `functions/index.js` (or `functions/index.ts`):

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp();

exports.createCollegeUser = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const adminUid = context.auth.uid;
  const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();

  // Verify user is college_admin
  if (!adminDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Admin user not found'
    );
  }

  const adminData = adminDoc.data();
  if (adminData.role !== 'college_admin' && adminData.role !== 'college-admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only college admins can create users'
    );
  }

  const { email, password, firstName, lastName, role, collegeId, collegeName, createdBySalesman } = data;

  // Validate role
  if (role !== 'leader' && role !== 'educator') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid role. Only leader and educator roles are allowed.'
    );
  }

  // Get college document to check plan limits
  const collegeDoc = await admin.firestore().collection('colleges').doc(collegeId).get();
  if (!collegeDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'College not found');
  }

  const collegeData = collegeDoc.data();

  // Check plan expiry
  if (collegeData.planEndDate) {
    const planEndDate = collegeData.planEndDate.toDate();
    if (planEndDate < new Date()) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Plan expired. Contact support.'
      );
    }
  }

  // Check user limit
  if (collegeData.userLimit !== undefined) {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('institutionId', '==', collegeId)
      .where('role', 'in', ['leader', 'educator'])
      .get();
    
    const currentUserCount = usersSnapshot.size;

    if (currentUserCount >= collegeData.userLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'User limit reached. Please upgrade plan.'
      );
    }
  }

  try {
    // Create user with Admin SDK (doesn't sign them in)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`
    });

    // Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      institution: collegeName,
      institutionId: collegeId,
      createdBySalesman: createdBySalesman,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    return { success: true, userId: userRecord.uid };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user: ' + error.message
    );
  }
});
```

### Step 5: Update Frontend Code

Update `src/utils/firebase.ts`:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

// ... existing imports ...

// Get Functions instance
const functions = getFunctions();

export const addCollegeUser = async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  role: 'leader' | 'educator';
  password: string;
}, collegeAdminUid: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate role
    if (userData.role !== 'leader' && userData.role !== 'educator') {
      throw new Error('Invalid role. Only leader and educator roles are allowed.');
    }

    // Get college admin's profile to get their collegeId and college name
    const adminDoc = await getDoc(doc(db, 'users', collegeAdminUid));
    if (!adminDoc.exists()) {
      throw new Error('College admin not found');
    }
    const adminData = adminDoc.data();
    if (adminData.role !== 'college_admin' && adminData.role !== 'college-admin') {
      throw new Error('Unauthorized: User is not a college admin');
    }
    const collegeId = adminData.institutionId;
    const collegeName = adminData.institution;
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    // Get college document to find the salesman who created it
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    const createdBySalesman = collegeData.createdBySalesman;

    // Call Cloud Function
    const createCollegeUser = httpsCallable(functions, 'createCollegeUser');
    
    const result = await createCollegeUser({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      collegeId: collegeId,
      collegeName: collegeName,
      createdBySalesman: createdBySalesman
    });

    return { 
      success: true, 
      userId: result.data.userId, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error adding college user:', error);
    // Extract error message from Cloud Function error
    const errorMessage = error.message || error.details || 'Failed to create user';
    return { success: false, userId: null, error: errorMessage };
  }
};
```

### Step 6: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:createCollegeUser
```

### Step 7: Test

1. Login as college_admin
2. Try creating a new user (leader/educator)
3. ✅ Admin should stay logged in!

---

## Alternative: Use Service Account (If Cloud Functions have permission issues)

If you prefer to use a service account key file:

1. Save the service account JSON in `functions/service-account-key.json`
2. Update `functions/index.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

---

## Cost Considerations

- **Free Tier**: 2 million function invocations/month
- **After Free Tier**: $0.40 per million invocations
- For user creation, this should be very affordable

---

## Need Help?

If you want me to help implement this, I can:
1. Create the Cloud Function file
2. Update the frontend code
3. Help with deployment

Just let me know!


