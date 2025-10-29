import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, limit, where, onSnapshot, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBDsgNWIhJcBN9wxlcRMuY8dxJHFmiWC-Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-edudigestapp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-edudigestapp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-edudigestapp.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "55946910635",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:55946910635:web:8555fe63f46e286c6cd0ee",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5LH8CR2XQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// News/Updates Management Functions
export const getNewsUpdates = async () => {
  try {
    const newsRef = collection(db, 'newsUpdates');
    const q = query(newsRef, where('active', '==', true), orderBy('priority', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching news updates:', error);
    return [];
  }
};

export const createNewsUpdate = async (newsData: any) => {
  try {
    const newsRef = collection(db, 'newsUpdates');
    const docRef = await addDoc(newsRef, {
      ...newsData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating news update:', error);
    return { id: null, success: false, error };
  }
};

export const updateNewsUpdate = async (newsId: string, newsData: any) => {
  try {
    const newsRef = doc(db, 'newsUpdates', newsId);
    await updateDoc(newsRef, {
      ...newsData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating news update:', error);
    return { success: false, error };
  }
};

export const deleteNewsUpdate = async (newsId: string) => {
  try {
    const newsRef = doc(db, 'newsUpdates', newsId);
    await deleteDoc(newsRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting news update:', error);
    return { success: false, error };
  }
};

export const reorderNewsUpdates = async (newsList: any[]) => {
  try {
    const batch = [];
    newsList.forEach((item, index) => {
      const newsRef = doc(db, 'newsUpdates', item.id);
      batch.push(updateDoc(newsRef, { priority: index + 1 }));
    });
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error('Error reordering news updates:', error);
    return { success: false, error };
  }
};

export const subscribeToNewsUpdates = (callback: (updates: any[]) => void) => {
  const newsRef = collection(db, 'newsUpdates');
  const q = query(newsRef, where('active', '==', true), orderBy('priority', 'asc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const updates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(updates);
  });
};

// Authentication functions
export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    if (userData) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: userData.role || 'user',
        ...userData
      });
    }
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    // Provide user-friendly error messages
    let userFriendlyMessage = '';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        userFriendlyMessage = 'No account found with this email. Please sign up to create an account.';
        break;
      case 'auth/invalid-email':
        userFriendlyMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        userFriendlyMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        userFriendlyMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = 'Network error. Please check your internet connection.';
        break;
      default:
        userFriendlyMessage = 'Login failed. Please check your email and password, or sign up for a new account.';
    }
    
    return { user: null, error: userFriendlyMessage };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Google Sign-In functions
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Add custom parameters to prompt user to select account
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Try popup first (better UX for desktop)
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create or update user document in Firestore
      await ensureUserDocument(user);
      
      return { user, error: null };
    } catch (popupError: any) {
      // If popup is blocked, fall back to redirect
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked, falling back to redirect...');
        await signInWithRedirect(auth, provider);
        // Redirect will happen, return pending state
        return { user: null, error: null, isPending: true };
      }
      throw popupError;
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Provide user-friendly error messages
    let userFriendlyMessage = '';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        userFriendlyMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = 'Network error. Please check your internet connection.';
        break;
      case 'auth/too-many-requests':
        userFriendlyMessage = 'Too many attempts. Please try again later.';
        break;
      case 'auth/account-exists-with-different-credential':
        userFriendlyMessage = 'An account already exists with this email using a different sign-in method. Please use your email and password to sign in.';
        break;
      default:
        userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
    }
    
    return { user: null, error: userFriendlyMessage };
  }
};

// Handle redirect result for Google Sign-In
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      await ensureUserDocument(user);
      return { user, error: null };
    }
    return { user: null, error: null };
  } catch (error: any) {
    console.error('Google redirect error:', error);
    
    let userFriendlyMessage = '';
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        userFriendlyMessage = 'An account already exists with this email using a different sign-in method.';
        break;
      default:
        userFriendlyMessage = 'Failed to complete Google sign-in.';
    }
    
    return { user: null, error: userFriendlyMessage };
  }
};

// Ensure user document exists in Firestore after Google sign-in
const ensureUserDocument = async (user: User) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // New user - create document with Google profile info
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        photoURL: user.photoURL || '',
        role: 'student', // default role
        institution: '', // Will be empty initially
        institutionId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'google'
      });
      console.log('Created new user document for Google user:', user.uid);
    } else {
      // Existing user - update last login and merge any new info
      await setDoc(userDocRef, {
        lastLoginAt: new Date(),
        photoURL: user.photoURL || userDoc.data().photoURL || '',
        updatedAt: new Date()
      }, { merge: true });
      console.log('Updated existing user document:', user.uid);
    }
  } catch (error) {
    console.error('Error ensuring user document:', error);
    throw error;
  }
};

// Update user profile (for completing profile after Google sign-in)
export const updateUserProfile = async (userId: string, profileData: {
  institution?: string;
  institutionId?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Firestore functions
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role || 'user';
    }
    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        profile: {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'user',
          institution: data.institution || ''
        },
        error: null
      };
    }
    return { profile: null, error: 'User not found' };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { profile: null, error: error.message };
  }
};

// Institutions (Colleges) - search by name prefix (expects a 'name' and 'nameLower' field in docs)
export const searchInstitutions = async (term: string, limitCount: number = 10) => {
  try {
    const qTerm = term.trim().toLowerCase();
    if (!qTerm) {
      return { institutions: [], error: null };
    }

    // Uses range query on a precomputed lowercase field for prefix search
    const institutionsRef = collection(db, 'institutions');
    const q = query(
      institutionsRef,
      where('country', '==', 'India'),
      where('nameLower', '>=', qTerm),
      where('nameLower', '<=', qTerm + '\uf8ff'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const institutions = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    return { institutions, error: null };
  } catch (error: any) {
    console.error('Error searching institutions:', error);
    return { institutions: [], error: error.message };
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), { role });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { users, error: null };
  } catch (error: any) {
    return { users: [], error: error.message };
  }
};

export const createArticle = async (articleData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'articles'), {
      ...articleData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getArticles = async () => {
  try {
    const articlesSnapshot = await getDocs(collection(db, 'articles'));
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { articles, error: null };
  } catch (error: any) {
    return { articles: [], error: error.message };
  }
};

// Subscribe to articles changes (for real-time updates)
export const subscribeToArticles = (callback: (articles: any[]) => void) => {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('published', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 Articles snapshot received:', snapshot.size, 'docs');
      const articles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
      // Sort by priority first (lower number = higher priority), then by createdAt as fallback
      articles.sort((a: any, b: any) => {
        const priorityA = a.priority !== undefined ? a.priority : 999999;
        const priorityB = b.priority !== undefined ? b.priority : 999999;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Lower priority number = appears first
        }
        
        // If priorities are equal, sort by date (newest first)
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      callback(articles);
    }, (error) => {
      console.error('❌ Error in articles subscription:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error: any) {
    console.error('❌ Error setting up articles subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

export const updateArticle = async (articleId: string, articleData: any) => {
  try {
    await updateDoc(doc(db, 'articles', articleId), {
      ...articleData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Reorder articles by priority
export const reorderArticles = async (articles: any[]) => {
  try {
    console.log('🔄 Reordering articles:', articles.length, 'articles');
    const batch = writeBatch(db);
    
    articles.forEach((article, index) => {
      if (!article.id) {
        console.warn('⚠️ Article missing ID:', article);
        return;
      }
      const articleRef = doc(db, 'articles', article.id);
      const newPriority = index + 1;
      console.log(`📝 Updating article ${article.id} (${article.title}) to priority ${newPriority}`);
      batch.update(articleRef, { 
        priority: newPriority,
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    console.log('✅ Articles reordered successfully');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ Error reordering articles:', error);
    return { success: false, error: error.message };
  }
};

export const deleteArticle = async (articleId: string) => {
  try {
    await deleteDoc(doc(db, 'articles', articleId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sponsors functions
export const createSponsor = async (sponsorData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'sponsors'), {
      ...sponsorData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getSponsors = async () => {
  try {
    const sponsorsSnapshot = await getDocs(collection(db, 'sponsors'));
    const sponsors = sponsorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { sponsors, error: null };
  } catch (error: any) {
    return { sponsors: [], error: error.message };
  }
};

export const updateSponsor = async (sponsorId: string, sponsorData: any) => {
  try {
    await updateDoc(doc(db, 'sponsors', sponsorId), {
      ...sponsorData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteSponsor = async (sponsorId: string) => {
  try {
    await deleteDoc(doc(db, 'sponsors', sponsorId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Resources Management Functions
export const getResources = async () => {
  try {
    const resourcesRef = collection(db, 'resources');
    const snapshot = await getDocs(resourcesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return [];
  }
};

export const createResource = async (resourceData: any) => {
  try {
    const resourcesRef = collection(db, 'resources');
    await addDoc(resourcesRef, {
      ...resourceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateResource = async (resourceId: string, resourceData: any) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceRef, {
      ...resourceData,
      updatedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteResource = async (resourceId: string) => {
  try {
    await deleteDoc(doc(db, 'resources', resourceId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Resource Content Management Functions
export const getResourceContent = async (collectionName: string) => {
  try {
    const contentRef = collection(db, collectionName);
    const snapshot = await getDocs(contentRef);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return data;
  } catch (error: any) {
    console.error('Error fetching resource content:', error);
    return [];
  }
};

export const createResourceContent = async (collectionName: string, contentData: any) => {
  try {
    const contentRef = collection(db, collectionName);
    await addDoc(contentRef, {
      ...contentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating resource content:', error);
    return { success: false, error: error.message };
  }
};

export const updateResourceContent = async (collectionName: string, contentId: string, contentData: any) => {
  try {
    const contentRef = doc(db, collectionName, contentId);
    await updateDoc(contentRef, {
      ...contentData,
      updatedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteResourceContent = async (collectionName: string, contentId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, contentId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Notification Functions
export const createNotification = async (notificationData: {
  title: string;
  message: string;
  type: 'article' | 'tool' | 'event' | 'book' | 'course' | 'system';
  actionUrl?: string;
  isRead?: boolean;
}) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: new Date(),
      isRead: notificationData.isRead || false
    };
    
    await addDoc(collection(db, 'notifications'), notification);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export const getNotifications = async (limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { isRead: true });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Get all notifications (for "View All" functionality)
export const getAllNotifications = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return [];
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// Clear all notifications (delete them)
export const clearAllNotifications = async () => {
  try {
    const q = query(collection(db, 'notifications'));
    const querySnapshot = await getDocs(q);
    
    const batch = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error clearing all notifications:', error);
    return { success: false, error: error.message };
  }
};

// Delete a specific notification
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

// AI Tools Management Functions
export const getAITools = async () => {
  try {
    const toolsRef = collection(db, 'aiTools');
    const snapshot = await getDocs(toolsRef);
    const tools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { tools, error: null };
  } catch (error: any) {
    return { tools: [], error: error.message };
  }
};

export const createAITool = async (toolData: any) => {
  try {
    const toolsRef = collection(db, 'aiTools');
    await addDoc(toolsRef, {
      ...toolData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: toolData.active !== undefined ? toolData.active : true
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateAITool = async (toolId: string, toolData: any) => {
  try {
    const toolRef = doc(db, 'aiTools', toolId);
    await updateDoc(toolRef, {
      ...toolData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteAITool = async (toolId: string) => {
  try {
    await deleteDoc(doc(db, 'aiTools', toolId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Dynamic Resource Tabs Management Functions
export const getResourceTabs = async () => {
  try {
    console.log('Firebase: Fetching resourceTabs collection...');
    const tabsRef = collection(db, 'resourceTabs');
    const snapshot = await getDocs(tabsRef);
    console.log('Firebase: Snapshot size:', snapshot.size);
    const tabs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by order field
    tabs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    console.log('Firebase: Mapped Resource Tabs:', tabs);
    return { tabs, error: null };
  } catch (error: any) {
    console.error('Firebase: Error fetching resourceTabs:', error);
    return { tabs: [], error: error.message };
  }
};

export const createResourceTab = async (tabData: any) => {
  try {
    console.log('Firebase: Creating new Resource Tab with data:', tabData);
    const tabsRef = collection(db, 'resourceTabs');
    const docRef = await addDoc(tabsRef, {
      ...tabData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: tabData.active !== undefined ? tabData.active : true,
      order: tabData.order || 0
    });
    console.log('Firebase: Resource Tab created with ID:', docRef.id);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Firebase: Error creating Resource Tab:', error);
    return { success: false, error: error.message };
  }
};

export const updateResourceTab = async (tabId: string, tabData: any) => {
  try {
    const tabRef = doc(db, 'resourceTabs', tabId);
    await updateDoc(tabRef, {
      ...tabData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteResourceTab = async (tabId: string) => {
  try {
    await deleteDoc(doc(db, 'resourceTabs', tabId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const reorderResourceTabs = async (tabs: any[]) => {
  try {
    const batch: any[] = [];
    tabs.forEach((tab: any, index: number) => {
      const tabRef = doc(db, 'resourceTabs', tab.id);
      batch.push(updateDoc(tabRef, { order: index, updatedAt: new Date() }));
    });
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Resource Tab Content Management Functions
export const getResourceTabContent = async (tabId: string) => {
  try {
    console.log('Firebase: Fetching content for tab:', tabId);
    const contentRef = collection(db, 'resourceTabContent');
    const q = query(contentRef, where('tabId', '==', tabId));
    const snapshot = await getDocs(q);
    console.log('Firebase: Content snapshot size:', snapshot.size);
    const contents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by order field
    contents.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    console.log('Firebase: Mapped content:', contents);
    return { contents, error: null };
  } catch (error: any) {
    console.error('Firebase: Error fetching tab content:', error);
    return { contents: [], error: error.message };
  }
};

export const createResourceTabContent = async (tabId: string, contentData: any) => {
  try {
    console.log('Firebase: Creating new content for tab:', tabId, 'with data:', contentData);
    const contentRef = collection(db, 'resourceTabContent');
    const docRef = await addDoc(contentRef, {
      ...contentData,
      tabId,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: contentData.active !== undefined ? contentData.active : true,
      order: contentData.order || 0
    });
    console.log('Firebase: Content created with ID:', docRef.id);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Firebase: Error creating tab content:', error);
    return { success: false, error: error.message };
  }
};

export const updateResourceTabContent = async (contentId: string, contentData: any) => {
  try {
    const contentRef = doc(db, 'resourceTabContent', contentId);
    await updateDoc(contentRef, {
      ...contentData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteResourceTabContent = async (contentId: string) => {
  try {
    await deleteDoc(doc(db, 'resourceTabContent', contentId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Dynamic Feedback Forms Management Functions
export const getFeedbackForms = async () => {
  try {
    console.log('Firebase: Fetching feedbackForms collection...');
    const formsRef = collection(db, 'feedbackForms');
    const snapshot = await getDocs(formsRef);
    console.log('Firebase: Snapshot size:', snapshot.size);
    const forms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by createdAt field
    forms.sort((a: any, b: any) => new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - new Date(a.createdAt?.toDate?.() || a.createdAt).getTime());
    console.log('Firebase: Mapped Feedback Forms:', forms);
    return { forms, error: null };
  } catch (error: any) {
    console.error('Firebase: Error fetching feedbackForms:', error);
    return { forms: [], error: error.message };
  }
};

export const createFeedbackForm = async (formData: any) => {
  try {
    console.log('Firebase: Creating new Feedback Form with data:', formData);
    const formsRef = collection(db, 'feedbackForms');
    const docRef = await addDoc(formsRef, {
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: formData.active !== undefined ? formData.active : true
    });
    console.log('Firebase: Feedback Form created with ID:', docRef.id);
    return { success: true, error: null, formId: docRef.id };
  } catch (error: any) {
    console.error('Firebase: Error creating Feedback Form:', error);
    return { success: false, error: error.message };
  }
};

export const updateFeedbackForm = async (formId: string, formData: any) => {
  try {
    const formRef = doc(db, 'feedbackForms', formId);
    await updateDoc(formRef, {
      ...formData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteFeedbackForm = async (formId: string) => {
  try {
    await deleteDoc(doc(db, 'feedbackForms', formId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Feedback Form Submissions Management
export const submitFeedbackForm = async (formId: string, submissionData: any) => {
  try {
    console.log('Firebase: Submitting feedback form:', formId, submissionData);
    const submissionsRef = collection(db, 'feedbackSubmissions');
    const docRef = await addDoc(submissionsRef, {
      formId,
      ...submissionData,
      submittedAt: new Date()
    });
    console.log('Firebase: Feedback submission created with ID:', docRef.id);
    return { success: true, error: null, submissionId: docRef.id };
  } catch (error: any) {
    console.error('Firebase: Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

export const getFeedbackSubmissions = async (formId?: string) => {
  try {
    console.log('Firebase: Fetching feedback submissions...');
    const submissionsRef = collection(db, 'feedbackSubmissions');
    let q: any = submissionsRef;
    
    if (formId) {
      q = query(submissionsRef, where('formId', '==', formId));
    }
    
    const snapshot = await getDocs(q);
    console.log('Firebase: Submissions snapshot size:', snapshot.size);
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    // Sort by submittedAt field
    submissions.sort((a: any, b: any) => new Date(b.submittedAt?.toDate?.() || b.submittedAt).getTime() - new Date(a.submittedAt?.toDate?.() || a.submittedAt).getTime());
    console.log('Firebase: Mapped submissions:', submissions);
    return { submissions, error: null };
  } catch (error: any) {
    console.error('Firebase: Error fetching feedback submissions:', error);
    return { submissions: [], error: error.message };
  }
};

// Feedback Form Management Functions
export const getFeedbackForm = async () => {
  try {
    const formsRef = collection(db, 'feedbackForms');
    const snapshot = await getDocs(formsRef);
    const forms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get the active form (there should only be one active form)
    const activeForm = forms.find((form: any) => form.isActive === true);
    return { form: activeForm || null, error: null };
  } catch (error: any) {
    return { form: null, error: error.message };
  }
};


// Feedback Submission Functions
export const submitFeedback = async (feedbackData: any) => {
  try {
    // Clean up the feedback data to use proper field names
    const cleanedData: any = {};
    
    Object.entries(feedbackData).forEach(([key, value]) => {
      if (key.startsWith('field_')) {
        // Keep the field ID but also add a cleaner version
        cleanedData[key] = value;
        // Add a human-readable version
        cleanedData[`${key}_label`] = key.replace('field_', 'Field ');
      } else {
        cleanedData[key] = value;
      }
    });
    
    const feedbackRef = collection(db, 'feedbackSubmissions');
    await addDoc(feedbackRef, {
      ...cleanedData,
      submittedAt: new Date(),
      status: 'pending'
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};


// Sidebar Tabs Management Functions
export const getSidebarTabs = async () => {
  try {
    console.log('Firebase: Fetching sidebarTabs collection...');
    const tabsRef = collection(db, 'sidebarTabs');
    const snapshot = await getDocs(tabsRef);
    console.log('Firebase: Snapshot size:', snapshot.size);
    const tabs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by order field
    tabs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    console.log('Firebase: Mapped Sidebar Tabs:', tabs);
    return { tabs, error: null };
  } catch (error: any) {
    console.error('Firebase: Error fetching sidebarTabs:', error);
    return { tabs: [], error: error.message };
  }
};

export const createSidebarTab = async (tabData: any) => {
  try {
    console.log('Firebase: Creating new Sidebar Tab with data:', tabData);
    const tabsRef = collection(db, 'sidebarTabs');
    const docRef = await addDoc(tabsRef, {
      ...tabData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: tabData.active !== undefined ? tabData.active : true,
      order: tabData.order || 0
    });
    console.log('Firebase: Sidebar Tab created with ID:', docRef.id);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Firebase: Error creating Sidebar Tab:', error);
    return { success: false, error: error.message };
  }
};

export const updateSidebarTab = async (tabId: string, tabData: any) => {
  try {
    const tabRef = doc(db, 'sidebarTabs', tabId);
    await updateDoc(tabRef, {
      ...tabData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteSidebarTab = async (tabId: string) => {
  try {
    await deleteDoc(doc(db, 'sidebarTabs', tabId));
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const reorderSidebarTabs = async (tabs: any[]) => {
  try {
    const batch: any[] = [];
    tabs.forEach((tab: any, index: number) => {
      const tabRef = doc(db, 'sidebarTabs', tab.id);
      batch.push(updateDoc(tabRef, { order: index, updatedAt: new Date() }));
    });
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Events functions
export const addEvent = async (eventData: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to add events');
    }

    const eventDoc = {
      title: eventData.title,
      type: eventData.type || '',
      description: eventData.description || '',
      date: eventData.date,
      location: eventData.location || '',
      createdBy: user.uid,
      createdAt: new Date(),
      active: true
    };

    await addDoc(collection(db, 'events'), eventDoc);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error adding event:', error);
    return { success: false, error: error.message };
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete events');
    }

    await deleteDoc(doc(db, 'events', eventId));
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }
};

export const getEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('active', '==', true), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { events, error: null };
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return { events: [], error: error.message };
  }
};

export const subscribeToEvents = (callback: (events: any[]) => void) => {
  try {
    const eventsRef = collection(db, 'events');
    // First try with orderBy, if it fails, fall back to without orderBy
    const q = query(eventsRef, where('active', '==', true));
    
    console.log('🔄 Setting up events subscription with query:', q);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 Events snapshot received:', snapshot.size, 'docs');
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Event doc:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      // Sort events by date after fetching (since orderBy might fail)
      events.sort((a: any, b: any) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log('✅ Processed and sorted events:', events);
      callback(events);
    }, (error) => {
      console.error('❌ Error in events subscription:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error: any) {
    console.error('❌ Error setting up events subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// File upload functions
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    console.log('Attempting to upload file to Firebase Storage...');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    
    const storageRef = ref(storage, path);
    console.log('Storage reference created:', storageRef.fullPath);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload bytes completed, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    // Check if it's a Firebase Storage not enabled error
    if (error.code === 'storage/unknown' || error.message.includes('storage')) {
      throw new Error('Firebase Storage is not enabled. Please enable it in Firebase Console.');
    }
    
    throw new Error('Failed to upload file: ' + error.message);
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file: ' + error.message);
  }
};

export const uploadSponsorLogo = async (file: File, sponsorId: string): Promise<string> => {
  try {
    console.log('Starting logo upload for sponsor:', sponsorId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `sponsors/${sponsorId}/logo_${timestamp}.${fileExtension}`;
    
    console.log('Uploading to path:', fileName);
    const url = await uploadFile(file, fileName);
    console.log('Upload completed, URL:', url);
    
    return url;
  } catch (error) {
    console.error('Error in uploadSponsorLogo:', error);
    throw error;
  }
};

// Ads functions
export const getAds = async () => {
  try {
    console.log('🔄 Firebase getAds: Starting to fetch ads...');
    const adsRef = collection(db, 'ads');
    const q = query(adsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Firebase getAds: Query snapshot size:', querySnapshot.size);
    
    const ads = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📝 Firebase getAds: Processing ad:', doc.id, data);
      return {
        id: doc.id,
        ...data
      };
    });
    
    console.log('✅ Firebase getAds: Returning ads:', ads);
    return { ads, error: null };
  } catch (error: any) {
    console.error('❌ Firebase getAds: Error fetching ads:', error);
    return { ads: [], error: error.message };
  }
};

export const createAd = async (adData: any) => {
  try {
    const adsRef = collection(db, 'ads');
    const docRef = await addDoc(adsRef, {
      ...adData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error('Error creating ad:', error);
    return { id: null, error: error.message };
  }
};

export const updateAd = async (adId: string, adData: any) => {
  try {
    const adRef = doc(db, 'ads', adId);
    await updateDoc(adRef, {
      ...adData,
      updatedAt: new Date()
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Error updating ad:', error);
    return { error: error.message };
  }
};

export const deleteAd = async (adId: string) => {
  try {
    const adRef = doc(db, 'ads', adId);
    await deleteDoc(adRef);
    
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return { error: error.message };
  }
};

export const uploadAdImage = async (file: File, adId: string): Promise<string> => {
  try {
    console.log('Starting image upload for ad:', adId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `ads/${adId}/image_${timestamp}.${fileExtension}`;
    
    console.log('Uploading to path:', fileName);
    const url = await uploadFile(file, fileName);
    console.log('Upload completed, URL:', url);
    
    return url;
  } catch (error) {
    console.error('Error in uploadAdImage:', error);
    throw error;
  }
};

export default app;
