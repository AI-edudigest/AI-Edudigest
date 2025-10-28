import React from 'react';

const EMagazinePage: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Magazine Content Moved
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Please check the E-Guide section for magazine content.
      </p>
    </div>
  );
};

export default EMagazinePage;
