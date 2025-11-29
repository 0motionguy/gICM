import { z } from "zod";

export const SocialAgentConfigSchema = z.object({
  twitter: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessSecret: z.string().optional(),
    bearerToken: z.string().optional(),
  }).optional(),
  telegram: z.object({
    botToken: z.string().optional(),
  }).optional(),
  discord: z.object({
    botToken: z.string().optional(),
    webhookUrl: z.string().optional(),
  }).optional(),
  farcaster: z.object({
    apiKey: z.string().optional(),
    signerUuid: z.string().optional(),
  }).optional(),
});

export type SocialAgentConfig = z.infer<typeof SocialAgentConfigSchema>;

export interface SocialPost {
  id: string;
  platform: "twitter" | "telegram" | "discord" | "farcaster";
  author: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes?: number;
  reposts?: number;
  replies?: number;
  url?: string;
  media?: Array<{
    type: "image" | "video" | "gif";
    url: string;
  }>;
  mentions?: string[];
  hashtags?: string[];
}

export interface SocialUser {
  id: string;
  platform: "twitter" | "telegram" | "discord" | "farcaster";
  username: string;
  displayName: string;
  bio?: string;
  followers: number;
  following: number;
  verified?: boolean;
  avatar?: string;
  url?: string;
}

export interface Influencer extends SocialUser {
  engagementRate: number;
  avgLikes: number;
  avgReposts: number;
  topics: string[];
  recentPosts: SocialPost[];
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: "bullish" | "bearish" | "neutral";
  confidence: number;
  keywords: Array<{ word: string; sentiment: number }>;
  samplePosts: SocialPost[];
}

export interface TrendingTopic {
  topic: string;
  volume: number;
  change24h: number;
  sentiment: number;
  relatedTokens?: string[];
}

export interface WhaleAlert {
  type: "buy" | "sell" | "transfer" | "mint";
  token: string;
  amount: number;
  valueUsd: number;
  from: string;
  to?: string;
  txHash: string;
  timestamp: Date;
}

export interface SocialPlatform {
  name: string;
  platform: "twitter" | "telegram" | "discord" | "farcaster";

  searchPosts(query: string, limit?: number): Promise<SocialPost[]>;
  getUser(username: string): Promise<SocialUser | null>;
  getUserPosts(userId: string, limit?: number): Promise<SocialPost[]>;
  postMessage?(content: string, options?: PostOptions): Promise<SocialPost | null>;
}

export interface PostOptions {
  replyTo?: string;
  media?: Array<{ type: string; url: string }>;
  mentions?: string[];
}
