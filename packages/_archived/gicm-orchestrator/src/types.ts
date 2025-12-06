import { z } from "zod";

// Autonomy levels
export const AutonomyLevelSchema = z.enum([
  "manual",      // Level 0: Human does everything
  "assisted",    // Level 1: Agent suggests, human executes
  "supervised",  // Level 2: Agent proposes, human approves (DEFAULT)
  "delegated",   // Level 3: Agent executes, human can veto
  "autonomous",  // Level 4: Fully autonomous
]);
export type AutonomyLevel = z.infer<typeof AutonomyLevelSchema>;

// Orchestrator configuration
export interface OrchestratorConfig {
  autonomyLevel: AutonomyLevel;

  // Agent configs
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

  // Activity logging
  activityLogger?: {
    solanaRpcUrl?: string;
    solanaPrivateKey?: string;
    enableArweave?: boolean;
  };

  // Scheduling
  schedules?: {
    github?: string;
    hackernews?: string;
    twitter?: string;
    refactor?: string;
  };
}

// Orchestrator state
export type OrchestratorState =
  | "idle"
  | "starting"
  | "running"
  | "paused"
  | "stopping"
  | "stopped"
  | "error";

// Event types
export type OrchestratorEvent =
  | "started"
  | "stopped"
  | "paused"
  | "resumed"
  | "hunt:started"
  | "hunt:completed"
  | "discovery:found"
  | "decision:made"
  | "approval:required"
  | "approval:granted"
  | "approval:rejected"
  | "build:started"
  | "build:completed"
  | "deploy:started"
  | "deploy:completed"
  | "error";

// Pending approval
export interface PendingApproval {
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
