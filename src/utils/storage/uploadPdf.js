import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload PDF to Firebase Storage
 * @param {File} file - PDF file to upload
 * @param {string} contentId - Content item ID
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Upload result with metadata
 */
export const uploadPdf = async (file, contentId, onProgress = null) => {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    // Validate file size (20 MB limit)
    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 20 MB');
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${timestamp}_${file.name}`;
    
    // Create storage path: eguides/{contentId}/{filename}
    const storagePath = `eguides/${contentId}/${filename}`;
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf'
    });

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // Upload completed, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const result = {
              success: true,
              pdfUrl: downloadURL,
              pdfStoragePath: storagePath,
              pdfFileName: filename,
              pdfSize: file.size,
              uploadedAt: new Date().toISOString()
            };
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

/**
 * Delete PDF from Firebase Storage
 * @param {string} storagePath - Storage path of the PDF to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePdf = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting PDF from storage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
