import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Star,
  Type,
  Mail,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  List,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  getFeedbackForm, 
  createFeedbackForm, 
  updateFeedbackForm, 
  deleteFeedbackForm,
  getFeedbackSubmissions 
} from '../../utils/firebase';

interface FeedbackField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'rating' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  fields: FeedbackField[];
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface FeedbackSubmission {
  id: string;
  [key: string]: any;
  submittedAt: any;
  status: string;
}

const FeedbackManager: React.FC = () => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm | null>(null);
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [] as FeedbackField[]
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'textarea', label: 'Text Area', icon: MessageCircle },
    { value: 'rating', label: 'Rating', icon: Star },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckCircle }
  ];

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const [formResult, submissionsResult] = await Promise.all([
        getFeedbackForm(),
        getFeedbackSubmissions()
      ]);

      if (formResult.error) {
        setError(`Failed to load feedback form: ${formResult.error}`);
      } else {
        setFeedbackForm(formResult.form);
        if (formResult.form) {
          setFormData({
            title: formResult.form.title,
            description: formResult.form.description,
            fields: formResult.form.fields || []
          });
        }
      }

      if (submissionsResult.error) {
        console.error('Failed to load submissions:', submissionsResult.error);
      } else {
        setSubmissions(submissionsResult.submissions);
      }
    } catch (error) {
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('🔍 Submitting feedback form with data:', formData);

    try {
      if (feedbackForm) {
        // Update existing form
        console.log('📝 Updating existing form:', feedbackForm.id);
        const { success, error } = await updateFeedbackForm(feedbackForm.id, formData);
        if (success) {
          setSuccess('Feedback form updated successfully!');
          await loadFeedbackData();
        } else {
          console.error('❌ Update failed:', error);
          setError(`Failed to update form: ${error}`);
        }
      } else {
        // Create new form
        console.log('🆕 Creating new form');
        const { success, error } = await createFeedbackForm(formData);
        if (success) {
          setSuccess('Feedback form created successfully!');
          await loadFeedbackData();
        } else {
          console.error('❌ Creation failed:', error);
          setError(`Failed to create form: ${error}`);
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleAddField = () => {
    const newField: FeedbackField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      options: [],
      order: formData.fields.length
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FeedbackField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const fields = [...formData.fields];
    const index = fields.findIndex(field => field.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }

    // Update order numbers
    fields.forEach((field, idx) => {
      field.order = idx;
    });

    setFormData(prev => ({
      ...prev,
      fields
    }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Manager</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage feedback forms and view submissions</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSubmissions(!showSubmissions)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{showSubmissions ? 'Hide' : 'View'} Submissions ({submissions.length})</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Edit'} Form</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Form Editor */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {feedbackForm ? 'Edit Feedback Form' : 'Create Feedback Form'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., User Feedback Form"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this form is for..."
                />
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Form Fields</h4>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Field {index + 1}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(field.id, 'down')}
                            disabled={index === formData.fields.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(field.id, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Field Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={field.label}
                          onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Your Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Enter your name here"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
                        </label>
                      </div>

                      {field.type === 'select' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Options (one per line)
                          </label>
                          <textarea
                            value={field.options?.join('\n') || ''}
                            onChange={(e) => handleUpdateField(field.id, { 
                              options: e.target.value.split('\n').filter(opt => opt.trim()) 
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{feedbackForm ? 'Update Form' : 'Create Form'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions Viewer */}
      {showSubmissions && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Feedback Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No feedback submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted: {submission.submittedAt?.toDate?.()?.toLocaleString() || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(submission)
                      .filter(([key, value]) => 
                        key !== 'id' && 
                        key !== 'submittedAt' && 
                        key !== 'status' && 
                        !key.endsWith('_label') &&
                        value !== null && 
                        value !== undefined && 
                        value !== ''
                      )
                      .map(([key, value]) => {
                        // Clean up field IDs to show proper labels
                        let displayKey = key;
                        if (key.startsWith('field_')) {
                          // Try to get the field label from the form data
                          const fieldId = key;
                          const field = feedbackForm?.fields?.find(f => f.id === fieldId);
                          displayKey = field ? field.label : key.replace('field_', 'Field ');
                        }
                        
                        return (
                          <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex flex-col gap-2">
                              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {displayKey}
                              </span>
                              <div className="text-gray-700 dark:text-gray-300 break-words">
                                {typeof value === 'boolean' ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {value ? 'Yes' : 'No'}
                                  </span>
                                ) : (
                                  <span className="whitespace-pre-wrap">{String(value)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Form Preview */}
      {feedbackForm && !showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Feedback Form
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{feedbackForm.title}</h4>
              {feedbackForm.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{feedbackForm.description}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feedbackForm.fields.length} field(s) configured
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
