// Firebase Storage availability checker
import { storage } from './firebase';

export const checkFirebaseStorage = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking Firebase Storage availability...');
    
    // Check if storage is properly initialized
    if (!storage) {
      console.error('❌ Firebase Storage not initialized');
      return false;
    }
    
    // Try to get storage bucket info
    const bucket = storage.app.options.storageBucket;
    console.log('📦 Storage bucket:', bucket);
    
    if (!bucket) {
      console.error('❌ No storage bucket configured');
      return false;
    }
    
    // Check if bucket URL contains firebasestorage.app (indicates proper setup)
    if (!bucket.includes('firebasestorage.app')) {
      console.error('❌ Storage bucket URL does not contain firebasestorage.app');
      return false;
    }
    
    console.log('✅ Firebase Storage is properly configured and enabled');
    return true;
  } catch (error) {
    console.error('❌ Firebase Storage check failed:', error);
    return false;
  }
};

export const getStorageStatus = (): string => {
  try {
    if (!storage) {
      return 'Storage not initialized';
    }
    
    const bucket = storage.app.options.storageBucket;
    
    if (!bucket) {
      return 'Storage bucket not configured';
    }
    
    if (bucket.includes('firebasestorage.app')) {
      return 'Firebase Storage is enabled and ready';
    }
    
    return 'Storage configuration unknown';
  } catch (error) {
    console.error('Error getting storage status:', error);
    return 'Storage check failed';
  }
};
