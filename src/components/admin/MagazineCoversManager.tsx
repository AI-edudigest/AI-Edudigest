import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { getMagazineCovers, createMagazineCover, updateMagazineCover, deleteMagazineCover, uploadMagazineCoverImage } from '../../utils/firebase';

interface MagazineCover {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const MagazineCoversManager: React.FC = () => {
  const [covers, setCovers] = useState<MagazineCover[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCover, setEditingCover] = useState<MagazineCover | null>(null);
  const [formData, setFormData] = useState({
    alt: '',
    order: 0,
    active: true,
    imageUrl: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCovers();
  }, []);

  const fetchCovers = async () => {
    try {
      const result = await getMagazineCovers();
      if (result.covers) {
        setCovers(result.covers);
      }
    } catch (error) {
      console.error('Error fetching magazine covers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, GIF, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = '';
      
      if (selectedFile) {
        try {
          const tempId = editingCover?.id || `temp_${Date.now()}`;
          const uploadPromise = uploadMagazineCoverImage(selectedFile, tempId);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), 10000)
          );
          
          imageUrl = await Promise.race([uploadPromise, timeoutPromise]) as string;
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          const reader = new FileReader();
          imageUrl = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          alert('Firebase Storage not enabled. Using local preview. Please enable Firebase Storage for permanent storage.');
        }
      } else if (formData.imageUrl) {
        imageUrl = formData.imageUrl;
      } else {
        alert('Please select an image file');
        setUploading(false);
        return;
      }

      if (editingCover) {
        const result = await updateMagazineCover(editingCover.id, {
          imageUrl,
          alt: formData.alt,
          order: formData.order,
          active: formData.active
        });
        
        if (result.success) {
          await fetchCovers();
          handleCancel();
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        const result = await createMagazineCover({
          imageUrl,
          alt: formData.alt,
          order: formData.order,
          active: formData.active
        });
        
        if (result.id) {
          await fetchCovers();
          handleCancel();
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving magazine cover:', error);
      alert(`Error: ${error.message || 'Failed to save magazine cover'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (cover: MagazineCover) => {
    setEditingCover(cover);
    setFormData({
      alt: cover.alt || '',
      order: cover.order || 0,
      active: cover.active !== undefined ? cover.active : true,
      imageUrl: cover.imageUrl || ''
    });
    setPreviewUrl(cover.imageUrl || '');
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = async (coverId: string) => {
    if (!window.confirm('Are you sure you want to delete this magazine cover?')) {
      return;
    }
    
    try {
      const result = await deleteMagazineCover(coverId);
      if (result.success) {
        await fetchCovers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting magazine cover:', error);
      alert(`Error: ${error.message || 'Failed to delete magazine cover'}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCover(null);
    setFormData({
      alt: '',
      order: 0,
      active: true,
      imageUrl: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeCovers = covers.filter(cover => cover.active).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Magazine Covers Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage magazine cover images for Latest Editions section</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Magazine Cover</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingCover ? 'Edit Magazine Cover' : 'Add New Magazine Cover'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="cover-image-input"
                  />
                  <label
                    htmlFor="cover-image-input"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alt Text / Description
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="e.g., AI-EduDigest Magazine - September 2025"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#9b0101] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#9b0101] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Lower numbers appear first</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-[#9b0101] border-gray-300 rounded focus:ring-[#9b0101]"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active (visible in Latest Editions)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !formData.imageUrl)}
                className="px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingCover ? 'Update' : 'Create'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Magazine Covers</h3>
          {activeCovers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No magazine covers found. Add one to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCovers.map((cover) => (
                <div
                  key={cover.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={cover.imageUrl}
                    alt={cover.alt}
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cover.alt}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order: {cover.order}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(cover)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cover.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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

export default MagazineCoversManager;

