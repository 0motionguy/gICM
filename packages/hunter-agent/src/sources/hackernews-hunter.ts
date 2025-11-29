import { createHash, randomUUID } from "crypto";
import {
  type BaseHunterSource,
  type HNItem,
  type HunterConfig,
  type HuntDiscovery,
  type RawDiscovery,
  RELEVANCE_KEYWORDS,
} from "../types.js";

const HN_API = "https://hacker-news.firebaseio.com/v0";

export class HackerNewsHunter implements BaseHunterSource {
  source = "hackernews" as const;
  private config: HunterConfig;

  constructor(config: HunterConfig) {
    this.config = config;
  }

  async hunt(): Promise<RawDiscovery[]> {
    const discoveries: RawDiscovery[] = [];

    // Fetch top stories
    const topStories = await this.fetchTopStories(100);
    discoveries.push(...topStories);

    // Fetch Show HN stories
    const showHN = await this.fetchShowHN(50);
    discoveries.push(...showHN);

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
    const metadata = raw.metadata as HNItem | undefined;

    const isShowHN = raw.title.toLowerCase().startsWith("show hn:");

    return {
      id: randomUUID(),
      source: "hackernews",
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
          (raw.metrics.points ?? 0) > 100 || (raw.metrics.comments ?? 0) > 50,
        isShowHN,
      },
      rawMetadata: metadata as Record<string, unknown>,
      fingerprint: this.generateFingerprint(raw),
    };
  }

  private async fetchTopStories(limit: number): Promise<RawDiscovery[]> {
    const response = await fetch(`${HN_API}/topstories.json`);
    if (!response.ok) {
      console.error("[HackerNewsHunter] Failed to fetch top stories");
      return [];
    }

    const ids = (await response.json()) as number[];
    const topIds = ids.slice(0, limit);

    return this.fetchItems(topIds);
  }

  private async fetchShowHN(limit: number): Promise<RawDiscovery[]> {
    const response = await fetch(`${HN_API}/showstories.json`);
    if (!response.ok) {
      console.error("[HackerNewsHunter] Failed to fetch Show HN stories");
      return [];
    }

    const ids = (await response.json()) as number[];
    const topIds = ids.slice(0, limit);

    return this.fetchItems(topIds);
  }

  private async fetchItems(ids: number[]): Promise<RawDiscovery[]> {
    const discoveries: RawDiscovery[] = [];

    // Fetch in batches of 20 to avoid overwhelming the API
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

  private async fetchItem(id: number): Promise<HNItem | null> {
    try {
      const response = await fetch(`${HN_API}/item/${id}.json`);
      if (!response.ok) return null;
      return (await response.json()) as HNItem;
    } catch {
      return null;
    }
  }

  private passesFilters(item: HNItem): boolean {
    const minPoints = this.config.filters?.minPoints ?? 20;
    const minEngagement = this.config.filters?.minEngagement ?? 5;

    if ((item.score ?? 0) < minPoints) return false;
    if ((item.descendants ?? 0) < minEngagement) return false;

    // Check if matches any keywords
    const text = `${item.title ?? ""} ${item.text ?? ""}`.toLowerCase();
    const keywords = this.config.filters?.keywords ?? [
      ...RELEVANCE_KEYWORDS.web3,
      ...RELEVANCE_KEYWORDS.ai,
    ];

    const matchesKeywords = keywords.some((kw) =>
      text.includes(kw.toLowerCase())
    );

    // For high-scoring items, include even without keyword match
    if ((item.score ?? 0) >= 100) return true;

    return matchesKeywords;
  }

  private itemToRawDiscovery(item: HNItem): RawDiscovery {
    const hnUrl = `https://news.ycombinator.com/item?id=${item.id}`;

    return {
      sourceId: String(item.id),
      sourceUrl: item.url ?? hnUrl,
      title: item.title ?? "Untitled",
      description: item.text ?? undefined,
      author: item.by,
      authorUrl: item.by
        ? `https://news.ycombinator.com/user?id=${item.by}`
        : undefined,
      publishedAt: new Date(item.time * 1000),
      metrics: {
        points: item.score,
        comments: item.descendants,
      },
      metadata: item,
    };
  }

  private categorize(text: string): HuntDiscovery["category"] {
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

  private extractTags(text: string): string[] {
    const tags: string[] = [];

    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.web3)) tags.push("web3");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ai)) tags.push("ai");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.solana)) tags.push("solana");
    if (this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum)) tags.push("ethereum");
    if (text.includes("show hn:")) tags.push("show-hn");

    return tags;
  }

  private hasKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }

  private isRecent(item?: HNItem): boolean {
    if (!item?.time) return false;
    const postTime = new Date(item.time * 1000);
    const hoursSincePost =
      (Date.now() - postTime.getTime()) / (1000 * 60 * 60);
    return hoursSincePost < 24;
  }

  private generateFingerprint(raw: RawDiscovery): string {
    const key = `hackernews:${raw.sourceId}`;
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
}
