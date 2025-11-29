/**
 * Hacker News Discovery
 *
 * Find trending discussions and technologies.
 */

import axios from "axios";
import type { Opportunity } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

const HN_API = "https://hacker-news.firebaseio.com/v0";

const RELEVANT_KEYWORDS = [
  "ai agent",
  "llm",
  "claude",
  "gpt",
  "solana",
  "web3",
  "defi",
  "trading bot",
  "react component",
  "typescript",
  "developer tools",
];

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  by: string;
  time: number;
}

export class HackerNewsDiscovery {
  private logger: Logger;
  private seenItems: Set<number> = new Set();

  constructor() {
    this.logger = new Logger("HackerNewsDiscovery");
  }

  /**
   * Discover opportunities from Hacker News
   */
  async discover(): Promise<Opportunity[]> {
    this.logger.info("Scanning Hacker News...");

    const opportunities: Opportunity[] = [];

    try {
      // Get top stories
      const topStoriesResponse = await axios.get<number[]>(`${HN_API}/topstories.json`);
      const topStoryIds = topStoriesResponse.data.slice(0, 100);

      // Fetch story details in parallel (limit to 20)
      const storyPromises = topStoryIds.slice(0, 20).map((id) =>
        axios.get<HNItem>(`${HN_API}/item/${id}.json`).then((r) => r.data)
      );

      const stories = await Promise.all(storyPromises);

      for (const story of stories) {
        if (!story || this.seenItems.has(story.id)) continue;

        // Check relevance
        const isRelevant = RELEVANT_KEYWORDS.some(
          (kw) =>
            story.title.toLowerCase().includes(kw) ||
            story.url?.toLowerCase().includes(kw)
        );

        if (!isRelevant) continue;

        this.seenItems.add(story.id);

        const opportunity = this.storyToOpportunity(story);
        opportunities.push(opportunity);
      }
    } catch (error) {
      this.logger.error(`HN API error: ${error}`);
    }

    this.logger.info(`Found ${opportunities.length} opportunities from HN`);
    return opportunities;
  }

  /**
   * Convert HN story to opportunity
   */
  private storyToOpportunity(story: HNItem): Opportunity {
    // Determine type based on title
    let type: Opportunity["type"] = "new_feature";
    const titleLower = story.title.toLowerCase();

    if (titleLower.includes("agent") || titleLower.includes("ai bot")) {
      type = "new_agent";
    } else if (titleLower.includes("component") || titleLower.includes("ui")) {
      type = "new_component";
    } else if (titleLower.includes("integration") || titleLower.includes("api")) {
      type = "integration";
    }

    return {
      id: `opp-hn-${story.id}`,
      source: "hackernews",
      sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      type,
      title: `Research: ${story.title}`,
      description: `Trending on HN with ${story.score} points and ${story.descendants || 0} comments`,
      scores: {
        userDemand: Math.min(100, 30 + Math.log10(story.score) * 25),
        competitiveValue: 65,
        technicalFit: 70,
        effort: 50,
        impact: Math.min(100, 30 + (story.descendants || 0) / 5),
        overall: 0,
      },
      analysis: {
        whatItDoes: story.title,
        whyItMatters: `Trending discussion on HN (${story.score} points)`,
        howToBuild: "Research the topic and identify actionable improvements for gICM",
        risks: ["May be hype-driven", "Relevance to gICM unclear"],
        dependencies: [],
        estimatedEffort: "Research: 1 day, Implementation: varies",
      },
      status: "discovered",
      priority: story.score > 200 ? "high" : story.score > 100 ? "medium" : "low",
      discoveredAt: Date.now(),
    };
  }
}
