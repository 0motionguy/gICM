/**
 * gICM Growth Engine
 *
 * Autonomous content and marketing automation.
 * Goal: 10x traffic every 6 months through:
 * - 3 blog posts/week
 * - 5 tweets/day
 * - SEO optimization
 * - Discord engagement
 */

import { CronJob } from "cron";
import type { GrowthEngineConfig, GrowthMetrics, ContentCalendar } from "./core/types.js";
import { BlogGenerator } from "./content/blog/generator.js";
import { TwitterManager } from "./social/twitter/index.js";
import { KeywordResearcher, SEOOptimizer } from "./seo/index.js";
import { Logger } from "./utils/logger.js";

export interface EngineStatus {
  running: boolean;
  startedAt: number | null;
  metrics: GrowthMetrics;
  upcomingContent: ContentCalendar;
}

export class GrowthEngine {
  private logger: Logger;
  private config: GrowthEngineConfig;

  private blogGenerator: BlogGenerator;
  private twitterManager: TwitterManager;
  private keywordResearcher: KeywordResearcher;
  private seoOptimizer: SEOOptimizer;

  private weeklyBlogCron?: CronJob;
  private metricsCollectCron?: CronJob;

  private status: EngineStatus = {
    running: false,
    startedAt: null,
    metrics: {
      traffic: { daily: 0, weekly: 0, monthly: 0, trend: "stable" },
      content: { postsPublished: 0, totalViews: 0, avgEngagement: 0 },
      engagement: { twitterFollowers: 0, discordMembers: 0, newsletterSubs: 0 },
      seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 },
    },
    upcomingContent: {
      week: new Date().toISOString().split("T")[0],
      blogPosts: [],
      tweets: [],
      threads: [],
    },
  };

  constructor(config?: Partial<GrowthEngineConfig>) {
    this.logger = new Logger("GrowthEngine");

    this.config = {
      blog: {
        postsPerWeek: config?.blog?.postsPerWeek || 3,
        categories: config?.blog?.categories || ["tutorial", "guide", "announcement"],
        targetWordCount: config?.blog?.targetWordCount || 1500,
      },
      twitter: {
        tweetsPerDay: config?.twitter?.tweetsPerDay || 5,
        threadsPerWeek: config?.twitter?.threadsPerWeek || 2,
        engagementEnabled: config?.twitter?.engagementEnabled ?? true,
      },
      seo: {
        primaryKeywords: config?.seo?.primaryKeywords || [],
        competitors: config?.seo?.competitors || [],
        targetPositions: config?.seo?.targetPositions || {},
      },
      discord: {
        serverId: config?.discord?.serverId || "",
        announcementChannel: config?.discord?.announcementChannel || "",
        contentChannel: config?.discord?.contentChannel || "",
      },
    };

    this.blogGenerator = new BlogGenerator();
    this.twitterManager = new TwitterManager({
      tweetsPerDay: this.config.twitter.tweetsPerDay,
    });
    this.keywordResearcher = new KeywordResearcher();
    this.seoOptimizer = new SEOOptimizer();
  }

  /**
   * Start the Growth Engine
   */
  async start(): Promise<void> {
    this.logger.info("Starting Growth Engine...");

    try {
      // Initialize Twitter
      await this.twitterManager.init();
      this.twitterManager.start();

      // Weekly blog generation (Sunday at 6 AM)
      this.weeklyBlogCron = new CronJob("0 6 * * 0", async () => {
        await this.generateWeeklyContent();
      });
      this.weeklyBlogCron.start();

      // Metrics collection (every 6 hours)
      this.metricsCollectCron = new CronJob("0 */6 * * *", async () => {
        await this.collectMetrics();
      });
      this.metricsCollectCron.start();

      this.status.running = true;
      this.status.startedAt = Date.now();

      this.logger.info("Growth Engine started successfully!");
      this.logger.info(`- Blog: ${this.config.blog.postsPerWeek} posts/week`);
      this.logger.info(`- Twitter: ${this.config.twitter.tweetsPerDay} tweets/day`);
    } catch (error) {
      this.logger.error(`Failed to start: ${error}`);
      throw error;
    }
  }

  /**
   * Stop the Growth Engine
   */
  stop(): void {
    this.logger.info("Stopping Growth Engine...");

    this.twitterManager.stop();

    if (this.weeklyBlogCron) {
      this.weeklyBlogCron.stop();
    }

    if (this.metricsCollectCron) {
      this.metricsCollectCron.stop();
    }

    this.status.running = false;
    this.logger.info("Growth Engine stopped");
  }

  /**
   * Generate weekly content
   */
  async generateWeeklyContent(): Promise<void> {
    this.logger.info("Generating weekly content...");

    // Research keywords for the week
    const keywords = await this.keywordResearcher.findContentGaps();
    const topKeywords = keywords.slice(0, 5);

    // Generate blog posts
    for (let i = 0; i < this.config.blog.postsPerWeek; i++) {
      const keyword = topKeywords[i % topKeywords.length];
      const category = this.config.blog.categories[i % this.config.blog.categories.length];

      try {
        const post = await this.blogGenerator.generate({
          topic: keyword.keyword,
          category: category as "tutorial" | "announcement" | "comparison" | "guide" | "case-study" | "thought-leadership" | "changelog",
          targetWordCount: this.config.blog.targetWordCount,
        });

        // Analyze SEO
        const analysis = await this.seoOptimizer.analyzeBlogPost(post);

        if (analysis.score < 70) {
          // Optimize if needed
          post.content = await this.seoOptimizer.optimize(
            post.content,
            post.tags,
            analysis
          );
        }

        this.status.upcomingContent.blogPosts.push(post);
        this.status.metrics.content.blogPosts++;

        // Promote on Twitter
        await this.twitterManager.promoteBlogPost({
          title: post.title,
          excerpt: post.excerpt,
          url: `https://gicm.dev/blog/${post.slug}`,
        });

        this.logger.info(`Generated blog post: ${post.title}`);
      } catch (error) {
        this.logger.error(`Blog generation failed: ${error}`);
      }
    }

    // Generate daily tweets for the week
    await this.twitterManager.generateDailyContent();
  }

  /**
   * Collect metrics
   */
  async collectMetrics(): Promise<void> {
    this.logger.info("Collecting metrics...");

    const queueStatus = this.twitterManager.getQueueStatus();

    this.status.metrics.content.tweets = queueStatus.posted;

    this.logger.info(`Metrics: ${JSON.stringify(this.status.metrics)}`);
  }

  /**
   * Get current status
   */
  getStatus(): EngineStatus {
    return { ...this.status };
  }

  /**
   * Generate content now
   */
  async generateNow(type: "blog" | "tweet" | "thread"): Promise<void> {
    switch (type) {
      case "blog":
        const post = await this.blogGenerator.generate({
          topic: "AI development tools",
          category: "tutorial",
        });
        this.logger.info(`Generated blog: ${post.title}`);
        break;

      case "tweet":
        await this.twitterManager.generateDailyContent();
        this.logger.info("Generated daily tweets");
        break;

      case "thread":
        await this.twitterManager.queueThread("AI Development", [
          "Introduction to AI tools",
          "Key benefits",
          "Getting started",
        ]);
        this.logger.info("Queued thread");
        break;
    }
  }

  /**
   * Research keywords
   */
  async researchKeywords(topic: string): Promise<void> {
    const keywords = await this.keywordResearcher.research(topic);
    this.logger.info(`Found ${keywords.length} keywords for "${topic}"`);
    keywords.forEach((k) => {
      this.logger.info(`  - ${k.keyword} (vol: ${k.volume}, diff: ${k.difficulty})`);
    });
  }
}

// Exports
export { BlogGenerator } from "./content/blog/generator.js";
export { TwitterManager, TwitterClient, TweetGenerator, TweetQueue } from "./social/twitter/index.js";
export { KeywordResearcher, SEOOptimizer } from "./seo/index.js";
export * from "./core/types.js";
