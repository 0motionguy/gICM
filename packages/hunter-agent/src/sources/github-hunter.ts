import { createHash, randomUUID } from "crypto";
import {
  type BaseHunterSource,
  type GitHubRepo,
  type HunterConfig,
  type HuntDiscovery,
  type RawDiscovery,
  RELEVANCE_KEYWORDS,
} from "../types.js";

const GITHUB_API = "https://api.github.com";

// Topics to search for relevant repos
const SEARCH_TOPICS = [
  "solana",
  "ethereum",
  "web3",
  "defi",
  "ai-agents",
  "llm",
  "langchain",
  "blockchain",
];

export class GitHubHunter implements BaseHunterSource {
  source = "github" as const;
  private token: string;
  private config: HunterConfig;

  constructor(config: HunterConfig) {
    this.config = config;
    this.token = config.apiToken ?? process.env.GITHUB_TOKEN ?? "";
  }

  async hunt(): Promise<RawDiscovery[]> {
    const discoveries: RawDiscovery[] = [];

    // Search trending repos by topic
    for (const topic of SEARCH_TOPICS) {
      const repos = await this.searchTrendingByTopic(topic);
      discoveries.push(...repos.map((r) => this.repoToRawDiscovery(r)));
    }

    // Search recently created repos with high stars
    const recentHot = await this.searchRecentHotRepos();
    discoveries.push(...recentHot.map((r) => this.repoToRawDiscovery(r)));

    // Deduplicate by URL
    const seen = new Set<string>();
    return discoveries.filter((d) => {
      if (seen.has(d.sourceUrl)) return false;
      seen.add(d.sourceUrl);
      return true;
    });
  }

  transform(raw: RawDiscovery): HuntDiscovery {
    const text = `${raw.title} ${raw.description ?? ""}`.toLowerCase();
    const metadata = raw.metadata as GitHubRepo | undefined;

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
      discoveredAt: new Date(),
      category: this.categorize(text, metadata?.topics ?? []),
      tags: metadata?.topics ?? [],
      language: metadata?.language ?? undefined,
      metrics: raw.metrics,
      relevanceFactors: {
        hasWeb3Keywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.web3),
        hasAIKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ai),
        hasSolanaKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.solana),
        hasEthereumKeywords: this.hasKeywords(text, RELEVANCE_KEYWORDS.ethereum),
        hasTypeScript: this.hasKeywords(text, RELEVANCE_KEYWORDS.typescript) ||
          metadata?.language?.toLowerCase() === "typescript",
        recentActivity: this.isRecentlyActive(metadata),
        highEngagement: (raw.metrics.stars ?? 0) > 100 || (raw.metrics.forks ?? 0) > 20,
        isShowHN: false,
      },
      rawMetadata: metadata as Record<string, unknown>,
      fingerprint: this.generateFingerprint(raw),
    };
  }

  private async searchTrendingByTopic(topic: string): Promise<GitHubRepo[]> {
    // Search for repos created in the last 7 days with this topic
    const sevenDaysAgo = new Date();
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

  private async searchRecentHotRepos(): Promise<GitHubRepo[]> {
    // Find repos that gained a lot of stars recently
    const threeDaysAgo = new Date();
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

  private async fetchGitHub(path: string): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "gICM-Hunter",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return fetch(`${GITHUB_API}${path}`, { headers });
  }

  private repoToRawDiscovery(repo: GitHubRepo): RawDiscovery {
    return {
      sourceId: String(repo.id),
      sourceUrl: repo.html_url,
      title: repo.full_name,
      description: repo.description ?? undefined,
      author: repo.owner.login,
      authorUrl: repo.owner.html_url,
      publishedAt: new Date(repo.created_at),
      metrics: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
      },
      metadata: repo,
    };
  }

  private categorize(
    text: string,
    topics: string[]
  ): HuntDiscovery["category"] {
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

  private hasKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
  }

  private isRecentlyActive(repo?: GitHubRepo): boolean {
    if (!repo?.pushed_at) return false;
    const lastPush = new Date(repo.pushed_at);
    const daysSinceLastPush =
      (Date.now() - lastPush.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastPush < 7;
  }

  private generateFingerprint(raw: RawDiscovery): string {
    const key = `github:${raw.sourceUrl}`;
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
}
