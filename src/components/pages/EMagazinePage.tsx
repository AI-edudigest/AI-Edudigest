import React, { useState } from 'react';
import { BookOpen, Download, Search, Maximize, Minimize, X } from 'lucide-react';

const EMagazinePage: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleDownload = () => {
    // Create a link element to trigger download
    const link = document.createElement('a');
    link.href = '/Documents/AI-Edudigest magzine.pdf'; // Path to your PDF file
    link.download = 'AI-EduDigest-Magazine.pdf'; // Name for the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
  };

  return (
    <>
      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Full Screen Header */}
          <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">AI-EduDigest Magazine - Full Screen</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleFullScreen}
                className="p-2 hover:bg-gray-700 rounded"
                title="Exit Full Screen"
              >
                <Minimize className="w-5 h-5" />
              </button>
              <button 
                onClick={exitFullScreen}
                className="p-2 hover:bg-gray-700 rounded"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Full Screen PDF Viewer */}
          <div className="flex-1 bg-white">
            <iframe
              src="/Documents/AI-Edudigest magzine.pdf#toolbar=1&navpanes=1&scrollbar=1&zoom=75&view=FitH"
              className="w-full h-full"
              title="AI-EduDigest Magazine - Full Screen"
            />
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Magazine Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-[#9b0101] rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            AI-EduDigest Magazine
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your comprehensive guide to AI in education
          </p>
        </div>

        {/* PDF Viewer */}
        <div className="mb-8">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-500"></div>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">−</span>
                </button>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">+</span>
                </button>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">1 of 8</span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={toggleFullScreen}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Full Screen"
                >
                  <Maximize className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <iframe
              src="/Documents/AI-Edudigest magzine.pdf#toolbar=1&navpanes=1&scrollbar=1&zoom=75&view=FitH"
              className="w-full h-[600px]"
              title="AI-EduDigest Magazine"
            />
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Download className="w-8 h-8 text-[#9b0101]" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Download Magazine
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Save the magazine to your device for offline reading and sharing
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 bg-[#9b0101] hover:bg-[#7a0101] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Magazine Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Latest Articles
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fresh insights and research in AI education
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Offline Access
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download and read anywhere, anytime
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Expert Insights
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional perspectives on AI in education
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default EMagazinePage;
