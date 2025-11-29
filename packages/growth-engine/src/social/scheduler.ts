/**
 * Social Media Scheduler
 *
 * Automated scheduling and posting for social media platforms.
 */

import { CronJob } from "cron";
import type {
  SocialPost,
  Tweet,
  ContentCalendar,
  ContentSlot,
  ScheduledContent,
} from "../core/types.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("SocialScheduler");

// ============================================================================
// DEFAULT SCHEDULE
// ============================================================================

const DEFAULT_POSTING_TIMES = {
  twitter: [
    "09:00",   // EU morning
    "14:00",   // US East morning
    "18:00",   // US West morning
    "22:00",   // Asia morning
  ],
  discord: ["09:00", "15:00", "21:00"],
  linkedin: ["09:00", "12:00"],
};

const DEFAULT_CONTENT_MIX = {
  product_updates: 0.30,
  educational: 0.25,
  engagement: 0.20,
  memes: 0.15,
  alpha: 0.10,
};

// ============================================================================
// TWEET TEMPLATES
// ============================================================================

const TWEET_TEMPLATES = {
  product_update: `
🚀 New: {feature_name}

{one_line_description}

{key_benefit}

Try it now: {link}
  `.trim(),

  educational: `
💡 {title}

{tip_content}

Thread 🧵👇
  `.trim(),

  engagement: `
❓ {question}

A) {option_a}
B) {option_b}
C) {option_c}

Reply with your answer!
  `.trim(),

  alpha: `
🔥 {insight}

Based on our AI analysis:
{analysis}

NFA, DYOR
  `.trim(),

  meme: `
{meme_text}

{hashtags}
  `.trim(),
};

// ============================================================================
// SCHEDULER
// ============================================================================

export interface SchedulerConfig {
  timezone: string;
  enableTwitter: boolean;
  enableDiscord: boolean;
  postingTimes?: typeof DEFAULT_POSTING_TIMES;
  contentMix?: typeof DEFAULT_CONTENT_MIX;
}

export class SocialScheduler {
  private config: SchedulerConfig;
  private queue: ScheduledContent[] = [];
  private jobs: Map<string, CronJob> = new Map();
  private postHandler?: (post: ScheduledContent) => Promise<void>;

  constructor(config: SchedulerConfig) {
    this.config = {
      ...config,
      postingTimes: config.postingTimes ?? DEFAULT_POSTING_TIMES,
      contentMix: config.contentMix ?? DEFAULT_CONTENT_MIX,
    };
  }

  /**
   * Set the post handler
   */
  setPostHandler(handler: (post: ScheduledContent) => Promise<void>): void {
    this.postHandler = handler;
  }

  /**
   * Add content to the queue
   */
  schedule(content: Omit<ScheduledContent, "id" | "status">): ScheduledContent {
    const scheduled: ScheduledContent = {
      ...content,
      id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "scheduled",
    };

    this.queue.push(scheduled);
    this.queue.sort((a, b) => a.scheduledFor - b.scheduledFor);

    logger.info(`Scheduled ${content.type}: ${content.title} for ${new Date(content.scheduledFor).toISOString()}`);

    return scheduled;
  }

  /**
   * Get upcoming scheduled content
   */
  getUpcoming(limit: number = 10): ScheduledContent[] {
    const now = Date.now();
    return this.queue
      .filter(c => c.scheduledFor > now && c.status === "scheduled")
      .slice(0, limit);
  }

  /**
   * Get next posting time for a platform
   */
  getNextPostingTime(platform: "twitter" | "discord" | "linkedin"): Date {
    const times = this.config.postingTimes?.[platform] ?? ["09:00"];
    const now = new Date();
    const timezone = this.config.timezone;

    // Find next time slot
    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const candidate = new Date(now);
      candidate.setHours(hours, minutes, 0, 0);

      if (candidate > now) {
        return candidate;
      }
    }

    // Next day, first time slot
    const [hours, minutes] = times[0].split(":").map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    return tomorrow;
  }

  /**
   * Generate content calendar for the week
   */
  generateWeeklyCalendar(): ContentCalendar {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
    const schedule: ContentCalendar["schedule"] = {} as ContentCalendar["schedule"];

    for (const day of days) {
      schedule[day] = [];

      // Add Twitter slots
      if (this.config.enableTwitter) {
        for (const time of this.config.postingTimes?.twitter ?? []) {
          schedule[day].push({
            time,
            type: "tweet",
            template: this.getRandomTemplate(),
          });
        }
      }

      // Add Discord slots
      if (this.config.enableDiscord) {
        for (const time of this.config.postingTimes?.discord ?? []) {
          schedule[day].push({
            time,
            type: "discord",
          });
        }
      }
    }

    return {
      schedule,
      upcoming: this.getUpcoming(20),
      mix: {
        blog: 3,  // 3 posts per week
        twitter: 5, // 5 tweets per day
        discord: 3, // 3 updates per day
      },
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    logger.info("Starting social scheduler...");

    // Check queue every minute
    const checkJob = new CronJob("* * * * *", async () => {
      await this.processQueue();
    });
    checkJob.start();
    this.jobs.set("queue-check", checkJob);

    logger.info("Social scheduler started");
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
    }
    this.jobs.clear();
    logger.info("Social scheduler stopped");
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    const now = Date.now();
    const ready = this.queue.filter(
      c => c.scheduledFor <= now && c.status === "scheduled"
    );

    for (const content of ready) {
      try {
        if (this.postHandler) {
          await this.postHandler(content);
          content.status = "published";
          logger.info(`Posted: ${content.title}`);
        }
      } catch (error) {
        content.status = "failed";
        logger.error(`Failed to post: ${content.title} - ${error}`);
      }
    }

    // Remove processed items
    this.queue = this.queue.filter(c => c.status === "scheduled");
  }

  /**
   * Get a random template based on content mix
   */
  private getRandomTemplate(): string {
    const mix = this.config.contentMix ?? DEFAULT_CONTENT_MIX;
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, weight] of Object.entries(mix)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return type;
      }
    }

    return "educational";
  }

  /**
   * Get tweet template
   */
  getTweetTemplate(type: keyof typeof TWEET_TEMPLATES): string {
    return TWEET_TEMPLATES[type];
  }
}

// Export factory
export function createSocialScheduler(config: SchedulerConfig): SocialScheduler {
  return new SocialScheduler(config);
}
