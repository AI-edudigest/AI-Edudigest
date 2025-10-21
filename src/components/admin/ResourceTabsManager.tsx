import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { 
  getResourceTabs, 
  createResourceTab, 
  updateResourceTab, 
  deleteResourceTab,
  reorderResourceTabs 
} from '../../utils/firebase';

interface ResourceTab {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  order: number;
  createdAt: any;
  updatedAt: any;
}

interface ResourceTabsManagerProps {
  onManageContent?: (tabId: string, tabName: string) => void;
}

const ResourceTabsManager: React.FC<ResourceTabsManagerProps> = ({ onManageContent }) => {
  const [tabs, setTabs] = useState<ResourceTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTab, setEditingTab] = useState<ResourceTab | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    active: true
  });

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      console.log('Fetching Resource Tabs...');
      const result = await getResourceTabs();
      console.log('Fetch result:', result);
      if (result.tabs) {
        console.log('Setting Resource Tabs:', result.tabs);
        setTabs(result.tabs);
      } else {
        console.log('No Resource Tabs found or error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching Resource Tabs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Resource Tab:', formData);
    try {
      let result;
      if (editingTab) {
        console.log('Updating Resource Tab:', editingTab.id);
        result = await updateResourceTab(editingTab.id, formData);
        console.log('Update result:', result);
      } else {
        console.log('Creating new Resource Tab');
        const newOrder = tabs.length;
        result = await createResourceTab({ ...formData, order: newOrder });
        console.log('Create result:', result);
      }
      
      if (result && result.success) {
        console.log('Resource Tab saved successfully, refreshing list...');
        await fetchTabs();
        setShowForm(false);
        setEditingTab(null);
        setFormData({
          name: '',
          icon: '📁',
          active: true
        });
        alert('Resource Tab saved successfully!');
      } else {
        console.error('Failed to save Resource Tab:', result?.error);
        alert(`Error saving Resource Tab: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving Resource Tab:', error);
      alert('Error saving Resource Tab. Please try again.');
    }
  };

  const handleEdit = (tab: ResourceTab) => {
    setEditingTab(tab);
    setFormData({
      name: tab.name,
      icon: tab.icon,
      active: tab.active
    });
    setShowForm(true);
  };

  const handleDelete = async (tabId: string) => {
    if (confirm('Are you sure you want to delete this Resource Tab?')) {
      try {
        await deleteResourceTab(tabId);
        await fetchTabs();
      } catch (error) {
        console.error('Error deleting Resource Tab:', error);
        alert('Error deleting Resource Tab. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTab(null);
    setFormData({
      name: '',
      icon: '📁',
      active: true
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newTabs = [...tabs];
      [newTabs[index], newTabs[index - 1]] = [newTabs[index - 1], newTabs[index]];
      setTabs(newTabs);
      await reorderResourceTabs(newTabs);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < tabs.length - 1) {
      const newTabs = [...tabs];
      [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]];
      setTabs(newTabs);
      await reorderResourceTabs(newTabs);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newTabs = [...tabs];
    const draggedTab = newTabs[draggedIndex];
    newTabs.splice(draggedIndex, 1);
    newTabs.splice(dropIndex, 0, draggedTab);
    
    setTabs(newTabs);
    await reorderResourceTabs(newTabs);
    setDraggedIndex(null);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resource Tabs Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage resource tabs in the sidebar dynamically</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource Tab
        </button>
      </div>

      {/* Resource Tab Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative z-20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingTab ? 'Edit Resource Tab' : 'Add New Resource Tab'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tab Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  onClick={(e) => {
                    console.log('Input clicked');
                    e.stopPropagation();
                  }}
                  onFocus={(e) => {
                    console.log('Input focused');
                    e.target.select();
                  }}
                  placeholder="Enter tab name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white relative z-10"
                  required
                  autoComplete="off"
                  style={{ pointerEvents: 'auto', position: 'relative' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="📁">📁 Folder</option>
                  <option value="📅">📅 Calendar</option>
                  <option value="📚">📚 Books</option>
                  <option value="💡">💡 Lightbulb</option>
                  <option value="🎓">🎓 Graduation Cap</option>
                  <option value="💬">💬 Chat</option>
                  <option value="⚡">⚡ Lightning</option>
                  <option value="🔧">🔧 Tools</option>
                  <option value="📊">📊 Chart</option>
                  <option value="🎯">🎯 Target</option>
                  <option value="🚀">🚀 Rocket</option>
                  <option value="💻">💻 Computer</option>
                  <option value="📱">📱 Mobile</option>
                  <option value="🌐">🌐 Globe</option>
                  <option value="🎨">🎨 Art</option>
                  <option value="📝">📝 Document</option>
                </select>
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
                Active (visible to users)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingTab ? 'Update Resource Tab' : 'Create Resource Tab'}
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

      {/* Resource Tabs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Resource Tabs</h3>
          {tabs.length > 0 ? (
            <div className="space-y-3">
              {tabs.map((tab, index) => (
                <div 
                  key={tab.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-2xl">{tab.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{tab.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tab.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {tab.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tab.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Category: {tab.category}</span>
                          <span className={`text-sm ${tab.color}`}>Color: {tab.color}</span>
                          {tab.link && (
                            <a
                              href={tab.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#9b0101] hover:text-[#7a0101] text-sm flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visit Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === tabs.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => onManageContent?.(tab.id, tab.name)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Manage Content"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(tab)}
                        className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Resource Tab"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tab.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Resource Tab"
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
              <div className="text-6xl mb-4">📁</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Resource Tabs Yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first resource tab to the sidebar.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#9b0101] text-white px-6 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Resource Tab
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceTabsManager;
