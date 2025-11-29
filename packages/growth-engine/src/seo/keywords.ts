/**
 * Keyword Research & Analysis
 *
 * Find and analyze SEO keywords for content.
 */

import type { Keyword } from "../core/types.js";
import { generateJSON } from "../utils/llm.js";
import { Logger } from "../utils/logger.js";

export interface KeywordResearchConfig {
  domain: string;
  primaryTopics: string[];
  competitors: string[];
}

const DEFAULT_CONFIG: KeywordResearchConfig = {
  domain: "gicm.dev",
  primaryTopics: [
    "AI development tools",
    "Claude Code",
    "vibe coding",
    "Solana development",
    "React components",
    "AI agents",
  ],
  competitors: ["cursor.com", "replit.com", "v0.dev", "bolt.new"],
};

export class KeywordResearcher {
  private logger: Logger;
  private config: KeywordResearchConfig;
  private keywordCache: Map<string, Keyword[]> = new Map();

  constructor(config: Partial<KeywordResearchConfig> = {}) {
    this.logger = new Logger("KeywordResearcher");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Research keywords for a topic
   */
  async research(topic: string, count: number = 10): Promise<Keyword[]> {
    const cacheKey = `${topic}-${count}`;
    if (this.keywordCache.has(cacheKey)) {
      return this.keywordCache.get(cacheKey)!;
    }

    this.logger.info(`Researching keywords for: ${topic}`);

    const keywords = await generateJSON<
      Array<{
        keyword: string;
        searchVolume: "high" | "medium" | "low";
        difficulty: "easy" | "medium" | "hard";
        intent: "informational" | "commercial" | "transactional" | "navigational";
      }>
    >({
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
]`,
    });

    const result: Keyword[] = keywords.map((k, i) => ({
      id: `kw-${Date.now()}-${i}`,
      keyword: k.keyword,
      volume: this.volumeToNumber(k.searchVolume),
      difficulty: this.difficultyToNumber(k.difficulty),
      intent: k.intent,
      currentRank: null,
      targetRank: 10,
      trend: "stable",
    }));

    this.keywordCache.set(cacheKey, result);
    return result;
  }

  /**
   * Find related keywords
   */
  async findRelated(keyword: string): Promise<Keyword[]> {
    this.logger.info(`Finding related keywords for: ${keyword}`);

    const related = await generateJSON<string[]>({
      prompt: `Generate 5 related/similar keywords to: "${keyword}"

These should be:
- Semantic variations
- Long-tail versions
- Related concepts

Return JSON array of keyword strings.`,
    });

    return Promise.all(related.map((k) => this.analyze(k)));
  }

  /**
   * Analyze a single keyword
   */
  async analyze(keyword: string): Promise<Keyword> {
    const analysis = await generateJSON<{
      searchVolume: "high" | "medium" | "low";
      difficulty: "easy" | "medium" | "hard";
      intent: "informational" | "commercial" | "transactional" | "navigational";
      trend: "rising" | "stable" | "declining";
    }>({
      prompt: `Analyze this SEO keyword: "${keyword}"

Estimate:
1. Search volume (high/medium/low)
2. Competition difficulty (easy/medium/hard)
3. Search intent (informational/commercial/transactional/navigational)
4. Trend (rising/stable/declining)

Return JSON.`,
    });

    return {
      id: `kw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      volume: this.volumeToNumber(analysis.searchVolume),
      difficulty: this.difficultyToNumber(analysis.difficulty),
      intent: analysis.intent,
      currentRank: null,
      targetRank: 10,
      trend: analysis.trend,
    };
  }

  /**
   * Find content gaps
   */
  async findContentGaps(): Promise<
    Array<{
      keyword: string;
      opportunity: string;
      priority: "high" | "medium" | "low";
    }>
  > {
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
]`,
    });
  }

  /**
   * Generate keyword clusters
   */
  async cluster(keywords: string[]): Promise<
    Map<string, string[]>
  > {
    const clusters = await generateJSON<Record<string, string[]>>({
      prompt: `Cluster these keywords by topic/intent:

${keywords.join("\n")}

Group related keywords together under a parent topic.
Return JSON object with topic names as keys and keyword arrays as values.`,
    });

    return new Map(Object.entries(clusters));
  }

  /**
   * Convert volume string to number
   */
  private volumeToNumber(volume: "high" | "medium" | "low"): number {
    switch (volume) {
      case "high":
        return 10000;
      case "medium":
        return 1000;
      case "low":
        return 100;
    }
  }

  /**
   * Convert difficulty to number (0-100)
   */
  private difficultyToNumber(difficulty: "easy" | "medium" | "hard"): number {
    switch (difficulty) {
      case "easy":
        return 25;
      case "medium":
        return 50;
      case "hard":
        return 80;
    }
  }
}
