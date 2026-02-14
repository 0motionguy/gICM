/**
 * @gicm/orchestrator - Orchestrator
 * Workflow execution engine with dependency resolution, retry, and multi-strategy steps
 */

import { EventEmitter } from "node:events";
import type {
  AgentExecutor,
  AgentInstance,
  TaskDefinition,
  TaskResult,
  Workflow,
  WorkflowStep,
  OrchestratorConfig,
  VotingRound,
  Vote,
} from "./types.js";
import { OrchestratorConfigSchema } from "./types.js";
import { AgentPool } from "./agent-pool.js";
import { TaskDecomposer } from "./task-decomposer.js";
import { Council } from "./council.js";

// =============================================================================
// TYPES
// =============================================================================

interface ExecutionRecord {
  workflowId: string;
  results: TaskResult[];
  context: Record<string, unknown>;
  status: "running" | "completed" | "failed" | "cancelled";
}

// =============================================================================
// ORCHESTRATOR
// =============================================================================

export class Orchestrator extends EventEmitter {
  private pool: AgentPool;
  private decomposer: TaskDecomposer;
  private executor: AgentExecutor;
  private config: OrchestratorConfig;
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, ExecutionRecord> = new Map();
  private executionCounter = 0;

  constructor(
    pool: AgentPool,
    decomposer: TaskDecomposer,
    executor: AgentExecutor,
    config?: Partial<OrchestratorConfig>
  ) {
    super();
    this.pool = pool;
    this.decomposer = decomposer;
    this.executor = executor;

    // Validate and apply config with defaults
    const parsed = OrchestratorConfigSchema.safeParse(config ?? {});
    this.config = parsed.success
      ? parsed.data
      : OrchestratorConfigSchema.parse({});
  }

  // ---------------------------------------------------------------------------
  // Workflow registration
  // ---------------------------------------------------------------------------

  /**
   * Register a workflow template for later execution.
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Get a registered workflow by ID.
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  // ---------------------------------------------------------------------------
  // Workflow execution
  // ---------------------------------------------------------------------------

  /**
   * Execute a registered workflow by ID.
   */
  async executeWorkflow(
    workflowId: string,
    context: Record<string, unknown> = {}
  ): Promise<TaskResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execId = `exec-${++this.executionCounter}`;
    const record: ExecutionRecord = {
      workflowId,
      results: [],
      context: { ...context },
      status: "running",
    };
    this.executions.set(execId, record);
    this.emit("workflow:started", workflowId);

    try {
      // Resolve step execution order from dependencies
      const orderedSteps = this.resolveStepOrder(workflow.steps);

      for (const step of orderedSteps) {
        // Check for cancellation
        if (record.status === "cancelled") break;

        const result = await this.executeStep(
          step,
          record.context,
          record.results
        );
        record.results.push(result);

        if (result.status === "completed") {
          this.emit("task:completed", result);
        } else {
          this.emit("task:failed", result);
        }
      }

      record.status = "completed";
      this.emit("workflow:completed", workflowId, record.results);
      return record.results;
    } catch (err) {
      record.status = "failed";
      throw err;
    } finally {
      this.executions.delete(execId);
    }
  }

  // ---------------------------------------------------------------------------
  // Single task execution (with retry)
  // ---------------------------------------------------------------------------

  /**
   * Execute a single task with retry logic.
   */
  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    let lastResult: TaskResult | undefined;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      const agent = this.pool.acquireAgent({
        requiredCapabilities: task.requiredCapabilities,
        description: task.description,
      });

      if (!agent) {
        // No agent available -- create a failure result
        lastResult = this.failureResult(task, "no-agent", "No agent available");
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs);
          continue;
        }
        break;
      }

      this.emit("task:started", task.id, agent.id);

      try {
        const result = await this.withTimeout(
          this.executor.execute(agent, task),
          this.config.taskTimeoutMs
        );

        this.pool.releaseAgent(agent.id, {
          success: result.status === "completed",
          duration: result.duration,
        });

        if (result.status === "completed") {
          return result;
        }

        lastResult = result;

        // Retry on failure
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs);
        }
      } catch (err) {
        this.pool.releaseAgent(agent.id, {
          success: false,
          duration: 0,
        });

        lastResult = this.failureResult(
          task,
          agent.id,
          err instanceof Error ? err.message : String(err)
        );

        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    return (
      lastResult ??
      this.failureResult(task, "unknown", "All attempts exhausted")
    );
  }

  // ---------------------------------------------------------------------------
  // Dynamic execution (decompose + run)
  // ---------------------------------------------------------------------------

  /**
   * Decompose a task and execute all sub-tasks respecting dependencies
   * and parallel groups.
   */
  async executeDynamic(task: TaskDefinition): Promise<TaskResult[]> {
    const decomposition = this.decomposer.decompose(task);
    this.emit("task:decomposed", task, decomposition.subTasks);

    const results: TaskResult[] = [];

    for (const group of decomposition.parallelGroups) {
      // Execute all tasks in the group in parallel
      const groupResults = await Promise.all(
        group.map((subTask) => this.executeTask(subTask))
      );
      results.push(...groupResults);
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Step execution by strategy
  // ---------------------------------------------------------------------------

  private async executeStep(
    step: WorkflowStep,
    context: Record<string, unknown>,
    previousResults: TaskResult[]
  ): Promise<TaskResult> {
    switch (step.strategy) {
      case "parallel":
        return this.executeParallel(step);

      case "sequential":
        return this.executeSequential(step);

      case "conditional":
        return this.executeConditional(step, context);

      case "vote":
        return this.executeVote(step);

      default:
        return this.failureResult(
          { id: step.id },
          "orchestrator",
          `Unknown strategy: ${step.strategy}`
        );
    }
  }

  /**
   * Parallel: acquire multiple agents and run in parallel via Promise.all.
   */
  private async executeParallel(step: WorkflowStep): Promise<TaskResult> {
    const roles = step.agentRoles ?? ["generalist"];
    const agents: AgentInstance[] = [];

    for (const _role of roles) {
      const agent = this.pool.acquireAgent();
      if (agent) agents.push(agent);
    }

    if (agents.length === 0) {
      return this.failureResult(
        { id: step.id },
        "orchestrator",
        "No agents available for parallel execution"
      );
    }

    const task: TaskDefinition = {
      id: step.id,
      description: step.name,
      priority: "medium",
    };

    const start = Date.now();

    const results = await Promise.all(
      agents.map(async (agent) => {
        try {
          return await this.executor.execute(agent, task);
        } finally {
          this.pool.releaseAgent(agent.id, {
            success: true,
            duration: Date.now() - start,
          });
        }
      })
    );

    // Merge results
    const outputs = results
      .map((r) => r.output)
      .filter(Boolean)
      .join("\n---\n");

    return {
      taskId: step.id,
      agentId: agents.map((a) => a.id).join(","),
      status: results.every((r) => r.status === "completed")
        ? "completed"
        : "failed",
      output: outputs,
      duration: Date.now() - start,
      startedAt: new Date(start),
      completedAt: new Date(),
    };
  }

  /**
   * Sequential: execute the step with a single agent.
   */
  private async executeSequential(step: WorkflowStep): Promise<TaskResult> {
    const task: TaskDefinition = {
      id: step.id,
      description: step.name,
      priority: "medium",
    };
    return this.executeTask(task);
  }

  /**
   * Conditional: check the condition function, skip if false.
   */
  private async executeConditional(
    step: WorkflowStep,
    context: Record<string, unknown>
  ): Promise<TaskResult> {
    const shouldRun = step.condition ? step.condition(context) : true;

    if (!shouldRun) {
      return {
        taskId: step.id,
        agentId: "orchestrator",
        status: "completed",
        output: "Conditional step skipped",
        duration: 0,
        startedAt: new Date(),
        completedAt: new Date(),
      };
    }

    const task: TaskDefinition = {
      id: step.id,
      description: step.name,
      priority: "medium",
    };
    return this.executeTask(task);
  }

  /**
   * Vote: run council deliberation among available agents.
   */
  private async executeVote(step: WorkflowStep): Promise<TaskResult> {
    const council = new Council(this.executor);

    const members = this.pool.getAvailableAgents().slice(0, 3);

    if (members.length < 2) {
      return this.failureResult(
        { id: step.id },
        "orchestrator",
        "Not enough agents for voting (need at least 2)"
      );
    }

    const task: TaskDefinition = {
      id: step.id,
      description: step.name,
      priority: "medium",
    };

    const start = Date.now();
    const result = await council.deliberate(task, members);

    const votingRound: VotingRound = {
      votes: members.map((m) => ({
        agentId: m.id,
        vote: "approve" as const,
        confidence: 0.8,
      })),
      result: "approve",
      consensus:
        result.consensusLevel === "unanimous"
          ? 1
          : result.consensusLevel === "strong"
            ? 0.8
            : 0.5,
    };

    this.emit("consensus:reached", votingRound);

    return {
      taskId: step.id,
      agentId: "council",
      status: "completed",
      output: result.finalAnswer,
      duration: Date.now() - start,
      startedAt: new Date(start),
      completedAt: new Date(),
    };
  }

  // ---------------------------------------------------------------------------
  // Step ordering
  // ---------------------------------------------------------------------------

  /**
   * Resolve execution order from step dependencies using topological sort.
   */
  private resolveStepOrder(steps: WorkflowStep[]): WorkflowStep[] {
    const remaining = new Map(steps.map((s) => [s.id, s]));
    const ordered: WorkflowStep[] = [];
    const completed = new Set<string>();

    while (remaining.size > 0) {
      let progress = false;

      for (const [id, step] of remaining) {
        const deps = step.dependencies ?? [];
        if (deps.every((d) => completed.has(d))) {
          ordered.push(step);
          completed.add(id);
          remaining.delete(id);
          progress = true;
        }
      }

      if (!progress) {
        // Remaining steps have unresolvable deps -- add them anyway
        for (const step of remaining.values()) {
          ordered.push(step);
        }
        break;
      }
    }

    return ordered;
  }

  // ---------------------------------------------------------------------------
  // Stats & cancellation
  // ---------------------------------------------------------------------------

  /**
   * Get orchestrator statistics.
   */
  getStats(): {
    registeredWorkflows: number;
    activeExecutions: number;
    poolStats: ReturnType<AgentPool["getStats"]>;
  } {
    return {
      registeredWorkflows: this.workflows.size,
      activeExecutions: this.executions.size,
      poolStats: this.pool.getStats(),
    };
  }

  /**
   * Cancel a running execution.
   */
  cancel(executionId: string): boolean {
    const record = this.executions.get(executionId);
    if (!record || record.status !== "running") return false;
    record.status = "cancelled";
    return true;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private failureResult(
    task: { id: string },
    agentId: string,
    error: string
  ): TaskResult {
    return {
      taskId: task.id,
      agentId,
      status: "failed",
      error,
      duration: 0,
      startedAt: new Date(),
      completedAt: new Date(),
    };
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error(`Task timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
