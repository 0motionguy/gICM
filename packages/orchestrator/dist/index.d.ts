import { BaseAgent, AgentConfig, AgentContext, AgentResult, LLMClient } from '@gicm/agent-core';
import { z } from 'zod';

declare const OrchestratorConfigSchema: z.ZodObject<{
    maxConcurrentAgents: z.ZodDefault<z.ZodNumber>;
    defaultTimeout: z.ZodDefault<z.ZodNumber>;
    enableMemory: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxConcurrentAgents: number;
    defaultTimeout: number;
    enableMemory: boolean;
}, {
    maxConcurrentAgents?: number | undefined;
    defaultTimeout?: number | undefined;
    enableMemory?: boolean | undefined;
}>;
type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;
type AgentType = "wallet" | "defi" | "nft" | "dao" | "social" | "bridge" | "audit" | "custom";
interface RegisteredAgent {
    id: string;
    type: AgentType;
    name: string;
    description: string;
    capabilities: string[];
    agent: BaseAgent;
}
interface WorkflowStep {
    id: string;
    agentId: string;
    action: string;
    params: Record<string, unknown>;
    dependsOn?: string[];
    condition?: (context: WorkflowContext) => boolean;
}
interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    onError?: "stop" | "continue" | "retry";
    maxRetries?: number;
}
interface WorkflowContext {
    workflowId: string;
    startTime: Date;
    results: Map<string, StepResult>;
    memory: Map<string, unknown>;
    errors: WorkflowError[];
}
interface StepResult {
    stepId: string;
    agentId: string;
    success: boolean;
    data?: unknown;
    error?: string;
    duration: number;
    timestamp: Date;
}
interface WorkflowError {
    stepId: string;
    error: string;
    timestamp: Date;
    recovered: boolean;
}
interface WorkflowResult {
    workflowId: string;
    success: boolean;
    duration: number;
    steps: StepResult[];
    errors: WorkflowError[];
    output?: unknown;
}
interface Intent {
    action: string;
    entities: Record<string, string>;
    confidence: number;
    rawInput: string;
}
interface RoutingDecision {
    agentId: string;
    action: string;
    params: Record<string, unknown>;
    confidence: number;
    reasoning: string;
}
interface MemoryEntry {
    key: string;
    value: unknown;
    timestamp: Date;
    ttl?: number;
    tags: string[];
}

declare class SharedMemory {
    private store;
    private maxEntries;
    private defaultTTL;
    constructor(config?: {
        maxEntries?: number;
        defaultTTL?: number;
    });
    set(key: string, value: unknown, options?: {
        ttl?: number;
        tags?: string[];
    }): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    getByTag(tag: string): MemoryEntry[];
    deleteByTag(tag: string): number;
    private isExpired;
    private evictOldest;
    clear(): void;
    size(): number;
    keys(pattern?: string): string[];
    setWorkflowContext(workflowId: string, stepId: string, data: unknown): void;
    getWorkflowContext<T>(workflowId: string, stepId: string): T | null;
    clearWorkflowContext(workflowId: string): number;
    setAgentState(agentId: string, state: unknown): void;
    getAgentState<T>(agentId: string): T | null;
    setSessionContext(sessionId: string, key: string, value: unknown): void;
    getSessionContext<T>(sessionId: string, key: string): T | null;
    cached<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
}

declare class Orchestrator extends BaseAgent {
    private router;
    private memory;
    private agents;
    private workflows;
    private runningWorkflows;
    private orchestratorConfig;
    private llmClient?;
    constructor(config: OrchestratorConfig & AgentConfig);
    private registerBuiltInWorkflows;
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    private matchWorkflow;
    private extractWorkflowParams;
    registerAgent(id: string, type: AgentType, name: string, description: string, capabilities: string[], agent: BaseAgent): void;
    unregisterAgent(id: string): void;
    registerWorkflow(workflow: Workflow): void;
    executeWorkflow(workflow: Workflow, params: Record<string, unknown>): Promise<WorkflowResult>;
    private buildExecutionOrder;
    private executeStep;
    private resolveParams;
    private aggregateResults;
    getMemory(): SharedMemory;
    getRegisteredAgents(): RegisteredAgent[];
    getWorkflows(): Workflow[];
    getRunningWorkflows(): string[];
}

declare class Router {
    private agents;
    private llmClient?;
    constructor(llmClient?: LLMClient);
    registerAgent(agent: RegisteredAgent): void;
    unregisterAgent(agentId: string): void;
    route(input: string): Promise<RoutingDecision | null>;
    private llmRoute;
    private keywordRoute;
    private inferAction;
    private extractParams;
    parseIntent(input: string): Intent;
    getAvailableAgents(): RegisteredAgent[];
}

declare const tradingWorkflows: {
    "research-token": Workflow;
    "swap-token": Workflow;
    "bridge-tokens": Workflow;
    "analyze-portfolio": Workflow;
};

declare const researchWorkflows: {
    "project-due-diligence": Workflow;
    "nft-collection-analysis": Workflow;
    "dao-governance-analysis": Workflow;
    "influencer-tracking": Workflow;
};

declare const portfolioWorkflows: {
    "rebalance-portfolio": Workflow;
    "yield-farming-analysis": Workflow;
    "risk-assessment": Workflow;
    "daily-portfolio-update": Workflow;
};

export { type AgentType, type Intent, type MemoryEntry, Orchestrator, type OrchestratorConfig, OrchestratorConfigSchema, type RegisteredAgent, Router, type RoutingDecision, SharedMemory, type StepResult, type Workflow, type WorkflowContext, type WorkflowError, type WorkflowResult, type WorkflowStep, portfolioWorkflows, researchWorkflows, tradingWorkflows };
