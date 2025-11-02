import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Calendar, FileText, Megaphone, BookOpen, MessageSquare, Clock, RotateCcw } from 'lucide-react';

interface DeletedItem {
  id: string;
  collection: string;
  data: any;
  deletedAt: any;
  deletedBy?: string;
}

const RecycleBinManager: React.FC = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCollection, setFilteredCollection] = useState<string>('all');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [itemToRestore, setItemToRestore] = useState<DeletedItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const collections = [
    { id: 'all', label: 'All Items', icon: Trash2 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'sponsors', label: 'Sponsors', icon: Megaphone },
    { id: 'ads', label: 'Ads', icon: Megaphone },
    { id: 'resourceTabContent', label: 'Resource Content', icon: BookOpen },
    { id: 'promptTemplates', label: 'Prompt Templates', icon: MessageSquare },
    { id: 'freeCourses', label: 'Free Courses', icon: BookOpen },
    { id: 'aiTools', label: 'AI Tools', icon: FileText },
    { id: 'newsUpdates', label: 'Latest Updates', icon: FileText },
    { id: 'magazineCovers', label: 'Magazine Covers', icon: BookOpen }
  ];

  useEffect(() => {
    loadDeletedItems();
    // Check for items to permanently delete on load
    checkAndPermanentlyDelete();
  }, []);

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      const { getDeletedItems } = await import('../../utils/firebase');
      const items = await getDeletedItems();
      setDeletedItems(items);
    } catch (error) {
      console.error('Error loading deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndPermanentlyDelete = async () => {
    try {
      const { permanentlyDeleteOldItems } = await import('../../utils/firebase');
      await permanentlyDeleteOldItems();
      // Reload after cleanup
      loadDeletedItems();
    } catch (error) {
      console.error('Error checking for old items:', error);
    }
  };

  const handleRestore = (item: DeletedItem) => {
    setItemToRestore(item);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!itemToRestore) return;

    setIsRestoring(true);
    try {
      const { restoreDeletedItem } = await import('../../utils/firebase');
      const result = await restoreDeletedItem(itemToRestore.collection, itemToRestore.id);
      
      if (result.success) {
        alert('Item restored successfully!');
        setShowRestoreConfirm(false);
        setItemToRestore(null);
        loadDeletedItems();
      } else {
        alert('Failed to restore item: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item: ' + error.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDeletedDate = (deletedAt: any) => {
    try {
      if (deletedAt && deletedAt.toDate) {
        return deletedAt.toDate().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (deletedAt) {
        return new Date(deletedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  };

  const getDaysUntilPermanentDelete = (deletedAt: any) => {
    try {
      let deletedDate: Date;
      if (deletedAt && deletedAt.toDate) {
        deletedDate = deletedAt.toDate();
      } else if (deletedAt) {
        deletedDate = new Date(deletedAt);
      } else {
        return null;
      }

      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = 15 - daysDiff;
      return daysRemaining > 0 ? daysRemaining : 0;
    } catch (error) {
      return null;
    }
  };

  const getItemTitle = (item: DeletedItem) => {
    const data = item.data;
    return data.title || data.name || data.heading || `Item from ${item.collection}`;
  };

  const getItemDescription = (item: DeletedItem) => {
    const data = item.data;
    return data.description || data.content?.substring(0, 100) || 'No description';
  };

  const filteredItems = filteredCollection === 'all'
    ? deletedItems
    : deletedItems.filter(item => item.collection === filteredCollection);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recycle Bin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage deleted items. Items will be permanently deleted after 15 days.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Deleted: {deletedItems.length}
          </div>
          <button
            onClick={loadDeletedItems}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Refresh Recycle Bin"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Collection Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {collections.map((collection) => {
            const Icon = collection.icon;
            const count = collection.id === 'all'
              ? deletedItems.length
              : deletedItems.filter(item => item.collection === collection.id).length;
            
            return (
              <button
                key={collection.id}
                onClick={() => setFilteredCollection(collection.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  filteredCollection === collection.id
                    ? 'bg-[#9b0101] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{collection.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filteredCollection === collection.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deleted Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Deleted Items</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredCollection === 'all' 
              ? 'No items have been deleted yet.'
              : `No deleted items found in ${collections.find(c => c.id === filteredCollection)?.label}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const daysRemaining = getDaysUntilPermanentDelete(item.deletedAt);
            const isExpired = daysRemaining !== null && daysRemaining === 0;
            
            return (
              <div
                key={`${item.collection}-${item.id}`}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                  isExpired
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full uppercase">
                        {item.collection}
                      </span>
                      {isExpired && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full">
                          Expired
                        </span>
                      )}
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                          {daysRemaining} days left
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {getItemTitle(item)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {getItemDescription(item)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Deleted: {formatDeletedDate(item.deletedAt)}</span>
                  </div>
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={isExpired}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isExpired
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-[#9b0101] hover:bg-[#7a0101] text-white'
                    }`}
                    title={isExpired ? 'Item has expired and will be permanently deleted soon' : 'Restore this item'}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && itemToRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Restore Item
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will restore the item to its original location
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to restore{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    "{getItemTitle(itemToRestore)}"
                  </span>
                  {' '}from {itemToRestore.collection}?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRestoreConfirm(false);
                    setItemToRestore(null);
                  }}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreConfirm}
                  disabled={isRestoring}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore Item
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBinManager;

