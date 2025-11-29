// src/social-agent.ts
import { z as z2 } from "zod";
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var SocialAgentConfigSchema = z.object({
  twitter: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessSecret: z.string().optional(),
    bearerToken: z.string().optional()
  }).optional(),
  telegram: z.object({
    botToken: z.string().optional()
  }).optional(),
  discord: z.object({
    botToken: z.string().optional(),
    webhookUrl: z.string().optional()
  }).optional(),
  farcaster: z.object({
    apiKey: z.string().optional(),
    signerUuid: z.string().optional()
  }).optional()
});

// src/platforms/twitter.ts
var TwitterProvider = class {
  name = "twitter";
  platform = "twitter";
  bearerToken;
  baseUrl = "https://api.twitter.com/2";
  constructor(config) {
    this.bearerToken = config.bearerToken;
  }
  async fetch(endpoint, options) {
    if (!this.bearerToken) {
      console.error("Twitter bearer token not configured");
      return null;
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          "Content-Type": "application/json",
          ...options?.headers
        }
      });
      if (!response.ok) {
        console.error(`Twitter API error: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Twitter fetch failed:", error);
      return null;
    }
  }
  async searchPosts(query, limit = 50) {
    const params = new URLSearchParams({
      query,
      max_results: Math.min(limit, 100).toString(),
      "tweet.fields": "created_at,public_metrics,entities,author_id",
      expansions: "author_id",
      "user.fields": "username"
    });
    const response = await this.fetch(
      `/tweets/search/recent?${params}`
    );
    if (!response?.data) return [];
    const userMap = /* @__PURE__ */ new Map();
    response.includes?.users?.forEach((u) => userMap.set(u.id, u));
    return response.data.map((tweet) => {
      const author = userMap.get(tweet.author_id);
      return {
        id: tweet.id,
        platform: "twitter",
        author: author?.username ?? "",
        authorId: tweet.author_id,
        content: tweet.text,
        timestamp: new Date(tweet.created_at),
        likes: tweet.public_metrics?.like_count,
        reposts: tweet.public_metrics?.retweet_count,
        replies: tweet.public_metrics?.reply_count,
        url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        mentions: tweet.entities?.mentions?.map((m) => m.username),
        hashtags: tweet.entities?.hashtags?.map((h) => h.tag)
      };
    });
  }
  async getUser(username) {
    const params = new URLSearchParams({
      "user.fields": "description,public_metrics,verified,profile_image_url"
    });
    const response = await this.fetch(
      `/users/by/username/${username}?${params}`
    );
    if (!response?.data) return null;
    const user = response.data;
    return {
      id: user.id,
      platform: "twitter",
      username: user.username,
      displayName: user.name,
      bio: user.description,
      followers: user.public_metrics?.followers_count ?? 0,
      following: user.public_metrics?.following_count ?? 0,
      verified: user.verified,
      avatar: user.profile_image_url,
      url: `https://twitter.com/${user.username}`
    };
  }
  async getUserPosts(userId, limit = 50) {
    const params = new URLSearchParams({
      max_results: Math.min(limit, 100).toString(),
      "tweet.fields": "created_at,public_metrics,entities",
      expansions: "author_id",
      "user.fields": "username"
    });
    const response = await this.fetch(
      `/users/${userId}/tweets?${params}`
    );
    if (!response?.data) return [];
    const author = response.includes?.users?.[0];
    return response.data.map((tweet) => ({
      id: tweet.id,
      platform: "twitter",
      author: author?.username ?? "",
      authorId: tweet.author_id,
      content: tweet.text,
      timestamp: new Date(tweet.created_at),
      likes: tweet.public_metrics?.like_count,
      reposts: tweet.public_metrics?.retweet_count,
      replies: tweet.public_metrics?.reply_count,
      url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
      mentions: tweet.entities?.mentions?.map((m) => m.username),
      hashtags: tweet.entities?.hashtags?.map((h) => h.tag)
    }));
  }
  async postMessage(_content, _options) {
    console.warn("Twitter posting requires OAuth 1.0a authentication");
    return null;
  }
};

// src/platforms/telegram.ts
var TelegramProvider = class {
  name = "telegram";
  platform = "telegram";
  botToken;
  baseUrl = "https://api.telegram.org/bot";
  constructor(config) {
    this.botToken = config.botToken;
  }
  async fetch(method, params) {
    if (!this.botToken) {
      console.error("Telegram bot token not configured");
      return null;
    }
    try {
      const url = `${this.baseUrl}${this.botToken}/${method}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: params ? JSON.stringify(params) : void 0
      });
      const data = await response.json();
      if (!data.ok) {
        console.error(`Telegram API error: ${data.description}`);
        return null;
      }
      return data.result ?? null;
    } catch (error) {
      console.error("Telegram fetch failed:", error);
      return null;
    }
  }
  async searchPosts(_query, _limit = 50) {
    console.warn("Telegram public search not available via Bot API");
    return [];
  }
  async getUser(username) {
    const chat = await this.fetch("getChat", {
      chat_id: `@${username}`
    });
    if (!chat) return null;
    const memberCount = await this.fetch(
      "getChatMemberCount",
      { chat_id: `@${username}` }
    );
    return {
      id: chat.id.toString(),
      platform: "telegram",
      username: chat.username ?? username,
      displayName: chat.title ?? username,
      bio: chat.description,
      followers: memberCount ?? 0,
      following: 0,
      url: `https://t.me/${chat.username ?? username}`
    };
  }
  async getUserPosts(_userId, _limit = 50) {
    console.warn("Telegram message history not available via Bot API");
    return [];
  }
  async postMessage(content, options) {
    const chatId = options?.chatId;
    if (!chatId) {
      console.error("Chat ID required for Telegram posting");
      return null;
    }
    const message = await this.fetch("sendMessage", {
      chat_id: chatId,
      text: content,
      reply_to_message_id: options?.replyTo ? parseInt(options.replyTo) : void 0
    });
    if (!message) return null;
    return {
      id: message.message_id.toString(),
      platform: "telegram",
      author: message.from?.username ?? "",
      authorId: message.from?.id.toString() ?? "",
      content: message.text ?? "",
      timestamp: new Date(message.date * 1e3)
    };
  }
  async sendAlert(chatId, alert) {
    const emoji = {
      info: "\u2139\uFE0F",
      warning: "\u26A0\uFE0F",
      critical: "\u{1F6A8}"
    };
    const text = `${emoji[alert.type ?? "info"]} *${alert.title}*

${alert.message}`;
    const result = await this.fetch("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "Markdown"
    });
    return result !== null;
  }
};

// src/platforms/discord.ts
var DiscordProvider = class {
  name = "discord";
  platform = "discord";
  botToken;
  webhookUrl;
  baseUrl = "https://discord.com/api/v10";
  constructor(config) {
    this.botToken = config.botToken;
    this.webhookUrl = config.webhookUrl;
  }
  async fetch(endpoint, options) {
    if (!this.botToken) {
      console.error("Discord bot token not configured");
      return null;
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bot ${this.botToken}`,
          "Content-Type": "application/json",
          ...options?.headers
        }
      });
      if (!response.ok) {
        console.error(`Discord API error: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Discord fetch failed:", error);
      return null;
    }
  }
  async searchPosts(_query, _limit = 50) {
    console.warn("Discord search requires channel-specific access");
    return [];
  }
  async getUser(userId) {
    const user = await this.fetch(`/users/${userId}`);
    if (!user) return null;
    return {
      id: user.id,
      platform: "discord",
      username: user.username,
      displayName: `${user.username}#${user.discriminator}`,
      followers: 0,
      following: 0,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : void 0
    };
  }
  async getUserPosts(_userId, _limit = 50) {
    console.warn("Discord user posts require channel access");
    return [];
  }
  async getChannelMessages(channelId, limit = 50) {
    const messages = await this.fetch(
      `/channels/${channelId}/messages?limit=${Math.min(limit, 100)}`
    );
    if (!messages) return [];
    return messages.map((msg) => ({
      id: msg.id,
      platform: "discord",
      author: msg.author.username,
      authorId: msg.author.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      likes: msg.reactions?.reduce((sum, r) => sum + r.count, 0),
      mentions: msg.mentions?.map((m) => m.username)
    }));
  }
  async postMessage(content, options) {
    const channelId = options?.channelId;
    if (!channelId) {
      console.error("Channel ID required for Discord posting");
      return null;
    }
    const message = await this.fetch(`/channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
        message_reference: options?.replyTo ? { message_id: options.replyTo } : void 0
      })
    });
    if (!message) return null;
    return {
      id: message.id,
      platform: "discord",
      author: message.author.username,
      authorId: message.author.id,
      content: message.content,
      timestamp: new Date(message.timestamp)
    };
  }
  async sendWebhook(payload) {
    if (!this.webhookUrl) {
      console.error("Discord webhook URL not configured");
      return false;
    }
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error("Discord webhook failed:", error);
      return false;
    }
  }
  async sendAlert(alert) {
    return this.sendWebhook({
      embeds: [
        {
          title: alert.title,
          description: alert.description,
          color: alert.color ?? 5793266,
          // Discord blurple
          fields: alert.fields,
          footer: alert.footer ? { text: alert.footer } : void 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    });
  }
  async getGuild(guildId) {
    return this.fetch(`/guilds/${guildId}?with_counts=true`);
  }
};

// src/platforms/farcaster.ts
var FarcasterProvider = class {
  name = "farcaster";
  platform = "farcaster";
  apiKey;
  signerUuid;
  baseUrl = "https://api.neynar.com/v2/farcaster";
  constructor(config) {
    this.apiKey = config.apiKey;
    this.signerUuid = config.signerUuid;
  }
  async fetch(endpoint, options) {
    if (!this.apiKey) {
      console.error("Farcaster API key not configured");
      return null;
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          accept: "application/json",
          api_key: this.apiKey,
          "Content-Type": "application/json",
          ...options?.headers
        }
      });
      if (!response.ok) {
        console.error(`Farcaster API error: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Farcaster fetch failed:", error);
      return null;
    }
  }
  async searchPosts(query, limit = 50) {
    const response = await this.fetch(
      `/cast/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 100)}`
    );
    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];
    return casts.map((cast) => this.mapCast(cast));
  }
  mapCast(cast) {
    return {
      id: cast.hash,
      platform: "farcaster",
      author: cast.author.username,
      authorId: cast.author.fid.toString(),
      content: cast.text,
      timestamp: new Date(cast.timestamp),
      likes: cast.reactions?.likes_count,
      reposts: cast.reactions?.recasts_count,
      replies: cast.replies?.count,
      url: `https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`,
      mentions: cast.mentioned_profiles?.map((p) => p.username),
      media: cast.embeds?.filter((e) => e.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)).map((e) => ({ type: "image", url: e.url }))
    };
  }
  async getUser(username) {
    const response = await this.fetch(
      `/user/by_username?username=${username}`
    );
    const users = response?.result ?? response?.users;
    const user = Array.isArray(users) ? users[0] : users;
    if (!user) return null;
    return {
      id: user.fid.toString(),
      platform: "farcaster",
      username: user.username,
      displayName: user.display_name,
      bio: user.profile?.bio?.text,
      followers: user.follower_count,
      following: user.following_count,
      verified: (user.verifications?.length ?? 0) > 0,
      avatar: user.pfp_url,
      url: `https://warpcast.com/${user.username}`
    };
  }
  async getUserPosts(fid, limit = 50) {
    const response = await this.fetch(
      `/feed/user/casts?fid=${fid}&limit=${Math.min(limit, 100)}`
    );
    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];
    return casts.map((cast) => this.mapCast(cast));
  }
  async postMessage(content, options) {
    if (!this.signerUuid) {
      console.error("Farcaster signer UUID required for posting");
      return null;
    }
    const response = await this.fetch("/cast", {
      method: "POST",
      body: JSON.stringify({
        signer_uuid: this.signerUuid,
        text: content,
        parent: options?.replyTo,
        embeds: options?.media?.map((m) => ({ url: m.url }))
      })
    });
    if (!response?.cast) return null;
    return this.mapCast(response.cast);
  }
  async getTrendingCasts(limit = 20) {
    const response = await this.fetch(
      `/feed/trending?limit=${Math.min(limit, 100)}`
    );
    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];
    return casts.map((cast) => this.mapCast(cast));
  }
  async getChannelCasts(channelId, limit = 50) {
    const response = await this.fetch(
      `/feed/channel?channel_id=${channelId}&limit=${Math.min(limit, 100)}`
    );
    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];
    return casts.map((cast) => this.mapCast(cast));
  }
};

// src/analyzers/sentiment.ts
var BULLISH_KEYWORDS = [
  { word: "bullish", score: 0.8 },
  { word: "moon", score: 0.7 },
  { word: "pump", score: 0.6 },
  { word: "ath", score: 0.6 },
  { word: "buy", score: 0.4 },
  { word: "long", score: 0.5 },
  { word: "breakout", score: 0.6 },
  { word: "accumulate", score: 0.5 },
  { word: "undervalued", score: 0.5 },
  { word: "gem", score: 0.6 },
  { word: "wagmi", score: 0.7 },
  { word: "gm", score: 0.3 },
  { word: "lfg", score: 0.6 },
  { word: "alpha", score: 0.4 }
];
var BEARISH_KEYWORDS = [
  { word: "bearish", score: -0.8 },
  { word: "dump", score: -0.7 },
  { word: "crash", score: -0.8 },
  { word: "sell", score: -0.4 },
  { word: "short", score: -0.5 },
  { word: "scam", score: -0.9 },
  { word: "rug", score: -0.9 },
  { word: "ngmi", score: -0.6 },
  { word: "rekt", score: -0.7 },
  { word: "fud", score: -0.3 },
  { word: "overvalued", score: -0.5 },
  { word: "dead", score: -0.6 }
];
var SentimentAnalyzer = class {
  llmClient;
  constructor(llmClient) {
    this.llmClient = llmClient;
  }
  async analyzeSentiment(posts) {
    if (posts.length === 0) {
      return {
        score: 0,
        label: "neutral",
        confidence: 0,
        keywords: [],
        samplePosts: []
      };
    }
    if (this.llmClient && posts.length <= 50) {
      return this.llmAnalysis(posts);
    }
    return this.keywordAnalysis(posts);
  }
  async llmAnalysis(posts) {
    if (!this.llmClient) {
      return this.keywordAnalysis(posts);
    }
    try {
      const postsText = posts.slice(0, 30).map((p) => `- ${p.content.slice(0, 200)}`).join("\n");
      const response = await this.llmClient.chat([
        {
          role: "system",
          content: `Analyze the sentiment of these crypto/web3 social media posts.
Return JSON with this exact structure:
{
  "score": <number from -1 (very bearish) to 1 (very bullish)>,
  "label": "bullish" | "bearish" | "neutral",
  "confidence": <number from 0 to 1>,
  "keywords": [{"word": "string", "sentiment": <number>}]
}`
        },
        {
          role: "user",
          content: `Analyze sentiment:

${postsText}`
        }
      ]);
      const parsed = JSON.parse(response.content);
      return {
        score: parsed.score,
        label: parsed.label,
        confidence: parsed.confidence,
        keywords: parsed.keywords,
        samplePosts: posts.slice(0, 5)
      };
    } catch {
      return this.keywordAnalysis(posts);
    }
  }
  keywordAnalysis(posts) {
    let totalScore = 0;
    const keywordCounts = /* @__PURE__ */ new Map();
    for (const post of posts) {
      const text = post.content.toLowerCase();
      let postScore = 0;
      for (const kw of BULLISH_KEYWORDS) {
        if (text.includes(kw.word)) {
          postScore += kw.score;
          const existing = keywordCounts.get(kw.word) ?? { count: 0, score: kw.score };
          keywordCounts.set(kw.word, { count: existing.count + 1, score: kw.score });
        }
      }
      for (const kw of BEARISH_KEYWORDS) {
        if (text.includes(kw.word)) {
          postScore += kw.score;
          const existing = keywordCounts.get(kw.word) ?? { count: 0, score: kw.score };
          keywordCounts.set(kw.word, { count: existing.count + 1, score: kw.score });
        }
      }
      const engagementWeight = Math.log10(
        1 + (post.likes ?? 0) + (post.reposts ?? 0) * 2
      );
      totalScore += postScore * (1 + engagementWeight * 0.1);
    }
    const avgScore = posts.length > 0 ? totalScore / posts.length : 0;
    const normalizedScore = Math.max(-1, Math.min(1, avgScore));
    const keywords = Array.from(keywordCounts.entries()).map(([word, data]) => ({ word, sentiment: data.score })).sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment)).slice(0, 10);
    return {
      score: normalizedScore,
      label: normalizedScore > 0.2 ? "bullish" : normalizedScore < -0.2 ? "bearish" : "neutral",
      confidence: Math.min(0.7, posts.length / 100),
      // More posts = higher confidence
      keywords,
      samplePosts: posts.slice(0, 5)
    };
  }
  analyzeByTime(posts, intervalHours = 1) {
    if (posts.length === 0) return [];
    const sorted = [...posts].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const intervalMs = intervalHours * 60 * 60 * 1e3;
    const buckets = /* @__PURE__ */ new Map();
    for (const post of sorted) {
      const bucket = Math.floor(post.timestamp.getTime() / intervalMs) * intervalMs;
      const existing = buckets.get(bucket) ?? [];
      existing.push(post);
      buckets.set(bucket, existing);
    }
    const results = [];
    for (const [timestamp, bucketPosts] of buckets) {
      const analysis = this.keywordAnalysis(bucketPosts);
      results.push({
        timestamp: new Date(timestamp),
        sentiment: analysis.score,
        postCount: bucketPosts.length
      });
    }
    return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
};

// src/analyzers/influencer.ts
var InfluencerAnalyzer = class {
  analyzeInfluencer(user, posts) {
    const metrics = this.calculateMetrics(posts);
    const topics = this.extractTopics(posts);
    return {
      ...user,
      engagementRate: metrics.engagementRate,
      avgLikes: metrics.avgLikes,
      avgReposts: metrics.avgReposts,
      topics,
      recentPosts: posts.slice(0, 10)
    };
  }
  calculateMetrics(posts) {
    if (posts.length === 0) {
      return {
        engagementRate: 0,
        avgLikes: 0,
        avgReposts: 0,
        avgReplies: 0,
        postFrequency: 0,
        peakHours: [],
        topTopics: []
      };
    }
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes ?? 0), 0);
    const totalReposts = posts.reduce((sum, p) => sum + (p.reposts ?? 0), 0);
    const totalReplies = posts.reduce((sum, p) => sum + (p.replies ?? 0), 0);
    const avgLikes = totalLikes / posts.length;
    const avgReposts = totalReposts / posts.length;
    const avgReplies = totalReplies / posts.length;
    const timestamps = posts.map((p) => p.timestamp.getTime()).sort((a, b) => a - b);
    const timeSpanDays = timestamps.length > 1 ? (timestamps[timestamps.length - 1] - timestamps[0]) / (1e3 * 60 * 60 * 24) : 1;
    const postFrequency = posts.length / Math.max(timeSpanDays, 1);
    const hourCounts = /* @__PURE__ */ new Map();
    for (const post of posts) {
      const hour = post.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    }
    const sortedHours = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([hour]) => hour);
    const avgEngagement = avgLikes + avgReposts * 2 + avgReplies * 3;
    const engagementRate = avgEngagement / 100;
    return {
      engagementRate,
      avgLikes,
      avgReposts,
      avgReplies,
      postFrequency,
      peakHours: sortedHours,
      topTopics: this.extractTopics(posts)
    };
  }
  extractTopics(posts) {
    const hashtagCounts = /* @__PURE__ */ new Map();
    const wordCounts = /* @__PURE__ */ new Map();
    const stopWords = /* @__PURE__ */ new Set([
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "shall",
      "can",
      "need",
      "dare",
      "ought",
      "used",
      "to",
      "of",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "from",
      "as",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "and",
      "but",
      "if",
      "or",
      "because",
      "until",
      "while",
      "this",
      "that",
      "these",
      "those",
      "it",
      "its",
      "i",
      "my",
      "you",
      "your",
      "we",
      "our",
      "they",
      "their"
    ]);
    for (const post of posts) {
      if (post.hashtags) {
        for (const tag of post.hashtags) {
          hashtagCounts.set(tag.toLowerCase(), (hashtagCounts.get(tag.toLowerCase()) ?? 0) + 1);
        }
      }
      const words = post.content.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
      }
    }
    const topics = /* @__PURE__ */ new Map();
    for (const [tag, count] of hashtagCounts) {
      topics.set(`#${tag}`, count * 2);
    }
    for (const [word, count] of wordCounts) {
      if (count >= 3) {
        topics.set(word, (topics.get(word) ?? 0) + count);
      }
    }
    return Array.from(topics.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([topic]) => topic);
  }
  rankInfluencers(influencers) {
    return [...influencers].sort((a, b) => {
      const scoreA = a.followers * 0.3 + a.engagementRate * 1e4 * 0.4 + a.avgLikes * 0.2 + a.avgReposts * 100 * 0.1;
      const scoreB = b.followers * 0.3 + b.engagementRate * 1e4 * 0.4 + b.avgLikes * 0.2 + b.avgReposts * 100 * 0.1;
      return scoreB - scoreA;
    });
  }
  findSimilarInfluencers(target, candidates) {
    const targetTopics = new Set(target.topics);
    return candidates.filter((c) => c.id !== target.id).map((candidate) => {
      const sharedTopics = candidate.topics.filter((t) => targetTopics.has(t));
      const similarity = sharedTopics.length / Math.max(target.topics.length, 1);
      return { candidate, similarity };
    }).filter(({ similarity }) => similarity > 0.2).sort((a, b) => b.similarity - a.similarity).map(({ candidate }) => candidate);
  }
};

// src/social-agent.ts
var SocialAgent = class extends BaseAgent {
  platforms = /* @__PURE__ */ new Map();
  sentimentAnalyzer;
  influencerAnalyzer;
  socialConfig;
  llmClient;
  constructor(config) {
    const validatedConfig = SocialAgentConfigSchema.parse(config);
    super("social-agent", config);
    this.socialConfig = validatedConfig;
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096
      });
    }
    this.sentimentAnalyzer = new SentimentAnalyzer(this.llmClient);
    this.influencerAnalyzer = new InfluencerAnalyzer();
    this.initializePlatforms(validatedConfig);
    this.initializeTools();
  }
  initializePlatforms(config) {
    if (config.twitter?.bearerToken) {
      this.platforms.set("twitter", new TwitterProvider({
        bearerToken: config.twitter.bearerToken
      }));
    }
    if (config.telegram?.botToken) {
      this.platforms.set("telegram", new TelegramProvider({
        botToken: config.telegram.botToken
      }));
    }
    if (config.discord?.botToken || config.discord?.webhookUrl) {
      this.platforms.set("discord", new DiscordProvider({
        botToken: config.discord.botToken,
        webhookUrl: config.discord.webhookUrl
      }));
    }
    if (config.farcaster?.apiKey) {
      this.platforms.set("farcaster", new FarcasterProvider({
        apiKey: config.farcaster.apiKey,
        signerUuid: config.farcaster.signerUuid
      }));
    }
  }
  initializeTools() {
    this.registerTool({
      name: "search_posts",
      description: "Search for posts across social platforms",
      parameters: z2.object({
        query: z2.string().describe("Search query"),
        platform: z2.string().default("twitter").describe("Platform: twitter, telegram, discord, farcaster"),
        limit: z2.number().default(50).describe("Max posts to return")
      }),
      execute: async (params) => {
        const { query, platform, limit } = params;
        return this.searchPosts(query, platform, limit);
      }
    });
    this.registerTool({
      name: "analyze_sentiment",
      description: "Analyze sentiment for a topic or token",
      parameters: z2.object({
        query: z2.string().describe("Topic or token to analyze"),
        platform: z2.string().default("twitter").describe("Platform to search")
      }),
      execute: async (params) => {
        const { query, platform } = params;
        return this.analyzeSentiment(query, platform);
      }
    });
    this.registerTool({
      name: "get_user",
      description: "Get user profile information",
      parameters: z2.object({
        username: z2.string().describe("Username to lookup"),
        platform: z2.string().default("twitter").describe("Platform name")
      }),
      execute: async (params) => {
        const { username, platform } = params;
        return this.getUser(username, platform);
      }
    });
    this.registerTool({
      name: "analyze_influencer",
      description: "Analyze an influencer's metrics and content",
      parameters: z2.object({
        username: z2.string().describe("Username to analyze"),
        platform: z2.string().default("twitter").describe("Platform name")
      }),
      execute: async (params) => {
        const { username, platform } = params;
        return this.analyzeInfluencer(username, platform);
      }
    });
    this.registerTool({
      name: "generate_post",
      description: "Generate social media post content with AI",
      parameters: z2.object({
        topic: z2.string().describe("Topic to write about"),
        style: z2.string().default("professional").describe("Style: professional, casual, hype"),
        platform: z2.string().default("twitter").describe("Target platform")
      }),
      execute: async (params) => {
        const { topic, style, platform } = params;
        return this.generatePost(topic, style, platform);
      }
    });
  }
  getSystemPrompt() {
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
  async analyze(context) {
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
        { role: "user", content: query }
      ]);
      return this.createResult(
        true,
        { aiSummary: response.content },
        void 0,
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
  async searchPosts(query, platformName = "twitter", limit = 50) {
    const platform = this.platforms.get(platformName);
    if (!platform) {
      this.log(`Platform ${platformName} not configured`);
      return [];
    }
    return platform.searchPosts(query, limit);
  }
  async getUser(username, platformName = "twitter") {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getUser(username);
  }
  async getUserPosts(userId, platformName = "twitter", limit = 50) {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getUserPosts(userId, limit);
  }
  async analyzeSentiment(query, platformName = "twitter") {
    const posts = await this.searchPosts(query, platformName, 100);
    if (posts.length === 0) return null;
    return this.sentimentAnalyzer.analyzeSentiment(posts);
  }
  async analyzeInfluencer(username, platformName = "twitter") {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    const user = await platform.getUser(username);
    if (!user) return null;
    const posts = await platform.getUserPosts(user.id, 100);
    return this.influencerAnalyzer.analyzeInfluencer(user, posts);
  }
  async generatePost(topic, style = "professional", platformName = "twitter") {
    if (!this.llmClient) {
      return `Check out ${topic}! \u{1F680}`;
    }
    const charLimit = platformName === "twitter" ? 280 : 1e3;
    const response = await this.llmClient.chat([
      {
        role: "system",
        content: `Generate a ${style} social media post about ${topic} for ${platformName}.
Max ${charLimit} characters. Include relevant hashtags and emojis.
Make it engaging and authentic to the Web3 community.`
      },
      {
        role: "user",
        content: `Write a ${style} post about: ${topic}`
      }
    ]);
    return response.content.slice(0, charLimit);
  }
  async getSentimentTrend(query, platformName = "twitter", intervalHours = 6) {
    const posts = await this.searchPosts(query, platformName, 200);
    return this.sentimentAnalyzer.analyzeByTime(posts, intervalHours);
  }
  async postToAll(content, platforms) {
    const results = /* @__PURE__ */ new Map();
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
};
export {
  DiscordProvider,
  FarcasterProvider,
  InfluencerAnalyzer,
  SentimentAnalyzer,
  SocialAgent,
  SocialAgentConfigSchema,
  TelegramProvider,
  TwitterProvider
};
//# sourceMappingURL=index.js.map