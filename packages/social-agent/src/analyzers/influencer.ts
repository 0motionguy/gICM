import type { SocialUser, SocialPost, Influencer } from "../types.js";

export interface InfluencerMetrics {
  engagementRate: number;
  avgLikes: number;
  avgReposts: number;
  avgReplies: number;
  postFrequency: number; // Posts per day
  peakHours: number[];
  topTopics: string[];
}

export class InfluencerAnalyzer {
  analyzeInfluencer(user: SocialUser, posts: SocialPost[]): Influencer {
    const metrics = this.calculateMetrics(posts);
    const topics = this.extractTopics(posts);

    return {
      ...user,
      engagementRate: metrics.engagementRate,
      avgLikes: metrics.avgLikes,
      avgReposts: metrics.avgReposts,
      topics,
      recentPosts: posts.slice(0, 10),
    };
  }

  calculateMetrics(posts: SocialPost[]): InfluencerMetrics {
    if (posts.length === 0) {
      return {
        engagementRate: 0,
        avgLikes: 0,
        avgReposts: 0,
        avgReplies: 0,
        postFrequency: 0,
        peakHours: [],
        topTopics: [],
      };
    }

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes ?? 0), 0);
    const totalReposts = posts.reduce((sum, p) => sum + (p.reposts ?? 0), 0);
    const totalReplies = posts.reduce((sum, p) => sum + (p.replies ?? 0), 0);

    const avgLikes = totalLikes / posts.length;
    const avgReposts = totalReposts / posts.length;
    const avgReplies = totalReplies / posts.length;

    // Calculate post frequency
    const timestamps = posts.map((p) => p.timestamp.getTime()).sort((a, b) => a - b);
    const timeSpanDays =
      timestamps.length > 1
        ? (timestamps[timestamps.length - 1]! - timestamps[0]!) / (1000 * 60 * 60 * 24)
        : 1;
    const postFrequency = posts.length / Math.max(timeSpanDays, 1);

    // Calculate peak hours
    const hourCounts = new Map<number, number>();
    for (const post of posts) {
      const hour = post.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    }
    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Engagement rate (simplified - would need follower count for accuracy)
    const avgEngagement = avgLikes + avgReposts * 2 + avgReplies * 3;
    const engagementRate = avgEngagement / 100; // Normalize

    return {
      engagementRate,
      avgLikes,
      avgReposts,
      avgReplies,
      postFrequency,
      peakHours: sortedHours,
      topTopics: this.extractTopics(posts),
    };
  }

  extractTopics(posts: SocialPost[]): string[] {
    const hashtagCounts = new Map<string, number>();
    const wordCounts = new Map<string, number>();

    // Common words to ignore
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been",
      "being", "have", "has", "had", "do", "does", "did", "will",
      "would", "could", "should", "may", "might", "must", "shall",
      "can", "need", "dare", "ought", "used", "to", "of", "in",
      "for", "on", "with", "at", "by", "from", "as", "into", "through",
      "during", "before", "after", "above", "below", "between", "under",
      "again", "further", "then", "once", "here", "there", "when",
      "where", "why", "how", "all", "each", "few", "more", "most",
      "other", "some", "such", "no", "nor", "not", "only", "own",
      "same", "so", "than", "too", "very", "just", "and", "but",
      "if", "or", "because", "until", "while", "this", "that", "these",
      "those", "it", "its", "i", "my", "you", "your", "we", "our", "they", "their",
    ]);

    for (const post of posts) {
      // Count hashtags
      if (post.hashtags) {
        for (const tag of post.hashtags) {
          hashtagCounts.set(tag.toLowerCase(), (hashtagCounts.get(tag.toLowerCase()) ?? 0) + 1);
        }
      }

      // Count significant words
      const words = post.content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w));

      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
      }
    }

    // Combine hashtags and frequent words
    const topics = new Map<string, number>();

    for (const [tag, count] of hashtagCounts) {
      topics.set(`#${tag}`, count * 2); // Weight hashtags higher
    }

    for (const [word, count] of wordCounts) {
      if (count >= 3) {
        // Only include words that appear multiple times
        topics.set(word, (topics.get(word) ?? 0) + count);
      }
    }

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  rankInfluencers(influencers: Influencer[]): Influencer[] {
    return [...influencers].sort((a, b) => {
      // Score based on followers, engagement, and activity
      const scoreA =
        a.followers * 0.3 +
        a.engagementRate * 10000 * 0.4 +
        a.avgLikes * 0.2 +
        a.avgReposts * 100 * 0.1;

      const scoreB =
        b.followers * 0.3 +
        b.engagementRate * 10000 * 0.4 +
        b.avgLikes * 0.2 +
        b.avgReposts * 100 * 0.1;

      return scoreB - scoreA;
    });
  }

  findSimilarInfluencers(
    target: Influencer,
    candidates: Influencer[]
  ): Influencer[] {
    const targetTopics = new Set(target.topics);

    return candidates
      .filter((c) => c.id !== target.id)
      .map((candidate) => {
        const sharedTopics = candidate.topics.filter((t) => targetTopics.has(t));
        const similarity = sharedTopics.length / Math.max(target.topics.length, 1);
        return { candidate, similarity };
      })
      .filter(({ similarity }) => similarity > 0.2)
      .sort((a, b) => b.similarity - a.similarity)
      .map(({ candidate }) => candidate);
  }
}
