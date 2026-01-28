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
  const { searchParams } = new URL(request.url);
  const hoursParam = searchParams.get('hours');
  const hours = hoursParam ? parseInt(hoursParam, 10) : 24;

  try {
    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(fetchFeed);
    const feedResults = await Promise.allSettled(feedPromises);

    // Collect all articles
    let allArticles: RawArticle[] = [];

    feedResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allArticles = allArticles.concat(result.value);
      }
    });

    // If no articles fetched, use sample data
    if (allArticles.length === 0) {
      console.log('No articles fetched, using sample data');
      allArticles = SAMPLE_ARTICLES;
    }

    // Filter by time range
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const recentArticles = allArticles.filter((article) => {
      try {
        const pubDate = new Date(article.pubDate);
        return pubDate >= cutoff;
      } catch {
        return true; // Include if date parsing fails
      }
    });

    // Process and score articles
    const processedArticles = processArticles(
      recentArticles.length > 0 ? recentArticles : allArticles
    );

    return NextResponse.json({
      articles: processedArticles,
      meta: {
        totalFetched: allArticles.length,
        afterTimeFilter: recentArticles.length,
        processed: processedArticles.length,
        hoursFilter: hours,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Briefing API error:', error);

    // Return sample data on error
    const processedSamples = processArticles(SAMPLE_ARTICLES);

    return NextResponse.json({
      articles: processedSamples,
      meta: {
        error: 'Failed to fetch feeds, using sample data',
        totalFetched: SAMPLE_ARTICLES.length,
        processed: processedSamples.length,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
