/**
 * OPUS 67 Subagent Orchestrator
 * Auto-spawns subagents based on task analysis and mode detection
 * Integrates with Claude Code async subagents (Dec 2025)
 */

import { EventEmitter } from "eventemitter3";
import type { AgentInstance, TaskDefinition } from "../council/types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface AgentPlan {
  taskId: string;
  complexity: "simple" | "moderate" | "complex";
  suggestedAgents: AgentSuggestion[];
  executionStrategy: "sequential" | "parallel" | "hybrid";
  estimatedDuration: number;
  reasoning: string;
}

export interface AgentSuggestion {
  agentId: string;
  role: string;
  priority: number;
  subtask: string;
  dependencies: string[];
  estimatedTokens: number;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools?: string[];
  model?: string;
}

export interface AggregatedResult {
  taskId: string;
  success: boolean;
  results: AgentResult[];
  mergedOutput: string;
  totalDuration: number;
  tokensUsed: number;
}

export interface AgentResult {
  agentId: string;
  output: string;
  success: boolean;
  duration: number;
  tokens: number;
}

interface OrchestratorEvents {
  "task:analyzed": (plan: AgentPlan) => void;
  "agents:spawning": (agents: string[]) => void;
  "agent:started": (agentId: string) => void;
  "agent:completed": (agentId: string, result: AgentResult) => void;
  "orchestration:complete": (result: AggregatedResult) => void;
  error: (error: Error) => void;
}

// =============================================================================
// TASK COMPLEXITY PATTERNS
// =============================================================================

const COMPLEXITY_PATTERNS = {
  simple: [
    /how (do|to|can) (i|you)/i,
    /what is/i,
    /explain/i,
    /show me/i,
    /fix (this|the) (typo|bug)/i,
  ],
  moderate: [
    /create (a|the)/i,
    /implement/i,
    /add (a|the) (feature|function)/i,
    /refactor/i,
    /optimize/i,
    /update/i,
  ],
  complex: [
    /full[- ]stack/i,
    /architect/i,
    /system design/i,
    /multi[- ]?(step|phase|stage)/i,
    /build (a complete|an entire|the whole)/i,
    /migrate/i,
    /integrate.*with/i,
    /parallel/i,
    /swarm/i,
  ],
};

// =============================================================================
// AGENT ROLE PATTERNS
// =============================================================================

const AGENT_ROLE_PATTERNS: Record<string, RegExp[]> = {
  "backend-api-specialist": [
    /api/i,
    /backend/i,
    /server/i,
    /endpoint/i,
    /rest/i,
    /graphql/i,
  ],
  "database-schema-oracle": [
    /database/i,
    /schema/i,
    /sql/i,
    /postgres/i,
    /mongodb/i,
    /query/i,
  ],
  "security-engineer": [
    /auth/i,
    /security/i,
    /oauth/i,
    /jwt/i,
    /encrypt/i,
    /permission/i,
  ],
  "frontend-fusion-engine": [
    /react/i,
    /frontend/i,
    /ui/i,
    /component/i,
    /nextjs/i,
    /vue/i,
  ],
  "test-automation-engineer": [
    /test/i,
    /jest/i,
    /vitest/i,
    /e2e/i,
    /coverage/i,
    /spec/i,
  ],
  "smart-contract-auditor": [
    /solidity/i,
    /smart contract/i,
    /evm/i,
    /audit/i,
    /vulnerab/i,
  ],
  "solana-guardian-auditor": [
    /solana/i,
    /anchor/i,
    /rust/i,
    /program/i,
    /pda/i,
  ],
  "typescript-precision-engineer": [
    /typescript/i,
    /type/i,
    /generic/i,
    /interface/i,
    /strict/i,
  ],
  "deployment-strategist": [
    /deploy/i,
    /vercel/i,
    /docker/i,
    /ci\/cd/i,
    /pipeline/i,
  ],
  "performance-profiler": [
    /performance/i,
    /optimize/i,
    /lighthouse/i,
    /bundle/i,
    /speed/i,
  ],
};

// =============================================================================
// SUBAGENT ORCHESTRATOR
// =============================================================================

export class SubagentOrchestrator extends EventEmitter<OrchestratorEvents> {
  private activeJobs: Map<string, AgentResult[]> = new Map();
  private agentDefinitions: Map<string, AgentDefinition> = new Map();
  private taskCounter = 0;

  constructor() {
    super();
  }

  /**
   * Analyze a task to determine complexity and suggested agents
   */
  async analyzeTask(prompt: string, mode?: string): Promise<AgentPlan> {
    const taskId = this.generateTaskId();
    const complexity = this.detectComplexity(prompt);
    const suggestedAgents = this.matchAgents(prompt, complexity, mode);
    const executionStrategy = this.determineStrategy(
      complexity,
      suggestedAgents.length,
    );

    const plan: AgentPlan = {
      taskId,
      complexity,
      suggestedAgents,
      executionStrategy,
      estimatedDuration: this.estimateDuration(suggestedAgents),
      reasoning: this.generateReasoning(prompt, complexity, suggestedAgents),
    };

    this.emit("task:analyzed", plan);
    return plan;
  }

  /**
   * Detect task complexity from prompt
   */
  private detectComplexity(prompt: string): "simple" | "moderate" | "complex" {
    // Check complex patterns first
    for (const pattern of COMPLEXITY_PATTERNS.complex) {
      if (pattern.test(prompt)) return "complex";
    }

    // Check moderate patterns
    for (const pattern of COMPLEXITY_PATTERNS.moderate) {
      if (pattern.test(prompt)) return "moderate";
    }

    // Default to simple
    return "simple";
  }

  /**
   * Match agents based on task content
   */
  private matchAgents(
    prompt: string,
    complexity: "simple" | "moderate" | "complex",
    mode?: string,
  ): AgentSuggestion[] {
    const matches: AgentSuggestion[] = [];
    const promptLower = prompt.toLowerCase();

    // Score each agent role
    for (const [agentId, patterns] of Object.entries(AGENT_ROLE_PATTERNS)) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const pattern of patterns) {
        const match = promptLower.match(pattern);
        if (match) {
          score += 1;
          matchedKeywords.push(match[0]);
        }
      }

      if (score > 0) {
        matches.push({
          agentId,
          role: agentId
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          priority: score,
          subtask: `Handle ${matchedKeywords.join(", ")} aspects`,
          dependencies: [],
          estimatedTokens: this.estimateTokens(complexity),
        });
      }
    }

    // Sort by priority and limit based on complexity
    const sorted = matches.sort((a, b) => b.priority - a.priority);
    const limit =
      complexity === "complex" ? 5 : complexity === "moderate" ? 3 : 1;

    return sorted.slice(0, limit);
  }

  /**
   * Determine execution strategy
   */
  private determineStrategy(
    complexity: "simple" | "moderate" | "complex",
    agentCount: number,
  ): "sequential" | "parallel" | "hybrid" {
    if (complexity === "simple" || agentCount <= 1) return "sequential";
    if (complexity === "complex" && agentCount >= 3) return "parallel";
    return "hybrid";
  }

  /**
   * Estimate tokens for complexity level
   */
  private estimateTokens(
    complexity: "simple" | "moderate" | "complex",
  ): number {
    const estimates = {
      simple: 2000,
      moderate: 5000,
      complex: 10000,
    };
    return estimates[complexity];
  }

  /**
   * Estimate total duration
   */
  private estimateDuration(agents: AgentSuggestion[]): number {
    // Base estimate: 2s per agent for parallel, 5s per agent for sequential
    const basePerAgent = 3000;
    return agents.length * basePerAgent;
  }

  /**
   * Generate reasoning for the plan
   */
  private generateReasoning(
    prompt: string,
    complexity: "simple" | "moderate" | "complex",
    agents: AgentSuggestion[],
  ): string {
    if (agents.length === 0) {
      return "No specialized agents needed - general assistance sufficient.";
    }

    const agentNames = agents.map((a) => a.agentId).join(", ");
    return (
      `Detected ${complexity} task. Spawning ${agents.length} agent(s): ${agentNames}. ` +
      `Estimated ${this.estimateDuration(agents)}ms total execution time.`
    );
  }

  /**
   * Generate agent definitions for SDK format
   */
  generateAgentDefinitions(plan: AgentPlan): Record<string, AgentDefinition> {
    const definitions: Record<string, AgentDefinition> = {};

    for (const suggestion of plan.suggestedAgents) {
      definitions[suggestion.agentId] = {
        id: suggestion.agentId,
        name: suggestion.role,
        description: `OPUS 67 ${suggestion.role} - ${suggestion.subtask}`,
        systemPrompt: this.generateSystemPrompt(suggestion),
        tools: this.getAgentTools(suggestion.agentId),
        model: "sonnet", // Default to sonnet for subagents
      };
    }

    return definitions;
  }

  /**
   * Generate system prompt for agent
   */
  private generateSystemPrompt(suggestion: AgentSuggestion): string {
    return `You are an OPUS 67 ${suggestion.role} specialist.
Your task: ${suggestion.subtask}

Guidelines:
- Focus exclusively on your domain expertise
- Provide concrete, actionable output
- Be concise but thorough
- Return structured results that can be easily aggregated`;
  }

  /**
   * Get tools available to an agent based on its role
   */
  private getAgentTools(agentId: string): string[] {
    const toolMap: Record<string, string[]> = {
      "backend-api-specialist": ["Read", "Write", "Edit", "Bash", "Grep"],
      "database-schema-oracle": ["Read", "Write", "Edit", "Bash"],
      "security-engineer": ["Read", "Grep", "Bash"],
      "frontend-fusion-engine": ["Read", "Write", "Edit", "Glob"],
      "test-automation-engineer": ["Read", "Write", "Edit", "Bash"],
      "typescript-precision-engineer": ["Read", "Write", "Edit", "Grep"],
    };

    return toolMap[agentId] || ["Read", "Write", "Edit"];
  }

  /**
   * Spawn multiple agents in parallel (async, non-blocking)
   */
  async spawnParallel(
    agents: string[],
    task: string,
    executor: (agentId: string, task: string) => Promise<AgentResult>,
  ): Promise<void> {
    const taskId = this.generateTaskId();
    this.activeJobs.set(taskId, []);
    this.emit("agents:spawning", agents);

    // Spawn all agents without waiting
    const promises = agents.map(async (agentId) => {
      this.emit("agent:started", agentId);

      try {
        const result = await executor(agentId, task);
        const results = this.activeJobs.get(taskId) || [];
        results.push(result);
        this.activeJobs.set(taskId, results);
        this.emit("agent:completed", agentId, result);
        return result;
      } catch (error) {
        const failedResult: AgentResult = {
          agentId,
          output: "",
          success: false,
          duration: 0,
          tokens: 0,
        };
        this.emit("agent:completed", agentId, failedResult);
        return failedResult;
      }
    });

    // Don't await - return immediately for async execution
    Promise.all(promises).then((results) => {
      const aggregated = this.aggregateResults(taskId, results);
      this.emit("orchestration:complete", aggregated);
    });
  }

  /**
   * Collect and aggregate results from multiple agents
   */
  async collectResults(taskId: string): Promise<AggregatedResult> {
    const results = this.activeJobs.get(taskId) || [];
    return this.aggregateResults(taskId, results);
  }

  /**
   * Aggregate results from multiple agents
   */
  private aggregateResults(
    taskId: string,
    results: AgentResult[],
  ): AggregatedResult {
    const successful = results.filter((r) => r.success);
    const mergedOutput = successful
      .map((r) => `## ${r.agentId}\n${r.output}`)
      .join("\n\n---\n\n");

    return {
      taskId,
      success: successful.length > 0,
      results,
      mergedOutput,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      tokensUsed: results.reduce((sum, r) => sum + r.tokens, 0),
    };
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    this.taskCounter++;
    return `task_${Date.now()}_${this.taskCounter.toString().padStart(4, "0")}`;
  }

  /**
   * Get active job count
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Format orchestrator status
   */
  formatStatus(): string {
    return `
┌─ SUBAGENT ORCHESTRATOR ─────────────────────────────────────────┐
│                                                                  │
│  Active Jobs: ${String(this.activeJobs.size).padEnd(5)}                                       │
│  Registered Agents: ${String(this.agentDefinitions.size).padEnd(5)}                               │
│  Tasks Processed: ${String(this.taskCounter).padEnd(5)}                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const subagentOrchestrator = new SubagentOrchestrator();

export function createOrchestrator(): SubagentOrchestrator {
  return new SubagentOrchestrator();
}
