/**
 * Twitter Automation Module
 *
 * Manages automated Twitter posting for gICM Growth Engine.
 */

import { CronJob } from "cron";
import { TwitterClient } from "./client.js";
import { TweetQueue, type QueuedTweet } from "./queue.js";
import { TweetGenerator } from "./generator.js";
import type { Tweet } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

export interface TwitterManagerConfig {
  tweetsPerDay: number;
  autoGenerate: boolean;
  topics: string[];
}

const DEFAULT_CONFIG: TwitterManagerConfig = {
  tweetsPerDay: 5,
  autoGenerate: true,
  topics: [
    "AI development",
    "Claude Code tips",
    "React components",
    "Solana development",
    "Developer productivity",
  ],
};

export class TwitterManager {
  private logger: Logger;
  private client: TwitterClient;
  private queue: TweetQueue;
  private generator: TweetGenerator;
  private config: TwitterManagerConfig;
  private dailyCron?: CronJob;

  constructor(config: Partial<TwitterManagerConfig> = {}) {
    this.logger = new Logger("TwitterManager");
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.client = new TwitterClient();
    this.queue = new TweetQueue({ maxTweetsPerDay: this.config.tweetsPerDay });
    this.generator = new TweetGenerator();

    // Set up post handler
    this.queue.setPostHandler(async (queued) => {
      await this.postTweet(queued);
    });
  }

  /**
   * Initialize Twitter automation
   */
  async init(): Promise<void> {
    await this.client.init();
    this.logger.info("Twitter manager initialized");
  }

  /**
   * Start automation
   */
  start(): void {
    // Start queue processing
    this.queue.start();

    // Daily content generation at 6 AM UTC
    if (this.config.autoGenerate) {
      this.dailyCron = new CronJob("0 6 * * *", async () => {
        await this.generateDailyContent();
      });
      this.dailyCron.start();
    }

    this.logger.info("Twitter automation started");
  }

  /**
   * Stop automation
   */
  stop(): void {
    this.queue.stop();
    if (this.dailyCron) {
      this.dailyCron.stop();
    }
    this.logger.info("Twitter automation stopped");
  }

  /**
   * Post a tweet
   */
  private async postTweet(queued: QueuedTweet): Promise<void> {
    const result = await this.client.tweet(queued.tweet.content);
    queued.tweet.postedAt = Date.now();
    queued.tweet.twitterId = result.id;
    queued.tweet.status = "posted";
    this.logger.info(`Posted: ${result.id}`);
  }

  /**
   * Generate daily content
   */
  async generateDailyContent(): Promise<Tweet[]> {
    this.logger.info("Generating daily tweet content...");

    const tweets = await this.generator.generateDailyBatch(this.config.tweetsPerDay);

    // Add to queue
    for (const tweet of tweets) {
      this.queue.add(tweet);
    }

    this.logger.info(`Generated and queued ${tweets.length} tweets`);
    return tweets;
  }

  /**
   * Queue a custom tweet
   */
  queueTweet(tweet: Tweet, scheduledFor?: Date): QueuedTweet {
    return this.queue.add(tweet, scheduledFor);
  }

  /**
   * Generate and queue a thread
   */
  async queueThread(topic: string, points: string[]): Promise<QueuedTweet[]> {
    const tweets = await this.generator.generateThread({ topic, points });
    return tweets.map((tweet) => this.queue.add(tweet));
  }

  /**
   * Promote a blog post
   */
  async promoteBlogPost(post: { title: string; excerpt: string; url: string }): Promise<QueuedTweet[]> {
    const tweets = await this.generator.fromBlogPost({
      id: "blog-promo",
      title: post.title,
      slug: "",
      excerpt: post.excerpt,
      content: "",
      category: "announcement",
      tags: [],
      author: "gICM",
      status: "published",
      publishedAt: Date.now(),
      seo: {
        title: post.title,
        description: post.excerpt,
        keywords: [],
      },
      metrics: {
        views: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        shares: 0,
      },
    });

    // Add URL to tweets
    const tweetsWithUrl = tweets.map((tweet) => ({
      ...tweet,
      content: `${tweet.content}\n\n${post.url}`,
    }));

    return tweetsWithUrl.map((tweet) => this.queue.add(tweet));
  }

  /**
   * Get queue status
   */
  getQueueStatus(): ReturnType<TweetQueue["getStatus"]> {
    return this.queue.getStatus();
  }

  /**
   * Get today's schedule
   */
  getTodaySchedule(): QueuedTweet[] {
    return this.queue.getDailySchedule();
  }

  /**
   * Get tweet metrics
   */
  async getMetrics(tweetId: string): Promise<{
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  }> {
    return this.client.getMetrics(tweetId);
  }

  /**
   * Search for conversations to engage with
   */
  async findEngagementOpportunities(query: string): Promise<
    Array<{
      id: string;
      text: string;
      author: string;
      engagement: number;
    }>
  > {
    const tweets = await this.client.search(query, 20);

    return tweets.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author_id || "unknown",
      engagement:
        (tweet.public_metrics?.like_count || 0) +
        (tweet.public_metrics?.retweet_count || 0) * 2,
    }));
  }
}

export { TwitterClient } from "./client.js";
export { TweetQueue, type QueuedTweet } from "./queue.js";
export { TweetGenerator } from "./generator.js";
