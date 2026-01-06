const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to create college users (leaders/educators)
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


