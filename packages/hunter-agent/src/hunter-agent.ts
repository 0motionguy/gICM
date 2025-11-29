import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import { CronJob } from "cron";
import {
  type BaseHunterSource,
  DEFAULT_SCHEDULES,
  type HunterConfig,
  type HuntDiscovery,
  type HuntSource,
} from "./types.js";
import { GitHubHunter } from "./sources/github-hunter.js";
import { HackerNewsHunter } from "./sources/hackernews-hunter.js";
import { TwitterHunter } from "./sources/twitter-hunter.js";

export interface HunterAgentConfig extends AgentConfig {
  sources: HunterConfig[];
  deduplicationTTL?: number; // ms
  onDiscovery?: (discoveries: HuntDiscovery[]) => Promise<void>;
}

export class HunterAgent extends BaseAgent {
  private hunters: Map<HuntSource, BaseHunterSource> = new Map();
  private jobs: Map<HuntSource, CronJob> = new Map();
  private seen: Map<string, number> = new Map(); // fingerprint -> timestamp
  private deduplicationTTL: number;
  private onDiscovery?: (discoveries: HuntDiscovery[]) => Promise<void>;
  private isRunning = false;

  constructor(config: HunterAgentConfig) {
    super("hunter", config);
    this.deduplicationTTL = config.deduplicationTTL ?? 7 * 24 * 60 * 60 * 1000; // 7 days
    this.onDiscovery = config.onDiscovery;

    // Initialize hunters
    for (const sourceConfig of config.sources) {
      if (!sourceConfig.enabled) continue;

      const hunter = this.createHunter(sourceConfig);
      if (hunter) {
        this.hunters.set(sourceConfig.source, hunter);
      }
    }
  }

  getSystemPrompt(): string {
    return `You are a tech discovery agent for gICM.
Your role is to find valuable opportunities from GitHub, HackerNews, and Twitter
that are relevant to Web3, AI, and developer tooling.

You hunt for:
- Trending GitHub repos in crypto/AI
- HackerNews posts about web3 and AI
- Twitter discussions about emerging tech

You evaluate discoveries based on:
- Relevance to gICM (Web3/AI focus)
- Quality signals (stars, engagement)
- Recency and momentum`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = context.action ?? "hunt";

    switch (action) {
      case "hunt":
        return this.performHunt(context.params?.sources as HuntSource[] | undefined);

      case "status":
        return this.getStatus();

      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.log("Hunter agent already running");
      return;
    }

    this.isRunning = true;
    this.log("Starting hunter agent");

    // Schedule jobs for each hunter
    for (const [source, hunter] of this.hunters) {
      const schedule = this.getSchedule(source);

      const job = new CronJob(schedule, async () => {
        this.log(`Running scheduled hunt for ${source}`);
        await this.huntSource(source, hunter);
      });

      job.start();
      this.jobs.set(source, job);
      this.log(`Scheduled ${source} hunter with cron: ${schedule}`);
    }
  }

  async stop(): Promise<void> {
    this.log("Stopping hunter agent");
    this.isRunning = false;

    for (const [source, job] of this.jobs) {
      job.stop();
      this.log(`Stopped ${source} hunter`);
    }

    this.jobs.clear();
  }

  async huntNow(sources?: HuntSource[]): Promise<HuntDiscovery[]> {
    const targetSources = sources ?? Array.from(this.hunters.keys());
    const allDiscoveries: HuntDiscovery[] = [];

    for (const source of targetSources) {
      const hunter = this.hunters.get(source);
      if (!hunter) continue;

      const discoveries = await this.huntSource(source, hunter);
      allDiscoveries.push(...discoveries);
    }

    return allDiscoveries;
  }

  private async performHunt(
    sources?: HuntSource[]
  ): Promise<AgentResult> {
    try {
      const discoveries = await this.huntNow(sources);

      return this.createResult(
        true,
        {
          count: discoveries.length,
          discoveries,
          sources: sources ?? Array.from(this.hunters.keys()),
        },
        undefined,
        0.9,
        `Found ${discoveries.length} new discoveries`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }

  private async huntSource(
    source: HuntSource,
    hunter: BaseHunterSource
  ): Promise<HuntDiscovery[]> {
    try {
      this.log(`Hunting ${source}...`);

      // Fetch raw discoveries
      const rawDiscoveries = await hunter.hunt();
      this.log(`${source}: Found ${rawDiscoveries.length} raw discoveries`);

      // Transform and filter
      const discoveries: HuntDiscovery[] = [];

      for (const raw of rawDiscoveries) {
        const discovery = hunter.transform(raw);

        // Check deduplication
        if (this.hasSeen(discovery.fingerprint)) {
          continue;
        }

        // Mark as seen
        this.markSeen(discovery.fingerprint);
        discoveries.push(discovery);
      }

      this.log(`${source}: ${discoveries.length} new unique discoveries`);

      // Notify callback if provided
      if (this.onDiscovery && discoveries.length > 0) {
        await this.onDiscovery(discoveries);
      }

      return discoveries;
    } catch (error) {
      this.log(`${source} hunt failed: ${error}`);
      return [];
    }
  }

  private getStatus(): AgentResult {
    const status = {
      isRunning: this.isRunning,
      hunters: Array.from(this.hunters.keys()),
      jobs: Array.from(this.jobs.entries()).map(([source, job]) => ({
        source,
        running: job.running,
        nextRun: job.nextDate()?.toISO(),
      })),
      seenCount: this.seen.size,
    };

    return this.createResult(true, status, undefined, 1.0, "Status retrieved");
  }

  private createHunter(config: HunterConfig): BaseHunterSource | null {
    switch (config.source) {
      case "github":
        return new GitHubHunter(config);
      case "hackernews":
        return new HackerNewsHunter(config);
      case "twitter":
        return new TwitterHunter(config);
      default:
        this.log(`Unknown source: ${config.source}`);
        return null;
    }
  }

  private getSchedule(source: HuntSource): string {
    const config = this.findSourceConfig(source);
    return config?.schedule ?? DEFAULT_SCHEDULES[source];
  }

  private findSourceConfig(source: HuntSource): HunterConfig | undefined {
    const agentConfig = this.config as HunterAgentConfig;
    return agentConfig.sources.find((s) => s.source === source);
  }

  private hasSeen(fingerprint: string): boolean {
    const timestamp = this.seen.get(fingerprint);
    if (!timestamp) return false;

    // Check if expired
    if (Date.now() - timestamp > this.deduplicationTTL) {
      this.seen.delete(fingerprint);
      return false;
    }

    return true;
  }

  private markSeen(fingerprint: string): void {
    this.seen.set(fingerprint, Date.now());

    // Cleanup old entries periodically
    if (this.seen.size > 10000) {
      this.cleanupSeen();
    }
  }

  private cleanupSeen(): void {
    const now = Date.now();
    for (const [fingerprint, timestamp] of this.seen) {
      if (now - timestamp > this.deduplicationTTL) {
        this.seen.delete(fingerprint);
      }
    }
  }
}
