// src/queue/pipeline-queue.ts
import { EventEmitter } from "eventemitter3";
var PRIORITY_WEIGHTS = {
  critical: 1,
  high: 5,
  normal: 10,
  low: 20
};
var PipelineQueue = class extends EventEmitter {
  jobs = /* @__PURE__ */ new Map();
  progress = /* @__PURE__ */ new Map();
  queue = [];
  processing = /* @__PURE__ */ new Set();
  config;
  isRunning = false;
  isPaused = false;
  jobCounter = 0;
  constructor(config = {}) {
    super();
    this.config = {
      redisUrl: config.redisUrl || "",
      queueName: config.queueName || "gicm-pipelines",
      concurrency: config.concurrency || 5,
      defaultTimeout: config.defaultTimeout || 3e5,
      maxRetries: config.maxRetries || 3,
      rateLimit: config.rateLimit || { max: 100, duration: 6e4 }
    };
  }
  /**
   * Initialize the queue
   */
  async initialize() {
    this.isRunning = true;
    this.emit("queue:ready");
    console.log(`[Queue] Initialized in-memory queue: ${this.config.queueName}`);
  }
  /**
   * Add a job to the queue
   */
  async addJob(job) {
    const jobId = `job_${Date.now()}_${++this.jobCounter}`;
    const fullJob = {
      ...job,
      id: jobId,
      priority: job.priority || "normal"
    };
    this.jobs.set(jobId, fullJob);
    this.insertByPriority(jobId, fullJob.priority);
    this.progress.set(jobId, {
      jobId,
      executionId: "",
      status: "waiting",
      progress: 0,
      completedSteps: [],
      failedSteps: []
    });
    this.emit("job:added", fullJob);
    this.processNext();
    return jobId;
  }
  /**
   * Add multiple jobs at once
   */
  async addBulk(jobs) {
    const jobIds = [];
    for (const job of jobs) {
      const id = await this.addJob(job);
      jobIds.push(id);
    }
    return jobIds;
  }
  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }
  /**
   * Get job progress
   */
  getProgress(jobId) {
    return this.progress.get(jobId);
  }
  /**
   * Get all jobs with a specific status
   */
  getJobsByStatus(status) {
    return Array.from(this.jobs.values()).filter((job) => {
      const progress = this.progress.get(job.id);
      return progress?.status === status;
    });
  }
  /**
   * Get queue statistics
   */
  getStats() {
    let waiting = 0, active = 0, completed = 0, failed = 0, delayed = 0;
    for (const progress of this.progress.values()) {
      switch (progress.status) {
        case "waiting":
          waiting++;
          break;
        case "active":
          active++;
          break;
        case "completed":
          completed++;
          break;
        case "failed":
          failed++;
          break;
        case "delayed":
          delayed++;
          break;
      }
    }
    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: this.jobs.size
    };
  }
  /**
   * Pause the queue
   */
  async pause() {
    this.isPaused = true;
    this.emit("queue:paused");
  }
  /**
   * Resume the queue
   */
  async resume() {
    this.isPaused = false;
    this.emit("queue:resumed");
    this.processNext();
  }
  /**
   * Remove a job from the queue
   */
  async removeJob(jobId) {
    const index = this.queue.indexOf(jobId);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
    this.jobs.delete(jobId);
    this.progress.delete(jobId);
    return true;
  }
  /**
   * Retry a failed job
   */
  async retryJob(jobId) {
    const progress = this.progress.get(jobId);
    if (!progress || progress.status !== "failed") {
      return false;
    }
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }
    this.progress.set(jobId, {
      jobId,
      executionId: "",
      status: "waiting",
      progress: 0,
      completedSteps: [],
      failedSteps: []
    });
    this.insertByPriority(jobId, job.priority);
    this.processNext();
    return true;
  }
  /**
   * Clean completed/failed jobs older than specified time
   */
  async clean(olderThanMs = 864e5) {
    const cutoff = Date.now() - olderThanMs;
    let removed = 0;
    for (const [jobId, progress] of this.progress.entries()) {
      if ((progress.status === "completed" || progress.status === "failed") && progress.completedAt && progress.completedAt < cutoff) {
        this.jobs.delete(jobId);
        this.progress.delete(jobId);
        removed++;
      }
    }
    return removed;
  }
  /**
   * Close the queue
   */
  async close() {
    this.isRunning = false;
    console.log(`[Queue] Closed queue: ${this.config.queueName}`);
  }
  /**
   * Register a job processor
   */
  process(processor) {
    this.processor = processor;
    this.processNext();
  }
  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================
  processor = null;
  insertByPriority(jobId, priority) {
    const weight = PRIORITY_WEIGHTS[priority];
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingJob = this.jobs.get(this.queue[i]);
      if (existingJob && PRIORITY_WEIGHTS[existingJob.priority || "normal"] > weight) {
        insertIndex = i;
        break;
      }
    }
    this.queue.splice(insertIndex, 0, jobId);
  }
  async processNext() {
    if (!this.isRunning || this.isPaused || !this.processor) {
      return;
    }
    if (this.processing.size >= this.config.concurrency) {
      return;
    }
    const jobId = this.queue.shift();
    if (!jobId) {
      return;
    }
    const job = this.jobs.get(jobId);
    if (!job) {
      this.processNext();
      return;
    }
    this.processing.add(jobId);
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const progress = this.progress.get(jobId);
    progress.status = "active";
    progress.executionId = executionId;
    progress.startedAt = Date.now();
    this.emit("job:started", jobId, executionId);
    const updateProgress = (update) => {
      const current = this.progress.get(jobId);
      if (current) {
        Object.assign(current, update);
        this.emit("job:progress", current);
      }
    };
    try {
      const result = await Promise.race([
        this.processor(job, updateProgress),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Job timeout")), this.config.defaultTimeout)
        )
      ]);
      progress.status = "completed";
      progress.progress = 100;
      progress.completedAt = Date.now();
      progress.result = result;
      this.emit("job:completed", jobId, result);
    } catch (error) {
      progress.status = "failed";
      progress.completedAt = Date.now();
      progress.error = error instanceof Error ? error.message : String(error);
      this.emit("job:failed", jobId, error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.processing.delete(jobId);
      this.processNext();
    }
  }
};
var BullPipelineQueue = class extends EventEmitter {
  config;
  queue = null;
  worker = null;
  constructor(config = {}) {
    super();
    this.config = {
      redisUrl: config.redisUrl || process.env.REDIS_URL || "redis://localhost:6379",
      queueName: config.queueName || "gicm-pipelines",
      concurrency: config.concurrency || 5,
      defaultTimeout: config.defaultTimeout || 3e5,
      maxRetries: config.maxRetries || 3,
      rateLimit: config.rateLimit || { max: 100, duration: 6e4 }
    };
  }
  /**
   * Initialize Bull queue with Redis
   */
  async initialize() {
    try {
      const { Queue, Worker } = await import("bullmq");
      const connection = {
        url: this.config.redisUrl
      };
      this.queue = new Queue(this.config.queueName, {
        connection,
        defaultJobOptions: {
          attempts: this.config.maxRetries,
          backoff: {
            type: "exponential",
            delay: 1e3
          },
          removeOnComplete: {
            count: 100
          },
          removeOnFail: {
            count: 50
          }
        }
      });
      this.emit("queue:ready");
      console.log(`[Queue] Initialized Bull queue: ${this.config.queueName}`);
    } catch (error) {
      console.warn("[Queue] bullmq not available, falling back to in-memory queue");
      this.emit("queue:error", error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Add a job to the Bull queue
   */
  async addJob(job) {
    if (!this.queue) {
      throw new Error("Queue not initialized");
    }
    const bullQueue = this.queue;
    const result = await bullQueue.add("pipeline", job, {
      priority: PRIORITY_WEIGHTS[job.priority || "normal"],
      jobId: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    });
    return result.id;
  }
  /**
   * Register a processor for Bull queue
   */
  process(processor) {
    if (!this.queue) {
      throw new Error("Queue not initialized");
    }
    console.log("[Queue] Bull processor registered");
  }
  // Additional methods would mirror PipelineQueue but use Bull APIs
  async pause() {
    const q = this.queue;
    if (q) await q.pause();
    this.emit("queue:paused");
  }
  async resume() {
    const q = this.queue;
    if (q) await q.resume();
    this.emit("queue:resumed");
  }
  async close() {
    const q = this.queue;
    const w = this.worker;
    if (w) await w.close();
    if (q) await q.close();
  }
  getStats() {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0 };
  }
};
async function createPipelineQueue(config = {}) {
  if (config.redisUrl || process.env.REDIS_URL) {
    try {
      const bullQueue = new BullPipelineQueue(config);
      await bullQueue.initialize();
      return bullQueue;
    } catch {
      console.log("[Queue] Falling back to in-memory queue");
    }
  }
  const memoryQueue = new PipelineQueue(config);
  await memoryQueue.initialize();
  return memoryQueue;
}
var queueInstance = null;
async function getPipelineQueue(config) {
  if (!queueInstance) {
    queueInstance = await createPipelineQueue(config);
  }
  return queueInstance;
}

// src/queue/workers.ts
import { EventEmitter as EventEmitter2 } from "eventemitter3";
var defaultToolExecutor = async (tool, inputs, context) => {
  const duration = 500 + Math.random() * 2e3;
  await new Promise((resolve) => setTimeout(resolve, duration));
  const tokens = {
    input: Math.floor(300 + Math.random() * 700),
    output: Math.floor(100 + Math.random() * 400)
  };
  if (Math.random() < 0.05) {
    return {
      success: false,
      output: null,
      error: `Simulated failure for tool: ${tool}`,
      tokens,
      duration
    };
  }
  let output;
  switch (tool) {
    case "hunter_discover":
      output = {
        opportunities: [
          { name: "Token A", score: 85, source: "twitter" },
          { name: "Token B", score: 72, source: "github" }
        ]
      };
      break;
    case "hunter_score":
      output = {
        scored: inputs.opportunities?.map((o, i) => ({
          ...o,
          finalScore: 80 - i * 5
        }))
      };
      break;
    case "growth_generate_blog":
      output = {
        title: inputs.topic || "Generated Blog Post",
        content: "Lorem ipsum dolor sit amet...",
        wordCount: 1500
      };
      break;
    case "growth_keyword_research":
      output = {
        keywords: ["crypto", "blockchain", "defi", "web3"],
        volumes: [1e4, 8e3, 5e3, 3e3]
      };
      break;
    case "money_dca_trade":
      output = {
        executed: true,
        amount: inputs.amount,
        asset: inputs.asset,
        txId: `tx_${Date.now()}`
      };
      break;
    case "money_treasury_status":
      output = {
        balance: { SOL: 100, USDC: 5e3 },
        allocations: { trading: 40, growth: 30, reserve: 30 }
      };
      break;
    case "autonomy_classify_risk":
      output = {
        riskScore: 35,
        level: "low",
        factors: { financial: 20, reversibility: 5, visibility: 10 }
      };
      break;
    default:
      output = {
        tool,
        inputs,
        executedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
  }
  return {
    success: true,
    output,
    tokens,
    duration
  };
};
var PipelineWorker = class extends EventEmitter2 {
  config;
  isRunning = false;
  constructor(config = {}) {
    super();
    this.config = {
      analytics: config.analytics || void 0,
      toolExecutor: config.toolExecutor || defaultToolExecutor,
      stepTimeout: config.stepTimeout || 6e4,
      parallelSteps: config.parallelSteps !== false
    };
  }
  /**
   * Register this worker with a queue
   */
  register(queue) {
    queue.process(async (job, updateProgress) => {
      return this.processJob(job, updateProgress);
    });
    this.isRunning = true;
    console.log("[Worker] Registered with queue");
  }
  /**
   * Process a pipeline job
   */
  async processJob(job, updateProgress) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startTime = Date.now();
    const context = {
      jobId: job.id,
      executionId,
      pipelineId: job.pipelineId,
      stepResults: /* @__PURE__ */ new Map(),
      metadata: job.metadata || {}
    };
    if (this.config.analytics) {
      this.config.analytics.startExecution(job.pipelineId, job.pipelineName, job.steps.length);
    }
    this.emit("pipeline:started", job.id, executionId);
    const completedSteps = [];
    const failedSteps = [];
    const stepResults = {};
    let totalTokens = { input: 0, output: 0, total: 0 };
    try {
      const stepMap = new Map(job.steps.map((s) => [s.id, s]));
      const completed = /* @__PURE__ */ new Set();
      const pending = new Set(job.steps.map((s) => s.id));
      while (pending.size > 0) {
        const ready = [];
        for (const stepId of pending) {
          const step = stepMap.get(stepId);
          const deps = step.dependsOn || [];
          if (deps.every((d) => completed.has(d))) {
            ready.push(step);
          }
        }
        if (ready.length === 0 && pending.size > 0) {
          throw new Error("Circular dependency detected or missing dependency");
        }
        const stepPromises = ready.map(async (step) => {
          const resolvedInputs = this.resolveInputs(step.inputs || {}, context);
          this.emit("step:started", job.id, step.id, step.tool);
          if (this.config.analytics) {
            this.config.analytics.recordStep(executionId, step.id, step.tool, "running");
          }
          try {
            const result2 = await Promise.race([
              this.config.toolExecutor(step.tool, resolvedInputs, context),
              new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Step timeout")), this.config.stepTimeout)
              )
            ]);
            context.stepResults.set(step.id, result2);
            stepResults[step.id] = result2;
            if (result2.success) {
              completedSteps.push(step.id);
              completed.add(step.id);
              if (result2.tokens) {
                totalTokens.input += result2.tokens.input;
                totalTokens.output += result2.tokens.output;
                totalTokens.total += result2.tokens.input + result2.tokens.output;
              }
              if (this.config.analytics) {
                this.config.analytics.recordStep(
                  executionId,
                  step.id,
                  step.tool,
                  "completed",
                  result2.tokens
                );
              }
              this.emit("step:completed", job.id, step.id, result2);
            } else {
              failedSteps.push(step.id);
              completed.add(step.id);
              if (this.config.analytics) {
                this.config.analytics.recordStep(
                  executionId,
                  step.id,
                  step.tool,
                  "failed",
                  result2.tokens,
                  result2.error
                );
              }
              this.emit("step:failed", job.id, step.id, new Error(result2.error || "Unknown error"));
            }
            return { step, result: result2 };
          } catch (error) {
            const errorResult = {
              success: false,
              output: null,
              error: error instanceof Error ? error.message : String(error)
            };
            context.stepResults.set(step.id, errorResult);
            stepResults[step.id] = errorResult;
            failedSteps.push(step.id);
            completed.add(step.id);
            if (this.config.analytics) {
              this.config.analytics.recordStep(
                executionId,
                step.id,
                step.tool,
                "failed",
                void 0,
                errorResult.error
              );
            }
            this.emit("step:failed", job.id, step.id, error instanceof Error ? error : new Error(String(error)));
            return { step, result: errorResult };
          } finally {
            pending.delete(step.id);
          }
        });
        if (this.config.parallelSteps) {
          await Promise.all(stepPromises);
        } else {
          for (const promise of stepPromises) {
            await promise;
          }
        }
        const progress = Math.round(completed.size / job.steps.length * 100);
        updateProgress({
          progress,
          completedSteps: [...completedSteps],
          failedSteps: [...failedSteps]
        });
      }
      const status = failedSteps.length === 0 ? "completed" : completedSteps.length > 0 ? "partial" : "failed";
      const result = {
        executionId,
        pipelineId: job.pipelineId,
        status,
        stepResults,
        totalDuration: Date.now() - startTime,
        totalTokens,
        completedSteps,
        failedSteps
      };
      if (this.config.analytics) {
        this.config.analytics.completeExecution(
          executionId,
          status === "completed" ? "completed" : "failed",
          failedSteps.length > 0 ? `Failed steps: ${failedSteps.join(", ")}` : void 0
        );
      }
      this.emit("pipeline:completed", job.id, result);
      return result;
    } catch (error) {
      if (this.config.analytics) {
        this.config.analytics.completeExecution(
          executionId,
          "failed",
          error instanceof Error ? error.message : String(error)
        );
      }
      this.emit("pipeline:failed", job.id, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Resolve step inputs from previous step outputs
   */
  resolveInputs(inputs, context) {
    const resolved = {};
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === "string" && value.startsWith("$")) {
        const [stepId, ...path] = value.slice(1).split(".");
        const stepResult = context.stepResults.get(stepId);
        if (stepResult?.success && stepResult.output) {
          let val = stepResult.output;
          for (const p of path) {
            if (val && typeof val === "object" && p in val) {
              val = val[p];
            } else {
              val = void 0;
              break;
            }
          }
          resolved[key] = val;
        } else {
          resolved[key] = void 0;
        }
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }
};
function createAgentToolExecutor() {
  return async (tool, inputs, context) => {
    const { getAgentExecutor } = await import("./agent-executor-5NHO5W4Y.js");
    const executor = getAgentExecutor();
    const result = await executor.execute(tool, inputs, {
      executionId: context.executionId,
      stepId: tool,
      // Use tool as step ID for single execution
      pipelineId: context.pipelineId,
      inputs,
      previousResults: Object.fromEntries(context.stepResults)
    });
    return {
      success: result.success,
      output: result.data,
      error: result.error,
      tokens: result.tokensUsed ? { input: Math.floor(result.tokensUsed * 0.7), output: Math.floor(result.tokensUsed * 0.3) } : void 0,
      duration: result.duration
    };
  };
}
function createPipelineWorker(queue, config = {}) {
  const worker = new PipelineWorker(config);
  worker.register(queue);
  return worker;
}
function createAgentWorker(queue, config = {}) {
  const worker = new PipelineWorker({
    ...config,
    toolExecutor: createAgentToolExecutor()
  });
  worker.register(queue);
  return worker;
}

export {
  PipelineQueue,
  BullPipelineQueue,
  createPipelineQueue,
  getPipelineQueue,
  PipelineWorker,
  createAgentToolExecutor,
  createPipelineWorker,
  createAgentWorker
};
//# sourceMappingURL=chunk-UOZH5NC2.js.map