/**
 * OPUS 67 Agent Spawner
 * Semaphore-based parallel agent orchestration with resource management
 */

import { EventEmitter } from "eventemitter3";
import { metricsCollector } from "./metrics-collector.js";
import { latencyProfiler } from "./latency-profiler.js";
import { tokenTracker, type ModelName } from "./token-tracker.js";

// Types
export interface AgentTask {
  id: string;
  type: string;
  prompt: string;
  model?: ModelName;
  priority?: number;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  tokensUsed?: { input: number; output: number };
}

export interface SpawnOptions {
  maxConcurrent: number;
  timeout?: number;
  retryOnFail?: boolean;
  maxRetries?: number;
  onProgress?: (completed: number, total: number) => void;
}

interface SpawnerEvents {
  "agent:spawned": (agentId: string, task: AgentTask) => void;
  "agent:completed": (result: AgentResult) => void;
  "agent:failed": (agentId: string, error: Error) => void;
  "agent:timeout": (agentId: string) => void;
  "batch:started": (taskCount: number) => void;
  "batch:completed": (results: AgentResult[]) => void;
  "semaphore:acquired": (agentId: string, available: number) => void;
  "semaphore:released": (agentId: string, available: number) => void;
}

/**
 * Semaphore for controlling concurrent access
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    const next = this.waiting.shift();
    if (next) {
      this.permits--;
      next();
    }
  }

  get available(): number {
    return this.permits;
  }

  get waitingCount(): number {
    return this.waiting.length;
  }
}

/**
 * AgentSpawner - Parallel agent orchestration
 */
export class AgentSpawner extends EventEmitter<SpawnerEvents> {
  private semaphore: Semaphore;
  private activeAgents: Map<string, { task: AgentTask; startTime: number }> =
    new Map();
  private completedResults: AgentResult[] = [];
  private agentCounter = 0;
  private defaultTimeout: number;
  private maxRetries: number;

  constructor(
    maxConcurrent = 10,
    options?: { timeout?: number; maxRetries?: number }
  ) {
    super();
    this.semaphore = new Semaphore(maxConcurrent);
    this.defaultTimeout = options?.timeout ?? 60000; // 60s default
    this.maxRetries = options?.maxRetries ?? 2;
  }

  /**
   * Generate unique agent ID
   */
  private generateAgentId(): string {
    this.agentCounter++;
    return `agent_${Date.now()}_${this.agentCounter.toString().padStart(4, "0")}`;
  }

  /**
   * Spawn a single agent
   */
  async spawn(
    task: AgentTask,
    executor: (task: AgentTask) => Promise<string>
  ): Promise<AgentResult> {
    const agentId = this.generateAgentId();
    const spanId = latencyProfiler.startSpan(`agent:${task.type}`);

    // Acquire semaphore
    await this.semaphore.acquire();
    this.emit("semaphore:acquired", agentId, this.semaphore.available);

    // Track agent
    this.activeAgents.set(agentId, { task, startTime: Date.now() });
    metricsCollector.recordAgentSpawn();
    this.emit("agent:spawned", agentId, task);

    const timeout = task.timeout ?? this.defaultTimeout;
    let result: AgentResult;

    try {
      // Execute with timeout
      const output = await Promise.race([
        executor(task),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Agent timeout")), timeout);
        }),
      ]);

      const duration = latencyProfiler.endSpan(spanId);

      result = {
        taskId: task.id,
        agentId,
        success: true,
        output,
        duration,
      };

      metricsCollector.recordAgentComplete(true);
      metricsCollector.recordLatency(duration);
    } catch (error) {
      const duration = latencyProfiler.endSpan(spanId);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage === "Agent timeout") {
        this.emit("agent:timeout", agentId);
      } else {
        this.emit(
          "agent:failed",
          agentId,
          error instanceof Error ? error : new Error(errorMessage)
        );
      }

      result = {
        taskId: task.id,
        agentId,
        success: false,
        error: errorMessage,
        duration,
      };

      metricsCollector.recordAgentComplete(false);
    } finally {
      // Release semaphore
      this.activeAgents.delete(agentId);
      this.semaphore.release();
      this.emit("semaphore:released", agentId, this.semaphore.available);
    }

    this.emit("agent:completed", result);
    this.completedResults.push(result);
    return result;
  }

  /**
   * Spawn multiple agents in parallel
   */
  async spawnBatch(
    tasks: AgentTask[],
    executor: (task: AgentTask) => Promise<string>,
    options?: Partial<SpawnOptions>
  ): Promise<AgentResult[]> {
    const opts: SpawnOptions = {
      maxConcurrent: this.semaphore.available + this.activeAgents.size,
      timeout: this.defaultTimeout,
      retryOnFail: false,
      maxRetries: this.maxRetries,
      ...options,
    };

    // Temporarily adjust semaphore if needed
    const originalSemaphore = this.semaphore;
    if (opts.maxConcurrent !== originalSemaphore.available) {
      this.semaphore = new Semaphore(opts.maxConcurrent);
    }

    this.emit("batch:started", tasks.length);
    const batchStart = Date.now();

    // Sort by priority if specified
    const sortedTasks = [...tasks].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

    let completed = 0;
    const results: AgentResult[] = [];

    // Spawn all agents in parallel (semaphore controls concurrency)
    const promises = sortedTasks.map(async (task) => {
      let attempts = 0;
      let result: AgentResult | null = null;

      while (attempts <= (opts.retryOnFail ? (opts.maxRetries ?? 3) : 0)) {
        attempts++;
        result = await this.spawn(task, executor);

        if (result?.success || !opts.retryOnFail) {
          break;
        }

        metricsCollector.recordRetry();
      }

      completed++;
      opts.onProgress?.(completed, tasks.length);
      return (
        result || {
          taskId: task.id,
          agentId: "unknown",
          success: false,
          error: "No result",
          duration: 0,
        }
      );
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Restore original semaphore
    this.semaphore = originalSemaphore;

    const batchDuration = Date.now() - batchStart;
    latencyProfiler.startSpan("batch:complete");
    latencyProfiler.endSpan(latencyProfiler.startSpan("batch:complete"));

    this.emit("batch:completed", results);

    return results;
  }

  /**
   * Spawn agents with automatic scaling
   */
  async spawnScaled(
    tasks: AgentTask[],
    executor: (task: AgentTask) => Promise<string>,
    targetConcurrency?: number
  ): Promise<AgentResult[]> {
    // Start with low concurrency and scale up
    const levels = targetConcurrency ? [targetConcurrency] : [5, 10, 15, 20];

    let bestConcurrency = levels[0];
    let bestThroughput = 0;

    // Quick calibration with first few tasks
    if (tasks.length >= 10 && !targetConcurrency) {
      const calibrationTasks = tasks.slice(0, 5);

      for (const level of levels.slice(0, 2)) {
        const start = Date.now();
        await this.spawnBatch(calibrationTasks, executor, {
          maxConcurrent: level,
        });
        const duration = Date.now() - start;
        const throughput = calibrationTasks.length / (duration / 1000);

        if (throughput > bestThroughput) {
          bestThroughput = throughput;
          bestConcurrency = level;
        }
      }
    }

    // Run remaining tasks at best concurrency
    return this.spawnBatch(tasks, executor, { maxConcurrent: bestConcurrency });
  }

  /**
   * Get active agent count
   */
  getActiveCount(): number {
    return this.activeAgents.size;
  }

  /**
   * Get semaphore status
   */
  getSemaphoreStatus(): { available: number; waiting: number; active: number } {
    return {
      available: this.semaphore.available,
      waiting: this.semaphore.waitingCount,
      active: this.activeAgents.size,
    };
  }

  /**
   * Get all completed results
   */
  getResults(): AgentResult[] {
    return [...this.completedResults];
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.completedResults.length === 0) return 0;
    const successful = this.completedResults.filter((r) => r.success).length;
    return successful / this.completedResults.length;
  }

  /**
   * Get average duration
   */
  getAverageDuration(): number {
    if (this.completedResults.length === 0) return 0;
    const total = this.completedResults.reduce((sum, r) => sum + r.duration, 0);
    return total / this.completedResults.length;
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.completedResults = [];
  }

  /**
   * Update max concurrent limit
   */
  setMaxConcurrent(max: number): void {
    this.semaphore = new Semaphore(max);
  }

  /**
   * Format spawner status
   */
  formatStatus(): string {
    const status = this.getSemaphoreStatus();
    const successRate = this.getSuccessRate() * 100;
    const avgDuration = this.getAverageDuration();

    return `
┌─ AGENT SPAWNER STATUS ──────────────────────────────────────────┐
│                                                                  │
│  SEMAPHORE                                                       │
│  ────────────────────────────────────────────────────────────    │
│  Available Slots: ${String(status.available).padEnd(5)} Active: ${String(status.active).padEnd(5)} Waiting: ${String(status.waiting).padEnd(5)} │
│                                                                  │
│  PERFORMANCE                                                     │
│  ────────────────────────────────────────────────────────────    │
│  Completed: ${String(this.completedResults.length).padEnd(8)}                                     │
│  Success Rate: ${successRate.toFixed(1)}%                                         │
│  Avg Duration: ${avgDuration.toFixed(0)}ms                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// Export factory function
export function createSpawner(maxConcurrent = 10): AgentSpawner {
  return new AgentSpawner(maxConcurrent);
}

// Export default singleton
export const agentSpawner = new AgentSpawner(20);
