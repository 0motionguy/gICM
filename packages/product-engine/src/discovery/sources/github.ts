/**
 * GitHub Discovery
 *
 * Discover trending repos and tools relevant to gICM.
 */

import axios from "axios";
import type { Opportunity } from "../../core/types.js";
import { generateJSON } from "../../utils/llm.js";
import { Logger } from "../../utils/logger.js";

interface GitHubRepo {
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  created_at: string;
}

export class GitHubDiscovery {
  private logger: Logger;
  private seenRepos: Set<string> = new Set();

  constructor() {
    this.logger = new Logger("GitHubDiscovery");
  }

  /**
   * Discover opportunities from GitHub
   */
  async discover(): Promise<Opportunity[]> {
    this.logger.info("Scanning GitHub trends...");

    const opportunities: Opportunity[] = [];

    // Search queries for relevant repos
    const queries = [
      "ai coding assistant",
      "claude code",
      "llm developer tools",
      "solana typescript",
      "react component library",
      "vibe coding",
    ];

    for (const query of queries) {
      try {
        const repos = await this.searchRepos(query);

        for (const repo of repos) {
          if (this.seenRepos.has(repo.full_name)) continue;
          this.seenRepos.add(repo.full_name);

          // Analyze if this is an opportunity
          const opp = await this.analyzeRepo(repo);
          if (opp) {
            opportunities.push(opp);
          }
        }
      } catch (error) {
        this.logger.error(`GitHub search failed for "${query}": ${error}`);
      }
    }

    this.logger.info(`Found ${opportunities.length} GitHub opportunities`);
    return opportunities;
  }

  /**
   * Search GitHub repos
   */
  private async searchRepos(query: string): Promise<GitHubRepo[]> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get("https://api.github.com/search/repositories", {
      params: {
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 10,
      },
      headers,
      timeout: 10000,
    });

    return response.data.items || [];
  }

  /**
   * Analyze if a repo represents an opportunity
   */
  private async analyzeRepo(repo: GitHubRepo): Promise<Opportunity | null> {
    // Skip repos with few stars
    if (repo.stargazers_count < 100) return null;

    try {
      const analysis = await generateJSON<{
        isRelevant: boolean;
        opportunityType: "new_agent" | "new_component" | "new_feature" | "integration" | null;
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
      }>({
        prompt: `Analyze this GitHub repo for gICM opportunities:

Repo: ${repo.full_name}
Description: ${repo.description || "No description"}
Stars: ${repo.stargazers_count}
Language: ${repo.language}
Topics: ${repo.topics?.join(", ") || "None"}
URL: ${repo.html_url}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus

Could we integrate this, learn from it, or build something similar?

Return JSON:
{
  "isRelevant": true/false,
  "opportunityType": "new_agent" | "new_component" | "new_feature" | "integration" | null,
  "title": "<opportunity title if relevant>",
  "description": "<what we could build/learn>",
  "priority": "high" | "medium" | "low"
}`,
      });

      if (!analysis.isRelevant || !analysis.opportunityType) {
        return null;
      }

      return {
        id: `opp-gh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: "github",
        sourceUrl: repo.html_url,
        type: analysis.opportunityType,
        title: analysis.title,
        description: analysis.description,
        scores: {
          userDemand: 60,
          competitiveValue: 70,
          technicalFit: 75,
          effort: 60,
          impact: 65,
          overall: 0,
        },
        analysis: {
          whatItDoes: repo.description || analysis.description,
          whyItMatters: `Trending on GitHub with ${repo.stargazers_count} stars`,
          howToBuild: "Study the repo and implement gICM version",
          risks: ["May require significant effort", "License compatibility"],
          dependencies: [],
          estimatedEffort: "1-2 weeks",
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
