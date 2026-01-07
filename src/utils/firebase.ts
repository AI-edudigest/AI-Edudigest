import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, limit, where, onSnapshot, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { v4 as uuidv4 } from 'uuid';

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

// Initialize Firebase Cloud Functions
export const functions = getFunctions(app);

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
    // Use soft delete instead of hard delete
    const result = await softDeleteItem('newsUpdates', newsId);
    return { success: result.success, error: result.error || null };
  } catch (error: any) {
    console.error('Error deleting news update:', error);
    return { success: false, error };
  }
};

export const reorderNewsUpdates = async (newsList: any[]) => {
  try {
    const batch: Promise<void>[] = [];
    newsList.forEach((item, index) => {
      const newsRef = doc(db, 'newsUpdates', item.id);
      batch.push(updateDoc(newsRef, { priority: index + 1 }) as Promise<void>);
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
    const updates = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((update: any) => !update.deleted); // Filter out soft-deleted updates
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
        role: 'user', // Always set to 'user', ignore any role from userData
        createdAt: new Date(),
        ...userData
      });
    } else {
      // Create user document with basic info if no userData provided
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user',
        createdAt: new Date()
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
    const sessionId = uuidv4();
    // Store in Firestore user profile
    await updateDoc(doc(db, 'users', userCredential.user.uid), { 
      currentSessionId: sessionId,
      lastLoginAt: new Date()
    });
    // Store locally on this device
    localStorage.setItem('sessionId', sessionId);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    // Provide user-friendly error messages
    let userFriendlyMessage = '';
    
    switch (error.code) {
      case 'auth/user-not-found':
        userFriendlyMessage = 'No account found with this email. Please sign up to create an account.';
        break;
      case 'auth/wrong-password':
        userFriendlyMessage = 'Incorrect password. Please enter the correct password.';
        break;
      case 'auth/invalid-credential':
        userFriendlyMessage = 'Login failed. Please check your email and password, or sign up for a new account.';
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
          institution: data.institution || '',
          active: data.active !== undefined ? data.active : true // Default to true if not set
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

export const updateUserRole = async (userId: string, role: string, active?: boolean) => {
  try {
    const updateData: any = { role };
    // If role is salesman and active is provided, update it
    if (role === 'salesman' && active !== undefined) {
      updateData.active = active;
    } else if (role === 'salesman' && active === undefined) {
      // If setting to salesman but active not provided, default to false (needs activation)
      updateData.active = false;
    }
    await updateDoc(doc(db, 'users', userId), updateData);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserActive = async (userId: string, active: boolean) => {
  try {
    await updateDoc(doc(db, 'users', userId), { active });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    console.log('getAllUsers: Starting to fetch users from Firestore...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('getAllUsers: Snapshot size:', usersSnapshot.size);
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('getAllUsers: User doc:', doc.id, data);
      return {
        id: doc.id,
        ...data
      };
    });
    console.log('getAllUsers: Returning', users.length, 'users');
    return { users, error: null };
  } catch (error: any) {
    console.error('getAllUsers: Error fetching users:', error);
    console.error('getAllUsers: Error code:', error.code);
    console.error('getAllUsers: Error message:', error.message);
    return { users: [], error: error.message || 'Failed to fetch users' };
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
    const articles = articlesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((article: any) => !article.deleted); // Filter out soft-deleted articles
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
    // Use soft delete instead of hard delete
    return await softDeleteItem('articles', articleId);
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
    const sponsors = sponsorsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((sponsor: any) => !sponsor.deleted); // Filter out soft-deleted sponsors
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
    // Use soft delete instead of hard delete
    return await softDeleteItem('sponsors', sponsorId);
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
    const data = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((item: any) => !item.deleted); // Filter out soft-deleted items
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
    // Use soft delete instead of hard delete
    return await softDeleteItem(collectionName, contentId);
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
    const tools = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((tool: any) => !tool.deleted); // Filter out soft-deleted tools
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
    // Use soft delete instead of hard delete
    return await softDeleteItem('aiTools', toolId);
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
    const batch: Promise<void>[] = [];
    tabs.forEach((tab: any, index: number) => {
      const tabRef = doc(db, 'resourceTabs', tab.id);
      batch.push(updateDoc(tabRef, { order: index, updatedAt: new Date() }) as Promise<void>);
    });
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: (error as any).message };
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
    // Use soft delete instead of hard delete
    return await softDeleteItem('resourceTabContent', contentId);
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
    const batch: Promise<void>[] = [];
    tabs.forEach((tab: any, index: number) => {
      const tabRef = doc(db, 'sidebarTabs', tab.id);
      batch.push(updateDoc(tabRef, { order: index, updatedAt: new Date() }) as Promise<void>);
    });
    await Promise.all(batch);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
};

// Events functions
export const addEvent = async (eventData: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to add events');
    }

    // Get the creator's college/institution
    let creatorCollege = '';
    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile.profile?.institution) {
        creatorCollege = userProfile.profile.institution.trim();
        console.log('🏫 Event creator college:', creatorCollege);
      } else {
        console.warn('⚠️ User has no institution set. Event will not be visible to other users.');
      }
    } catch (error) {
      console.error('Error getting user college for event:', error);
      // Continue without college if error occurs
    }
    
    // Validate that leader/admin has a college set
    if (!creatorCollege || creatorCollege === '') {
      console.warn('⚠️ Event created without college - will not be visible to regular users');
    }

    // Check if event should be marked as history based on date
    const isHistory = eventData.date ? isEventInHistory(eventData.date) : false;

    const eventDoc = {
      title: eventData.title,
      type: eventData.type || '',
      description: eventData.description || '',
      date: eventData.date,
      time: eventData.time || '',
      location: eventData.location || '',
      createdBy: user.uid,
      college: creatorCollege, // Store creator's college with event
      createdAt: new Date(),
      active: true,
      isHistory: isHistory // Mark if event is already in history
    };

    await addDoc(collection(db, 'events'), eventDoc);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error adding event:', error);
    return { success: false, error: error.message };
  }
};

export const updateEvent = async (eventId: string, eventData: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update events');
    }

    // Check if event should be marked as history based on updated date
    const isHistory = eventData.date ? isEventInHistory(eventData.date) : false;

    const eventDoc = {
      title: eventData.title,
      type: eventData.type || '',
      description: eventData.description || '',
      date: eventData.date,
      time: eventData.time || '',
      location: eventData.location || '',
      isHistory: isHistory, // Update history status based on new date
      updatedAt: new Date()
    };

    await updateDoc(doc(db, 'events', eventId), eventDoc);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    // Use soft delete instead of hard delete
    return await softDeleteItem('events', eventId);
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }
};

export const getEvents = async () => {
  try {
    // Get current user's college and role for filtering
    let userCollege = '';
    let userRole = 'user';
    try {
      const user = auth.currentUser;
      if (user) {
        userRole = await getUserRole(user.uid);
        
        // Admin users see all events, everyone else is filtered by college
        if (userRole === 'admin') {
          console.log('👑 getEvents: Admin user - showing all events');
        } else {
          // Get college for leaders, students, and all other non-admin users
          const userProfile = await getUserProfile(user.uid);
          if (userProfile.profile?.institution) {
            userCollege = userProfile.profile.institution.trim();
            console.log('🔍 getEvents: Filtering for user college:', userCollege, 'Role:', userRole);
            
            // Log for debugging
            if (!userCollege || userCollege === '') {
              console.warn('⚠️ getEvents: User college is empty after trim - user will not see any events');
            }
          } else {
            console.warn('⚠️ getEvents: User has no institution set');
          }
        }
      }
    } catch (error) {
      console.error('Error getting user college/role for event filtering:', error);
    }

    const eventsRef = collection(db, 'events');
    // Try to order by createdAt first, fallback to no ordering if it fails
    let q;
    try {
      q = query(eventsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
    } catch (error) {
      // If createdAt ordering fails, get all events and sort manually
      q = query(eventsRef, where('active', '==', true));
    }
    const querySnapshot = await getDocs(q);
    
    const events = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((event: any) => {
        // Filter out soft-deleted events
        if (event.deleted) return false;
        
        // Admin users see all events
        if (userRole === 'admin') return true;
        
        // For non-admin users, require both event and user to have college set
        // If user has no college, don't show any events (security)
        if (!userCollege || userCollege.trim() === '') {
          console.log('🚫 getEvents: User has no college - hiding event:', event.title || event.id);
          return false;
        }
        
        // Normalize college names for comparison (trim and lowercase)
        const eventCollege = event.college ? event.college.trim().toLowerCase() : '';
        const normalizedUserCollege = userCollege.trim().toLowerCase();
        
        // If event has no college field, don't show it to regular users (security)
        if (!eventCollege || eventCollege === '') {
          console.log('🚫 getEvents: Event has no college - hiding from user:', event.title || event.id);
          return false;
        }
        
        // Only show if colleges match exactly (case-insensitive)
        if (eventCollege === normalizedUserCollege) {
          console.log('✅ getEvents: Event college matches user college:', event.title || event.id, eventCollege);
          return true;
        }
        
        // Don't show events from other colleges
        console.log('🚫 getEvents: Event college does not match:', event.title || event.id, 'Event college:', eventCollege, 'User college:', normalizedUserCollege);
        return false;
      });
    
    // Sort by createdAt descending (most recent first)
    events.sort((a: any, b: any) => {
      let dateA: Date;
      let dateB: Date;
      
      if (a.createdAt) {
        dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      } else {
        dateA = new Date(0);
      }
      
      if (b.createdAt) {
        dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      } else {
        dateB = new Date(0);
      }
      
      return dateB.getTime() - dateA.getTime();
    });
    
    return { events, error: null };
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return { events: [], error: error.message };
  }
};

// Helper function to check if an event is in history (10+ days past the event date)
export const isEventInHistory = (eventDate: string): boolean => {
  if (!eventDate) return false;
  
  try {
    const eventDateTime = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    // Calculate difference in days
    const diffTime = today.getTime() - eventDateTime.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Event is in history if it's 10 or more days past
    return diffDays >= 10;
  } catch (error) {
    console.error('Error parsing event date:', error);
    return false;
  }
};

export const subscribeToEvents = (callback: (events: any[]) => void) => {
  try {
    const eventsRef = collection(db, 'events');
    // First try with orderBy, if it fails, fall back to without orderBy
    const q = query(eventsRef, where('active', '==', true));
    
    console.log('🔄 Setting up events subscription with query:', q);
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('📊 Events snapshot received:', snapshot.size, 'docs');
      
      // Get current user's college and role for filtering
      let userCollege = '';
      let userRole = 'user';
      try {
        const user = auth.currentUser;
        if (user) {
          const role = await getUserRole(user.uid);
          userRole = role;
          
          // Admin users see all events, everyone else is filtered by college
          if (role === 'admin') {
            console.log('👑 Admin user - showing all events');
          } else {
            // Get college for leaders, students, and all other non-admin users
            const userProfile = await getUserProfile(user.uid);
            if (userProfile.profile?.institution) {
              userCollege = userProfile.profile.institution.trim();
              console.log('🔍 Filtering events for user college:', userCollege, 'Role:', role);
              
              // Log for debugging
              if (!userCollege || userCollege === '') {
                console.warn('⚠️ User college is empty after trim - user will not see any events');
              }
            } else {
              console.warn('⚠️ User has no institution set - will not see any college-specific events');
            }
          }
        }
      } catch (error) {
        console.error('Error getting user college/role for event filtering:', error);
      }
      
      console.log('📊 Total events before filtering:', snapshot.size);
      
      const events = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log('📄 Event doc:', doc.id, data);
          return {
            id: doc.id,
            ...data
          };
        })
        .filter((event: any) => {
          // Filter out soft-deleted events
          if (event.deleted) return false;
          
          // Admin users see all events
          if (userRole === 'admin') return true;
          
          // For non-admin users, require both event and user to have college set
          // If user has no college, don't show any events (security)
          if (!userCollege || userCollege.trim() === '') {
            console.log('🚫 User has no college - hiding event:', event.title);
            return false;
          }
          
          // Normalize college names for comparison (trim and lowercase)
          const eventCollege = event.college ? event.college.trim().toLowerCase() : '';
          const normalizedUserCollege = userCollege.trim().toLowerCase();
          
          // If event has no college field, don't show it to regular users (security)
          if (!eventCollege || eventCollege === '') {
            console.log('🚫 Event has no college - hiding from user:', event.title);
            return false;
          }
          
          // Only show if colleges match exactly (case-insensitive)
          if (eventCollege === normalizedUserCollege) {
            console.log('✅ Event college matches user college:', event.title, eventCollege);
            return true;
          }
          
          // Don't show events from other colleges
          console.log('🚫 Event college does not match:', event.title, 'Event college:', eventCollege, 'User college:', normalizedUserCollege);
          return false;
        });
      
      // Automatically update events that should be marked as history
      // This ensures events are properly stored in history after 10 days
      const updatePromises: Promise<void>[] = [];
      
      events.forEach((event: any) => {
        if (event.date) {
          const shouldBeHistory = isEventInHistory(event.date);
          const isCurrentlyHistory = event.isHistory === true;
          
          // If event should be history but isn't marked, update it
          if (shouldBeHistory && !isCurrentlyHistory) {
            console.log(`🔄 Marking event ${event.id} as history (10+ days old)`);
            updatePromises.push(
              updateDoc(doc(db, 'events', event.id), {
                isHistory: true,
                updatedAt: new Date()
              }).catch((error) => {
                console.error(`❌ Error updating event ${event.id} to history:`, error);
              })
            );
            // Update the event object immediately for this callback
            event.isHistory = true;
          }
          // If event shouldn't be history but is marked, update it
          else if (!shouldBeHistory && isCurrentlyHistory) {
            console.log(`🔄 Marking event ${event.id} as upcoming (< 10 days old)`);
            updatePromises.push(
              updateDoc(doc(db, 'events', event.id), {
                isHistory: false,
                updatedAt: new Date()
              }).catch((error) => {
                console.error(`❌ Error updating event ${event.id} from history:`, error);
              })
            );
            // Update the event object immediately for this callback
            event.isHistory = false;
          }
        }
      });
      
      // Wait for all updates to complete (non-blocking)
      if (updatePromises.length > 0) {
        Promise.all(updatePromises).then(() => {
          console.log(`✅ Updated ${updatePromises.length} events history status`);
        });
      }
      
      // Sort events by createdAt descending (most recent first)
      events.sort((a: any, b: any) => {
        let dateA: Date;
        let dateB: Date;
        
        // Handle createdAt field (could be Timestamp or Date)
        if (a.createdAt) {
          dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        } else {
          dateA = new Date(0); // Fallback for events without createdAt
        }
        
        if (b.createdAt) {
          dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        } else {
          dateB = new Date(0); // Fallback for events without createdAt
        }
        
        // Sort descending (most recent first)
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`✅ Processed and sorted events: ${events.length} events after college filtering`);
      console.log('📋 Filtered events:', events.map((e: any) => ({ id: e.id, title: e.title || '', college: e.college || '' })));
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
    
    const ads = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        console.log('📝 Firebase getAds: Processing ad:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      })
      .filter((ad: any) => !ad.deleted); // Filter out soft-deleted ads
    
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
    // Use soft delete instead of hard delete
    const result = await softDeleteItem('ads', adId);
    return { error: result.success ? null : result.error };
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

// Magazine Covers Management Functions
export const getMagazineCovers = async () => {
  try {
    const coversRef = collection(db, 'magazineCovers');
    const q = query(coversRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const covers = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((cover: any) => !cover.deleted); // Filter out soft-deleted covers
    return { covers, error: null };
  } catch (error: any) {
    console.error('Error fetching magazine covers:', error);
    return { covers: [], error: error.message };
  }
};

export const createMagazineCover = async (coverData: any) => {
  try {
    const coversRef = collection(db, 'magazineCovers');
    const docRef = await addDoc(coversRef, {
      ...coverData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: coverData.active !== undefined ? coverData.active : true,
      order: coverData.order || 0
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error('Error creating magazine cover:', error);
    return { id: null, error: error.message };
  }
};

export const updateMagazineCover = async (coverId: string, coverData: any) => {
  try {
    const coverRef = doc(db, 'magazineCovers', coverId);
    await updateDoc(coverRef, {
      ...coverData,
      updatedAt: new Date()
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating magazine cover:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMagazineCover = async (coverId: string) => {
  try {
    // Use soft delete instead of hard delete
    return await softDeleteItem('magazineCovers', coverId);
  } catch (error: any) {
    console.error('Error deleting magazine cover:', error);
    return { success: false, error: error.message };
  }
};

export const uploadMagazineCoverImage = async (file: File, coverId: string): Promise<string> => {
  try {
    console.log('Starting image upload for magazine cover:', coverId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `magazineCovers/${coverId}/cover_${timestamp}.${fileExtension}`;
    
    console.log('Uploading to path:', fileName);
    const url = await uploadFile(file, fileName);
    console.log('Upload completed, URL:', url);
    
    return url;
  } catch (error) {
    console.error('Error in uploadMagazineCoverImage:', error);
    throw error;
  }
};

export default app;

// Password Reset via Firebase Auth
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: any) {
    let message = 'Failed to send reset email. Please try again.';
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-not-found':
        message = "We couldn't find an account with that email.";
        break;
      case 'auth/too-many-requests':
        message = 'Too many requests. Please try again later.';
        break;
      default:
        break;
    }
    return { success: false, error: message };
  }
};

// Export a helper for App to subscribe to the user doc and check session
export const subscribeToSession = (uid: string, onChange: (remoteSession: string | null) => void) => {
  return onSnapshot(doc(db, 'users', uid), (docSnap) => {
    const data = docSnap.data();
    onChange(data ? data.currentSessionId || null : null);
  });
};

// Recycle Bin Functions - Soft Delete System
// Soft delete: Mark items as deleted instead of permanently deleting them
export const softDeleteItem = async (collectionName: string, itemId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete items');
    }

    const itemRef = doc(db, collectionName, itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }
    
    // Mark as deleted with timestamp
    await updateDoc(itemRef, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: user.uid,
      active: false // Also set active to false if it exists
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error soft deleting item:', error);
    return { success: false, error: error.message };
  }
};

// Get all deleted items from all collections
export const getDeletedItems = async () => {
  try {
    const collectionsToCheck = [
      'events',
      'articles',
      'sponsors',
      'ads',
      'resourceTabContent',
      'promptTemplates',
      'newsUpdates',
      'aiTools',
      'magazineCovers',
      'freeCourses',
      'recommendedBooks'
    ];

    const allDeletedItems: any[] = [];

    for (const collectionName of collectionsToCheck) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where('deleted', '==', true));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach((doc) => {
          allDeletedItems.push({
            id: doc.id,
            collection: collectionName,
            data: doc.data(),
            deletedAt: doc.data().deletedAt,
            deletedBy: doc.data().deletedBy
          });
        });
      } catch (error) {
        console.error(`Error fetching deleted items from ${collectionName}:`, error);
        // Continue with other collections
      }
    }

    // Sort by deletedAt date (most recent first)
    allDeletedItems.sort((a, b) => {
      let dateA: Date, dateB: Date;
      
      if (a.deletedAt) {
        dateA = a.deletedAt.toDate ? a.deletedAt.toDate() : new Date(a.deletedAt);
      } else {
        dateA = new Date(0);
      }
      
      if (b.deletedAt) {
        dateB = b.deletedAt.toDate ? b.deletedAt.toDate() : new Date(b.deletedAt);
      } else {
        dateB = new Date(0);
      }
      
      return dateB.getTime() - dateA.getTime();
    });

    return allDeletedItems;
  } catch (error: any) {
    console.error('Error getting deleted items:', error);
    return [];
  }
};

// Restore a deleted item
export const restoreDeletedItem = async (collectionName: string, itemId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to restore items');
    }

    const itemRef = doc(db, collectionName, itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const itemData = itemDoc.data();
    if (!itemData.deleted) {
      throw new Error('Item is not deleted');
    }

    // Remove deleted flags and restore
    await updateDoc(itemRef, {
      deleted: false,
      deletedAt: null,
      deletedBy: null,
      active: true, // Restore active status
      restoredAt: new Date(),
      restoredBy: user.uid
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error restoring item:', error);
    return { success: false, error: error.message };
  }
};

// Permanently delete items older than 15 days
export const permanentlyDeleteOldItems = async () => {
  try {
    const collectionsToCheck = [
      'events',
      'articles',
      'sponsors',
      'ads',
      'resourceTabContent',
      'promptTemplates',
      'newsUpdates',
      'aiTools',
      'magazineCovers',
      'freeCourses',
      'recommendedBooks'
    ];

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    let totalDeleted = 0;

    for (const collectionName of collectionsToCheck) {
      try {
        const collectionRef = collection(db, collectionName);
        // Get all deleted items and filter client-side (Firestore doesn't support range queries on timestamp fields easily)
        const q = query(collectionRef, where('deleted', '==', true));
        const snapshot = await getDocs(q);
        
        const itemsToDelete: any[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.deletedAt) {
            let deletedDate: Date;
            if (data.deletedAt.toDate) {
              deletedDate = data.deletedAt.toDate();
            } else {
              deletedDate = new Date(data.deletedAt);
            }
            
            // Check if deleted more than 15 days ago
            if (deletedDate <= fifteenDaysAgo) {
              itemsToDelete.push(docSnap.ref);
            }
          }
        });

        if (itemsToDelete.length > 0) {
          const batch = writeBatch(db);
          itemsToDelete.forEach((ref) => {
            batch.delete(ref);
            totalDeleted++;
          });
          await batch.commit();
          console.log(`✅ Permanently deleted ${itemsToDelete.length} items from ${collectionName}`);
        }
      } catch (error) {
        console.error(`Error permanently deleting items from ${collectionName}:`, error);
        // Continue with other collections
      }
    }

    console.log(`✅ Total permanently deleted items: ${totalDeleted}`);
    return { success: true, deletedCount: totalDeleted };
  } catch (error: any) {
    console.error('Error permanently deleting old items:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SALESMAN FUNCTIONS ====================

// Helper: Generate a short, human-readable collegeId (max 5 characters)
// Example format: \"MS101\" (first 2 letters of college name + 3 digits starting from 101)
// Format: College name prefix + sequential number (MS101, MS102, SH201, etc.)
const generateReadableCollegeId = async (collegeName: string): Promise<string> => {
  // Extract first 2 letters from college name (uppercase, A-Z only)
  const getPrefix = (name: string): string => {
    if (!name) return 'CL';
    const letters = name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2);
    return letters.length >= 2 ? letters : 'CL';
  };

  const prefix = getPrefix(collegeName);

  try {
    // Query all colleges to find existing IDs with same prefix
    const collegesRef = collection(db, 'colleges');
    const snapshot = await getDocs(collegesRef);
    
    // Extract all collegeIds that start with this prefix
    const existingNumbers: number[] = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.collegeId && typeof data.collegeId === 'string' && data.collegeId.startsWith(prefix)) {
        // Extract the numeric part (last 3 digits)
        const numericPart = parseInt(data.collegeId.slice(2), 10);
        if (!isNaN(numericPart) && numericPart >= 101) {
          existingNumbers.push(numericPart);
        }
      }
    });

    // Find the next available number
    let nextNumber = 101; // Start from 101
    if (existingNumbers.length > 0) {
      const maxNumber = Math.max(...existingNumbers);
      nextNumber = maxNumber + 1;
    }

    // Format: prefix + 3-digit number (e.g., MS101, MS102, SH201)
    const collegeId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    
    // Ensure it's max 5 characters (should be fine: 2 letters + 3 digits = 5)
    return collegeId.slice(0, 5);
  } catch (error) {
    console.error('Error generating college ID:', error);
    // Fallback: prefix + 101
    return `${prefix}101`;
  }
};

// Colleges Management Functions
export const addCollege = async (collegeData: {
  name: string;
  shortName?: string;
  type?: string;
  affiliation?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
}, salesmanUid: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== salesmanUid) {
      throw new Error('Unauthorized: Only the creating salesman can add colleges');
    }

    // Generate a short, readable collegeId (max 5 characters)
    // Format: First 2 letters of college name + 3 digits (e.g., MS101, SH201)
    const readableCollegeId = await generateReadableCollegeId(collegeData.name);

    const collegeDoc = {
      collegeId: readableCollegeId,
      name: collegeData.name,
      shortName: collegeData.shortName || '',
      type: collegeData.type || '',
      affiliation: collegeData.affiliation || '',
      location: collegeData.location || '',
      city: collegeData.city || '',
      state: collegeData.state || '',
      pincode: collegeData.pincode || '',
      website: collegeData.website || '',
      status: 'active', // Set status to active by default
      createdBySalesman: salesmanUid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'colleges'), collegeDoc);
    // Return both Firestore document ID and the human-readable collegeId field
    return { success: true, collegeId: docRef.id, readableCollegeId, error: null };
  } catch (error: any) {
    console.error('Error adding college:', error);
    return { success: false, collegeId: null, readableCollegeId: null, error: error.message };
  }
};

export const deleteCollege = async (collegeId: string, salesmanUid: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== salesmanUid) {
      throw new Error('Unauthorized: Only the creating salesman can delete colleges');
    }

    // Verify college belongs to salesman
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    if (collegeData.createdBySalesman !== salesmanUid) {
      throw new Error('Unauthorized: College does not belong to this salesman');
    }

    // Delete college document
    await deleteDoc(doc(db, 'colleges', collegeId));
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting college:', error);
    return { success: false, error: error.message };
  }
};

export const getCollegesBySalesman = async (salesmanUid: string) => {
  try {
    const collegesRef = collection(db, 'colleges');
    // Try with orderBy first, fallback to just where if index is missing
    let snapshot;
    try {
      const q = query(collegesRef, where('createdBySalesman', '==', salesmanUid), orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index error, try without orderBy
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.warn('Composite index missing, fetching without orderBy:', indexError.message);
        const q = query(collegesRef, where('createdBySalesman', '==', salesmanUid));
        snapshot = await getDocs(q);
        // Sort manually
        const docs = snapshot.docs.sort((a, b) => {
          const aTime = a.data().createdAt?.toDate?.() || new Date(0);
          const bTime = b.data().createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        snapshot = { docs } as any;
      } else {
        throw indexError;
      }
    }
    
    const colleges = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { colleges, error: null };
  } catch (error: any) {
    console.error('Error getting colleges:', error);
    return { colleges: [], error: error.message };
  }
};

// College Admin Management Functions
export const addCollegeAdmin = async (adminData: {
  email: string;
  firstName: string;
  lastName: string;
  collegeId: string;
  collegeName: string;
  password: string;
}, salesmanUid: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== salesmanUid) {
      throw new Error('Unauthorized: Only the creating salesman can add college admins');
    }

    // Verify that the college belongs to this salesman
    const collegeDoc = await getDoc(doc(db, 'colleges', adminData.collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    if (collegeData.createdBySalesman !== salesmanUid) {
      throw new Error('Unauthorized: College does not belong to this salesman');
    }

    // Call Cloud Function to create college admin (uses Admin SDK, salesman stays logged in)
    const createCollegeAdmin = httpsCallable(functions, 'createCollegeAdmin');

    const result = await createCollegeAdmin({
      email: adminData.email,
      password: adminData.password,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      collegeId: adminData.collegeId,
      collegeName: adminData.collegeName
    });

    const resultData = result.data as { success: boolean; userId: string };
    return { success: true, userId: resultData.userId, error: null };
  } catch (error: any) {
    console.error('Error adding college admin:', error);
    return { success: false, userId: null, error: error.message };
  }
};

export const getCollegeAdminsBySalesman = async (salesmanUid: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', 'college_admin'),
      where('createdBySalesman', '==', salesmanUid)
    );
    const snapshot = await getDocs(q);
    
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { admins, error: null };
  } catch (error: any) {
    console.error('Error getting college admins:', error);
    return { admins: [], error: error.message };
  }
};

export const getCollegeAdminsByCollege = async (collegeId: string, salesmanUid: string) => {
  try {
    // Verify college belongs to salesman
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    if (collegeData.createdBySalesman !== salesmanUid) {
      throw new Error('Unauthorized: College does not belong to this salesman');
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', 'college_admin'),
      where('institutionId', '==', collegeId)
    );
    const snapshot = await getDocs(q);
    
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { admins, error: null };
  } catch (error: any) {
    console.error('Error getting college admins:', error);
    return { admins: [], error: error.message };
  }
};

export const deleteCollegeAdmin = async (adminId: string, salesmanUid: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== salesmanUid) {
      throw new Error('Unauthorized');
    }

    // Verify admin belongs to this salesman
    const adminDoc = await getDoc(doc(db, 'users', adminId));
    if (!adminDoc.exists()) {
      throw new Error('Admin not found');
    }
    const adminData = adminDoc.data();
    if ((adminData.role !== 'college_admin' && adminData.role !== 'college-admin') || adminData.createdBySalesman !== salesmanUid) {
      throw new Error('Unauthorized: Admin does not belong to this salesman');
    }

    // Delete user document
    await deleteDoc(doc(db, 'users', adminId));
    
    // Note: Firebase Auth user deletion should be handled server-side or by admin
    // For now, we just remove the Firestore document
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting college admin:', error);
    return { success: false, error: error.message };
  }
};

// Get college-wise user statistics (read-only)
export const getCollegeUserStats = async (collegeId: string, salesmanUid: string) => {
  try {
    // Verify college belongs to salesman
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    if (collegeData.createdBySalesman !== salesmanUid) {
      throw new Error('Unauthorized: College does not belong to this salesman');
    }

    // Get the readable collegeId from college document
    const readableCollegeId = collegeData.collegeId || collegeId;

    const usersRef = collection(db, 'users');
    // Filter by both institutionId and createdBySalesman to match security rules
    const q = query(
      usersRef, 
      where('institutionId', '==', collegeId),
      where('createdBySalesman', '==', salesmanUid)
    );
    const snapshot = await getDocs(q);
    
    const stats = {
      leaders: 0,
      educators: 0,
      faculty: 0,
      administrativeStaff: 0,
      students: 0,
      total: 0
    } as {
      leaders: number;
      educators: number;
      faculty: number;
      administrativeStaff: number;
      students: number;
      total: number;
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const roleRaw = (data.role || '').toString().toLowerCase();
      stats.total++;
      
      if (roleRaw === 'leader' || roleRaw === 'leaders') stats.leaders++;
      else if (roleRaw === 'educator' || roleRaw === 'educators') stats.educators++;
      else if (roleRaw === 'faculty') stats.faculty++;
      else if (
        roleRaw === 'admin_staff' ||
        roleRaw === 'administrative_staff' ||
        roleRaw === 'staff' ||
        roleRaw === 'non_teaching'
      ) {
        stats.administrativeStaff++;
      }
      else if (roleRaw === 'student') stats.students++;
    });

    // Get student count from Student App (Project B) via counter document
    try {
      const counterRef = doc(db, 'collegeStudentCounts', readableCollegeId);
      const counterDoc = await getDoc(counterRef);
      if (counterDoc.exists()) {
        const counterData = counterDoc.data();
        const studentAppCount = counterData.studentCount || 0;
        // Add Student App students to the count
        stats.students += studentAppCount;
        stats.total += studentAppCount;
      }
    } catch (counterError) {
      // If counter document doesn't exist or error reading it, continue without it
      console.warn('Could not read student count counter:', counterError);
    }
    
    return { stats, error: null };
  } catch (error: any) {
    console.error('Error getting college user stats:', error);
    return { stats: null, error: error.message };
  }
};

// Real-time subscription for college user stats
export const subscribeToCollegeUserStats = (
  collegeId: string, 
  salesmanUid: string, 
  callback: (stats: { leaders: number; educators: number; faculty: number; administrativeStaff: number; students: number; total: number } | null) => void
) => {
  let unsubscribeUsers: (() => void) | null = null;
  let unsubscribeCounter: (() => void) | null = null;

  const cleanup = () => {
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeCounter) unsubscribeCounter();
  };

  try {
    // Get college document to get readable collegeId
    getDoc(doc(db, 'colleges', collegeId)).then((collegeDoc) => {
      if (!collegeDoc.exists()) {
        callback(null);
        return;
      }
      const collegeData = collegeDoc.data();
      const readableCollegeId = collegeData.collegeId || collegeId;

      const usersRef = collection(db, 'users');
      // Filter by both institutionId and createdBySalesman to match security rules
      const q = query(
        usersRef, 
        where('institutionId', '==', collegeId),
        where('createdBySalesman', '==', salesmanUid)
      );
      
      // Subscribe to users collection
      unsubscribeUsers = onSnapshot(q, async (snapshot) => {
        console.log(`📊 Real-time update for college ${collegeId}: ${snapshot.size} users`);
        const stats = {
          leaders: 0,
          educators: 0,
          faculty: 0,
          administrativeStaff: 0,
          students: 0,
          total: 0
        };

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const roleRaw = (data.role || '').toString().toLowerCase();
          stats.total++;
          
          if (roleRaw === 'leader' || roleRaw === 'leaders') stats.leaders++;
          else if (roleRaw === 'educator' || roleRaw === 'educators') stats.educators++;
          else if (roleRaw === 'faculty') stats.faculty++;
          else if (
            roleRaw === 'admin_staff' ||
            roleRaw === 'administrative_staff' ||
            roleRaw === 'staff' ||
            roleRaw === 'non_teaching'
          ) {
            stats.administrativeStaff++;
          }
          else if (roleRaw === 'student') stats.students++;
        });

        // Get student count from Student App (Project B) via counter document
        try {
          const counterRef = doc(db, 'collegeStudentCounts', readableCollegeId);
          const counterDoc = await getDoc(counterRef);
          if (counterDoc.exists()) {
            const counterData = counterDoc.data();
            const studentAppCount = counterData.studentCount || 0;
            // Add Student App students to the count
            stats.students += studentAppCount;
            stats.total += studentAppCount;
          }
        } catch (counterError) {
          // If counter document doesn't exist, continue without it
          console.warn('Could not read student count counter:', counterError);
        }

        console.log(`📈 Updated stats for college ${collegeId}:`, stats);
        callback(stats);
      }, (error) => {
        console.error('Error in college user stats subscription:', error);
        callback(null);
      });

      // Also subscribe to counter document for real-time updates
      const counterRef = doc(db, 'collegeStudentCounts', readableCollegeId);
      unsubscribeCounter = onSnapshot(counterRef, (counterSnapshot) => {
        // When counter updates, re-fetch users to get updated stats
        if (counterSnapshot.exists()) {
          getDocs(q).then((usersSnapshot) => {
            const stats = {
              leaders: 0,
              educators: 0,
              faculty: 0,
              administrativeStaff: 0,
              students: 0,
              total: 0
            };

            usersSnapshot.docs.forEach(doc => {
              const data = doc.data();
              const roleRaw = (data.role || '').toString().toLowerCase();
              stats.total++;
              
              if (roleRaw === 'leader' || roleRaw === 'leaders') stats.leaders++;
              else if (roleRaw === 'educator' || roleRaw === 'educators') stats.educators++;
              else if (roleRaw === 'faculty') stats.faculty++;
              else if (
                roleRaw === 'admin_staff' ||
                roleRaw === 'administrative_staff' ||
                roleRaw === 'staff' ||
                roleRaw === 'non_teaching'
              ) {
                stats.administrativeStaff++;
              }
              else if (roleRaw === 'student') stats.students++;
            });

            const counterData = counterSnapshot.data();
            const studentAppCount = counterData.studentCount || 0;
            stats.students += studentAppCount;
            stats.total += studentAppCount;

            callback(stats);
          }).catch((error) => {
            console.error('Error fetching users after counter update:', error);
          });
        }
      });
    }).catch((error) => {
      console.error('Error getting college document:', error);
      callback(null);
    });

    // Return cleanup function
    return cleanup;
  } catch (error: any) {
    console.error('Error setting up college user stats subscription:', error);
    callback(null);
    return cleanup; // Return cleanup function
  }
};

// College Admin User Management Functions
export const getCollegeUsersByCollegeAdmin = async (collegeAdminUid: string) => {
  try {
    // Get college admin's profile to get their collegeId
    const adminDoc = await getDoc(doc(db, 'users', collegeAdminUid));
    if (!adminDoc.exists()) {
      throw new Error('College admin not found');
    }
    const adminData = adminDoc.data();
    if (adminData.role !== 'college_admin' && adminData.role !== 'college-admin') {
      throw new Error('Unauthorized: User is not a college admin');
    }
    const collegeId = adminData.institutionId;
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    // Get users (leader, faculty/educator, administrative staff) for this college
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('institutionId', '==', collegeId),
      where('role', 'in', ['leader', 'educator', 'faculty', 'admin_staff', 'administrative_staff'])
    );
    const snapshot = await getDocs(q);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { users, error: null };
  } catch (error: any) {
    console.error('Error getting college users:', error);
    return { users: [], error: error.message };
  }
};

export const getCollegeInfoByCollegeAdmin = async (collegeAdminUid: string) => {
  try {
    // Get college admin's profile to get their collegeId
    const adminDoc = await getDoc(doc(db, 'users', collegeAdminUid));
    if (!adminDoc.exists()) {
      throw new Error('College admin not found');
    }
    const adminData = adminDoc.data();
    if (adminData.role !== 'college_admin' && adminData.role !== 'college-admin') {
      throw new Error('Unauthorized: User is not a college admin');
    }
    const collegeId = adminData.institutionId;
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    // Get college info
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    
    return { college: { id: collegeDoc.id, ...collegeDoc.data() }, error: null };
  } catch (error: any) {
    console.error('Error getting college info:', error);
    return { college: null, error: error.message };
  }
};

// Check plan expiry status for college users (college_admin, leader, educator)
export const checkPlanExpiryStatus = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { status: 'no_plan', error: null };
    }
    
    const userData = userDoc.data();
    const role = userData.role;
    const institutionId = userData.institutionId;
    
    // Only check for college_admin, leader, and educator roles
    if (!['college_admin', 'college-admin', 'leader', 'leaders', 'educator', 'educators'].includes(role) || !institutionId) {
      return { status: 'no_plan', error: null };
    }
    
    // Get college info
    const collegeDoc = await getDoc(doc(db, 'colleges', institutionId));
    if (!collegeDoc.exists()) {
      return { status: 'no_plan', error: null };
    }
    
    const collegeData = collegeDoc.data();
    const planEndDate = collegeData.planEndDate;
    
    if (!planEndDate) {
      return { status: 'no_plan', error: null };
    }
    
    const endDate = planEndDate.toDate ? planEndDate.toDate() : new Date(planEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // Plan expired
      return { status: 'expired', error: null };
    } else if (diffDays <= 2) {
      // Plan expiring in 2 days or less
      return { status: 'expiring_soon', daysRemaining: diffDays, error: null };
    }
    
    // Plan is active
    return { status: 'active', error: null };
  } catch (error: any) {
    console.error('Error checking plan expiry status:', error);
    return { status: 'no_plan', error: error.message };
  }
};

export const addCollegeUser = async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  role: 'leader' | 'educator' | 'faculty' | 'admin_staff' | 'administrative_staff';
  password: string;
}, collegeAdminUid: string) => {
  try {
    // Validate role
    const allowedRoles = ['leader', 'educator', 'faculty', 'admin_staff', 'administrative_staff'];
    if (!allowedRoles.includes(userData.role)) {
      throw new Error('Invalid role. Only leader, faculty, and administrative staff roles are allowed.');
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

    // Get college document to find the salesman who created it and check plan limits
    const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
    if (!collegeDoc.exists()) {
      throw new Error('College not found');
    }
    const collegeData = collegeDoc.data();
    const createdBySalesman = collegeData.createdBySalesman;

    // Check plan expiry
    if (collegeData.planEndDate) {
      const planEndDate = collegeData.planEndDate.toDate ? collegeData.planEndDate.toDate() : new Date(collegeData.planEndDate);
      if (planEndDate < new Date()) {
        throw new Error('Plan expired. Contact support.');
      }
    }

    // Call Cloud Function to create user (uses Admin SDK, admin stays logged in)
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

    const resultData = result.data as { success: boolean; userId: string };
    return { success: true, userId: resultData.userId, error: null };
  } catch (error: any) {
    console.error('Error adding college user:', error);
    return { success: false, userId: null, error: error.message };
  }
};

export const deleteCollegeUser = async (userId: string, collegeAdminUid: string) => {
  try {
    // Get college admin's profile to get their collegeId
    const adminDoc = await getDoc(doc(db, 'users', collegeAdminUid));
    if (!adminDoc.exists()) {
      throw new Error('College admin not found');
    }
    const adminData = adminDoc.data();
    if (adminData.role !== 'college_admin' && adminData.role !== 'college-admin') {
      throw new Error('Unauthorized: User is not a college admin');
    }
    const collegeId = adminData.institutionId;
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    // Verify user belongs to this college and is leader or educator
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    if (userData.institutionId !== collegeId) {
      throw new Error('Unauthorized: User does not belong to your college');
    }
    if (userData.role !== 'leader' && userData.role !== 'educator') {
      throw new Error('Unauthorized: Can only delete leader or educator users');
    }

    // Delete user document
    await deleteDoc(doc(db, 'users', userId));
    
    // Note: Firebase Auth user deletion should be handled server-side or by admin
    // For now, we just remove the Firestore document
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting college user:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ADMIN COLLEGE MANAGEMENT FUNCTIONS ====================

// Helper function to calculate plan details
const calculatePlanDetails = (userLimit: number, planDurationDays: number) => {
  const planStartDate = new Date();
  const planEndDate = new Date();
  planEndDate.setDate(planEndDate.getDate() + planDurationDays);
  
  return { userLimit, planStartDate, planEndDate };
};

// Get all colleges (admin only)
export const getAllColleges = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    // Verify user is admin
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Unauthorized: Only admins can access all colleges');
    }

    const collegesRef = collection(db, 'colleges');
    const snapshot = await getDocs(collegesRef);
    
    const colleges = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { colleges, error: null };
  } catch (error: any) {
    console.error('Error getting all colleges:', error);
    return { colleges: [], error: error.message };
  }
};

// Create college by admin with plan selection
export const createCollegeByAdmin = async (collegeData: {
  name: string;
  shortName?: string;
  type?: string;
  affiliation?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  userLimit: number; // 1 to 30
  planDurationDays: number; // 2, 5, 30, or 60
  createdBySalesman?: string; // Optional: assign to a salesman
}) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    // Verify user is admin
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create colleges');
    }

    if (!collegeData.userLimit || collegeData.userLimit < 1 || collegeData.userLimit > 30) {
      throw new Error('Invalid user limit. Must be between 1 and 30');
    }

    if (!collegeData.planDurationDays || ![2, 5, 30, 60].includes(collegeData.planDurationDays)) {
      throw new Error('Invalid plan duration. Must be 2, 5, 30, or 60 days');
    }

    const { userLimit, planStartDate, planEndDate } = calculatePlanDetails(collegeData.userLimit, collegeData.planDurationDays);

    const collegeDoc = {
      name: collegeData.name,
      shortName: collegeData.shortName || '',
      type: collegeData.type || '',
      affiliation: collegeData.affiliation || '',
      location: collegeData.location || '',
      city: collegeData.city || '',
      state: collegeData.state || '',
      pincode: collegeData.pincode || '',
      website: collegeData.website || '',
      status: 'active', // Set status to active by default
      createdBySalesman: collegeData.createdBySalesman || '',
      userLimit: userLimit,
      planDurationDays: collegeData.planDurationDays,
      planStartDate: planStartDate,
      planEndDate: planEndDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'colleges'), collegeDoc);
    return { success: true, collegeId: docRef.id, error: null };
  } catch (error: any) {
    console.error('Error creating college by admin:', error);
    return { success: false, collegeId: null, error: error.message };
  }
};

// Update college by admin (including plan changes)
export const updateCollegeByAdmin = async (collegeId: string, collegeData: {
  name?: string;
  shortName?: string;
  type?: string;
  affiliation?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  userLimit?: number; // 1 to 30 (optional for plan changes)
  planDurationDays?: number; // 2, 5, 30, or 60 (optional for plan changes)
  createdBySalesman?: string;
}) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    // Verify user is admin
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update colleges');
    }

    // Get existing college
    const collegeDocRef = doc(db, 'colleges', collegeId);
    const existingCollege = await getDoc(collegeDocRef);
    if (!existingCollege.exists()) {
      throw new Error('College not found');
    }

    const existingData = existingCollege.data();
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update basic fields if provided
    if (collegeData.name !== undefined) updateData.name = collegeData.name;
    if (collegeData.shortName !== undefined) updateData.shortName = collegeData.shortName || '';
    if (collegeData.type !== undefined) updateData.type = collegeData.type || '';
    if (collegeData.affiliation !== undefined) updateData.affiliation = collegeData.affiliation || '';
    if (collegeData.location !== undefined) updateData.location = collegeData.location || '';
    if (collegeData.city !== undefined) updateData.city = collegeData.city || '';
    if (collegeData.state !== undefined) updateData.state = collegeData.state || '';
    if (collegeData.pincode !== undefined) updateData.pincode = collegeData.pincode || '';
    if (collegeData.website !== undefined) updateData.website = collegeData.website || '';
    if (collegeData.createdBySalesman !== undefined) updateData.createdBySalesman = collegeData.createdBySalesman || '';

    // Update plan if userLimit or planDurationDays is provided
    const userLimit = collegeData.userLimit !== undefined ? collegeData.userLimit : existingData.userLimit;
    const planDurationDays = collegeData.planDurationDays !== undefined ? collegeData.planDurationDays : existingData.planDurationDays;

    if (collegeData.userLimit !== undefined || collegeData.planDurationDays !== undefined) {
      if (userLimit < 1 || userLimit > 30) {
        throw new Error('Invalid user limit. Must be between 1 and 30');
      }
      if (![2, 5, 30, 60].includes(planDurationDays)) {
        throw new Error('Invalid plan duration. Must be 2, 5, 30, or 60 days');
      }
      const { userLimit: calculatedLimit, planStartDate, planEndDate } = calculatePlanDetails(userLimit, planDurationDays);
      updateData.userLimit = calculatedLimit;
      updateData.planDurationDays = planDurationDays;
      updateData.planStartDate = planStartDate;
      updateData.planEndDate = planEndDate;
    }

    await updateDoc(collegeDocRef, updateData);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating college by admin:', error);
    return { success: false, error: error.message };
  }
};
