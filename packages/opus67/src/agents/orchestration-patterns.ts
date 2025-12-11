/**
 * OPUS 67 Subagent Orchestration Patterns
 *
 * Production-ready patterns for multi-agent coordination:
 * - Pipeline Pattern: Sequential stage-based processing
 * - Parallel Specialization: Concurrent domain-specific agents
 * - Single-Job Subagent Rule: One clear purpose per agent
 * - Context Isolation: Sandboxed execution with summary extraction
 */

import { EventEmitter } from "eventemitter3";
import { z } from "zod";

// =============================================================================
// SCHEMA DEFINITIONS (Zod Validation)
// =============================================================================

export const InputSchemaBase = z.object({
  data: z.unknown(),
  metadata: z.record(z.unknown()).optional(),
});

export const OutputSchemaBase = z.object({
  result: z.unknown(),
  success: z.boolean(),
  errors: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type InputSchema = z.infer<typeof InputSchemaBase>;
export type OutputSchema = z.infer<typeof OutputSchemaBase>;

// =============================================================================
// TYPES: PIPELINE PATTERN
// =============================================================================

export interface StageConfig {
  /** Unique identifier for this stage */
  id: string;
  /** Agent ID to execute this stage */
  agentId: string;
  /** Human-readable description */
  description: string;
  /** Transform input before passing to agent */
  inputTransform?: (input: unknown, previousResults: StageResult[]) => unknown;
  /** Validate output before passing to next stage */
  outputValidation?: z.ZodSchema;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
  /** Skip condition - if returns true, stage is skipped */
  skipIf?: (input: unknown, previousResults: StageResult[]) => boolean;
}

export interface StageResult {
  stageId: string;
  agentId: string;
  success: boolean;
  output: unknown;
  duration: number;
  tokensUsed: number;
  error?: string;
  skipped?: boolean;
}

export interface PipelineResult {
  pipelineId: string;
  success: boolean;
  stages: StageResult[];
  finalOutput: unknown;
  totalDuration: number;
  totalTokens: number;
  errors: string[];
}

export type StageHandler = (result: StageResult, stageIndex: number) => void;

interface PipelineEvents {
  "stage:start": (stageId: string, index: number) => void;
  "stage:complete": (result: StageResult, index: number) => void;
  "stage:skip": (stageId: string, reason: string) => void;
  "stage:error": (stageId: string, error: Error) => void;
  "pipeline:complete": (result: PipelineResult) => void;
  error: (error: Error) => void;
}

// =============================================================================
// TYPES: PARALLEL SPECIALIZATION PATTERN
// =============================================================================

export interface WorkerConfig {
  /** Agent ID for this worker */
  agentId: string;
  /** Task description for this worker */
  task: string;
  /** Input data for this worker */
  input?: unknown;
  /** Priority (higher = execute first if resources limited) */
  priority?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Tags for grouping/filtering */
  tags?: string[];
}

export interface WorkerResult {
  agentId: string;
  task: string;
  success: boolean;
  output: unknown;
  duration: number;
  tokensUsed: number;
  error?: string;
}

export interface ParallelResult {
  parallelId: string;
  success: boolean;
  workers: WorkerResult[];
  aggregatedOutput: unknown;
  totalDuration: number;
  totalTokens: number;
  successRate: number;
}

interface ParallelEvents {
  "worker:start": (agentId: string) => void;
  "worker:complete": (result: WorkerResult) => void;
  "worker:error": (agentId: string, error: Error) => void;
  "parallel:complete": (result: ParallelResult) => void;
  error: (error: Error) => void;
}

// =============================================================================
// TYPES: SINGLE-JOB SUBAGENT
// =============================================================================

export interface SubagentConfig {
  /** Unique name for this subagent */
  name: string;
  /** ONE clear job description - this is the core principle */
  singleJob: string;
  /** Input schema (Zod) */
  inputs: z.ZodSchema;
  /** Output schema (Zod) */
  outputs: z.ZodSchema;
  /** System prompt additions */
  systemPromptAdditions?: string;
  /** Tools this agent can use */
  tools?: string[];
  /** Model to use (default: sonnet) */
  model?: "sonnet" | "opus" | "haiku";
  /** Token budget limit */
  tokenBudget?: number;
  /** Tags for categorization */
  tags?: string[];
}

export interface SubagentDefinition {
  config: SubagentConfig;
  systemPrompt: string;
  createdAt: number;
}

// =============================================================================
// TYPES: CONTEXT ISOLATION
// =============================================================================

export interface IsolatedContextConfig {
  /** Maximum tokens in isolated context */
  maxTokens?: number;
  /** What to include from parent context */
  inheritFrom?: ("files" | "codebase" | "conversation" | "none")[];
  /** Allowed file patterns */
  allowedFilePatterns?: string[];
  /** Denied file patterns */
  deniedFilePatterns?: string[];
}

export interface ContextWindow {
  id: string;
  content: Map<string, unknown>;
  tokensUsed: number;
  maxTokens: number;
  createdAt: number;
}

export interface ContextSummary {
  keyFindings: string[];
  artifacts: Array<{
    type: "code" | "file" | "analysis" | "recommendation";
    content: string;
    path?: string;
  }>;
  relevantForParent: string;
  tokensUsed: number;
}

// =============================================================================
// PIPELINE ORCHESTRATOR
// =============================================================================

/**
 * PipelineOrchestrator - Sequential stage-based processing
 *
 * Example: analyst -> architect -> implementer -> tester -> auditor
 * Each stage receives output from previous stage.
 *
 * @example
 * ```typescript
 * const pipeline = new PipelineOrchestrator('feature-build');
 *
 * pipeline
 *   .addStage('analyst', {
 *     id: 'requirements',
 *     agentId: 'requirements-analyst',
 *     description: 'Analyze requirements and create specification',
 *   })
 *   .addStage('architect', {
 *     id: 'design',
 *     agentId: 'system-architect',
 *     description: 'Create technical design from requirements',
 *     inputTransform: (input, prev) => ({
 *       requirements: prev[0].output,
 *       constraints: input,
 *     }),
 *   })
 *   .addStage('implementer', {
 *     id: 'code',
 *     agentId: 'code-implementer',
 *     description: 'Implement the design',
 *   })
 *   .onStageComplete((result, index) => {
 *     console.log(`Stage ${index} complete: ${result.stageId}`);
 *   });
 *
 * const result = await pipeline.execute({ feature: 'user-auth' });
 * ```
 */
export class PipelineOrchestrator extends EventEmitter<PipelineEvents> {
  private pipelineId: string;
  private stages: StageConfig[] = [];
  private stageHandlers: StageHandler[] = [];
  private executor: AgentExecutor | null = null;

  constructor(pipelineId: string) {
    super();
    this.pipelineId = pipelineId;
  }

  /**
   * Add a stage to the pipeline
   */
  addStage(agent: string, config: Omit<StageConfig, "agentId">): this {
    this.stages.push({
      ...config,
      agentId: agent,
    });
    return this;
  }

  /**
   * Register handler for stage completion
   */
  onStageComplete(handler: StageHandler): this {
    this.stageHandlers.push(handler);
    return this;
  }

  /**
   * Set the agent executor (for dependency injection)
   */
  setExecutor(executor: AgentExecutor): this {
    this.executor = executor;
    return this;
  }

  /**
   * Execute the pipeline
   */
  async execute(input: unknown): Promise<PipelineResult> {
    const results: StageResult[] = [];
    const errors: string[] = [];
    const startTime = Date.now();
    let currentInput = input;

    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];

      // Check skip condition
      if (stage.skipIf?.(currentInput, results)) {
        const skippedResult: StageResult = {
          stageId: stage.id,
          agentId: stage.agentId,
          success: true,
          output: null,
          duration: 0,
          tokensUsed: 0,
          skipped: true,
        };
        results.push(skippedResult);
        this.emit("stage:skip", stage.id, "Skip condition met");
        continue;
      }

      this.emit("stage:start", stage.id, i);

      try {
        const stageResult = await this.executeStage(
          stage,
          currentInput,
          results
        );
        results.push(stageResult);

        // Notify handlers
        for (const handler of this.stageHandlers) {
          handler(stageResult, i);
        }
        this.emit("stage:complete", stageResult, i);

        if (!stageResult.success) {
          errors.push(`Stage ${stage.id} failed: ${stageResult.error}`);
          break;
        }

        // Pass output to next stage
        currentInput = stageResult.output;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.emit("stage:error", stage.id, err);
        errors.push(`Stage ${stage.id} error: ${err.message}`);

        results.push({
          stageId: stage.id,
          agentId: stage.agentId,
          success: false,
          output: null,
          duration: 0,
          tokensUsed: 0,
          error: err.message,
        });
        break;
      }
    }

    const pipelineResult: PipelineResult = {
      pipelineId: this.pipelineId,
      success:
        errors.length === 0 && results.every((r) => r.success || r.skipped),
      stages: results,
      finalOutput: results[results.length - 1]?.output ?? null,
      totalDuration: Date.now() - startTime,
      totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0),
      errors,
    };

    this.emit("pipeline:complete", pipelineResult);
    return pipelineResult;
  }

  /**
   * Execute a single stage with retry logic
   */
  private async executeStage(
    stage: StageConfig,
    input: unknown,
    previousResults: StageResult[]
  ): Promise<StageResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    const maxAttempts = stage.retry?.maxAttempts ?? 1;

    // Transform input if transformer provided
    const transformedInput = stage.inputTransform
      ? stage.inputTransform(input, previousResults)
      : input;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Execute agent (via injected executor or mock)
        const output = await this.executeAgent(
          stage.agentId,
          transformedInput,
          stage.timeout
        );

        // Validate output if schema provided
        if (stage.outputValidation) {
          stage.outputValidation.parse(output);
        }

        return {
          stageId: stage.id,
          agentId: stage.agentId,
          success: true,
          output,
          duration: Date.now() - startTime,
          tokensUsed: this.estimateTokens(output),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Wait before retry
        if (attempt < maxAttempts - 1 && stage.retry) {
          await this.sleep(stage.retry.backoffMs * (attempt + 1));
        }
      }
    }

    return {
      stageId: stage.id,
      agentId: stage.agentId,
      success: false,
      output: null,
      duration: Date.now() - startTime,
      tokensUsed: 0,
      error: lastError?.message ?? "Unknown error",
    };
  }

  /**
   * Execute an agent (uses injected executor or mock)
   */
  private async executeAgent(
    agentId: string,
    input: unknown,
    timeout?: number
  ): Promise<unknown> {
    if (this.executor) {
      return this.executor.execute(agentId, input, timeout);
    }

    // Mock implementation for testing
    await this.sleep(100 + Math.random() * 200);
    return {
      agentId,
      processedInput: input,
      timestamp: Date.now(),
    };
  }

  private estimateTokens(output: unknown): number {
    const str = typeof output === "string" ? output : JSON.stringify(output);
    return Math.ceil(str.length / 4);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get pipeline configuration summary
   */
  getSummary(): string {
    return this.stages
      .map((s, i) => `${i + 1}. ${s.agentId}: ${s.description}`)
      .join("\n");
  }
}

// =============================================================================
// PARALLEL ORCHESTRATOR
// =============================================================================

/**
 * ParallelOrchestrator - Concurrent domain-specific agents
 *
 * Example: UI + API + Database agents working simultaneously
 * All workers execute in parallel, results are aggregated.
 *
 * @example
 * ```typescript
 * const parallel = new ParallelOrchestrator('fullstack-feature');
 *
 * parallel
 *   .addWorker('ui-specialist', 'Create React components for user profile')
 *   .addWorker('api-specialist', 'Create REST endpoints for user data')
 *   .addWorker('db-specialist', 'Create database schema for users');
 *
 * const results = await parallel.executeAll();
 * console.log(`Success rate: ${results.successRate * 100}%`);
 * ```
 */
export class ParallelOrchestrator extends EventEmitter<ParallelEvents> {
  private parallelId: string;
  private workers: WorkerConfig[] = [];
  private executor: AgentExecutor | null = null;
  private maxConcurrent: number;

  constructor(parallelId: string, options?: { maxConcurrent?: number }) {
    super();
    this.parallelId = parallelId;
    this.maxConcurrent = options?.maxConcurrent ?? 10;
  }

  /**
   * Add a worker to the parallel execution
   */
  addWorker(
    agent: string,
    task: string,
    options?: Partial<WorkerConfig>
  ): this {
    this.workers.push({
      agentId: agent,
      task,
      priority: options?.priority ?? 0,
      timeout: options?.timeout,
      input: options?.input,
      tags: options?.tags ?? [],
    });
    return this;
  }

  /**
   * Set the agent executor (for dependency injection)
   */
  setExecutor(executor: AgentExecutor): this {
    this.executor = executor;
    return this;
  }

  /**
   * Execute all workers in parallel
   */
  async executeAll(): Promise<ParallelResult> {
    const startTime = Date.now();

    // Sort by priority (higher first)
    const sortedWorkers = [...this.workers].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

    // Execute in batches if more than maxConcurrent
    const results: WorkerResult[] = [];

    for (let i = 0; i < sortedWorkers.length; i += this.maxConcurrent) {
      const batch = sortedWorkers.slice(i, i + this.maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((worker) => this.executeWorker(worker))
      );
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.success).length;
    const parallelResult: ParallelResult = {
      parallelId: this.parallelId,
      success: successCount === results.length,
      workers: results,
      aggregatedOutput: this.aggregateOutputs(results),
      totalDuration: Date.now() - startTime,
      totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0),
      successRate: results.length > 0 ? successCount / results.length : 0,
    };

    this.emit("parallel:complete", parallelResult);
    return parallelResult;
  }

  /**
   * Wait for all workers to complete
   */
  async waitForAll(): Promise<void> {
    await this.executeAll();
  }

  /**
   * Execute a single worker
   */
  private async executeWorker(worker: WorkerConfig): Promise<WorkerResult> {
    const startTime = Date.now();
    this.emit("worker:start", worker.agentId);

    try {
      const output = await this.executeAgent(
        worker.agentId,
        { task: worker.task, input: worker.input },
        worker.timeout
      );

      const result: WorkerResult = {
        agentId: worker.agentId,
        task: worker.task,
        success: true,
        output,
        duration: Date.now() - startTime,
        tokensUsed: this.estimateTokens(output),
      };

      this.emit("worker:complete", result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("worker:error", worker.agentId, err);

      return {
        agentId: worker.agentId,
        task: worker.task,
        success: false,
        output: null,
        duration: Date.now() - startTime,
        tokensUsed: 0,
        error: err.message,
      };
    }
  }

  /**
   * Execute an agent (uses injected executor or mock)
   */
  private async executeAgent(
    agentId: string,
    input: unknown,
    timeout?: number
  ): Promise<unknown> {
    if (this.executor) {
      return this.executor.execute(agentId, input, timeout);
    }

    // Mock implementation
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );
    return {
      agentId,
      completedTask: (input as { task: string }).task,
      timestamp: Date.now(),
    };
  }

  /**
   * Aggregate outputs from all workers
   */
  private aggregateOutputs(results: WorkerResult[]): unknown {
    const successful = results.filter((r) => r.success);
    return {
      results: successful.map((r) => ({
        agent: r.agentId,
        output: r.output,
      })),
      summary: `${successful.length}/${results.length} workers succeeded`,
    };
  }

  private estimateTokens(output: unknown): number {
    const str = typeof output === "string" ? output : JSON.stringify(output);
    return Math.ceil(str.length / 4);
  }

  /**
   * Get all workers
   */
  getWorkers(): WorkerConfig[] {
    return [...this.workers];
  }
}

// =============================================================================
// SINGLE-JOB SUBAGENT FACTORY
// =============================================================================

/**
 * SingleJobSubagent - Enforces the one-job-per-agent rule
 *
 * Each subagent has ONE clear purpose, validated inputs/outputs,
 * and a focused system prompt.
 *
 * @example
 * ```typescript
 * const codeReviewer = SingleJobSubagent.create({
 *   name: 'code-reviewer',
 *   singleJob: 'Review TypeScript code for type safety and best practices',
 *   inputs: z.object({
 *     code: z.string(),
 *     language: z.literal('typescript'),
 *   }),
 *   outputs: z.object({
 *     issues: z.array(z.object({
 *       line: z.number(),
 *       severity: z.enum(['error', 'warning', 'info']),
 *       message: z.string(),
 *     })),
 *     score: z.number().min(0).max(100),
 *   }),
 * });
 *
 * // Validated execution
 * const result = await codeReviewer.execute({ code: '...', language: 'typescript' });
 * ```
 */
export class SingleJobSubagent {
  private definition: SubagentDefinition;
  private executor: AgentExecutor | null = null;

  private constructor(config: SubagentConfig) {
    this.definition = {
      config,
      systemPrompt: this.generateSystemPrompt(config),
      createdAt: Date.now(),
    };
  }

  /**
   * Create a new single-job subagent
   */
  static create(config: SubagentConfig): SingleJobSubagent {
    // Validate singleJob is actually a single, clear job
    if (!config.singleJob || config.singleJob.length < 10) {
      throw new Error(
        "singleJob must be a clear description of at least 10 characters"
      );
    }

    if (
      config.singleJob.includes(" and ") ||
      config.singleJob.includes(" & ")
    ) {
      console.warn(
        `Warning: singleJob contains "and"/"&" - consider if this is truly ONE job: "${config.singleJob}"`
      );
    }

    return new SingleJobSubagent(config);
  }

  /**
   * Set the agent executor (for dependency injection)
   */
  setExecutor(executor: AgentExecutor): this {
    this.executor = executor;
    return this;
  }

  /**
   * Execute the subagent with validated input/output
   */
  async execute(input: unknown): Promise<unknown> {
    // Validate input
    const validatedInput = this.definition.config.inputs.parse(input);

    // Execute agent
    const output = await this.executeAgent(validatedInput);

    // Validate output
    const validatedOutput = this.definition.config.outputs.parse(output);

    return validatedOutput;
  }

  /**
   * Get the generated system prompt
   */
  getSystemPrompt(): string {
    return this.definition.systemPrompt;
  }

  /**
   * Get the agent configuration
   */
  getConfig(): SubagentConfig {
    return { ...this.definition.config };
  }

  /**
   * Generate a focused system prompt
   */
  private generateSystemPrompt(config: SubagentConfig): string {
    const lines = [
      `You are a specialized subagent with ONE job:`,
      ``,
      `## YOUR SINGLE JOB`,
      `${config.singleJob}`,
      ``,
      `## CONSTRAINTS`,
      `- Focus ONLY on your assigned job`,
      `- Do NOT attempt tasks outside your scope`,
      `- Return structured output matching the expected schema`,
      `- Be concise and actionable`,
    ];

    if (config.systemPromptAdditions) {
      lines.push(
        ``,
        `## ADDITIONAL INSTRUCTIONS`,
        config.systemPromptAdditions
      );
    }

    if (config.tokenBudget) {
      lines.push(
        ``,
        `## TOKEN BUDGET`,
        `Maximum tokens: ${config.tokenBudget}`
      );
    }

    return lines.join("\n");
  }

  /**
   * Execute the agent
   */
  private async executeAgent(input: unknown): Promise<unknown> {
    if (this.executor) {
      return this.executor.execute(
        this.definition.config.name,
        input,
        undefined,
        this.definition.systemPrompt
      );
    }

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      _mock: true,
      input,
      job: this.definition.config.singleJob,
    };
  }
}

// =============================================================================
// ISOLATED CONTEXT
// =============================================================================

/**
 * IsolatedContext - Sandboxed context for subagent execution
 *
 * Subagents use their own context window, preventing context pollution.
 * Returns summaries to parent instead of raw data.
 *
 * @example
 * ```typescript
 * const isolated = new IsolatedContext({
 *   maxTokens: 10000,
 *   inheritFrom: ['files'],
 *   allowedFilePatterns: ['src/**\/*.ts'],
 * });
 *
 * // Add context items
 * isolated.add('requirements', { feature: 'auth', priority: 'high' });
 * isolated.add('codebase', { files: ['src/auth.ts'] });
 *
 * // Get context for subagent
 * const context = isolated.createIsolated();
 *
 * // After subagent execution, summarize for parent
 * const summary = isolated.summarizeForParent();
 * ```
 */
export class IsolatedContext {
  private id: string;
  private config: IsolatedContextConfig;
  private content: Map<string, unknown> = new Map();
  private tokensUsed = 0;
  private findings: string[] = [];
  private artifacts: ContextSummary["artifacts"] = [];

  constructor(config?: IsolatedContextConfig) {
    this.id = `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.config = {
      maxTokens: config?.maxTokens ?? 50000,
      inheritFrom: config?.inheritFrom ?? ["none"],
      allowedFilePatterns: config?.allowedFilePatterns ?? ["**/*"],
      deniedFilePatterns: config?.deniedFilePatterns ?? [
        "**/node_modules/**",
        "**/.git/**",
      ],
    };
  }

  /**
   * Add content to the isolated context
   */
  add(key: string, value: unknown): this {
    const tokens = this.estimateTokens(value);

    if (this.tokensUsed + tokens > this.config.maxTokens!) {
      throw new Error(
        `Token budget exceeded: ${this.tokensUsed + tokens} > ${this.config.maxTokens}`
      );
    }

    this.content.set(key, value);
    this.tokensUsed += tokens;
    return this;
  }

  /**
   * Get content by key
   */
  get(key: string): unknown {
    return this.content.get(key);
  }

  /**
   * Check if content exists
   */
  has(key: string): boolean {
    return this.content.has(key);
  }

  /**
   * Remove content by key
   */
  remove(key: string): boolean {
    const value = this.content.get(key);
    if (value) {
      this.tokensUsed -= this.estimateTokens(value);
      return this.content.delete(key);
    }
    return false;
  }

  /**
   * Create an isolated context window for subagent
   */
  createIsolated(): ContextWindow {
    return {
      id: this.id,
      content: new Map(this.content),
      tokensUsed: this.tokensUsed,
      maxTokens: this.config.maxTokens!,
      createdAt: Date.now(),
    };
  }

  /**
   * Record a finding from subagent execution
   */
  recordFinding(finding: string): this {
    this.findings.push(finding);
    return this;
  }

  /**
   * Record an artifact from subagent execution
   */
  recordArtifact(
    type: "code" | "file" | "analysis" | "recommendation",
    content: string,
    path?: string
  ): this {
    this.artifacts.push({ type, content, path });
    return this;
  }

  /**
   * Summarize context for parent agent
   */
  summarizeForParent(): ContextSummary {
    // Generate a concise summary of what was found/produced
    const relevantParts: string[] = [];

    if (this.findings.length > 0) {
      relevantParts.push(
        `Key findings: ${this.findings.slice(0, 5).join("; ")}`
      );
    }

    if (this.artifacts.length > 0) {
      const artifactSummary = this.artifacts
        .map((a) => `${a.type}${a.path ? ` (${a.path})` : ""}`)
        .join(", ");
      relevantParts.push(`Artifacts: ${artifactSummary}`);
    }

    return {
      keyFindings: this.findings,
      artifacts: this.artifacts,
      relevantForParent: relevantParts.join("\n") || "No significant findings",
      tokensUsed: this.tokensUsed,
    };
  }

  /**
   * Get only relevant data for a specific purpose
   */
  getRelevantOnly(keys: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (this.content.has(key)) {
        result[key] = this.content.get(key);
      }
    }
    return result;
  }

  /**
   * Clear the context
   */
  clear(): void {
    this.content.clear();
    this.tokensUsed = 0;
    this.findings = [];
    this.artifacts = [];
  }

  /**
   * Get context statistics
   */
  getStats(): {
    id: string;
    tokensUsed: number;
    maxTokens: number;
    utilization: number;
    itemCount: number;
    findingsCount: number;
    artifactsCount: number;
  } {
    return {
      id: this.id,
      tokensUsed: this.tokensUsed,
      maxTokens: this.config.maxTokens!,
      utilization: this.tokensUsed / this.config.maxTokens!,
      itemCount: this.content.size,
      findingsCount: this.findings.length,
      artifactsCount: this.artifacts.length,
    };
  }

  /**
   * Check if a file path is allowed
   */
  isFileAllowed(filePath: string): boolean {
    const allowed = this.config.allowedFilePatterns ?? ["**/*"];
    const denied = this.config.deniedFilePatterns ?? [];

    // Check denied patterns first
    for (const pattern of denied) {
      if (this.matchGlob(filePath, pattern)) {
        return false;
      }
    }

    // Check allowed patterns
    for (const pattern of allowed) {
      if (this.matchGlob(filePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple glob matching
   */
  private matchGlob(path: string, pattern: string): boolean {
    const regex = pattern
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".");
    return new RegExp(`^${regex}$`).test(path);
  }

  private estimateTokens(value: unknown): number {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    return Math.ceil(str.length / 4);
  }
}

// =============================================================================
// AGENT EXECUTOR INTERFACE
// =============================================================================

/**
 * Interface for agent execution (dependency injection)
 */
export interface AgentExecutor {
  execute(
    agentId: string,
    input: unknown,
    timeout?: number,
    systemPrompt?: string
  ): Promise<unknown>;
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a pipeline orchestrator
 */
export function createPipeline(id: string): PipelineOrchestrator {
  return new PipelineOrchestrator(id);
}

/**
 * Create a parallel orchestrator
 */
export function createParallel(
  id: string,
  options?: { maxConcurrent?: number }
): ParallelOrchestrator {
  return new ParallelOrchestrator(id, options);
}

/**
 * Create a single-job subagent
 */
export function createSubagent(config: SubagentConfig): SingleJobSubagent {
  return SingleJobSubagent.create(config);
}

/**
 * Create an isolated context
 */
export function createIsolatedContext(
  config?: IsolatedContextConfig
): IsolatedContext {
  return new IsolatedContext(config);
}

// =============================================================================
// PREDEFINED AGENT CONFIGURATIONS
// =============================================================================

/**
 * Common single-job subagent templates
 */
export const SubagentTemplates = {
  /**
   * Code reviewer - validates code quality
   */
  codeReviewer: (language: string = "typescript"): SubagentConfig => ({
    name: "code-reviewer",
    singleJob: `Review ${language} code for type safety, best practices, and potential bugs`,
    inputs: z.object({
      code: z.string(),
      context: z.string().optional(),
    }),
    outputs: z.object({
      issues: z.array(
        z.object({
          line: z.number(),
          severity: z.enum(["error", "warning", "info"]),
          message: z.string(),
          suggestion: z.string().optional(),
        })
      ),
      score: z.number().min(0).max(100),
      summary: z.string(),
    }),
    tools: ["Read", "Grep"],
    model: "sonnet",
    tags: ["review", "quality"],
  }),

  /**
   * Test generator - creates unit tests
   */
  testGenerator: (framework: string = "vitest"): SubagentConfig => ({
    name: "test-generator",
    singleJob: `Generate comprehensive unit tests using ${framework}`,
    inputs: z.object({
      code: z.string(),
      functionName: z.string(),
      requirements: z.array(z.string()).optional(),
    }),
    outputs: z.object({
      testCode: z.string(),
      testCount: z.number(),
      coverage: z.object({
        statements: z.number(),
        branches: z.number(),
        functions: z.number(),
      }),
    }),
    tools: ["Read", "Write"],
    model: "sonnet",
    tags: ["testing", "quality"],
  }),

  /**
   * Security auditor - checks for vulnerabilities
   */
  securityAuditor: (): SubagentConfig => ({
    name: "security-auditor",
    singleJob:
      "Audit code for security vulnerabilities and provide remediation advice",
    inputs: z.object({
      code: z.string(),
      language: z.string(),
      context: z.string().optional(),
    }),
    outputs: z.object({
      vulnerabilities: z.array(
        z.object({
          severity: z.enum(["critical", "high", "medium", "low"]),
          type: z.string(),
          location: z.string(),
          description: z.string(),
          remediation: z.string(),
        })
      ),
      securityScore: z.number().min(0).max(100),
      compliant: z.boolean(),
    }),
    tools: ["Read", "Grep"],
    model: "opus",
    tags: ["security", "audit"],
  }),

  /**
   * Documentation writer - creates documentation
   */
  documentationWriter: (): SubagentConfig => ({
    name: "documentation-writer",
    singleJob: "Write clear, comprehensive documentation for code and APIs",
    inputs: z.object({
      code: z.string(),
      type: z.enum(["api", "function", "class", "module"]),
      existingDocs: z.string().optional(),
    }),
    outputs: z.object({
      documentation: z.string(),
      examples: z.array(z.string()),
      apiReference: z.string().optional(),
    }),
    tools: ["Read", "Write"],
    model: "sonnet",
    tags: ["documentation"],
  }),

  /**
   * Schema designer - creates database schemas
   */
  schemaDesigner: (database: string = "postgresql"): SubagentConfig => ({
    name: "schema-designer",
    singleJob: `Design optimized ${database} database schemas with proper indexes and constraints`,
    inputs: z.object({
      requirements: z.string(),
      existingSchema: z.string().optional(),
      performance: z.enum(["read-heavy", "write-heavy", "balanced"]).optional(),
    }),
    outputs: z.object({
      schema: z.string(),
      migrations: z.array(z.string()),
      indexes: z.array(
        z.object({
          table: z.string(),
          columns: z.array(z.string()),
          type: z.string(),
        })
      ),
      notes: z.string(),
    }),
    tools: ["Read", "Write"],
    model: "sonnet",
    tags: ["database", "schema"],
  }),
};

// =============================================================================
// PREDEFINED PIPELINE CONFIGURATIONS
// =============================================================================

/**
 * Common pipeline templates
 */
export const PipelineTemplates = {
  /**
   * Feature development pipeline
   */
  featureDevelopment: (): PipelineOrchestrator => {
    return new PipelineOrchestrator("feature-development")
      .addStage("requirements-analyst", {
        id: "analyze",
        description: "Analyze requirements and create specification",
      })
      .addStage("system-architect", {
        id: "design",
        description: "Create technical design from requirements",
        inputTransform: (input, prev) => ({
          requirements: prev[0]?.output,
          originalInput: input,
        }),
      })
      .addStage("code-implementer", {
        id: "implement",
        description: "Implement the design",
        inputTransform: (input, prev) => ({
          design: prev[1]?.output,
          requirements: prev[0]?.output,
        }),
      })
      .addStage("test-generator", {
        id: "test",
        description: "Generate tests for implementation",
        inputTransform: (input, prev) => ({
          implementation: prev[2]?.output,
        }),
      })
      .addStage("security-auditor", {
        id: "audit",
        description: "Audit implementation for security",
        inputTransform: (input, prev) => ({
          implementation: prev[2]?.output,
          tests: prev[3]?.output,
        }),
      });
  },

  /**
   * Code review pipeline
   */
  codeReview: (): PipelineOrchestrator => {
    return new PipelineOrchestrator("code-review")
      .addStage("code-reviewer", {
        id: "review",
        description: "Review code for quality and best practices",
      })
      .addStage("security-auditor", {
        id: "security",
        description: "Check for security vulnerabilities",
        inputTransform: (input, prev) => ({
          code: (input as { code: string }).code,
          reviewFindings: prev[0]?.output,
        }),
      })
      .addStage("test-coverage-analyzer", {
        id: "coverage",
        description: "Analyze test coverage",
        skipIf: (input) =>
          !(input as { checkCoverage?: boolean }).checkCoverage,
      });
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

// All classes are already exported with 'export class' declarations above
