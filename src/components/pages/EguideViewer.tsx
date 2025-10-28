import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, BookOpen } from 'lucide-react';
// import { formatFileSize } from '../../utils/storage/uploadPdf';

interface EguideContent {
  id: string;
  name: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfSize?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const EguideViewer: React.FC = () => {
  const [contentItems, setContentItems] = useState<EguideContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    loadEguideContent();
  }, []);

  const loadEguideContent = async () => {
    try {
      setLoading(true);
      const { db } = await import('../../utils/firebase');
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      
      console.log('🔍 Loading E-Guide content...');
      
      // First try with the composite index query
      try {
        const q = query(
          collection(db, 'eguideContent'),
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const items: EguideContent[] = [];
        
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          } as EguideContent);
        });
        
        console.log('✅ Loaded E-Guide content with index:', items.length, 'items');
        setContentItems(items);
        
        // Auto-select first PDF if available
        if (items.length > 0 && items[0].pdfUrl) {
          setSelectedPdf(items[0].pdfUrl);
        }
      } catch (indexError) {
        console.warn('⚠️ Index query failed, trying simple query:', indexError);
        
        // Fallback to simple query without orderBy
        const simpleQuery = query(
          collection(db, 'eguideContent'),
          where('active', '==', true)
        );
        
        const querySnapshot = await getDocs(simpleQuery);
        const items: EguideContent[] = [];
        
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          } as EguideContent);
        });
        
        // Sort manually
        items.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        
        console.log('✅ Loaded E-Guide content with fallback:', items.length, 'items');
        setContentItems(items);
        
        // Auto-select first PDF if available
        if (items.length > 0 && items[0].pdfUrl) {
          setSelectedPdf(items[0].pdfUrl);
        }
      }
    } catch (error) {
      console.error('❌ Error loading E-Guide content:', error);
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.error('Permission denied: User may not be authenticated or may not have access to E-Guide content');
        } else if (error.message.includes('index')) {
          console.error('Firestore index required: Please create a composite index for eguideContent collection');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSelect = (pdfUrl: string) => {
    setSelectedPdf(pdfUrl);
  };

  const handleDownload = (pdfUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b0101]"></div>
      </div>
    );
  }

  if (contentItems.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No E-Guides Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for new E-Guide content.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              E-Guide Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Browse and read our collection of E-Guides
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* E-Guide List (Clip Book Style) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Available E-Guides
            </h2>
            
            <div className="space-y-2">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.pdfUrl && handlePdfSelect(item.pdfUrl)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedPdf === item.pdfUrl
                      ? 'border-[#9b0101] bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-xs leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    {item.pdfUrl && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.pdfUrl, '_blank');
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item.pdfUrl!, item.pdfFileName || item.name);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {selectedPdf ? (
              <>
                {/* PDF Header */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {contentItems.find(item => item.pdfUrl === selectedPdf)?.name || 'E-Guide'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(selectedPdf, '_blank')}
                        className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Open
                      </button>
                      <button
                        onClick={() => {
                          const item = contentItems.find(item => item.pdfUrl === selectedPdf);
                          if (item) {
                            handleDownload(selectedPdf, item.pdfFileName || item.name);
                          }
                        }}
                        className="inline-flex items-center px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Embed */}
                <div className="p-0">
                  <div 
                    className="bg-white rounded overflow-hidden"
                    style={{
                      width: '100%',
                      height: '750px',
                      position: 'relative'
                    }}
                  >
                    <iframe
                      src={`${selectedPdf}#toolbar=1&navpanes=0&scrollbar=1&zoom=100&view=FitH&pagemode=none&disableworker=true`}
                      className="w-full h-full border-0"
                      title="E-Guide PDF Viewer"
                      style={{ 
                        border: 'none',
                        outline: 'none',
                        background: 'white',
                        display: 'block',
                        margin: '0',
                        padding: '0',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: '0',
                        left: '0'
                      }}
                      onError={(e) => {
                        console.error('Error loading PDF:', e);
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select an E-Guide
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an E-Guide from the list to start reading
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EguideViewer;
