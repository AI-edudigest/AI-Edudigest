import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FileText,
  Mail,
  Hash,
  Type,
  CheckSquare,
  Circle,
  List,
  Calendar,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { 
  getFeedbackForms, 
  createFeedbackForm, 
  updateFeedbackForm, 
  deleteFeedbackForm,
  getFeedbackSubmissions 
} from '../../utils/firebase';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const FeedbackFormManager: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState<FeedbackForm | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    active: true
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [viewMode, setViewMode] = useState<'forms' | 'submissions'>('forms');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'textarea', label: 'Textarea', icon: MessageSquare },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'radio', label: 'Radio', icon: Circle },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'tel', label: 'Phone', icon: Phone },
    { value: 'url', label: 'URL', icon: MapPin }
  ];

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const result = await getFeedbackForms();
      if (result.forms) {
        setForms(result.forms);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formPayload = {
        ...formData,
        fields
      };

      let result;
      if (editingForm) {
        result = await updateFeedbackForm(editingForm.id, formPayload);
      } else {
        result = await createFeedbackForm(formPayload);
      }

      if (result && result.success) {
        await fetchForms();
        handleCancel();
        alert('Feedback form saved successfully!');
      } else {
        alert(`Error saving form: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    }
  };

  const handleEdit = (form: FeedbackForm) => {
    setEditingForm(form);
    setFormData({
      title: form.title,
      description: form.description,
      active: form.active
    });
    setFields(form.fields || []);
    setShowForm(true);
  };

  const handleDelete = async (formId: string) => {
    if (confirm('Are you sure you want to delete this feedback form?')) {
      try {
        await deleteFeedbackForm(formId);
        await fetchForms();
        alert('Feedback form deleted successfully!');
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Error deleting form. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingForm(null);
    setFormData({
      title: '',
      description: '',
      active: true
    });
    setFields([]);
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      console.log('Loading feedback submissions...');
      const { submissions, error } = await getFeedbackSubmissions();
      if (error) {
        console.error('Error loading submissions:', error);
        alert('Error loading submissions');
      } else {
        console.log('Loaded submissions:', submissions);
        
        // Map submissions with form field labels
        const mappedSubmissions = await Promise.all(
          submissions.map(async (submission) => {
            // Find the form that this submission belongs to
            const form = forms.find(f => f.id === submission.formId);
            if (!form) {
              console.warn('Form not found for submission:', submission.formId);
              return submission;
            }
            
            // Create a mapping of field IDs to field labels
            const fieldMap: { [key: string]: string } = {};
            form.fields.forEach(field => {
              fieldMap[field.id] = field.label;
            });
            
            // Map the submission data with proper labels
            const mappedData: { [key: string]: any } = {};
            Object.entries(submission).forEach(([key, value]) => {
              if (key === 'id' || key === 'submittedAt' || key === 'formId') {
                mappedData[key] = value;
              } else if (fieldMap[key]) {
                // Use the form field label instead of the field ID
                mappedData[fieldMap[key]] = value;
              } else {
                // Keep original key if no mapping found
                mappedData[key] = value;
              }
            });
            
            return {
              ...submission,
              mappedData
            };
          })
        );
        
        setSubmissions(mappedSubmissions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Error loading submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setFields(newFields);
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Forms Manager</h2>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('forms')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'forms'
                  ? 'bg-white dark:bg-gray-600 text-[#9b0101] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              Forms
            </button>
            <button
              onClick={() => {
                setViewMode('submissions');
                loadSubmissions();
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'submissions'
                  ? 'bg-white dark:bg-gray-600 text-[#9b0101] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Submissions
            </button>
          </div>
          
          {/* Create Form Button */}
          {viewMode === 'forms' && (
            <button
              onClick={() => {
                console.log('Create Feedback Form button clicked');
                setShowForm(true);
                setEditingForm(null);
                setFormData({
                  title: '',
                  description: '',
                  active: true
                });
                setFields([]);
              }}
              className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Feedback Form
            </button>
          )}
        </div>
      </div>

      {/* Feedback Form Builder */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {editingForm ? 'Edit Feedback Form' : 'Create Feedback Form'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., User Feedback Form"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this form is for..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Form Fields Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Form Fields</h4>
                <button
                  type="button"
                  onClick={addField}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </button>
              </div>

              {fields.map((field, index) => {
                const FieldIcon = getFieldIcon(field.type);
                return (
                  <div key={field.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Field {index + 1}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => moveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveField(field.id, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Delete Field"
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
                          onChange={(e) => updateField(field.id, { type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Enter field label"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="e.g., Enter your name here"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
                        />
                        <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Required
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No fields added yet. Click "Add Field" to get started.</p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between">
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
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {editingForm ? 'Update Form' : 'Create Form'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Forms View */}
      {viewMode === 'forms' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Feedback Forms</h3>
        {forms.length === 0 && !loading ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No Feedback Forms Yet.</p>
            <p className="text-gray-500 dark:text-gray-500 mb-4">Start by creating your first feedback form.</p>
            <button
              onClick={() => {
                console.log('Create First Feedback Form button clicked');
                setShowForm(true);
                setEditingForm(null);
                setFormData({
                  title: '',
                  description: '',
                  active: true
                });
                setFields([]);
              }}
              className="bg-[#9b0101] text-white px-6 py-3 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center mx-auto cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Feedback Form
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{form.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{form.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{form.fields?.length || 0} fields</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        form.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {form.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(form)}
                      className="p-2 text-gray-600 hover:text-[#9b0101] hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Edit Form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Form"
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
      )}

      {/* Submissions View */}
      {viewMode === 'submissions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Submissions</h3>
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b0101]"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No Submissions Yet.</p>
              <p className="text-gray-500 dark:text-gray-500 mb-4">User submissions will appear here once they fill out your feedback forms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div key={submission.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-[#9b0101]" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Submission #{index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {submission.submittedAt ? new Date(submission.submittedAt.toDate?.() || submission.submittedAt).toLocaleString() : 'Unknown date'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.mappedData ? Object.entries(submission.mappedData).map(([key, value]) => {
                      if (key === 'id' || key === 'submittedAt' || key === 'formId') return null;
                      
                      return (
                        <div key={key} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key}
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded border">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </div>
                        </div>
                      );
                    }) : Object.entries(submission).map(([key, value]) => {
                      if (key === 'id' || key === 'submittedAt' || key === 'formId' || key === 'mappedData') return null;
                      
                      return (
                        <div key={key} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key.replace('field_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded border">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
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
    </div>
  );
};

export default FeedbackFormManager;
