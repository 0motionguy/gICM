import type { SocialPlatform, SocialPost, SocialUser, PostOptions } from "../types.js";

interface DiscordConfig {
  botToken?: string;
  webhookUrl?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  approximate_member_count?: number;
}

interface DiscordMessage {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  reactions?: Array<{
    count: number;
    emoji: { name: string };
  }>;
  mentions?: DiscordUser[];
}

interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string };
    timestamp?: string;
  }>;
}

export class DiscordProvider implements SocialPlatform {
  name = "discord";
  platform = "discord" as const;
  private botToken?: string;
  private webhookUrl?: string;
  private baseUrl = "https://discord.com/api/v10";

  constructor(config: DiscordConfig) {
    this.botToken = config.botToken;
    this.webhookUrl = config.webhookUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
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
          ...options?.headers,
        },
      });

      if (!response.ok) {
        console.error(`Discord API error: ${response.status}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Discord fetch failed:", error);
      return null;
    }
  }

  async searchPosts(_query: string, _limit = 50): Promise<SocialPost[]> {
    // Discord doesn't have a public search API for bots
    // Would need specific channel access
    console.warn("Discord search requires channel-specific access");
    return [];
  }

  async getUser(userId: string): Promise<SocialUser | null> {
    const user = await this.fetch<DiscordUser>(`/users/${userId}`);
    if (!user) return null;

    return {
      id: user.id,
      platform: "discord",
      username: user.username,
      displayName: `${user.username}#${user.discriminator}`,
      followers: 0,
      following: 0,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined,
    };
  }

  async getUserPosts(_userId: string, _limit = 50): Promise<SocialPost[]> {
    // Would need to search through channels the user has posted in
    console.warn("Discord user posts require channel access");
    return [];
  }

  async getChannelMessages(channelId: string, limit = 50): Promise<SocialPost[]> {
    const messages = await this.fetch<DiscordMessage[]>(
      `/channels/${channelId}/messages?limit=${Math.min(limit, 100)}`
    );

    if (!messages) return [];

    return messages.map((msg) => ({
      id: msg.id,
      platform: "discord" as const,
      author: msg.author.username,
      authorId: msg.author.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      likes: msg.reactions?.reduce((sum, r) => sum + r.count, 0),
      mentions: msg.mentions?.map((m) => m.username),
    }));
  }

  async postMessage(
    content: string,
    options?: PostOptions & { channelId?: string }
  ): Promise<SocialPost | null> {
    const channelId = (options as { channelId?: string } | undefined)?.channelId;
    if (!channelId) {
      console.error("Channel ID required for Discord posting");
      return null;
    }

    const message = await this.fetch<DiscordMessage>(`/channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
        message_reference: options?.replyTo
          ? { message_id: options.replyTo }
          : undefined,
      }),
    });

    if (!message) return null;

    return {
      id: message.id,
      platform: "discord",
      author: message.author.username,
      authorId: message.author.id,
      content: message.content,
      timestamp: new Date(message.timestamp),
    };
  }

  async sendWebhook(payload: DiscordWebhookPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.error("Discord webhook URL not configured");
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error("Discord webhook failed:", error);
      return false;
    }
  }

  async sendAlert(alert: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: string;
  }): Promise<boolean> {
    return this.sendWebhook({
      embeds: [
        {
          title: alert.title,
          description: alert.description,
          color: alert.color ?? 0x5865f2, // Discord blurple
          fields: alert.fields,
          footer: alert.footer ? { text: alert.footer } : undefined,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  async getGuild(guildId: string): Promise<DiscordGuild | null> {
    return this.fetch<DiscordGuild>(`/guilds/${guildId}?with_counts=true`);
  }
}
