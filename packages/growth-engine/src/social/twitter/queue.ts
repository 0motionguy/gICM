/**
 * Tweet Queue
 *
 * Manages scheduled tweets with rate limiting and optimal timing.
 */

import { CronJob } from "cron";
import type { Tweet, TweetType } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

export interface QueuedTweet {
  id: string;
  tweet: Tweet;
  scheduledFor: Date;
  status: "pending" | "posted" | "failed";
  attempts: number;
  error?: string;
}

export interface QueueConfig {
  maxTweetsPerDay: number;
  optimalHours: number[]; // UTC hours
  minIntervalMinutes: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxTweetsPerDay: 5,
  optimalHours: [14, 16, 18, 20, 22], // UTC - targeting US hours
  minIntervalMinutes: 60,
};

export class TweetQueue {
  private logger: Logger;
  private queue: QueuedTweet[] = [];
  private config: QueueConfig;
  private cronJob?: CronJob;
  private onPost?: (tweet: QueuedTweet) => Promise<void>;

  constructor(config: Partial<QueueConfig> = {}) {
    this.logger = new Logger("TweetQueue");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the post handler
   */
  setPostHandler(handler: (tweet: QueuedTweet) => Promise<void>): void {
    this.onPost = handler;
  }

  /**
   * Start queue processing
   */
  start(): void {
    // Check queue every 5 minutes
    this.cronJob = new CronJob("*/5 * * * *", async () => {
      await this.processQueue();
    });
    this.cronJob.start();
    this.logger.info("Tweet queue started");
  }

  /**
   * Stop queue processing
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
    this.logger.info("Tweet queue stopped");
  }

  /**
   * Add tweet to queue
   */
  add(tweet: Tweet, scheduledFor?: Date): QueuedTweet {
    const scheduled = scheduledFor || this.findNextSlot();

    const queued: QueuedTweet = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tweet,
      scheduledFor: scheduled,
      status: "pending",
      attempts: 0,
    };

    this.queue.push(queued);
    this.queue.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

    this.logger.info(`Queued tweet for ${scheduled.toISOString()}: ${tweet.content.substring(0, 50)}...`);
    return queued;
  }

  /**
   * Add multiple tweets
   */
  addBatch(tweets: Tweet[]): QueuedTweet[] {
    return tweets.map((tweet) => this.add(tweet));
  }

  /**
   * Find next available slot
   */
  private findNextSlot(): Date {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Count tweets scheduled for today
    const todayTweets = this.queue.filter((q) => {
      const qDate = new Date(q.scheduledFor);
      qDate.setHours(0, 0, 0, 0);
      return qDate.getTime() === today.getTime() && q.status === "pending";
    });

    // Find last scheduled time
    let lastTime = now;
    if (this.queue.length > 0) {
      const lastPending = [...this.queue].reverse().find((q) => q.status === "pending");
      if (lastPending && lastPending.scheduledFor > now) {
        lastTime = lastPending.scheduledFor;
      }
    }

    // If we've hit the daily limit, schedule for tomorrow
    if (todayTweets.length >= this.config.maxTweetsPerDay) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(this.config.optimalHours[0], 0, 0, 0);
      return tomorrow;
    }

    // Find next optimal hour
    const currentHour = now.getUTCHours();
    let nextHour = this.config.optimalHours.find((h) => h > currentHour);

    if (!nextHour) {
      // Next day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setUTCHours(this.config.optimalHours[0], 0, 0, 0);
      return tomorrow;
    }

    // Ensure minimum interval
    const nextSlot = new Date(now);
    nextSlot.setUTCHours(nextHour, 0, 0, 0);

    const minNext = new Date(lastTime.getTime() + this.config.minIntervalMinutes * 60 * 1000);

    return nextSlot > minNext ? nextSlot : minNext;
  }

  /**
   * Process queue
   */
  private async processQueue(): Promise<void> {
    const now = new Date();
    const dueItems = this.queue.filter(
      (q) => q.status === "pending" && q.scheduledFor <= now
    );

    for (const item of dueItems) {
      if (!this.onPost) {
        this.logger.warn("No post handler set");
        continue;
      }

      try {
        item.attempts++;
        await this.onPost(item);
        item.status = "posted";
        this.logger.info(`Posted tweet: ${item.id}`);
      } catch (error) {
        item.error = String(error);
        if (item.attempts >= 3) {
          item.status = "failed";
          this.logger.error(`Tweet failed after 3 attempts: ${item.id}`);
        } else {
          // Retry in 15 minutes
          item.scheduledFor = new Date(now.getTime() + 15 * 60 * 1000);
          this.logger.warn(`Tweet ${item.id} failed, retry scheduled`);
        }
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): {
    pending: number;
    posted: number;
    failed: number;
    nextUp: QueuedTweet | null;
  } {
    const pending = this.queue.filter((q) => q.status === "pending").length;
    const posted = this.queue.filter((q) => q.status === "posted").length;
    const failed = this.queue.filter((q) => q.status === "failed").length;
    const nextUp = this.queue.find((q) => q.status === "pending") || null;

    return { pending, posted, failed, nextUp };
  }

  /**
   * Get all queued tweets
   */
  getQueue(): QueuedTweet[] {
    return [...this.queue];
  }

  /**
   * Remove tweet from queue
   */
  remove(id: string): boolean {
    const index = this.queue.findIndex((q) => q.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all pending tweets
   */
  clearPending(): number {
    const before = this.queue.length;
    this.queue = this.queue.filter((q) => q.status !== "pending");
    return before - this.queue.length;
  }

  /**
   * Get daily schedule
   */
  getDailySchedule(date: Date = new Date()): QueuedTweet[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return this.queue.filter(
      (q) => q.scheduledFor >= startOfDay && q.scheduledFor < endOfDay
    );
  }
}
