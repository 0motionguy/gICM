export { BrainAPI, BrainRuntime, CodeImprover, ComparisonRunner, ContextEnhancer, CostTracker, DEFAULT_LEVELS, EvolutionLoop, LLMCouncil, MODELS, MultiModelRouter, PatternDetector, SYNTHESIS_PROMPTS, StressTest, aggregateRankings, brainAPI, brainRuntime, codeImprover, comparisonRunner, contextEnhancer, costTracker, council, createBrainAPI, createBrainRuntime, createBrainServer, createCodeImprover, createComparisonRunner, createContextEnhancer, createCouncil, createEvolutionLoop, createPatternDetector, createStressTest, enhancePrompt, evolutionLoop, formatModelList, formatSynthesis, generateRankingReport, generateSynthesisPrompt, getAvailableModels, getContextFor, getModelConfig, getModelsForProvider, getModelsForTier, hasApiKey, parseRankingText, parseSynthesisResponse, patternDetector, routeToModel, router, runComparisonCLI, runStressTestCLI, startBrainServer, stressTest, validateEnv } from './chunk-7DWUTE7T.js';
import { getSkillSearch } from './chunk-JSMRUXZR.js';
export { CapabilityMatrix, ConfidenceScorer, KnowledgeStore, MCPValidator, SQLiteStore, SimilaritySearch, SkillMetadataLoader, SkillSearch, SynergyGraph, TFIDFVectorizer, canDo, findBestSkills, findSimilarSkills, getCapabilityMatrix, getConfidenceScorer, getIntelligenceStats, getKnowledgeStore, getMCPValidator, getSQLiteStore, getSimilaritySearch, getSkillMetadataLoader, getSkillSearch, getSynergy, getSynergyGraph, initIntelligence, lookupSkill, preFlightCheck, resetCapabilityMatrix, resetConfidenceScorer, resetKnowledgeStore, resetMCPValidator, resetSQLiteStore, resetSimilaritySearch, resetSkillMetadataLoader, resetSkillSearch, resetSynergyGraph, scoreConfidence, validateMCP } from './chunk-JSMRUXZR.js';
export { CloudSync, getCloudSync, resetCloudSync } from './chunk-2C2XO4QK.js';
import { getLearningObserver } from './chunk-KUOFDOUY.js';
export { LearningLoop, LearningObserverAgent, getLearningLoop, getLearningObserver, resetLearningLoop, resetLearningObserver } from './chunk-KUOFDOUY.js';
export { AgentSpawner, LatencyProfiler, MODEL_COSTS, MetricsCollector, TokenTracker, agentSpawner, createSpawner, latencyProfiler, metricsCollector, timed, tokenTracker } from './chunk-GNLGUR5P.js';
export { AutonomyLogger, autonomyLogger } from './chunk-JJWKCL7R.js';
export { AutonomyEngine, DynamicToolDiscovery, MCPHub, SkillLoader, loader_default as SkillLoaderDefault, createDiscovery, getDiscovery } from './chunk-64IVSL5H.js';
export { ContextIndexer } from './chunk-XVOLIGJS.js';
import { generateBootScreen, generateInlineStatus } from './chunk-KRJAO3QU.js';
export { generateAgentSpawnNotification, generateBootScreen, generateHelpScreen, generateInlineStatus, generateModeSwitchNotification, generateStatusLine } from './chunk-KRJAO3QU.js';
import { getConnectionsForSkills, formatConnectionsForPrompt } from './chunk-WHBX6V2T.js';
export { formatConnectionsForPrompt, generateConnectionCode, getAllConnections, getConnectionsForKeywords, getConnectionsForSkills } from './chunk-WHBX6V2T.js';
import { getUnifiedMemory } from './chunk-GCLGOCG5.js';
export { GraphitiMemory, createMemory, memory } from './chunk-2BMLDUKW.js';
import { modeSelector } from './chunk-Z7YWWTEP.js';
export { ModeSelector, formatModeDisplay, modeSelector } from './chunk-Z7YWWTEP.js';
import { detectMode } from './chunk-JD6NEK3D.js';
export { detectMode } from './chunk-JD6NEK3D.js';
import { getMode } from './chunk-J7GF6OJU.js';
export { getAllModes, getMode, loadModeRegistry } from './chunk-J7GF6OJU.js';
import { loadSkills } from './chunk-L3KXA3WY.js';
export { extractKeywords, loadCombination, loadRegistry, loadSkillMetadata, loadSkills, skillMatchesContext } from './chunk-L3KXA3WY.js';
import { formatSkillsForPrompt } from './chunk-YINZDDDM.js';
export { clearFragmentCache, formatSkillsForPrompt, loadFragment, resolveInheritance } from './chunk-YINZDDDM.js';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import '@anthropic-ai/sdk';
import { EventEmitter } from 'eventemitter3';

// src/mcp/memory-tools.ts
async function handleQueryMemory(params) {
  const startTime = Date.now();
  if (!params.query) {
    return { success: false, error: "Query parameter is required" };
  }
  try {
    const memory2 = getUnifiedMemory();
    if (!memory2) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }
    const results = await memory2.query({
      query: params.query,
      type: params.type || "semantic",
      limit: params.limit || 10,
      minScore: params.minScore || 0.1,
      sources: params.sources
    });
    const uniqueSources = [...new Set(results.map((r) => r.source))];
    return {
      success: true,
      data: results,
      stats: {
        count: results.length,
        sources: uniqueSources,
        latencyMs: Date.now() - startTime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Query failed: ${error}`
    };
  }
}
async function handleMultiHopQuery(params) {
  const startTime = Date.now();
  if (!params.query) {
    return { success: false, error: "Query parameter is required" };
  }
  try {
    const memory2 = getUnifiedMemory();
    if (!memory2) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }
    const results = await memory2.multiHopQuery(
      params.query,
      params.maxHops || 3
    );
    const uniqueSources = [...new Set(results.map((r) => r.source))];
    return {
      success: true,
      data: results,
      stats: {
        count: results.length,
        sources: uniqueSources,
        latencyMs: Date.now() - startTime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Multi-hop query failed: ${error}`
    };
  }
}
async function handleWriteMemory(params) {
  if (!params.content) {
    return { success: false, error: "Content parameter is required" };
  }
  if (!params.type) {
    return { success: false, error: "Type parameter is required" };
  }
  try {
    const memory2 = getUnifiedMemory();
    if (!memory2) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }
    const result = await memory2.write(
      params.content,
      params.type,
      params.metadata
    );
    return {
      success: true,
      data: { id: result.id }
    };
  } catch (error) {
    return {
      success: false,
      error: `Write failed: ${error}`
    };
  }
}
var memoryToolDefinitions = [
  {
    name: "opus67_queryMemory",
    description: "Query OPUS 67 unified memory system. Supports semantic search, keyword search, and cross-source queries.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        },
        type: {
          type: "string",
          enum: ["semantic", "keyword", "graph", "temporal"],
          description: "Query type (default: semantic)"
        },
        limit: {
          type: "number",
          description: "Max results to return (default: 10)"
        },
        minScore: {
          type: "number",
          description: "Minimum relevance score 0-1 (default: 0.1)"
        }
      },
      required: ["query"]
    },
    handler: handleQueryMemory
  },
  {
    name: "opus67_multiHopQuery",
    description: "Multi-hop reasoning query. Follows relationships in the knowledge graph to find connected facts (1-5 hops).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The reasoning query"
        },
        maxHops: {
          type: "number",
          description: "Maximum relationship hops (1-5, default: 3)"
        }
      },
      required: ["query"]
    },
    handler: handleMultiHopQuery
  },
  {
    name: "opus67_writeMemory",
    description: "Write a fact, episode, or learning to OPUS 67 memory for future recall.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to store"
        },
        type: {
          type: "string",
          enum: ["fact", "episode", "learning", "win"],
          description: "Type of memory entry"
        },
        metadata: {
          type: "object",
          description: "Additional metadata (optional)"
        }
      },
      required: ["content", "type"]
    },
    handler: handleWriteMemory
  }
];
var memoryTools = {
  queryMemory: handleQueryMemory,
  multiHopQuery: handleMultiHopQuery,
  writeMemory: handleWriteMemory
};
var AsyncAgentRunner = class extends EventEmitter {
  running = /* @__PURE__ */ new Map();
  completed = /* @__PURE__ */ new Map();
  messageBuffers = /* @__PURE__ */ new Map();
  jobCounter = 0;
  maxConcurrent;
  activeCount = 0;
  constructor(options) {
    super();
    this.maxConcurrent = options?.maxConcurrent ?? 10;
  }
  /**
   * Spawn an agent in background (non-blocking)
   * Returns immediately with a job ID
   */
  spawnBackground(config) {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      config,
      status: "queued",
      output: [],
      progress: 0,
      tokensUsed: 0
    };
    this.running.set(jobId, job);
    this.messageBuffers.set(jobId, []);
    this.emit("job:queued", job);
    this.executeJob(jobId).catch((error) => {
      this.failJob(
        jobId,
        error instanceof Error ? error.message : String(error)
      );
    });
    return jobId;
  }
  /**
   * Execute a job (internal, runs in background)
   */
  async executeJob(jobId) {
    const job = this.running.get(jobId);
    if (!job) return;
    while (this.activeCount >= this.maxConcurrent) {
      await this.sleep(100);
    }
    this.activeCount++;
    job.status = "running";
    job.startTime = Date.now();
    this.emit("job:started", jobId);
    try {
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
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.activeCount--;
    }
  }
  /**
   * Simulate agent execution (placeholder for real integration)
   */
  async simulateAgentExecution(job) {
    const steps = 5;
    const timeout = job.config.timeout || 3e4;
    const stepTime = Math.min(timeout / steps, 2e3);
    for (let i = 1; i <= steps; i++) {
      await this.sleep(stepTime);
      if (job.status === "cancelled") {
        throw new Error("Job cancelled");
      }
      const progress = i / steps * 100;
      job.progress = progress;
      this.emit("job:progress", job.id, progress);
      const message = {
        type: "text",
        content: `[${job.config.agentId}] Step ${i}/${steps} complete`,
        timestamp: Date.now()
      };
      this.addMessage(job.id, message);
    }
    return `Agent ${job.config.agentId} completed task: ${job.config.task.substring(0, 100)}`;
  }
  /**
   * Add message to job's buffer
   */
  addMessage(jobId, message) {
    const buffer = this.messageBuffers.get(jobId) || [];
    buffer.push(message);
    this.messageBuffers.set(jobId, buffer);
    this.emit("job:message", jobId, message);
  }
  /**
   * Fail a job
   */
  failJob(jobId, error) {
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
  getStatus(jobId) {
    const running = this.running.get(jobId);
    if (running) return running.status;
    const completed = this.completed.get(jobId);
    if (completed) return completed.status;
    return null;
  }
  /**
   * Get full job details
   */
  getJob(jobId) {
    return this.running.get(jobId) || this.completed.get(jobId) || null;
  }
  /**
   * Stream results as they arrive
   */
  async *streamResults(jobId) {
    let lastIndex = 0;
    const checkInterval = 100;
    while (true) {
      const job = this.running.get(jobId) || this.completed.get(jobId);
      if (!job) break;
      const buffer = this.messageBuffers.get(jobId) || [];
      while (lastIndex < buffer.length) {
        yield buffer[lastIndex];
        lastIndex++;
      }
      if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
        yield {
          type: "done",
          content: job.output.join("\n"),
          timestamp: Date.now(),
          metadata: {
            status: job.status,
            duration: (job.endTime || Date.now()) - (job.startTime || Date.now()),
            tokensUsed: job.tokensUsed
          }
        };
        break;
      }
      await this.sleep(checkInterval);
    }
  }
  /**
   * Cancel a running agent
   */
  async cancel(jobId) {
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
  async waitFor(jobId, timeout) {
    const startTime = Date.now();
    const maxWait = timeout || 6e4;
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
  getRunningJobs() {
    return Array.from(this.running.values());
  }
  /**
   * Get all completed jobs
   */
  getCompletedJobs() {
    return Array.from(this.completed.values());
  }
  /**
   * Get statistics
   */
  getStats() {
    const completedJobs = this.getCompletedJobs();
    const failed = completedJobs.filter((j) => j.status === "failed").length;
    const durations = completedJobs.filter((j) => j.startTime && j.endTime).map((j) => j.endTime - j.startTime);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return {
      running: this.running.size,
      completed: completedJobs.length,
      failed,
      avgDuration
    };
  }
  /**
   * Clear completed jobs
   */
  clearCompleted() {
    this.completed.clear();
    for (const jobId of this.messageBuffers.keys()) {
      if (!this.running.has(jobId)) {
        this.messageBuffers.delete(jobId);
      }
    }
  }
  /**
   * Generate unique job ID
   */
  generateJobId() {
    this.jobCounter++;
    return `job_${Date.now()}_${this.jobCounter.toString().padStart(4, "0")}`;
  }
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Format runner status
   */
  formatStatus() {
    const stats = this.getStats();
    return `
\u250C\u2500 ASYNC AGENT RUNNER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  JOBS                                                            \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Running: ${String(stats.running).padEnd(5)} Completed: ${String(stats.completed).padEnd(5)} Failed: ${String(stats.failed).padEnd(5)} \u2502
\u2502                                                                  \u2502
\u2502  PERFORMANCE                                                     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Avg Duration: ${stats.avgDuration.toFixed(0)}ms                                      \u2502
\u2502  Max Concurrent: ${this.maxConcurrent}                                            \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
var asyncAgentRunner = new AsyncAgentRunner({ maxConcurrent: 10 });
function createAsyncRunner(options) {
  return new AsyncAgentRunner(options);
}
var COMPLEXITY_PATTERNS = {
  moderate: [
    /create (a|the)/i,
    /implement/i,
    /add (a|the) (feature|function)/i,
    /refactor/i,
    /optimize/i,
    /update/i
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
    /swarm/i
  ]
};
var AGENT_ROLE_PATTERNS = {
  "backend-api-specialist": [
    /api/i,
    /backend/i,
    /server/i,
    /endpoint/i,
    /rest/i,
    /graphql/i
  ],
  "database-schema-oracle": [
    /database/i,
    /schema/i,
    /sql/i,
    /postgres/i,
    /mongodb/i,
    /query/i
  ],
  "security-engineer": [
    /auth/i,
    /security/i,
    /oauth/i,
    /jwt/i,
    /encrypt/i,
    /permission/i
  ],
  "frontend-fusion-engine": [
    /react/i,
    /frontend/i,
    /ui/i,
    /component/i,
    /nextjs/i,
    /vue/i
  ],
  "test-automation-engineer": [
    /test/i,
    /jest/i,
    /vitest/i,
    /e2e/i,
    /coverage/i,
    /spec/i
  ],
  "smart-contract-auditor": [
    /solidity/i,
    /smart contract/i,
    /evm/i,
    /audit/i,
    /vulnerab/i
  ],
  "solana-guardian-auditor": [
    /solana/i,
    /anchor/i,
    /rust/i,
    /program/i,
    /pda/i
  ],
  "typescript-precision-engineer": [
    /typescript/i,
    /type/i,
    /generic/i,
    /interface/i,
    /strict/i
  ],
  "deployment-strategist": [
    /deploy/i,
    /vercel/i,
    /docker/i,
    /ci\/cd/i,
    /pipeline/i
  ],
  "performance-profiler": [
    /performance/i,
    /optimize/i,
    /lighthouse/i,
    /bundle/i,
    /speed/i
  ]
};
var SubagentOrchestrator = class extends EventEmitter {
  activeJobs = /* @__PURE__ */ new Map();
  agentDefinitions = /* @__PURE__ */ new Map();
  taskCounter = 0;
  constructor() {
    super();
  }
  /**
   * Analyze a task to determine complexity and suggested agents
   */
  async analyzeTask(prompt, mode) {
    const taskId = this.generateTaskId();
    const complexity = this.detectComplexity(prompt);
    const suggestedAgents = this.matchAgents(prompt, complexity, mode);
    const executionStrategy = this.determineStrategy(
      complexity,
      suggestedAgents.length
    );
    const plan = {
      taskId,
      complexity,
      suggestedAgents,
      executionStrategy,
      estimatedDuration: this.estimateDuration(suggestedAgents),
      reasoning: this.generateReasoning(prompt, complexity, suggestedAgents)
    };
    this.emit("task:analyzed", plan);
    return plan;
  }
  /**
   * Detect task complexity from prompt
   */
  detectComplexity(prompt) {
    for (const pattern of COMPLEXITY_PATTERNS.complex) {
      if (pattern.test(prompt)) return "complex";
    }
    for (const pattern of COMPLEXITY_PATTERNS.moderate) {
      if (pattern.test(prompt)) return "moderate";
    }
    return "simple";
  }
  /**
   * Match agents based on task content
   */
  matchAgents(prompt, complexity, mode) {
    const matches = [];
    const promptLower = prompt.toLowerCase();
    for (const [agentId, patterns] of Object.entries(AGENT_ROLE_PATTERNS)) {
      let score = 0;
      const matchedKeywords = [];
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
          role: agentId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          priority: score,
          subtask: `Handle ${matchedKeywords.join(", ")} aspects`,
          dependencies: [],
          estimatedTokens: this.estimateTokens(complexity)
        });
      }
    }
    const sorted = matches.sort((a, b) => b.priority - a.priority);
    const limit = complexity === "complex" ? 5 : complexity === "moderate" ? 3 : 1;
    return sorted.slice(0, limit);
  }
  /**
   * Determine execution strategy
   */
  determineStrategy(complexity, agentCount) {
    if (complexity === "simple" || agentCount <= 1) return "sequential";
    if (complexity === "complex" && agentCount >= 3) return "parallel";
    return "hybrid";
  }
  /**
   * Estimate tokens for complexity level
   */
  estimateTokens(complexity) {
    const estimates = {
      simple: 2e3,
      moderate: 5e3,
      complex: 1e4
    };
    return estimates[complexity];
  }
  /**
   * Estimate total duration
   */
  estimateDuration(agents) {
    const basePerAgent = 3e3;
    return agents.length * basePerAgent;
  }
  /**
   * Generate reasoning for the plan
   */
  generateReasoning(prompt, complexity, agents) {
    if (agents.length === 0) {
      return "No specialized agents needed - general assistance sufficient.";
    }
    const agentNames = agents.map((a) => a.agentId).join(", ");
    return `Detected ${complexity} task. Spawning ${agents.length} agent(s): ${agentNames}. Estimated ${this.estimateDuration(agents)}ms total execution time.`;
  }
  /**
   * Generate agent definitions for SDK format
   */
  generateAgentDefinitions(plan) {
    const definitions = {};
    for (const suggestion of plan.suggestedAgents) {
      definitions[suggestion.agentId] = {
        id: suggestion.agentId,
        name: suggestion.role,
        description: `OPUS 67 ${suggestion.role} - ${suggestion.subtask}`,
        systemPrompt: this.generateSystemPrompt(suggestion),
        tools: this.getAgentTools(suggestion.agentId),
        model: "sonnet"
        // Default to sonnet for subagents
      };
    }
    return definitions;
  }
  /**
   * Generate system prompt for agent
   */
  generateSystemPrompt(suggestion) {
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
  getAgentTools(agentId) {
    const toolMap = {
      "backend-api-specialist": ["Read", "Write", "Edit", "Bash", "Grep"],
      "database-schema-oracle": ["Read", "Write", "Edit", "Bash"],
      "security-engineer": ["Read", "Grep", "Bash"],
      "frontend-fusion-engine": ["Read", "Write", "Edit", "Glob"],
      "test-automation-engineer": ["Read", "Write", "Edit", "Bash"],
      "typescript-precision-engineer": ["Read", "Write", "Edit", "Grep"]
    };
    return toolMap[agentId] || ["Read", "Write", "Edit"];
  }
  /**
   * Spawn multiple agents in parallel (async, non-blocking)
   */
  async spawnParallel(agents, task, executor) {
    const taskId = this.generateTaskId();
    this.activeJobs.set(taskId, []);
    this.emit("agents:spawning", agents);
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
        const failedResult = {
          agentId,
          output: "",
          success: false,
          duration: 0,
          tokens: 0
        };
        this.emit("agent:completed", agentId, failedResult);
        return failedResult;
      }
    });
    Promise.all(promises).then((results) => {
      const aggregated = this.aggregateResults(taskId, results);
      this.emit("orchestration:complete", aggregated);
    });
  }
  /**
   * Collect and aggregate results from multiple agents
   */
  async collectResults(taskId) {
    const results = this.activeJobs.get(taskId) || [];
    return this.aggregateResults(taskId, results);
  }
  /**
   * Aggregate results from multiple agents
   */
  aggregateResults(taskId, results) {
    const successful = results.filter((r) => r.success);
    const mergedOutput = successful.map((r) => `## ${r.agentId}
${r.output}`).join("\n\n---\n\n");
    return {
      taskId,
      success: successful.length > 0,
      results,
      mergedOutput,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      tokensUsed: results.reduce((sum, r) => sum + r.tokens, 0)
    };
  }
  /**
   * Generate unique task ID
   */
  generateTaskId() {
    this.taskCounter++;
    return `task_${Date.now()}_${this.taskCounter.toString().padStart(4, "0")}`;
  }
  /**
   * Get active job count
   */
  getActiveJobCount() {
    return this.activeJobs.size;
  }
  /**
   * Format orchestrator status
   */
  formatStatus() {
    return `
\u250C\u2500 SUBAGENT ORCHESTRATOR \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  Active Jobs: ${String(this.activeJobs.size).padEnd(5)}                                       \u2502
\u2502  Registered Agents: ${String(this.agentDefinitions.size).padEnd(5)}                               \u2502
\u2502  Tasks Processed: ${String(this.taskCounter).padEnd(5)}                                 \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
var subagentOrchestrator = new SubagentOrchestrator();
function createOrchestrator() {
  return new SubagentOrchestrator();
}

// src/modes/agent-mapping.ts
var MODE_AGENT_MAP = {
  // === CORE MODES ===
  auto: {
    autoSpawn: true,
    maxParallel: 3,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Intelligent agent selection based on task analysis"
  },
  ultra: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["fullstack-orchestrator", "code-reviewer"],
    agentSelector: "all-required",
    asyncExecution: false,
    // Sequential for deep thinking
    priority: 100,
    description: "Maximum reasoning with architect and reviewer agents"
  },
  think: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["performance-profiler"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 75,
    description: "Deep analysis with debugging specialist"
  },
  build: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["unit-test-generator"],
    optionalAgents: ["typescript-precision-engineer", "code-reviewer"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 60,
    description: "Production code with test writer"
  },
  vibe: {
    autoSpawn: false,
    maxParallel: 1,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 25,
    description: "Rapid iteration - minimal agent overhead"
  },
  light: {
    autoSpawn: false,
    maxParallel: 0,
    description: "Simple questions - no agents needed"
  },
  // === SPECIALIZED MODES ===
  creative: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["content-strategist", "accessibility-advocate"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Visual design with content expertise"
  },
  data: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["data-engineering-specialist"],
    optionalAgents: ["database-schema-oracle"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 60,
    description: "Analytics with data specialist"
  },
  audit: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["security-engineer", "code-reviewer"],
    optionalAgents: [
      "smart-contract-auditor",
      "penetration-testing-specialist"
    ],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 90,
    description: "Security review with auditor agents"
  },
  swarm: {
    autoSpawn: true,
    maxParallel: 5,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 100,
    description: "Multi-agent parallel execution for complex tasks"
  },
  secure: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["security-engineer", "penetration-testing-specialist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 95,
    description: "Security-focused with pentest agents"
  },
  test: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["unit-test-generator", "e2e-testing-specialist"],
    optionalAgents: ["qa-stress-tester"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 70,
    description: "Testing specialists for comprehensive coverage"
  },
  docs: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["technical-writer-pro"],
    optionalAgents: ["api-documentation-specialist", "readme-architect"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 40,
    description: "Documentation with writing experts"
  },
  refactor: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["code-reviewer"],
    optionalAgents: ["typescript-precision-engineer", "bundler-optimizer"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 60,
    description: "Code quality with review agents"
  },
  deploy: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["deployment-strategist"],
    optionalAgents: ["ci-cd-architect", "cloud-architect"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 85,
    description: "Deployment with DevOps agents"
  },
  debug: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["log-aggregation-expert", "monitoring-specialist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 80,
    description: "Debugging with diagnostic specialists"
  },
  review: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["code-reviewer"],
    optionalAgents: ["security-engineer"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 65,
    description: "Code review with quality agents"
  },
  plan: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["fullstack-orchestrator", "project-coordinator"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 55,
    description: "Planning with coordination agents"
  },
  research: {
    autoSpawn: true,
    maxParallel: 3,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 45,
    description: "Research with domain experts"
  },
  optimize: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["performance-profiler"],
    optionalAgents: ["bundler-optimizer", "gas-optimization-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 70,
    description: "Performance optimization specialists"
  },
  migrate: {
    autoSpawn: true,
    maxParallel: 3,
    optionalAgents: ["database-schema-oracle", "typescript-precision-engineer"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 80,
    description: "Migration with schema and type experts"
  },
  integrate: {
    autoSpawn: true,
    maxParallel: 3,
    optionalAgents: ["api-design-architect", "backend-api-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 65,
    description: "Integration with API specialists"
  },
  monitor: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["monitoring-specialist"],
    optionalAgents: ["log-aggregation-expert"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 60,
    description: "Observability with monitoring agents"
  },
  scale: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["cloud-architect", "performance-profiler"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 75,
    description: "Scaling with infrastructure experts"
  },
  learn: {
    autoSpawn: false,
    maxParallel: 1,
    optionalAgents: ["tutorial-creator"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 30,
    description: "Learning mode with tutorial support"
  },
  teach: {
    autoSpawn: true,
    maxParallel: 1,
    requiredAgents: ["tutorial-creator"],
    optionalAgents: ["code-example-generator"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 35,
    description: "Teaching with example generators"
  },
  explore: {
    autoSpawn: true,
    maxParallel: 2,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 40,
    description: "Exploration with discovery agents"
  },
  prototype: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["frontend-fusion-engine", "backend-api-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Rapid prototyping with full-stack agents"
  },
  release: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["changelog-generator", "deployment-strategist"],
    optionalAgents: ["ci-cd-architect"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 90,
    description: "Release management with versioning agents"
  },
  hotfix: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["deployment-strategist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 100,
    description: "Emergency fixes with rapid deployment"
  }
};
function getModeConfig(mode) {
  return MODE_AGENT_MAP[mode];
}
function getAutoSpawnModes() {
  return Object.keys(MODE_AGENT_MAP).filter(
    (mode) => MODE_AGENT_MAP[mode].autoSpawn
  );
}
function getModesByPriority(minPriority) {
  return Object.keys(MODE_AGENT_MAP).filter(
    (mode) => (MODE_AGENT_MAP[mode].priority || 0) >= minPriority
  );
}
function getAllMappedAgents() {
  const agents = /* @__PURE__ */ new Set();
  for (const config of Object.values(MODE_AGENT_MAP)) {
    for (const agent of config.requiredAgents || []) {
      agents.add(agent);
    }
    for (const agent of config.optionalAgents || []) {
      agents.add(agent);
    }
  }
  return Array.from(agents).sort();
}
function isAsyncMode(mode) {
  return MODE_AGENT_MAP[mode]?.asyncExecution ?? false;
}
var OPUS67AgentSDK = class extends EventEmitter {
  sessions = /* @__PURE__ */ new Map();
  messageQueues = /* @__PURE__ */ new Map();
  activeSession = null;
  sessionCounter = 0;
  constructor() {
    super();
  }
  /**
   * Convert OPUS 67 agent config to SDK format
   */
  toSDKDefinition(opus67Agent) {
    return {
      id: opus67Agent.agentId,
      name: opus67Agent.agentId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `OPUS 67 Agent: ${opus67Agent.agentId}`,
      systemPrompt: opus67Agent.systemPrompt || this.generateDefaultPrompt(opus67Agent),
      tools: opus67Agent.tools,
      model: opus67Agent.model || "sonnet",
      maxTokens: 8192
    };
  }
  /**
   * Generate default system prompt for agent
   */
  generateDefaultPrompt(config) {
    return `You are an OPUS 67 ${config.agentId} specialist agent.

Your task: ${config.task}

Guidelines:
- Focus on your domain expertise
- Provide concrete, actionable output
- Be concise but thorough
- Return structured results when possible`;
  }
  /**
   * Generate agent definitions for multiple agents
   */
  toSDKDefinitions(agents) {
    const definitions = {};
    for (const agent of agents) {
      definitions[agent.agentId] = this.toSDKDefinition(agent);
    }
    return definitions;
  }
  /**
   * Spawn agent using V2 interface - returns session for multi-turn
   */
  async spawn(agentId, prompt, options) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      agentId,
      status: "active",
      messages: [],
      startTime: Date.now()
    };
    this.sessions.set(sessionId, session);
    this.messageQueues.set(sessionId, []);
    this.activeSession = sessionId;
    const jobId = asyncAgentRunner.spawnBackground({
      agentId,
      task: prompt,
      model: options?.model || "sonnet",
      tools: options?.tools
    });
    this.streamToQueue(sessionId, jobId);
    this.emit("session:started", session);
    return session;
  }
  /**
   * Stream job results to session queue
   */
  async streamToQueue(sessionId, jobId) {
    try {
      for await (const message of asyncAgentRunner.streamResults(jobId)) {
        const queue = this.messageQueues.get(sessionId) || [];
        queue.push(message);
        this.messageQueues.set(sessionId, queue);
        const session = this.sessions.get(sessionId);
        if (session) {
          session.messages.push(message);
        }
        this.emit("message:received", sessionId, message);
        if (message.type === "done") {
          this.completeSession(sessionId, message);
          break;
        }
      }
    } catch (error) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = "failed";
      }
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
  /**
   * Complete a session
   */
  completeSession(sessionId, finalMessage) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.status = "completed";
    session.endTime = Date.now();
    const result = {
      sessionId,
      success: true,
      output: finalMessage.content,
      tokensUsed: finalMessage.metadata?.tokensUsed || 0,
      duration: session.endTime - session.startTime,
      messages: session.messages
    };
    this.emit("session:completed", result);
  }
  /**
   * Send a message to the active session (V2 pattern)
   */
  async send(message, sessionId) {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }
    const session = this.sessions.get(sid);
    if (!session || session.status !== "active") {
      throw new Error(`Session ${sid} is not active`);
    }
    const userMessage = {
      type: "text",
      content: message,
      timestamp: Date.now(),
      metadata: { role: "user" }
    };
    const queue = this.messageQueues.get(sid) || [];
    queue.push(userMessage);
    this.messageQueues.set(sid, queue);
    session.messages.push(userMessage);
  }
  /**
   * Receive messages from the session (V2 pattern)
   * Async generator that yields messages as they arrive
   */
  async *receive(sessionId) {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }
    let lastIndex = 0;
    const checkInterval = 50;
    while (true) {
      const queue = this.messageQueues.get(sid) || [];
      const session = this.sessions.get(sid);
      while (lastIndex < queue.length) {
        const message = queue[lastIndex];
        lastIndex++;
        yield message;
        if (message.type === "done") {
          return;
        }
      }
      if (!session || session.status !== "active") {
        return;
      }
      await this.sleep(checkInterval);
    }
  }
  /**
   * Signal completion and get final result (V2 pattern)
   */
  async done(sessionId) {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }
    const maxWait = 6e4;
    const startWait = Date.now();
    while (Date.now() - startWait < maxWait) {
      const session = this.sessions.get(sid);
      if (!session) {
        throw new Error(`Session ${sid} not found`);
      }
      if (session.status !== "active") {
        const queue = this.messageQueues.get(sid) || [];
        const lastMessage = queue[queue.length - 1];
        return {
          sessionId: sid,
          success: session.status === "completed",
          output: lastMessage?.content || "",
          tokensUsed: lastMessage?.metadata?.tokensUsed || 0,
          duration: (session.endTime || Date.now()) - session.startTime,
          messages: session.messages
        };
      }
      await this.sleep(100);
    }
    throw new Error(`Session ${sid} timed out`);
  }
  /**
   * Query pattern - single request/response (SDK v1 compatibility)
   */
  async query(agentId, prompt, options) {
    const session = await this.spawn(agentId, prompt, options);
    const result = await this.done(session.id);
    return result.output;
  }
  /**
   * Spawn multiple agents and coordinate results
   */
  async spawnMultiple(agents, options) {
    const parallel = options?.parallel ?? true;
    if (parallel) {
      const sessions = await Promise.all(
        agents.map((a) => this.spawn(a.agentId, a.task))
      );
      const results = await Promise.all(sessions.map((s) => this.done(s.id)));
      return results;
    } else {
      const results = [];
      for (const agent of agents) {
        const session = await this.spawn(agent.agentId, agent.task);
        const result = await this.done(session.id);
        results.push(result);
      }
      return results;
    }
  }
  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === "active"
    );
  }
  /**
   * Cancel a session
   */
  async cancel(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return false;
    }
    session.status = "failed";
    session.endTime = Date.now();
    if (this.activeSession === sessionId) {
      this.activeSession = null;
    }
    return true;
  }
  /**
   * Generate session ID
   */
  generateSessionId() {
    this.sessionCounter++;
    return `sdk_${Date.now()}_${this.sessionCounter.toString().padStart(4, "0")}`;
  }
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Format SDK status
   */
  formatStatus() {
    const active = this.getActiveSessions().length;
    const total = this.sessions.size;
    return `
\u250C\u2500 OPUS 67 SDK V2 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  Sessions: ${String(active).padEnd(3)} active / ${String(total).padEnd(3)} total                          \u2502
\u2502  Interface: send() / receive() / done()                          \u2502
\u2502  Compatibility: Claude Agent SDK V2                              \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
var opus67SDK = new OPUS67AgentSDK();
function createSDK() {
  return new OPUS67AgentSDK();
}

// src/mcp/spawn-agent-tool.ts
var SPAWN_AGENTS_TOOL = {
  name: "opus67_spawn_agents",
  description: `Spawn OPUS 67 subagents for parallel task execution.
Automatically detects relevant agents based on task or manually specify agent IDs.
Supports async (non-blocking) and sync execution modes.

Available agents include: backend-api-specialist, database-schema-oracle,
security-engineer, frontend-fusion-engine, test-automation-engineer,
smart-contract-auditor, typescript-precision-engineer, and 100+ more.`,
  inputSchema: {
    type: "object",
    properties: {
      agents: {
        type: "array",
        items: { type: "string" },
        description: "Agent IDs to spawn. If not provided, agents are auto-detected based on task."
      },
      task: {
        type: "string",
        description: "Task description for the agents to work on."
      },
      parallel: {
        type: "boolean",
        default: true,
        description: "Run agents in parallel (true) or sequential (false)."
      },
      async: {
        type: "boolean",
        default: true,
        description: "Non-blocking execution (true) returns immediately with job IDs."
      },
      mode: {
        type: "string",
        enum: [
          "auto",
          "ultra",
          "swarm",
          "build",
          "audit",
          "data",
          "test",
          "deploy"
        ],
        description: "Operating mode context for agent selection."
      },
      model: {
        type: "string",
        enum: ["sonnet", "opus", "haiku"],
        default: "sonnet",
        description: "Model to use for agents."
      },
      autoDetect: {
        type: "boolean",
        default: true,
        description: "Auto-detect relevant agents based on task content."
      },
      maxAgents: {
        type: "number",
        default: 5,
        description: "Maximum number of agents to spawn."
      },
      timeout: {
        type: "number",
        default: 6e4,
        description: "Timeout in milliseconds per agent."
      }
    },
    required: ["task"]
  }
};
var AGENT_STATUS_TOOL = {
  name: "opus67_agent_status",
  description: "Check the status of a running agent job.",
  inputSchema: {
    type: "object",
    properties: {
      jobId: {
        type: "string",
        description: "Job ID returned from opus67_spawn_agents."
      }
    },
    required: ["jobId"]
  }
};
var LIST_AGENTS_TOOL = {
  name: "opus67_list_agents",
  description: "List available OPUS 67 agents and their capabilities.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: [
          "all",
          "backend",
          "frontend",
          "security",
          "blockchain",
          "devops",
          "testing"
        ],
        default: "all",
        description: "Filter agents by category."
      },
      mode: {
        type: "string",
        description: "List agents recommended for a specific mode."
      }
    }
  }
};
async function handleSpawnAgents(input) {
  const startTime = Date.now();
  const {
    agents: specifiedAgents,
    task,
    parallel = true,
    async: asyncMode = true,
    mode = "auto",
    model = "sonnet",
    autoDetect = true,
    maxAgents = 5,
    timeout = 6e4
  } = input;
  try {
    let agentsToSpawn = specifiedAgents || [];
    if (agentsToSpawn.length === 0 && autoDetect) {
      const plan = await subagentOrchestrator.analyzeTask(task, mode);
      agentsToSpawn = plan.suggestedAgents.slice(0, maxAgents).map((a) => a.agentId);
      const modeConfig = MODE_AGENT_MAP[mode];
      if (modeConfig?.requiredAgents) {
        for (const required of modeConfig.requiredAgents) {
          if (!agentsToSpawn.includes(required)) {
            agentsToSpawn.push(required);
          }
        }
      }
    }
    if (agentsToSpawn.length === 0) {
      return {
        success: false,
        jobIds: [],
        message: "No agents matched the task. Please specify agents manually or modify the task description."
      };
    }
    agentsToSpawn = agentsToSpawn.slice(0, maxAgents);
    const jobIds = [];
    let results;
    if (asyncMode) {
      for (const agentId of agentsToSpawn) {
        const jobId = asyncAgentRunner.spawnBackground({
          agentId,
          task,
          model,
          timeout
        });
        jobIds.push(jobId);
      }
      return {
        success: true,
        jobIds,
        message: `Spawned ${jobIds.length} agents in background: ${agentsToSpawn.join(", ")}. Use opus67_agent_status to check progress.`,
        plan: await subagentOrchestrator.analyzeTask(task, mode)
      };
    } else {
      const agentTasks = agentsToSpawn.map((agentId) => ({
        agentId,
        task
      }));
      results = await opus67SDK.spawnMultiple(agentTasks, { parallel });
      return {
        success: results.every((r) => r.success),
        jobIds: results.map((r) => r.sessionId),
        results,
        message: `Completed ${results.length} agents: ${results.filter((r) => r.success).length} succeeded, ${results.filter((r) => !r.success).length} failed.`,
        duration: Date.now() - startTime
      };
    }
  } catch (error) {
    return {
      success: false,
      jobIds: [],
      message: `Error spawning agents: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
async function handleAgentStatus(input) {
  const { jobId } = input;
  const job = asyncAgentRunner.getJob(jobId);
  if (!job) {
    return {
      jobId,
      status: "not_found",
      progress: 0,
      error: `Job ${jobId} not found`
    };
  }
  return {
    jobId,
    status: job.status,
    progress: job.progress,
    output: job.output.join("\n"),
    error: job.error
  };
}
function handleListAgents(input) {
  const { category = "all", mode } = input;
  const agentRegistry = [
    // Backend
    {
      id: "backend-api-specialist",
      category: "backend",
      description: "REST/GraphQL API development"
    },
    {
      id: "database-schema-oracle",
      category: "backend",
      description: "Database design and optimization"
    },
    {
      id: "nodejs-api-architect",
      category: "backend",
      description: "Node.js backend patterns"
    },
    // Frontend
    {
      id: "frontend-fusion-engine",
      category: "frontend",
      description: "React/Next.js development"
    },
    {
      id: "typescript-precision-engineer",
      category: "frontend",
      description: "TypeScript type safety"
    },
    {
      id: "accessibility-advocate",
      category: "frontend",
      description: "WCAG compliance"
    },
    // Security
    {
      id: "security-engineer",
      category: "security",
      description: "Application security"
    },
    {
      id: "penetration-testing-specialist",
      category: "security",
      description: "Security testing"
    },
    {
      id: "smart-contract-auditor",
      category: "security",
      description: "Solidity auditing"
    },
    // Blockchain
    {
      id: "solana-guardian-auditor",
      category: "blockchain",
      description: "Solana program security"
    },
    {
      id: "evm-security-auditor",
      category: "blockchain",
      description: "EVM contract security"
    },
    {
      id: "defi-integration-architect",
      category: "blockchain",
      description: "DeFi protocols"
    },
    // DevOps
    {
      id: "deployment-strategist",
      category: "devops",
      description: "CI/CD and deployment"
    },
    { id: "cloud-architect", category: "devops", description: "AWS/GCP/Azure" },
    {
      id: "ci-cd-architect",
      category: "devops",
      description: "GitHub Actions pipelines"
    },
    // Testing
    {
      id: "unit-test-generator",
      category: "testing",
      description: "Unit test creation"
    },
    {
      id: "e2e-testing-specialist",
      category: "testing",
      description: "End-to-end testing"
    },
    {
      id: "qa-stress-tester",
      category: "testing",
      description: "Load and stress testing"
    },
    // More agents...
    {
      id: "code-reviewer",
      category: "backend",
      description: "Code review and quality"
    },
    {
      id: "debugging-detective",
      category: "backend",
      description: "Bug investigation"
    },
    {
      id: "performance-profiler",
      category: "devops",
      description: "Performance optimization"
    }
  ];
  let filtered = agentRegistry;
  if (category !== "all") {
    filtered = filtered.filter((a) => a.category === category);
  }
  if (mode) {
    const modeConfig = MODE_AGENT_MAP[mode];
    if (modeConfig) {
      const modeAgents = [
        ...modeConfig.requiredAgents || [],
        ...modeConfig.optionalAgents || []
      ];
      if (modeAgents.length > 0) {
        filtered = filtered.filter((a) => modeAgents.includes(a.id));
      }
    }
  }
  return {
    agents: filtered,
    count: filtered.length
  };
}
function registerSpawnTools(server) {
  server.setRequestHandler("tools/list", async () => ({
    tools: [SPAWN_AGENTS_TOOL, AGENT_STATUS_TOOL, LIST_AGENTS_TOOL]
  }));
  server.setRequestHandler(
    "tools/call",
    async (request) => {
      const { name, arguments: args } = request.params;
      switch (name) {
        case "opus67_spawn_agents":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await handleSpawnAgents(args),
                  null,
                  2
                )
              }
            ]
          };
        case "opus67_agent_status":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await handleAgentStatus(args),
                  null,
                  2
                )
              }
            ]
          };
        case "opus67_list_agents":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  handleListAgents(
                    args
                  ),
                  null,
                  2
                )
              }
            ]
          };
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }
  );
}
var spawnTools = {
  SPAWN_AGENTS_TOOL,
  AGENT_STATUS_TOOL,
  LIST_AGENTS_TOOL,
  handleSpawnAgents,
  handleAgentStatus,
  handleListAgents,
  registerSpawnTools
};

// src/agents/skills-navigator.ts
var DEFAULT_CONFIG = {
  autoActivateThreshold: 0.7,
  maxAutoSkills: 3,
  trackUsage: true,
  suggestCombinations: true,
  vectorEnabled: true,
  topK: 5,
  minScore: 0.3
};
var SKILL_COMBINATIONS = [
  {
    id: "solana-dapp",
    name: "Solana DApp Stack",
    skills: ["solana-anchor-expert", "nextjs-14-expert", "wallet-integration"],
    description: "Full Solana dApp development",
    useCase: "Build decentralized applications on Solana",
    confidence: 0.9
  },
  {
    id: "ai-chatbot",
    name: "AI Chatbot Stack",
    skills: ["ai-native-stack", "nextjs-14-expert", "api-integration"],
    description: "AI-powered chatbot with streaming",
    useCase: "Build conversational AI applications",
    confidence: 0.9
  },
  {
    id: "saas-starter",
    name: "SaaS Starter Stack",
    skills: ["fullstack-blueprint-stack", "supabase-expert", "stripe-payments"],
    description: "Full SaaS application with payments",
    useCase: "Build subscription-based web apps",
    confidence: 0.85
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline Stack",
    skills: ["sql-database", "api-integration", "typescript-senior"],
    description: "ETL and data processing",
    useCase: "Build data ingestion and transformation pipelines",
    confidence: 0.8
  },
  {
    id: "defi-trading",
    name: "DeFi Trading Stack",
    skills: ["bonding-curve-master", "defi-data-analyst", "solana-anchor-expert"],
    description: "DeFi trading and analytics",
    useCase: "Build trading bots and analytics dashboards",
    confidence: 0.85
  },
  {
    id: "nft-marketplace",
    name: "NFT Marketplace Stack",
    skills: ["metaplex-core", "nextjs-14-expert", "wallet-integration"],
    description: "NFT minting and marketplace",
    useCase: "Build NFT collections and marketplaces",
    confidence: 0.85
  }
];
var SkillsNavigatorAgent = class {
  config;
  usageHistory = [];
  activatedSkills = /* @__PURE__ */ new Set();
  skillUsageStats = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Find skills matching a task query
   */
  async findSkillsForTask(query, topK) {
    const search = getSkillSearch();
    const k = topK || this.config.topK;
    try {
      const results = await search.searchSkills(query, k);
      return results.filter((r) => r.score >= this.config.minScore);
    } catch (error) {
      console.error("[SkillsNavigator] Search failed:", error);
      return [];
    }
  }
  /**
   * Auto-activate skills for a task
   */
  async autoActivate(task) {
    const results = await this.findSkillsForTask(task, this.config.maxAutoSkills * 2);
    const activations = [];
    let activated = 0;
    for (const result of results) {
      const shouldActivate = result.score >= this.config.autoActivateThreshold && activated < this.config.maxAutoSkills && !this.activatedSkills.has(result.skillId);
      activations.push({
        skillId: result.skillId,
        name: result.name,
        score: result.score,
        activated: shouldActivate,
        reason: shouldActivate ? `Score ${(result.score * 100).toFixed(0)}% >= threshold` : result.score < this.config.autoActivateThreshold ? `Score ${(result.score * 100).toFixed(0)}% < threshold` : this.activatedSkills.has(result.skillId) ? "Already activated" : `Max skills (${this.config.maxAutoSkills}) reached`
      });
      if (shouldActivate) {
        this.activatedSkills.add(result.skillId);
        activated++;
        if (this.config.trackUsage) {
          this.recordUsage(result.skillId, this.classifyTask(task));
        }
      }
    }
    return activations;
  }
  /**
   * Suggest skill combinations for complex tasks
   */
  async suggestCombinations(skillIds) {
    if (!this.config.suggestCombinations) {
      return [];
    }
    const suggestions = [];
    const skillSet = new Set(skillIds);
    for (const combo of SKILL_COMBINATIONS) {
      const matchCount = combo.skills.filter((s) => skillSet.has(s)).length;
      const coverage = matchCount / combo.skills.length;
      if (coverage >= 0.3) {
        suggestions.push({
          ...combo,
          confidence: coverage * combo.confidence
        });
      }
    }
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 3);
  }
  /**
   * Get recommended skills based on usage patterns
   */
  async getRecommendations(taskType) {
    const sortedSkills = Array.from(this.skillUsageStats.entries()).map(([skillId, stats]) => ({
      skillId,
      successRate: stats.successes / stats.uses,
      uses: stats.uses
    })).filter((s) => s.uses >= 3).sort((a, b) => b.successRate - a.successRate).slice(0, 5);
    const search = getSkillSearch();
    const recommendations = [];
    for (const skill of sortedSkills) {
      const result = await search.getSkillById(skill.skillId);
      if (result) {
        recommendations.push({
          ...result,
          score: skill.successRate
        });
      }
    }
    return recommendations;
  }
  /**
   * Classify a task into a category
   */
  classifyTask(task) {
    const lower = task.toLowerCase();
    if (lower.includes("solana") || lower.includes("anchor") || lower.includes("blockchain")) {
      return "blockchain";
    }
    if (lower.includes("api") || lower.includes("backend") || lower.includes("server")) {
      return "backend";
    }
    if (lower.includes("react") || lower.includes("next") || lower.includes("frontend") || lower.includes("ui")) {
      return "frontend";
    }
    if (lower.includes("database") || lower.includes("sql") || lower.includes("data")) {
      return "data";
    }
    if (lower.includes("ai") || lower.includes("llm") || lower.includes("chat") || lower.includes("agent")) {
      return "ai";
    }
    if (lower.includes("test") || lower.includes("e2e") || lower.includes("unit")) {
      return "testing";
    }
    if (lower.includes("deploy") || lower.includes("devops") || lower.includes("ci")) {
      return "devops";
    }
    return "general";
  }
  /**
   * Record skill usage
   */
  recordUsage(skillId, taskType) {
    this.usageHistory.push({
      skillId,
      taskType,
      timestamp: Date.now()
    });
    if (this.usageHistory.length > 1e3) {
      this.usageHistory = this.usageHistory.slice(-1e3);
    }
  }
  /**
   * Mark a skill usage as successful or failed
   */
  markUsageResult(skillId, success) {
    const stats = this.skillUsageStats.get(skillId) || { uses: 0, successes: 0 };
    stats.uses++;
    if (success) {
      stats.successes++;
    }
    this.skillUsageStats.set(skillId, stats);
    const observer = getLearningObserver();
    if (success) {
      observer.recordSuccess(skillId);
    }
  }
  /**
   * Get currently activated skills
   */
  getActivatedSkills() {
    return Array.from(this.activatedSkills);
  }
  /**
   * Deactivate a skill
   */
  deactivateSkill(skillId) {
    return this.activatedSkills.delete(skillId);
  }
  /**
   * Clear all activated skills
   */
  clearActivatedSkills() {
    this.activatedSkills.clear();
  }
  /**
   * Get usage statistics
   */
  getUsageStats() {
    const taskTypes = {};
    for (const record of this.usageHistory) {
      taskTypes[record.taskType] = (taskTypes[record.taskType] || 0) + 1;
    }
    const topSkills = Array.from(this.skillUsageStats.entries()).map(([skillId, stats]) => ({
      skillId,
      uses: stats.uses,
      successRate: stats.uses > 0 ? stats.successes / stats.uses : 0
    })).sort((a, b) => b.uses - a.uses).slice(0, 10);
    return {
      totalUsages: this.usageHistory.length,
      uniqueSkills: new Set(this.usageHistory.map((r) => r.skillId)).size,
      topSkills,
      taskTypeDistribution: taskTypes
    };
  }
  /**
   * Get agent statistics
   */
  getStats() {
    return {
      activatedSkills: this.activatedSkills.size,
      usageHistory: this.usageHistory.length,
      trackedSkills: this.skillUsageStats.size,
      config: this.config
    };
  }
};
var instance = null;
function getSkillsNavigator() {
  if (!instance) {
    instance = new SkillsNavigatorAgent();
  }
  return instance;
}
function resetSkillsNavigator() {
  instance = null;
}
var PRIORITY_VALUES = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
  background: 0
};
var AgentJobQueue = class extends EventEmitter {
  queue = [];
  processing = /* @__PURE__ */ new Set();
  completed = /* @__PURE__ */ new Set();
  maxSize;
  jobCounter = 0;
  constructor(options) {
    super();
    this.maxSize = options?.maxSize ?? 1e3;
  }
  /**
   * Add a job to the queue
   */
  add(config, options) {
    if (this.queue.length >= this.maxSize) {
      this.emit("queue:full", this.maxSize);
      throw new Error(`Queue full (max ${this.maxSize})`);
    }
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      config,
      priority: options?.priority ?? "normal",
      executionMode: options?.executionMode ?? "immediate",
      createdAt: Date.now(),
      scheduledFor: options?.scheduledFor,
      dependencies: options?.dependencies ?? [],
      tags: options?.tags ?? []
    };
    this.queue.push(job);
    this.sortQueue();
    this.emit("job:added", job);
    return jobId;
  }
  /**
   * Add multiple jobs at once
   */
  addBatch(jobs) {
    return jobs.map(
      (j) => this.add(j.config, {
        priority: j.priority,
        executionMode: j.executionMode
      })
    );
  }
  /**
   * Get the next job to process (respects priority and dependencies)
   */
  next() {
    const now = Date.now();
    for (let i = 0; i < this.queue.length; i++) {
      const job = this.queue[i];
      if (job.scheduledFor && job.scheduledFor > now) continue;
      if (!this.areDependenciesMet(job)) continue;
      if (this.processing.has(job.id)) continue;
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
  peek() {
    return this.queue[0] || null;
  }
  /**
   * Check if dependencies are met
   */
  areDependenciesMet(job) {
    return job.dependencies.every((depId) => this.completed.has(depId));
  }
  /**
   * Mark a job as completed
   */
  complete(jobId) {
    this.processing.delete(jobId);
    this.completed.add(jobId);
  }
  /**
   * Mark a job as failed (re-queue or discard)
   */
  fail(jobId, requeue = false) {
    this.processing.delete(jobId);
    if (requeue) {
      const job = this.getJob(jobId);
      if (job) {
        this.add(job.config, {
          priority: this.demotePriority(job.priority),
          executionMode: job.executionMode
        });
      }
    }
  }
  /**
   * Remove a job from the queue
   */
  remove(jobId) {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index === -1) return false;
    this.queue.splice(index, 1);
    this.emit("job:removed", jobId);
    return true;
  }
  /**
   * Promote a job's priority
   */
  promote(jobId, newPriority) {
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
  getJob(jobId) {
    return this.queue.find((j) => j.id === jobId) || null;
  }
  /**
   * Get jobs by tag
   */
  getByTag(tag) {
    return this.queue.filter((j) => j.tags.includes(tag));
  }
  /**
   * Get jobs by priority
   */
  getByPriority(priority) {
    return this.queue.filter((j) => j.priority === priority);
  }
  /**
   * Get all immediate jobs
   */
  getImmediate() {
    return this.queue.filter((j) => j.executionMode === "immediate");
  }
  /**
   * Get all background jobs
   */
  getBackground() {
    return this.queue.filter((j) => j.executionMode === "background");
  }
  /**
   * Get all deferred jobs
   */
  getDeferred() {
    return this.queue.filter((j) => j.executionMode === "deferred");
  }
  /**
   * Get queue statistics
   */
  getStats() {
    const byPriority = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
      background: 0
    };
    const byMode = {
      immediate: 0,
      background: 0,
      deferred: 0
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
      processing: this.processing.size
    };
  }
  /**
   * Get queue length
   */
  get length() {
    return this.queue.length;
  }
  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.queue.length === 0;
  }
  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    this.processing.clear();
    this.emit("queue:empty");
  }
  /**
   * Sort queue by priority and creation time
   */
  sortQueue() {
    this.queue.sort((a, b) => {
      const priorityDiff = PRIORITY_VALUES[b.priority] - PRIORITY_VALUES[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });
  }
  /**
   * Demote priority by one level
   */
  demotePriority(priority) {
    const order = [
      "critical",
      "high",
      "normal",
      "low",
      "background"
    ];
    const index = order.indexOf(priority);
    return order[Math.min(index + 1, order.length - 1)];
  }
  /**
   * Generate unique job ID
   */
  generateJobId() {
    this.jobCounter++;
    return `qjob_${Date.now()}_${this.jobCounter.toString().padStart(4, "0")}`;
  }
  /**
   * Format queue status
   */
  formatStatus() {
    const stats = this.getStats();
    return `
\u250C\u2500 AGENT JOB QUEUE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  QUEUE STATUS                                                    \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Total: ${String(stats.total).padEnd(6)} Processing: ${String(stats.processing).padEnd(6)}                    \u2502
\u2502                                                                  \u2502
\u2502  BY PRIORITY                                                     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Critical: ${String(stats.byPriority.critical).padEnd(4)} High: ${String(stats.byPriority.high).padEnd(4)} Normal: ${String(stats.byPriority.normal).padEnd(4)}          \u2502
\u2502  Low: ${String(stats.byPriority.low).padEnd(4)} Background: ${String(stats.byPriority.background).padEnd(4)}                          \u2502
\u2502                                                                  \u2502
\u2502  BY EXECUTION MODE                                               \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Immediate: ${String(stats.byMode.immediate).padEnd(4)} Background: ${String(stats.byMode.background).padEnd(4)} Deferred: ${String(stats.byMode.deferred).padEnd(4)} \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
var agentJobQueue = new AgentJobQueue();
function createJobQueue(options) {
  return new AgentJobQueue(options);
}

// src/hooks/subagent-auto-trigger.ts
var TRIGGER_THRESHOLDS = {
  minMatchScore: 0.5,
  // Minimum skill match score to trigger
  minComplexity: "moderate",
  // Minimum complexity for auto-spawning
  maxConcurrentAgents: 5,
  // Max agents to spawn at once
  cooldownMs: 3e4
  // Cooldown between auto-triggers
};
var lastTriggerTimes = /* @__PURE__ */ new Map();
async function evaluateTrigger(context) {
  const { prompt, mode, files } = context;
  const modeConfig = MODE_AGENT_MAP[mode];
  if (!modeConfig || !modeConfig.autoSpawn) {
    return {
      mode,
      skillMatches: [],
      taskType: "general",
      suggestedAgents: [],
      shouldSpawn: false,
      reason: "Mode does not support auto-spawning"
    };
  }
  const plan = await subagentOrchestrator.analyzeTask(prompt, mode);
  if (plan.complexity === "simple" && TRIGGER_THRESHOLDS.minComplexity !== "simple") {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: plan.suggestedAgents,
      shouldSpawn: false,
      reason: "Task complexity below threshold"
    };
  }
  if (plan.suggestedAgents.length === 0) {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: [],
      shouldSpawn: false,
      reason: "No matching agents found"
    };
  }
  const lastTrigger = lastTriggerTimes.get(mode) || 0;
  if (Date.now() - lastTrigger < TRIGGER_THRESHOLDS.cooldownMs) {
    return {
      mode,
      skillMatches: [],
      taskType: plan.complexity,
      suggestedAgents: plan.suggestedAgents,
      shouldSpawn: false,
      reason: "Cooldown active"
    };
  }
  const limitedAgents = plan.suggestedAgents.slice(
    0,
    modeConfig.maxParallel || TRIGGER_THRESHOLDS.maxConcurrentAgents
  );
  if (modeConfig.requiredAgents) {
    for (const agentId of modeConfig.requiredAgents) {
      if (!limitedAgents.find((a) => a.agentId === agentId)) {
        limitedAgents.push({
          agentId,
          role: agentId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          priority: 100,
          subtask: "Required for mode",
          dependencies: [],
          estimatedTokens: 5e3
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
    reason: plan.reasoning
  };
}
async function executeTrigger(config, prompt) {
  if (!config.shouldSpawn) {
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: config.reason
    };
  }
  lastTriggerTimes.set(config.mode, Date.now());
  const modeConfig = MODE_AGENT_MAP[config.mode];
  const useAsync = modeConfig?.asyncExecution ?? true;
  const jobIds = [];
  for (const agent of config.suggestedAgents) {
    const priority = agent.priority >= 75 ? "high" : agent.priority >= 50 ? "normal" : "low";
    if (useAsync) {
      const jobId = asyncAgentRunner.spawnBackground({
        agentId: agent.agentId,
        task: `${agent.subtask}

Context: ${prompt}`,
        model: "sonnet",
        priority: agent.priority,
        timeout: 6e4
      });
      jobIds.push(jobId);
    } else {
      const jobId = agentJobQueue.add(
        {
          agentId: agent.agentId,
          task: `${agent.subtask}

Context: ${prompt}`,
          model: "sonnet",
          priority: agent.priority
        },
        {
          priority,
          executionMode: "immediate"
        }
      );
      jobIds.push(jobId);
    }
  }
  const plan = await subagentOrchestrator.analyzeTask(prompt, config.mode);
  return {
    triggered: true,
    jobIds,
    plan,
    reason: `Spawned ${jobIds.length} agents: ${config.skillMatches.join(", ")}`
  };
}
async function onTaskDetected(context) {
  try {
    const config = await evaluateTrigger(context);
    return executeTrigger(config, context.prompt);
  } catch (error) {
    console.error("[SubagentAutoTrigger] Error:", error);
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
async function onModeSwitch(newMode, prompt, previousMode) {
  const context = {
    prompt,
    mode: newMode
  };
  const alwaysTriggerModes = ["swarm", "audit"];
  if (alwaysTriggerModes.includes(newMode)) {
    const config = await evaluateTrigger(context);
    if (config.suggestedAgents.length > 0) {
      config.shouldSpawn = true;
      config.reason = `Mode ${newMode} always triggers agents`;
    }
    return executeTrigger(config, prompt);
  }
  return onTaskDetected(context);
}
async function onHighScoreSkillMatch(skillId, score, prompt, mode) {
  if (score < TRIGGER_THRESHOLDS.minMatchScore) {
    return {
      triggered: false,
      jobIds: [],
      plan: null,
      reason: `Score ${score} below threshold ${TRIGGER_THRESHOLDS.minMatchScore}`
    };
  }
  const skillAgentMap = {
    "solana-anchor-expert": ["solana-guardian-auditor", "icm-anchor-architect"],
    "react-typescript-master": [
      "frontend-fusion-engine",
      "typescript-precision-engineer"
    ],
    "smart-contract-auditor": [
      "evm-security-auditor",
      "smart-contract-forensics"
    ],
    "nextjs-14-expert": ["frontend-fusion-engine", "deployment-strategist"],
    "nodejs-api-architect": [
      "backend-api-specialist",
      "database-schema-oracle"
    ]
  };
  const relatedAgents = skillAgentMap[skillId] || [];
  if (relatedAgents.length === 0) {
    return onTaskDetected({ prompt, mode });
  }
  const jobIds = [];
  for (const agentId of relatedAgents) {
    const jobId = asyncAgentRunner.spawnBackground({
      agentId,
      task: prompt,
      model: "sonnet",
      priority: Math.round(score * 100)
    });
    jobIds.push(jobId);
  }
  return {
    triggered: true,
    jobIds,
    plan: await subagentOrchestrator.analyzeTask(prompt, mode),
    reason: `High-score skill match (${score}) triggered ${relatedAgents.length} agents`
  };
}

// src/index.ts
var perfLogPath = join(process.cwd(), ".gicm", "opus67-perf.log");
function ensureLogDir() {
  const dir = join(process.cwd(), ".gicm");
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch {
    }
  }
}
function perfLog(event, data) {
  ensureLogDir();
  const entry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    event,
    runtime: "opus67",
    ...data
  };
  console.log(`[OPUS67] ${event}:`, JSON.stringify(data));
  try {
    appendFileSync(perfLogPath, JSON.stringify(entry) + "\n");
  } catch {
  }
}
function withTiming(name, fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  perfLog(name, { durationMs: Math.round(duration * 100) / 100 });
  return result;
}
var Opus67 = class {
  config;
  currentMode;
  constructor(config = {}) {
    this.config = {
      tokenBudget: config.tokenBudget ?? 5e4,
      maxSkills: config.maxSkills ?? 5,
      autoConnectMcps: config.autoConnectMcps ?? true,
      defaultMode: config.defaultMode ?? "auto",
      showBootScreen: config.showBootScreen ?? true
    };
    this.currentMode = this.config.defaultMode;
  }
  /**
   * Boot OPUS 67 and return boot screen
   */
  boot() {
    const start = performance.now();
    const result = generateBootScreen({ defaultMode: this.currentMode });
    const bootTime = performance.now() - start;
    perfLog("boot", {
      durationMs: Math.round(bootTime * 100) / 100,
      mode: this.currentMode,
      config: this.config
    });
    return result;
  }
  /**
   * Process a query with automatic mode detection
   */
  process(query, context) {
    const startTotal = performance.now();
    const startDetect = performance.now();
    const detection = detectMode({
      query,
      ...context,
      userPreference: this.currentMode !== "auto" ? this.currentMode : void 0
    });
    const detectTime = performance.now() - startDetect;
    const modeConfig = getMode(detection.mode);
    const startSkills = performance.now();
    const skills = loadSkills({
      query,
      activeFiles: context?.activeFiles
    });
    const skillsTime = performance.now() - startSkills;
    modeConfig.skills_priority || [];
    const startMcps = performance.now();
    let mcpConnections = [];
    if (this.config.autoConnectMcps) {
      const skillIds = skills.skills.map((s) => s.id);
      mcpConnections = getConnectionsForSkills(skillIds);
    }
    const mcpsTime = performance.now() - startMcps;
    const prompt = this.generatePrompt(detection, skills, mcpConnections);
    const totalTime = performance.now() - startTotal;
    perfLog("process", {
      totalMs: Math.round(totalTime * 100) / 100,
      detectMs: Math.round(detectTime * 100) / 100,
      skillsMs: Math.round(skillsTime * 100) / 100,
      mcpsMs: Math.round(mcpsTime * 100) / 100,
      mode: detection.mode,
      confidence: detection.confidence,
      complexity: detection.complexity_score,
      skillsLoaded: skills.skills.length,
      mcpsConnected: mcpConnections.length
    });
    return {
      mode: detection.mode,
      modeConfig,
      skills,
      mcpConnections,
      prompt,
      bootScreen: this.config.showBootScreen ? this.boot() : void 0
    };
  }
  /**
   * Set mode manually
   */
  setMode(mode) {
    this.currentMode = mode;
    modeSelector.setMode(mode);
  }
  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }
  /**
   * Generate context prompt
   */
  generatePrompt(detection, skills, mcps) {
    const modeConfig = getMode(detection.mode);
    return `
<!-- OPUS 67 SESSION -->
Mode: ${modeConfig.icon} ${detection.mode.toUpperCase()} (${(detection.confidence * 100).toFixed(0)}% confidence)
Complexity: ${detection.complexity_score}/10
Token Budget: ${modeConfig.token_budget}
Thinking: ${modeConfig.thinking_depth}
Sub-agents: ${modeConfig.sub_agents.enabled ? `Up to ${modeConfig.sub_agents.max_agents}` : "Disabled"}

Skills Loaded: ${skills.skills.map((s) => s.id).join(", ")}
MCPs Available: ${mcps.map((m) => m.id).join(", ")}

Detected by: ${detection.reasons.join("; ")}
<!-- /OPUS 67 SESSION -->

${formatSkillsForPrompt(skills)}

${formatConnectionsForPrompt(mcps)}
`.trim();
  }
  /**
   * Get mode status line
   */
  getStatusLine() {
    return generateInlineStatus(this.currentMode);
  }
};
var opus67 = new Opus67();
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  console.log(opus67.boot());
  console.log("\n--- Processing test query ---\n");
  const session = opus67.process("design the entire system architecture");
  console.log(`Mode: ${session.mode}`);
  console.log(`Confidence: ${session.modeConfig.description}`);
  console.log(`Skills: ${session.skills.skills.map((s) => s.id).join(", ")}`);
}

export { AGENT_STATUS_TOOL, AgentJobQueue, AsyncAgentRunner, LIST_AGENTS_TOOL, MODE_AGENT_MAP, OPUS67AgentSDK, Opus67, SPAWN_AGENTS_TOOL, SkillsNavigatorAgent, SubagentOrchestrator, TRIGGER_THRESHOLDS, agentJobQueue, asyncAgentRunner, createAsyncRunner, createJobQueue, createOrchestrator, createSDK, evaluateTrigger, executeTrigger, getAllMappedAgents, getAutoSpawnModes, getModeConfig, getModesByPriority, getSkillsNavigator, handleAgentStatus, handleListAgents, handleMultiHopQuery, handleQueryMemory, handleSpawnAgents, handleWriteMemory, isAsyncMode, memoryToolDefinitions, memoryTools, onHighScoreSkillMatch, onModeSwitch, onTaskDetected, opus67, opus67SDK, perfLog, registerSpawnTools, resetSkillsNavigator, spawnTools, subagentOrchestrator, withTiming };
