import type { SocialPlatform, SocialPost, SocialUser, PostOptions } from "../types.js";

interface FarcasterConfig {
  apiKey?: string;
  signerUuid?: string;
}

interface FarcasterCast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url?: string;
    follower_count?: number;
    following_count?: number;
  };
  text: string;
  timestamp: string;
  reactions?: {
    likes_count: number;
    recasts_count: number;
  };
  replies?: {
    count: number;
  };
  mentioned_profiles?: Array<{ username: string }>;
  embeds?: Array<{ url?: string }>;
}

interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  profile?: {
    bio?: {
      text?: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications?: string[];
}

interface NeynarResponse<T> {
  result?: T;
  users?: T;
  casts?: T;
}

export class FarcasterProvider implements SocialPlatform {
  name = "farcaster";
  platform = "farcaster" as const;
  private apiKey?: string;
  private signerUuid?: string;
  private baseUrl = "https://api.neynar.com/v2/farcaster";

  constructor(config: FarcasterConfig) {
    this.apiKey = config.apiKey;
    this.signerUuid = config.signerUuid;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
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
          ...options?.headers,
        },
      });

      if (!response.ok) {
        console.error(`Farcaster API error: ${response.status}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Farcaster fetch failed:", error);
      return null;
    }
  }

  async searchPosts(query: string, limit = 50): Promise<SocialPost[]> {
    const response = await this.fetch<NeynarResponse<FarcasterCast[]>>(
      `/cast/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 100)}`
    );

    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];

    return casts.map((cast) => this.mapCast(cast));
  }

  private mapCast(cast: FarcasterCast): SocialPost {
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
      media: cast.embeds
        ?.filter((e) => e.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map((e) => ({ type: "image" as const, url: e.url! })),
    };
  }

  async getUser(username: string): Promise<SocialUser | null> {
    const response = await this.fetch<NeynarResponse<FarcasterUser[]>>(
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
      url: `https://warpcast.com/${user.username}`,
    };
  }

  async getUserPosts(fid: string, limit = 50): Promise<SocialPost[]> {
    const response = await this.fetch<NeynarResponse<FarcasterCast[]>>(
      `/feed/user/casts?fid=${fid}&limit=${Math.min(limit, 100)}`
    );

    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];

    return casts.map((cast) => this.mapCast(cast));
  }

  async postMessage(content: string, options?: PostOptions): Promise<SocialPost | null> {
    if (!this.signerUuid) {
      console.error("Farcaster signer UUID required for posting");
      return null;
    }

    const response = await this.fetch<{ cast: FarcasterCast }>("/cast", {
      method: "POST",
      body: JSON.stringify({
        signer_uuid: this.signerUuid,
        text: content,
        parent: options?.replyTo,
        embeds: options?.media?.map((m) => ({ url: m.url })),
      }),
    });

    if (!response?.cast) return null;
    return this.mapCast(response.cast);
  }

  async getTrendingCasts(limit = 20): Promise<SocialPost[]> {
    const response = await this.fetch<NeynarResponse<FarcasterCast[]>>(
      `/feed/trending?limit=${Math.min(limit, 100)}`
    );

    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];

    return casts.map((cast) => this.mapCast(cast));
  }

  async getChannelCasts(channelId: string, limit = 50): Promise<SocialPost[]> {
    const response = await this.fetch<NeynarResponse<FarcasterCast[]>>(
      `/feed/channel?channel_id=${channelId}&limit=${Math.min(limit, 100)}`
    );

    const casts = response?.result ?? response?.casts ?? [];
    if (!Array.isArray(casts)) return [];

    return casts.map((cast) => this.mapCast(cast));
  }
}
