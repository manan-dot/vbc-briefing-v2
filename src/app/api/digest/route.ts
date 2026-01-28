import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { scoreAndSortArticles } from '@/lib/scoring';
import { fetchAllFeeds } from '@/lib/rss-feeds';
import { ScoredArticle } from '@/types';

// Initialize Resend lazily to avoid build-time errors
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

// Email recipients - add team emails here
const DIGEST_RECIPIENTS: string[] = [
  // 'team@pearhealth.com',
];

// Generate HTML email content
function generateEmailHTML(articles: ScoredArticle[]): string {
  const highPriority = articles.filter(a => a.tier === 'high').slice(0, 5);
  const mediumPriority = articles.filter(a => a.tier === 'medium').slice(0, 5);

  const formatArticle = (article: ScoredArticle) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <a href="${article.link}" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${article.title}
        </a>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          ${article.summary.slice(0, 200)}${article.summary.length > 200 ? '...' : ''}
        </p>
        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
          ${article.source} • Score: ${article.score}
        </p>
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background-color: #059669; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">🍐 VBC Daily Briefing</h1>
          <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <!-- High Priority Section -->
        ${highPriority.length > 0 ? `
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #dc2626; font-size: 18px; display: flex; align-items: center;">
            🔴 High Priority
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${highPriority.map(formatArticle).join('')}
          </table>
        </div>
        ` : ''}

        <!-- Medium Priority Section -->
        ${mediumPriority.length > 0 ? `
        <div style="padding: 24px; background-color: #f9fafb;">
          <h2 style="margin: 0 0 16px 0; color: #d97706; font-size: 18px;">
            🟡 Worth Reading
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${mediumPriority.map(formatArticle).join('')}
          </table>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vbc-briefing-v2.vercel.app'}"
             style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            View All Articles
          </a>
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
            Pear Healthcare VBC Briefing • Curated for value-based care leaders
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

// Generate plain text version
function generateEmailText(articles: ScoredArticle[]): string {
  const highPriority = articles.filter(a => a.tier === 'high').slice(0, 5);
  const mediumPriority = articles.filter(a => a.tier === 'medium').slice(0, 5);

  let text = `🍐 VBC DAILY BRIEFING\n`;
  text += `${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

  if (highPriority.length > 0) {
    text += `🔴 HIGH PRIORITY\n${'='.repeat(40)}\n\n`;
    highPriority.forEach(article => {
      text += `${article.title}\n`;
      text += `${article.link}\n`;
      text += `${article.source} • Score: ${article.score}\n\n`;
    });
  }

  if (mediumPriority.length > 0) {
    text += `🟡 WORTH READING\n${'='.repeat(40)}\n\n`;
    mediumPriority.forEach(article => {
      text += `${article.title}\n`;
      text += `${article.link}\n`;
      text += `${article.source} • Score: ${article.score}\n\n`;
    });
  }

  text += `\nView all articles: ${process.env.NEXT_PUBLIC_APP_URL || 'https://vbc-briefing-v2.vercel.app'}`;

  return text;
}

export async function GET(request: Request) {
  try {
    // Verify cron secret for scheduled runs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow manual triggers without auth in development
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Check if it's a Vercel cron job
      const isVercelCron = request.headers.get('x-vercel-cron');
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Check if Resend is configured
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({
        error: 'Email service not configured',
        message: 'Set RESEND_API_KEY environment variable'
      }, { status: 503 });
    }

    // Check if we have recipients
    if (DIGEST_RECIPIENTS.length === 0) {
      return NextResponse.json({
        error: 'No recipients configured',
        message: 'Add email addresses to DIGEST_RECIPIENTS array'
      }, { status: 400 });
    }

    // Fetch and score articles from last 24 hours
    const rawArticles = await fetchAllFeeds(24);
    const articles = scoreAndSortArticles(rawArticles);

    // Only send if we have high-priority articles
    const highPriorityCount = articles.filter(a => a.tier === 'high').length;
    if (highPriorityCount === 0) {
      return NextResponse.json({
        message: 'No high-priority articles today, skipping digest',
        articlesProcessed: articles.length
      });
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'VBC Briefing <briefing@pearhealth.com>',
      to: DIGEST_RECIPIENTS,
      subject: `🍐 VBC Briefing: ${highPriorityCount} High-Priority Articles`,
      html: generateEmailHTML(articles),
      text: generateEmailText(articles),
    });

    if (error) {
      console.error('Failed to send digest:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      recipientCount: DIGEST_RECIPIENTS.length,
      articlesIncluded: {
        high: highPriorityCount,
        medium: articles.filter(a => a.tier === 'medium').length
      }
    });

  } catch (error) {
    console.error('Digest error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
