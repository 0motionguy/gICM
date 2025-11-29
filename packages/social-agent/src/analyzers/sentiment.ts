import type { SocialPost, SentimentAnalysis } from "../types.js";
import type { LLMClient } from "@gicm/agent-core";

interface SentimentKeyword {
  word: string;
  score: number;
}

// Basic sentiment keywords for crypto/web3
const BULLISH_KEYWORDS: SentimentKeyword[] = [
  { word: "bullish", score: 0.8 },
  { word: "moon", score: 0.7 },
  { word: "pump", score: 0.6 },
  { word: "ath", score: 0.6 },
  { word: "buy", score: 0.4 },
  { word: "long", score: 0.5 },
  { word: "breakout", score: 0.6 },
  { word: "accumulate", score: 0.5 },
  { word: "undervalued", score: 0.5 },
  { word: "gem", score: 0.6 },
  { word: "wagmi", score: 0.7 },
  { word: "gm", score: 0.3 },
  { word: "lfg", score: 0.6 },
  { word: "alpha", score: 0.4 },
];

const BEARISH_KEYWORDS: SentimentKeyword[] = [
  { word: "bearish", score: -0.8 },
  { word: "dump", score: -0.7 },
  { word: "crash", score: -0.8 },
  { word: "sell", score: -0.4 },
  { word: "short", score: -0.5 },
  { word: "scam", score: -0.9 },
  { word: "rug", score: -0.9 },
  { word: "ngmi", score: -0.6 },
  { word: "rekt", score: -0.7 },
  { word: "fud", score: -0.3 },
  { word: "overvalued", score: -0.5 },
  { word: "dead", score: -0.6 },
];

export class SentimentAnalyzer {
  private llmClient?: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient;
  }

  async analyzeSentiment(posts: SocialPost[]): Promise<SentimentAnalysis> {
    if (posts.length === 0) {
      return {
        score: 0,
        label: "neutral",
        confidence: 0,
        keywords: [],
        samplePosts: [],
      };
    }

    // Use LLM for more accurate analysis if available
    if (this.llmClient && posts.length <= 50) {
      return this.llmAnalysis(posts);
    }

    // Fallback to keyword-based analysis
    return this.keywordAnalysis(posts);
  }

  private async llmAnalysis(posts: SocialPost[]): Promise<SentimentAnalysis> {
    if (!this.llmClient) {
      return this.keywordAnalysis(posts);
    }

    try {
      const postsText = posts
        .slice(0, 30)
        .map((p) => `- ${p.content.slice(0, 200)}`)
        .join("\n");

      const response = await this.llmClient.chat([
        {
          role: "system",
          content: `Analyze the sentiment of these crypto/web3 social media posts.
Return JSON with this exact structure:
{
  "score": <number from -1 (very bearish) to 1 (very bullish)>,
  "label": "bullish" | "bearish" | "neutral",
  "confidence": <number from 0 to 1>,
  "keywords": [{"word": "string", "sentiment": <number>}]
}`,
        },
        {
          role: "user",
          content: `Analyze sentiment:\n\n${postsText}`,
        },
      ]);

      const parsed = JSON.parse(response.content) as {
        score: number;
        label: "bullish" | "bearish" | "neutral";
        confidence: number;
        keywords: Array<{ word: string; sentiment: number }>;
      };

      return {
        score: parsed.score,
        label: parsed.label,
        confidence: parsed.confidence,
        keywords: parsed.keywords,
        samplePosts: posts.slice(0, 5),
      };
    } catch {
      return this.keywordAnalysis(posts);
    }
  }

  private keywordAnalysis(posts: SocialPost[]): SentimentAnalysis {
    let totalScore = 0;
    const keywordCounts = new Map<string, { count: number; score: number }>();

    for (const post of posts) {
      const text = post.content.toLowerCase();
      let postScore = 0;

      // Check bullish keywords
      for (const kw of BULLISH_KEYWORDS) {
        if (text.includes(kw.word)) {
          postScore += kw.score;
          const existing = keywordCounts.get(kw.word) ?? { count: 0, score: kw.score };
          keywordCounts.set(kw.word, { count: existing.count + 1, score: kw.score });
        }
      }

      // Check bearish keywords
      for (const kw of BEARISH_KEYWORDS) {
        if (text.includes(kw.word)) {
          postScore += kw.score;
          const existing = keywordCounts.get(kw.word) ?? { count: 0, score: kw.score };
          keywordCounts.set(kw.word, { count: existing.count + 1, score: kw.score });
        }
      }

      // Weight by engagement
      const engagementWeight = Math.log10(
        1 + (post.likes ?? 0) + (post.reposts ?? 0) * 2
      );
      totalScore += postScore * (1 + engagementWeight * 0.1);
    }

    const avgScore = posts.length > 0 ? totalScore / posts.length : 0;
    const normalizedScore = Math.max(-1, Math.min(1, avgScore));

    const keywords = Array.from(keywordCounts.entries())
      .map(([word, data]) => ({ word, sentiment: data.score }))
      .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
      .slice(0, 10);

    return {
      score: normalizedScore,
      label: normalizedScore > 0.2 ? "bullish" : normalizedScore < -0.2 ? "bearish" : "neutral",
      confidence: Math.min(0.7, posts.length / 100), // More posts = higher confidence
      keywords,
      samplePosts: posts.slice(0, 5),
    };
  }

  analyzeByTime(
    posts: SocialPost[],
    intervalHours = 1
  ): Array<{ timestamp: Date; sentiment: number; postCount: number }> {
    if (posts.length === 0) return [];

    // Sort by timestamp
    const sorted = [...posts].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const intervalMs = intervalHours * 60 * 60 * 1000;
    const buckets = new Map<number, SocialPost[]>();

    for (const post of sorted) {
      const bucket = Math.floor(post.timestamp.getTime() / intervalMs) * intervalMs;
      const existing = buckets.get(bucket) ?? [];
      existing.push(post);
      buckets.set(bucket, existing);
    }

    const results: Array<{ timestamp: Date; sentiment: number; postCount: number }> = [];

    for (const [timestamp, bucketPosts] of buckets) {
      const analysis = this.keywordAnalysis(bucketPosts);
      results.push({
        timestamp: new Date(timestamp),
        sentiment: analysis.score,
        postCount: bucketPosts.length,
      });
    }

    return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
