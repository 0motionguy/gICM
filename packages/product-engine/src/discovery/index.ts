/**
 * Discovery Manager
 *
 * Finds opportunities from multiple sources.
 */

import { CronJob } from "cron";
import type { Opportunity, DiscoverySource } from "../core/types.js";
import { CompetitorDiscovery } from "./sources/competitors.js";
import { GitHubDiscovery } from "./sources/github.js";
import { HackerNewsDiscovery } from "./sources/hackernews.js";
import { OpportunityEvaluator } from "./evaluator.js";
import { Logger } from "../utils/logger.js";

export class DiscoveryManager {
  private logger: Logger;
  private evaluator: OpportunityEvaluator;

  private competitors: CompetitorDiscovery;
  private github: GitHubDiscovery;
  private hackernews: HackerNewsDiscovery;

  private opportunities: Map<string, Opportunity> = new Map();
  private cronJob?: CronJob;

  constructor() {
    this.logger = new Logger("Discovery");
    this.evaluator = new OpportunityEvaluator();

    this.competitors = new CompetitorDiscovery();
    this.github = new GitHubDiscovery();
    this.hackernews = new HackerNewsDiscovery();
  }

  /**
   * Start discovery schedule
   */
  start(): void {
    // Run discovery every 6 hours
    this.cronJob = new CronJob("0 */6 * * *", async () => {
      await this.runDiscovery();
    });
    this.cronJob.start();

    this.logger.info("Discovery manager started");
  }

  /**
   * Stop discovery
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  /**
   * Run full discovery cycle
   */
  async runDiscovery(): Promise<Opportunity[]> {
    this.logger.info("Running discovery cycle...");

    const newOpportunities: Opportunity[] = [];

    // Discover from all sources in parallel
    const [compOpps, ghOpps, hnOpps] = await Promise.all([
      this.discoverFromSource("competitor"),
      this.discoverFromSource("github"),
      this.discoverFromSource("hackernews"),
    ]);

    newOpportunities.push(...compOpps, ...ghOpps, ...hnOpps);

    // Evaluate and score each opportunity
    for (const opp of newOpportunities) {
      const evaluated = await this.evaluator.evaluate(opp);
      this.opportunities.set(evaluated.id, evaluated);
    }

    // Log summary
    const highPriority = newOpportunities.filter(o => o.priority === "high" || o.priority === "critical");
    this.logger.info(`Discovery complete: ${newOpportunities.length} opportunities found, ${highPriority.length} high priority`);

    return newOpportunities;
  }

  /**
   * Discover from a specific source
   */
  async discoverFromSource(source: DiscoverySource): Promise<Opportunity[]> {
    try {
      switch (source) {
        case "competitor":
          return this.competitors.discover();
        case "github":
          return this.github.discover();
        case "hackernews":
          return this.hackernews.discover();
        default:
          return [];
      }
    } catch (error) {
      this.logger.error(`Discovery from ${source} failed: ${error}`);
      return [];
    }
  }

  /**
   * Get prioritized backlog
   */
  getBacklog(): Opportunity[] {
    return Array.from(this.opportunities.values())
      .filter(o => o.status === "evaluated" || o.status === "approved")
      .sort((a, b) => {
        // Sort by priority, then by score
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.scores.overall - a.scores.overall;
      });
  }

  /**
   * Get opportunity by ID
   */
  getOpportunity(id: string): Opportunity | undefined {
    return this.opportunities.get(id);
  }

  /**
   * Approve opportunity for building
   */
  approveOpportunity(id: string): void {
    const opp = this.opportunities.get(id);
    if (opp) {
      opp.status = "approved";
      opp.approvedAt = Date.now();
      this.logger.info(`Approved opportunity: ${opp.title}`);
    }
  }

  /**
   * Reject opportunity
   */
  rejectOpportunity(id: string, reason: string): void {
    const opp = this.opportunities.get(id);
    if (opp) {
      opp.status = "rejected";
      opp.analysis.risks.push(`Rejected: ${reason}`);
      this.logger.info(`Rejected opportunity: ${opp.title} - ${reason}`);
    }
  }
}
