const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to create college users (leaders/faculty/administrative staff)
 * This function uses Admin SDK to create users without signing them in,
 * which allows the college admin to stay logged in.
 */
exports.createCollegeUser = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const adminUid = context.auth.uid;

  try {
    // Verify user is college_admin
    const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();

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

    // Extract data from request
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      collegeId,
      collegeName,
      createdBySalesman
    } = data;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !collegeId || !collegeName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Validate role - only allow: leader, faculty, administrative_staff
    const allowedRoles = ['leader', 'faculty', 'administrative_staff'];
    if (!allowedRoles.includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid role. Only leader, faculty, and administrative_staff roles are allowed.'
      );
    }

    // Get college document to check plan limits
    const collegeDoc = await admin.firestore().collection('colleges').doc(collegeId).get();
    if (!collegeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'College not found');
    }

    const collegeData = collegeDoc.data();

    // Verify college belongs to admin's institution
    if (adminData.institutionId !== collegeId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'College does not belong to this admin'
      );
    }

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

    // Check user limit - count leader, faculty, and administrative_staff
    // Backward compatibility: also count 'educator' for existing users
    if (collegeData.userLimit !== undefined) {
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('institutionId', '==', collegeId)
        .where('role', 'in', ['leader', 'faculty', 'administrative_staff', 'educator'])
        .get();

      const currentUserCount = usersSnapshot.size;

      if (currentUserCount >= collegeData.userLimit) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'User limit reached. Please upgrade plan.'
        );
      }
    }

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
      createdBySalesman: createdBySalesman || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    return {
      success: true,
      userId: userRecord.uid
    };
  } catch (error) {
    console.error('Error in createCollegeUser:', error);

    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Otherwise, wrap it in an HttpsError
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user: ' + error.message
    );
  }
});

/**
 * Cloud Function to create college admin users
 * This function uses Admin SDK to create users without signing them in,
 * which allows the salesman to stay logged in.
 */
exports.createCollegeAdmin = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const salesmanUid = context.auth.uid;

  try {
    // Verify user is salesman
    const salesmanDoc = await admin.firestore().collection('users').doc(salesmanUid).get();

    if (!salesmanDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Salesman user not found'
      );
    }

    const salesmanData = salesmanDoc.data();
    if (salesmanData.role !== 'salesman') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only salesmen can create college admins'
      );
    }

    if (salesmanData.active !== true) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Salesman account is not active'
      );
    }

    // Extract data from request
    const {
      email,
      password,
      firstName,
      lastName,
      collegeId,
      collegeName
    } = data;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !collegeId || !collegeName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Verify college belongs to salesman
    const collegeDoc = await admin.firestore().collection('colleges').doc(collegeId).get();
    if (!collegeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'College not found');
    }

    const collegeData = collegeDoc.data();
    if (collegeData.createdBySalesman !== salesmanUid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'College does not belong to this salesman'
      );
    }

    // Create auth user using Admin SDK (doesn't sign in the new user)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'college_admin',
      institution: collegeName,
      institutionId: collegeId,
      createdBySalesman: salesmanUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    return { success: true, userId: userRecord.uid };
  } catch (error) {
    console.error('Error creating college admin:', error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create college admin: ' + error.message
    );
  }
});

/**
 * Cloud Function to create users by platform admin
 * This function allows platform admins to create users with any role (including salesman)
 */
exports.createUserByAdmin = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const adminUid = context.auth.uid;

  try {
    // Verify user is platform admin
    const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();

    if (!adminDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Admin user not found'
      );
    }

    const adminData = adminDoc.data();
    if (adminData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only platform admins can create users'
      );
    }

    // Extract data from request
    const {
      email,
      password,
      firstName,
      lastName,
      role
    } = data;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: email, password, firstName, lastName, and role are required'
      );
    }

    // Normalize role to lowercase for validation and storage
    const normalizedRole = typeof role === 'string' ? role.toLowerCase().trim() : '';

    // Validate role - allow common roles (lowercase only)
    const allowedRoles = ['admin', 'salesman', 'college_admin', 'leader', 'faculty', 'administrative_staff'];
    if (!allowedRoles.includes(normalizedRole)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
      );
    }

    // Check if user with this email already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        throw new functions.https.HttpsError(
          'already-exists',
          'User with this email already exists'
        );
      }
    } catch (error) {
      // If error is not "user not found", re-throw it
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      // If it's "user not found", continue (this is what we want)
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create user with Admin SDK (doesn't sign them in)
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false
      });
    } catch (error) {
      console.error('createUserByAdmin - auth createUser error:', error);
      const code = error.code || '';
      if (code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError('already-exists', 'User with this email already exists');
      }
      if (code === 'auth/invalid-email') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email address.');
      }
      if (code === 'auth/invalid-password' || code === 'auth/weak-password') {
        throw new functions.https.HttpsError('invalid-argument', 'Weak or invalid password (min 6 characters).');
      }
      if (code === 'auth/operation-not-allowed') {
        throw new functions.https.HttpsError('permission-denied', 'Email/password sign-in is disabled in this project.');
      }
      throw new functions.https.HttpsError('internal', `Auth error: ${error.message || code || 'Unknown error'}`);
    }

    // Prepare user document data
    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: normalizedRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: normalizedRole === 'salesman' ? false : true // Salesmen are inactive by default
    };

    // Add institution fields if role is college_admin
    if (normalizedRole === 'college_admin' && data.collegeId && data.collegeName) {
      userData.institution = data.collegeName;
      userData.institutionId = data.collegeId;
    }

    // Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

    return {
      success: true,
      userId: userRecord.uid,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('createUserByAdmin - error:', error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user: ' + (error.message || 'Unknown error')
    );
  }
});

/**
 * HTTP Cloud Function to verify collegeId for external Student App
 * This is a public endpoint (no authentication required) that validates college IDs
 * 
 * Endpoint: POST https://<region>-<project>.cloudfunctions.net/verifyCollege
 * 
 * Request Body:
 * {
 *   "collegeId": "MS101"
 * }
 * 
 * Success Response (200):
 * {
 *   "valid": true,
 *   "collegeId": "MS101",
 *   "collegeName": "MS College"
 * }
 * 
 * Error Responses:
 * - 400: Missing collegeId
 * - 200 with valid:false: College not found, inactive, or plan expired
 */
exports.verifyCollege = functions.https.onRequest(async (req, res) => {
  // Enable CORS for all origins
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
    return;
  }

  try {
    // Parse JSON body
    const { collegeId } = req.body;

    // Validate collegeId is provided
    if (!collegeId || typeof collegeId !== 'string' || collegeId.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'collegeId is required and must be a non-empty string'
      });
      return;
    }

    const normalizedCollegeId = collegeId.trim();

    // Query Firestore for college with matching collegeId field
    const collegesRef = admin.firestore().collection('colleges');
    const querySnapshot = await collegesRef
      .where('collegeId', '==', normalizedCollegeId)
      .limit(1)
      .get();

    // Check if college exists
    if (querySnapshot.empty) {
      res.status(200).json({
        valid: false,
        reason: 'NOT_FOUND'
      });
      return;
    }

    // Get college data
    const collegeDoc = querySnapshot.docs[0];
    const collegeData = collegeDoc.data();

    // Check if college status is active (if status field exists)
    if (collegeData.status && collegeData.status !== 'active') {
      res.status(200).json({
        valid: false,
        reason: 'INACTIVE'
      });
      return;
    }

    // Check if plan is expired (if planEndDate exists)
    if (collegeData.planEndDate) {
      const planEndDate = collegeData.planEndDate.toDate ? 
        collegeData.planEndDate.toDate() : 
        new Date(collegeData.planEndDate);
      
      if (planEndDate < new Date()) {
        res.status(200).json({
          valid: false,
          reason: 'PLAN_EXPIRED'
        });
        return;
      }
    }

    // College is valid - return success response
    res.status(200).json({
      valid: true,
      collegeId: normalizedCollegeId,
      collegeName: collegeData.name || ''
    });

  } catch (error) {
    console.error('Error in verifyCollege function:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while verifying college ID'
    });
  }
});

/**
 * HTTP Cloud Function to sync student count from Student App (Project B)
 * This function receives notifications when students are created/deleted in Student App
 * and updates the student count in College App (Project A) Firestore
 * 
 * Endpoint: POST https://<region>-<project>.cloudfunctions.net/syncStudentCount
 * 
 * Request Body:
 * {
 *   "collegeId": "MS101",
 *   "action": "created" | "deleted"
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "studentCount": 5
 * }
 */
exports.syncStudentCount = functions.https.onRequest(async (req, res) => {
  // Enable CORS for all origins
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
    return;
  }

  try {
    // Parse JSON body
    const { collegeId, action } = req.body;

    // Validate required fields
    if (!collegeId || typeof collegeId !== 'string' || collegeId.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'collegeId is required and must be a non-empty string'
      });
      return;
    }

    if (!action || (action !== 'created' && action !== 'deleted')) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'action is required and must be "created" or "deleted"'
      });
      return;
    }

    const normalizedCollegeId = collegeId.trim();

    // Verify college exists in Project A by querying colleges collection
    const collegesRef = admin.firestore().collection('colleges');
    const querySnapshot = await collegesRef
      .where('collegeId', '==', normalizedCollegeId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'College not found'
      });
      return;
    }

    // Get college document to get the Firestore document ID
    const collegeDoc = querySnapshot.docs[0];
    const collegeDocId = collegeDoc.id;

    // Update or create counter document in collegeStudentCounts collection
    const counterRef = admin.firestore()
      .collection('collegeStudentCounts')
      .doc(normalizedCollegeId);

    const counterDoc = await counterRef.get();

    let newCount = 0;
    if (counterDoc.exists) {
      const currentCount = counterDoc.data().studentCount || 0;
      if (action === 'created') {
        newCount = currentCount + 1;
      } else if (action === 'deleted') {
        newCount = Math.max(0, currentCount - 1); // Prevent negative counts
      }
    } else {
      // First student for this college
      if (action === 'created') {
        newCount = 1;
      } else {
        newCount = 0; // Can't delete if count doesn't exist
      }
    }

    // Update counter document
    await counterRef.set({
      collegeId: normalizedCollegeId,
      collegeDocId: collegeDocId, // Store reference to actual college document
      studentCount: newCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`✅ Updated student count for college ${normalizedCollegeId}: ${newCount} (action: ${action})`);

    res.status(200).json({
      success: true,
      studentCount: newCount
    });

  } catch (error) {
    console.error('Error in syncStudentCount function:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while syncing student count'
    });
  }
});

/**
 * HTTP Cloud Function to increment totalStudents field on a college document.
 * This is called by the Student App when a new student account is created.
 *
 * Endpoint: POST https://<region>-<project>.cloudfunctions.net/incrementStudentCount
 *
 * Request Body:
 * {
 *   "collegeId": "MS101" // human-readable collegeId stored on the college document
 * }
 *
 * Behavior:
 * - Validates request method and payload
 * - Finds the matching college document by collegeId field
 * - Ensures the college is active and plan not expired
 * - Atomically increments colleges/{docId}.totalStudents by 1
 */
exports.incrementStudentCount = functions.https.onRequest(async (req, res) => {
  // Enable CORS for all origins (Student App runs in a different project)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
    return;
  }

  try {
    const { collegeId } = req.body || {};

    if (!collegeId || typeof collegeId !== 'string' || collegeId.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'collegeId is required and must be a non-empty string'
      });
      return;
    }

    const normalizedCollegeId = collegeId.trim();

    // Look up the college document by human-readable collegeId field
    const collegesRef = admin.firestore().collection('colleges');
    const querySnapshot = await collegesRef
      .where('collegeId', '==', normalizedCollegeId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'College not found'
      });
      return;
    }

    const collegeDoc = querySnapshot.docs[0];
    const collegeData = collegeDoc.data();

    // Validate college status
    if (collegeData.status && collegeData.status !== 'active') {
      res.status(400).json({
        error: 'Inactive College',
        message: 'College is not active'
      });
      return;
    }

    // Validate plan expiry if planEndDate exists
    if (collegeData.planEndDate) {
      const planEndDate = collegeData.planEndDate.toDate
        ? collegeData.planEndDate.toDate()
        : new Date(collegeData.planEndDate);

      if (planEndDate < new Date()) {
        res.status(400).json({
          error: 'Plan Expired',
          message: 'College subscription plan has expired'
        });
        return;
      }
    }

    const collegeRef = collegeDoc.ref;

    // Atomically increment totalStudents (creates field if it does not exist)
    await collegeRef.update({
      totalStudents: admin.firestore.FieldValue.increment(1)
    });

    res.status(200).json({
      success: true,
      collegeId: normalizedCollegeId
    });
  } catch (error) {
    console.error('Error in incrementStudentCount function:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while incrementing student count'
    });
  }
});

/**
 * HTTP Function: getCollegeEvents
 *
 * Public READ-ONLY API for the Student App to fetch upcoming events
 * for a specific college. No Firebase Auth required.
 *
 * Method: GET
 * Query parameters:
 *   - collegeId (required): human-readable collegeId stored on the college document
 */
exports.getCollegeEvents = functions.https.onRequest(async (req, res) => {
  // CORS for cross-project access
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    });
    return;
  }

  try {
    const collegeIdParam = req.query.collegeId;
    const collegeId = collegeIdParam ? collegeIdParam.toString().trim() : '';

    if (!collegeId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'collegeId query parameter is required'
      });
      return;
    }

    const normalizedCollegeId = collegeId;

    // Verify college exists and is active
    const collegesRef = admin.firestore().collection('colleges');
    const collegeSnap = await collegesRef
      .where('collegeId', '==', normalizedCollegeId)
      .limit(1)
      .get();

    if (collegeSnap.empty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'College not found'
      });
      return;
    }

    const collegeDoc = collegeSnap.docs[0];
    const collegeData = collegeDoc.data();

    if (collegeData.status && collegeData.status !== 'active') {
      res.status(400).json({
        error: 'Inactive College',
        message: 'College is not active'
      });
      return;
    }

    const collegeName = (collegeData.name || '').toString().trim().toLowerCase();

    if (!collegeName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'College name not found'
      });
      return;
    }

    // Query all active events (we'll filter by college name case-insensitively)
    const eventsRef = admin.firestore().collection('events');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query all active events (we'll filter by college in-memory for case-insensitive matching)
    let eventsQuery = eventsRef.where('active', '==', true);

    let eventsSnapshot;
    try {
      eventsSnapshot = await eventsQuery.get();
    } catch (err) {
      console.error('getCollegeEvents: Error querying events:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to query events'
      });
      return;
    }

    // Helper function to normalize date string to YYYY-MM-DD format
    const normalizeDate = (dateStr) => {
      if (!dateStr) return null;
      
      // If already in YYYY-MM-DD format
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.split('T')[0];
      }
      
      // If in DD-MM-YYYY format (like "10-01-2026")
      if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
        const parts = dateStr.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
      }
      
      // Try to parse as Date and convert
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Could not parse date:', dateStr);
      }
      
      return null;
    };

    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    console.log(`🔍 getCollegeEvents: Querying for college "${collegeName}" (normalized)`);
    console.log(`📅 Today's date string: ${todayStr}`);
    console.log(`📊 Total active events found: ${eventsSnapshot.size}`);

    // Filter in-memory for college match (case-insensitive), isHistory, and date >= today
    const events = eventsSnapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        };
      })
      .filter((event) => {
        // Skip events marked as history
        if (event.isHistory === true) {
          return false;
        }
        
        // Case-insensitive college name matching
        const eventCollege = (event.college || '').toString().trim().toLowerCase();
        if (eventCollege !== collegeName) {
          console.log(`College mismatch: event="${eventCollege}" vs query="${collegeName}"`);
          return false;
        }
        
        // Filter events with date >= today
        if (event.date) {
          const normalizedEventDate = normalizeDate(event.date);
          if (normalizedEventDate && normalizedEventDate >= todayStr) {
            return true;
          }
        } else {
          // If no date, include it (let frontend handle it)
          return true;
        }
        
        return false;
      })
      .sort((a, b) => {
        // Sort by date ascending (earliest first)
        const dateA = a.date ? (typeof a.date === 'string' ? a.date.split('T')[0] : a.date) : '';
        const dateB = b.date ? (typeof b.date === 'string' ? b.date.split('T')[0] : b.date) : '';
        return dateA.localeCompare(dateB);
      })
      .map((event) => {
        // Return clean event object for API response
        return {
          id: event.id,
          title: event.title || '',
          description: event.description || '',
          date: event.date || null,
          time: event.time || null,
          location: event.location || null,
          type: event.type || null,
          collegeId: normalizedCollegeId,
          college: collegeName || null,
        };
      });

    console.log(`✅ getCollegeEvents: Returning ${events.length} events for college "${collegeName}"`);

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in getCollegeEvents function:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching college events'
    });
  }
});


