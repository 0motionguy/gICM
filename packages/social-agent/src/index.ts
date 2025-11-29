// Social Agent - Multi-platform social media operations
export { SocialAgent, type SocialAgentAnalysis } from "./social-agent.js";

// Types
export {
  type SocialPost,
  type SocialUser,
  type Influencer,
  type SentimentAnalysis,
  type TrendingTopic,
  type WhaleAlert,
  type SocialAgentConfig,
  type SocialPlatform,
  type PostOptions,
  SocialAgentConfigSchema,
} from "./types.js";

// Platforms
export { TwitterProvider } from "./platforms/twitter.js";
export { TelegramProvider } from "./platforms/telegram.js";
export { DiscordProvider } from "./platforms/discord.js";
export { FarcasterProvider } from "./platforms/farcaster.js";

// Analyzers
export { SentimentAnalyzer } from "./analyzers/sentiment.js";
export { InfluencerAnalyzer, type InfluencerMetrics } from "./analyzers/influencer.js";
