// src/sources/github-hunter.ts
import { createHash, randomUUID } from "crypto";

// src/types.ts
import { z } from "zod";
var HuntSourceSchema = z.enum(["github", "hackernews", "twitter"]);
var RawDiscoverySchema = z.object({
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  publishedAt: z.date().optional(),
  // Metrics (source-dependent)
  metrics: z.object({
    stars: z.number().optional(),
    forks: z.number().optional(),
    watchers: z.number().optional(),
    openIssues: z.number().optional(),
    points: z.number().optional(),
    comments: z.number().optional(),
    likes: z.number().optional(),
    reposts: z.number().optional(),
    views: z.number().optional()
  }),
  // Source-specific metadata
  metadata: z.record(z.unknown()).optional()
});
var HuntDiscoverySchema = z.object({
  id: z.string(),
  source: HuntSourceSchema,
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  publishedAt: z.date().optional(),
  discoveredAt: z.date(),
  // Categorization
  category: z.enum(["web3", "ai", "defi", "nft", "tooling", "other"]).optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().optional(),
  // Metrics
  metrics: z.object({
    stars: z.number().optional(),
    forks: z.number().optional(),
    watchers: z.number().optional(),
    openIssues: z.number().optional(),
    points: z.number().optional(),
    comments: z.number().optional(),
    likes: z.number().optional(),
    reposts: z.number().optional(),
    views: z.number().optional()
  }),
  // Relevance factors (computed locally)
  relevanceFactors: z.object({
    hasWeb3Keywords: z.boolean().default(false),
    hasAIKeywords: z.boolean().default(false),
    hasSolanaKeywords: z.boolean().default(false),
    hasEthereumKeywords: z.boolean().default(false),
    hasTypeScript: z.boolean().default(false),
    recentActivity: z.boolean().default(false),
    highEngagement: z.boolean().default(false),
    isShowHN: z.boolean().default(false)
  }),
  // Raw metadata for later processing
  rawMetadata: z.record(z.unknown()).optional(),
  // Fingerprint for deduplication
  fingerprint: z.string()
});
var GitHubRepoSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string().optional(),
    html_url: z.string()
  }),
  html_url: z.string(),
  description: z.string().nullable(),
  fork: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  homepage: z.string().nullable(),
  size: z.number(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  language: z.string().nullable(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  license: z.object({ name: z.string() }).nullable(),
  topics: z.array(z.string()).default([]),
  visibility: z.string().optional(),
  default_branch: z.string().optional()
});
var HNItemSchema = z.object({
  id: z.number(),
  type: z.enum(["story", "comment", "job", "poll", "pollopt"]),
  by: z.string().optional(),
  time: z.number(),
  title: z.string().optional(),
  url: z.string().optional(),
  text: z.string().optional(),
  score: z.number().optional(),
  descendants: z.number().optional(),
  kids: z.array(z.number()).optional()
});
var TwitterTweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.string().optional(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    followers_count: z.number().optional()
  }).optional(),
  public_metrics: z.object({
    retweet_count: z.number(),
    reply_count: z.number(),
    like_count: z.number(),
    quote_count: z.number().optional(),
    impression_count: z.number().optional()
  }).optional(),
  urls: z.array(z.string()).optional()
});
var RELEVANCE_KEYWORDS = {
  web3: [
    "web3",
    "blockchain",
    "crypto",
    "cryptocurrency",
    "token",
    "smart contract",
    "decentralized",
    "dapp",
    "defi",
    "nft",
    "dao",
    "wallet",
    "on-chain",
    "onchain"
  ],
  ai: [
    "ai",
    "artificial intelligence",
    "machine learning",
    "ml",
    "llm",
    "large language model",
    "gpt",
    "claude",
    "langchain",
    "agent",
    "chatbot",
    "neural",
    "transformer",
    "embedding"
  ],
  solana: [
    "solana",
    "$sol",
    "spl token",
    "anchor",
    "metaplex",
    "phantom",
    "solflare",
    "jupiter",
    "raydium"
  ],
  ethereum: [
    "ethereum",
    "$eth",
    "erc20",
    "erc721",
    "erc1155",
    "solidity",
    "hardhat",
    "foundry",
    "uniswap",
    "openzeppelin"
  ],
  typescript: ["typescript", "ts", "tsx", "deno", "bun"]
};
var DEFAULT_SCHEDULES = {
  github: "0 */4 * * *",
  // Every 4 hours
  hackernews: "0 */2 * * *",
  // Every 2 hours
  twitter: "*/30 * * * *"
  // Every 30 minutes
};

// src/sources/github-hunter.ts
var GITHUB_API = "https://api.github.com";
var SEARCH_TOPICS = [
  "solana",
  "ethereum",
  "web3",
  "defi",
  "ai-agents",
  "llm",
  "langchain",
  "blockchain"
];
var GitHubHunter = class {
  source = "github";
  token;
  config;
  constructor(config) {
    this.config = config;
    this.token = config.apiToken ?? process.env.GITHUB_TOKEN ?? "";
  }
  async hunt() {
    const discoveries = [];
    for (const topic of SEARCH_TOPICS) {
      const repos = await this.searchTrendingByTopic(topic);
      discoveries.push(...repos.map((r) => this.repoToRawDiscovery(r)));
    }
    const recentHot = await this.searchRecentHotRepos();
    discoveries.push(...recentHot.map((r) => this.repoToRawDiscovery(r)));
    const seen = /* @__PURE__ */ new Set();
    return discoveries.filter((d) => {
      if (seen.has(d.sourceUrl)) return false;
      seen.add(d.sourceUrl);
      return true;
    });
  }
  transform(raw) {
    const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
    const metadata = raw.metadata;
    return {
      id: randomUUID(),
      source: "github",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: /* @__PURE__ */ new Date(),
      category: this.categorize(text, metadata?.topics ?? []),
      tags: metadata?.topics ?? [],
      language: metadata?.language ?? void 0,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.web3),
        hasAIKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ai),
        hasSolanaKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.solana),
        hasEthereumKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum),
        hasTypeScript: this.hasKeywords(text, RELEVANCE_KEYWORDS.typescript) || metadata?.language?.toLowerCase() === "typescript",
        recentActivity: this.isRecentlyActive(metadata),
        highEngagement: (raw.metrics.stars ?? 0) > 100 || (raw.metrics.forks ?? 0) > 20,
        isShowHN: false
      },
      rawMetadata: metadata,
      fingerprint: this.generateFingerprint(raw)
    };
  }
  async searchTrendingByTopic(topic) {
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];
    const minStars = this.config.filters?.minStars ?? 10;
    const query = encodeURIComponent(
      `topic:${topic} created:>${dateStr} stars:>=${minStars}`
    );
    const response = await this.fetchGitHub(
      `/search/repositories?q=${query}&sort=stars&order=desc&per_page=30`
    );
    if (!response.ok) {
      console.error(`[GitHubHunter] Search failed for topic ${topic}:`, response.status);
      return [];
    }
    const data = await response.json();
    return data.items ?? [];
  }
  async searchRecentHotRepos() {
    const threeDaysAgo = /* @__PURE__ */ new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateStr = threeDaysAgo.toISOString().split("T")[0];
    const query = encodeURIComponent(`created:>${dateStr} stars:>=50`);
    const response = await this.fetchGitHub(
      `/search/repositories?q=${query}&sort=stars&order=desc&per_page=50`
    );
    if (!response.ok) {
      console.error("[GitHubHunter] Recent hot search failed:", response.status);
      return [];
    }
    const data = await response.json();
    return data.items ?? [];
  }
  async fetchGitHub(path) {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "gICM-Hunter"
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return fetch(`${GITHUB_API}${path}`, { headers });
  }
  repoToRawDiscovery(repo) {
    return {
      sourceId: String(repo.id),
      sourceUrl: repo.html_url,
      title: repo.full_name,
      description: repo.description ?? void 0,
      author: repo.owner.login,
      authorUrl: repo.owner.html_url,
      publishedAt: new Date(repo.created_at),
      metrics: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count
      },
      metadata: repo
    };
  }
  categorize(text, topics) {
    const allText = `${text} ${topics.join(" ")}`.toLowerCase();
    if (this.hasKeywords(allText, ["defi", "lending", "dex", "swap", "yield"])) {
      return "defi";
    }
    if (this.hasKeywords(allText, ["nft", "metaplex", "opensea", "collectible"])) {
      return "nft";
    }
    if (this.hasKeywords(allText, RELEVANCE_KEYWORDS.web3)) {
      return "web3";
    }
    if (this.hasKeywords(allText, RELEVANCE_KEYWORDS.ai)) {
      return "ai";
    }
    if (this.hasKeywords(allText, ["cli", "tool", "sdk", "library", "framework"])) {
      return "tooling";
    }
    return "other";
  }
  hasKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }
  isRecentlyActive(repo) {
    if (!repo?.pushed_at) return false;
    const lastPush = new Date(repo.pushed_at);
    const daysSinceLastPush = (Date.now() - lastPush.getTime()) / (1e3 * 60 * 60 * 24);
    return daysSinceLastPush < 7;
  }
  generateFingerprint(raw) {
    const key = `github:${raw.sourceUrl}`;
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
};

// src/sources/hackernews-hunter.ts
import { createHash as createHash2, randomUUID as randomUUID2 } from "crypto";
var HN_API = "https://hacker-news.firebaseio.com/v0";
var HackerNewsHunter = class {
  source = "hackernews";
  config;
  constructor(config) {
    this.config = config;
  }
  async hunt() {
    const discoveries = [];
    const topStories = await this.fetchTopStories(100);
    discoveries.push(...topStories);
    const showHN = await this.fetchShowHN(50);
    discoveries.push(...showHN);
    const seen = /* @__PURE__ */ new Set();
    return discoveries.filter((d) => {
      if (seen.has(d.sourceId)) return false;
      seen.add(d.sourceId);
      return true;
    });
  }
  transform(raw) {
    const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
    const metadata = raw.metadata;
    const isShowHN = raw.title.toLowerCase().startsWith("show hn:");
    return {
      id: randomUUID2(),
      source: "hackernews",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: /* @__PURE__ */ new Date(),
      category: this.categorize(text),
      tags: this.extractTags(text),
      language: void 0,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.web3),
        hasAIKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ai),
        hasSolanaKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.solana),
        hasEthereumKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum),
        hasTypeScript: this.hasKeywords(text, RELEVANCE_KEYWORDS.typescript),
        recentActivity: this.isRecent(metadata),
        highEngagement: (raw.metrics.points ?? 0) > 100 || (raw.metrics.comments ?? 0) > 50,
        isShowHN
      },
      rawMetadata: metadata,
      fingerprint: this.generateFingerprint(raw)
    };
  }
  async fetchTopStories(limit) {
    const response = await fetch(`${HN_API}/topstories.json`);
    if (!response.ok) {
      console.error("[HackerNewsHunter] Failed to fetch top stories");
      return [];
    }
    const ids = await response.json();
    const topIds = ids.slice(0, limit);
    return this.fetchItems(topIds);
  }
  async fetchShowHN(limit) {
    const response = await fetch(`${HN_API}/showstories.json`);
    if (!response.ok) {
      console.error("[HackerNewsHunter] Failed to fetch Show HN stories");
      return [];
    }
    const ids = await response.json();
    const topIds = ids.slice(0, limit);
    return this.fetchItems(topIds);
  }
  async fetchItems(ids) {
    const discoveries = [];
    const batchSize = 20;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const items = await Promise.all(batch.map((id) => this.fetchItem(id)));
      for (const item of items) {
        if (!item || item.type !== "story") continue;
        if (!this.passesFilters(item)) continue;
        discoveries.push(this.itemToRawDiscovery(item));
      }
    }
    return discoveries;
  }
  async fetchItem(id) {
    try {
      const response = await fetch(`${HN_API}/item/${id}.json`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
  passesFilters(item) {
    const minPoints = this.config.filters?.minPoints ?? 20;
    const minEngagement = this.config.filters?.minEngagement ?? 5;
    if ((item.score ?? 0) < minPoints) return false;
    if ((item.descendants ?? 0) < minEngagement) return false;
    const text = `${item.title ?? ""} ${item.text ?? ""}`.toLowerCase();
    const keywords = this.config.filters?.keywords ?? [
      ...RELEVANCE_KEYWORDS.web3,
      ...RELEVANCE_KEYWORDS.ai
    ];
    const matchesKeywords = keywords.some(
      (kw) => text.includes(kw.toLowerCase())
    );
    if ((item.score ?? 0) >= 100) return true;
    return matchesKeywords;
  }
  itemToRawDiscovery(item) {
    const hnUrl = `https://news.ycombinator.com/item?id=${item.id}`;
    return {
      sourceId: String(item.id),
      sourceUrl: item.url ?? hnUrl,
      title: item.title ?? "Untitled",
      description: item.text ?? void 0,
      author: item.by,
      authorUrl: item.by ? `https://news.ycombinator.com/user?id=${item.by}` : void 0,
      publishedAt: new Date(item.time * 1e3),
      metrics: {
        points: item.score,
        comments: item.descendants
      },
      metadata: item
    };
  }
  categorize(text) {
    if (this.hasKeywords(text, ["defi", "lending", "dex", "swap", "yield"])) {
      return "defi";
    }
    if (this.hasKeywords(text, ["nft", "collectible", "opensea"])) {
      return "nft";
    }
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) {
      return "web3";
    }
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) {
      return "ai";
    }
    if (this.hasKeywords(text, ["cli", "tool", "sdk", "library", "framework"])) {
      return "tooling";
    }
    return "other";
  }
  extractTags(text) {
    const tags = [];
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) tags.push("web3");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) tags.push("ai");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.solana)) tags.push("solana");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum)) tags.push("ethereum");
    if (text.includes("show hn:")) tags.push("show-hn");
    return tags;
  }
  hasKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }
  isRecent(item) {
    if (!item?.time) return false;
    const postTime = new Date(item.time * 1e3);
    const hoursSincePost = (Date.now() - postTime.getTime()) / (1e3 * 60 * 60);
    return hoursSincePost < 24;
  }
  generateFingerprint(raw) {
    const key = `hackernews:${raw.sourceId}`;
    return createHash2("sha256").update(key).digest("hex").slice(0, 32);
  }
};

// src/sources/twitter-hunter.ts
import { createHash as createHash3, randomUUID as randomUUID3 } from "crypto";
var APIFY_API = "https://api.apify.com/v2";
var DEFAULT_SEARCH_KEYWORDS = [
  "solana dev",
  "ethereum dev",
  "web3 tool",
  "ai agent crypto",
  "defi protocol",
  "$SOL alpha",
  "blockchain framework"
];
var TwitterHunter = class {
  source = "twitter";
  config;
  apifyToken;
  constructor(config) {
    this.config = config;
    this.apifyToken = config.apifyToken ?? process.env.APIFY_TOKEN ?? "";
  }
  async hunt() {
    if (!this.apifyToken) {
      console.warn(
        "[TwitterHunter] No Apify token configured. Set APIFY_TOKEN env var."
      );
      return [];
    }
    const discoveries = [];
    const keywords = this.config.searchKeywords ?? DEFAULT_SEARCH_KEYWORDS;
    for (const keyword of keywords) {
      try {
        const tweets = await this.searchTweets(keyword);
        discoveries.push(...tweets.map((t) => this.tweetToRawDiscovery(t)));
      } catch (error) {
        console.error(`[TwitterHunter] Failed to search for "${keyword}":`, error);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    return discoveries.filter((d) => {
      if (seen.has(d.sourceId)) return false;
      seen.add(d.sourceId);
      return true;
    });
  }
  transform(raw) {
    const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
    const metadata = raw.metadata;
    return {
      id: randomUUID3(),
      source: "twitter",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: /* @__PURE__ */ new Date(),
      category: this.categorize(text),
      tags: this.extractTags(text),
      language: void 0,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.web3),
        hasAIKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ai),
        hasSolanaKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.solana),
        hasEthereumKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum),
        hasTypeScript: this.hasKeywords(text, RELEVANCE_KEYWORDS.typescript),
        recentActivity: this.isRecent(metadata),
        highEngagement: (raw.metrics.likes ?? 0) > 50 || (raw.metrics.reposts ?? 0) > 20,
        isShowHN: false
      },
      rawMetadata: metadata,
      fingerprint: this.generateFingerprint(raw)
    };
  }
  async searchTweets(query) {
    const actorId = "apify~twitter-scraper";
    const runInput = {
      searchTerms: [query],
      maxTweets: 50,
      onlyVerified: false,
      minLikes: this.config.minLikes ?? 10,
      minRetweets: this.config.minReposts ?? 5,
      start: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()
      // Last 24h
    };
    const runResponse = await fetch(
      `${APIFY_API}/acts/${actorId}/runs?token=${this.apifyToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runInput)
      }
    );
    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.status}`);
    }
    const runData = await runResponse.json();
    const runId = runData.data?.id;
    if (!runId) {
      throw new Error("No run ID returned from Apify");
    }
    const maxWaitMs = 6e4;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const statusResponse = await fetch(
        `${APIFY_API}/actor-runs/${runId}?token=${this.apifyToken}`
      );
      if (!statusResponse.ok) break;
      const statusData = await statusResponse.json();
      const status = statusData.data?.status;
      if (status === "SUCCEEDED") {
        const datasetId = statusData.data?.defaultDatasetId;
        if (!datasetId) return [];
        const resultsResponse = await fetch(
          `${APIFY_API}/datasets/${datasetId}/items?token=${this.apifyToken}`
        );
        if (!resultsResponse.ok) return [];
        return await resultsResponse.json();
      }
      if (status === "FAILED" || status === "ABORTED") {
        console.error(`[TwitterHunter] Apify run ${status}`);
        return [];
      }
      await new Promise((resolve) => setTimeout(resolve, 5e3));
    }
    console.warn("[TwitterHunter] Apify run timed out");
    return [];
  }
  tweetToRawDiscovery(tweet) {
    const tweetUrl = tweet.url ?? `https://twitter.com/${tweet.author?.userName ?? "unknown"}/status/${tweet.id}`;
    const title = tweet.text.length > 100 ? tweet.text.slice(0, 100) + "..." : tweet.text;
    return {
      sourceId: tweet.id,
      sourceUrl: tweetUrl,
      title,
      description: tweet.text,
      author: tweet.author?.userName,
      authorUrl: tweet.author?.userName ? `https://twitter.com/${tweet.author.userName}` : void 0,
      publishedAt: tweet.createdAt ? new Date(tweet.createdAt) : void 0,
      metrics: {
        likes: tweet.likeCount,
        reposts: tweet.retweetCount,
        comments: tweet.replyCount,
        views: tweet.viewCount
      },
      metadata: tweet
    };
  }
  categorize(text) {
    if (this.hasKeywords(text, ["defi", "lending", "dex", "swap", "yield"])) {
      return "defi";
    }
    if (this.hasKeywords(text, ["nft", "collectible", "mint", "pfp"])) {
      return "nft";
    }
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) {
      return "web3";
    }
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) {
      return "ai";
    }
    if (this.hasKeywords(text, ["sdk", "api", "framework", "tool"])) {
      return "tooling";
    }
    return "other";
  }
  extractTags(text) {
    const tags = [];
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) tags.push("web3");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) tags.push("ai");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.solana)) tags.push("solana");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum)) tags.push("ethereum");
    const hashtags = text.match(/#\w+/g) ?? [];
    tags.push(
      ...hashtags.map((h) => h.slice(1).toLowerCase()).slice(0, 5)
    );
    return [...new Set(tags)];
  }
  hasKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }
  isRecent(tweet) {
    if (!tweet?.createdAt) return false;
    const postTime = new Date(tweet.createdAt);
    const hoursSincePost = (Date.now() - postTime.getTime()) / (1e3 * 60 * 60);
    return hoursSincePost < 6;
  }
  generateFingerprint(raw) {
    const key = `twitter:${raw.sourceId}`;
    return createHash3("sha256").update(key).digest("hex").slice(0, 32);
  }
};
var NitterHunter = class {
  source = "twitter";
  nitterInstances = [
    "https://nitter.net",
    "https://nitter.it",
    "https://nitter.privacydev.net"
  ];
  constructor(_config) {
  }
  async hunt() {
    console.warn(
      "[NitterHunter] Nitter is less reliable. Consider using Apify for production."
    );
    return [];
  }
  transform(raw) {
    return {
      id: randomUUID3(),
      source: "twitter",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: /* @__PURE__ */ new Date(),
      category: "other",
      tags: [],
      language: void 0,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: false,
        hasAIKeywords: false,
        hasSolanaKeywords: false,
        hasEthereumKeywords: false,
        hasTypeScript: false,
        recentActivity: false,
        highEngagement: false,
        isShowHN: false
      },
      rawMetadata: raw.metadata,
      fingerprint: this.generateFingerprint(raw)
    };
  }
  generateFingerprint(raw) {
    const key = `twitter:${raw.sourceId}`;
    return createHash3("sha256").update(key).digest("hex").slice(0, 32);
  }
};

export {
  HuntSourceSchema,
  RawDiscoverySchema,
  HuntDiscoverySchema,
  GitHubRepoSchema,
  HNItemSchema,
  TwitterTweetSchema,
  RELEVANCE_KEYWORDS,
  DEFAULT_SCHEDULES,
  GitHubHunter,
  HackerNewsHunter,
  TwitterHunter,
  NitterHunter
};
//# sourceMappingURL=chunk-OKBHOUOO.js.map