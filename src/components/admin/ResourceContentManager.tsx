import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { getResourceContent as getFirebaseResourceContent, createResourceContent, updateResourceContent, deleteResourceContent, createNotification } from '../../utils/firebase';
import PromptTemplatesManager from './PromptTemplatesManager';

interface ResourceItem {
  id?: string;
  name: string;
  description: string;
  category?: string;
  link?: string;
  rating?: number;
  // For events
  date?: string;
  location?: string;
  type?: string;
  // For courses
  provider?: string;
  duration?: string;
  level?: string;
  // For books
  author?: string;
}

interface ResourceContentManagerProps {
  resourceType: string;
}

const ResourceContentManager: React.FC<ResourceContentManagerProps> = ({ resourceType }) => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ResourceItem>({
    name: '',
    description: '',
    category: '',
    link: '',
    rating: 0,
    date: '',
    location: '',
    type: '',
    provider: '',
    duration: '',
    level: 'Beginner',
    author: ''
  });

  const getResourceTypeConfig = (type: string) => {
    switch (type) {
      case 'aiTools':
        return {
          title: 'AI Tools Manager',
          collectionName: 'aiTools',
          fields: ['name', 'description', 'category', 'link', 'rating']
        };
      case 'upcomingEvents':
        return {
          title: 'Upcoming Events Manager',
          collectionName: 'upcomingEvents',
          fields: ['name', 'description', 'date', 'location', 'type', 'link']
        };
      case 'recommendedBooks':
        return {
          title: 'Recommended Books Manager',
          collectionName: 'recommendedBooks',
          fields: ['name', 'description', 'author', 'category', 'rating']
        };
      case 'promptTemplates':
        return {
          title: 'Prompt Templates Manager',
          collectionName: 'promptTemplates',
          fields: ['name', 'description', 'category', 'template'],
          isSpecial: true
        };
      case 'freeCourses':
        return {
          title: 'Free Courses Manager',
          collectionName: 'freeCourses',
          fields: ['name', 'description', 'provider', 'duration', 'level', 'rating', 'link']
        };
      default:
        return {
          title: 'Resource Manager',
          collectionName: 'resources',
          fields: ['name', 'description']
        };
    }
  };

  const config = getResourceTypeConfig(resourceType);

  useEffect(() => {
    loadItems();
  }, [resourceType]);

  const loadItems = async () => {
      try {
        setLoading(true);
        const data = await getFirebaseResourceContent(config.collectionName);
        setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateResourceContent(config.collectionName, editingItem.id!, formData);
      } else {
        await createResourceContent(config.collectionName, formData);
        
        // Create notification for new content
        const notificationType = resourceType === 'aiTools' ? 'tool' : 
                                resourceType === 'upcomingEvents' ? 'event' : 
                                resourceType === 'recommendedBooks' ? 'book' : 
                                resourceType === 'freeCourses' ? 'course' : 'system';
        
        await createNotification({
          title: `New ${config.title.split(' ')[0]} Added`,
          message: `${formData.name || 'New item'} has been added to ${config.title.toLowerCase()}`,
          type: notificationType as 'article' | 'tool' | 'event' | 'book' | 'course' | 'system'
        });
      }
      await loadItems();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteResourceContent(config.collectionName, id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      link: '',
      rating: 0,
      date: '',
      location: '',
      type: '',
      provider: '',
      duration: '',
      level: 'Beginner',
      author: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const renderFormField = (field: string) => {
    switch (field) {
      case 'name':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              required
            />
          </div>
        );
      
      case 'description':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              required
            />
          </div>
        );
      
      case 'category':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., Conversational AI, Development, etc."
            />
          </div>
        );
      
      case 'link':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link
            </label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="https://example.com"
            />
          </div>
        );
      
      case 'rating':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating || 0}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>
        );
      
      case 'date':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="text"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., February 19-20, 2026"
            />
          </div>
        );
      
      case 'location':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., New Delhi, India"
            />
          </div>
        );
      
      case 'type':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="">Select Type</option>
              <option value="Summit">Summit</option>
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Symposium">Symposium</option>
              <option value="Panel">Panel</option>
            </select>
          </div>
        );
      
      case 'provider':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <input
              type="text"
              value={formData.provider || ''}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., Harvard University"
            />
          </div>
        );
      
      case 'duration':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., 7 weeks, 4 months"
            />
          </div>
        );
      
      case 'level':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level
            </label>
            <select
              value={formData.level || 'Beginner'}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        );
      
      case 'author':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="e.g., Stuart Russell & Peter Norvig"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  // Show special message for prompt templates
  if (config.isSpecial && resourceType === 'promptTemplates') {
    return <PromptTemplatesManager />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadItems()}
            className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-[#9b0101] hover:bg-[#7a0101] text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add {resourceType === 'aiTools' ? 'Tool' : resourceType === 'upcomingEvents' ? 'Event' : resourceType === 'recommendedBooks' ? 'Book' : resourceType === 'promptTemplates' ? 'Template' : 'Course'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingItem ? 'Edit Item' : `Add New ${resourceType === 'aiTools' ? 'Tool' : resourceType === 'upcomingEvents' ? 'Event' : resourceType === 'recommendedBooks' ? 'Book' : resourceType === 'promptTemplates' ? 'Template' : 'Course'}`}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map(field => renderFormField(field))}
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 bg-[#9b0101] hover:bg-[#7a0101] text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Update' : 'Create'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current {resourceType === 'aiTools' ? 'Tools' : resourceType === 'upcomingEvents' ? 'Events' : resourceType === 'recommendedBooks' ? 'Books' : resourceType === 'promptTemplates' ? 'Templates' : 'Courses'}
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No items found. Create your first item to get started.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.category && <span>Category: {item.category}</span>}
                    {item.rating && <span>Rating: {item.rating}/5</span>}
                    {item.date && <span>Date: {item.date}</span>}
                    {item.location && <span>Location: {item.location}</span>}
                    {item.provider && <span>Provider: {item.provider}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-[#9b0101] transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceContentManager;
