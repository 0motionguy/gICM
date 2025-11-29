import { BaseAgent, AgentConfig, AgentContext, AgentResult, LLMClient } from '@gicm/agent-core';
import { z } from 'zod';

declare const SocialAgentConfigSchema: z.ZodObject<{
    twitter: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        apiSecret: z.ZodOptional<z.ZodString>;
        accessToken: z.ZodOptional<z.ZodString>;
        accessSecret: z.ZodOptional<z.ZodString>;
        bearerToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        accessSecret?: string | undefined;
        bearerToken?: string | undefined;
    }, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        accessSecret?: string | undefined;
        bearerToken?: string | undefined;
    }>>;
    telegram: z.ZodOptional<z.ZodObject<{
        botToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        botToken?: string | undefined;
    }, {
        botToken?: string | undefined;
    }>>;
    discord: z.ZodOptional<z.ZodObject<{
        botToken: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        botToken?: string | undefined;
        webhookUrl?: string | undefined;
    }, {
        botToken?: string | undefined;
        webhookUrl?: string | undefined;
    }>>;
    farcaster: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        signerUuid: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        signerUuid?: string | undefined;
    }, {
        apiKey?: string | undefined;
        signerUuid?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    twitter?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        accessSecret?: string | undefined;
        bearerToken?: string | undefined;
    } | undefined;
    telegram?: {
        botToken?: string | undefined;
    } | undefined;
    discord?: {
        botToken?: string | undefined;
        webhookUrl?: string | undefined;
    } | undefined;
    farcaster?: {
        apiKey?: string | undefined;
        signerUuid?: string | undefined;
    } | undefined;
}, {
    twitter?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        accessSecret?: string | undefined;
        bearerToken?: string | undefined;
    } | undefined;
    telegram?: {
        botToken?: string | undefined;
    } | undefined;
    discord?: {
        botToken?: string | undefined;
        webhookUrl?: string | undefined;
    } | undefined;
    farcaster?: {
        apiKey?: string | undefined;
        signerUuid?: string | undefined;
    } | undefined;
}>;
type SocialAgentConfig = z.infer<typeof SocialAgentConfigSchema>;
interface SocialPost {
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
interface SocialUser {
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
interface Influencer extends SocialUser {
    engagementRate: number;
    avgLikes: number;
    avgReposts: number;
    topics: string[];
    recentPosts: SocialPost[];
}
interface SentimentAnalysis {
    score: number;
    label: "bullish" | "bearish" | "neutral";
    confidence: number;
    keywords: Array<{
        word: string;
        sentiment: number;
    }>;
    samplePosts: SocialPost[];
}
interface TrendingTopic {
    topic: string;
    volume: number;
    change24h: number;
    sentiment: number;
    relatedTokens?: string[];
}
interface WhaleAlert {
    type: "buy" | "sell" | "transfer" | "mint";
    token: string;
    amount: number;
    valueUsd: number;
    from: string;
    to?: string;
    txHash: string;
    timestamp: Date;
}
interface SocialPlatform {
    name: string;
    platform: "twitter" | "telegram" | "discord" | "farcaster";
    searchPosts(query: string, limit?: number): Promise<SocialPost[]>;
    getUser(username: string): Promise<SocialUser | null>;
    getUserPosts(userId: string, limit?: number): Promise<SocialPost[]>;
    postMessage?(content: string, options?: PostOptions): Promise<SocialPost | null>;
}
interface PostOptions {
    replyTo?: string;
    media?: Array<{
        type: string;
        url: string;
    }>;
    mentions?: string[];
}

interface SocialAgentAnalysis {
    posts?: SocialPost[];
    user?: SocialUser;
    sentiment?: SentimentAnalysis;
    influencer?: Influencer;
    trending?: TrendingTopic[];
    aiSummary?: string;
}
declare class SocialAgent extends BaseAgent {
    private platforms;
    private sentimentAnalyzer;
    private influencerAnalyzer;
    private socialConfig;
    private llmClient?;
    constructor(config: SocialAgentConfig & AgentConfig);
    private initializePlatforms;
    private initializeTools;
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    searchPosts(query: string, platformName?: string, limit?: number): Promise<SocialPost[]>;
    getUser(username: string, platformName?: string): Promise<SocialUser | null>;
    getUserPosts(userId: string, platformName?: string, limit?: number): Promise<SocialPost[]>;
    analyzeSentiment(query: string, platformName?: string): Promise<SentimentAnalysis | null>;
    analyzeInfluencer(username: string, platformName?: string): Promise<Influencer | null>;
    generatePost(topic: string, style?: string, platformName?: string): Promise<string>;
    getSentimentTrend(query: string, platformName?: string, intervalHours?: number): Promise<Array<{
        timestamp: Date;
        sentiment: number;
        postCount: number;
    }>>;
    postToAll(content: string, platforms?: string[]): Promise<Map<string, SocialPost | null>>;
}

interface TwitterConfig {
    bearerToken?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
}
declare class TwitterProvider implements SocialPlatform {
    name: string;
    platform: "twitter";
    private bearerToken?;
    private baseUrl;
    constructor(config: TwitterConfig);
    private fetch;
    searchPosts(query: string, limit?: number): Promise<SocialPost[]>;
    getUser(username: string): Promise<SocialUser | null>;
    getUserPosts(userId: string, limit?: number): Promise<SocialPost[]>;
    postMessage(_content: string, _options?: PostOptions): Promise<SocialPost | null>;
}

interface TelegramConfig {
    botToken?: string;
}
declare class TelegramProvider implements SocialPlatform {
    name: string;
    platform: "telegram";
    private botToken?;
    private baseUrl;
    constructor(config: TelegramConfig);
    private fetch;
    searchPosts(_query: string, _limit?: number): Promise<SocialPost[]>;
    getUser(username: string): Promise<SocialUser | null>;
    getUserPosts(_userId: string, _limit?: number): Promise<SocialPost[]>;
    postMessage(content: string, options?: PostOptions & {
        chatId?: string | number;
    }): Promise<SocialPost | null>;
    sendAlert(chatId: string | number, alert: {
        title: string;
        message: string;
        type?: "info" | "warning" | "critical";
    }): Promise<boolean>;
}

interface DiscordConfig {
    botToken?: string;
    webhookUrl?: string;
}
interface DiscordGuild {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    approximate_member_count?: number;
}
interface DiscordWebhookPayload {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: Array<{
        title?: string;
        description?: string;
        color?: number;
        fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
        }>;
        footer?: {
            text: string;
        };
        timestamp?: string;
    }>;
}
declare class DiscordProvider implements SocialPlatform {
    name: string;
    platform: "discord";
    private botToken?;
    private webhookUrl?;
    private baseUrl;
    constructor(config: DiscordConfig);
    private fetch;
    searchPosts(_query: string, _limit?: number): Promise<SocialPost[]>;
    getUser(userId: string): Promise<SocialUser | null>;
    getUserPosts(_userId: string, _limit?: number): Promise<SocialPost[]>;
    getChannelMessages(channelId: string, limit?: number): Promise<SocialPost[]>;
    postMessage(content: string, options?: PostOptions & {
        channelId?: string;
    }): Promise<SocialPost | null>;
    sendWebhook(payload: DiscordWebhookPayload): Promise<boolean>;
    sendAlert(alert: {
        title: string;
        description: string;
        color?: number;
        fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
        }>;
        footer?: string;
    }): Promise<boolean>;
    getGuild(guildId: string): Promise<DiscordGuild | null>;
}

interface FarcasterConfig {
    apiKey?: string;
    signerUuid?: string;
}
declare class FarcasterProvider implements SocialPlatform {
    name: string;
    platform: "farcaster";
    private apiKey?;
    private signerUuid?;
    private baseUrl;
    constructor(config: FarcasterConfig);
    private fetch;
    searchPosts(query: string, limit?: number): Promise<SocialPost[]>;
    private mapCast;
    getUser(username: string): Promise<SocialUser | null>;
    getUserPosts(fid: string, limit?: number): Promise<SocialPost[]>;
    postMessage(content: string, options?: PostOptions): Promise<SocialPost | null>;
    getTrendingCasts(limit?: number): Promise<SocialPost[]>;
    getChannelCasts(channelId: string, limit?: number): Promise<SocialPost[]>;
}

declare class SentimentAnalyzer {
    private llmClient?;
    constructor(llmClient?: LLMClient);
    analyzeSentiment(posts: SocialPost[]): Promise<SentimentAnalysis>;
    private llmAnalysis;
    private keywordAnalysis;
    analyzeByTime(posts: SocialPost[], intervalHours?: number): Array<{
        timestamp: Date;
        sentiment: number;
        postCount: number;
    }>;
}

interface InfluencerMetrics {
    engagementRate: number;
    avgLikes: number;
    avgReposts: number;
    avgReplies: number;
    postFrequency: number;
    peakHours: number[];
    topTopics: string[];
}
declare class InfluencerAnalyzer {
    analyzeInfluencer(user: SocialUser, posts: SocialPost[]): Influencer;
    calculateMetrics(posts: SocialPost[]): InfluencerMetrics;
    extractTopics(posts: SocialPost[]): string[];
    rankInfluencers(influencers: Influencer[]): Influencer[];
    findSimilarInfluencers(target: Influencer, candidates: Influencer[]): Influencer[];
}

export { DiscordProvider, FarcasterProvider, type Influencer, InfluencerAnalyzer, type InfluencerMetrics, type PostOptions, type SentimentAnalysis, SentimentAnalyzer, SocialAgent, type SocialAgentAnalysis, type SocialAgentConfig, SocialAgentConfigSchema, type SocialPlatform, type SocialPost, type SocialUser, TelegramProvider, type TrendingTopic, TwitterProvider, type WhaleAlert };
