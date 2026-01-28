'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Article, Category, PriorityTier } from '@/types';
import Header from '@/components/Header';
import BulkActionBar from '@/components/BulkActionBar';
import CategoryTabs from '@/components/CategoryTabs';
import TierFilter from '@/components/TierFilter';
import ArticleCard from '@/components/ArticleCard';
import { getSelectedIds, setSelectedIds, clearSelectedIds } from '@/lib/storage';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export default function TodayPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIds, setSelectedIdsState] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeTiers, setActiveTiers] = useState<Set<PriorityTier>>(
    new Set<PriorityTier>(['high', 'medium', 'low'])
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/briefing?hours=24');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      setArticles(data.articles || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchArticles();

    // Auto-refresh every hour
    const interval = setInterval(fetchArticles, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchArticles]);

  // Load persisted selection
  useEffect(() => {
    const stored = getSelectedIds();
    if (stored.length > 0) {
      setSelectedIdsState(new Set(stored));
    }
  }, []);

  // Persist selection changes
  useEffect(() => {
    setSelectedIds(Array.from(selectedIds));
  }, [selectedIds]);

  // Filter articles by category and tier
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const categoryMatch =
        activeCategory === 'all' || article.category === activeCategory;
      const tierMatch = activeTiers.has(article.tier);
      return categoryMatch && tierMatch;
    });
  }, [articles, activeCategory, activeTiers]);

  // Get selected articles
  const selectedArticles = useMemo(() => {
    return filteredArticles.filter((a) => selectedIds.has(a.id));
  }, [filteredArticles, selectedIds]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((article) => {
      if (activeTiers.has(article.tier)) {
        counts[article.category] = (counts[article.category] || 0) + 1;
      }
    });
    return counts;
  }, [articles, activeTiers]);

  // Calculate tier counts
  const tierCounts = useMemo(() => {
    const counts: Record<PriorityTier, number> = { high: 0, medium: 0, low: 0 };
    articles.forEach((article) => {
      if (activeCategory === 'all' || article.category === activeCategory) {
        counts[article.tier]++;
      }
    });
    return counts;
  }, [articles, activeCategory]);

  // Toggle article selection
  const toggleSelect = (id: string) => {
    setSelectedIdsState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all visible articles
  const selectAll = () => {
    const allIds = new Set(filteredArticles.map((a) => a.id));
    setSelectedIdsState(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIdsState(new Set());
    clearSelectedIds();
  };

  // Toggle tier filter
  const toggleTier = (tier: PriorityTier) => {
    setActiveTiers((prev) => {
      const next = new Set<PriorityTier>(prev);
      if (next.has(tier)) {
        // Don't allow deselecting all tiers
        if (next.size > 1) {
          next.delete(tier);
        }
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={fetchArticles}
        isLoading={isLoading}
      />

      <BulkActionBar
        selectedArticles={selectedArticles}
        totalArticles={filteredArticles.length}
        onClearSelection={clearSelection}
        onSelectAll={selectAll}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Briefing</h2>
          <p className="text-gray-500">Articles from the last 24 hours</p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
          />
          <TierFilter
            activeTiers={activeTiers}
            onToggleTier={toggleTier}
            tierCounts={tierCounts}
          />
        </div>

        {/* Content */}
        {isLoading && articles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <span className="ml-3 text-gray-500">Loading articles...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            <AlertCircle className="w-6 h-6 mr-2" />
            {error}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Inbox className="w-12 h-12 mb-4" />
            <p>No articles match your filters</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveTiers(new Set<PriorityTier>(['high', 'medium', 'low']));
              }}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isSelected={selectedIds.has(article.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}

        {/* Article count */}
        {filteredArticles.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </div>
        )}
      </main>
    </div>
  );
}
