/**
 * GitHub Discovery
 *
 * Find trending repos and technologies.
 */

import { Octokit } from "octokit";
import type { Opportunity } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

const SEARCH_QUERIES = [
  "ai agent typescript",
  "solana defi",
  "react components web3",
  "trading bot crypto",
  "llm tools",
];

export class GitHubDiscovery {
  private octokit: Octokit;
  private logger: Logger;
  private seenRepos: Set<string> = new Set();

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.logger = new Logger("GitHubDiscovery");
  }

  /**
   * Discover opportunities from GitHub
   */
  async discover(): Promise<Opportunity[]> {
    this.logger.info("Scanning GitHub trends...");

    const opportunities: Opportunity[] = [];

    for (const query of SEARCH_QUERIES) {
      try {
        const repos = await this.searchRepos(query);

        for (const repo of repos) {
          // Skip if already seen
          if (this.seenRepos.has(repo.full_name)) continue;
          this.seenRepos.add(repo.full_name);

          // Convert to opportunity if relevant
          const opportunity = this.repoToOpportunity(repo);
          if (opportunity) {
            opportunities.push(opportunity);
          }
        }
      } catch (error) {
        this.logger.error(`Search failed for "${query}": ${error}`);
      }
    }

    this.logger.info(`Found ${opportunities.length} opportunities from GitHub`);
    return opportunities;
  }

  /**
   * Search GitHub repos
   */
  private async searchRepos(
    query: string
  ): Promise<
    Array<{
      full_name: string;
      name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      topics: string[];
      language: string | null;
      created_at: string | null;
    }>
  > {
    try {
      const response = await this.octokit.rest.search.repos({
        q: `${query} created:>2024-01-01 stars:>100`,
        sort: "stars",
        order: "desc",
        per_page: 10,
      });

      return response.data.items.map((item) => ({
        full_name: item.full_name,
        name: item.name,
        description: item.description,
        html_url: item.html_url,
        stargazers_count: item.stargazers_count,
        topics: item.topics || [],
        language: item.language,
        created_at: item.created_at,
      }));
    } catch (error) {
      this.logger.error(`GitHub API error: ${error}`);
      return [];
    }
  }

  /**
   * Convert repo to opportunity
   */
  private repoToOpportunity(repo: {
    full_name: string;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    topics: string[];
    language: string | null;
  }): Opportunity | null {
    // Filter relevance
    const relevantKeywords = ["agent", "ai", "llm", "solana", "web3", "trading", "defi", "component"];
    const isRelevant =
      relevantKeywords.some((kw) => repo.name.toLowerCase().includes(kw)) ||
      relevantKeywords.some((kw) => repo.description?.toLowerCase().includes(kw)) ||
      repo.topics.some((t) => relevantKeywords.includes(t.toLowerCase()));

    if (!isRelevant) return null;

    // Determine type
    let type: Opportunity["type"] = "new_feature";
    if (repo.name.toLowerCase().includes("agent") || repo.topics.includes("ai-agent")) {
      type = "new_agent";
    } else if (repo.name.toLowerCase().includes("component") || repo.topics.includes("react")) {
      type = "new_component";
    }

    return {
      id: `opp-gh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "github",
      sourceUrl: repo.html_url,
      type,
      title: `Integrate ideas from ${repo.name}`,
      description: repo.description || `Popular ${repo.language || "project"} with ${repo.stargazers_count} stars`,
      scores: {
        userDemand: Math.min(100, 30 + Math.log10(repo.stargazers_count) * 20),
        competitiveValue: 70,
        technicalFit: repo.language === "TypeScript" ? 90 : 60,
        effort: 50,
        impact: Math.min(100, 30 + Math.log10(repo.stargazers_count) * 15),
        overall: 0,
      },
      analysis: {
        whatItDoes: repo.description || "See repository for details",
        whyItMatters: `Popular project with ${repo.stargazers_count} stars`,
        howToBuild: "Analyze repository and adapt concepts for gICM",
        risks: ["License compatibility", "May not fit gICM architecture"],
        dependencies: [],
        estimatedEffort: "1-2 weeks",
      },
      status: "discovered",
      priority: repo.stargazers_count > 1000 ? "high" : "medium",
      discoveredAt: Date.now(),
    };
  }
}
