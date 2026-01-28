export type Category =
  | 'quality-measures'
  | 'ai-tech'
  | 'regulatory-policy'
  | 'patient-engagement'
  | 'payment-innovation'
  | 'payer-provider'
  | 'aco-programs'
  | 'general';

export type PriorityTier = 'high' | 'medium' | 'low';

export interface Article {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
  category: Category;
  score: number;
  tier: PriorityTier;
  keywords: string[];
}

export interface RSSFeed {
  name: string;
  url: string;
  category: Category;
  multiplier: number;
}

export interface ScoringResult {
  score: number;
  tier: PriorityTier;
  category: Category;
  matchedKeywords: string[];
}

export interface BriefingState {
  articles: Article[];
  selectedIds: Set<string>;
  activeCategory: Category | 'all';
  isLoading: boolean;
  lastUpdated: Date | null;
}

export interface EmailDigest {
  topArticles: Article[];
  sentAt: Date;
  recipientCount: number;
}
