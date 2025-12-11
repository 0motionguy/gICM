/**
 * OPUS 67 Agent Job Queue
 * Priority queue for agent tasks with deferred execution support
 */

import { EventEmitter } from "eventemitter3";
import type { AgentConfig, AgentJob } from "./async-runner.js";

// =============================================================================
// TYPES
// =============================================================================

export type JobPriority = "critical" | "high" | "normal" | "low" | "background";

export type ExecutionMode = "immediate" | "background" | "deferred";

export interface QueuedJob {
  id: string;
  config: AgentConfig;
  priority: JobPriority;
  executionMode: ExecutionMode;
  createdAt: number;
  scheduledFor?: number;
  dependencies: string[];
  tags: string[];
}

export interface QueueStats {
  total: number;
  byPriority: Record<JobPriority, number>;
  byMode: Record<ExecutionMode, number>;
  pending: number;
  processing: number;
}

interface JobQueueEvents {
  "job:added": (job: QueuedJob) => void;
  "job:removed": (jobId: string) => void;
  "job:promoted": (jobId: string, newPriority: JobPriority) => void;
  "job:ready": (job: QueuedJob) => void;
  "queue:empty": () => void;
  "queue:full": (limit: number) => void;
}

// =============================================================================
// PRIORITY VALUES
// =============================================================================

const PRIORITY_VALUES: Record<JobPriority, number> = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
  background: 0,
};

// =============================================================================
// JOB QUEUE
// =============================================================================

export class AgentJobQueue extends EventEmitter<JobQueueEvents> {
  private queue: QueuedJob[] = [];
  private processing: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private maxSize: number;
  private jobCounter = 0;

  constructor(options?: { maxSize?: number }) {
    super();
    this.maxSize = options?.maxSize ?? 1000;
  }

  /**
   * Add a job to the queue
   */
  add(
    config: AgentConfig,
    options?: {
      priority?: JobPriority;
      executionMode?: ExecutionMode;
      scheduledFor?: number;
      dependencies?: string[];
      tags?: string[];
    },
  ): string {
    if (this.queue.length >= this.maxSize) {
      this.emit("queue:full", this.maxSize);
      throw new Error(`Queue full (max ${this.maxSize})`);
    }

    const jobId = this.generateJobId();
    const job: QueuedJob = {
      id: jobId,
      config,
      priority: options?.priority ?? "normal",
      executionMode: options?.executionMode ?? "immediate",
      createdAt: Date.now(),
      scheduledFor: options?.scheduledFor,
      dependencies: options?.dependencies ?? [],
      tags: options?.tags ?? [],
    };

    this.queue.push(job);
    this.sortQueue();
    this.emit("job:added", job);

    return jobId;
  }

  /**
   * Add multiple jobs at once
   */
  addBatch(
    jobs: Array<{
      config: AgentConfig;
      priority?: JobPriority;
      executionMode?: ExecutionMode;
    }>,
  ): string[] {
    return jobs.map((j) =>
      this.add(j.config, {
        priority: j.priority,
        executionMode: j.executionMode,
      }),
    );
  }

  /**
   * Get the next job to process (respects priority and dependencies)
   */
  next(): QueuedJob | null {
    const now = Date.now();

    for (let i = 0; i < this.queue.length; i++) {
      const job = this.queue[i];

      // Skip if scheduled for later
      if (job.scheduledFor && job.scheduledFor > now) continue;

      // Skip if dependencies not met
      if (!this.areDependenciesMet(job)) continue;

      // Skip if already processing
      if (this.processing.has(job.id)) continue;

      // Remove from queue and mark as processing
      this.queue.splice(i, 1);
      this.processing.add(job.id);
      this.emit("job:ready", job);

      if (this.queue.length === 0) {
        this.emit("queue:empty");
      }

      return job;
    }

    return null;
  }

  /**
   * Peek at the next job without removing it
   */
  peek(): QueuedJob | null {
    return this.queue[0] || null;
  }

  /**
   * Check if dependencies are met
   */
  private areDependenciesMet(job: QueuedJob): boolean {
    return job.dependencies.every((depId) => this.completed.has(depId));
  }

  /**
   * Mark a job as completed
   */
  complete(jobId: string): void {
    this.processing.delete(jobId);
    this.completed.add(jobId);
  }

  /**
   * Mark a job as failed (re-queue or discard)
   */
  fail(jobId: string, requeue = false): void {
    this.processing.delete(jobId);

    if (requeue) {
      // Find original config and re-add with lower priority
      const job = this.getJob(jobId);
      if (job) {
        this.add(job.config, {
          priority: this.demotePriority(job.priority),
          executionMode: job.executionMode,
        });
      }
    }
  }

  /**
   * Remove a job from the queue
   */
  remove(jobId: string): boolean {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index === -1) return false;

    this.queue.splice(index, 1);
    this.emit("job:removed", jobId);
    return true;
  }

  /**
   * Promote a job's priority
   */
  promote(jobId: string, newPriority: JobPriority): boolean {
    const job = this.queue.find((j) => j.id === jobId);
    if (!job) return false;

    job.priority = newPriority;
    this.sortQueue();
    this.emit("job:promoted", jobId, newPriority);
    return true;
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): QueuedJob | null {
    return this.queue.find((j) => j.id === jobId) || null;
  }

  /**
   * Get jobs by tag
   */
  getByTag(tag: string): QueuedJob[] {
    return this.queue.filter((j) => j.tags.includes(tag));
  }

  /**
   * Get jobs by priority
   */
  getByPriority(priority: JobPriority): QueuedJob[] {
    return this.queue.filter((j) => j.priority === priority);
  }

  /**
   * Get all immediate jobs
   */
  getImmediate(): QueuedJob[] {
    return this.queue.filter((j) => j.executionMode === "immediate");
  }

  /**
   * Get all background jobs
   */
  getBackground(): QueuedJob[] {
    return this.queue.filter((j) => j.executionMode === "background");
  }

  /**
   * Get all deferred jobs
   */
  getDeferred(): QueuedJob[] {
    return this.queue.filter((j) => j.executionMode === "deferred");
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const byPriority: Record<JobPriority, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
      background: 0,
    };

    const byMode: Record<ExecutionMode, number> = {
      immediate: 0,
      background: 0,
      deferred: 0,
    };

    for (const job of this.queue) {
      byPriority[job.priority]++;
      byMode[job.executionMode]++;
    }

    return {
      total: this.queue.length,
      byPriority,
      byMode,
      pending: this.queue.length,
      processing: this.processing.size,
    };
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    this.processing.clear();
    this.emit("queue:empty");
  }

  /**
   * Sort queue by priority and creation time
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Higher priority first
      const priorityDiff =
        PRIORITY_VALUES[b.priority] - PRIORITY_VALUES[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Older jobs first (FIFO within same priority)
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Demote priority by one level
   */
  private demotePriority(priority: JobPriority): JobPriority {
    const order: JobPriority[] = [
      "critical",
      "high",
      "normal",
      "low",
      "background",
    ];
    const index = order.indexOf(priority);
    return order[Math.min(index + 1, order.length - 1)];
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    this.jobCounter++;
    return `qjob_${Date.now()}_${this.jobCounter.toString().padStart(4, "0")}`;
  }

  /**
   * Format queue status
   */
  formatStatus(): string {
    const stats = this.getStats();
    return `
┌─ AGENT JOB QUEUE ───────────────────────────────────────────────┐
│                                                                  │
│  QUEUE STATUS                                                    │
│  ────────────────────────────────────────────────────────────    │
│  Total: ${String(stats.total).padEnd(6)} Processing: ${String(stats.processing).padEnd(6)}                    │
│                                                                  │
│  BY PRIORITY                                                     │
│  ────────────────────────────────────────────────────────────    │
│  Critical: ${String(stats.byPriority.critical).padEnd(4)} High: ${String(stats.byPriority.high).padEnd(4)} Normal: ${String(stats.byPriority.normal).padEnd(4)}          │
│  Low: ${String(stats.byPriority.low).padEnd(4)} Background: ${String(stats.byPriority.background).padEnd(4)}                          │
│                                                                  │
│  BY EXECUTION MODE                                               │
│  ────────────────────────────────────────────────────────────    │
│  Immediate: ${String(stats.byMode.immediate).padEnd(4)} Background: ${String(stats.byMode.background).padEnd(4)} Deferred: ${String(stats.byMode.deferred).padEnd(4)} │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const agentJobQueue = new AgentJobQueue();

export function createJobQueue(options?: { maxSize?: number }): AgentJobQueue {
  return new AgentJobQueue(options);
}
