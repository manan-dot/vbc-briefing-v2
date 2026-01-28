'use client';

import { Article, PriorityTier } from '@/types';
import { format } from 'date-fns';
import { ExternalLink, Clock, Tag } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const TIER_CONFIG: Record<PriorityTier, { bg: string; border: string; badge: string; label: string }> = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: '🔴 High Priority',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: '🟡 Medium',
  },
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    label: '🟢 Low',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  'quality-measures': 'Quality Measures',
  'ai-tech': 'AI & Tech',
  'regulatory-policy': 'Policy & Regulatory',
  'patient-engagement': 'Patient Engagement',
  'payment-innovation': 'Payment Innovation',
  'payer-provider': 'Payer-Provider',
  'aco-programs': 'ACO Programs',
  'general': 'General',
};

export default function ArticleCard({ article, isSelected, onToggleSelect }: ArticleCardProps) {
  const tier = TIER_CONFIG[article.tier];
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  const formattedDate = (() => {
    try {
      return format(new Date(article.pubDate), 'MMM d, h:mm a');
    } catch {
      return 'Unknown date';
    }
  })();

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all ${
        isSelected
          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
          : `${tier.border} ${tier.bg} hover:shadow-md`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(article.id)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${tier.badge}`}>
              {tier.label}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors"
            >
              {article.title}
            </a>
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {article.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {article.source}
            </span>

            <div className="flex items-center gap-3">
              {/* Keywords */}
              {article.keywords.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {article.keywords.slice(0, 2).join(', ')}
                    {article.keywords.length > 2 && ` +${article.keywords.length - 2}`}
                  </span>
                </div>
              )}

              {/* Score (debug) */}
              <span className="text-xs text-gray-400">
                Score: {article.score}
              </span>

              {/* External link */}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
