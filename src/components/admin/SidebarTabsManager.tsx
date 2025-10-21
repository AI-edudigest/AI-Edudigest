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
  Settings
} from 'lucide-react';
import { 
  getSidebarTabs, 
  createSidebarTab, 
  updateSidebarTab, 
  deleteSidebarTab, 
  reorderSidebarTabs 
} from '../../utils/firebase';

interface SidebarTab {
  id: string;
  name: string;
  label: string;
  icon: string;
  section: string;
  order: number;
  active: boolean;
  hasSubmenu?: boolean;
  submenu?: Array<{
    id: string;
    label: string;
    section: string;
  }>;
  topic?: string;
  content?: string;
  youtubeUrl?: string;
  topicName?: string; // Added for topic name
  subTopic?: string; // Added for sub topic
  headingText?: string; // Added for heading text
  headingColor?: string; // Added for heading color
  fontSize?: string; // Added for font size
  fontStyle?: string; // Added for font style
}

const SidebarTabsManager: React.FC = () => {
  const [tabs, setTabs] = useState<SidebarTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTab, setEditingTab] = useState<SidebarTab | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showTopicEditor, setShowTopicEditor] = useState(false);
  const [editingTopicTab, setEditingTopicTab] = useState<SidebarTab | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Home',
    active: true
  });

  const [topicFormData, setTopicFormData] = useState({
    topic: '',
    content: '',
    youtubeUrl: '',
    topicName: '',
    subTopic: '',
    headingText: '',
    headingColor: '#000000',
    fontSize: '16px',
    fontStyle: 'normal'
  });

  // Icon options
  const iconOptions = [
    { value: 'Home', label: 'Home', icon: '🏠' },
    { value: 'Wrench', label: 'AI Tools', icon: '🔧' },
    { value: 'Sparkles', label: 'Sparkles', icon: '✨' },
    { value: 'Users', label: 'Users', icon: '👥' },
    { value: 'TrendingUp', label: 'Trending Up', icon: '📈' },
    { value: 'Shield', label: 'Shield', icon: '🛡️' },
    { value: 'GraduationCap', label: 'Graduation Cap', icon: '🎓' },
    { value: 'Briefcase', label: 'Briefcase', icon: '💼' },
    { value: 'Database', label: 'Database', icon: '🗄️' },
    { value: 'BookOpen', label: 'Book Open', icon: '📖' },
    { value: 'Target', label: 'Target', icon: '🎯' },
    { value: 'Award', label: 'Award', icon: '🏆' },
    { value: 'Globe', label: 'Globe', icon: '🌍' },
    { value: 'FileText', label: 'File Text', icon: '📄' }
  ];

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      console.log('Fetching Sidebar Tabs...');
      const result = await getSidebarTabs();
      console.log('Fetch result:', result);
      if (result.tabs) {
        console.log('Setting Sidebar Tabs:', result.tabs);
        setTabs(result.tabs as SidebarTab[]);
      } else {
        console.log('No Sidebar Tabs found or error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching Sidebar Tabs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Sidebar Tab:', formData);
    
    // Check authentication status
    const { getCurrentUser } = await import('../../utils/firebase');
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user) {
      alert('You must be logged in to create sidebar tabs. Please log in and try again.');
      return;
    }
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a tab name.');
      return;
    }
    
    try {
      let result;
      if (editingTab) {
        console.log('Updating Sidebar Tab:', editingTab.id);
        const updateData = {
          ...formData,
          label: formData.name, // Use name as label
          section: formData.name.toLowerCase().replace(/\s+/g, '') // Generate section from name
        };
        console.log('Update data:', updateData);
        result = await updateSidebarTab(editingTab.id, updateData);
        console.log('Update result:', result);
      } else {
        console.log('Creating new Sidebar Tab');
        const newOrder = tabs.length;
        const tabData = {
          ...formData,
          label: formData.name, // Use name as label
          section: formData.name.toLowerCase().replace(/\s+/g, ''), // Generate section from name
          order: newOrder
        };
        console.log('Create data:', tabData);
        result = await createSidebarTab(tabData);
        console.log('Create result:', result);
      }
      
      if (result && result.success) {
        console.log('Sidebar Tab saved successfully, refreshing list...');
        await fetchTabs();
        setShowForm(false);
        setEditingTab(null);
        setFormData({
          name: '',
          icon: 'Home',
          active: true
        });
        
        // Trigger sidebar refresh
        window.dispatchEvent(new Event('storage'));
        
        alert('Sidebar Tab saved successfully!');
      } else {
        console.error('Failed to save Sidebar Tab:', result?.error);
        alert(`Failed to save Sidebar Tab: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving Sidebar Tab:', error);
      alert(`Error saving Sidebar Tab: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleEditTopic = (tab: SidebarTab) => {
    setTopicFormData({
      topic: tab.topic || '',
      content: tab.content || '',
      youtubeUrl: tab.youtubeUrl || '',
      topicName: tab.topicName || '',
      subTopic: tab.subTopic || '',
      headingText: tab.headingText || '',
      headingColor: tab.headingColor || '#000000',
      fontSize: tab.fontSize || '16px',
      fontStyle: tab.fontStyle || 'normal'
    });
    setEditingTopicTab(tab);
    setShowTopicEditor(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTopicTab) return;
    
    try {
      const result = await updateSidebarTab(editingTopicTab.id, {
        topic: topicFormData.topic,
        content: topicFormData.content,
        youtubeUrl: topicFormData.youtubeUrl,
        topicName: topicFormData.topicName,
        subTopic: topicFormData.subTopic,
        headingText: topicFormData.headingText,
        headingColor: topicFormData.headingColor,
        fontSize: topicFormData.fontSize,
        fontStyle: topicFormData.fontStyle
      });
      
      if (result.success) {
        await fetchTabs();
        setShowTopicEditor(false);
        setEditingTopicTab(null);
        setTopicFormData({ 
          topic: '', 
          content: '', 
          youtubeUrl: '',
          topicName: '',
          subTopic: '',
          headingText: '',
          headingColor: '#000000',
          fontSize: '16px',
          fontStyle: 'normal'
        });
        alert('Topic content saved successfully!');
      } else {
        alert('Failed to save topic content. Please try again.');
      }
    } catch (error) {
      console.error('Error saving topic content:', error);
      alert('Error saving topic content. Please try again.');
    }
  };

  const handleDelete = async (tabId: string) => {
    if (!confirm('Are you sure you want to delete this sidebar tab?')) return;
    
    try {
      const result = await deleteSidebarTab(tabId);
      if (result.success) {
        await fetchTabs();
        // Trigger sidebar refresh
        window.dispatchEvent(new Event('storage'));
        alert('Sidebar Tab deleted successfully!');
      } else {
        alert('Failed to delete Sidebar Tab. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting Sidebar Tab:', error);
      alert('Error deleting Sidebar Tab. Please try again.');
    }
  };

  const handleToggleActive = async (tab: SidebarTab) => {
    try {
      const result = await updateSidebarTab(tab.id, { active: !tab.active });
      if (result.success) {
        await fetchTabs();
        // Trigger sidebar refresh
        window.dispatchEvent(new Event('storage'));
      } else {
        alert('Failed to update sidebar tab status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating sidebar tab:', error);
      alert('Error updating sidebar tab. Please try again.');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newTabs = [...tabs];
      [newTabs[index], newTabs[index - 1]] = [newTabs[index - 1], newTabs[index]];
      setTabs(newTabs);
      await reorderSidebarTabs(newTabs);
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < tabs.length - 1) {
      const newTabs = [...tabs];
      [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]];
      setTabs(newTabs);
      await reorderSidebarTabs(newTabs);
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('storage'));
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
      await reorderSidebarTabs(newTabs);
      setDraggedIndex(null);
      // Trigger sidebar refresh
      window.dispatchEvent(new Event('storage'));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sidebar Tabs Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage sidebar navigation menu dynamically</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sidebar Tab
        </button>
      </div>

      {/* Sidebar Tab Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative z-20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingTab ? 'Edit Sidebar Tab' : 'Add New Sidebar Tab'}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tab name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
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
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-[#9b0101] focus:ring-[#9b0101] mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active (visible to users)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingTab ? 'Update Sidebar Tab' : 'Create Sidebar Tab'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sidebar Tabs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Sidebar Tabs</h3>
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
                        <span className="text-2xl">
                          {iconOptions.find(opt => opt.value === tab.icon)?.icon || '📄'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{tab.label || tab.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tab.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {tab.active ? 'Active' : 'Inactive'}
                          </span>
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
                        onClick={() => handleEditTopic(tab)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Topic Content"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(tab)}
                        className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={tab.active ? 'Deactivate' : 'Activate'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tab.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Sidebar Tab"
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
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Sidebar Tabs</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first sidebar tab to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Sidebar Tab
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic Content Editor Modal */}
      {showTopicEditor && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Topic Content</h3>
                  <p className="text-gray-600 dark:text-gray-400">Add topic title and content for this sidebar tab</p>
                </div>
                <button 
                  onClick={() => setShowTopicEditor(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveTopic} className="space-y-6">
                {/* Topic Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Title *
                  </label>
                  <input
                    type="text"
                    value={topicFormData.topic}
                    onChange={(e) => setTopicFormData({ ...topicFormData, topic: e.target.value })}
                    placeholder="Enter topic title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Topic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    value={topicFormData.topicName}
                    onChange={(e) => setTopicFormData({ ...topicFormData, topicName: e.target.value })}
                    placeholder="Enter topic name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Sub Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sub Topic
                  </label>
                  <input
                    type="text"
                    value={topicFormData.subTopic}
                    onChange={(e) => setTopicFormData({ ...topicFormData, subTopic: e.target.value })}
                    placeholder="Enter sub topic"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Heading Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heading Text
                  </label>
                  <input
                    type="text"
                    value={topicFormData.headingText}
                    onChange={(e) => setTopicFormData({ ...topicFormData, headingText: e.target.value })}
                    placeholder="Enter heading text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Font and Color Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={topicFormData.fontSize}
                      onChange={(e) => setTopicFormData({ ...topicFormData, fontSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="12px">12px - Small</option>
                      <option value="14px">14px - Regular</option>
                      <option value="16px">16px - Medium</option>
                      <option value="18px">18px - Large</option>
                      <option value="20px">20px - Extra Large</option>
                      <option value="24px">24px - Heading</option>
                      <option value="28px">28px - Large Heading</option>
                      <option value="32px">32px - Extra Large Heading</option>
                    </select>
                  </div>

                  {/* Font Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Style
                    </label>
                    <select
                      value={topicFormData.fontStyle}
                      onChange={(e) => setTopicFormData({ ...topicFormData, fontStyle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="bold">Bold</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>

                  {/* Heading Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heading Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={topicFormData.headingColor}
                        onChange={(e) => setTopicFormData({ ...topicFormData, headingColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={topicFormData.headingColor}
                        onChange={(e) => setTopicFormData({ ...topicFormData, headingColor: e.target.value })}
                        placeholder="#000000"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Topic Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Content *
                  </label>
                  
                  {/* Rich Text Editor Toolbar */}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700 p-2 flex flex-wrap gap-2">
                    {/* Heading Options */}
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('formatBlock', false, 'h1');
                        document.getElementById('content-editor')?.focus();
                      }}
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('formatBlock', false, 'h2');
                        document.getElementById('content-editor')?.focus();
                      }}
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('formatBlock', false, 'h3');
                        document.getElementById('content-editor')?.focus();
                      }}
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('formatBlock', false, 'p');
                        document.getElementById('content-editor')?.focus();
                      }}
                      title="Normal Paragraph"
                    >
                      P
                    </button>
                    
                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                    
                    {/* Text Formatting */}
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('bold', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 italic"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('italic', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 underline"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('underline', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      U
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('justifyLeft', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('justifyCenter', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('justifyRight', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('insertUnorderedList', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      •
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      onClick={(e) => {
                        e.preventDefault();
                        document.execCommand('insertOrderedList', false, undefined);
                        document.getElementById('content-editor')?.focus();
                      }}
                    >
                      1.
                    </button>
                    
                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                    
                    {/* Font Size Options */}
                    <select
                      onChange={(e) => {
                        const editor = document.getElementById('content-editor');
                        if (editor) {
                          editor.style.fontSize = e.target.value;
                          editor.focus();
                        }
                      }}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                      title="Font Size"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                    </select>
                    
                    {/* Text Color */}
                    <input
                      type="color"
                      onChange={(e) => {
                        document.execCommand('foreColor', false, e.target.value);
                        document.getElementById('content-editor')?.focus();
                      }}
                      className="w-8 h-6 border border-gray-300 dark:border-gray-500 rounded cursor-pointer"
                      title="Text Color"
                    />
                    
                    {/* Background Color */}
                    <input
                      type="color"
                      onChange={(e) => {
                        document.execCommand('backColor', false, e.target.value);
                        document.getElementById('content-editor')?.focus();
                      }}
                      className="w-8 h-6 border border-gray-300 dark:border-gray-500 rounded cursor-pointer"
                      title="Background Color"
                    />
                  </div>
                  
                  <div className="relative">
                    <div
                      id="content-editor"
                      contentEditable
                      onInput={(e) => {
                        const target = e.target as HTMLElement;
                        setTopicFormData({ ...topicFormData, content: target.innerHTML });
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.innerHTML === '' || target.innerHTML === '<br>') {
                          target.innerHTML = '';
                        }
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.innerHTML === '' || target.innerHTML === '<br>') {
                          target.innerHTML = '';
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: topicFormData.content || '' }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[200px] focus:outline-none"
                      style={{ minHeight: '200px' }}
                      data-placeholder="Enter topic content"
                    />
                    {!topicFormData.content && (
                      <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
                        Enter topic content
                      </div>
                    )}
                  </div>
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={topicFormData.youtubeUrl}
                    onChange={(e) => setTopicFormData({ ...topicFormData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowTopicEditor(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#9b0101] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#7a0101] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0101] flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Topic Content
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarTabsManager;