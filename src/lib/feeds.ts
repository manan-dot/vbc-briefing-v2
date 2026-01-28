export interface FeedConfig {
  name: string;
  url: string;
  category: string;
}

export const RSS_FEEDS: FeedConfig[] = [
  // Healthcare Publications - Verified Working Feeds
  {
    name: 'Health Affairs',
    url: 'https://www.healthaffairs.org/action/showFeed?type=etoc&feed=rss&jc=hlthaff',
    category: 'policy-regulatory',
  },
  {
    name: 'Healthcare Dive',
    url: 'https://www.healthcaredive.com/feeds/news/',
    category: 'general',
  },
  {
    name: 'Fierce Healthcare',
    url: 'https://www.fiercehealthcare.com/rss/xml',
    category: 'general',
  },
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
    category: 'general',
  },
  {
    name: 'Healthcare IT News',
    url: 'https://www.healthcareitnews.com/feed',
    category: 'ai-tech',
  },
  {
    name: 'MobiHealthNews',
    url: 'https://www.mobihealthnews.com/feed',
    category: 'ai-tech',
  },
  {
    name: 'KFF Health News',
    url: 'https://kffhealthnews.org/feed/',
    category: 'policy-regulatory',
  },
  {
    name: 'CMS Blog',
    url: 'https://www.cms.gov/blog/feed',
    category: 'policy-regulatory',
  },
  {
    name: 'Beckers Hospital Review',
    url: 'https://www.beckershospitalreview.com/rss/all-news.html',
    category: 'general',
  },
  {
    name: 'Beckers Payer Issues',
    url: 'https://www.beckershospitalreview.com/rss/payer-issues.html',
    category: 'payer-provider',
  },
  {
    name: 'Beckers Health IT',
    url: 'https://www.beckershospitalreview.com/rss/healthcare-information-technology.html',
    category: 'ai-tech',
  },
  {
    name: 'American Hospital Association News',
    url: 'https://www.aha.org/news/rss',
    category: 'policy-regulatory',
  },
  {
    name: 'Advisory Board',
    url: 'https://www.advisory.com/daily-briefing/rss',
    category: 'general',
  },
  {
    name: 'Modern Healthcare',
    url: 'https://www.modernhealthcare.com/section/rss',
    category: 'general',
  },
  {
    name: 'NEJM - Health Policy',
    url: 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss',
    category: 'quality-outcomes',
  },
  {
    name: 'JAMA Network',
    url: 'https://jamanetwork.com/rss/site_3/67.xml',
    category: 'quality-outcomes',
  },
];

// Get feeds by category
export function getFeedsByCategory(category: string): FeedConfig[] {
  return RSS_FEEDS.filter((feed) => feed.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(RSS_FEEDS.map((feed) => feed.category)));
}
