import type { SocialPlatform, SocialPost, SocialUser, PostOptions } from "../types.js";

interface TelegramConfig {
  botToken?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    username?: string;
    first_name?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  date: number;
  text?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  description?: string;
  photo?: { small_file_id: string };
}

interface TelegramChatMemberCount {
  result: number;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

export class TelegramProvider implements SocialPlatform {
  name = "telegram";
  platform = "telegram" as const;
  private botToken?: string;
  private baseUrl = "https://api.telegram.org/bot";

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
  }

  private async fetch<T>(method: string, params?: Record<string, unknown>): Promise<T | null> {
    if (!this.botToken) {
      console.error("Telegram bot token not configured");
      return null;
    }

    try {
      const url = `${this.baseUrl}${this.botToken}/${method}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: params ? JSON.stringify(params) : undefined,
      });

      const data = (await response.json()) as TelegramResponse<T>;
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

  async searchPosts(_query: string, _limit = 50): Promise<SocialPost[]> {
    // Telegram doesn't have a public search API
    // Would need to use userbot or third-party services
    console.warn("Telegram public search not available via Bot API");
    return [];
  }

  async getUser(username: string): Promise<SocialUser | null> {
    // Get chat info for channels/groups
    const chat = await this.fetch<TelegramChat>("getChat", {
      chat_id: `@${username}`,
    });

    if (!chat) return null;

    // Get member count
    const memberCount = await this.fetch<TelegramChatMemberCount["result"]>(
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
      url: `https://t.me/${chat.username ?? username}`,
    };
  }

  async getUserPosts(_userId: string, _limit = 50): Promise<SocialPost[]> {
    // Bot API doesn't provide message history
    // Would need to use userbot
    console.warn("Telegram message history not available via Bot API");
    return [];
  }

  async postMessage(
    content: string,
    options?: PostOptions & { chatId?: string | number }
  ): Promise<SocialPost | null> {
    const chatId = (options as { chatId?: string | number } | undefined)?.chatId;
    if (!chatId) {
      console.error("Chat ID required for Telegram posting");
      return null;
    }

    const message = await this.fetch<TelegramMessage>("sendMessage", {
      chat_id: chatId,
      text: content,
      reply_to_message_id: options?.replyTo ? parseInt(options.replyTo) : undefined,
    });

    if (!message) return null;

    return {
      id: message.message_id.toString(),
      platform: "telegram",
      author: message.from?.username ?? "",
      authorId: message.from?.id.toString() ?? "",
      content: message.text ?? "",
      timestamp: new Date(message.date * 1000),
    };
  }

  async sendAlert(chatId: string | number, alert: {
    title: string;
    message: string;
    type?: "info" | "warning" | "critical";
  }): Promise<boolean> {
    const emoji = {
      info: "ℹ️",
      warning: "⚠️",
      critical: "🚨",
    };

    const text = `${emoji[alert.type ?? "info"]} *${alert.title}*\n\n${alert.message}`;

    const result = await this.fetch<TelegramMessage>("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });

    return result !== null;
  }
}
