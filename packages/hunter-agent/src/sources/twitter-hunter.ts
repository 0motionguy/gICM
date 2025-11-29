import { createHash, randomUUID } from "crypto";
import {
  type BaseHunterSource,
  type HunterConfig,
  type HuntDiscovery,
  type RawDiscovery,
  RELEVANCE_KEYWORDS,
} from "../types.js";

// Apify Twitter Scraper endpoints
const APIFY_API = "https://api.apify.com/v2";

// Default keywords to search for
const DEFAULT_SEARCH_KEYWORDS = [
  "solana dev",
  "ethereum dev",
  "web3 tool",
  "ai agent crypto",
  "defi protocol",
  "$SOL alpha",
  "blockchain framework",
];

export interface TwitterHunterConfig extends HunterConfig {
  apifyToken?: string;
  searchKeywords?: string[];
  minLikes?: number;
  minReposts?: number;
}

interface ApifyTweet {
  id: string;
  text: string;
  createdAt?: string;
  author?: {
    id: string;
    userName: string;
    name: string;
    followers?: number;
    isVerified?: boolean;
  };
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  quoteCount?: number;
  viewCount?: number;
  url?: string;
  entities?: {
    urls?: Array<{ expanded_url: string }>;
  };
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

export class TwitterHunter implements BaseHunterSource {
  source = "twitter" as const;
  private config: TwitterHunterConfig;
  private apifyToken: string;

  constructor(config: TwitterHunterConfig) {
    this.config = config;
    this.apifyToken =
      config.apifyToken ?? process.env.APIFY_TOKEN ?? "";
  }

  async hunt(): Promise<RawDiscovery[]> {
    if (!this.apifyToken) {
      console.warn(
        "[TwitterHunter] No Apify token configured. Set APIFY_TOKEN env var."
      );
      return [];
    }

    const discoveries: RawDiscovery[] = [];
    const keywords = this.config.searchKeywords ?? DEFAULT_SEARCH_KEYWORDS;

    // Search for each keyword
    for (const keyword of keywords) {
      try {
        const tweets = await this.searchTweets(keyword);
        discoveries.push(...tweets.map((t) => this.tweetToRawDiscovery(t)));
      } catch (error) {
        console.error(`[TwitterHunter] Failed to search for "${keyword}":`, error);
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    return discoveries.filter((d) => {
      if (seen.has(d.sourceId)) return false;
      seen.add(d.sourceId);
      return true;
    });
  }

  transform(raw: RawDiscovery): HuntDiscovery {
    const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
    const metadata = raw.metadata as ApifyTweet | undefined;

    return {
      id: randomUUID(),
      source: "twitter",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: new Date(),
      category: this.categorize(text),
      tags: this.extractTags(text),
      language: undefined,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.web3),
        hasAIKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ai),
        hasSolanaKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.solana),
        hasEthereumKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum),
        hasTypeScript: this.hasKeywords(text, RELEVANCE_KEYWORDS.typescript),
        recentActivity: this.isRecent(metadata),
        highEngagement:
          (raw.metrics.likes ?? 0) > 50 || (raw.metrics.reposts ?? 0) > 20,
        isShowHN: false,
      },
      rawMetadata: metadata as Record<string, unknown>,
      fingerprint: this.generateFingerprint(raw),
    };
  }

  private async searchTweets(query: string): Promise<ApifyTweet[]> {
    // Use Apify's Twitter Scraper actor
    // Actor ID: apify/twitter-scraper
    const actorId = "apify~twitter-scraper";

    const runInput = {
      searchTerms: [query],
      maxTweets: 50,
      onlyVerified: false,
      minLikes: this.config.minLikes ?? 10,
      minRetweets: this.config.minReposts ?? 5,
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24h
    };

    // Start the actor run
    const runResponse = await fetch(
      `${APIFY_API}/acts/${actorId}/runs?token=${this.apifyToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runInput),
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

    // Wait for the run to complete (with timeout)
    const maxWaitMs = 60000; // 1 minute
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const statusResponse = await fetch(
        `${APIFY_API}/actor-runs/${runId}?token=${this.apifyToken}`
      );

      if (!statusResponse.ok) break;

      const statusData = await statusResponse.json();
      const status = statusData.data?.status;

      if (status === "SUCCEEDED") {
        // Fetch results
        const datasetId = statusData.data?.defaultDatasetId;
        if (!datasetId) return [];

        const resultsResponse = await fetch(
          `${APIFY_API}/datasets/${datasetId}/items?token=${this.apifyToken}`
        );

        if (!resultsResponse.ok) return [];

        return (await resultsResponse.json()) as ApifyTweet[];
      }

      if (status === "FAILED" || status === "ABORTED") {
        console.error(`[TwitterHunter] Apify run ${status}`);
        return [];
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.warn("[TwitterHunter] Apify run timed out");
    return [];
  }

  private tweetToRawDiscovery(tweet: ApifyTweet): RawDiscovery {
    const tweetUrl =
      tweet.url ??
      `https://twitter.com/${tweet.author?.userName ?? "unknown"}/status/${tweet.id}`;

    // Truncate text for title, use full text for description
    const title =
      tweet.text.length > 100
        ? tweet.text.slice(0, 100) + "..."
        : tweet.text;

    return {
      sourceId: tweet.id,
      sourceUrl: tweetUrl,
      title,
      description: tweet.text,
      author: tweet.author?.userName,
      authorUrl: tweet.author?.userName
        ? `https://twitter.com/${tweet.author.userName}`
        : undefined,
      publishedAt: tweet.createdAt ? new Date(tweet.createdAt) : undefined,
      metrics: {
        likes: tweet.likeCount,
        reposts: tweet.retweetCount,
        comments: tweet.replyCount,
        views: tweet.viewCount,
      },
      metadata: tweet,
    };
  }

  private categorize(text: string): HuntDiscovery["category"] {
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

  private extractTags(text: string): string[] {
    const tags: string[] = [];

    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) tags.push("web3");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) tags.push("ai");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.solana)) tags.push("solana");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum)) tags.push("ethereum");

    // Extract hashtags
    const hashtags = text.match(/#\w+/g) ?? [];
    tags.push(
      ...hashtags.map((h) => h.slice(1).toLowerCase()).slice(0, 5)
    );

    return [...new Set(tags)];
  }

  private hasKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }

  private isRecent(tweet?: ApifyTweet): boolean {
    if (!tweet?.createdAt) return false;
    const postTime = new Date(tweet.createdAt);
    const hoursSincePost =
      (Date.now() - postTime.getTime()) / (1000 * 60 * 60);
    return hoursSincePost < 6; // Very recent for Twitter
  }

  private generateFingerprint(raw: RawDiscovery): string {
    const key = `twitter:${raw.sourceId}`;
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
}

// Alternative: Nitter-based hunter (free but less reliable)
export class NitterHunter implements BaseHunterSource {
  source = "twitter" as const;
  private nitterInstances = [
    "https://nitter.net",
    "https://nitter.it",
    "https://nitter.privacydev.net",
  ];

  constructor(_config: HunterConfig) {
    // Nitter doesn't need auth
  }

  async hunt(): Promise<RawDiscovery[]> {
    // Nitter hunting is less reliable, use as fallback
    console.warn(
      "[NitterHunter] Nitter is less reliable. Consider using Apify for production."
    );
    return [];
  }

  transform(raw: RawDiscovery): HuntDiscovery {
    return {
      id: randomUUID(),
      source: "twitter",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      title: raw.title,
      description: raw.description,
      author: raw.author,
      authorUrl: raw.authorUrl,
      publishedAt: raw.publishedAt,
      discoveredAt: new Date(),
      category: "other",
      tags: [],
      language: undefined,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: false,
        hasAIKeywords: false,
        hasSolanaKeywords: false,
        hasEthereumKeywords: false,
        hasTypeScript: false,
        recentActivity: false,
        highEngagement: false,
        isShowHN: false,
      },
      rawMetadata: raw.metadata as Record<string, unknown>,
      fingerprint: this.generateFingerprint(raw),
    };
  }

  private generateFingerprint(raw: RawDiscovery): string {
    const key = `twitter:${raw.sourceId}`;
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
}
