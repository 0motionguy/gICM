import { z } from "zod";
import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  type LLMClient,
  createLLMClient,
} from "@gicm/agent-core";
import type {
  SocialAgentConfig,
  SocialPost,
  SocialUser,
  SentimentAnalysis,
  TrendingTopic,
  SocialPlatform,
  Influencer,
} from "./types.js";
import { SocialAgentConfigSchema } from "./types.js";
import { TwitterProvider } from "./platforms/twitter.js";
import { TelegramProvider } from "./platforms/telegram.js";
import { DiscordProvider } from "./platforms/discord.js";
import { FarcasterProvider } from "./platforms/farcaster.js";
import { SentimentAnalyzer } from "./analyzers/sentiment.js";
import { InfluencerAnalyzer } from "./analyzers/influencer.js";

export interface SocialAgentAnalysis {
  posts?: SocialPost[];
  user?: SocialUser;
  sentiment?: SentimentAnalysis;
  influencer?: Influencer;
  trending?: TrendingTopic[];
  aiSummary?: string;
}

export class SocialAgent extends BaseAgent {
  private platforms: Map<string, SocialPlatform> = new Map();
  private sentimentAnalyzer: SentimentAnalyzer;
  private influencerAnalyzer: InfluencerAnalyzer;
  private socialConfig: SocialAgentConfig;
  private llmClient?: LLMClient;

  constructor(config: SocialAgentConfig & AgentConfig) {
    const validatedConfig = SocialAgentConfigSchema.parse(config);
    super("social-agent", config);

    this.socialConfig = validatedConfig;

    // Initialize LLM client if API key provided
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096,
      });
    }

    this.sentimentAnalyzer = new SentimentAnalyzer(this.llmClient);
    this.influencerAnalyzer = new InfluencerAnalyzer();

    this.initializePlatforms(validatedConfig);
    this.initializeTools();
  }

  private initializePlatforms(config: SocialAgentConfig): void {
    if (config.twitter?.bearerToken) {
      this.platforms.set("twitter", new TwitterProvider({
        bearerToken: config.twitter.bearerToken,
      }));
    }

    if (config.telegram?.botToken) {
      this.platforms.set("telegram", new TelegramProvider({
        botToken: config.telegram.botToken,
      }));
    }

    if (config.discord?.botToken || config.discord?.webhookUrl) {
      this.platforms.set("discord", new DiscordProvider({
        botToken: config.discord.botToken,
        webhookUrl: config.discord.webhookUrl,
      }));
    }

    if (config.farcaster?.apiKey) {
      this.platforms.set("farcaster", new FarcasterProvider({
        apiKey: config.farcaster.apiKey,
        signerUuid: config.farcaster.signerUuid,
      }));
    }
  }

  private initializeTools(): void {
    this.registerTool({
      name: "search_posts",
      description: "Search for posts across social platforms",
      parameters: z.object({
        query: z.string().describe("Search query"),
        platform: z.string().default("twitter").describe("Platform: twitter, telegram, discord, farcaster"),
        limit: z.number().default(50).describe("Max posts to return"),
      }),
      execute: async (params) => {
        const { query, platform, limit } = params as {
          query: string;
          platform: string;
          limit: number;
        };
        return this.searchPosts(query, platform, limit);
      },
    });

    this.registerTool({
      name: "analyze_sentiment",
      description: "Analyze sentiment for a topic or token",
      parameters: z.object({
        query: z.string().describe("Topic or token to analyze"),
        platform: z.string().default("twitter").describe("Platform to search"),
      }),
      execute: async (params) => {
        const { query, platform } = params as { query: string; platform: string };
        return this.analyzeSentiment(query, platform);
      },
    });

    this.registerTool({
      name: "get_user",
      description: "Get user profile information",
      parameters: z.object({
        username: z.string().describe("Username to lookup"),
        platform: z.string().default("twitter").describe("Platform name"),
      }),
      execute: async (params) => {
        const { username, platform } = params as { username: string; platform: string };
        return this.getUser(username, platform);
      },
    });

    this.registerTool({
      name: "analyze_influencer",
      description: "Analyze an influencer's metrics and content",
      parameters: z.object({
        username: z.string().describe("Username to analyze"),
        platform: z.string().default("twitter").describe("Platform name"),
      }),
      execute: async (params) => {
        const { username, platform } = params as { username: string; platform: string };
        return this.analyzeInfluencer(username, platform);
      },
    });

    this.registerTool({
      name: "generate_post",
      description: "Generate social media post content with AI",
      parameters: z.object({
        topic: z.string().describe("Topic to write about"),
        style: z.string().default("professional").describe("Style: professional, casual, hype"),
        platform: z.string().default("twitter").describe("Target platform"),
      }),
      execute: async (params) => {
        const { topic, style, platform } = params as {
          topic: string;
          style: string;
          platform: string;
        };
        return this.generatePost(topic, style, platform);
      },
    });
  }

  getSystemPrompt(): string {
    return `You are a Web3 social media expert. You can:
- Search and analyze social media posts across platforms
- Track sentiment for tokens and projects
- Analyze influencers and their engagement
- Generate social media content
- Monitor whale alerts and community activity

Available platforms: ${Array.from(this.platforms.keys()).join(", ")}

When analyzing sentiment, consider:
1. Overall community mood
2. Influencer opinions
3. Volume of discussion
4. Historical sentiment trends
5. Potential manipulation (bots, coordinated posts)`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const query = context.userQuery ?? "";

    if (!this.llmClient) {
      return this.createResult(
        false,
        null,
        "LLM client not configured. Provide apiKey in config.",
        0,
        "No LLM available for AI analysis"
      );
    }

    try {
      const response = await this.llmClient.chat([
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: query },
      ]);

      return this.createResult(
        true,
        { aiSummary: response.content },
        undefined,
        0.8,
        "AI analysis completed"
      );
    } catch (error) {
      return this.createResult(
        false,
        null,
        error instanceof Error ? error.message : "Unknown error",
        0,
        "Failed to complete AI analysis"
      );
    }
  }

  async searchPosts(
    query: string,
    platformName = "twitter",
    limit = 50
  ): Promise<SocialPost[]> {
    const platform = this.platforms.get(platformName);
    if (!platform) {
      this.log(`Platform ${platformName} not configured`);
      return [];
    }
    return platform.searchPosts(query, limit);
  }

  async getUser(username: string, platformName = "twitter"): Promise<SocialUser | null> {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getUser(username);
  }

  async getUserPosts(
    userId: string,
    platformName = "twitter",
    limit = 50
  ): Promise<SocialPost[]> {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getUserPosts(userId, limit);
  }

  async analyzeSentiment(
    query: string,
    platformName = "twitter"
  ): Promise<SentimentAnalysis | null> {
    const posts = await this.searchPosts(query, platformName, 100);
    if (posts.length === 0) return null;
    return this.sentimentAnalyzer.analyzeSentiment(posts);
  }

  async analyzeInfluencer(
    username: string,
    platformName = "twitter"
  ): Promise<Influencer | null> {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;

    const user = await platform.getUser(username);
    if (!user) return null;

    const posts = await platform.getUserPosts(user.id, 100);
    return this.influencerAnalyzer.analyzeInfluencer(user, posts);
  }

  async generatePost(
    topic: string,
    style = "professional",
    platformName = "twitter"
  ): Promise<string> {
    if (!this.llmClient) {
      return `Check out ${topic}! 🚀`;
    }

    const charLimit = platformName === "twitter" ? 280 : 1000;

    const response = await this.llmClient.chat([
      {
        role: "system",
        content: `Generate a ${style} social media post about ${topic} for ${platformName}.
Max ${charLimit} characters. Include relevant hashtags and emojis.
Make it engaging and authentic to the Web3 community.`,
      },
      {
        role: "user",
        content: `Write a ${style} post about: ${topic}`,
      },
    ]);

    return response.content.slice(0, charLimit);
  }

  async getSentimentTrend(
    query: string,
    platformName = "twitter",
    intervalHours = 6
  ): Promise<Array<{ timestamp: Date; sentiment: number; postCount: number }>> {
    const posts = await this.searchPosts(query, platformName, 200);
    return this.sentimentAnalyzer.analyzeByTime(posts, intervalHours);
  }

  async postToAll(
    content: string,
    platforms?: string[]
  ): Promise<Map<string, SocialPost | null>> {
    const results = new Map<string, SocialPost | null>();
    const targetPlatforms = platforms ?? Array.from(this.platforms.keys());

    for (const platformName of targetPlatforms) {
      const platform = this.platforms.get(platformName);
      if (platform?.postMessage) {
        try {
          const post = await platform.postMessage(content);
          results.set(platformName, post);
        } catch {
          results.set(platformName, null);
        }
      } else {
        results.set(platformName, null);
      }
    }

    return results;
  }
}
