/**
 * gICM Product Engine
 *
 * Automated product development system.
 */

import { CronJob } from "cron";
import { DiscoveryManager } from "./discovery/index.js";
import { AgentBuilder } from "./builder/agents/agent-builder.js";
import type {
  Opportunity,
  AgentSpec,
  ProductMetrics,
  ProductEngineConfig,
} from "./core/types.js";
import { Logger } from "./utils/logger.js";

export class ProductEngine {
  private config: ProductEngineConfig;
  private logger: Logger;

  private discovery: DiscoveryManager;
  private agentBuilder: AgentBuilder;

  private cronJobs: CronJob[] = [];
  private isRunning: boolean = false;

  constructor(config: ProductEngineConfig) {
    this.config = config;
    this.logger = new Logger("ProductEngine");

    this.discovery = new DiscoveryManager();
    this.agentBuilder = new AgentBuilder();
  }

  /**
   * Start the product engine
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.logger.info("Starting gICM Product Engine...");
    this.isRunning = true;

    // Start discovery
    if (this.config.enableDiscovery) {
      this.discovery.start();

      // Schedule processing
      if (this.config.discoveryInterval) {
        const processJob = new CronJob(this.config.discoveryInterval, async () => {
          await this.processBacklog();
        });
        processJob.start();
        this.cronJobs.push(processJob);
      }
    }

    this.logger.info("Product Engine running");
    this.printStatus();
  }

  /**
   * Stop the product engine
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.logger.info("Stopping Product Engine...");

    this.discovery.stop();

    for (const job of this.cronJobs) {
      job.stop();
    }
    this.cronJobs = [];

    this.isRunning = false;
    this.logger.info("Product Engine stopped");
  }

  /**
   * Process the backlog
   */
  private async processBacklog(): Promise<void> {
    const backlog = this.discovery.getBacklog();

    for (const opportunity of backlog) {
      // Auto-approve if score is high enough
      if (
        this.config.enableAutoBuilding &&
        opportunity.scores.overall >= this.config.autoApproveThreshold &&
        opportunity.status === "evaluated"
      ) {
        this.discovery.approveOpportunity(opportunity.id);
      }

      // Build approved opportunities
      if (opportunity.status === "approved") {
        await this.buildOpportunity(opportunity);
      }
    }
  }

  /**
   * Build an opportunity
   */
  private async buildOpportunity(opportunity: Opportunity): Promise<void> {
    this.logger.info(`Building: ${opportunity.title}`);

    try {
      if (opportunity.type === "new_agent") {
        const spec = this.opportunityToAgentSpec(opportunity);
        const task = await this.agentBuilder.build(spec);

        // Log artifacts
        for (const artifact of task.artifacts) {
          this.logger.info(`Created: ${artifact.path}`);
        }
      }

      // Mark as completed
      opportunity.status = "deployed";
      opportunity.completedAt = Date.now();
    } catch (error) {
      this.logger.error(`Build failed: ${error}`);
      opportunity.status = "evaluated"; // Return to backlog
    }
  }

  /**
   * Convert opportunity to agent spec
   */
  private opportunityToAgentSpec(opportunity: Opportunity): AgentSpec {
    const name =
      opportunity.title
        .replace(/^Add |^Build |^Create |^Research: /, "")
        .replace(/\s+/g, "")
        .replace(/Agent$/, "") + "Agent";

    return {
      name,
      slug: name
        .toLowerCase()
        .replace(/agent$/, "")
        .replace(/[^a-z0-9]/g, "-") + "-agent",
      description: opportunity.description,
      category: "automation",
      capabilities: [opportunity.analysis.whatItDoes],
      inputs: [
        {
          name: "input",
          type: "Record<string, any>",
          description: "Agent input",
          required: true,
        },
      ],
      outputs: [{ name: "result", type: "Record<string, any>", description: "Agent output" }],
      dependencies: [],
      apis: [],
      defaultConfig: {},
      version: "1.0.0",
      author: "gICM",
      license: "MIT",
    };
  }

  /**
   * Run discovery manually
   */
  async runDiscovery(): Promise<Opportunity[]> {
    return this.discovery.runDiscovery();
  }

  /**
   * Get backlog
   */
  getBacklog(): Opportunity[] {
    return this.discovery.getBacklog();
  }

  /**
   * Build agent from spec
   */
  async buildAgent(spec: AgentSpec): Promise<void> {
    const task = await this.agentBuilder.build(spec);

    console.log("\n🤖 Agent Built:");
    console.log("═".repeat(50));
    console.log(`Name: ${spec.name}`);
    console.log(`Files created: ${task.artifacts.length}`);
    for (const artifact of task.artifacts) {
      console.log(`  - ${artifact.path}`);
    }
    console.log("═".repeat(50) + "\n");
  }

  /**
   * Print status
   */
  printStatus(): void {
    const backlog = this.discovery.getBacklog();

    console.log("\n🔧 gICM Product Engine Status");
    console.log("═".repeat(50));
    console.log(`\n🔍 Discovery:`);
    console.log(`   Enabled: ${this.config.enableDiscovery ? "✅" : "❌"}`);
    console.log(`   Interval: ${this.config.discoveryInterval || "manual"}`);
    console.log(`\n📋 Backlog:`);
    console.log(`   Total: ${backlog.length}`);
    console.log(
      `   High priority: ${backlog.filter((o) => o.priority === "high" || o.priority === "critical").length}`
    );
    console.log(`   Approved: ${backlog.filter((o) => o.status === "approved").length}`);
    console.log(`\n🏗️ Building:`);
    console.log(`   Auto-build: ${this.config.enableAutoBuilding ? "✅" : "❌"}`);
    console.log(`   Auto-approve threshold: ${this.config.autoApproveThreshold}`);
    console.log(`\n🚀 Deployment:`);
    console.log(`   Auto-deploy: ${this.config.enableAutoDeploy ? "✅" : "❌"}`);
    console.log("═".repeat(50) + "\n");
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<Partial<ProductMetrics>> {
    return {
      growth: {
        newAgents: 0,
        newComponents: 0,
        improvements: 0,
      },
    };
  }

  /**
   * Get discovery manager
   */
  getDiscovery(): DiscoveryManager {
    return this.discovery;
  }

  /**
   * Check if running
   */
  isEngineRunning(): boolean {
    return this.isRunning;
  }
}

// Exports
export * from "./core/types.js";
export * from "./discovery/index.js";
export * from "./builder/index.js";
export { Logger } from "./utils/logger.js";
