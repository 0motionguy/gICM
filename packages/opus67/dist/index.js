export { BrainAPI, BrainRuntime, CodeImprover, ComparisonRunner, ContextEnhancer, CostTracker, DEFAULT_LEVELS, EvolutionLoop, LLMCouncil, MODELS, MultiModelRouter, PatternDetector, SYNTHESIS_PROMPTS, StressTest, aggregateRankings, brainAPI, brainRuntime, codeImprover, comparisonRunner, contextEnhancer, costTracker, council, createBrainAPI, createBrainRuntime, createBrainServer, createCodeImprover, createComparisonRunner, createContextEnhancer, createCouncil, createEvolutionLoop, createPatternDetector, createStressTest, enhancePrompt, evolutionLoop, formatModelList, formatSynthesis, generateRankingReport, generateSynthesisPrompt, getAvailableModels, getContextFor, getModelConfig, getModelsForProvider, getModelsForTier, hasApiKey, parseRankingText, parseSynthesisResponse, patternDetector, routeToModel, router, runComparisonCLI, runStressTestCLI, startBrainServer, stressTest, validateEnv } from './chunk-KNERRYPO.js';
export { AgentSpawner, GraphitiMemory, LatencyProfiler, MODEL_COSTS, MetricsCollector, TokenTracker, agentSpawner, createMemory, createSpawner, latencyProfiler, memory, metricsCollector, timed, tokenTracker } from './chunk-L2REBJ7Q.js';
import { getSkillSearch } from './chunk-JSMRUXZR.js';
export { CapabilityMatrix, ConfidenceScorer, KnowledgeStore, MCPValidator, SQLiteStore, SimilaritySearch, SkillMetadataLoader, SkillSearch, SynergyGraph, TFIDFVectorizer, canDo, findBestSkills, findSimilarSkills, getCapabilityMatrix, getConfidenceScorer, getIntelligenceStats, getKnowledgeStore, getMCPValidator, getSQLiteStore, getSimilaritySearch, getSkillMetadataLoader, getSkillSearch, getSynergy, getSynergyGraph, initIntelligence, lookupSkill, preFlightCheck, resetCapabilityMatrix, resetConfidenceScorer, resetKnowledgeStore, resetMCPValidator, resetSQLiteStore, resetSimilaritySearch, resetSkillMetadataLoader, resetSkillSearch, resetSynergyGraph, scoreConfidence, validateMCP } from './chunk-JSMRUXZR.js';
export { CloudSync, getCloudSync, resetCloudSync } from './chunk-2C2XO4QK.js';
import { getLearningObserver } from './chunk-KUOFDOUY.js';
export { LearningLoop, LearningObserverAgent, getLearningLoop, getLearningObserver, resetLearningLoop, resetLearningObserver } from './chunk-KUOFDOUY.js';
export { AutonomyLogger, autonomyLogger } from './chunk-JJWKCL7R.js';
import { generateBootScreen, generateInlineStatus } from './chunk-KRJAO3QU.js';
export { generateAgentSpawnNotification, generateBootScreen, generateHelpScreen, generateInlineStatus, generateModeSwitchNotification, generateStatusLine } from './chunk-KRJAO3QU.js';
export { AutonomyEngine, ContextIndexer, MCPHub, SkillLoader, loader_default as SkillLoaderDefault } from './chunk-F3FXQMHP.js';
import { getConnectionsForSkills, formatConnectionsForPrompt } from './chunk-WHBX6V2T.js';
export { formatConnectionsForPrompt, generateConnectionCode, getAllConnections, getConnectionsForKeywords, getConnectionsForSkills } from './chunk-WHBX6V2T.js';
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

export { Opus67, SkillsNavigatorAgent, getSkillsNavigator, opus67, perfLog, resetSkillsNavigator, withTiming };
