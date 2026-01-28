# VBC Briefing v2

Value-Based Care news aggregator for Pear Health employees.

## Features

- **Multi-select articles** with checkboxes → bulk copy (Title + Link + Summary)
- **Password protection** (honor system, @pearwith.us)
- **Category tabs** (Quality, AI/Tech, Policy, Engagement, Payment, Payer, ACO, General)
- **Relevance tiers** (🔴 High Priority, 🟡 Medium, 🟢 Low)
- **Two pages**: Today (24 hours) + Archive (older articles)
- **Daily email digest** at 6 AM ET with Top 3 articles
- **Pear-specific ranking** (prioritizes partners, competitors, relevant keywords)

## RSS Sources (10)

1. CMS Newsroom (1.5x multiplier)
2. Health Affairs (1.4x)
3. KFF Health News (1.3x)
4. AJMC (1.25x)
5. HCPLAN (1.2x)
6. Advisory Board (1.15x)
7. WSJ Health (1.15x)
8. Healthcare Finance News (1.1x)
9. Modern Healthcare (1.1x)
10. Becker's Hospital Review (1.0x)

## Ranking Engine

Articles are scored based on:

- **Topic priority** (Quality/AI/Policy/Engagement = highest; ACO = lowest)
- **Source credibility** (CMS/Health Affairs boosted; Becker's neutral)
- **Keyword matches** (Pear partners +25, competitors +20, VBC terms +15)
- **Recency** (newer = higher score, Health Affairs gets slower decay)
- **Negative penalties** (M&A, pharma pricing, international news deprioritized)

## Setup

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure email (optional):
   - Sign up at [Resend](https://resend.com)
   - Add `RESEND_API_KEY` to `.env.local`
   - Add team emails to `src/app/api/digest/route.ts`

4. Run development server:
   ```bash
   npm run dev
   ```

5. Deploy to Vercel:
   ```bash
   vercel
   ```

## Configuration

### Adding RSS Feeds

Edit `src/lib/rss-feeds.ts`:

```typescript
{
  name: 'New Source',
  url: 'https://example.com/rss',
  category: 'quality-measures',
  multiplier: 1.2,
}
```

### Adjusting Scoring

Edit `src/lib/scoring.ts`:

- `TOPIC_BASE_SCORES` - Base points per category
- `KEYWORD_BONUSES` - Keywords and their bonus points
- `SOURCE_MULTIPLIERS` - Source credibility weights
- `NEGATIVE_KEYWORDS` - Terms to deprioritize

## Daily Digest

The email digest runs via Vercel Cron at 6 AM ET (11:00 UTC).

To test manually:
```bash
curl https://your-app.vercel.app/api/digest
```

## Tech Stack

- Next.js 14.2.28
- React 18
- TypeScript
- Tailwind CSS
- Resend (email)
- Vercel (hosting + cron)
