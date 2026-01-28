import { Article, Category, PriorityTier, ScoringResult } from '@/types';

// Topic Priority Scores (based on Pear's priorities: 1-5 scale mapped to base points)
const TOPIC_BASE_SCORES: Record<Category, number> = {
  'quality-measures': 90,      // Priority 5
  'ai-tech': 90,               // Priority 5
  'regulatory-policy': 90,     // Priority 5
  'patient-engagement': 90,    // Priority 5
  'payment-innovation': 50,    // Priority 2
  'payer-provider': 50,        // Priority 2
  'aco-programs': 30,          // Priority 1
  'general': 20,
};

// Keyword triggers with bonus points
const KEYWORD_BONUSES: { keywords: string[]; bonus: number; category?: Category }[] = [
  // Quality/Coding (+15)
  {
    keywords: ['hcc', 'raf', 'risk adjustment', 'hierarchical condition', 'hedis', 'stars rating',
               'star rating', 'quality measure', 'awv', 'annual wellness', 'care gap', 'care gaps',
               'chronic care management', 'ccm', 'tcm', 'transitional care', 'coding accuracy',
               'quality score', 'quality bonus'],
    bonus: 15,
    category: 'quality-measures'
  },
  // AI/Tech (+15)
  {
    keywords: ['llm', 'gpt', 'large language model', 'conversational ai', 'ambient ai', 'voice ai',
               'healthcare chatbot', 'chatbot', 'automation', 'machine learning', 'artificial intelligence',
               'ai-powered', 'ai powered', 'generative ai', 'natural language'],
    bonus: 15,
    category: 'ai-tech'
  },
  // Patient Engagement (+15)
  {
    keywords: ['outreach', 'patient activation', 'medication adherence', 'med adherence',
               'appointment reminder', 'sdoh', 'social determinants', 'health equity',
               'no-show', 'no show', 'engagement rate', 'health literacy', 'patient engagement',
               'patient communication', 'care coordination'],
    bonus: 15,
    category: 'patient-engagement'
  },
  // Regulatory (+15)
  {
    keywords: ['cms final rule', 'proposed rule', 'medicare advantage', 'part d', 'legislative',
               'regulation', 'policy change', 'cms announcement', 'federal register', 'hhs'],
    bonus: 15,
    category: 'regulatory-policy'
  },
  // Pear Partners (+25) - Maximum relevance
  {
    keywords: ['careallies', 'care allies', 'wellmed', 'well med', 'memorial hermann'],
    bonus: 25
  },
  // Competitors (+20)
  {
    keywords: ['abridge', 'nabla', 'hippocratic', 'hippocratic ai'],
    bonus: 20,
    category: 'ai-tech'
  },
  // Medicare Part D / Adherence (+10)
  {
    keywords: ['part d', 'prescription adherence', 'formulary', 'medication therapy'],
    bonus: 10
  },
  // Payment Innovation
  {
    keywords: ['capitation', 'shared savings', 'bundled payment', 'value-based payment',
               'alternative payment', 'apm', 'total cost of care'],
    bonus: 10,
    category: 'payment-innovation'
  },
  // ACO Programs
  {
    keywords: ['aco reach', 'mssp', 'direct contracting', 'accountable care'],
    bonus: 5,
    category: 'aco-programs'
  }
];

// Source multipliers
const SOURCE_MULTIPLIERS: Record<string, number> = {
  'CMS Newsroom': 1.5,
  'Health Affairs': 1.4,
  'KFF Health News': 1.3,
  'AJMC': 1.25,
  'HCPLAN': 1.2,
  'Advisory Board': 1.15,
  'WSJ Health': 1.15,
  'NY Times Health': 1.15,
  'Healthcare Finance News': 1.1,
  'Modern Healthcare': 1.1,
  'Becker\'s Hospital Review': 1.0,
};

// Negative keywords with penalties
const NEGATIVE_KEYWORDS: { keywords: string[]; penalty: number; exceptions?: string[] }[] = [
  {
    keywords: ['merger', 'acquisition', 'm&a', 'acquires', 'acquired', 'merge'],
    penalty: 30,
    exceptions: ['value-based', 'vbc', 'aco', 'quality']
  },
  {
    keywords: ['drug price', 'pharma pricing', 'drug cost', 'pharmaceutical price'],
    penalty: 25,
    exceptions: ['part d', 'adherence', 'medicare', 'formulary']
  },
  {
    keywords: ['international', 'global health', 'uk health', 'nhs', 'european', 'canada health'],
    penalty: 35,
    exceptions: ['pear', 'careallies', 'wellmed', 'memorial hermann']
  },
  {
    keywords: ['staffing', 'workforce', 'nursing shortage', 'nurse strike', 'labor'],
    penalty: 25,
    exceptions: ['ai', 'automation', 'technology', 'chatbot']
  },
  {
    keywords: ['hospital earnings', 'quarterly results', 'stock price', 'ipo'],
    penalty: 20,
    exceptions: ['value-based', 'quality']
  }
];

// Calculate recency factor
function getRecencyMultiplier(pubDate: string, source: string): number {
  const now = new Date();
  const published = new Date(pubDate);
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  // Health Affairs gets slower decay (minimum 0.8x even at 7 days)
  const isHealthAffairs = source.toLowerCase().includes('health affairs');
  const minMultiplier = isHealthAffairs ? 0.8 : 0.5;

  if (hoursAgo < 6) return 1.3;
  if (hoursAgo < 12) return 1.2;
  if (hoursAgo < 24) return 1.1;
  if (hoursAgo < 48) return 1.0;
  if (hoursAgo < 72) return Math.max(0.9, minMultiplier);
  if (hoursAgo < 120) return Math.max(0.8, minMultiplier);
  if (hoursAgo < 168) return Math.max(0.7, minMultiplier);
  return minMultiplier;
}

// Detect category from content
function detectCategory(title: string, description: string): Category {
  const content = `${title} ${description}`.toLowerCase();

  // Check each keyword group and find best match
  const categoryScores: Record<Category, number> = {
    'quality-measures': 0,
    'ai-tech': 0,
    'regulatory-policy': 0,
    'patient-engagement': 0,
    'payment-innovation': 0,
    'payer-provider': 0,
    'aco-programs': 0,
    'general': 0,
  };

  for (const group of KEYWORD_BONUSES) {
    if (group.category) {
      for (const keyword of group.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          categoryScores[group.category] += group.bonus;
        }
      }
    }
  }

  // Find category with highest score
  let maxScore = 0;
  let bestCategory: Category = 'general';

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as Category;
    }
  }

  return bestCategory;
}

// Calculate negative penalty
function calculatePenalty(content: string): number {
  const lowerContent = content.toLowerCase();
  let totalPenalty = 0;

  for (const neg of NEGATIVE_KEYWORDS) {
    const hasNegative = neg.keywords.some(kw => lowerContent.includes(kw.toLowerCase()));
    if (hasNegative) {
      // Check for exceptions
      const hasException = neg.exceptions?.some(exc => lowerContent.includes(exc.toLowerCase()));
      if (!hasException) {
        totalPenalty += neg.penalty;
      }
    }
  }

  return totalPenalty;
}

// Main scoring function
export function scoreArticle(
  title: string,
  description: string,
  source: string,
  pubDate: string
): ScoringResult {
  const content = `${title} ${description}`.toLowerCase();
  const matchedKeywords: string[] = [];

  // 1. Detect category
  const category = detectCategory(title, description);

  // 2. Get base score from topic priority
  let score = TOPIC_BASE_SCORES[category];

  // 3. Add keyword bonuses (capped at +30 total)
  let keywordBonus = 0;
  for (const group of KEYWORD_BONUSES) {
    for (const keyword of group.keywords) {
      if (content.includes(keyword.toLowerCase())) {
        keywordBonus += group.bonus;
        matchedKeywords.push(keyword);
      }
    }
  }
  score += Math.min(keywordBonus, 30); // Cap at +30

  // 4. Apply source multiplier
  const sourceMultiplier = SOURCE_MULTIPLIERS[source] || 1.0;
  score *= sourceMultiplier;

  // 5. Apply recency factor
  const recencyMultiplier = getRecencyMultiplier(pubDate, source);
  score *= recencyMultiplier;

  // 6. Subtract penalties
  const penalty = calculatePenalty(content);
  score -= penalty;

  // 7. Ensure minimum score of 0
  score = Math.max(0, Math.round(score));

  // 8. Determine tier
  let tier: PriorityTier;
  if (score >= 75) {
    tier = 'high';
  } else if (score >= 45) {
    tier = 'medium';
  } else {
    tier = 'low';
  }

  return {
    score,
    tier,
    category,
    matchedKeywords: [...new Set(matchedKeywords)] // Remove duplicates
  };
}

// Process and sort articles
export function processArticles(rawArticles: any[]): Article[] {
  const processed = rawArticles.map((article, index) => {
    const result = scoreArticle(
      article.title || '',
      article.description || '',
      article.source || '',
      article.pubDate || new Date().toISOString()
    );

    return {
      id: `${article.source}-${index}-${Date.now()}`,
      title: article.title || 'Untitled',
      link: article.link || '#',
      description: article.description || '',
      pubDate: article.pubDate || new Date().toISOString(),
      source: article.source || 'Unknown',
      sourceUrl: article.sourceUrl || '',
      category: result.category,
      score: result.score,
      tier: result.tier,
      keywords: result.matchedKeywords,
    };
  });

  // Sort by score (highest first)
  return processed.sort((a, b) => b.score - a.score);
}

// Filter articles by time range
export function filterByTimeRange(articles: Article[], hours: number): Article[] {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  return articles.filter(article => {
    const pubDate = new Date(article.pubDate);
    return pubDate >= cutoff;
  });
}

// Get top N articles for email digest
export function getTopArticles(articles: Article[], count: number = 3): Article[] {
  return articles
    .filter(a => a.tier === 'high' || a.tier === 'medium')
    .slice(0, count);
}
