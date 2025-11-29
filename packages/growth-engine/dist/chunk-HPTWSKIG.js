// src/index.ts
import { CronJob as CronJob3 } from "cron";

// src/content/blog/generator.ts
import slugify from "slugify";
import readingTime from "reading-time";

// src/utils/llm.ts
import Anthropic from "@anthropic-ai/sdk";
var anthropicClient = null;
function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}
async function generateText(options) {
  const client = getAnthropicClient();
  const messages = [
    { role: "user", content: options.prompt }
  ];
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 4e3,
    system: options.systemPrompt,
    messages
  });
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }
  return content.text;
}
async function generateJSON(options) {
  const text = await generateText({
    ...options,
    prompt: `${options.prompt}

Respond with valid JSON only, no other text.`
  });
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) {
    throw new Error("No JSON found in response");
  }
  return JSON.parse(match[0]);
}

// src/utils/logger.ts
import pino from "pino";
var Logger = class {
  pino;
  context;
  constructor(context) {
    this.context = context;
    this.pino = pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard"
        }
      }
    });
  }
  info(message, data) {
    this.pino.info({ context: this.context, ...data }, message);
  }
  warn(message, data) {
    this.pino.warn({ context: this.context, ...data }, message);
  }
  error(message, data) {
    this.pino.error({ context: this.context, ...data }, message);
  }
  debug(message, data) {
    this.pino.debug({ context: this.context, ...data }, message);
  }
};

// src/content/blog/generator.ts
var BlogGenerator = class {
  logger;
  constructor() {
    this.logger = new Logger("BlogGenerator");
  }
  /**
   * Generate a complete blog post
   */
  async generate(options) {
    this.logger.info(`Generating blog post: ${options.topic}`);
    const keywords = options.targetKeywords || await this.findKeywords(options.topic, 5);
    this.logger.info(`Target keywords: ${keywords.join(", ")}`);
    const content = await this.generateContent(options, keywords);
    const title = await this.generateTitle(options.topic, keywords);
    const excerpt = await this.generateExcerpt(content);
    const seo = await this.generateSEO(options.topic, content, keywords);
    const slug = slugify(title, { lower: true, strict: true });
    const stats = readingTime(content);
    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      slug,
      excerpt,
      content,
      author: "gICM Team",
      category: options.category,
      tags: keywords.slice(0, 5),
      seo,
      readingTime: Math.ceil(stats.minutes),
      wordCount: stats.words,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: []
    };
    this.logger.info(`Generated post: ${post.title} (${post.wordCount} words)`);
    return post;
  }
  /**
   * Find relevant keywords for a topic
   */
  async findKeywords(topic, count) {
    try {
      const result = await generateJSON({
        prompt: `Find ${count} relevant SEO keywords for: "${topic}"

Context: gICM is an AI-powered development platform for Solana/Web3 and general coding.

Return as JSON array of strings:
["keyword1", "keyword2", ...]

Focus on keywords developers actually search for.`
      });
      return result;
    } catch {
      return [topic];
    }
  }
  /**
   * Generate the main content
   */
  async generateContent(options, keywords) {
    const lengthGuide = {
      short: "800-1200 words",
      medium: "1500-2000 words",
      long: "2500-3500 words"
    };
    const prompt = `Write a comprehensive blog post about: "${options.topic}"

Target audience: Developers interested in AI tools, Solana/Web3 development, and coding automation.

Requirements:
- Length: ${lengthGuide[options.length || "medium"]}
- Tone: ${options.tone || "professional"} but approachable
- Category: ${options.category}
- Must naturally include these keywords: ${keywords.join(", ")}
${options.includeCodeExamples ? "- Include practical code examples with explanations" : ""}

Structure:
1. Compelling introduction that hooks the reader
2. Clear H2 and H3 headers for sections
3. Practical, actionable content
4. ${options.includeCodeExamples ? "Code examples with TypeScript/JavaScript" : "Step-by-step instructions"}
5. Conclusion with clear call-to-action for gICM

Format: Markdown

Important:
- Write for developers, not marketers
- Be specific and technical where appropriate
- Include real-world use cases
- Reference gICM features naturally (not salesy)
- Add value that makes readers want to share`;
    return generateText({
      prompt,
      maxTokens: 4e3
    });
  }
  /**
   * Generate SEO-optimized title
   */
  async generateTitle(topic, keywords) {
    const text = await generateText({
      prompt: `Generate a compelling, SEO-optimized blog title for: "${topic}"

Requirements:
- 50-60 characters ideal
- Include primary keyword: "${keywords[0]}"
- Make it click-worthy but not clickbait
- Should work for developers/technical audience

Provide just the title, nothing else.`,
      maxTokens: 100
    });
    return text.trim().replace(/^["']|["']$/g, "");
  }
  /**
   * Generate excerpt
   */
  async generateExcerpt(content) {
    const text = await generateText({
      prompt: `Generate a compelling excerpt/summary for this blog post (150-160 characters, good for meta description):

${content.slice(0, 1e3)}...

Provide just the excerpt, nothing else.`,
      maxTokens: 100
    });
    return text.trim().replace(/^["']|["']$/g, "");
  }
  /**
   * Generate SEO metadata
   */
  async generateSEO(topic, content, keywords) {
    try {
      const result = await generateJSON({
        prompt: `Generate SEO metadata for a blog post about "${topic}":

Content preview:
${content.slice(0, 500)}...

Target keywords: ${keywords.join(", ")}

Return JSON:
{
  "title": "<60 chars, include primary keyword>",
  "description": "<155 chars, compelling, include keyword>",
  "keywords": ["<5-8 relevant keywords>"]
}`
      });
      return result;
    } catch {
      return {
        title: topic,
        description: content.slice(0, 155),
        keywords
      };
    }
  }
  /**
   * Generate blog post from template
   */
  async generateFromTemplate(template, variables) {
    let topic = template.topicTemplate;
    for (const [key, value] of Object.entries(variables)) {
      topic = topic.replace(`{${key}}`, value);
    }
    return this.generate({
      topic,
      category: template.category,
      targetKeywords: template.defaultKeywords,
      tone: template.tone,
      length: template.length,
      includeCodeExamples: template.includeCode
    });
  }
};

// src/social/twitter/index.ts
import { CronJob as CronJob2 } from "cron";

// src/social/twitter/client.ts
import { TwitterApi } from "twitter-api-v2";
var TwitterClient = class {
  client;
  logger;
  userId;
  constructor(config) {
    this.logger = new Logger("TwitterClient");
    const credentials = config || {
      appKey: process.env.TWITTER_APP_KEY,
      appSecret: process.env.TWITTER_APP_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    };
    this.client = new TwitterApi(credentials);
  }
  /**
   * Initialize and verify credentials
   */
  async init() {
    try {
      const me = await this.client.v2.me();
      this.userId = me.data.id;
      this.logger.info(`Authenticated as @${me.data.username}`);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error}`);
      throw error;
    }
  }
  /**
   * Post a tweet
   */
  async tweet(text, options) {
    try {
      const params = {};
      if (options?.replyTo) {
        params.reply = { in_reply_to_tweet_id: options.replyTo };
      }
      if (options?.mediaIds?.length) {
        params.media = { media_ids: options.mediaIds };
      }
      const result = await this.client.v2.tweet(text, params);
      this.logger.info(`Posted tweet: ${result.data.id}`);
      return result.data;
    } catch (error) {
      this.logger.error(`Tweet failed: ${error}`);
      throw error;
    }
  }
  /**
   * Post a thread
   */
  async thread(tweets) {
    const posted = [];
    let previousId;
    for (const text of tweets) {
      const result = await this.tweet(text, { replyTo: previousId });
      posted.push(result);
      previousId = result.id;
    }
    this.logger.info(`Posted thread of ${tweets.length} tweets`);
    return posted;
  }
  /**
   * Get tweet metrics
   */
  async getMetrics(tweetId) {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        "tweet.fields": ["public_metrics"]
      });
      const metrics = tweet.data.public_metrics;
      return {
        likes: metrics?.like_count || 0,
        retweets: metrics?.retweet_count || 0,
        replies: metrics?.reply_count || 0,
        impressions: metrics?.impression_count || 0
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error}`);
      return { likes: 0, retweets: 0, replies: 0, impressions: 0 };
    }
  }
  /**
   * Get my recent tweets
   */
  async getMyTweets(count = 10) {
    if (!this.userId) {
      await this.init();
    }
    const tweets = await this.client.v2.userTimeline(this.userId, {
      max_results: count,
      "tweet.fields": ["created_at", "public_metrics"]
    });
    return tweets.data.data || [];
  }
  /**
   * Search recent tweets
   */
  async search(query, count = 10) {
    const results = await this.client.v2.search(query, {
      max_results: count,
      "tweet.fields": ["created_at", "public_metrics", "author_id"]
    });
    return results.data.data || [];
  }
  /**
   * Get user by username
   */
  async getUser(username) {
    try {
      const user = await this.client.v2.userByUsername(username, {
        "user.fields": ["public_metrics", "description"]
      });
      return user.data;
    } catch {
      return null;
    }
  }
  /**
   * Upload media
   */
  async uploadMedia(buffer, mimeType) {
    const mediaId = await this.client.v1.uploadMedia(buffer, { mimeType });
    return mediaId;
  }
  /**
   * Check rate limits
   */
  async getRateLimits() {
    return {
      tweetsRemaining: "check headers",
      resetTime: "check headers"
    };
  }
};

// src/social/twitter/queue.ts
import { CronJob } from "cron";
var DEFAULT_CONFIG = {
  maxTweetsPerDay: 5,
  optimalHours: [14, 16, 18, 20, 22],
  // UTC - targeting US hours
  minIntervalMinutes: 60
};
var TweetQueue = class {
  logger;
  queue = [];
  config;
  cronJob;
  onPost;
  constructor(config = {}) {
    this.logger = new Logger("TweetQueue");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Set the post handler
   */
  setPostHandler(handler) {
    this.onPost = handler;
  }
  /**
   * Start queue processing
   */
  start() {
    this.cronJob = new CronJob("*/5 * * * *", async () => {
      await this.processQueue();
    });
    this.cronJob.start();
    this.logger.info("Tweet queue started");
  }
  /**
   * Stop queue processing
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
    this.logger.info("Tweet queue stopped");
  }
  /**
   * Add tweet to queue
   */
  add(tweet, scheduledFor) {
    const scheduled = scheduledFor || this.findNextSlot();
    const queued = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tweet,
      scheduledFor: scheduled,
      status: "pending",
      attempts: 0
    };
    this.queue.push(queued);
    this.queue.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    this.logger.info(`Queued tweet for ${scheduled.toISOString()}: ${tweet.content.substring(0, 50)}...`);
    return queued;
  }
  /**
   * Add multiple tweets
   */
  addBatch(tweets) {
    return tweets.map((tweet) => this.add(tweet));
  }
  /**
   * Find next available slot
   */
  findNextSlot() {
    const now = /* @__PURE__ */ new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayTweets = this.queue.filter((q) => {
      const qDate = new Date(q.scheduledFor);
      qDate.setHours(0, 0, 0, 0);
      return qDate.getTime() === today.getTime() && q.status === "pending";
    });
    let lastTime = now;
    if (this.queue.length > 0) {
      const lastPending = [...this.queue].reverse().find((q) => q.status === "pending");
      if (lastPending && lastPending.scheduledFor > now) {
        lastTime = lastPending.scheduledFor;
      }
    }
    if (todayTweets.length >= this.config.maxTweetsPerDay) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(this.config.optimalHours[0], 0, 0, 0);
      return tomorrow;
    }
    const currentHour = now.getUTCHours();
    let nextHour = this.config.optimalHours.find((h) => h > currentHour);
    if (!nextHour) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setUTCHours(this.config.optimalHours[0], 0, 0, 0);
      return tomorrow;
    }
    const nextSlot = new Date(now);
    nextSlot.setUTCHours(nextHour, 0, 0, 0);
    const minNext = new Date(lastTime.getTime() + this.config.minIntervalMinutes * 60 * 1e3);
    return nextSlot > minNext ? nextSlot : minNext;
  }
  /**
   * Process queue
   */
  async processQueue() {
    const now = /* @__PURE__ */ new Date();
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
          item.scheduledFor = new Date(now.getTime() + 15 * 60 * 1e3);
          this.logger.warn(`Tweet ${item.id} failed, retry scheduled`);
        }
      }
    }
  }
  /**
   * Get queue status
   */
  getStatus() {
    const pending = this.queue.filter((q) => q.status === "pending").length;
    const posted = this.queue.filter((q) => q.status === "posted").length;
    const failed = this.queue.filter((q) => q.status === "failed").length;
    const nextUp = this.queue.find((q) => q.status === "pending") || null;
    return { pending, posted, failed, nextUp };
  }
  /**
   * Get all queued tweets
   */
  getQueue() {
    return [...this.queue];
  }
  /**
   * Remove tweet from queue
   */
  remove(id) {
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
  clearPending() {
    const before = this.queue.length;
    this.queue = this.queue.filter((q) => q.status !== "pending");
    return before - this.queue.length;
  }
  /**
   * Get daily schedule
   */
  getDailySchedule(date = /* @__PURE__ */ new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    return this.queue.filter(
      (q) => q.scheduledFor >= startOfDay && q.scheduledFor < endOfDay
    );
  }
};

// src/social/twitter/generator.ts
var DEFAULT_CONFIG2 = {
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
      "Vibe coding"
    ]
  }
};
var TweetGenerator = class {
  logger;
  config;
  constructor(config = {}) {
    this.logger = new Logger("TweetGenerator");
    this.config = { ...DEFAULT_CONFIG2, ...config };
  }
  /**
   * Generate a tweet for a topic
   */
  async generate(options) {
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
- thread_hook: Hook for a thread (end with "\u{1F9F5}" or similar)
- engagement: Ask a question or share opinion
- tip: Share a practical tip

Just return the tweet text, nothing else.`
    });
    return {
      id: `tweet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      type: options.type,
      topic: options.topic,
      scheduledFor: /* @__PURE__ */ new Date(),
      status: "draft",
      metrics: {
        impressions: 0,
        engagements: 0,
        clicks: 0,
        retweets: 0,
        likes: 0
      }
    };
  }
  /**
   * Generate a thread
   */
  async generateThread(options) {
    this.logger.info(`Generating thread about: ${options.topic}`);
    const threadContent = await generateJSON({
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

Return JSON: { "tweets": ["tweet1", "tweet2", ...] }`
    });
    return threadContent.tweets.map((content, index) => ({
      id: `tweet-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      type: index === 0 ? "thread_hook" : "insight",
      topic: options.topic,
      scheduledFor: /* @__PURE__ */ new Date(),
      status: "draft",
      threadPosition: index,
      metrics: {
        impressions: 0,
        engagements: 0,
        clicks: 0,
        retweets: 0,
        likes: 0
      }
    }));
  }
  /**
   * Generate tweet from blog post
   */
  async fromBlogPost(post) {
    this.logger.info(`Generating tweets from blog: ${post.title}`);
    const announcement = await this.generate({
      topic: post.title,
      type: "announcement",
      context: post.excerpt
    });
    const insight = await this.generate({
      topic: post.title,
      type: "tip",
      context: `Key takeaway from our blog: ${post.excerpt}`
    });
    return [announcement, insight];
  }
  /**
   * Generate daily content batch
   */
  async generateDailyBatch(count = 5) {
    const tweets = [];
    const types = ["insight", "tip", "engagement", "insight", "tip"];
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
  async generateEngagement(topic) {
    return this.generate({
      topic,
      type: "engagement",
      context: "Ask an interesting question that developers would want to answer"
    });
  }
  /**
   * Improve/rewrite a tweet
   */
  async improve(originalTweet, feedback) {
    const improved = await generateText({
      systemPrompt: `You are improving tweets for ${this.config.brand.name}.
Voice: ${this.config.brand.voice}`,
      prompt: `Improve this tweet based on feedback:

Original: "${originalTweet}"
Feedback: ${feedback}

Return only the improved tweet text.`
    });
    return improved.trim();
  }
  /**
   * Check tweet for issues
   */
  async review(tweet) {
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

Return JSON: { "isGood": true/false, "issues": [...], "suggestions": [...] }`
    });
  }
};

// src/social/twitter/index.ts
var DEFAULT_CONFIG3 = {
  tweetsPerDay: 5,
  autoGenerate: true,
  topics: [
    "AI development",
    "Claude Code tips",
    "React components",
    "Solana development",
    "Developer productivity"
  ]
};
var TwitterManager = class {
  logger;
  client;
  queue;
  generator;
  config;
  dailyCron;
  constructor(config = {}) {
    this.logger = new Logger("TwitterManager");
    this.config = { ...DEFAULT_CONFIG3, ...config };
    this.client = new TwitterClient();
    this.queue = new TweetQueue({ maxTweetsPerDay: this.config.tweetsPerDay });
    this.generator = new TweetGenerator();
    this.queue.setPostHandler(async (queued) => {
      await this.postTweet(queued);
    });
  }
  /**
   * Initialize Twitter automation
   */
  async init() {
    await this.client.init();
    this.logger.info("Twitter manager initialized");
  }
  /**
   * Start automation
   */
  start() {
    this.queue.start();
    if (this.config.autoGenerate) {
      this.dailyCron = new CronJob2("0 6 * * *", async () => {
        await this.generateDailyContent();
      });
      this.dailyCron.start();
    }
    this.logger.info("Twitter automation started");
  }
  /**
   * Stop automation
   */
  stop() {
    this.queue.stop();
    if (this.dailyCron) {
      this.dailyCron.stop();
    }
    this.logger.info("Twitter automation stopped");
  }
  /**
   * Post a tweet
   */
  async postTweet(queued) {
    const result = await this.client.tweet(queued.tweet.content);
    queued.tweet.postedAt = Date.now();
    queued.tweet.twitterId = result.id;
    queued.tweet.status = "posted";
    this.logger.info(`Posted: ${result.id}`);
  }
  /**
   * Generate daily content
   */
  async generateDailyContent() {
    this.logger.info("Generating daily tweet content...");
    const tweets = await this.generator.generateDailyBatch(this.config.tweetsPerDay);
    for (const tweet of tweets) {
      this.queue.add(tweet);
    }
    this.logger.info(`Generated and queued ${tweets.length} tweets`);
    return tweets;
  }
  /**
   * Queue a custom tweet
   */
  queueTweet(tweet, scheduledFor) {
    return this.queue.add(tweet, scheduledFor);
  }
  /**
   * Generate and queue a thread
   */
  async queueThread(topic, points) {
    const tweets = await this.generator.generateThread({ topic, points });
    return tweets.map((tweet) => this.queue.add(tweet));
  }
  /**
   * Promote a blog post
   */
  async promoteBlogPost(post) {
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
        keywords: []
      },
      metrics: {
        views: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        shares: 0
      }
    });
    const tweetsWithUrl = tweets.map((tweet) => ({
      ...tweet,
      content: `${tweet.content}

${post.url}`
    }));
    return tweetsWithUrl.map((tweet) => this.queue.add(tweet));
  }
  /**
   * Get queue status
   */
  getQueueStatus() {
    return this.queue.getStatus();
  }
  /**
   * Get today's schedule
   */
  getTodaySchedule() {
    return this.queue.getDailySchedule();
  }
  /**
   * Get tweet metrics
   */
  async getMetrics(tweetId) {
    return this.client.getMetrics(tweetId);
  }
  /**
   * Search for conversations to engage with
   */
  async findEngagementOpportunities(query) {
    const tweets = await this.client.search(query, 20);
    return tweets.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author_id || "unknown",
      engagement: (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0) * 2
    }));
  }
};

// src/seo/keywords.ts
var DEFAULT_CONFIG4 = {
  domain: "gicm.dev",
  primaryTopics: [
    "AI development tools",
    "Claude Code",
    "vibe coding",
    "Solana development",
    "React components",
    "AI agents"
  ],
  competitors: ["cursor.com", "replit.com", "v0.dev", "bolt.new"]
};
var KeywordResearcher = class {
  logger;
  config;
  keywordCache = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    this.logger = new Logger("KeywordResearcher");
    this.config = { ...DEFAULT_CONFIG4, ...config };
  }
  /**
   * Research keywords for a topic
   */
  async research(topic, count = 10) {
    const cacheKey = `${topic}-${count}`;
    if (this.keywordCache.has(cacheKey)) {
      return this.keywordCache.get(cacheKey);
    }
    this.logger.info(`Researching keywords for: ${topic}`);
    const keywords = await generateJSON({
      prompt: `Generate ${count} SEO keywords for this topic: "${topic}"

Context:
- Domain: ${this.config.domain}
- We cover: ${this.config.primaryTopics.join(", ")}
- Competitors: ${this.config.competitors.join(", ")}

For each keyword provide:
1. The keyword phrase (2-5 words, natural language)
2. Estimated search volume (high/medium/low)
3. Competition difficulty (easy/medium/hard)
4. Search intent (informational/commercial/transactional/navigational)

Focus on:
- Long-tail keywords we can rank for
- Keywords that match developer intent
- Mix of difficulty levels

Return JSON array:
[
  {
    "keyword": "keyword phrase",
    "searchVolume": "medium",
    "difficulty": "easy",
    "intent": "informational"
  }
]`
    });
    const result = keywords.map((k, i) => ({
      id: `kw-${Date.now()}-${i}`,
      keyword: k.keyword,
      volume: this.volumeToNumber(k.searchVolume),
      difficulty: this.difficultyToNumber(k.difficulty),
      intent: k.intent,
      currentRank: null,
      targetRank: 10,
      trend: "stable"
    }));
    this.keywordCache.set(cacheKey, result);
    return result;
  }
  /**
   * Find related keywords
   */
  async findRelated(keyword) {
    this.logger.info(`Finding related keywords for: ${keyword}`);
    const related = await generateJSON({
      prompt: `Generate 5 related/similar keywords to: "${keyword}"

These should be:
- Semantic variations
- Long-tail versions
- Related concepts

Return JSON array of keyword strings.`
    });
    return Promise.all(related.map((k) => this.analyze(k)));
  }
  /**
   * Analyze a single keyword
   */
  async analyze(keyword) {
    const analysis = await generateJSON({
      prompt: `Analyze this SEO keyword: "${keyword}"

Estimate:
1. Search volume (high/medium/low)
2. Competition difficulty (easy/medium/hard)
3. Search intent (informational/commercial/transactional/navigational)
4. Trend (rising/stable/declining)

Return JSON.`
    });
    return {
      id: `kw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      volume: this.volumeToNumber(analysis.searchVolume),
      difficulty: this.difficultyToNumber(analysis.difficulty),
      intent: analysis.intent,
      currentRank: null,
      targetRank: 10,
      trend: analysis.trend
    };
  }
  /**
   * Find content gaps
   */
  async findContentGaps() {
    this.logger.info("Finding content gaps...");
    return generateJSON({
      prompt: `Identify content gaps for ${this.config.domain}

Topics we cover: ${this.config.primaryTopics.join(", ")}
Competitors: ${this.config.competitors.join(", ")}

Find keywords/topics where:
1. Users are searching but we likely don't have content
2. Competitors rank but we could compete
3. Emerging topics in our space

Return JSON array:
[
  {
    "keyword": "keyword phrase",
    "opportunity": "why this is a gap",
    "priority": "high"
  }
]`
    });
  }
  /**
   * Generate keyword clusters
   */
  async cluster(keywords) {
    const clusters = await generateJSON({
      prompt: `Cluster these keywords by topic/intent:

${keywords.join("\n")}

Group related keywords together under a parent topic.
Return JSON object with topic names as keys and keyword arrays as values.`
    });
    return new Map(Object.entries(clusters));
  }
  /**
   * Convert volume string to number
   */
  volumeToNumber(volume) {
    switch (volume) {
      case "high":
        return 1e4;
      case "medium":
        return 1e3;
      case "low":
        return 100;
    }
  }
  /**
   * Convert difficulty to number (0-100)
   */
  difficultyToNumber(difficulty) {
    switch (difficulty) {
      case "easy":
        return 25;
      case "medium":
        return 50;
      case "hard":
        return 80;
    }
  }
};

// src/seo/optimizer.ts
var SEOOptimizer = class {
  logger;
  constructor() {
    this.logger = new Logger("SEOOptimizer");
  }
  /**
   * Analyze content for SEO
   */
  async analyze(content, targetKeywords) {
    this.logger.info("Analyzing content for SEO...");
    const wordCount = content.split(/\s+/).length;
    const headings = content.match(/^#{1,6}\s.+$/gm) || [];
    const links = content.match(/\[.+\]\(.+\)/g) || [];
    const keywordCounts = targetKeywords.map((kw) => {
      const regex = new RegExp(kw, "gi");
      return (content.match(regex) || []).length;
    });
    const avgKeywordDensity = keywordCounts.reduce((a, b) => a + b, 0) / wordCount / targetKeywords.length;
    const llmAnalysis = await generateJSON({
      prompt: `Analyze this content for SEO:

Content (first 2000 chars):
${content.slice(0, 2e3)}

Target keywords: ${targetKeywords.join(", ")}

Analyze:
1. Title effectiveness (0-100)
2. Meta description potential (0-100)
3. Readability (0-100)
4. Heading structure (0-100)
5. Issues found (errors, warnings, info)
6. Improvement suggestions

Return JSON:
{
  "titleScore": 80,
  "descriptionScore": 70,
  "readabilityScore": 85,
  "headingStructureScore": 75,
  "issues": [
    { "type": "warning", "message": "issue description", "fix": "how to fix" }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}`
    });
    const overallScore = Math.round(
      (llmAnalysis.titleScore + llmAnalysis.descriptionScore + llmAnalysis.readabilityScore + llmAnalysis.headingStructureScore + Math.min(avgKeywordDensity * 1e3, 100)) / 5
    );
    const issues = [...llmAnalysis.issues];
    if (wordCount < 300) {
      issues.push({
        type: "warning",
        message: "Content is too short (< 300 words)",
        fix: "Add more valuable content to improve ranking potential"
      });
    }
    if (headings.length < 3) {
      issues.push({
        type: "warning",
        message: "Not enough headings for structure",
        fix: "Add H2/H3 headings to break up content"
      });
    }
    if (links.length < 2) {
      issues.push({
        type: "info",
        message: "Few internal/external links",
        fix: "Add relevant links to other content"
      });
    }
    if (avgKeywordDensity < 5e-3) {
      issues.push({
        type: "warning",
        message: "Low keyword density",
        fix: "Naturally include target keywords more often"
      });
    } else if (avgKeywordDensity > 0.03) {
      issues.push({
        type: "warning",
        message: "Keyword stuffing detected",
        fix: "Reduce keyword frequency to avoid penalties"
      });
    }
    return {
      score: overallScore,
      issues,
      suggestions: llmAnalysis.suggestions,
      meta: {
        titleScore: llmAnalysis.titleScore,
        descriptionScore: llmAnalysis.descriptionScore,
        keywordDensity: avgKeywordDensity,
        readability: llmAnalysis.readabilityScore,
        headingStructure: llmAnalysis.headingStructureScore
      }
    };
  }
  /**
   * Optimize content for SEO
   */
  async optimize(content, targetKeywords, analysis) {
    this.logger.info("Optimizing content for SEO...");
    if (analysis.score >= 85) {
      this.logger.info("Content already well-optimized");
      return content;
    }
    const optimized = await generateJSON({
      prompt: `Optimize this content for SEO without changing its meaning or style:

Original content:
${content}

Target keywords: ${targetKeywords.join(", ")}

Issues to fix:
${analysis.issues.map((i) => `- ${i.message}`).join("\n")}

Suggestions:
${analysis.suggestions.join("\n")}

Make improvements while:
- Keeping the same voice and style
- Not keyword stuffing
- Maintaining natural flow
- Keeping all technical accuracy

Return JSON: { "optimizedContent": "the full optimized content" }`
    });
    return optimized.optimizedContent;
  }
  /**
   * Generate meta tags
   */
  async generateMeta(content, targetKeywords) {
    return generateJSON({
      prompt: `Generate SEO meta tags for this content:

Content (first 1000 chars):
${content.slice(0, 1e3)}

Target keywords: ${targetKeywords.join(", ")}

Generate:
1. Title (50-60 chars, include primary keyword)
2. Meta description (150-160 chars, compelling)
3. OG title (slightly different, engaging)
4. OG description
5. Twitter title
6. Twitter description

Return JSON:
{
  "title": "...",
  "description": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "twitterTitle": "...",
  "twitterDescription": "..."
}`
    });
  }
  /**
   * Analyze blog post specifically
   */
  async analyzeBlogPost(post) {
    const fullContent = `# ${post.title}

${post.content}`;
    const keywords = post.seo?.keywords || post.tags;
    return this.analyze(fullContent, keywords);
  }
  /**
   * Generate schema markup
   */
  async generateSchema(post) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      author: {
        "@type": "Person",
        name: post.author
      },
      datePublished: new Date(post.publishedAt || Date.now()).toISOString(),
      keywords: post.tags.join(", "),
      articleSection: post.category
    };
  }
  /**
   * Check URL SEO
   */
  analyzeUrl(url) {
    const issues = [];
    let score = 100;
    if (url.length > 75) {
      issues.push("URL is too long");
      score -= 10;
    }
    if (!/^[a-z0-9-/]+$/.test(url)) {
      issues.push("URL contains special characters");
      score -= 15;
    }
    if (url.includes("--")) {
      issues.push("URL has consecutive hyphens");
      score -= 5;
    }
    if (url.split("/").some((s) => s.length > 50)) {
      issues.push("URL segment too long");
      score -= 10;
    }
    return { score: Math.max(0, score), issues };
  }
};

// src/index.ts
var GrowthEngine = class {
  logger;
  config;
  blogGenerator;
  twitterManager;
  keywordResearcher;
  seoOptimizer;
  weeklyBlogCron;
  metricsCollectCron;
  status = {
    running: false,
    startedAt: null,
    metrics: {
      traffic: { daily: 0, weekly: 0, monthly: 0, trend: "stable" },
      content: { postsPublished: 0, totalViews: 0, avgEngagement: 0 },
      engagement: { twitterFollowers: 0, discordMembers: 0, newsletterSubs: 0 },
      seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 }
    },
    upcomingContent: {
      week: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      blogPosts: [],
      tweets: [],
      threads: []
    }
  };
  constructor(config) {
    this.logger = new Logger("GrowthEngine");
    this.config = {
      blog: {
        postsPerWeek: config?.blog?.postsPerWeek || 3,
        categories: config?.blog?.categories || ["tutorial", "guide", "announcement"],
        targetWordCount: config?.blog?.targetWordCount || 1500
      },
      twitter: {
        tweetsPerDay: config?.twitter?.tweetsPerDay || 5,
        threadsPerWeek: config?.twitter?.threadsPerWeek || 2,
        engagementEnabled: config?.twitter?.engagementEnabled ?? true
      },
      seo: {
        primaryKeywords: config?.seo?.primaryKeywords || [],
        competitors: config?.seo?.competitors || [],
        targetPositions: config?.seo?.targetPositions || {}
      },
      discord: {
        serverId: config?.discord?.serverId || "",
        announcementChannel: config?.discord?.announcementChannel || "",
        contentChannel: config?.discord?.contentChannel || ""
      }
    };
    this.blogGenerator = new BlogGenerator();
    this.twitterManager = new TwitterManager({
      tweetsPerDay: this.config.twitter.tweetsPerDay
    });
    this.keywordResearcher = new KeywordResearcher();
    this.seoOptimizer = new SEOOptimizer();
  }
  /**
   * Start the Growth Engine
   */
  async start() {
    this.logger.info("Starting Growth Engine...");
    try {
      await this.twitterManager.init();
      this.twitterManager.start();
      this.weeklyBlogCron = new CronJob3("0 6 * * 0", async () => {
        await this.generateWeeklyContent();
      });
      this.weeklyBlogCron.start();
      this.metricsCollectCron = new CronJob3("0 */6 * * *", async () => {
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
  stop() {
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
  async generateWeeklyContent() {
    this.logger.info("Generating weekly content...");
    const keywords = await this.keywordResearcher.findContentGaps();
    const topKeywords = keywords.slice(0, 5);
    for (let i = 0; i < this.config.blog.postsPerWeek; i++) {
      const keyword = topKeywords[i % topKeywords.length];
      const category = this.config.blog.categories[i % this.config.blog.categories.length];
      try {
        const post = await this.blogGenerator.generate({
          topic: keyword.keyword,
          category,
          targetWordCount: this.config.blog.targetWordCount
        });
        const analysis = await this.seoOptimizer.analyzeBlogPost(post);
        if (analysis.score < 70) {
          post.content = await this.seoOptimizer.optimize(
            post.content,
            post.tags,
            analysis
          );
        }
        this.status.upcomingContent.blogPosts.push(post);
        this.status.metrics.content.blogPosts++;
        await this.twitterManager.promoteBlogPost({
          title: post.title,
          excerpt: post.excerpt,
          url: `https://gicm.dev/blog/${post.slug}`
        });
        this.logger.info(`Generated blog post: ${post.title}`);
      } catch (error) {
        this.logger.error(`Blog generation failed: ${error}`);
      }
    }
    await this.twitterManager.generateDailyContent();
  }
  /**
   * Collect metrics
   */
  async collectMetrics() {
    this.logger.info("Collecting metrics...");
    const queueStatus = this.twitterManager.getQueueStatus();
    this.status.metrics.content.tweets = queueStatus.posted;
    this.logger.info(`Metrics: ${JSON.stringify(this.status.metrics)}`);
  }
  /**
   * Get current status
   */
  getStatus() {
    return { ...this.status };
  }
  /**
   * Generate content now
   */
  async generateNow(type) {
    switch (type) {
      case "blog":
        const post = await this.blogGenerator.generate({
          topic: "AI development tools",
          category: "tutorial"
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
          "Getting started"
        ]);
        this.logger.info("Queued thread");
        break;
    }
  }
  /**
   * Research keywords
   */
  async researchKeywords(topic) {
    const keywords = await this.keywordResearcher.research(topic);
    this.logger.info(`Found ${keywords.length} keywords for "${topic}"`);
    keywords.forEach((k) => {
      this.logger.info(`  - ${k.keyword} (vol: ${k.volume}, diff: ${k.difficulty})`);
    });
  }
};

export {
  Logger,
  BlogGenerator,
  TwitterClient,
  TweetQueue,
  TweetGenerator,
  TwitterManager,
  KeywordResearcher,
  SEOOptimizer,
  GrowthEngine
};
//# sourceMappingURL=chunk-HPTWSKIG.js.map