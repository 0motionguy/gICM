/**
 * OPUS 67 Async Agent Runner
 * Non-blocking background agent execution with streaming results
 * Integrates with Claude Code Dec 2025 async subagents feature
 */

import { EventEmitter } from "eventemitter3";

// =============================================================================
// TYPES
// =============================================================================

export type AgentJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentConfig {
  agentId: string;
  task: string;
  model?: "sonnet" | "opus" | "haiku";
  timeout?: number;
  priority?: number;
  tools?: string[];
  systemPrompt?: string;
}

export interface AgentJob {
  id: string;
  config: AgentConfig;
  status: AgentJobStatus;
  startTime?: number;
  endTime?: number;
  output: string[];
  error?: string;
  progress: number;
  tokensUsed: number;
}

export interface AgentMessage {
  type: "text" | "tool_use" | "tool_result" | "error" | "done";
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface AsyncRunnerEvents {
  "job:queued": (job: AgentJob) => void;
  "job:started": (jobId: string) => void;
  "job:progress": (jobId: string, progress: number) => void;
  "job:message": (jobId: string, message: AgentMessage) => void;
  "job:completed": (jobId: string, output: string) => void;
  "job:failed": (jobId: string, error: string) => void;
  "job:cancelled": (jobId: string) => void;
}

// =============================================================================
// ASYNC AGENT RUNNER
// =============================================================================

export class AsyncAgentRunner extends EventEmitter<AsyncRunnerEvents> {
  private running: Map<string, AgentJob> = new Map();
  private completed: Map<string, AgentJob> = new Map();
  private messageBuffers: Map<string, AgentMessage[]> = new Map();
  private jobCounter = 0;
  private maxConcurrent: number;
  private activeCount = 0;

  constructor(options?: { maxConcurrent?: number }) {
    super();
    this.maxConcurrent = options?.maxConcurrent ?? 10;
  }

  /**
   * Spawn an agent in background (non-blocking)
   * Returns immediately with a job ID
   */
  spawnBackground(config: AgentConfig): string {
    const jobId = this.generateJobId();

    const job: AgentJob = {
      id: jobId,
      config,
      status: "queued",
      output: [],
      progress: 0,
      tokensUsed: 0,
    };

    this.running.set(jobId, job);
    this.messageBuffers.set(jobId, []);
    this.emit("job:queued", job);

    // Start execution in background
    this.executeJob(jobId).catch((error) => {
      this.failJob(
        jobId,
        error instanceof Error ? error.message : String(error),
      );
    });

    return jobId;
  }

  /**
   * Execute a job (internal, runs in background)
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.running.get(jobId);
    if (!job) return;

    // Wait if at capacity
    while (this.activeCount >= this.maxConcurrent) {
      await this.sleep(100);
    }

    this.activeCount++;
    job.status = "running";
    job.startTime = Date.now();
    this.emit("job:started", jobId);

    try {
      // Simulate agent execution with progress updates
      // In production, this would interface with Claude Code's Task tool
      const result = await this.simulateAgentExecution(job);

      job.status = "completed";
      job.endTime = Date.now();
      job.output.push(result);
      job.progress = 100;

      this.completed.set(jobId, job);
      this.running.delete(jobId);
      this.emit("job:completed", jobId, result);
    } catch (error) {
      this.failJob(
        jobId,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      this.activeCount--;
    }
  }

  /**
   * Simulate agent execution (placeholder for real integration)
   */
  private async simulateAgentExecution(job: AgentJob): Promise<string> {
    const steps = 5;
    const timeout = job.config.timeout || 30000;
    const stepTime = Math.min(timeout / steps, 2000);

    for (let i = 1; i <= steps; i++) {
      await this.sleep(stepTime);

      // Check if cancelled
      if (job.status === "cancelled") {
        throw new Error("Job cancelled");
      }

      // Emit progress
      const progress = (i / steps) * 100;
      job.progress = progress;
      this.emit("job:progress", job.id, progress);

      // Emit message
      const message: AgentMessage = {
        type: "text",
        content: `[${job.config.agentId}] Step ${i}/${steps} complete`,
        timestamp: Date.now(),
      };
      this.addMessage(job.id, message);
    }

    // Final output
    return `Agent ${job.config.agentId} completed task: ${job.config.task.substring(0, 100)}`;
  }

  /**
   * Add message to job's buffer
   */
  private addMessage(jobId: string, message: AgentMessage): void {
    const buffer = this.messageBuffers.get(jobId) || [];
    buffer.push(message);
    this.messageBuffers.set(jobId, buffer);
    this.emit("job:message", jobId, message);
  }

  /**
   * Fail a job
   */
  private failJob(jobId: string, error: string): void {
    const job = this.running.get(jobId);
    if (job) {
      job.status = "failed";
      job.endTime = Date.now();
      job.error = error;
      this.completed.set(jobId, job);
      this.running.delete(jobId);
      this.emit("job:failed", jobId, error);
    }
  }

  /**
   * Check agent status
   */
  getStatus(jobId: string): AgentJobStatus | null {
    const running = this.running.get(jobId);
    if (running) return running.status;

    const completed = this.completed.get(jobId);
    if (completed) return completed.status;

    return null;
  }

  /**
   * Get full job details
   */
  getJob(jobId: string): AgentJob | null {
    return this.running.get(jobId) || this.completed.get(jobId) || null;
  }

  /**
   * Stream results as they arrive
   */
  async *streamResults(jobId: string): AsyncGenerator<AgentMessage> {
    let lastIndex = 0;
    const checkInterval = 100;

    while (true) {
      const job = this.running.get(jobId) || this.completed.get(jobId);
      if (!job) break;

      const buffer = this.messageBuffers.get(jobId) || [];

      // Yield new messages
      while (lastIndex < buffer.length) {
        yield buffer[lastIndex];
        lastIndex++;
      }

      // If job is done, exit
      if (
        job.status === "completed" ||
        job.status === "failed" ||
        job.status === "cancelled"
      ) {
        // Yield final message
        yield {
          type: "done",
          content: job.output.join("\n"),
          timestamp: Date.now(),
          metadata: {
            status: job.status,
            duration:
              (job.endTime || Date.now()) - (job.startTime || Date.now()),
            tokensUsed: job.tokensUsed,
          },
        };
        break;
      }

      await this.sleep(checkInterval);
    }
  }

  /**
   * Cancel a running agent
   */
  async cancel(jobId: string): Promise<boolean> {
    const job = this.running.get(jobId);
    if (!job || job.status !== "running") {
      return false;
    }

    job.status = "cancelled";
    job.endTime = Date.now();
    this.completed.set(jobId, job);
    this.running.delete(jobId);
    this.emit("job:cancelled", jobId);
    return true;
  }

  /**
   * Wait for job completion
   */
  async waitFor(jobId: string, timeout?: number): Promise<AgentJob | null> {
    const startTime = Date.now();
    const maxWait = timeout || 60000;

    while (Date.now() - startTime < maxWait) {
      const job = this.completed.get(jobId);
      if (job) return job;

      const running = this.running.get(jobId);
      if (!running) return null;

      await this.sleep(100);
    }

    return null;
  }

  /**
   * Get all running jobs
   */
  getRunningJobs(): AgentJob[] {
    return Array.from(this.running.values());
  }

  /**
   * Get all completed jobs
   */
  getCompletedJobs(): AgentJob[] {
    return Array.from(this.completed.values());
  }

  /**
   * Get statistics
   */
  getStats(): {
    running: number;
    completed: number;
    failed: number;
    avgDuration: number;
  } {
    const completedJobs = this.getCompletedJobs();
    const failed = completedJobs.filter((j) => j.status === "failed").length;

    const durations = completedJobs
      .filter((j) => j.startTime && j.endTime)
      .map((j) => j.endTime! - j.startTime!);

    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      running: this.running.size,
      completed: completedJobs.length,
      failed,
      avgDuration,
    };
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    this.completed.clear();
    // Also clear associated message buffers
    for (const jobId of this.messageBuffers.keys()) {
      if (!this.running.has(jobId)) {
        this.messageBuffers.delete(jobId);
      }
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    this.jobCounter++;
    return `job_${Date.now()}_${this.jobCounter.toString().padStart(4, "0")}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Format runner status
   */
  formatStatus(): string {
    const stats = this.getStats();
    return `
┌─ ASYNC AGENT RUNNER ────────────────────────────────────────────┐
│                                                                  │
│  JOBS                                                            │
│  ────────────────────────────────────────────────────────────    │
│  Running: ${String(stats.running).padEnd(5)} Completed: ${String(stats.completed).padEnd(5)} Failed: ${String(stats.failed).padEnd(5)} │
│                                                                  │
│  PERFORMANCE                                                     │
│  ────────────────────────────────────────────────────────────    │
│  Avg Duration: ${stats.avgDuration.toFixed(0)}ms                                      │
│  Max Concurrent: ${this.maxConcurrent}                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const asyncAgentRunner = new AsyncAgentRunner({ maxConcurrent: 10 });

export function createAsyncRunner(options?: {
  maxConcurrent?: number;
}): AsyncAgentRunner {
  return new AsyncAgentRunner(options);
}
