import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  User,
  Mail,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { BackButtonProps } from '../../types/common';
import { getFeedbackForms, submitFeedbackForm } from '../../utils/firebase';

interface FeedbackPageProps extends BackButtonProps {}

interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  fields: FeedbackField[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface FeedbackField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'rating' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface FormData {
  [key: string]: string | number | boolean;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ onGoBack, canGoBack }) => {
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbackForms();
  }, []);

  const loadFeedbackForms = async () => {
    try {
      setLoading(true);
      console.log('Loading feedback forms...');
      const { forms, error } = await getFeedbackForms();
      if (error) {
        console.error('Error loading feedback forms:', error);
        setError('Failed to load feedback forms. Please try again later.');
      } else {
        console.log('Loaded feedback forms:', forms);
        setFeedbackForms(forms);
        // Select the first active form if available
        const activeForm = forms.find(form => form.active);
        if (activeForm) {
          setSelectedForm(activeForm);
          // Initialize form data with empty values
          const initialData: FormData = {};
          activeForm?.fields?.forEach((field: FeedbackField) => {
            if (field.type === 'checkbox') {
              initialData[field.id] = false;
            } else if (field.type === 'rating') {
              initialData[field.id] = 0;
            } else {
              initialData[field.id] = '';
            }
          });
          setFormData(initialData);
        }
      }
    } catch (error) {
      console.error('Error loading feedback form:', error);
      setError('Failed to load feedback form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { success, error } = await submitFeedbackForm(selectedForm?.id || '', formData);
      if (success) {
        setSubmitted(true);
        setFormData({});
      } else {
        setError(error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FeedbackField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange(field.id, star)}
                className={`p-1 transition-colors ${
                  star <= (value as number) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(value as number) > 0 ? `${value}/5` : 'Rate this'}
            </span>
          </div>
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={field.id}
              checked={value as boolean}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor={field.id} className="text-sm text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error && feedbackForms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Form
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (feedbackForms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Feedback Forms Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No feedback forms are currently available. Please check back later.
          </p>
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {canGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedForm?.title || 'Feedback'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share your feedback and recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Selector */}
        {feedbackForms.length > 1 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Feedback Form</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => {
                    setSelectedForm(form);
                    // Reset form data for new form
                    const initialData: FormData = {};
                    form?.fields?.forEach((field: FeedbackField) => {
                      if (field.type === 'checkbox') {
                        initialData[field.id] = false;
                      } else if (field.type === 'rating') {
                        initialData[field.id] = 0;
                      } else {
                        initialData[field.id] = '';
                      }
                    });
                    setFormData(initialData);
                  }}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    selectedForm?.id === form.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{form.title}</h4>
                  {form.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{form.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {selectedForm?.description && (
            <div className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedForm.description}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedForm?.fields
              ?.sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                </div>
              ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
