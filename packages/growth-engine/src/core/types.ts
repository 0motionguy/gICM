/**
 * gICM Growth Engine Types
 */

// ============================================================================
// CONTENT
// ============================================================================

export type ContentType = "blog" | "tweet" | "thread" | "discord" | "linkedin" | "tutorial" | "docs";
export type ContentStatus = "draft" | "scheduled" | "published" | "failed";

export interface BlogPost {
  id: string;

  // Content
  title: string;
  slug: string;
  excerpt: string;
  content: string;          // Markdown

  // Metadata
  author: string;
  category: BlogCategory;
  tags: string[];

  // SEO
  seo: {
    title: string;          // Meta title
    description: string;    // Meta description
    keywords: string[];
    canonicalUrl?: string;
  };

  // Media
  featuredImage?: string;
  images: string[];

  // Stats
  readingTime: number;      // Minutes
  wordCount: number;

  // Publishing
  status: ContentStatus;
  publishedAt?: number;
  scheduledFor?: number;

  // Performance
  metrics?: ContentMetrics;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

export type BlogCategory =
  | "tutorial"
  | "announcement"
  | "comparison"
  | "guide"
  | "case-study"
  | "thought-leadership"
  | "changelog";

export interface Tweet {
  id: string;

  // Content
  text: string;
  mediaUrls?: string[];

  // Thread
  isThread: boolean;
  threadParts?: string[];

  // Engagement
  replyTo?: string;
  quoteTweet?: string;

  // Status
  status: ContentStatus;
  tweetId?: string;         // Twitter's ID after posting

  // Schedule
  scheduledFor?: number;
  postedAt?: number;

  // Performance
  metrics?: TweetMetrics;
}

export interface TweetMetrics {
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  clicks: number;
  engagementRate: number;
}

export interface ContentMetrics {
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  shares: number;
  conversions: number;
}

// ============================================================================
// SEO
// ============================================================================

export interface Keyword {
  term: string;

  // Metrics
  searchVolume: number;
  difficulty: number;       // 0-100
  cpc: number;              // Cost per click

  // Status
  currentRanking?: number;
  targetRanking: number;

  // Strategy
  priority: "high" | "medium" | "low";
  contentIds: string[];     // Content targeting this keyword

  // History
  rankingHistory: Array<{ date: number; position: number }>;
}

export interface SEOReport {
  // Overall health
  healthScore: number;      // 0-100

  // Rankings
  keywords: {
    total: number;
    ranking: number;        // Keywords with rankings
    top10: number;
    top3: number;
  };

  // Technical
  technical: {
    indexedPages: number;
    crawlErrors: number;
    sitemapStatus: "ok" | "error";
    robotsStatus: "ok" | "error";
  };

  // Performance
  performance: {
    organicTraffic: number;
    organicGrowth: number;  // Month over month
    avgPosition: number;
    ctr: number;
  };

  // Issues
  issues: SEOIssue[];
}

export interface SEOIssue {
  type: "error" | "warning" | "info";
  category: "technical" | "content" | "performance";
  title: string;
  description: string;
  affectedUrls: string[];
  fixSuggestion: string;
}

// ============================================================================
// SOCIAL
// ============================================================================

export interface SocialAccount {
  platform: "twitter" | "discord" | "telegram" | "linkedin";
  handle: string;

  // Stats
  followers: number;
  following: number;

  // Activity
  postsThisWeek: number;
  engagementRate: number;

  // Growth
  followerGrowth: number;   // This month
}

export interface SocialPost {
  id: string;
  platform: SocialAccount["platform"];

  content: string;
  mediaUrls?: string[];

  status: ContentStatus;
  postId?: string;          // Platform's ID

  scheduledFor?: number;
  postedAt?: number;

  metrics?: {
    impressions: number;
    engagement: number;
    clicks: number;
  };
}

// ============================================================================
// CONTENT CALENDAR
// ============================================================================

export interface ContentCalendar {
  // Weekly schedule
  schedule: {
    monday: ContentSlot[];
    tuesday: ContentSlot[];
    wednesday: ContentSlot[];
    thursday: ContentSlot[];
    friday: ContentSlot[];
    saturday: ContentSlot[];
    sunday: ContentSlot[];
  };

  // Upcoming content
  upcoming: ScheduledContent[];

  // Content mix targets
  mix: {
    blog: number;           // Posts per week
    twitter: number;        // Tweets per day
    discord: number;        // Updates per day
  };
}

export interface ContentSlot {
  time: string;             // "09:00"
  type: ContentType;
  template?: string;
}

export interface ScheduledContent {
  id: string;
  type: ContentType;
  title: string;
  scheduledFor: number;
  status: ContentStatus;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface GrowthMetrics {
  period: "daily" | "weekly" | "monthly";

  // Traffic
  traffic: {
    visitors: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };

  // Sources
  sources: {
    organic: number;
    social: number;
    direct: number;
    referral: number;
  };

  // Conversions
  conversions: {
    signups: number;
    trials: number;
    paid: number;
    conversionRate: number;
  };

  // Social
  social: {
    followers: number;
    engagement: number;
    mentions: number;
    shares: number;
  };

  // Content
  content: {
    postsPublished: number;
    totalViews: number;
    avgEngagement: number;
  };

  // Growth rates
  growth: {
    traffic: number;        // % change
    followers: number;
    signups: number;
  };
}

// ============================================================================
// ENGINE CONFIG
// ============================================================================

export interface GrowthEngineConfig {
  // Content
  blogPostsPerWeek: number;
  tweetsPerDay: number;

  // Twitter
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
  };

  // Discord
  discord?: {
    botToken: string;
    channelId: string;
  };

  // Features
  enableBlogGeneration: boolean;
  enableTwitter: boolean;
  enableDiscord: boolean;
  enableSEO: boolean;
}
