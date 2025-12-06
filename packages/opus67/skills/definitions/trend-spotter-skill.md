# Trend Spotter
> **ID:** `trend-spotter-skill` | **Tier:** 2 | **Token Cost:** 6000 | **MCP:** tavily, santiment

## What This Skill Does

Master trend detection and analysis across technology, social media, and market narratives. Build systematic workflows for identifying emerging opportunities, tracking narrative shifts, and monitoring industry patterns using AI-powered research tools.

## When to Use

- Identifying emerging technology trends
- Tracking social media sentiment and viral topics
- Detecting industry pattern shifts
- Monitoring narrative changes in markets
- Spotting early-stage opportunities
- Competitive intelligence gathering

## Core Capabilities

### 1. Emerging Tech Trends

#### Technology Trend Detection

```typescript
// lib/trends/tech-trends.ts
interface TechTrend {
  name: string;
  category: string;
  maturityStage: 'emerging' | 'growing' | 'mainstream' | 'declining';
  signals: TrendSignal[];
  score: number;
  trajectory: 'accelerating' | 'stable' | 'slowing';
  relatedTechnologies: string[];
  keyPlayers: string[];
  adoptionMetrics: {
    githubStars?: number;
    npmDownloads?: number;
    googleTrends?: number;
    hackerNewsScore?: number;
  };
}

interface TrendSignal {
  source: string;
  type: 'mention' | 'funding' | 'release' | 'hiring' | 'acquisition';
  date: string;
  content: string;
  weight: number;
}

// Aggregate signals from multiple sources
async function detectTechTrends(
  category: string,
  timeframe: '7d' | '30d' | '90d'
): Promise<TechTrend[]> {
  const signals = await Promise.all([
    fetchGitHubTrends(category, timeframe),
    fetchHackerNewsTrends(category, timeframe),
    fetchVCFunding(category, timeframe),
    fetchJobPostings(category, timeframe),
    fetchProductHuntLaunches(category, timeframe),
  ]);

  const allSignals = signals.flat();

  // Group signals by technology
  const grouped = groupSignalsByTech(allSignals);

  // Score and rank trends
  const trends = Object.entries(grouped).map(([name, techSignals]) => ({
    name,
    category,
    maturityStage: determineMaturity(techSignals),
    signals: techSignals,
    score: calculateTrendScore(techSignals),
    trajectory: calculateTrajectory(techSignals, timeframe),
    relatedTechnologies: findRelatedTech(name, allSignals),
    keyPlayers: identifyKeyPlayers(techSignals),
    adoptionMetrics: {},
  }));

  return trends.sort((a, b) => b.score - a.score);
}

// GitHub trending analysis
async function fetchGitHubTrends(
  category: string,
  timeframe: string
): Promise<TrendSignal[]> {
  const since = timeframe === '7d' ? 'weekly' : 'monthly';
  const url = `https://api.github.com/search/repositories?q=${category}&sort=stars&order=desc`;

  const response = await fetch(url, {
    headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
  });
  const data = await response.json();

  return data.items.slice(0, 20).map((repo: any) => ({
    source: 'github',
    type: 'mention' as const,
    date: repo.created_at,
    content: `${repo.full_name}: ${repo.description} (${repo.stargazers_count} stars)`,
    weight: Math.log10(repo.stargazers_count + 1),
  }));
}

// Hacker News trends
async function fetchHackerNewsTrends(
  category: string,
  timeframe: string
): Promise<TrendSignal[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${category}&tags=story&hitsPerPage=50`;
  const response = await fetch(url);
  const data = await response.json();

  return data.hits.map((hit: any) => ({
    source: 'hackernews',
    type: 'mention' as const,
    date: new Date(hit.created_at_i * 1000).toISOString(),
    content: hit.title,
    weight: Math.log10(hit.points + 1),
  }));
}

function calculateTrendScore(signals: TrendSignal[]): number {
  const recencyWeight = 2;
  const now = Date.now();

  return signals.reduce((score, signal) => {
    const age = (now - new Date(signal.date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.exp(-age / 30) * recencyWeight;
    return score + signal.weight * recencyFactor;
  }, 0);
}

function determineMaturity(signals: TrendSignal[]): TechTrend['maturityStage'] {
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const fundingSignals = signals.filter((s) => s.type === 'funding').length;
  const hiringSignals = signals.filter((s) => s.type === 'hiring').length;

  if (fundingSignals > 5 && hiringSignals > 10) return 'growing';
  if (totalWeight > 100) return 'mainstream';
  if (fundingSignals > 0 || signals.length > 10) return 'emerging';
  return 'declining';
}
```

### 2. Social Media Trends

#### Social Sentiment Analysis

```typescript
// lib/trends/social-trends.ts
interface SocialTrend {
  topic: string;
  platform: 'twitter' | 'reddit' | 'tiktok' | 'youtube';
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  volume: number;
  velocity: number; // growth rate
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  influencers: Array<{ handle: string; followers: number; impact: number }>;
  peakTime?: string;
  hashtags: string[];
  relatedTopics: string[];
}

async function trackSocialTrends(
  topic: string,
  platforms: SocialTrend['platform'][]
): Promise<SocialTrend[]> {
  const results = await Promise.all(
    platforms.map((platform) => analyzePlatform(topic, platform))
  );

  return results;
}

async function analyzePlatform(
  topic: string,
  platform: SocialTrend['platform']
): Promise<SocialTrend> {
  switch (platform) {
    case 'twitter':
      return analyzeTwitterTrend(topic);
    case 'reddit':
      return analyzeRedditTrend(topic);
    default:
      throw new Error(`Platform ${platform} not supported`);
  }
}

async function analyzeRedditTrend(topic: string): Promise<SocialTrend> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&sort=hot&limit=100`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'TrendSpotter/1.0' },
  });
  const data = await response.json();

  const posts = data.data.children.map((c: any) => c.data);

  const totalScore = posts.reduce((sum: number, p: any) => sum + p.score, 0);
  const totalComments = posts.reduce((sum: number, p: any) => sum + p.num_comments, 0);

  // Analyze sentiment from titles and comments
  const sentiment = await analyzeSentiment(posts.map((p: any) => p.title).join('\n'));

  // Find related subreddits
  const subreddits = [...new Set(posts.map((p: any) => p.subreddit))];

  return {
    topic,
    platform: 'reddit',
    sentiment,
    volume: posts.length,
    velocity: calculateVelocity(posts),
    engagement: {
      likes: totalScore,
      shares: 0,
      comments: totalComments,
    },
    influencers: [],
    hashtags: [],
    relatedTopics: subreddits.slice(0, 5),
  };
}

async function analyzeSentiment(
  text: string
): Promise<SocialTrend['sentiment']> {
  const prompt = `
    Analyze the overall sentiment of these social media posts:

    ${text.substring(0, 3000)}

    Return only one word: positive, negative, neutral, or mixed
  `;

  const response = await callAI(prompt);
  return response.toLowerCase().trim() as SocialTrend['sentiment'];
}

function calculateVelocity(posts: any[]): number {
  if (posts.length < 2) return 0;

  const now = Date.now() / 1000;
  const recentPosts = posts.filter((p) => now - p.created_utc < 3600).length;
  const olderPosts = posts.filter(
    (p) => now - p.created_utc >= 3600 && now - p.created_utc < 7200
  ).length;

  return olderPosts > 0 ? recentPosts / olderPosts : recentPosts;
}
```

#### Viral Content Detection

```typescript
// lib/trends/viral-detection.ts
interface ViralContent {
  url: string;
  title: string;
  platform: string;
  viralScore: number;
  spreadMetrics: {
    initialVelocity: number;
    peakVelocity: number;
    sustainedEngagement: boolean;
    crossPlatformSpread: boolean;
  };
  contentType: 'news' | 'meme' | 'opinion' | 'product' | 'event';
  estimatedReach: number;
  timeline: Array<{ time: string; metric: number }>;
}

async function detectViralContent(
  topic: string,
  threshold: number = 0.7
): Promise<ViralContent[]> {
  // Search across platforms
  const [reddit, hn, twitter] = await Promise.all([
    searchReddit(topic),
    searchHackerNews(topic),
    searchTwitter(topic),
  ]);

  const allContent = [...reddit, ...hn, ...twitter];

  // Calculate viral scores
  const scored = allContent.map((content) => ({
    ...content,
    viralScore: calculateViralScore(content),
  }));

  // Filter by threshold
  return scored
    .filter((c) => c.viralScore >= threshold)
    .sort((a, b) => b.viralScore - a.viralScore);
}

function calculateViralScore(content: any): number {
  const factors = {
    engagement: Math.min(content.engagement / 10000, 1) * 0.3,
    velocity: Math.min(content.velocity / 100, 1) * 0.3,
    crossPlatform: content.crossPlatformSpread ? 0.2 : 0,
    influencerShare: content.influencerShare ? 0.2 : 0,
  };

  return Object.values(factors).reduce((sum, val) => sum + val, 0);
}
```

### 3. Industry Pattern Detection

#### Market Intelligence

```typescript
// lib/trends/industry-patterns.ts
interface IndustryPattern {
  industry: string;
  pattern: string;
  confidence: number;
  signals: Array<{
    type: 'acquisition' | 'funding' | 'partnership' | 'pivot' | 'layoff';
    company: string;
    date: string;
    details: string;
  }>;
  implications: string[];
  timeline: 'immediate' | 'short-term' | 'long-term';
  affectedCompanies: string[];
}

async function detectIndustryPatterns(industry: string): Promise<IndustryPattern[]> {
  // Gather signals from multiple sources
  const signals = await Promise.all([
    fetchCrunchbaseData(industry),
    fetchNewsSignals(industry),
    fetchSECFilings(industry),
    fetchJobMarketSignals(industry),
  ]);

  const allSignals = signals.flat();

  // Use AI to identify patterns
  const patterns = await identifyPatterns(allSignals, industry);

  return patterns;
}

async function identifyPatterns(
  signals: any[],
  industry: string
): Promise<IndustryPattern[]> {
  const prompt = `
    Analyze these industry signals for ${industry}:

    ${JSON.stringify(signals.slice(0, 50), null, 2)}

    Identify 3-5 emerging patterns in this industry. For each pattern:
    1. Name the pattern (e.g., "Consolidation Wave", "AI Pivot", "Market Expansion")
    2. List supporting signals
    3. Describe implications
    4. Estimate timeline (immediate/short-term/long-term)
    5. Rate confidence (0-1)

    Return as JSON array of IndustryPattern objects.
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

async function fetchCrunchbaseData(industry: string) {
  // Fetch recent funding, acquisitions, IPOs
  const url = `https://api.crunchbase.com/v3/organizations?categories=${industry}&sort=-funding_total`;

  const response = await fetch(url, {
    headers: { 'User-Key': process.env.CRUNCHBASE_KEY || '' },
  });

  return response.json();
}

async function fetchJobMarketSignals(industry: string) {
  // Analyze job posting trends for skills/roles
  // This would integrate with LinkedIn, Indeed APIs
  return [];
}
```

### 4. Narrative Tracking

#### Narrative Analysis

```typescript
// lib/trends/narrative.ts
interface Narrative {
  id: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  lifecycle: 'emerging' | 'growing' | 'peak' | 'fading';
  sources: Array<{
    url: string;
    title: string;
    date: string;
    influence: number;
  }>;
  keyPhrases: string[];
  counterNarratives: string[];
  marketImpact?: {
    sectors: string[];
    direction: 'positive' | 'negative' | 'mixed';
  };
}

interface NarrativeTracker {
  narratives: Narrative[];
  trends: Array<{ date: string; narrative: string; strength: number }>;
}

async function trackNarratives(
  topics: string[],
  timeframe: '24h' | '7d' | '30d'
): Promise<NarrativeTracker> {
  // Gather content from multiple sources
  const content = await Promise.all([
    fetchNewsContent(topics, timeframe),
    fetchSocialContent(topics, timeframe),
    fetchBlogContent(topics, timeframe),
  ]);

  const allContent = content.flat();

  // Extract narratives using AI
  const narratives = await extractNarratives(allContent);

  // Track strength over time
  const trends = await trackNarrativeStrength(narratives, timeframe);

  return { narratives, trends };
}

async function extractNarratives(content: any[]): Promise<Narrative[]> {
  const prompt = `
    Analyze this content and identify distinct narratives being discussed:

    ${content.slice(0, 30).map((c) => c.title + ': ' + c.summary).join('\n')}

    For each narrative:
    1. Give it a clear title
    2. Summarize in 1-2 sentences
    3. Determine sentiment (bullish/bearish/neutral)
    4. Extract key phrases
    5. Identify counter-narratives

    Return as JSON array.
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

async function detectNarrativeShifts(
  tracker: NarrativeTracker,
  previousTracker: NarrativeTracker
): Promise<Array<{ narrative: string; shift: string; significance: number }>> {
  const shifts = [];

  for (const current of tracker.narratives) {
    const previous = previousTracker.narratives.find((n) => n.id === current.id);

    if (!previous) {
      shifts.push({
        narrative: current.title,
        shift: 'New narrative emerged',
        significance: current.strength,
      });
      continue;
    }

    if (current.sentiment !== previous.sentiment) {
      shifts.push({
        narrative: current.title,
        shift: `Sentiment shifted from ${previous.sentiment} to ${current.sentiment}`,
        significance: Math.abs(current.strength - previous.strength),
      });
    }

    if (current.lifecycle !== previous.lifecycle) {
      shifts.push({
        narrative: current.title,
        shift: `Lifecycle moved from ${previous.lifecycle} to ${current.lifecycle}`,
        significance: 0.5,
      });
    }
  }

  return shifts.sort((a, b) => b.significance - a.significance);
}
```

## Real-World Examples

### Example 1: Tech Trend Dashboard

```typescript
// app/api/trends/tech/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { detectTechTrends } from '@/lib/trends/tech-trends';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'AI';
  const timeframe = searchParams.get('timeframe') as '7d' | '30d' | '90d' || '30d';

  const trends = await detectTechTrends(category, timeframe);

  return NextResponse.json({
    category,
    timeframe,
    trends: trends.slice(0, 20),
    summary: {
      totalTrends: trends.length,
      emergingCount: trends.filter((t) => t.maturityStage === 'emerging').length,
      growingCount: trends.filter((t) => t.maturityStage === 'growing').length,
      accelerating: trends.filter((t) => t.trajectory === 'accelerating').length,
    },
    updatedAt: new Date().toISOString(),
  });
}
```

### Example 2: Narrative Alert System

```typescript
// lib/trends/alerts.ts
async function setupNarrativeAlerts(config: {
  topics: string[];
  alertThreshold: number;
  webhookUrl: string;
}) {
  const check = async () => {
    const tracker = await trackNarratives(config.topics, '24h');

    const significantChanges = tracker.narratives.filter(
      (n) => n.strength > config.alertThreshold
    );

    if (significantChanges.length > 0) {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'narrative_alert',
          narratives: significantChanges,
          timestamp: new Date().toISOString(),
        }),
      });
    }
  };

  // Run every hour
  setInterval(check, 60 * 60 * 1000);
  check(); // Initial check
}
```

## Related Skills

- **academic-researcher** - Deep research
- **web-search** - Content discovery
- **patent-analyzer** - IP trends
- **content-writer** - Trend reports

## Further Reading

- [Google Trends](https://trends.google.com/)
- [Product Hunt](https://www.producthunt.com/)
- [Hacker News API](https://hn.algolia.com/api)
- [Reddit API](https://www.reddit.com/dev/api/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
