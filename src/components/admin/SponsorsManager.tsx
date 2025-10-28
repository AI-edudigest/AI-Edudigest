import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image, XCircle } from 'lucide-react';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor, createNotification, uploadSponsorLogo, deleteFile } from '../../utils/firebase';
import { checkFirebaseStorage, getStorageStatus } from '../../utils/firebaseStorageCheck';

interface Sponsor {
  id: string;
  name: string;
  website: string;
  logo: string;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const SponsorsManager: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: '',
    active: true
  });
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [storageStatus, setStorageStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSponsors();
    checkStorageStatus();
  }, []);

  const checkStorageStatus = async () => {
    try {
      console.log('🔍 Checking Firebase Storage status...');
      const status = getStorageStatus();
      console.log('📊 Initial status:', status);
      setStorageStatus(status);
      
      const isAvailable = await checkFirebaseStorage();
      console.log('✅ Storage available:', isAvailable);
      
      if (isAvailable) {
        setStorageStatus('Firebase Storage is enabled and ready');
      } else {
        setStorageStatus('Firebase Storage not enabled - using fallback mode');
      }
    } catch (error) {
      console.error('❌ Error checking storage status:', error);
      setStorageStatus('Storage check failed - using fallback mode');
    }
  };

  const fetchSponsors = async () => {
    try {
      const result = await getSponsors();
      if (result.sponsors) {
        setSponsors(result.sponsors);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
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
      let logoUrl = '';
      
      // Upload file if a new file is selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        
        try {
          const tempId = editingSponsor?.id || `temp_${Date.now()}`;
          
          // Add timeout to prevent infinite loading
          const uploadPromise = uploadSponsorLogo(selectedFile, tempId);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout - Firebase Storage may not be enabled')), 10000)
          );
          
          logoUrl = await Promise.race([uploadPromise, timeoutPromise]) as string;
          console.log('Upload successful, URL:', logoUrl);
        } catch (uploadError) {
          console.error('Upload failed, using fallback:', uploadError);
          
          // Fallback: Convert file to data URL for immediate use
          const reader = new FileReader();
          logoUrl = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          
          console.log('Using data URL fallback:', logoUrl);
          alert('Firebase Storage not enabled. Using local preview. Please enable Firebase Storage for permanent storage.');
        }
      } else if (formData.logo) {
        // Use existing logo URL
        logoUrl = formData.logo;
      } else {
        alert('Please upload a logo or enter a logo URL');
        setUploading(false);
        return;
      }
      
      const sponsorData = {
        name: formData.name,
        website: formData.website,
        logo: logoUrl,
        active: formData.active
      };
      
      console.log('Saving sponsor with data:', sponsorData);
      
      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, sponsorData);
        console.log('Sponsor updated successfully');
      } else {
        await createSponsor(sponsorData);
        console.log('Sponsor created successfully');
        
        // Create notification for new sponsor
        await createNotification({
          title: 'New Sponsor Added',
          message: `${formData.name} has been added as a new sponsor`,
          type: 'system'
        });
      }
      
      setShowForm(false);
      setEditingSponsor(null);
      setFormData({ name: '', website: '', logo: '', active: true });
      setSelectedFile(null);
      setPreviewUrl('');
      fetchSponsors();
      
      alert('Sponsor saved successfully!');
    } catch (error) {
      console.error('Error saving sponsor:', error);
      alert('Error saving sponsor: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      website: sponsor.website,
      logo: sponsor.logo,
      active: sponsor.active
    });
    setSelectedFile(null);
    setPreviewUrl(sponsor.logo || '');
    setShowForm(true);
  };

  const handleDelete = async (sponsorId: string) => {
    if (window.confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await deleteSponsor(sponsorId);
        fetchSponsors();
      } catch (error) {
        console.error('Error deleting sponsor:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSponsor(null);
    setFormData({ name: '', website: '', logo: '', active: true });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSponsor(null);
    setFormData({ name: '', website: '', logo: '', active: true });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sponsors Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Add and manage sponsors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </button>
      </div>

      {/* Sponsor Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
            </h3>
            {storageStatus && (
              <div className={`text-xs px-2 py-1 rounded ${
                storageStatus.includes('not enabled') || storageStatus.includes('failed') || storageStatus.includes('not configured')
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {storageStatus.includes('not enabled') || storageStatus.includes('failed') || storageStatus.includes('not configured')
                  ? '⚠️ Fallback Mode' 
                  : '✅ Storage Ready'}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sponsor Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com"
              />
            </div>

            {/* Logo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sponsor Logo
              </label>
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#9b0101] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Logo preview"
                        className="max-h-32 max-w-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Current logo'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#9b0101] hover:text-[#7a0101] text-sm font-medium transition-colors"
                    >
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Logo
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fallback URL input */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or enter logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedFile ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsors List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sponsors</h3>
          {sponsors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sponsors found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{sponsor.name}</h4>
                      {sponsor.website && (
                        <a 
                          href={sponsor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#9b0101] hover:underline text-sm"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(sponsor)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {sponsor.logo && (
                    <div className="mt-3">
                      <img 
                        src={sponsor.logo} 
                        alt={`${sponsor.name} logo`}
                        className="w-full h-20 object-contain bg-gray-100 dark:bg-gray-700 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sponsor.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {sponsor.active ? 'Active' : 'Inactive'}
                    </span>
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

export default SponsorsManager;
