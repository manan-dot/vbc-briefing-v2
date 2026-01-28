import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Parser from 'rss-parser';
import { RSS_FEEDS, SAMPLE_ARTICLES } from '@/lib/rss-feeds';
import { processArticles, getTopArticles } from '@/lib/scoring';

// Initialize Resend (you'll need to add RESEND_API_KEY to env)
const resend = new Resend(process.env.RESEND_API_KEY);

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'VBC-Briefing/2.0',
  },
});

// Email recipients (add your team emails here)
const DIGEST_RECIPIENTS = [
  // Add Pear team email addresses here
  // 'team@pearwith.us',
];

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

function generateEmailHTML(topArticles: ReturnType<typeof processArticles>) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const articleHTML = topArticles
    .map((article, index) => {
      const tierEmoji =
        article.tier === 'high' ? '🔴' : article.tier === 'medium' ? '🟡' : '🟢';

      return `
        <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${
          article.tier === 'high' ? '#ef4444' : article.tier === 'medium' ? '#f59e0b' : '#22c55e'
        };">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
            ${tierEmoji} ${article.tier.toUpperCase()} PRIORITY • ${article.source}
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">
            <a href="${article.link}" style="color: #111827; text-decoration: none;">
              ${index + 1}. ${article.title}
            </a>
          </h3>
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
            ${article.description.slice(0, 200)}${article.description.length > 200 ? '...' : ''}
          </p>
          <a href="${article.link}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #059669;">
            Read more →
          </a>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #059669; margin: 0;">🌿 VBC Briefing</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0;">${date}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">
            Today's Top 3 Stories
          </h2>
          ${articleHTML}
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vbc-briefing.vercel.app'}"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Full Briefing
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
            VBC Briefing • Curated for Pear Health
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function GET(request: Request) {
  // Verify cron secret (for Vercel Cron)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all feeds
    const feedPromises = RSS_FEEDS.map(fetchFeed);
    const feedResults = await Promise.allSettled(feedPromises);

    let allArticles: RawArticle[] = [];
    feedResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allArticles = allArticles.concat(result.value);
      }
    });

    if (allArticles.length === 0) {
      allArticles = SAMPLE_ARTICLES;
    }

    // Filter to last 24 hours
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const recentArticles = allArticles.filter((article) => {
      try {
        return new Date(article.pubDate) >= cutoff;
      } catch {
        return true;
      }
    });

    // Process and get top 3
    const processedArticles = processArticles(recentArticles.length > 0 ? recentArticles : allArticles);
    const topArticles = getTopArticles(processedArticles, 3);

    if (topArticles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No articles to send',
      });
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY || DIGEST_RECIPIENTS.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Email not configured. Set RESEND_API_KEY and add recipients.',
        preview: {
          topArticles: topArticles.map((a) => ({
            title: a.title,
            tier: a.tier,
            score: a.score,
          })),
        },
      });
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'VBC Briefing <briefing@pearwith.us>',
      to: DIGEST_RECIPIENTS,
      subject: `🌿 VBC Briefing: ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      html: generateEmailHTML(topArticles),
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      recipientCount: DIGEST_RECIPIENTS.length,
      articlesIncluded: topArticles.length,
    });
  } catch (error) {
    console.error('Digest API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
