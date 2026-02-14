/**
 * @gicm/orchestrator - Agent Pool
 * Manages a pool of agents with load balancing, acquisition, and stats tracking
 */

import { EventEmitter } from "node:events";
import type {
  AgentDefinition,
  AgentInstance,
  AgentStatus,
  TaskDefinition,
  OrchestratorConfig,
} from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

interface AgentMatch {
  agent: AgentInstance;
  score: number;
  reasons: string[];
}

interface PoolStats {
  total: number;
  available: number;
  busy: number;
  byRole: Record<string, number>;
  topPerformers: Array<{
    id: string;
    successRate: number;
    totalTasks: number;
  }>;
}

// =============================================================================
// AGENT POOL
// =============================================================================

export class AgentPool extends EventEmitter {
  private agents: Map<string, AgentInstance> = new Map();
  private loadBalancing: OrchestratorConfig["loadBalancing"];
  private maxConcurrent: number;
  private roundRobinIndex = 0;

  constructor(
    config?: Partial<
      Pick<OrchestratorConfig, "loadBalancing" | "maxConcurrent">
    >
  ) {
    super();
    this.loadBalancing = config?.loadBalancing ?? "best-match";
    this.maxConcurrent = config?.maxConcurrent ?? 5;
  }

  /**
   * Register an agent definition in the pool.
   * Creates an AgentInstance from the definition with idle status.
   */
  registerAgent(definition: AgentDefinition): AgentInstance {
    const instance: AgentInstance = {
      ...definition,
      status: "idle" as AgentStatus,
      stats: {
        totalTasks: 0,
        successRate: 1,
        avgDuration: 0,
        lastActive: undefined,
      },
    };

    this.agents.set(definition.id, instance);
    this.emit("agent:registered", definition);
    return instance;
  }

  /**
   * Acquire the best available agent for a task, using the configured
   * load balancing strategy.
   * Returns the agent instance or null if none available.
   */
  acquireAgent(
    requirements?: Partial<
      Pick<TaskDefinition, "requiredCapabilities" | "description">
    >
  ): AgentInstance | null {
    const available = this.getAvailableAgents();
    if (available.length === 0) return null;

    // Check max concurrent
    const busyCount = this.getAllAgents().filter(
      (a) => a.status === "busy"
    ).length;
    if (busyCount >= this.maxConcurrent) return null;

    let selected: AgentInstance;

    switch (this.loadBalancing) {
      case "round-robin": {
        this.roundRobinIndex = this.roundRobinIndex % available.length;
        selected = available[this.roundRobinIndex];
        this.roundRobinIndex++;
        break;
      }

      case "least-loaded": {
        // Sort by total tasks (ascending) -- least used first
        const sorted = [...available].sort(
          (a, b) => a.stats.totalTasks - b.stats.totalTasks
        );
        selected = sorted[0];
        break;
      }

      case "best-match":
      default: {
        if (requirements) {
          const matches = this.findMatches(available, requirements);
          if (matches.length > 0) {
            selected = matches[0].agent;
          } else {
            selected = available[0];
          }
        } else {
          selected = available[0];
        }
        break;
      }
    }

    // Mark as busy
    selected.status = "busy";
    this.emit("agent:acquired", selected.id, "");
    return selected;
  }

  /**
   * Release an agent back to the pool after task completion.
   * Updates stats based on the task result.
   */
  releaseAgent(
    agentId: string,
    result?: { success: boolean; duration: number }
  ): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    if (result) {
      const prevTotal = agent.stats.totalTasks;
      agent.stats.totalTasks++;
      // Recalculate running average success rate
      agent.stats.successRate =
        (agent.stats.successRate * prevTotal + (result.success ? 1 : 0)) /
        agent.stats.totalTasks;
      // Recalculate running average duration
      agent.stats.avgDuration =
        (agent.stats.avgDuration * prevTotal + result.duration) /
        agent.stats.totalTasks;
      agent.stats.lastActive = new Date();
    }

    agent.status = "idle";
    agent.currentTask = undefined;
    this.emit("agent:released", agentId);
  }

  /**
   * Get an agent by ID.
   */
  getAgent(id: string): AgentInstance | null {
    return this.agents.get(id) ?? null;
  }

  /**
   * Get all agents in the pool.
   */
  getAllAgents(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents with idle status.
   */
  getAvailableAgents(): AgentInstance[] {
    return this.getAllAgents().filter((a) => a.status === "idle");
  }

  /**
   * Calculate a match score between an agent and a task's requirements.
   */
  matchScore(agent: AgentInstance, task: TaskDefinition): number {
    let score = 0;
    const descLower = (task.description ?? "").toLowerCase();

    // Capability match
    if (task.requiredCapabilities) {
      for (const cap of task.requiredCapabilities) {
        if (
          agent.capabilities.some((c) => c.toLowerCase() === cap.toLowerCase())
        ) {
          score += 3;
        }
      }
    }

    // Keyword match against task description
    for (const keyword of agent.keywords) {
      if (descLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // Trigger match
    for (const trigger of agent.triggers) {
      if (descLower.includes(trigger.toLowerCase())) {
        score += 1;
      }
    }

    // Role-based boost
    if (agent.role === "specialist") score += 1;

    // Performance boost
    score *= 0.5 + agent.stats.successRate * 0.5;

    return score;
  }

  /**
   * Get pool-level statistics.
   */
  getStats(): PoolStats {
    const all = this.getAllAgents();
    const byRole: Record<string, number> = {};

    for (const agent of all) {
      byRole[agent.role] = (byRole[agent.role] ?? 0) + 1;
    }

    const topPerformers = [...all]
      .filter((a) => a.stats.totalTasks > 0)
      .sort((a, b) => b.stats.successRate - a.stats.successRate)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        successRate: a.stats.successRate,
        totalTasks: a.stats.totalTasks,
      }));

    return {
      total: all.length,
      available: all.filter((a) => a.status === "idle").length,
      busy: all.filter((a) => a.status === "busy").length,
      byRole,
      topPerformers,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private findMatches(
    agents: AgentInstance[],
    requirements: Partial<
      Pick<TaskDefinition, "requiredCapabilities" | "description">
    >
  ): AgentMatch[] {
    const task: TaskDefinition = {
      id: "",
      description: requirements.description ?? "",
      priority: "medium",
      requiredCapabilities: requirements.requiredCapabilities,
    };

    const matches: AgentMatch[] = [];

    for (const agent of agents) {
      const score = this.matchScore(agent, task);
      if (score > 0) {
        matches.push({ agent, score, reasons: [] });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }
}
