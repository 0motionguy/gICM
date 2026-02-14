/**
 * @gicm/orchestrator - Type Definitions
 * Comprehensive types for multi-agent task orchestration
 */

import { z } from "zod";

// =============================================================================
// AGENT TYPES
// =============================================================================

export type AgentRole =
  | "specialist"
  | "generalist"
  | "reviewer"
  | "architect"
  | "executor"
  | "coordinator";

export type AgentStatus = "idle" | "busy" | "cooldown" | "error" | "offline";

export type TaskPriority = "critical" | "high" | "medium" | "low";

export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentDefinition {
  id: string;
  name: string;
  role: AgentRole;
  capabilities: string[];
  triggers: string[];
  keywords: string[];
  maxConcurrent: number;
}

export interface AgentInstance extends AgentDefinition {
  status: AgentStatus;
  currentTask?: string;
  stats: {
    totalTasks: number;
    successRate: number;
    avgDuration: number;
    lastActive?: Date;
  };
}

// =============================================================================
// TASK TYPES
// =============================================================================

export interface TaskDefinition {
  id: string;
  description: string;
  priority: TaskPriority;
  requiredCapabilities?: string[];
  estimatedDuration?: number;
  metadata?: Record<string, unknown>;
}

export interface SubTask extends TaskDefinition {
  parentId: string;
  dependencies: string[]; // IDs of tasks that must complete first
  parallelGroup?: number;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  status: TaskStatus;
  output?: string;
  error?: string;
  duration: number;
  startedAt: Date;
  completedAt: Date;
}

// =============================================================================
// VOTING & CONSENSUS
// =============================================================================

export type VoteType = "approve" | "reject" | "abstain";

export interface Vote {
  agentId: string;
  vote: VoteType;
  confidence: number;
  reasoning?: string;
}

export interface VotingRound {
  votes: Vote[];
  result: VoteType;
  consensus: number;
}

export type ConsensusLevel =
  | "unanimous"
  | "strong"
  | "moderate"
  | "weak"
  | "split";

// =============================================================================
// WORKFLOW
// =============================================================================

export type StepStrategy = "parallel" | "sequential" | "conditional" | "vote";

export interface WorkflowStep {
  id: string;
  name: string;
  strategy: StepStrategy;
  agentRoles?: AgentRole[];
  dependencies?: string[];
  condition?: (context: Record<string, unknown>) => boolean;
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  metadata?: Record<string, unknown>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const OrchestratorConfigSchema = z.object({
  maxConcurrent: z.number().int().positive().default(5),
  retryAttempts: z.number().int().min(0).default(2),
  retryDelayMs: z.number().int().min(0).default(1000),
  consensusThreshold: z.number().min(0).max(1).default(0.6),
  taskTimeoutMs: z.number().int().positive().default(30000),
  loadBalancing: z
    .enum(["round-robin", "least-loaded", "best-match"])
    .default("best-match"),
});

export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

// =============================================================================
// EVENTS
// =============================================================================

export type OrchestratorEvents = {
  "agent:registered": [AgentDefinition];
  "agent:acquired": [string, string]; // agentId, taskId
  "agent:released": [string];
  "task:created": [TaskDefinition];
  "task:decomposed": [TaskDefinition, SubTask[]];
  "task:started": [string, string]; // taskId, agentId
  "task:completed": [TaskResult];
  "task:failed": [TaskResult];
  "workflow:started": [string]; // workflowId
  "workflow:completed": [string, TaskResult[]];
  "consensus:reached": [VotingRound];
};

// =============================================================================
// AGENT EXECUTOR INTERFACE (injectable)
// =============================================================================

export interface AgentExecutor {
  execute(agent: AgentInstance, task: TaskDefinition): Promise<TaskResult>;
}
