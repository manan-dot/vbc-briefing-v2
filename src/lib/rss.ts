import Parser from 'rss-parser';
import { Article } from '@/types';
import { RSS_FEEDS } from './feeds';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'VBC-Briefing/2.0 (Healthcare News Aggregator)',
  },
});

// Generate unique ID for article
function generateId(title: string, link: string): string {
  const str = `${title}-${link}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Clean and truncate summary text
function cleanSummary(text: string | undefined, maxLength: number = 300): string {
  if (!text) return '';

  // Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Remove extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  // Truncate if needed
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).trim() + '...';
  }

  return clean;
}

// Fetch single feed
async function fetchFeed(feedUrl: string, sourceName: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(feedUrl);

    return (feed.items || []).map((item) => ({
      id: generateId(item.title || '', item.link || ''),
      title: item.title || 'Untitled',
      link: item.link || '',
      description: cleanSummary(item.contentSnippet || item.content || item.summary),
      source: sourceName,
      sourceUrl: feedUrl,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      // These will be filled in by scoring
      score: 0,
      tier: 'low' as const,
      category: 'general' as const,
      keywords: [],
    }));
  } catch (error) {
    console.error(`Failed to fetch feed ${sourceName}:`, error);
    return [];
  }
}

// Fetch all feeds
export async function fetchAllFeeds(hoursBack: number = 24): Promise<Article[]> {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

  // Fetch all feeds in parallel
  const feedPromises = RSS_FEEDS.map((feed) =>
    fetchFeed(feed.url, feed.name)
  );

  const results = await Promise.all(feedPromises);

  // Flatten and filter by date
  const allArticles = results.flat().filter((article) => {
    try {
      const pubDate = new Date(article.pubDate);
      return pubDate >= cutoffTime;
    } catch {
      return true; // Include if date parsing fails
    }
  });

  // Remove duplicates based on title similarity
  const seen = new Set<string>();
  const unique = allArticles.filter((article) => {
    const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalizedTitle)) {
      return false;
    }
    seen.add(normalizedTitle);
    return true;
  });

  return unique;
}

// Fetch feeds by category
export async function fetchFeedsByCategory(
  category: string,
  hoursBack: number = 24
): Promise<Article[]> {
  const categoryFeeds = RSS_FEEDS.filter((feed) => feed.category === category);

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

  const feedPromises = categoryFeeds.map((feed) =>
    fetchFeed(feed.url, feed.name)
  );

  const results = await Promise.all(feedPromises);

  return results.flat().filter((article) => {
    try {
      return new Date(article.pubDate) >= cutoffTime;
    } catch {
      return true;
    }
  });
}
