import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { 
  getResourceTabContent, 
  createResourceTabContent, 
  updateResourceTabContent, 
  deleteResourceTabContent 
} from '../../utils/firebase';
import FeedbackFormManager from './FeedbackFormManager';

interface TabContent {
  id: string;
  name: string;
  description: string;
  url?: string;
  tabId: string;
  active: boolean;
  order: number;
  createdAt: any;
  updatedAt: any;
  // AI Tools specific
  category?: string;
  // Events specific
  date?: string;
  location?: string;
  type?: string;
  // Books specific
  author?: string;
  // Courses specific
  provider?: string;
  duration?: string;
}

interface ResourceTabContentManagerProps {
  tabId: string;
  tabName: string;
  onBack: () => void;
}

const ResourceTabContentManager: React.FC<ResourceTabContentManagerProps> = ({ 
  tabId, 
  tabName, 
  onBack 
}) => {
  const [contents, setContents] = useState<TabContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<TabContent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    active: true,
    // AI Tools specific
    category: '',
    // Events specific
    date: '',
    location: '',
    type: '',
    // Books specific
    author: '',
    // Courses specific
    provider: '',
    duration: ''
  });

  useEffect(() => {
    fetchContents();
  }, [tabId]);

  // Determine content type based on tab name
  const getContentType = () => {
    const name = tabName.toLowerCase();
    if (name.includes('ai tools') || name.includes('tools')) return 'aiTools';
    if (name.includes('events') || name.includes('upcoming')) return 'events';
    if (name.includes('books') || name.includes('recommended')) return 'books';
    if (name.includes('courses') || name.includes('free')) return 'courses';
    return 'default';
  };

  const contentType = getContentType();

  const fetchContents = async () => {
    try {
      console.log('Fetching content for tab:', tabId);
      const result = await getResourceTabContent(tabId);
      console.log('Fetch result:', result);
      if (result.contents) {
        console.log('Setting content:', result.contents);
        setContents(result.contents);
      } else {
        console.log('No content found or error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting content:', formData);
    try {
      let result;
      if (editingContent) {
        console.log('Updating content:', editingContent.id);
        result = await updateResourceTabContent(editingContent.id, formData);
        console.log('Update result:', result);
      } else {
        console.log('Creating new content');
        result = await createResourceTabContent(tabId, { ...formData, order: contents.length });
        console.log('Create result:', result);
      }
      
      if (result && result.success) {
        console.log('Content saved successfully, refreshing list...');
        await fetchContents();
        setShowForm(false);
        setEditingContent(null);
        setFormData({
          name: '',
          description: '',
          url: '',
          active: true
        });
        alert('Content saved successfully!');
      } else {
        console.error('Failed to save content:', result?.error);
        alert(`Error saving content: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    }
  };

  const handleEdit = (content: TabContent) => {
    setEditingContent(content);
    setFormData({
      name: content.name,
      description: content.description,
      url: content.url || '',
      active: content.active,
      category: content.category || '',
      date: content.date || '',
      location: content.location || '',
      type: content.type || '',
      author: content.author || '',
      provider: content.provider || '',
      duration: content.duration || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content item?')) {
      try {
        await deleteResourceTabContent(contentId);
        await fetchContents();
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContent(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      active: true,
      category: '',
      date: '',
      location: '',
      type: '',
      author: '',
      provider: '',
      duration: ''
    });
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
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Back to Resource Tabs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Managing content for: <span className="font-semibold">{tabName}</span></p>
        </div>
      </div>

      {/* Show Feedback Form Manager for Feedback tab */}
      {tabName.toLowerCase().includes('feedback') && (
        <FeedbackFormManager />
      )}

      {/* Regular Content Management for other tabs */}
      {!tabName.toLowerCase().includes('feedback') && (
        <>

      {/* Add Content Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Items</h3>
          <p className="text-gray-600 dark:text-gray-400">Add and manage content boxes for this tab</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content Item
        </button>
      </div>

      {/* Content Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingContent ? 'Edit Content Item' : 'Add New Content Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter content name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* AI Tools specific fields */}
              {contentType === 'aiTools' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Text Generation">Text Generation</option>
                    <option value="Image Generation">Image Generation</option>
                    <option value="Code Assistance">Code Assistance</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value="Search AI">Search AI</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {/* Events specific fields */}
              {contentType === 'events' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter location"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Summit">Summit</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Conference">Conference</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {/* Books specific fields */}
              {contentType === 'books' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Enter author name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              {/* Courses specific fields */}
              {contentType === 'courses' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provider
                    </label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="Enter course provider"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 4 weeks, 2 hours, Self-paced"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}

              {/* URL Link for most content types */}
              {(contentType === 'aiTools' || contentType === 'events' || contentType === 'courses' || contentType === 'books') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Link
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={contentType !== 'books'}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
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
                Active (visible to users)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingContent ? 'Update Content' : 'Create Content'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Content Items</h3>
          {contents.length > 0 ? (
            <div className="space-y-3">
              {contents.map((content, index) => (
                <div 
                  key={content.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{content.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          content.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {content.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{content.description}</p>
                      
                      {/* Display specific fields based on content type */}
                      <div className="mt-2 space-y-1">
                        {contentType === 'aiTools' && content.category && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Category: {content.category}</span>
                        )}
                        {contentType === 'events' && (
                          <>
                            {content.date && <span className="text-sm text-gray-500 dark:text-gray-400">Date: {content.date}</span>}
                            {content.location && <span className="text-sm text-gray-500 dark:text-gray-400">Location: {content.location}</span>}
                            {content.type && <span className="text-sm text-gray-500 dark:text-gray-400">Type: {content.type}</span>}
                          </>
                        )}
                        {contentType === 'books' && content.author && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Author: {content.author}</span>
                        )}
                        {contentType === 'courses' && (
                          <>
                            {content.provider && <span className="text-sm text-gray-500 dark:text-gray-400">Provider: {content.provider}</span>}
                            {content.duration && <span className="text-sm text-gray-500 dark:text-gray-400">Duration: {content.duration}</span>}
                          </>
                        )}
                      </div>
                      
                      {content.url && (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#9b0101] hover:text-[#7a0101] text-sm flex items-center mt-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {content.url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(content)}
                        className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Edit Content"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Content Items Yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first content item to this tab.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#9b0101] text-white px-6 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Content Item
              </button>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ResourceTabContentManager;
