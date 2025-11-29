import { z } from "zod";
import type { BaseAgent, LLMClient } from "@gicm/agent-core";

export const OrchestratorConfigSchema = z.object({
  maxConcurrentAgents: z.number().default(5),
  defaultTimeout: z.number().default(30000), // 30 seconds
  enableMemory: z.boolean().default(true),
});

export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

export type AgentType =
  | "wallet"
  | "defi"
  | "nft"
  | "dao"
  | "social"
  | "bridge"
  | "audit"
  | "custom";

export interface RegisteredAgent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  agent: BaseAgent;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  action: string;
  params: Record<string, unknown>;
  dependsOn?: string[];
  condition?: (context: WorkflowContext) => boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  onError?: "stop" | "continue" | "retry";
  maxRetries?: number;
}

export interface WorkflowContext {
  workflowId: string;
  startTime: Date;
  results: Map<string, StepResult>;
  memory: Map<string, unknown>;
  errors: WorkflowError[];
}

export interface StepResult {
  stepId: string;
  agentId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface WorkflowError {
  stepId: string;
  error: string;
  timestamp: Date;
  recovered: boolean;
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  duration: number;
  steps: StepResult[];
  errors: WorkflowError[];
  output?: unknown;
}

export interface Intent {
  action: string;
  entities: Record<string, string>;
  confidence: number;
  rawInput: string;
}

export interface RoutingDecision {
  agentId: string;
  action: string;
  params: Record<string, unknown>;
  confidence: number;
  reasoning: string;
}

export interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: Date;
  ttl?: number;
  tags: string[];
}
