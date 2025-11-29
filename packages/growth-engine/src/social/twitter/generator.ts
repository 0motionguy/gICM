/**
 * Tweet Generator
 *
 * AI-powered tweet content generation.
 */

import type { Tweet, TweetType, BlogPost } from "../../core/types.js";
import { generateText, generateJSON } from "../../utils/llm.js";
import { Logger } from "../../utils/logger.js";

export interface TweetGeneratorConfig {
  brand: {
    name: string;
    handle: string;
    voice: string;
    topics: string[];
  };
}

const DEFAULT_CONFIG: TweetGeneratorConfig = {
  brand: {
    name: "gICM",
    handle: "@gICM_dev",
    voice: "Technical but accessible. Excited about AI and crypto. Helpful, not salesy.",
    topics: [
      "AI development tools",
      "Claude Code",
      "Solana/Web3",
      "React components",
      "Developer productivity",
      "Vibe coding",
    ],
  },
};

export class TweetGenerator {
  private logger: Logger;
  private config: TweetGeneratorConfig;

  constructor(config: Partial<TweetGeneratorConfig> = {}) {
    this.logger = new Logger("TweetGenerator");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a tweet for a topic
   */
  async generate(options: {
    topic: string;
    type: TweetType;
    context?: string;
  }): Promise<Tweet> {
    this.logger.info(`Generating ${options.type} tweet about: ${options.topic}`);

    const content = await generateText({
      systemPrompt: `You are the social media voice for ${this.config.brand.name}.
Voice: ${this.config.brand.voice}
Topics we cover: ${this.config.brand.topics.join(", ")}

Rules:
- Keep under 280 characters
- Use 1-2 relevant emojis max
- No hashtag spam (max 2)
- Be genuine, not marketing-speak
- Make it valuable, not just promotional`,
      prompt: `Write a ${options.type} tweet about: ${options.topic}

${options.context ? `Context: ${options.context}` : ""}

Type guidelines:
- insight: Share something smart/useful about the topic
- announcement: Announce news (not too hyped)
- thread_hook: Hook for a thread (end with "🧵" or similar)
- engagement: Ask a question or share opinion
- tip: Share a practical tip

Just return the tweet text, nothing else.`,
    });

    return {
      id: `tweet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      type: options.type,
      topic: options.topic,
      scheduledFor: new Date(),
      status: "draft",
      metrics: {
        impressions: 0,
        engagements: 0,
        clicks: 0,
        retweets: 0,
        likes: 0,
      },
    };
  }

  /**
   * Generate a thread
   */
  async generateThread(options: {
    topic: string;
    points: string[];
    maxTweets?: number;
  }): Promise<Tweet[]> {
    this.logger.info(`Generating thread about: ${options.topic}`);

    const threadContent = await generateJSON<{ tweets: string[] }>({
      systemPrompt: `You are the social media voice for ${this.config.brand.name}.
Voice: ${this.config.brand.voice}`,
      prompt: `Create a Twitter thread about: ${options.topic}

Key points to cover:
${options.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Rules:
- First tweet: Hook that makes people want to read more
- Each tweet: Under 280 chars, can stand alone but flows together
- Last tweet: CTA or summary
- Max ${options.maxTweets || 7} tweets
- Number tweets like "1/", "2/", etc.
- Use emojis sparingly

Return JSON: { "tweets": ["tweet1", "tweet2", ...] }`,
    });

    return threadContent.tweets.map((content, index) => ({
      id: `tweet-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      type: index === 0 ? "thread_hook" : "insight",
      topic: options.topic,
      scheduledFor: new Date(),
      status: "draft",
      threadPosition: index,
      metrics: {
        impressions: 0,
        engagements: 0,
        clicks: 0,
        retweets: 0,
        likes: 0,
      },
    }));
  }

  /**
   * Generate tweet from blog post
   */
  async fromBlogPost(post: BlogPost): Promise<Tweet[]> {
    this.logger.info(`Generating tweets from blog: ${post.title}`);

    // Generate main announcement tweet
    const announcement = await this.generate({
      topic: post.title,
      type: "announcement",
      context: post.excerpt,
    });

    // Generate a tip/insight tweet
    const insight = await this.generate({
      topic: post.title,
      type: "tip",
      context: `Key takeaway from our blog: ${post.excerpt}`,
    });

    return [announcement, insight];
  }

  /**
   * Generate daily content batch
   */
  async generateDailyBatch(count: number = 5): Promise<Tweet[]> {
    const tweets: Tweet[] = [];
    const types: TweetType[] = ["insight", "tip", "engagement", "insight", "tip"];

    for (let i = 0; i < count; i++) {
      const topic = this.config.brand.topics[i % this.config.brand.topics.length];
      const type = types[i % types.length];

      const tweet = await this.generate({ topic, type });
      tweets.push(tweet);
    }

    return tweets;
  }

  /**
   * Generate engagement tweet (question/poll hook)
   */
  async generateEngagement(topic: string): Promise<Tweet> {
    return this.generate({
      topic,
      type: "engagement",
      context: "Ask an interesting question that developers would want to answer",
    });
  }

  /**
   * Improve/rewrite a tweet
   */
  async improve(originalTweet: string, feedback: string): Promise<string> {
    const improved = await generateText({
      systemPrompt: `You are improving tweets for ${this.config.brand.name}.
Voice: ${this.config.brand.voice}`,
      prompt: `Improve this tweet based on feedback:

Original: "${originalTweet}"
Feedback: ${feedback}

Return only the improved tweet text.`,
    });

    return improved.trim();
  }

  /**
   * Check tweet for issues
   */
  async review(tweet: string): Promise<{
    isGood: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    return generateJSON({
      prompt: `Review this tweet for ${this.config.brand.name}:

"${tweet}"

Check for:
- Length (must be under 280 chars)
- Tone (matches brand voice)
- Value (provides something useful)
- Grammar/typos
- Overuse of emojis or hashtags
- Marketing-speak to avoid

Return JSON: { "isGood": true/false, "issues": [...], "suggestions": [...] }`,
    });
  }
}
