import {
  DEFAULT_SCHEDULES,
  GitHubHunter,
  GitHubRepoSchema,
  HNItemSchema,
  HackerNewsHunter,
  HuntDiscoverySchema,
  HuntSourceSchema,
  NitterHunter,
  RELEVANCE_KEYWORDS,
  RawDiscoverySchema,
  TwitterHunter,
  TwitterTweetSchema
} from "./chunk-OKBHOUOO.js";

// src/hunter-agent.ts
import { BaseAgent } from "@gicm/agent-core";
import { CronJob } from "cron";
var HunterAgent = class extends BaseAgent {
  hunters = /* @__PURE__ */ new Map();
  jobs = /* @__PURE__ */ new Map();
  seen = /* @__PURE__ */ new Map();
  // fingerprint -> timestamp
  deduplicationTTL;
  onDiscovery;
  isRunning = false;
  constructor(config) {
    super("hunter", config);
    this.deduplicationTTL = config.deduplicationTTL ?? 7 * 24 * 60 * 60 * 1e3;
    this.onDiscovery = config.onDiscovery;
    for (const sourceConfig of config.sources) {
      if (!sourceConfig.enabled) continue;
      const hunter = this.createHunter(sourceConfig);
      if (hunter) {
        this.hunters.set(sourceConfig.source, hunter);
      }
    }
  }
  getSystemPrompt() {
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
  async analyze(context) {
    const action = context.action ?? "hunt";
    switch (action) {
      case "hunt":
        return this.performHunt(context.params?.sources);
      case "status":
        return this.getStatus();
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }
  async start() {
    if (this.isRunning) {
      this.log("Hunter agent already running");
      return;
    }
    this.isRunning = true;
    this.log("Starting hunter agent");
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
  async stop() {
    this.log("Stopping hunter agent");
    this.isRunning = false;
    for (const [source, job] of this.jobs) {
      job.stop();
      this.log(`Stopped ${source} hunter`);
    }
    this.jobs.clear();
  }
  async huntNow(sources) {
    const targetSources = sources ?? Array.from(this.hunters.keys());
    const allDiscoveries = [];
    for (const source of targetSources) {
      const hunter = this.hunters.get(source);
      if (!hunter) continue;
      const discoveries = await this.huntSource(source, hunter);
      allDiscoveries.push(...discoveries);
    }
    return allDiscoveries;
  }
  async performHunt(sources) {
    try {
      const discoveries = await this.huntNow(sources);
      return this.createResult(
        true,
        {
          count: discoveries.length,
          discoveries,
          sources: sources ?? Array.from(this.hunters.keys())
        },
        void 0,
        0.9,
        `Found ${discoveries.length} new discoveries`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }
  async huntSource(source, hunter) {
    try {
      this.log(`Hunting ${source}...`);
      const rawDiscoveries = await hunter.hunt();
      this.log(`${source}: Found ${rawDiscoveries.length} raw discoveries`);
      const discoveries = [];
      for (const raw of rawDiscoveries) {
        const discovery = hunter.transform(raw);
        if (this.hasSeen(discovery.fingerprint)) {
          continue;
        }
        this.markSeen(discovery.fingerprint);
        discoveries.push(discovery);
      }
      this.log(`${source}: ${discoveries.length} new unique discoveries`);
      if (this.onDiscovery && discoveries.length > 0) {
        await this.onDiscovery(discoveries);
      }
      return discoveries;
    } catch (error) {
      this.log(`${source} hunt failed: ${error}`);
      return [];
    }
  }
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      hunters: Array.from(this.hunters.keys()),
      jobs: Array.from(this.jobs.entries()).map(([source, job]) => ({
        source,
        running: job.running,
        nextRun: job.nextDate()?.toISO()
      })),
      seenCount: this.seen.size
    };
    return this.createResult(true, status, void 0, 1, "Status retrieved");
  }
  createHunter(config) {
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
  getSchedule(source) {
    const config = this.findSourceConfig(source);
    return config?.schedule ?? DEFAULT_SCHEDULES[source];
  }
  findSourceConfig(source) {
    const agentConfig = this.config;
    return agentConfig.sources.find((s) => s.source === source);
  }
  hasSeen(fingerprint) {
    const timestamp = this.seen.get(fingerprint);
    if (!timestamp) return false;
    if (Date.now() - timestamp > this.deduplicationTTL) {
      this.seen.delete(fingerprint);
      return false;
    }
    return true;
  }
  markSeen(fingerprint) {
    this.seen.set(fingerprint, Date.now());
    if (this.seen.size > 1e4) {
      this.cleanupSeen();
    }
  }
  cleanupSeen() {
    const now = Date.now();
    for (const [fingerprint, timestamp] of this.seen) {
      if (now - timestamp > this.deduplicationTTL) {
        this.seen.delete(fingerprint);
      }
    }
  }
};
export {
  DEFAULT_SCHEDULES,
  GitHubHunter,
  GitHubRepoSchema,
  HNItemSchema,
  HackerNewsHunter,
  HuntDiscoverySchema,
  HuntSourceSchema,
  HunterAgent,
  NitterHunter,
  RELEVANCE_KEYWORDS,
  RawDiscoverySchema,
  TwitterHunter,
  TwitterTweetSchema
};
//# sourceMappingURL=index.js.map