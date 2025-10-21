import React, { useState } from 'react';
import { Plus, Save, Play, FileText, Code, Image, ChevronLeft } from 'lucide-react';
import { BackButtonProps } from '../../types/common';

interface NotebookPageProps extends BackButtonProps {}

const NotebookPage: React.FC<NotebookPageProps> = ({ onGoBack, canGoBack }) => {
  const [cells, setCells] = useState([
    { id: 1, type: 'markdown', content: '# AI Learning Notebook\n\nWelcome to your AI learning notebook. You can add markdown cells for documentation and code cells for experiments.' },
    { id: 2, type: 'code', content: 'import numpy as np\nimport pandas as pd\n\n# Your AI experiments start here\nprint("Hello, AI World!")' }
  ]);

  const addCell = (type: 'markdown' | 'code') => {
    const newCell = {
      id: Date.now(),
      type,
      content: type === 'markdown' ? '# New Markdown Cell' : '# New code cell\nprint("Hello World")'
    };
    setCells([...cells, newCell]);
  };

  const updateCell = (id: number, content: string) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, content } : cell));
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Notebook</h1>
            <p className="text-gray-600 dark:text-gray-400">Interactive notebook for AI experiments and documentation</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => addCell('markdown')}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors duration-200"
          >
            <FileText className="w-4 h-4" />
            <span>Add Markdown</span>
          </button>
          <button
            onClick={() => addCell('code')}
            className="flex items-center space-x-2 px-4 py-2 bg-[#9b0101] text-white rounded-lg hover:bg-[#7a0101] transition-colors duration-200"
          >
            <Code className="w-4 h-4" />
            <span>Add Code</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Notebook Cells */}
      <div className="space-y-4">
        {cells.map((cell, index) => (
          <div key={cell.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  [{index + 1}] {cell.type === 'markdown' ? 'Markdown' : 'Code'}
                </span>
                {cell.type === 'markdown' && <FileText className="w-4 h-4 text-[#9b0101]" />}
                {cell.type === 'code' && <Code className="w-4 h-4 text-[#9b0101]" />}
              </div>
              {cell.type === 'code' && (
                <button className="flex items-center space-x-1 px-2 py-1 bg-[#9b0101] text-white text-sm rounded hover:bg-[#7a0101] transition-colors duration-200">
                  <Play className="w-3 h-3" />
                  <span>Run</span>
                </button>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={cell.content}
                onChange={(e) => updateCell(cell.id, e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none"
                placeholder={cell.type === 'markdown' ? 'Enter markdown content...' : 'Enter your code...'}
              />
            </div>
            {cell.type === 'code' && (
              <div className="px-4 pb-4">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Output:</div>
                  <div className="text-sm font-mono text-gray-900 dark:text-white">
                    {cell.content.includes('print') ? 'Hello, AI World!' : 'No output'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Cell Button */}
      <div className="flex justify-center pt-6">
        <div className="flex space-x-2">
          <button
            onClick={() => addCell('markdown')}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#9b0101] dark:hover:border-[#9b0101] transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-[#9b0101] dark:hover:text-[#9b0101]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Cell</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotebookPage;