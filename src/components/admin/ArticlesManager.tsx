import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { getArticles, createArticle, updateArticle, deleteArticle, createNotification, reorderArticles } from '../../utils/firebase';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  priority?: number;
  createdAt: any;
  updatedAt: any;
}

const ArticlesManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    published: false
  });

  // Simple styling controls for article content
  const [contentFontSize, setContentFontSize] = useState<string>('16px');
  const [contentFontStyle, setContentFontStyle] = useState<string>('sans-serif regular');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const result = await getArticles();
      if (result.articles && Array.isArray(result.articles)) {
        // Assign priorities to articles that don't have one
        let hasUnassignedPriorities = false;
        const articlesWithPriority = result.articles.map((article: any, index: number) => {
          if (article.priority === undefined || article.priority === null) {
            hasUnassignedPriorities = true;
            return { ...article, priority: result.articles.length + index + 1 };
          }
          return article;
        });
        
        // If any articles were missing priorities, save them
        if (hasUnassignedPriorities) {
          console.log('🔧 Assigning priorities to articles without them...');
          const result = await reorderArticles(articlesWithPriority.map((article: any, index: number) => ({
            ...article,
            priority: index + 1
          })));
          if (!result.success) {
            console.error('❌ Failed to assign priorities:', result.error);
          }
        }
        
        // Sort articles by priority (lower number = higher priority, appears first)
        const sorted = [...articlesWithPriority].sort((a: any, b: any) => {
          const priorityA = a.priority !== undefined ? a.priority : 999999;
          const priorityB = b.priority !== undefined ? b.priority : 999999;
          return priorityA - priorityB;
        });
        setArticles(sorted as Article[]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Apply font styling to content
      let styledContent = formData.content;
      
      // Apply styling based on font size and font style options
      const styles = [];
      if (contentFontSize !== '16px') styles.push(`font-size: ${contentFontSize}`);
      
      // Apply font family and weight based on selected style
      const isBold = contentFontStyle === 'sans-serif Bold';
      if (isBold) {
        styles.push('font-family: sans-serif');
        styles.push('font-weight: bold');
      } else {
        styles.push('font-family: sans-serif');
        styles.push('font-weight: normal');
      }
      
      if (styles.length > 0) {
        styledContent = `<div style="${styles.join('; ')}">${formData.content}</div>`;
      }
      
      // Set priority for new articles (add at the end)
      const priority = editingArticle ? editingArticle.priority : (articles.length + 1);
      
      const payload = { ...formData, content: styledContent, excerpt: '', priority };
      
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
      } else {
        await createArticle(payload);
        
        // Create notification for new article
        await createNotification({
          title: 'New Article Published',
          message: `${formData.title} has been published and is now available to readers`,
          type: 'article'
        });
      }
      
      setShowForm(false);
      setEditingArticle(null);
      setFormData({ title: '', content: '', author: '', published: false });
      setContentFontSize('16px');
      setContentFontStyle('sans-serif regular');
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);

    // Extract plain text and previously saved styles
    let extractedText = '';
    let extractedFontSize: string = '16px';
    let extractedFontStyle: string = 'sans-serif regular';

    try {
      const container = document.createElement('div');
      container.innerHTML = article.content || '';

      // If content was wrapped in a styled div, read its styles; otherwise, fall back to textContent
      const styled = container.firstElementChild as HTMLElement | null;
      if (styled && styled.tagName === 'DIV') {
        extractedText = styled.textContent || '';
        if (styled.style && styled.getAttribute('style')) {
          if (styled.style.fontSize) extractedFontSize = styled.style.fontSize;
          const weight = styled.style.fontWeight;
          if (weight && (weight === 'bold' || parseInt(weight, 10) >= 600)) {
            extractedFontStyle = 'sans-serif Bold';
          } else {
            extractedFontStyle = 'sans-serif regular';
          }
        }
      } else {
        extractedText = container.textContent || '';
      }
    } catch (e) {
      // Fallback: use raw content if parsing fails
      extractedText = article.content || '';
    }

    setFormData({
      title: article.title,
      content: extractedText,
      author: article.author,
      published: article.published
    });

    setContentFontSize(extractedFontSize || '16px');
    setContentFontStyle(extractedFontStyle);

    setShowForm(true);
  };

  const handleDelete = async (articleId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(articleId);
        // After deletion, reorder remaining articles
        const remainingArticles = articles.filter(a => a.id !== articleId);
        await handleReorder(remainingArticles);
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) {
      console.log('⚠️ Article already at top');
      return; // Already at top
    }
    
    console.log(`⬆️ Moving article at index ${index} up`);
    const newArticles = [...articles];
    
    // Swap the articles in the array (simpler approach)
    const temp = newArticles[index];
    newArticles[index] = newArticles[index - 1];
    newArticles[index - 1] = temp;
    
    // Optimistically update UI
    setArticles(newArticles);
    
    // Update priorities in Firebase
    await handleReorder(newArticles);
  };

  const handleMoveDown = async (index: number) => {
    if (index === articles.length - 1) {
      console.log('⚠️ Article already at bottom');
      return; // Already at bottom
    }
    
    console.log(`⬇️ Moving article at index ${index} down`);
    const newArticles = [...articles];
    
    // Swap the articles in the array (simpler approach)
    const temp = newArticles[index];
    newArticles[index] = newArticles[index + 1];
    newArticles[index + 1] = temp;
    
    // Optimistically update UI
    setArticles(newArticles);
    
    // Update priorities in Firebase
    await handleReorder(newArticles);
  };

  const handleReorder = async (articlesToReorder: Article[]) => {
    try {
      // Normalize priorities to be sequential starting from 1
      const articlesWithPriority = articlesToReorder.map((article, index) => ({
        ...article,
        priority: index + 1
      }));
      
      const result = await reorderArticles(articlesWithPriority);
      if (result.success) {
        console.log('✅ Articles reordered successfully');
        fetchArticles(); // Refresh to get updated order
      } else {
        console.error('❌ Error reordering articles:', result.error);
        alert('Error updating article priority: ' + result.error);
        fetchArticles(); // Reset on error
      }
    } catch (error) {
      console.error('Error reordering articles:', error);
      alert('Error updating article priority. Please try again.');
      fetchArticles(); // Reset on error
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
    setFormData({ title: '', content: '', author: '', published: false });
    setContentFontSize('16px');
    setContentFontStyle('sans-serif regular');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Articles Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage articles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </button>
      </div>

      {/* Article Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              {/* Font style and size options for content */}
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Font Style</span>
                  <select
                    value={contentFontStyle}
                    onChange={(e) => setContentFontStyle(e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="sans-serif regular">sans-serif regular</option>
                    <option value="sans-serif Bold">sans-serif Bold</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Font Size</span>
                  <select
                    value={contentFontSize}
                    onChange={(e) => setContentFontSize(e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                  </select>
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              
              {/* Preview of styled content */}
              {formData.content && (
                <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                  <div 
                    style={{
                      fontSize: contentFontSize,
                      fontFamily: 'sans-serif',
                      fontWeight: contentFontStyle === 'sans-serif Bold' ? 'bold' : 'normal'
                    }}
                    className="text-gray-900 dark:text-white"
                  >
                    {formData.content}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Published
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Articles</h3>
          {articles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No articles found.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>By: {article.author}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          article.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Priority Controls */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                          }`}
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === articles.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === articles.length - 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                          }`}
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete"
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
    </div>
  );
};

export default ArticlesManager;
