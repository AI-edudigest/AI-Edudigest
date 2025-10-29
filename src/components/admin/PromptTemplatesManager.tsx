import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Lightbulb, RefreshCw } from 'lucide-react';
import { 
  getResourceTabContent, 
  createResourceTabContent, 
  updateResourceTabContent, 
  deleteResourceTabContent,
  getResourceTabs,
  createResourceTab
} from '../../utils/firebase';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: 'Leaders' | 'Administration' | 'Educators';
  active: boolean;
  order: number;
  tabId: string;
  createdAt: any;
  updatedAt: any;
}

interface PromptTemplatesManagerProps {
  onBack?: () => void;
}

const PromptTemplatesManager: React.FC<PromptTemplatesManagerProps> = ({ onBack }) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [promptTemplatesTabId, setPromptTemplatesTabId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
    category: 'Leaders' as 'Leaders' | 'Administration' | 'Educators',
    active: true
  });

  const categories = [
    { 
      value: 'Leaders', 
      label: 'Leaders', 
      description: 'For College Principals, Directors, and Management', 
      icon: '👔', 
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
    },
    { 
      value: 'Administration', 
      label: 'Administration', 
      description: 'For College Administrative Staff, Office Personnel, and Clerks', 
      icon: '📋', 
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' 
    },
    { 
      value: 'Educators', 
      label: 'Educators', 
      description: 'For College Professors, Lecturers, and Teaching Faculty', 
      icon: '🎓', 
      color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
    }
  ];

  useEffect(() => {
    findPromptTemplatesTab();
  }, []);

  const findPromptTemplatesTab = async () => {
    try {
      console.log('🔍 Finding Prompt Templates tab...');
      const { tabs, error } = await getResourceTabs();
      if (error) {
        console.error('❌ Error fetching resource tabs:', error);
        return;
      }
      
      const promptTab = tabs.find(tab => {
        const tabName = (tab as any).name?.toLowerCase() || '';
        return tabName.includes('templates') || tabName.includes('prompt');
      });
      
      if (promptTab) {
        console.log('✅ Found Prompt Templates tab:', promptTab);
        setPromptTemplatesTabId(promptTab.id);
        fetchTemplates(promptTab.id);
      } else {
        console.log('❌ No Prompt Templates tab found. Available tabs:', tabs.map(t => (t as any).name));
        console.log('🔧 Creating Prompt Templates tab...');
        await createPromptTemplatesTab();
      }
    } catch (error) {
      console.error('❌ Error finding prompt templates tab:', error);
      setLoading(false);
    }
  };

  const createPromptTemplatesTab = async () => {
    try {
      console.log('➕ Creating Prompt Templates tab...');
      const tabData = {
        name: 'Prompt Templates',
        description: 'Ready-to-use AI prompt templates',
        icon: '💡',
        color: 'text-orange-500',
        link: '/resources/promptTemplates',
        category: 'templates',
        active: true,
        order: 2
      };
      
      const result = await createResourceTab(tabData);
      if (result.success) {
        console.log('✅ Prompt Templates tab created successfully!');
        // Refresh tabs and find the new one
        await findPromptTemplatesTab();
      } else {
        console.error('❌ Error creating Prompt Templates tab:', result.error);
        alert('Error creating Prompt Templates tab: ' + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error creating Prompt Templates tab:', error);
      alert('Error creating Prompt Templates tab. Please try again.');
      setLoading(false);
    }
  };

  const fetchTemplates = async (tabId?: string) => {
    try {
      setLoading(true);
      console.log('📥 Fetching Prompt Templates...');
      
      const currentTabId = tabId || promptTemplatesTabId;
      if (!currentTabId) {
        console.log('❌ No tab ID available for fetching templates');
        setTemplates([]);
        return;
      }
      
      const result = await getResourceTabContent(currentTabId);
      console.log('📊 Fetch result:', result);
      
      if (result.contents) {
        console.log('✅ Setting Prompt Templates:', result.contents);
        setTemplates(result.contents as PromptTemplate[]);
      } else {
        console.log('❌ No Prompt Templates found or error:', result.error);
        setTemplates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching Prompt Templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.template.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        template: formData.template.trim(),
        category: formData.category,
        active: formData.active,
        order: templates.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingTemplate) {
        const result = await updateResourceTabContent(editingTemplate.id, templateData);
        if (result.success) {
          await fetchTemplates();
          resetForm();
          alert('Prompt template updated successfully!');
        } else {
          alert('Error updating template: ' + result.error);
        }
      } else {
        if (!promptTemplatesTabId) {
          alert('Error: Prompt Templates tab not found. Please ensure the Prompt Templates tab exists in Resource Tabs.');
          return;
        }
        
        const result = await createResourceTabContent(promptTemplatesTabId, templateData);
        if (result.success) {
          await fetchTemplates();
          resetForm();
          alert('Prompt template created successfully!');
        } else {
          alert('Error creating template: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      template: template.template,
      category: template.category,
      active: template.active
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const result = await deleteResourceTabContent(templateId);
      if (result.success) {
        await fetchTemplates();
        alert('Template deleted successfully!');
      } else {
        alert('Error deleting template: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template: '',
      category: 'Leaders',
      active: true
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  const toggleActive = async (template: PromptTemplate) => {
    try {
      const updatedData = {
        ...template,
        active: !template.active,
        updatedAt: new Date()
      };
      
      const result = await updateResourceTabContent(template.id, updatedData);
      if (result.success) {
        await fetchTemplates();
      } else {
        alert('Error updating template status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      alert('Error updating template status. Please try again.');
    }
  };

  const debugData = async () => {
    try {
      console.log('🔍 DEBUGGING PROMPT TEMPLATES DATA:');
      
      const { tabs, error: tabsError } = await getResourceTabs();
      console.log('📋 Resource Tabs:', tabs);
      console.log('📋 Tabs Error:', tabsError);
      
      const promptTab = tabs.find(tab => {
        const tabName = (tab as any).name?.toLowerCase() || '';
        return tabName.includes('templates') || tabName.includes('prompt');
      });
      console.log('🎯 Found Prompt Tab:', promptTab);
      
      if (promptTab) {
        const { contents, error: contentError } = await getResourceTabContent(promptTab.id);
        console.log('📄 Tab Contents:', contents);
        console.log('📄 Content Error:', contentError);
        
        const activeContents = contents.filter((content: any) => content.active);
        console.log('✅ Active Contents:', activeContents);
      }
      
      alert('Debug data logged to console. Check browser console (F12) for details.');
    } catch (error) {
      console.error('Debug error:', error);
      alert('Debug failed. Check console for error details.');
    }
  };

  const createTestTemplate = async () => {
    try {
      if (!promptTemplatesTabId) {
        alert('No Prompt Templates tab found. Please create the tab first.');
        return;
      }
      
      const testTemplate = {
        name: 'Test Template',
        description: 'This is a test template to verify the system works',
        template: 'This is a test prompt template. Use this to verify that templates are working correctly.',
        category: 'Leaders',
        active: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🧪 Creating test template with tabId:', promptTemplatesTabId);
      const result = await createResourceTabContent(promptTemplatesTabId, testTemplate);
      
      if (result.success) {
        console.log('✅ Test template created successfully!');
        alert('Test template created successfully!');
        await fetchTemplates();
      } else {
        console.error('❌ Error creating test template:', result.error);
        alert('Error creating test template: ' + result.error);
      }
    } catch (error) {
      console.error('Test template creation error:', error);
      alert('Error creating test template. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prompt Templates Manager
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => findPromptTemplatesTab()}
            className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={debugData}
            className="inline-flex items-center px-4 py-2 text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Debug
          </button>
          <button
            onClick={createTestTemplate}
            className="inline-flex items-center px-4 py-2 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Test Template
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-[#9b0101] hover:bg-[#7a0101] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </button>
        </div>
      </div>

      {/* Warning if no tab found */}
      {!promptTemplatesTabId && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
            <strong>Note:</strong> No Prompt Templates tab found. This tab is required to store prompt templates.
          </p>
          <button
            onClick={createPromptTemplatesTab}
            className="inline-flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Prompt Templates Tab
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingTemplate ? 'Edit Template' : 'Add New Template'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter template name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder="Enter template description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Content *
              </label>
              <textarea
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={6}
                placeholder="Enter the prompt template content"
                required
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-[#9b0101] bg-gray-100 border-gray-300 rounded focus:ring-[#9b0101] dark:focus:ring-[#9b0101] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (visible to users)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-[#9b0101] hover:bg-[#7a0101] text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryTemplates = templates.filter(template => template.category === category.value);
            
            return (
              <div key={category.value} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {category.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${category.color}`}>
                      {categoryTemplates.length} Templates
                    </span>
                  </div>

                  {categoryTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No templates in this category yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {categoryTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {template.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {template.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => toggleActive(template)}
                                className={`p-1 rounded ${
                                  template.active 
                                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                title={template.active ? 'Deactivate' : 'Activate'}
                              >
                                {template.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEdit(template)}
                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2">
                            <p className="text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
                              {template.template}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptTemplatesManager;
