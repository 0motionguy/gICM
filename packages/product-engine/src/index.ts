/**
 * gICM Product Engine
 *
 * Autonomous product development automation.
 * Discovers opportunities, builds agents/components, and deploys automatically.
 */

import { CronJob } from "cron";
import type { ProductEngineConfig, ProductMetrics, Opportunity, BuildTask } from "./core/types.js";
import { DiscoveryManager } from "./discovery/index.js";
import { AgentBuilder } from "./builder/agents/agent-builder.js";
import { QualityGate } from "./quality/index.js";
import { Logger } from "./utils/logger.js";

export interface EngineStatus {
  running: boolean;
  startedAt: number | null;
  metrics: ProductMetrics;
  backlog: Opportunity[];
  activeBuild: BuildTask | null;
  recentBuilds: BuildTask[];
}

export class ProductEngine {
  private logger: Logger;
  private config: ProductEngineConfig;

  private discovery: DiscoveryManager;
  private agentBuilder: AgentBuilder;
  private qualityGate: QualityGate;

  private discoveryCron?: CronJob;
  private buildCron?: CronJob;

  private activeBuild: BuildTask | null = null;
  private recentBuilds: BuildTask[] = [];

  private status: EngineStatus = {
    running: false,
    startedAt: null,
    metrics: {
      discovered: 0,
      built: 0,
      deployed: 0,
      failed: 0,
      avgBuildTime: 0,
      avgQualityScore: 0,
      usage: { agentsUsed: 0, componentsDownloaded: 0, apiCalls: 0 },
      quality: { bugReports: 0, crashRate: 0, userSatisfaction: 0 },
      growth: { newAgents: 0, newComponents: 0, improvements: 0 },
      efficiency: { avgBuildTime: 0, successRate: 0, automationRate: 0 },
    },
    backlog: [],
    activeBuild: null,
    recentBuilds: [],
  };

  constructor(config?: Partial<ProductEngineConfig>) {
    this.logger = new Logger("ProductEngine");

    this.config = {
      discovery: {
        enabled: config?.discovery?.enabled ?? true,
        sources: config?.discovery?.sources || ["competitor", "github", "hackernews"],
        intervalHours: config?.discovery?.intervalHours || 6,
      },
      building: {
        autoApprove: config?.building?.autoApprove ?? false,
        autoBuild: config?.building?.autoBuild ?? true,
        outputDir: config?.building?.outputDir || "packages",
      },
      quality: {
        minTestScore: config?.quality?.minTestScore || 80,
        minReviewScore: config?.quality?.minReviewScore || 70,
        requireApproval: config?.quality?.requireApproval ?? true,
      },
      deployment: {
        autoDeploy: config?.deployment?.autoDeploy ?? false,
        registry: config?.deployment?.registry || "npm",
        notifications: config?.deployment?.notifications ?? true,
      },
    };

    this.discovery = new DiscoveryManager();
    this.agentBuilder = new AgentBuilder({
      outputDir: this.config.building.outputDir,
    });
    this.qualityGate = new QualityGate({
      minTestScore: this.config.quality.minTestScore,
      minReviewScore: this.config.quality.minReviewScore,
    });
  }

  /**
   * Start the Product Engine
   */
  async start(): Promise<void> {
    this.logger.info("Starting Product Engine...");

    try {
      // Discovery schedule
      if (this.config.discovery.enabled) {
        this.discovery.start();

        // Also run discovery cron for more control
        this.discoveryCron = new CronJob(`0 */${this.config.discovery.intervalHours} * * *`, async () => {
          await this.runDiscovery();
        });
        this.discoveryCron.start();
      }

      // Build processing (every hour)
      if (this.config.building.autoBuild) {
        this.buildCron = new CronJob("0 * * * *", async () => {
          await this.processNextBuild();
        });
        this.buildCron.start();
      }

      this.status.running = true;
      this.status.startedAt = Date.now();

      this.logger.info("Product Engine started successfully!");
      this.logger.info(`- Discovery: every ${this.config.discovery.intervalHours}h`);
      this.logger.info(`- Sources: ${this.config.discovery.sources.join(", ")}`);
      this.logger.info(`- Auto-build: ${this.config.building.autoBuild}`);
    } catch (error) {
      this.logger.error(`Failed to start: ${error}`);
      throw error;
    }
  }

  /**
   * Stop the Product Engine
   */
  stop(): void {
    this.logger.info("Stopping Product Engine...");

    this.discovery.stop();

    if (this.discoveryCron) {
      this.discoveryCron.stop();
    }

    if (this.buildCron) {
      this.buildCron.stop();
    }

    this.status.running = false;
    this.logger.info("Product Engine stopped");
  }

  /**
   * Run discovery cycle
   */
  async runDiscovery(): Promise<Opportunity[]> {
    this.logger.info("Running discovery...");

    const opportunities = await this.discovery.runDiscovery();
    this.status.metrics.discovered += opportunities.length;
    this.status.backlog = this.discovery.getBacklog();

    this.logger.info(`Discovery complete: ${opportunities.length} new opportunities`);
    return opportunities;
  }

  /**
   * Process next build from backlog
   */
  async processNextBuild(): Promise<BuildTask | null> {
    if (this.activeBuild) {
      this.logger.info("Build already in progress");
      return null;
    }

    const backlog = this.discovery.getBacklog();
    const approved = backlog.filter((o) => o.status === "approved");

    if (approved.length === 0) {
      // Auto-approve high priority if configured
      if (this.config.building.autoApprove) {
        const highPriority = backlog.find(
          (o) => o.status === "evaluated" && (o.priority === "critical" || o.priority === "high")
        );
        if (highPriority) {
          this.discovery.approveOpportunity(highPriority.id);
          return this.buildOpportunity(highPriority);
        }
      }

      this.logger.info("No approved opportunities to build");
      return null;
    }

    return this.buildOpportunity(approved[0]);
  }

  /**
   * Build an opportunity
   */
  async buildOpportunity(opportunity: Opportunity): Promise<BuildTask> {
    this.logger.info(`Building: ${opportunity.title}`);

    this.activeBuild = {
      id: `build-${Date.now()}`,
      opportunityId: opportunity.id,
      type: "agent",
      spec: {
        name: opportunity.title.replace(/\s+/g, ""),
        description: opportunity.description,
        capabilities: [],
        tools: [],
        dependencies: [],
        testCases: [],
      },
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
      logs: [],
    };

    this.status.activeBuild = this.activeBuild;

    try {
      // Build agent
      const task = await this.agentBuilder.buildFromOpportunity(opportunity);
      this.activeBuild = task;

      if (task.status === "completed") {
        // Run quality checks
        this.logger.info("Running quality checks...");
        const quality = await this.qualityGate.check(task);

        if (quality.passed) {
          this.logger.info(`Build passed quality gate (score: ${quality.reviewResults?.score})`);
          this.status.metrics.built++;
          this.status.metrics.avgQualityScore =
            (this.status.metrics.avgQualityScore * (this.status.metrics.built - 1) +
              (quality.reviewResults?.score || 0)) /
            this.status.metrics.built;

          // Update opportunity status
          opportunity.status = "building";
        } else {
          this.logger.warn("Build failed quality gate");
          task.status = "failed";
          task.error = "Failed quality gate";
          this.status.metrics.failed++;
        }
      } else {
        this.status.metrics.failed++;
      }

      // Record build
      this.recentBuilds.unshift(task);
      if (this.recentBuilds.length > 10) {
        this.recentBuilds.pop();
      }
      this.status.recentBuilds = this.recentBuilds;

      // Calculate avg build time
      const completedBuilds = this.recentBuilds.filter((b) => b.completedAt);
      if (completedBuilds.length > 0) {
        this.status.metrics.avgBuildTime =
          completedBuilds.reduce((sum, b) => sum + (b.completedAt! - b.startedAt), 0) /
          completedBuilds.length;
      }

      return task;
    } finally {
      this.activeBuild = null;
      this.status.activeBuild = null;
    }
  }

  /**
   * Approve an opportunity for building
   */
  approveOpportunity(id: string): void {
    this.discovery.approveOpportunity(id);
  }

  /**
   * Reject an opportunity
   */
  rejectOpportunity(id: string, reason: string): void {
    this.discovery.rejectOpportunity(id, reason);
  }

  /**
   * Get current status
   */
  getStatus(): EngineStatus {
    this.status.backlog = this.discovery.getBacklog();
    return { ...this.status };
  }

  /**
   * Get backlog
   */
  getBacklog(): Opportunity[] {
    return this.discovery.getBacklog();
  }

  /**
   * Get opportunity by ID
   */
  getOpportunity(id: string): Opportunity | undefined {
    return this.discovery.getOpportunity(id);
  }
}

// Exports
export { DiscoveryManager } from "./discovery/index.js";
export { OpportunityEvaluator } from "./discovery/evaluator.js";
export { CompetitorDiscovery } from "./discovery/sources/competitors.js";
export { GitHubDiscovery } from "./discovery/sources/github.js";
export { HackerNewsDiscovery } from "./discovery/sources/hackernews.js";
export { AgentBuilder } from "./builder/agents/agent-builder.js";
export { QualityGate, TestRunner, CodeReviewer } from "./quality/index.js";
export * from "./core/types.js";
