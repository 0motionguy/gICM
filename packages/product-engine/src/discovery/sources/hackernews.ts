/**
 * Hacker News Discovery
 *
 * Discover trending topics and tools from HN.
 */

import axios from "axios";
import type { Opportunity } from "../../core/types.js";
import { generateJSON } from "../../utils/llm.js";
import { Logger } from "../../utils/logger.js";

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants: number;
  type: string;
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
      const topStories = await this.getTopStories();

      // Analyze each story
      for (const story of topStories) {
        if (this.seenItems.has(story.id)) continue;
        this.seenItems.add(story.id);

        const opp = await this.analyzeStory(story);
        if (opp) {
          opportunities.push(opp);
        }
      }
    } catch (error) {
      this.logger.error(`HN discovery failed: ${error}`);
    }

    this.logger.info(`Found ${opportunities.length} HN opportunities`);
    return opportunities;
  }

  /**
   * Get top stories from HN
   */
  private async getTopStories(): Promise<HNItem[]> {
    const response = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json", {
      timeout: 10000,
    });

    const storyIds = response.data.slice(0, 30); // Top 30 stories
    const stories: HNItem[] = [];

    for (const id of storyIds) {
      try {
        const itemResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          timeout: 5000,
        });

        if (itemResponse.data && itemResponse.data.type === "story") {
          stories.push(itemResponse.data);
        }
      } catch {
        // Skip failed requests
      }
    }

    return stories;
  }

  /**
   * Analyze if a story represents an opportunity
   */
  private async analyzeStory(story: HNItem): Promise<Opportunity | null> {
    // Skip low engagement stories
    if (story.score < 50) return null;

    try {
      const analysis = await generateJSON<{
        isRelevant: boolean;
        opportunityType: "new_agent" | "new_component" | "new_feature" | "improvement" | null;
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
      }>({
        prompt: `Analyze this Hacker News story for gICM opportunities:

Title: ${story.title}
URL: ${story.url || "No URL"}
Score: ${story.score}
Comments: ${story.descendants || 0}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus
- Claude Code integration

Is this relevant? Could we build something inspired by this discussion?

Return JSON:
{
  "isRelevant": true/false,
  "opportunityType": "new_agent" | "new_component" | "new_feature" | "improvement" | null,
  "title": "<opportunity title if relevant>",
  "description": "<what we could build>",
  "priority": "high" | "medium" | "low"
}`,
      });

      if (!analysis.isRelevant || !analysis.opportunityType) {
        return null;
      }

      return {
        id: `opp-hn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: "hackernews",
        sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        type: analysis.opportunityType,
        title: analysis.title,
        description: analysis.description,
        scores: {
          userDemand: 55,
          competitiveValue: 60,
          technicalFit: 65,
          effort: 60,
          impact: 55,
          overall: 0,
        },
        analysis: {
          whatItDoes: analysis.description,
          whyItMatters: `Trending on HN with ${story.score} points`,
          howToBuild: "Research the topic and implement gICM version",
          risks: ["May be a passing trend", "Scope unclear"],
          dependencies: [],
          estimatedEffort: "1 week",
        },
        status: "discovered",
        priority: analysis.priority,
        discoveredAt: Date.now(),
      };
    } catch {
      return null;
    }
  }
}
