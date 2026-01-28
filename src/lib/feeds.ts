export interface FeedConfig {
  name: string;
  url: string;
  category: string;
}

export const RSS_FEEDS: FeedConfig[] = [
  // Government & Policy
  {
    name: 'CMS Blog',
    url: 'https://www.cms.gov/blog/rss',
    category: 'policy-regulatory',
  },
  {
    name: 'HHS News',
    url: 'https://www.hhs.gov/rss/news.xml',
    category: 'policy-regulatory',
  },

  // Premier Healthcare Publications
  {
    name: 'Health Affairs',
    url: 'https://www.healthaffairs.org/action/showFeed?type=etoc&feed=rss&jc=hlthaff',
    category: 'policy-regulatory',
  },
  {
    name: 'NEJM',
    url: 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss',
    category: 'quality-outcomes',
  },

  // Healthcare News
  {
    name: 'Modern Healthcare',
    url: 'https://www.modernhealthcare.com/rss',
    category: 'operations',
  },
  {
    name: 'Fierce Healthcare',
    url: 'https://www.fiercehealthcare.com/rss/xml',
    category: 'operations',
  },
  {
    name: 'Healthcare Dive',
    url: 'https://www.healthcaredive.com/feeds/news/',
    category: 'operations',
  },
  {
    name: 'Beckers Hospital Review',
    url: 'https://www.beckershospitalreview.com/rss/rss.html',
    category: 'operations',
  },

  // Technology & Innovation
  {
    name: 'Healthcare IT News',
    url: 'https://www.healthcareitnews.com/rss',
    category: 'ai-technology',
  },
  {
    name: 'MobiHealthNews',
    url: 'https://www.mobihealthnews.com/rss',
    category: 'ai-technology',
  },
  {
    name: 'STAT News - Health Tech',
    url: 'https://www.statnews.com/category/health-tech/feed/',
    category: 'ai-technology',
  },

  // Value-Based Care Specific
  {
    name: 'HCPLAN',
    url: 'https://hcp-lan.org/feed/',
    category: 'payment-models',
  },
  {
    name: 'NAACOS',
    url: 'https://www.naacos.com/feed',
    category: 'payment-models',
  },

  // Quality & Outcomes
  {
    name: 'AHRQ News',
    url: 'https://www.ahrq.gov/rss/news.xml',
    category: 'quality-outcomes',
  },
  {
    name: 'NCQA Blog',
    url: 'https://www.ncqa.org/blog/feed/',
    category: 'quality-outcomes',
  },

  // Research & Think Tanks
  {
    name: 'KFF',
    url: 'https://www.kff.org/feed/',
    category: 'policy-regulatory',
  },
  {
    name: 'Commonwealth Fund',
    url: 'https://www.commonwealthfund.org/rss',
    category: 'policy-regulatory',
  },

  // Medicare/Medicaid Specific
  {
    name: 'Medicare Blog',
    url: 'https://blog.medicare.gov/feed/',
    category: 'policy-regulatory',
  },
];

// Get feeds by category
export function getFeedsByCategory(category: string): FeedConfig[] {
  return RSS_FEEDS.filter((feed) => feed.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return [...new Set(RSS_FEEDS.map((feed) => feed.category))];
}
