/**
 * OPUS 67 BRAIN Runtime
 * Unified orchestrator for the complete v3 stack
 *
 * v4.0 - Self-Contained Intelligence Layer
 * Pre-indexed knowledge for skills, capabilities, synergies, and MCPs.
 */

import { EventEmitter } from "eventemitter3";
import {
  router,
  MultiModelRouter,
  routeToModel,
  costTracker,
  modelClient,
  ModelClient,
  type RouteResult,
  type ModelResponse,
  type ModelCallResult,
} from "../models/index.js";
import {
  council,
  LLMCouncil,
  type DeliberationResult,
} from "../council/index.js";
import {
  memory,
  GraphitiMemory,
  createMemory,
  contextEnhancer,
  ContextEnhancer,
  type ContextEnhancement,
} from "../memory/index.js";
import {
  evolutionLoop,
  EvolutionLoop,
  createEvolutionLoop,
  patternDetector,
  type EvolutionMetrics,
} from "../evolution/index.js";
import {
  metricsCollector,
  tokenTracker,
  latencyProfiler,
  type MetricsSnapshot,
} from "../benchmark/index.js";
import {
  detectMode,
  getMode,
  type ModeName,
  type DetectionResult,
} from "../mode-selector.js";
import { generateBootScreen, generateStatusLine } from "../boot-sequence.js";
import {
  PromptCacheManager,
  createPromptCache,
  type CacheStatistics,
} from "../cache/prompt-cache.js";
import {
  FileContextManager,
  createFileContext,
  type ConsistencyCheck,
} from "./file-context.js";

// v4.0 Intelligence Layer
import {
  getKnowledgeStore,
  type KnowledgeStore,
  type KnowledgeStats,
} from "../intelligence/index.js";

// Types
export interface BrainConfig {
  enableRouter: boolean;
  enableCouncil: boolean;
  enableMemory: boolean;
  enableEvolution: boolean;
  enableIntelligence: boolean; // v4.0: Pre-indexed knowledge layer
  enableCaching: boolean; // v5.0: Ephemeral prompt caching
  enableFileContext: boolean; // v5.0: File-aware memory system
  defaultMode: ModeName;
  autoStartEvolution: boolean;
  councilThreshold: number; // Complexity score threshold for council
  costBudget?: number;
  dryRun: boolean;
}

export interface BrainRequest {
  query: string;
  context?: Record<string, unknown>;
  forceMode?: ModeName;
  forceCouncil?: boolean;
  skipMemory?: boolean;
  skills?: string[]; // v4.0: Explicit skills to use
  skipPreFlight?: boolean; // v4.0: Skip pre-flight validation
}

export interface BrainResponse {
  id: string;
  query: string;
  mode: ModeName;
  modeConfidence: number;
  complexityScore: number;
  response: string;
  model: string;
  cost: number;
  latencyMs: number;
  tokensUsed: { input: number; output: number };
  memoryContext?: ContextEnhancement;
  councilResult?: DeliberationResult;
  routingDecision?: RouteResult;
  timestamp: Date;
  // v4.0: Intelligence layer results
  preFlightCheck?: {
    pass: boolean;
    confidence: number;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  };
  detectedSkills?: string[];
  // v5.0: File-aware memory results
  fileConsistency?: ConsistencyCheck;
}

export interface BrainStatus {
  running: boolean;
  mode: ModeName;
  evolutionActive: boolean;
  totalRequests: number;
  totalCost: number;
  avgLatencyMs: number;
  uptime: number;
  memoryNodes: number;
  evolutionCycles: number;
}

interface BrainEvents {
  "request:start": (requestId: string, query: string) => void;
  "request:complete": (response: BrainResponse) => void;
  "mode:switched": (from: ModeName, to: ModeName) => void;
  "council:invoked": (question: string) => void;
  "council:complete": (result: DeliberationResult) => void;
  "memory:enhanced": (enhancement: ContextEnhancement) => void;
  "evolution:cycle": (cycleId: string) => void;
  error: (error: Error) => void;
}

const DEFAULT_CONFIG: BrainConfig = {
  enableRouter: true,
  enableCouncil: true,
  enableMemory: true,
  enableEvolution: true,
  enableIntelligence: true, // v4.0: Pre-indexed knowledge enabled by default
  enableCaching: true, // v5.0: Prompt caching enabled by default
  enableFileContext: true, // v5.0: File-aware memory enabled by default
  defaultMode: "auto",
  autoStartEvolution: false,
  councilThreshold: 7, // Use council for complexity >= 7
  costBudget: 10, // $10 default budget
  dryRun: false,
};

/**
 * BrainRuntime - The unified OPUS 67 orchestrator
 */
export class BrainRuntime extends EventEmitter<BrainEvents> {
  private config: BrainConfig;
  private router: MultiModelRouter;
  private council: LLMCouncil;
  private memory: GraphitiMemory;
  private contextEnhancer: ContextEnhancer;
  private evolution: EvolutionLoop;
  private modelClient: ModelClient;
  private intelligence: KnowledgeStore; // v4.0
  private promptCache: PromptCacheManager; // v5.0
  private fileContext: FileContextManager; // v5.0: File-aware memory

  private running = false;
  private currentMode: ModeName;
  private startTime: Date | null = null;
  private requestCount = 0;
  private responses: BrainResponse[] = [];
  private intelligenceReady = false; // v4.0

  constructor(config?: Partial<BrainConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentMode = this.config.defaultMode;

    // Initialize components
    this.router = router;
    this.council = council;
    this.memory = createMemory({ fallbackToLocal: true });
    this.contextEnhancer = new ContextEnhancer(this.memory);
    this.evolution = createEvolutionLoop(
      { dryRun: this.config.dryRun },
      this.memory
    );

    // Initialize the actual model client for AI API calls
    this.modelClient = modelClient;

    // v4.0: Initialize intelligence layer
    this.intelligence = getKnowledgeStore();

    // v5.0: Initialize prompt cache
    this.promptCache = createPromptCache({
      enableCaching: this.config.enableCaching,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    // v5.0: Initialize file-aware memory
    this.fileContext = createFileContext({
      enableRelationshipTracking: this.config.enableFileContext,
      enableAutoSummary: true,
      maxFiles: 100,
    });

    // Register pattern detector with evolution
    this.evolution.registerDetector(patternDetector.createDetector());

    // Set cost budget
    if (this.config.costBudget) {
      costTracker.setBudget({
        daily: this.config.costBudget,
        session: this.config.costBudget,
        perOperation: this.config.costBudget / 100,
      });
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `brain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /**
   * Boot the BRAIN runtime
   */
  async boot(): Promise<string> {
    this.running = true;
    this.startTime = new Date();

    // v4.0: Initialize intelligence layer (async)
    if (this.config.enableIntelligence) {
      try {
        await this.intelligence.initialize();
        this.intelligenceReady = true;
      } catch (error) {
        console.error("[BrainRuntime] Intelligence init failed:", error);
        this.intelligenceReady = false;
      }
    }

    // Auto-start evolution if enabled
    if (this.config.autoStartEvolution && this.config.enableEvolution) {
      this.evolution.start();
    }

    return generateBootScreen({
      defaultMode: this.currentMode,
      showEvolution: this.config.enableEvolution,
      showCouncil: this.config.enableCouncil,
    });
  }

  /**
   * Shutdown the BRAIN runtime
   */
  shutdown(): void {
    this.running = false;
    this.evolution.stop();
  }

  /**
   * Process a request through the BRAIN
   */
  async process(request: BrainRequest): Promise<BrainResponse> {
    const requestId = this.generateId();
    const startTime = performance.now();

    this.emit("request:start", requestId, request.query);
    this.requestCount++;

    try {
      // 1. Detect mode
      const detection = request.forceMode
        ? {
            mode: request.forceMode,
            confidence: 1,
            complexity_score: 5,
            reasons: ["Forced mode"],
          }
        : detectMode({ query: request.query, ...request.context });

      // Switch mode if needed
      if (detection.mode !== this.currentMode) {
        const oldMode = this.currentMode;
        this.currentMode = detection.mode;
        this.emit("mode:switched", oldMode, this.currentMode);
      }

      // v4.0: Pre-flight check with intelligence layer
      let preFlightCheck: BrainResponse["preFlightCheck"];
      let detectedSkills: string[] | undefined;

      if (
        this.config.enableIntelligence &&
        this.intelligenceReady &&
        !request.skipPreFlight
      ) {
        // Detect best skills for this task
        const skillMatches = await this.intelligence.findSkillsForTask(
          request.query,
          5
        );
        detectedSkills =
          request.skills || skillMatches.data?.map((m) => m.skillId) || [];

        // Run pre-flight validation
        if (detectedSkills.length > 0) {
          preFlightCheck = await this.intelligence.preFlightCheck(
            request.query,
            detectedSkills
          );

          // Log blockers and warnings
          if (preFlightCheck.blockers.length > 0) {
            console.warn(
              `[BrainRuntime] Pre-flight blockers:`,
              preFlightCheck.blockers
            );
          }
        }
      }

      // 2. Enhance with memory context
      let memoryContext: ContextEnhancement | undefined;
      if (this.config.enableMemory && !request.skipMemory) {
        memoryContext = await this.contextEnhancer.enhance(request.query);
        this.emit("memory:enhanced", memoryContext);
      }

      // 3. Determine if council is needed
      const useCouncil =
        request.forceCouncil ||
        (this.config.enableCouncil &&
          detection.complexity_score >= this.config.councilThreshold);

      let response: string;
      let model: string;
      let councilResult: DeliberationResult | undefined;
      let routingDecision: RouteResult | undefined;

      if (useCouncil) {
        // Use council for high-complexity decisions
        this.emit("council:invoked", request.query);

        const enhancedQuery = memoryContext
          ? `${memoryContext.enhancedPrompt}\n\n${request.query}`
          : request.query;

        councilResult = await this.council.deliberate(enhancedQuery);
        this.emit("council:complete", councilResult);

        response = councilResult.stage3Synthesis.finalAnswer;
        model = "council";
      } else {
        // Use router for standard requests
        const enhancedQuery = memoryContext?.enhancedPrompt ?? request.query;

        routingDecision = this.router.route({
          prompt: enhancedQuery,
          taskType: this.modeToTaskType(detection.mode),
        });

        // v5.0: Use prompt caching for complex queries (complexity >= 6)
        const useCache =
          this.config.enableCaching && detection.complexity_score >= 6;

        if (useCache) {
          // Use cached prompts for complex queries
          const cacheResult = await this.promptCache.query({
            query: enhancedQuery,
            loadedSkills: detectedSkills,
            userContext: memoryContext?.enhancedPrompt,
            systemPrompt: `Current mode: ${detection.mode.toUpperCase()}\nTask type: ${this.modeToTaskType(detection.mode)}`,
          });

          response = cacheResult.content;
          model = routingDecision.model;
        } else {
          // Standard model call without caching
          const systemPrompt = `You are OPUS 67, an advanced AI assistant powered by Claude Opus 4.5.
Current mode: ${detection.mode.toUpperCase()}
Task type: ${this.modeToTaskType(detection.mode)}

Be helpful, accurate, and concise. Respond appropriately for the current mode.`;

          const modelResult = await this.modelClient.call(
            routingDecision,
            enhancedQuery,
            systemPrompt
          );
          response = modelResult.content;
          model = modelResult.model;
        }
      }

      const latencyMs = performance.now() - startTime;

      // Get actual token counts and cost from model result if available
      const actualCost =
        councilResult?.metrics.totalCost ??
        (model !== "council" ? 0 : (routingDecision?.estimatedCost ?? 0));

      // 4. Build response
      const brainResponse: BrainResponse = {
        id: requestId,
        query: request.query,
        mode: detection.mode,
        modeConfidence: detection.confidence,
        complexityScore: detection.complexity_score,
        response,
        model,
        cost: actualCost,
        latencyMs,
        tokensUsed: {
          input: Math.floor(request.query.length / 4), // Approximation
          output: Math.floor(response.length / 4), // Approximation
        },
        // v4.0: Intelligence layer results
        preFlightCheck,
        detectedSkills,
        memoryContext,
        councilResult,
        routingDecision,
        timestamp: new Date(),
      };

      // 5. Store episode in memory
      if (this.config.enableMemory) {
        await this.memory.addEpisode({
          name: `request:${requestId}`,
          content: `Query: ${request.query.slice(0, 100)}... Response: ${response.slice(0, 100)}...`,
          type: "success",
          context: {
            mode: detection.mode,
            model,
            cost: brainResponse.cost,
            latencyMs,
          },
        });
      }

      // 6. Record metrics
      tokenTracker.record("brain", "brain", model as any, {
        input: brainResponse.tokensUsed.input,
        output: brainResponse.tokensUsed.output,
      });
      metricsCollector.recordLatency(latencyMs);

      this.responses.push(brainResponse);
      this.emit("request:complete", brainResponse);

      return brainResponse;
    } catch (error) {
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Convert mode to task type for routing
   */
  private modeToTaskType(
    mode: ModeName
  ): "scan" | "build" | "review" | "complex-reasoning" {
    const modeStr = mode as string;
    switch (modeStr) {
      case "scan":
        return "scan";
      case "build":
        return "build";
      case "review":
        return "review";
      case "architect":
      case "debug":
        return "complex-reasoning";
      default:
        return "build";
    }
  }

  /**
   * Get available AI providers
   */
  getAvailableProviders(): string[] {
    return this.modelClient.getAvailableProviders();
  }

  /**
   * Health check for model providers
   */
  async checkModelHealth(): Promise<
    { provider: string; status: "ok" | "error"; message?: string }[]
  > {
    return this.modelClient.healthCheck();
  }

  /**
   * Invoke council deliberation directly
   */
  async deliberate(question: string): Promise<DeliberationResult> {
    this.emit("council:invoked", question);
    const result = await this.council.deliberate(question);
    this.emit("council:complete", result);
    return result;
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<BrainStatus> {
    const memStats = await this.memory.getStats();
    const evoMetrics = await this.evolution.getMetrics();
    const totalCost = this.responses.reduce((sum, r) => sum + r.cost, 0);
    const avgLatency =
      this.responses.length > 0
        ? this.responses.reduce((sum, r) => sum + r.latencyMs, 0) /
          this.responses.length
        : 0;

    return {
      running: this.running,
      mode: this.currentMode,
      evolutionActive:
        this.config.enableEvolution && this.config.autoStartEvolution,
      totalRequests: this.requestCount,
      totalCost,
      avgLatencyMs: Math.round(avgLatency * 100) / 100,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      memoryNodes: memStats.totalNodes,
      evolutionCycles: evoMetrics.totalCycles,
    };
  }

  /**
   * Get metrics snapshot
   */
  async getMetrics(): Promise<{
    brain: BrainStatus;
    evolution: EvolutionMetrics;
    benchmark: ReturnType<typeof metricsCollector.getMetrics>;
    costs: { total: number; today: number; budget: number | undefined };
  }> {
    return {
      brain: await this.getStatus(),
      evolution: await this.evolution.getMetrics(),
      benchmark: metricsCollector.getMetrics(),
      costs: {
        total: costTracker.getSummary().allTime,
        today: costTracker.getSummary().today,
        budget: this.config.costBudget,
      },
    };
  }

  /**
   * Get file context manager (v5.0)
   */
  getFileContext(): FileContextManager {
    return this.fileContext;
  }

  /**
   * Track a file in context (v5.0)
   */
  async trackFile(filePath: string, content?: string): Promise<void> {
    if (this.config.enableFileContext) {
      await this.fileContext.accessFile(filePath, content);
    }
  }

  /**
   * Check file consistency (v5.0)
   */
  async checkFileConsistency(filePath: string): Promise<ConsistencyCheck> {
    return this.fileContext.checkConsistency(filePath);
  }

  /**
   * Set mode manually
   */
  setMode(mode: ModeName): void {
    const oldMode = this.currentMode;
    this.currentMode = mode;
    this.emit("mode:switched", oldMode, mode);
  }

  /**
   * Get current mode
   */
  getMode(): ModeName {
    return this.currentMode;
  }

  /**
   * Get response history
   */
  getHistory(limit = 10): BrainResponse[] {
    return this.responses.slice(-limit).reverse();
  }

  /**
   * Start evolution engine
   */
  startEvolution(): void {
    if (!this.config.enableEvolution) return;
    this.evolution.start();
  }

  /**
   * Stop evolution engine
   */
  stopEvolution(): void {
    this.evolution.stop();
  }

  /**
   * Run evolution cycle manually
   */
  async runEvolutionCycle(): Promise<void> {
    const cycle = await this.evolution.runCycle();
    this.emit("evolution:cycle", cycle.id);
  }

  /**
   * Get pending evolution opportunities
   */
  getPendingOpportunities() {
    return this.evolution.getPendingOpportunities();
  }

  // ===========================================================================
  // v4.0 INTELLIGENCE LAYER METHODS
  // ===========================================================================

  /**
   * Get intelligence layer statistics
   */
  async getIntelligenceStats(): Promise<KnowledgeStats | null> {
    if (!this.config.enableIntelligence || !this.intelligenceReady) {
      return null;
    }
    return this.intelligence.getStats();
  }

  /**
   * Check if a skill can perform an action
   */
  async canSkillDo(
    skillId: string,
    action: string
  ): Promise<{
    can: boolean;
    confidence: number;
    reasoning: string;
    warnings?: string[];
  } | null> {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.canSkillDo(skillId, action);
    return result.data;
  }

  /**
   * Find best skills for a task
   */
  async findSkillsForTask(
    task: string,
    maxResults = 5
  ): Promise<
    Array<{
      skillId: string;
      score: number;
      matchedCapabilities: string[];
    }>
  > {
    if (!this.intelligenceReady) return [];
    const result = await this.intelligence.findSkillsForTask(task, maxResults);
    return result.data || [];
  }

  /**
   * Validate an MCP tool call
   */
  async validateMCPCall(
    serverId: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] } | null> {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.validateMCPCall(
      serverId,
      toolName,
      params
    );
    return result.data;
  }

  /**
   * Get synergy score for skill combination
   */
  async getSynergyScore(skillIds: string[]): Promise<{
    score: number;
    amplifications: number;
    conflicts: number;
    reasoning: string[];
  } | null> {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.getSynergyScore(skillIds);
    return result.data;
  }

  /**
   * Check if intelligence layer is ready
   */
  isIntelligenceReady(): boolean {
    return this.intelligenceReady;
  }

  // ===========================================================================
  // v5.0 PROMPT CACHING METHODS
  // ===========================================================================

  /**
   * Get prompt cache statistics
   */
  getCacheStats(): CacheStatistics {
    return this.promptCache.getStats();
  }

  /**
   * Format cache statistics for display
   */
  formatCacheStats(): string {
    return this.promptCache.formatStats();
  }

  /**
   * Format status for display
   */
  async formatStatus(): Promise<string> {
    const status = await this.getStatus();
    const uptimeHours = (status.uptime / 3600000).toFixed(1);
    const cacheStats = this.getCacheStats();

    return `
╔══════════════════════════════════════════════════════════════════╗
║                    OPUS 67 BRAIN RUNTIME                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  STATUS: ${status.running ? "🧠 RUNNING" : "⏹ STOPPED".padEnd(52)} ║
║  MODE: ${status.mode.toUpperCase().padEnd(55)} ║
║                                                                  ║
║  COMPONENTS                                                      ║
║  ────────────────────────────────────────────────────────────    ║
║  Router:       ${this.config.enableRouter ? "✅ ENABLED" : "❌ DISABLED".padEnd(47)} ║
║  Council:      ${this.config.enableCouncil ? "✅ ENABLED" : "❌ DISABLED".padEnd(47)} ║
║  Memory:       ${this.config.enableMemory ? "✅ ENABLED" : "❌ DISABLED".padEnd(47)} ║
║  Evolution:    ${status.evolutionActive ? "🔄 ACTIVE" : "⏸ PAUSED".padEnd(47)} ║
║  Intelligence: ${this.intelligenceReady ? "🧠 READY" : "⏳ LOADING".padEnd(47)} ║
║  Caching:      ${this.config.enableCaching ? "💾 ENABLED" : "❌ DISABLED".padEnd(47)} ║
║                                                                  ║
║  METRICS                                                         ║
║  ────────────────────────────────────────────────────────────    ║
║  Total Requests: ${String(status.totalRequests).padEnd(44)} ║
║  Total Cost: $${status.totalCost.toFixed(4).padEnd(46)} ║
║  Avg Latency: ${String(status.avgLatencyMs).padEnd(47)} ms ║
║  Memory Nodes: ${String(status.memoryNodes).padEnd(46)} ║
║  Evolution Cycles: ${String(status.evolutionCycles).padEnd(42)} ║
║  Uptime: ${uptimeHours}h${" ".repeat(51)} ║
║                                                                  ║
║  PROMPT CACHING (v5.0)                                           ║
║  ────────────────────────────────────────────────────────────    ║
║  Cache Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%${" ".repeat(41)} ║
║  Total Saved: $${cacheStats.totalSaved.toFixed(2).padEnd(45)} ║
║  Cached Size: ${String(cacheStats.cachedContentSize).padEnd(44)} tokens ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝`;
  }
}

// Factory
export function createBrainRuntime(
  config?: Partial<BrainConfig>
): BrainRuntime {
  return new BrainRuntime(config);
}

// Default singleton
export const brainRuntime = new BrainRuntime();
