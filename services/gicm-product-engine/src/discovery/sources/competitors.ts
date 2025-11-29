/**
 * Competitor Discovery
 *
 * Monitor competitor features and identify gaps.
 */

import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";
import type { Opportunity, CompetitorFeature } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

const COMPETITORS = [
  { name: "Cursor", url: "https://cursor.com", changelog: "https://cursor.com/changelog" },
  { name: "Replit", url: "https://replit.com", changelog: "https://blog.replit.com" },
  { name: "v0", url: "https://v0.dev", changelog: "https://v0.dev/changelog" },
  { name: "Bolt", url: "https://bolt.new", changelog: "https://bolt.new/changelog" },
  { name: "Lovable", url: "https://lovable.dev", changelog: "https://lovable.dev/changelog" },
];

export class CompetitorDiscovery {
  private anthropic: Anthropic;
  private logger: Logger;
  private knownFeatures: Map<string, CompetitorFeature> = new Map();

  constructor() {
    this.anthropic = new Anthropic();
    this.logger = new Logger("CompetitorDiscovery");
  }

  /**
   * Discover competitor features
   */
  async discover(): Promise<Opportunity[]> {
    this.logger.info("Scanning competitors...");

    const opportunities: Opportunity[] = [];

    for (const competitor of COMPETITORS) {
      try {
        const features = await this.scanCompetitor(competitor);

        for (const feature of features) {
          // Skip if we already have this feature
          if (feature.weHaveIt) continue;

          // Skip if already known
          const key = `${competitor.name}-${feature.feature}`;
          if (this.knownFeatures.has(key)) continue;

          this.knownFeatures.set(key, feature);

          // Convert to opportunity
          if (feature.priority !== "ignore") {
            const opp = this.featureToOpportunity(feature);
            opportunities.push(opp);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to scan ${competitor.name}: ${error}`);
      }
    }

    this.logger.info(`Found ${opportunities.length} competitor features to consider`);
    return opportunities;
  }

  /**
   * Scan a single competitor
   */
  private async scanCompetitor(competitor: {
    name: string;
    url: string;
    changelog: string;
  }): Promise<CompetitorFeature[]> {
    // Fetch changelog/updates page
    let content = "";
    try {
      const response = await axios.get(competitor.changelog, { timeout: 10000 });
      const $ = cheerio.load(response.data);
      content = $("body").text().slice(0, 5000); // First 5000 chars
    } catch {
      // If changelog fails, try main page
      try {
        const response = await axios.get(competitor.url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        content = $("body").text().slice(0, 5000);
      } catch {
        return [];
      }
    }

    // Use LLM to extract features
    const prompt = `Analyze this content from ${competitor.name} (an AI coding tool competitor to gICM).

Content:
${content}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus
- Context engine for codebase understanding

Extract any notable features or capabilities. For each:
1. Feature name
2. Brief description
3. Does gICM likely have this? (yes/no)
4. Priority for gICM to build (must_have/nice_to_have/ignore)

Return as JSON array:
[
  {
    "feature": "feature name",
    "description": "what it does",
    "weHaveIt": false,
    "priority": "must_have"
  }
]

Only include genuine product features, not marketing fluff.`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0];
      if (text.type !== "text") return [];

      const match = text.text.match(/\[[\s\S]*\]/);
      if (!match) return [];

      const features = JSON.parse(match[0]) as Array<{
        feature: string;
        description: string;
        weHaveIt: boolean;
        priority: "must_have" | "nice_to_have" | "ignore";
      }>;

      return features.map((f) => ({
        competitor: competitor.name,
        feature: f.feature,
        description: f.description,
        weHaveIt: f.weHaveIt,
        priority: f.priority,
        userReception: "neutral" as const,
      }));
    } catch (error) {
      this.logger.error(`LLM analysis failed: ${error}`);
      return [];
    }
  }

  /**
   * Convert feature to opportunity
   */
  private featureToOpportunity(feature: CompetitorFeature): Opportunity {
    return {
      id: `opp-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "competitor",
      sourceUrl: COMPETITORS.find((c) => c.name === feature.competitor)?.url,
      type: "new_feature",
      title: `Add ${feature.feature} (from ${feature.competitor})`,
      description: feature.description,
      scores: {
        userDemand: feature.priority === "must_have" ? 80 : 50,
        competitiveValue: 85,
        technicalFit: 70,
        effort: 60,
        impact: feature.priority === "must_have" ? 80 : 50,
        overall: 0,
      },
      analysis: {
        whatItDoes: feature.description,
        whyItMatters: `${feature.competitor} has this feature. Users may expect it.`,
        howToBuild: "Analyze competitor implementation and build gICM version",
        risks: ["May not fit gICM's focus", "Effort may be higher than estimated"],
        dependencies: [],
        estimatedEffort: "1-2 weeks",
      },
      status: "discovered",
      priority: feature.priority === "must_have" ? "high" : "medium",
      discoveredAt: Date.now(),
    };
  }
}
