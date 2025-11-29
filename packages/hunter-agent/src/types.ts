import { z } from "zod";

// Hunt sources
export const HuntSourceSchema = z.enum(["github", "hackernews", "twitter"]);
export type HuntSource = z.infer<typeof HuntSourceSchema>;

// Raw discovery from source
export const RawDiscoverySchema = z.object({
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  publishedAt: z.date().optional(),
  // Metrics (source-dependent)
  metrics: z.object({
    stars: z.number().optional(),
    forks: z.number().optional(),
    watchers: z.number().optional(),
    openIssues: z.number().optional(),
    points: z.number().optional(),
    comments: z.number().optional(),
    likes: z.number().optional(),
    reposts: z.number().optional(),
    views: z.number().optional(),
  }),
  // Source-specific metadata
  metadata: z.record(z.unknown()).optional(),
});
export type RawDiscovery = z.infer<typeof RawDiscoverySchema>;

// Processed discovery with relevance scoring
export const HuntDiscoverySchema = z.object({
  id: z.string(),
  source: HuntSourceSchema,
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  publishedAt: z.date().optional(),
  discoveredAt: z.date(),
  // Categorization
  category: z.enum(["web3", "ai", "defi", "nft", "tooling", "other"]).optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().optional(),
  // Metrics
  metrics: z.object({
    stars: z.number().optional(),
    forks: z.number().optional(),
    watchers: z.number().optional(),
    openIssues: z.number().optional(),
    points: z.number().optional(),
    comments: z.number().optional(),
    likes: z.number().optional(),
    reposts: z.number().optional(),
    views: z.number().optional(),
  }),
  // Relevance factors (computed locally)
  relevanceFactors: z.object({
    hasWeb3Keywords: z.boolean().default(false),
    hasAIKeywords: z.boolean().default(false),
    hasSolanaKeywords: z.boolean().default(false),
    hasEthereumKeywords: z.boolean().default(false),
    hasTypeScript: z.boolean().default(false),
    recentActivity: z.boolean().default(false),
    highEngagement: z.boolean().default(false),
    isShowHN: z.boolean().default(false),
  }),
  // Raw metadata for later processing
  rawMetadata: z.record(z.unknown()).optional(),
  // Fingerprint for deduplication
  fingerprint: z.string(),
});
export type HuntDiscovery = z.infer<typeof HuntDiscoverySchema>;

// Hunter configuration
export interface HunterConfig {
  source: HuntSource;
  enabled: boolean;
  schedule?: string; // Cron expression
  // API credentials
  apiKey?: string;
  apiToken?: string;
  // Rate limiting
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  // Filters
  filters?: {
    minStars?: number;
    minPoints?: number;
    minEngagement?: number;
    languages?: string[];
    topics?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
  };
}

// Base hunter interface
export interface BaseHunterSource {
  source: HuntSource;
  hunt(): Promise<RawDiscovery[]>;
  transform(raw: RawDiscovery): HuntDiscovery;
}

// GitHub-specific types
export const GitHubRepoSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string().optional(),
    html_url: z.string(),
  }),
  html_url: z.string(),
  description: z.string().nullable(),
  fork: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  homepage: z.string().nullable(),
  size: z.number(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  language: z.string().nullable(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  license: z.object({ name: z.string() }).nullable(),
  topics: z.array(z.string()).default([]),
  visibility: z.string().optional(),
  default_branch: z.string().optional(),
});
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

// HackerNews-specific types
export const HNItemSchema = z.object({
  id: z.number(),
  type: z.enum(["story", "comment", "job", "poll", "pollopt"]),
  by: z.string().optional(),
  time: z.number(),
  title: z.string().optional(),
  url: z.string().optional(),
  text: z.string().optional(),
  score: z.number().optional(),
  descendants: z.number().optional(),
  kids: z.array(z.number()).optional(),
});
export type HNItem = z.infer<typeof HNItemSchema>;

// Twitter-specific types (for Apify)
export const TwitterTweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.string().optional(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    followers_count: z.number().optional(),
  }).optional(),
  public_metrics: z.object({
    retweet_count: z.number(),
    reply_count: z.number(),
    like_count: z.number(),
    quote_count: z.number().optional(),
    impression_count: z.number().optional(),
  }).optional(),
  urls: z.array(z.string()).optional(),
});
export type TwitterTweet = z.infer<typeof TwitterTweetSchema>;

// Keywords for relevance detection
export const RELEVANCE_KEYWORDS = {
  web3: [
    "web3",
    "blockchain",
    "crypto",
    "cryptocurrency",
    "token",
    "smart contract",
    "decentralized",
    "dapp",
    "defi",
    "nft",
    "dao",
    "wallet",
    "on-chain",
    "onchain",
  ],
  ai: [
    "ai",
    "artificial intelligence",
    "machine learning",
    "ml",
    "llm",
    "large language model",
    "gpt",
    "claude",
    "langchain",
    "agent",
    "chatbot",
    "neural",
    "transformer",
    "embedding",
  ],
  solana: [
    "solana",
    "$sol",
    "spl token",
    "anchor",
    "metaplex",
    "phantom",
    "solflare",
    "jupiter",
    "raydium",
  ],
  ethereum: [
    "ethereum",
    "$eth",
    "erc20",
    "erc721",
    "erc1155",
    "solidity",
    "hardhat",
    "foundry",
    "uniswap",
    "openzeppelin",
  ],
  typescript: ["typescript", "ts", "tsx", "deno", "bun"],
};

// Schedules
export const DEFAULT_SCHEDULES: Record<HuntSource, string> = {
  github: "0 */4 * * *", // Every 4 hours
  hackernews: "0 */2 * * *", // Every 2 hours
  twitter: "*/30 * * * *", // Every 30 minutes
};
