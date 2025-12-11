/**
 * OPUS 67 Subagent Auto-Trigger Hook
 * Automatically spawns relevant subagents based on task/mode detection
 * Integrates with Claude Code Dec 2025 async subagents
 */

import {
  subagentOrchestrator,
  type AgentPlan,
  type AgentSuggestion,
} from "../agents/subagent-orchestrator.js";
import { asyncAgentRunner } from "../agents/async-runner.js";
import { agentJobQueue, type JobPriority } from "../agents/job-queue.js";
import {
  MODE_AGENT_MAP,
  type Mode,
  type AgentTriggerConfig,
} from "../modes/agent-mapping.js";

// =============================================================================
// TYPES
// =============================================================================

export interface AutoTriggerConfig {
  mode: Mode;
  skillMatches: string[];
  taskType: string;
  suggestedAgents: AgentSuggestion[];
  shouldSpawn: boolean;
  reason: string;
}

export interface TriggerResult {
  triggered: boolean;
  jobIds: string[];
  plan: AgentPlan | null;
  reason: string;
}

export interface HookContext {
  prompt: string;
  mode: Mode;
  files?: string[];
  previousMessages?: number;
  sessionId?: string;
}

// =============================================================================
// TRIGGER CONDITIONS
// =============================================================================

const TRIGGER_THRESHOLDS = {
  minMatchScore: 0.5, // Minimum skill match score to trigger
  minComplexity: "moderate", // Minimum complexity for auto-spawning
  maxConcurrentAgents: 5, // Max agents to spawn at once
  cooldownMs: 30000, // Cooldown between auto-triggers
};

// Track last trigger times to prevent spam
const lastTriggerTimes: Map<string, number> = new Map();

// =============================================================================
// MAIN TRIGGER FUNCTION
// =============================================================================

/**
 * Evaluate if subagents should be auto-triggered
 */
export async function evaluateTrigger(
  context: HookContext,
): Promise<AutoTriggerConfig> {
  const { prompt, mode, files } = context;

  // Get mode configuration
  const modeConfig = MODE_AGENT_MAP[mode];
  if (!modeConfig || !modeConfig.autoSpawn) {
    return {
      mode,
      skillMatches: [],
      taskType: "general",
      suggestedAgents: [],
      shouldSpawn: false,
      reason: "Mode does not support auto-spawning",
    };
  }

  // Analyze the task
  const plan = await subagentOrchestrator.analyzeTask(prompt, mode);

  // Check complexity threshold
  if (
    plan.complexity === "simple" &&
    TRIGGER_THRESHOLDS.minComplexity !== "simple"
  ) {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: plan.suggestedAgents,
      shouldSpawn: false,
      reason: "Task complexity below threshold",
    };
  }

  // Check if we have any matching agents
  if (plan.suggestedAgents.length === 0) {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: [],
      shouldSpawn: false,
      reason: "No matching agents found",
    };
  }

  // Check cooldown
  const lastTrigger = lastTriggerTimes.get(mode) || 0;
  if (Date.now() - lastTrigger < TRIGGER_THRESHOLDS.cooldownMs) {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: plan.suggestedAgents,
      shouldSpawn: false,
      reason: "Cooldown active",
    };
  }

  // Apply mode-specific limits
  const limitedAgents = plan.suggestedAgents.slice(
    0,
    modeConfig.maxParallel || TRIGGER_THRESHOLDS.maxConcurrentAgents,
  );

  // Include required agents if specified
  if (modeConfig.requiredAgents) {
    for (const agentId of modeConfig.requiredAgents) {
      if (!limitedAgents.find((a) => a.agentId === agentId)) {
        limitedAgents.push({
          agentId,
          role: agentId
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          priority: 100,
          subtask: "Required for mode",
          dependencies: [],
          estimatedTokens: 5000,
        });
      }
    }
  }

  return {
    mode,
    skillMatches: limitedAgents.map((a) => a.agentId),
    taskType: plan.complexity,
    suggestedAgents: limitedAgents,
    shouldSpawn: true,
    reason: plan.reasoning,
  };
}

/**
 * Execute auto-trigger (spawn agents)
 */
export async function executeTrigger(
  config: AutoTriggerConfig,
  prompt: string,
): Promise<TriggerResult> {
  if (!config.shouldSpawn) {
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: config.reason,
    };
  }

  // Update last trigger time
  lastTriggerTimes.set(config.mode, Date.now());

  // Get mode config for execution strategy
  const modeConfig = MODE_AGENT_MAP[config.mode];
  const useAsync = modeConfig?.asyncExecution ?? true;

  const jobIds: string[] = [];

  // Queue or spawn agents
  for (const agent of config.suggestedAgents) {
    const priority: JobPriority =
      agent.priority >= 75 ? "high" : agent.priority >= 50 ? "normal" : "low";

    if (useAsync) {
      // Spawn in background (non-blocking)
      const jobId = asyncAgentRunner.spawnBackground({
        agentId: agent.agentId,
        task: `${agent.subtask}\n\nContext: ${prompt}`,
        model: "sonnet",
        priority: agent.priority,
        timeout: 60000,
      });
      jobIds.push(jobId);
    } else {
      // Queue for sequential execution
      const jobId = agentJobQueue.add(
        {
          agentId: agent.agentId,
          task: `${agent.subtask}\n\nContext: ${prompt}`,
          model: "sonnet",
          priority: agent.priority,
        },
        {
          priority,
          executionMode: "immediate",
        },
      );
      jobIds.push(jobId);
    }
  }

  // Create plan for reference
  const plan = await subagentOrchestrator.analyzeTask(prompt, config.mode);

  return {
    triggered: true,
    jobIds,
    plan,
    reason: `Spawned ${jobIds.length} agents: ${config.skillMatches.join(", ")}`,
  };
}

/**
 * Main hook handler - call this from Claude Code hooks
 */
export async function onTaskDetected(
  context: HookContext,
): Promise<TriggerResult> {
  try {
    const config = await evaluateTrigger(context);
    return executeTrigger(config, context.prompt);
  } catch (error) {
    console.error("[SubagentAutoTrigger] Error:", error);
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Hook for mode switches
 */
export async function onModeSwitch(
  newMode: Mode,
  prompt: string,
  previousMode?: Mode,
): Promise<TriggerResult> {
  // Always evaluate on mode switch
  const context: HookContext = {
    prompt,
    mode: newMode,
  };

  // Some modes always trigger agents
  const alwaysTriggerModes: Mode[] = ["swarm", "audit"];
  if (alwaysTriggerModes.includes(newMode)) {
    const config = await evaluateTrigger(context);
    // Force spawn even if cooldown
    if (config.suggestedAgents.length > 0) {
      config.shouldSpawn = true;
      config.reason = `Mode ${newMode} always triggers agents`;
    }
    return executeTrigger(config, prompt);
  }

  return onTaskDetected(context);
}

/**
 * Hook for high-score skill matches
 */
export async function onHighScoreSkillMatch(
  skillId: string,
  score: number,
  prompt: string,
  mode: Mode,
): Promise<TriggerResult> {
  if (score < TRIGGER_THRESHOLDS.minMatchScore) {
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: `Score ${score} below threshold ${TRIGGER_THRESHOLDS.minMatchScore}`,
    };
  }

  // Map skill to potential agents
  const skillAgentMap: Record<string, string[]> = {
    "solana-anchor-expert": ["solana-guardian-auditor", "icm-anchor-architect"],
    "react-typescript-master": [
      "frontend-fusion-engine",
      "typescript-precision-engineer",
    ],
    "smart-contract-auditor": [
      "evm-security-auditor",
      "smart-contract-forensics",
    ],
    "nextjs-14-expert": ["frontend-fusion-engine", "deployment-strategist"],
    "nodejs-api-architect": [
      "backend-api-specialist",
      "database-schema-oracle",
    ],
  };

  const relatedAgents = skillAgentMap[skillId] || [];

  if (relatedAgents.length === 0) {
    return onTaskDetected({ prompt, mode });
  }

  // Spawn related agents
  const jobIds: string[] = [];
  for (const agentId of relatedAgents) {
    const jobId = asyncAgentRunner.spawnBackground({
      agentId,
      task: prompt,
      model: "sonnet",
      priority: Math.round(score * 100),
    });
    jobIds.push(jobId);
  }

  return {
    triggered: true,
    jobIds,
    plan: await subagentOrchestrator.analyzeTask(prompt, mode),
    reason: `High-score skill match (${score}) triggered ${relatedAgents.length} agents`,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { TRIGGER_THRESHOLDS, lastTriggerTimes };
