import type { SocialPlatform, SocialPost, SocialUser, PostOptions } from "../types.js";

interface TwitterConfig {
  bearerToken?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
  entities?: {
    mentions?: Array<{ username: string }>;
    hashtags?: Array<{ tag: string }>;
  };
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
  };
  verified?: boolean;
  profile_image_url?: string;
}

interface TwitterResponse<T> {
  data?: T;
  includes?: {
    users?: TwitterUser[];
  };
  errors?: Array<{ message: string }>;
}

export class TwitterProvider implements SocialPlatform {
  name = "twitter";
  platform = "twitter" as const;
  private bearerToken?: string;
  private baseUrl = "https://api.twitter.com/2";

  constructor(config: TwitterConfig) {
    this.bearerToken = config.bearerToken;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
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
          ...options?.headers,
        },
      });

      if (!response.ok) {
        console.error(`Twitter API error: ${response.status}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Twitter fetch failed:", error);
      return null;
    }
  }

  async searchPosts(query: string, limit = 50): Promise<SocialPost[]> {
    const params = new URLSearchParams({
      query,
      max_results: Math.min(limit, 100).toString(),
      "tweet.fields": "created_at,public_metrics,entities,author_id",
      expansions: "author_id",
      "user.fields": "username",
    });

    const response = await this.fetch<TwitterResponse<TwitterTweet[]>>(
      `/tweets/search/recent?${params}`
    );

    if (!response?.data) return [];

    const userMap = new Map<string, TwitterUser>();
    response.includes?.users?.forEach((u) => userMap.set(u.id, u));

    return response.data.map((tweet) => {
      const author = userMap.get(tweet.author_id);
      return {
        id: tweet.id,
        platform: "twitter" as const,
        author: author?.username ?? "",
        authorId: tweet.author_id,
        content: tweet.text,
        timestamp: new Date(tweet.created_at),
        likes: tweet.public_metrics?.like_count,
        reposts: tweet.public_metrics?.retweet_count,
        replies: tweet.public_metrics?.reply_count,
        url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        mentions: tweet.entities?.mentions?.map((m) => m.username),
        hashtags: tweet.entities?.hashtags?.map((h) => h.tag),
      };
    });
  }

  async getUser(username: string): Promise<SocialUser | null> {
    const params = new URLSearchParams({
      "user.fields": "description,public_metrics,verified,profile_image_url",
    });

    const response = await this.fetch<TwitterResponse<TwitterUser>>(
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
      url: `https://twitter.com/${user.username}`,
    };
  }

  async getUserPosts(userId: string, limit = 50): Promise<SocialPost[]> {
    const params = new URLSearchParams({
      max_results: Math.min(limit, 100).toString(),
      "tweet.fields": "created_at,public_metrics,entities",
      expansions: "author_id",
      "user.fields": "username",
    });

    const response = await this.fetch<TwitterResponse<TwitterTweet[]>>(
      `/users/${userId}/tweets?${params}`
    );

    if (!response?.data) return [];

    const author = response.includes?.users?.[0];

    return response.data.map((tweet) => ({
      id: tweet.id,
      platform: "twitter" as const,
      author: author?.username ?? "",
      authorId: tweet.author_id,
      content: tweet.text,
      timestamp: new Date(tweet.created_at),
      likes: tweet.public_metrics?.like_count,
      reposts: tweet.public_metrics?.retweet_count,
      replies: tweet.public_metrics?.reply_count,
      url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
      mentions: tweet.entities?.mentions?.map((m) => m.username),
      hashtags: tweet.entities?.hashtags?.map((h) => h.tag),
    }));
  }

  async postMessage(_content: string, _options?: PostOptions): Promise<SocialPost | null> {
    // Would require OAuth 1.0a authentication
    // Simplified placeholder
    console.warn("Twitter posting requires OAuth 1.0a authentication");
    return null;
  }
}
