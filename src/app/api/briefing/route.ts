import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '@/lib/feeds';
import { processArticles } from '@/lib/scoring';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'VBC-Briefing/2.0',
  },
});

interface RawArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
}

async function fetchFeed(feed: typeof RSS_FEEDS[0]): Promise<RawArticle[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items || []).map((item) => ({
      title: String(item.title || ''),
      link: String(item.link || ''),
      description: String(item.contentSnippet || item.content || item.description || ''),
      pubDate: String(item.pubDate || item.isoDate || new Date().toISOString()),
      source: feed.name,
      sourceUrl: feed.url,
    }));
  } catch (error) {
    console.error(`Failed to fetch ${feed.name}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hoursFilter = parseInt(searchParams.get('hours') || '24', 10);

    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(fetchFeed);
    const results = await Promise.all(feedPromises);

    // Flatten results
    let allArticles = results.flat();

    console.log(`Total articles fetched: ${allArticles.length}`);

    // Filter by time range
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursFilter);

    const filteredArticles = allArticles.filter((article) => {
      try {
        const pubDate = new Date(article.pubDate);
        return pubDate >= cutoffTime;
      } catch {
        return true;
      }
    });

    console.log(`Articles after time filter: ${filteredArticles.length}`);

    // Convert to Article format and process with scoring
    const articlesForScoring = filteredArticles.map((article, index) => ({
      id: `article-${index}-${Date.now()}`,
      title: article.title,
      link: article.link,
      description: article.description,
      pubDate: article.pubDate,
      source: article.source,
      sourceUrl: article.sourceUrl,
      category: 'general' as const,
      score: 0,
      tier: 'low' as const,
      keywords: [] as string[],
    }));

    // Score and sort articles
    const processedArticles = processArticles(articlesForScoring);

    return NextResponse.json({
      articles: processedArticles,
      meta: {
        totalFetched: allArticles.length,
        afterTimeFilter: filteredArticles.length,
        processed: processedArticles.length,
        hoursFilter,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Briefing API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefing', details: String(error) },
      { status: 500 }
    );
  }
}
