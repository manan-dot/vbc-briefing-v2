'use client';

import { Category } from '@/types';

interface CategoryTabsProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { key: Category | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'quality-measures', label: 'Quality', emoji: '⭐' },
  { key: 'ai-tech', label: 'AI & Tech', emoji: '🤖' },
  { key: 'regulatory-policy', label: 'Policy', emoji: '📜' },
  { key: 'patient-engagement', label: 'Engagement', emoji: '💬' },
  { key: 'payment-innovation', label: 'Payment', emoji: '💰' },
  { key: 'payer-provider', label: 'Payer', emoji: '🏥' },
  { key: 'aco-programs', label: 'ACO', emoji: '🤝' },
  { key: 'general', label: 'General', emoji: '📰' },
];

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const count = cat.key === 'all'
          ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
          : categoryCounts[cat.key] || 0;

        const isActive = activeCategory === cat.key;

        return (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
