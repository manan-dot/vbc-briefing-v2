import { RSSFeed, Category } from '@/types';

/**
 * RSS Feed Configuration for VBC Briefing
 *
 * To add a new feed:
 * 1. Add an entry to the RSS_FEEDS array below
 * 2. Set the appropriate category and source multiplier
 *
 * Categories:
 * - quality-measures: HEDIS, Stars, HCC/RAF, care gaps
 * - ai-tech: AI, LLMs, healthcare technology
 * - regulatory-policy: CMS rules, legislation, policy
 * - patient-engagement: Outreach, adherence, SDOH
 * - payment-innovation: APMs, bundled payments, capitation
 * - payer-provider: MA plans, network changes
 * - aco-programs: ACO REACH, MSSP
 * - general: General healthcare news
 *
 * Multipliers (based on source credibility):
 * - 1.5: Official government sources (CMS)
 * - 1.4: Academic/rigorous (Health Affairs)
 * - 1.3: Deep policy analysis (KFF)
 * - 1.25: Quality-focused (AJMC)
 * - 1.2: VBC-specific (HCPLAN)
 * - 1.15: Strategic/mainstream (Advisory Board, WSJ, NYT)
 * - 1.1: Industry coverage (Modern Healthcare, HFN)
 * - 1.0: High volume/variable (Becker's)
 */

export const RSS_FEEDS: RSSFeed[] = [
  // Tier 1: Government & Policy Sources
  {
    name: 'CMS Newsroom',
    url: 'https://www.cms.gov/newsroom/rss',
    category: 'regulatory-policy',
    multiplier: 1.5,
  },

  // Tier 2: Academic & Deep Analysis
  {
    name: 'Health Affairs',
    url: 'https://www.healthaffairs.org/action/showFeed?type=etoc&feed=rss&jc=hlthaff',
    category: 'regulatory-policy',
    multiplier: 1.4,
  },
  {
    name: 'KFF Health News',
    url: 'https://kffhealthnews.org/feed/',
    category: 'regulatory-policy',
    multiplier: 1.3,
  },

  // Tier 3: Quality & Managed Care Focus
  {
    name: 'AJMC',
    url: 'https://www.ajmc.com/feed',
    category: 'quality-measures',
    multiplier: 1.25,
  },
  {
    name: 'HCPLAN',
    url: 'https://hcp-lan.org/feed/',
    category: 'payment-innovation',
    multiplier: 1.2,
  },

  // Tier 4: Industry Coverage
  {
    name: 'Modern Healthcare',
    url: 'https://www.modernhealthcare.com/feed',
    category: 'general',
    multiplier: 1.1,
  },
  {
    name: 'Healthcare Finance News',
    url: 'https://www.healthcarefinancenews.com/feed',
    category: 'payment-innovation',
    multiplier: 1.1,
  },
  {
    name: 'Advisory Board',
    url: 'https://www.advisory.com/feed',
    category: 'general',
    multiplier: 1.15,
  },

  // Tier 5: High Volume Sources
  {
    name: "Becker's Hospital Review",
    url: 'https://www.beckershospitalreview.com/feed.xml',
    category: 'general',
    multiplier: 1.0,
  },

  // Tier 6: Mainstream Media Health Sections
  {
    name: 'WSJ Health',
    url: 'https://feeds.content.dowjones.io/public/rss/WSJ_Health',
    category: 'general',
    multiplier: 1.15,
  },
];

// Fallback sample data for when RSS feeds fail
export const SAMPLE_ARTICLES = [
  {
    title: 'CMS Releases Updated HEDIS Measures for 2026 Medicare Advantage Quality Ratings',
    link: 'https://cms.gov/example-hedis-2026',
    description: 'The Centers for Medicare & Medicaid Services announced updated HEDIS quality measures that will impact Star ratings for Medicare Advantage plans. The changes emphasize care gap closure and patient engagement metrics.',
    pubDate: new Date().toISOString(),
    source: 'CMS Newsroom',
    sourceUrl: 'https://cms.gov',
  },
  {
    title: 'Health Systems Increasingly Turn to Conversational AI for Patient Outreach',
    link: 'https://healthaffairs.org/example-ai-outreach',
    description: 'A new study in Health Affairs examines how health systems are deploying AI-powered chatbots and voice assistants to improve medication adherence and close care gaps in value-based care arrangements.',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source: 'Health Affairs',
    sourceUrl: 'https://healthaffairs.org',
  },
  {
    title: 'CareAllies Expands Value-Based Care Programs in Texas',
    link: 'https://example.com/careallies-expansion',
    description: 'CareAllies, a Cigna company, announced expansion of its value-based care enablement programs, focusing on quality measure improvement and risk adjustment accuracy.',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source: 'Modern Healthcare',
    sourceUrl: 'https://modernhealthcare.com',
  },
  {
    title: 'Abridge Raises Series C to Expand AI Medical Documentation',
    link: 'https://example.com/abridge-funding',
    description: 'Healthcare AI company Abridge has secured additional funding to expand its ambient AI documentation technology to more health systems, competing in the growing healthcare LLM market.',
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source: "Becker's Hospital Review",
    sourceUrl: 'https://beckershospitalreview.com',
  },
  {
    title: 'New CMS Final Rule Updates Medicare Part D Requirements',
    link: 'https://cms.gov/example-part-d',
    description: 'CMS published a final rule updating Medicare Part D requirements for 2026, including new medication adherence metrics and formulary transparency requirements affecting MA-PD plans.',
    pubDate: new Date(Date.now() - 14400000).toISOString(),
    source: 'CMS Newsroom',
    sourceUrl: 'https://cms.gov',
  },
];

export default RSS_FEEDS;
