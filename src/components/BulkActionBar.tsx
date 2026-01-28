'use client';

import { Article } from '@/types';
import { Copy, X, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';

interface BulkActionBarProps {
  selectedArticles: Article[];
  totalArticles: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

export default function BulkActionBar({
  selectedArticles,
  totalArticles,
  onClearSelection,
  onSelectAll,
}: BulkActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (selectedArticles.length === 0) return;

    // Format: Title + Link + Summary for each article
    const formattedText = selectedArticles
      .map((article, index) => {
        return `${index + 1}. ${article.title}
Link: ${article.link}
Summary: ${article.description}
Source: ${article.source}
`;
      })
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const allSelected = selectedArticles.length === totalArticles && totalArticles > 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side: Selection info and actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={allSelected ? onClearSelection : onSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-green-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>

            {selectedArticles.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={onClearSelection}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Right side: Copy button */}
          <button
            onClick={handleCopyToClipboard}
            disabled={selectedArticles.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedArticles.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : copied
                ? 'bg-green-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <Copy className="w-4 h-4" />
            {copied
              ? 'Copied!'
              : `Copy ${selectedArticles.length > 0 ? selectedArticles.length : ''} to Clipboard`}
          </button>
        </div>
      </div>
    </div>
  );
}
