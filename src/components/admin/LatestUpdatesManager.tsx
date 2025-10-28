import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical, Newspaper, Zap, Filter } from 'lucide-react';
import { getNewsUpdates, createNewsUpdate, updateNewsUpdate, deleteNewsUpdate, reorderNewsUpdates } from '../../utils/firebase';

interface NewsUpdate {
  id: string;
  title: string;
  description: string;
  type: 'news' | 'ai-tool';
  link?: string;
  priority: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const LatestUpdatesManager: React.FC = () => {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<NewsUpdate | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'news' | 'ai-tool'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'news' as 'news' | 'ai-tool',
    link: '',
    priority: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching news updates...');
      const data = await getNewsUpdates();
      console.log('📊 Fetched updates:', data);
      setUpdates(data);
    } catch (error) {
      console.error('❌ Error fetching updates:', error);
      alert('Error fetching updates: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('💾 Submitting news update:', formData);
      
      let result;
      if (editingUpdate) {
        console.log('✏️ Updating existing update:', editingUpdate.id);
        result = await updateNewsUpdate(editingUpdate.id, formData);
      } else {
        console.log('➕ Creating new update');
        result = await createNewsUpdate(formData);
      }
      
      console.log('📝 Submit result:', result);
      
      if (result.success) {
        console.log('✅ Update saved successfully!');
        setShowForm(false);
        setEditingUpdate(null);
        setFormData({ title: '', description: '', type: 'news', link: '', priority: 1 });
        fetchUpdates();
      } else {
        console.error('❌ Failed to save update:', result.error);
        alert('Failed to save update: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error saving update:', error);
      alert('Error saving update: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (update: NewsUpdate) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      description: update.description,
      type: update.type,
      link: update.link || '',
      priority: update.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (updateId: string) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await deleteNewsUpdate(updateId);
        fetchUpdates();
      } catch (error) {
        console.error('Error deleting update:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUpdate(null);
    setFormData({ title: '', description: '', type: 'news', link: '', priority: 1 });
  };

  const handleDragStart = (e: React.DragEvent, updateId: string) => {
    setDraggedItem(updateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = updates.findIndex(update => update.id === draggedItem);
    const targetIndex = updates.findIndex(update => update.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newUpdates = [...updates];
    const [draggedUpdate] = newUpdates.splice(draggedIndex, 1);
    newUpdates.splice(targetIndex, 0, draggedUpdate);

    // Update priorities
    const reorderedUpdates = newUpdates.map((update, index) => ({
      ...update,
      priority: index + 1
    }));

    setUpdates(reorderedUpdates);

    try {
      await reorderNewsUpdates(reorderedUpdates);
    } catch (error) {
      console.error('Error reordering updates:', error);
      fetchUpdates(); // Revert on error
    }

    setDraggedItem(null);
  };

  const filteredUpdates = updates.filter(update => {
    if (filterType === 'all') return true;
    return update.type === filterType;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage news updates and AI tools for the sidebar</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Update</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'news' | 'ai-tool')}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Updates</option>
          <option value="news">News Updates</option>
          <option value="ai-tool">AI Tools</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingUpdate ? 'Edit Update' : 'Add New Update'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'news' | 'ai-tool' })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="news">News Update</option>
                  <option value="ai-tool">AI Tool</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link (Optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{editingUpdate ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Updates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredUpdates.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No updates found. Add your first update to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUpdates.map((update, index) => (
              <div
                key={update.id}
                draggable
                onDragStart={(e) => handleDragStart(e, update.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, update.id)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move ${
                  draggedItem === update.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="flex items-center space-x-2">
                      {update.type === 'news' ? (
                        <Newspaper className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Zap className="w-5 h-5 text-purple-500" />
                      )}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        #{update.priority}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{update.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{update.description}</p>
                      {update.link && (
                        <a
                          href={update.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#9b0101] hover:underline"
                        >
                          {update.link}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(update.createdAt)}
                    </span>
                    <button
                      onClick={() => handleEdit(update)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
  );
};

export default LatestUpdatesManager;
