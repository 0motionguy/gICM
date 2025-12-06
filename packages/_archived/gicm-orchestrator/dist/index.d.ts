import { EventEmitter } from 'events';
import { ActivityLogger } from '@gicm/activity-logger';
export { ActivityLogger } from '@gicm/activity-logger';
import { HuntDiscovery } from '@gicm/hunter-agent';
export { HuntDiscovery, HunterAgent } from '@gicm/hunter-agent';
import { z } from 'zod';
export { DecisionAgent, ScoredDiscovery } from '@gicm/decision-agent';
export { BuildRequest, BuildResult, BuilderAgent } from '@gicm/builder-agent';
export { AnalysisResult, RefactorAgent } from '@gicm/refactor-agent';
export { DeployRequest, DeployResult, DeployerAgent } from '@gicm/deployer-agent';

declare const AutonomyLevelSchema: z.ZodEnum<["manual", "assisted", "supervised", "delegated", "autonomous"]>;
type AutonomyLevel = z.infer<typeof AutonomyLevelSchema>;
interface OrchestratorConfig {
    autonomyLevel: AutonomyLevel;
    hunter: {
        enabled: boolean;
        sources: Array<"github" | "hackernews" | "twitter">;
        githubToken?: string;
        apifyToken?: string;
    };
    decision: {
        llmProvider: "openai" | "anthropic" | "gemini";
        apiKey: string;
        model?: string;
        autoApproveThreshold?: number;
    };
    activityLogger?: {
        solanaRpcUrl?: string;
        solanaPrivateKey?: string;
        enableArweave?: boolean;
    };
    schedules?: {
        github?: string;
        hackernews?: string;
        twitter?: string;
        refactor?: string;
    };
}
type OrchestratorState = "idle" | "starting" | "running" | "paused" | "stopping" | "stopped" | "error";
type OrchestratorEvent = "started" | "stopped" | "paused" | "resumed" | "hunt:started" | "hunt:completed" | "discovery:found" | "decision:made" | "approval:required" | "approval:granted" | "approval:rejected" | "build:started" | "build:completed" | "deploy:started" | "deploy:completed" | "error";
interface PendingApproval {
    id: string;
    discoveryId: string;
    decisionId: string;
    title: string;
    source: string;
    score: number;
    recommendation: string;
    reasoning: string;
    createdAt: Date;
    expiresAt?: Date;
}

declare class GICMOrchestrator extends EventEmitter {
    private config;
    private state;
    private autonomyLevel;
    private hunter;
    private decision;
    private builder;
    private refactor;
    private deployer;
    private logger;
    private jobs;
    private pendingApprovals;
    constructor(config: OrchestratorConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    huntNow(sources?: Array<"github" | "hackernews" | "twitter">): Promise<HuntDiscovery[]>;
    approveDecision(id: string, reason?: string): Promise<void>;
    rejectDecision(id: string, reason: string): Promise<void>;
    getPendingApprovals(): PendingApproval[];
    getStatus(): {
        state: OrchestratorState;
        autonomyLevel: AutonomyLevel;
        pendingApprovals: number;
        activeJobs: string[];
        stats: ReturnType<ActivityLogger["getStats"]> | null;
    };
    private initializeAgents;
    private scheduleJobs;
    private processDiscoveries;
    private handleDecision;
    private queueForApproval;
    private triggerBuild;
    private logActivity;
}

export { type AutonomyLevel, AutonomyLevelSchema, GICMOrchestrator, type OrchestratorConfig, type OrchestratorEvent, type OrchestratorState, type PendingApproval };
