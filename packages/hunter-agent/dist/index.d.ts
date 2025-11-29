import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';
import { H as HunterConfig, a as HuntDiscovery, b as HuntSource } from './index-JZclvDPM.js';
export { B as BaseHunterSource, D as DEFAULT_SCHEDULES, G as GitHubHunter, h as GitHubRepo, g as GitHubRepoSchema, j as HNItem, i as HNItemSchema, c as HackerNewsHunter, f as HuntDiscoverySchema, d as HuntSourceSchema, N as NitterHunter, m as RELEVANCE_KEYWORDS, e as RawDiscovery, R as RawDiscoverySchema, T as TwitterHunter, l as TwitterTweet, k as TwitterTweetSchema } from './index-JZclvDPM.js';
import 'zod';

interface HunterAgentConfig extends AgentConfig {
    sources: HunterConfig[];
    deduplicationTTL?: number;
    onDiscovery?: (discoveries: HuntDiscovery[]) => Promise<void>;
}
declare class HunterAgent extends BaseAgent {
    private hunters;
    private jobs;
    private seen;
    private deduplicationTTL;
    private onDiscovery?;
    private isRunning;
    constructor(config: HunterAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    start(): Promise<void>;
    stop(): Promise<void>;
    huntNow(sources?: HuntSource[]): Promise<HuntDiscovery[]>;
    private performHunt;
    private huntSource;
    private getStatus;
    private createHunter;
    private getSchedule;
    private findSourceConfig;
    private hasSeen;
    private markSeen;
    private cleanupSeen;
}

export { HuntDiscovery, HuntSource, HunterAgent, type HunterAgentConfig, HunterConfig };
