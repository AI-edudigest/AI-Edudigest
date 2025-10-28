import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload, Trash, Edit, Eye, Download } from 'lucide-react';
import { uploadPdf, deletePdf, formatFileSize } from '../../utils/storage/uploadPdf';
import { db } from '../../utils/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

interface EguideContent {
  id: string;
  name: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfSize?: number;
  pdfStoragePath?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const EguideContentManager: React.FC = () => {
  const [contentItems, setContentItems] = useState<EguideContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EguideContent | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    active: true
  });
  
  // PDF upload states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load content items
  useEffect(() => {
    loadContentItems();
  }, []);

  const loadContentItems = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'eguideContent'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: EguideContent[] = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        } as EguideContent);
      });
      
      setContentItems(items);
    } catch (error) {
      console.error('Error loading content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Upload PDF first
      const uploadResult = await uploadPdf(pdfFile, `temp_${Date.now()}`, (progress) => {
        setUploadProgress(progress);
      });

      if (!uploadResult.success) {
        throw new Error('PDF upload failed');
      }

      // Create content item in Firestore
      const contentData = {
        name: formData.name,
        pdfUrl: uploadResult.pdfUrl,
        pdfFileName: uploadResult.pdfFileName,
        pdfSize: uploadResult.pdfSize,
        pdfStoragePath: uploadResult.pdfStoragePath,
        active: formData.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'eguideContent'), contentData);
      
      // Reset form
      setFormData({ name: '', active: true });
      setPdfFile(null);
      setUploadProgress(0);
      setShowAddForm(false);
      
      // Reload content items
      await loadContentItems();
      
      alert('E-Guide content added successfully!');
    } catch (error) {
      console.error('Error adding content:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditContent = (item: EguideContent) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      active: item.active
    });
    setShowAddForm(true);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        active: formData.active,
        updatedAt: serverTimestamp()
      };

      // If new PDF is selected, upload it
      if (pdfFile) {
        setIsUploading(true);
        setUploadError(null);

        const uploadResult = await uploadPdf(pdfFile, editingItem.id, (progress) => {
          setUploadProgress(progress);
        });

        if (uploadResult.success) {
          updateData.pdfUrl = uploadResult.pdfUrl;
          updateData.pdfFileName = uploadResult.pdfFileName;
          updateData.pdfSize = uploadResult.pdfSize;
          updateData.pdfStoragePath = uploadResult.pdfStoragePath;
        }
      }

      await updateDoc(doc(db, 'eguideContent', editingItem.id), updateData);
      
      // Reset form
      setFormData({ name: '', active: true });
      setPdfFile(null);
      setUploadProgress(0);
      setEditingItem(null);
      setShowAddForm(false);
      
      // Reload content items
      await loadContentItems();
      
      alert('E-Guide content updated successfully!');
    } catch (error) {
      console.error('Error updating content:', error);
      setUploadError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteContent = async (item: EguideContent) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      // Delete PDF from storage if it exists
      if (item.pdfStoragePath) {
        await deletePdf(item.pdfStoragePath);
      }

      // Delete content item from Firestore
      await deleteDoc(doc(db, 'eguideContent', item.id));
      
      // Reload content items
      await loadContentItems();
      
      alert('E-Guide content deleted successfully!');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20 MB');
        return;
      }
      setPdfFile(file);
      setUploadError(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', active: true });
    setPdfFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setEditingItem(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Guide Content</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage PDF content for E-Guide tab</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add E-Guide Content
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingItem ? 'Edit E-Guide Content' : 'Add New E-Guide Content'}
          </h3>
          
          <form onSubmit={editingItem ? handleUpdateContent : handleAddContent} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter E-Guide title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PDF Upload *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#9b0101] transition-colors">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload E-Guide PDF
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your PDF file here (Max 20 MB)
                </p>
                
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors cursor-pointer ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#9b0101] hover:bg-[#7a0101]'
                  } text-white`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose PDF File'}
                </label>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#9b0101] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {Math.round(uploadProgress)}% uploaded
                    </p>
                  </div>
                )}

                {/* Selected File Info */}
                {pdfFile && !isUploading && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-400 text-sm">
                      <strong>Selected:</strong> {pdfFile.name} ({formatFileSize(pdfFile.size)})
                    </p>
                  </div>
                )}

                {/* Current PDF Info (for editing) */}
                {editingItem?.pdfUrl && !pdfFile && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-400 text-sm">
                      <strong>Current PDF:</strong> {editingItem.pdfFileName} ({formatFileSize(editingItem.pdfSize || 0)})
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Select a new file to replace, or leave empty to keep current PDF
                    </p>
                  </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-400 text-sm">
                      {uploadError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Active (visible to users)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                {editingItem ? 'Update Content' : 'Create Content'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current E-Guide Content
          </h3>
          
          {contentItems.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No E-Guide content added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentItems.map((item) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        {item.pdfFileName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.pdfFileName} • {formatFileSize(item.pdfSize || 0)}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {item.pdfUrl && (
                        <button
                          onClick={() => window.open(item.pdfUrl, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditContent(item)}
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EguideContentManager;
