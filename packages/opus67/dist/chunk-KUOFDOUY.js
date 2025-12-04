import * as fs from 'fs';
import * as path from 'path';

// src/intelligence/learning-loop.ts

// src/agents/learning-observer.ts
var DEFAULT_CONFIG = {
  acontextUrl: process.env.ACONTEXT_API_URL || "http://localhost:8029/api/v1",
  acontextApiKey: process.env.ACONTEXT_API_KEY,
  minComplexity: "medium",
  minToolChainLength: 3,
  autoSopThreshold: 0.8,
  batchSize: 10,
  syncIntervalMs: 5 * 60 * 1e3
  // 5 minutes
};
var LearningObserverAgent = class {
  config;
  pendingTasks = [];
  successMetrics = /* @__PURE__ */ new Map();
  generatedSOPs = /* @__PURE__ */ new Map();
  syncTimer = null;
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Start the learning observer
   */
  start() {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(
      () => this.syncToAContext(),
      this.config.syncIntervalMs
    );
    console.log("[LearningObserver] Started with sync interval:", this.config.syncIntervalMs);
  }
  /**
   * Stop the learning observer
   */
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
  /**
   * Observe a task completion
   */
  async observeCompletion(context) {
    if (!this.isComplexEnough(context)) {
      return;
    }
    for (const skillId of context.skillsUsed) {
      this.updateSuccessMetric(skillId, context.success, context.endTime - context.startTime);
    }
    if (context.success && context.toolChain.length >= this.config.minToolChainLength) {
      this.pendingTasks.push(context);
      if (this.pendingTasks.length >= this.config.batchSize) {
        await this.processPendingTasks();
      }
    }
  }
  /**
   * Check if task is complex enough to learn from
   */
  isComplexEnough(context) {
    const complexity = this.calculateComplexity(context);
    switch (this.config.minComplexity) {
      case "low":
        return complexity >= 1;
      case "medium":
        return complexity >= 3;
      case "high":
        return complexity >= 5;
      default:
        return complexity >= 3;
    }
  }
  /**
   * Calculate task complexity score
   */
  calculateComplexity(context) {
    let score = 0;
    score += context.toolChain.length * 0.5;
    score += context.skillsUsed.length;
    const durationMins = (context.endTime - context.startTime) / 6e4;
    if (durationMins > 1) score += 1;
    if (durationMins > 5) score += 1;
    if (context.query.length > 100) score += 1;
    return score;
  }
  /**
   * Update success metrics for a skill
   */
  updateSuccessMetric(skillId, success, duration) {
    const existing = this.successMetrics.get(skillId) || {
      skillId,
      totalUses: 0,
      successes: 0,
      failures: 0,
      avgDuration: 0,
      lastUsed: Date.now()
    };
    existing.totalUses++;
    if (success) {
      existing.successes++;
    } else {
      existing.failures++;
    }
    existing.avgDuration = (existing.avgDuration * (existing.totalUses - 1) + duration) / existing.totalUses;
    existing.lastUsed = Date.now();
    this.successMetrics.set(skillId, existing);
  }
  /**
   * Extract SOP from a task context
   */
  async extractSOP(context) {
    if (context.toolChain.length < this.config.minToolChainLength) {
      return null;
    }
    const toolSops = context.toolChain.filter((tc) => tc.success).map((tc, idx) => ({
      tool_name: tc.name,
      action: this.describeToolAction(tc),
      order: idx + 1
    }));
    if (toolSops.length < 2) {
      return null;
    }
    const sop = {
      id: `sop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      use_when: context.query,
      preferences: this.extractPreferences(context),
      tool_sops: toolSops,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      success_rate: 1,
      // First success
      usage_count: 1
    };
    this.generatedSOPs.set(sop.id, sop);
    return sop;
  }
  /**
   * Describe a tool action in natural language
   */
  describeToolAction(toolCall) {
    const name = toolCall.name;
    const args = Object.keys(toolCall.args);
    if (args.length === 0) {
      return `Execute ${name}`;
    }
    return `Execute ${name} with ${args.join(", ")}`;
  }
  /**
   * Extract preferences from task context
   */
  extractPreferences(context) {
    const prefs = [];
    if (context.skillsUsed.includes("solana-anchor-expert")) {
      prefs.push("Use Anchor framework for Solana");
    }
    if (context.skillsUsed.includes("nextjs-14-expert")) {
      prefs.push("Use Next.js App Router");
    }
    return prefs.join(", ") || "default settings";
  }
  /**
   * Process pending tasks and generate SOPs
   */
  async processPendingTasks() {
    const tasks = this.pendingTasks.splice(0, this.config.batchSize);
    for (const task of tasks) {
      try {
        await this.extractSOP(task);
      } catch (error) {
        console.error("[LearningObserver] Failed to extract SOP:", error);
      }
    }
  }
  /**
   * Record a successful skill usage
   */
  async recordSuccess(skillId, taskType) {
    const metric = this.successMetrics.get(skillId);
    if (metric) {
      metric.successes++;
      metric.totalUses++;
      metric.lastUsed = Date.now();
      return metric.successes;
    }
    const newMetric = {
      skillId,
      totalUses: 1,
      successes: 1,
      failures: 0,
      avgDuration: 0,
      lastUsed: Date.now()
    };
    this.successMetrics.set(skillId, newMetric);
    return 1;
  }
  /**
   * Get success rate for a skill
   */
  getSuccessRate(skillId) {
    const metric = this.successMetrics.get(skillId);
    if (!metric || metric.totalUses === 0) {
      return { rate: 0, totalUses: 0, successes: 0 };
    }
    return {
      rate: metric.successes / metric.totalUses,
      totalUses: metric.totalUses,
      successes: metric.successes
    };
  }
  /**
   * Sync learned data to AContext
   */
  async syncToAContext() {
    if (this.generatedSOPs.size === 0 && this.successMetrics.size === 0) {
      return;
    }
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (this.config.acontextApiKey) {
        headers["Authorization"] = `Bearer ${this.config.acontextApiKey}`;
      }
      for (const [id, sop] of this.generatedSOPs) {
        await fetch(`${this.config.acontextUrl}/sops`, {
          method: "POST",
          headers,
          body: JSON.stringify(sop)
        });
      }
      await fetch(`${this.config.acontextUrl}/metrics`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          metrics: Array.from(this.successMetrics.values()),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      console.log(`[LearningObserver] Synced ${this.generatedSOPs.size} SOPs and ${this.successMetrics.size} metrics to AContext`);
      this.generatedSOPs.clear();
    } catch (error) {
      console.error("[LearningObserver] Failed to sync to AContext:", error);
    }
  }
  /**
   * Get all generated SOPs
   */
  getSOPs() {
    return Array.from(this.generatedSOPs.values());
  }
  /**
   * Get all success metrics
   */
  getMetrics() {
    return Array.from(this.successMetrics.values());
  }
  /**
   * Get agent statistics
   */
  getStats() {
    return {
      pendingTasks: this.pendingTasks.length,
      generatedSOPs: this.generatedSOPs.size,
      trackedSkills: this.successMetrics.size,
      isRunning: this.syncTimer !== null
    };
  }
};
var instance = null;
function getLearningObserver() {
  if (!instance) {
    instance = new LearningObserverAgent();
  }
  return instance;
}
function resetLearningObserver() {
  if (instance) {
    instance.stop();
  }
  instance = null;
}

// src/intelligence/learning-loop.ts
var LearningLoop = class {
  config;
  interactions = [];
  patterns = /* @__PURE__ */ new Map();
  initialized = false;
  lastAContextSync = 0;
  autoSyncTimer = null;
  constructor(config) {
    this.config = {
      dataDir: config?.dataDir || this.getDefaultDataDir(),
      maxInteractions: config?.maxInteractions || 1e4,
      syncEnabled: config?.syncEnabled ?? false,
      syncEndpoint: config?.syncEndpoint,
      syncApiKey: config?.syncApiKey,
      autoLearn: config?.autoLearn ?? true,
      minPatternOccurrences: config?.minPatternOccurrences || 3,
      // v4.1 AContext defaults
      acontextEnabled: config?.acontextEnabled ?? false,
      acontextApiUrl: config?.acontextApiUrl || process.env.ACONTEXT_API_URL || "http://localhost:8029/api/v1",
      acontextApiKey: config?.acontextApiKey || process.env.ACONTEXT_API_KEY,
      autoSyncInterval: config?.autoSyncInterval || 0
      // Disabled by default
    };
  }
  /**
   * Initialize learning loop
   */
  async initialize() {
    if (this.initialized) return;
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
    await this.loadInteractions();
    await this.loadPatterns();
    if (this.config.acontextEnabled && this.config.autoSyncInterval && this.config.autoSyncInterval > 0) {
      this.startAutoSync();
    }
    this.initialized = true;
    const acontextStatus = this.config.acontextEnabled ? " | AContext: enabled" : "";
    console.log(`[LearningLoop] Initialized with ${this.interactions.length} interactions, ${this.patterns.size} patterns${acontextStatus}`);
  }
  /**
   * Record an interaction
   */
  async record(interaction) {
    await this.initialize();
    const id = this.generateId();
    const fullInteraction = {
      ...interaction,
      id,
      timestamp: Date.now()
    };
    this.interactions.push(fullInteraction);
    if (this.interactions.length > this.config.maxInteractions) {
      this.interactions = this.interactions.slice(-this.config.maxInteractions);
    }
    if (this.config.autoLearn) {
      await this.extractPatterns(fullInteraction);
    }
    await this.saveInteractions();
    return id;
  }
  /**
   * Add feedback to an interaction
   */
  async addFeedback(interactionId, feedback) {
    const interaction = this.interactions.find((i) => i.id === interactionId);
    if (!interaction) return false;
    interaction.feedback = {
      ...feedback,
      timestamp: Date.now()
    };
    if (feedback.rating <= 2) {
      await this.recordAntiPattern(interaction);
    } else if (feedback.rating >= 4) {
      await this.reinforcePattern(interaction);
    }
    await this.saveInteractions();
    return true;
  }
  /**
   * Extract patterns from interaction
   */
  async extractPatterns(interaction) {
    if (interaction.skills.length >= 2 && interaction.outcome === "success") {
      const comboKey = interaction.skills.sort().join("+");
      await this.updatePattern({
        type: "skill_combo",
        pattern: comboKey,
        metadata: {
          skills: interaction.skills,
          avgConfidence: interaction.confidence
        }
      });
    }
    const taskKeywords = this.extractKeywords(interaction.task);
    if (taskKeywords.length > 0 && interaction.outcome === "success") {
      const taskPattern = taskKeywords.slice(0, 3).join(" ");
      await this.updatePattern({
        type: "task_pattern",
        pattern: taskPattern,
        metadata: {
          skills: interaction.skills,
          mode: interaction.mode
        }
      });
    }
    if (interaction.latencyMs < 1e3 && interaction.confidence > 0.8) {
      await this.updatePattern({
        type: "optimization",
        pattern: `fast_${interaction.mode}`,
        metadata: {
          avgLatency: interaction.latencyMs,
          skills: interaction.skills
        }
      });
    }
  }
  /**
   * Update or create a pattern
   */
  async updatePattern(input) {
    const key = `${input.type}:${input.pattern}`;
    const existing = this.patterns.get(key);
    if (existing) {
      existing.occurrences++;
      existing.lastSeen = Date.now();
      existing.confidence = Math.min(1, existing.confidence + 0.05);
      existing.metadata = { ...existing.metadata, ...input.metadata };
    } else {
      this.patterns.set(key, {
        id: this.generateId(),
        type: input.type,
        pattern: input.pattern,
        confidence: 0.5,
        occurrences: 1,
        lastSeen: Date.now(),
        metadata: input.metadata
      });
    }
    await this.savePatterns();
  }
  /**
   * Record an anti-pattern (something that didn't work)
   */
  async recordAntiPattern(interaction) {
    const key = `anti:${interaction.skills.sort().join("+")}`;
    await this.updatePattern({
      type: "anti_pattern",
      pattern: key,
      metadata: {
        task: interaction.task.slice(0, 100),
        reason: interaction.feedback?.comment || "Low rating"
      }
    });
  }
  /**
   * Reinforce a successful pattern
   */
  async reinforcePattern(interaction) {
    const comboKey = interaction.skills.sort().join("+");
    const key = `skill_combo:${comboKey}`;
    const pattern = this.patterns.get(key);
    if (pattern) {
      pattern.confidence = Math.min(1, pattern.confidence + 0.1);
      await this.savePatterns();
    }
  }
  /**
   * Get recommended skills for a task
   */
  async getRecommendations(task) {
    await this.initialize();
    const recommendations = [];
    const taskKeywords = this.extractKeywords(task);
    for (const [key, pattern] of this.patterns) {
      if (pattern.type === "task_pattern") {
        const patternWords = pattern.pattern.split(" ");
        const matchCount = patternWords.filter((w) => taskKeywords.includes(w)).length;
        if (matchCount >= 2 && pattern.occurrences >= this.config.minPatternOccurrences) {
          const skills = pattern.metadata.skills || [];
          recommendations.push({
            skills,
            confidence: pattern.confidence * (matchCount / patternWords.length),
            reason: `Matched pattern: "${pattern.pattern}" (${pattern.occurrences} uses)`
          });
        }
      }
    }
    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations.slice(0, 5);
  }
  /**
   * Get anti-patterns to avoid
   */
  async getAntiPatterns(skills) {
    await this.initialize();
    const antiPatterns = [];
    const skillSet = new Set(skills);
    for (const [key, pattern] of this.patterns) {
      if (pattern.type === "anti_pattern") {
        const patternSkills = key.replace("anti:", "").split("+");
        const overlap = patternSkills.filter((s) => skillSet.has(s)).length;
        if (overlap >= 2) {
          antiPatterns.push({
            pattern: patternSkills.join(" + "),
            reason: pattern.metadata.reason || "Previously unsuccessful"
          });
        }
      }
    }
    return antiPatterns;
  }
  /**
   * Get learning statistics
   */
  async getStats() {
    await this.initialize();
    const successCount = this.interactions.filter((i) => i.outcome === "success").length;
    const avgConfidence = this.interactions.length > 0 ? this.interactions.reduce((sum, i) => sum + i.confidence, 0) / this.interactions.length : 0;
    const avgLatency = this.interactions.length > 0 ? this.interactions.reduce((sum, i) => sum + i.latencyMs, 0) / this.interactions.length : 0;
    const skillCounts = /* @__PURE__ */ new Map();
    for (const interaction of this.interactions) {
      for (const skill of interaction.skills) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
    }
    const topSkills = Array.from(skillCounts.entries()).map(([skillId, count]) => ({ skillId, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    return {
      totalInteractions: this.interactions.length,
      successRate: this.interactions.length > 0 ? successCount / this.interactions.length : 0,
      avgConfidence,
      avgLatencyMs: Math.round(avgLatency),
      topSkills,
      patterns: this.patterns.size
    };
  }
  /**
   * Extract keywords from task
   */
  extractKeywords(task) {
    const stopWords = /* @__PURE__ */ new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "its",
      "our",
      "their"
    ]);
    return task.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `learn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  /**
   * Load interactions from disk
   */
  async loadInteractions() {
    const filePath = path.join(this.config.dataDir, "interactions.json");
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        this.interactions = data.interactions || [];
      }
    } catch (error) {
      console.error("[LearningLoop] Failed to load interactions:", error);
    }
  }
  /**
   * Save interactions to disk
   */
  async saveInteractions() {
    const filePath = path.join(this.config.dataDir, "interactions.json");
    try {
      fs.writeFileSync(filePath, JSON.stringify({
        version: "1.0.0",
        interactions: this.interactions
      }, null, 2));
    } catch (error) {
      console.error("[LearningLoop] Failed to save interactions:", error);
    }
  }
  /**
   * Load patterns from disk
   */
  async loadPatterns() {
    const filePath = path.join(this.config.dataDir, "patterns.json");
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        this.patterns = new Map(Object.entries(data.patterns || {}));
      }
    } catch (error) {
      console.error("[LearningLoop] Failed to load patterns:", error);
    }
  }
  /**
   * Save patterns to disk
   */
  async savePatterns() {
    const filePath = path.join(this.config.dataDir, "patterns.json");
    try {
      fs.writeFileSync(filePath, JSON.stringify({
        version: "1.0.0",
        patterns: Object.fromEntries(this.patterns)
      }, null, 2));
    } catch (error) {
      console.error("[LearningLoop] Failed to save patterns:", error);
    }
  }
  /**
   * Export learnings for cloud sync
   */
  async exportForSync() {
    await this.initialize();
    return {
      interactions: this.interactions,
      patterns: Array.from(this.patterns.values()),
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Import learnings from cloud sync
   */
  async importFromSync(data) {
    await this.initialize();
    const existingIds = new Set(this.interactions.map((i) => i.id));
    for (const interaction of data.interactions) {
      if (!existingIds.has(interaction.id)) {
        this.interactions.push(interaction);
      }
    }
    for (const pattern of data.patterns) {
      const key = `${pattern.type}:${pattern.pattern}`;
      const existing = this.patterns.get(key);
      if (!existing || pattern.confidence > existing.confidence) {
        this.patterns.set(key, pattern);
      }
    }
    if (this.interactions.length > this.config.maxInteractions) {
      this.interactions = this.interactions.slice(-this.config.maxInteractions);
    }
    await this.saveInteractions();
    await this.savePatterns();
  }
  // ===========================================================================
  // v4.1 ACONTEXT INTEGRATION
  // ===========================================================================
  /**
   * Start auto-sync timer for AContext
   */
  startAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }
    this.autoSyncTimer = setInterval(async () => {
      try {
        await this.syncToAContext();
      } catch (error) {
        console.error("[LearningLoop] Auto-sync failed:", error);
      }
    }, this.config.autoSyncInterval);
    console.log(`[LearningLoop] Auto-sync started (every ${this.config.autoSyncInterval / 1e3}s)`);
  }
  /**
   * Stop auto-sync timer
   */
  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log("[LearningLoop] Auto-sync stopped");
    }
  }
  /**
   * Sync learnings to AContext cloud platform
   * Records successful interactions as tasks and generates SOPs
   */
  async syncToAContext() {
    if (!this.config.acontextEnabled) {
      return {
        success: false,
        tasksRecorded: 0,
        sopsGenerated: 0,
        error: "AContext sync is disabled",
        timestamp: Date.now()
      };
    }
    if (!this.config.acontextApiKey) {
      return {
        success: false,
        tasksRecorded: 0,
        sopsGenerated: 0,
        error: "AContext API key not configured",
        timestamp: Date.now()
      };
    }
    await this.initialize();
    const unsyncedInteractions = this.interactions.filter(
      (i) => i.timestamp > this.lastAContextSync
    );
    if (unsyncedInteractions.length === 0) {
      return {
        success: true,
        tasksRecorded: 0,
        sopsGenerated: 0,
        timestamp: Date.now()
      };
    }
    let tasksRecorded = 0;
    let sopsGenerated = 0;
    try {
      const observer = getLearningObserver();
      for (const interaction of unsyncedInteractions) {
        const taskPayload = {
          task: interaction.task,
          skills: interaction.skills,
          mode: interaction.mode,
          outcome: interaction.outcome,
          confidence: interaction.confidence,
          latencyMs: interaction.latencyMs,
          tokensUsed: interaction.tokensUsed,
          timestamp: interaction.timestamp,
          metadata: interaction.context || {}
        };
        const response = await fetch(`${this.config.acontextApiUrl}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.config.acontextApiKey}`
          },
          body: JSON.stringify(taskPayload)
        });
        if (response.ok) {
          tasksRecorded++;
          if (interaction.outcome === "success" && interaction.skills.length >= 2) {
            const sop = await observer.extractSOP({
              task: interaction.task,
              toolCalls: [],
              // Would need actual tool calls
              mode: interaction.mode,
              confidence: interaction.confidence
            });
            if (sop) {
              const sopResponse = await fetch(`${this.config.acontextApiUrl}/sops`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${this.config.acontextApiKey}`
                },
                body: JSON.stringify({
                  name: sop.name,
                  description: sop.description,
                  steps: sop.steps,
                  skills: sop.skills,
                  confidence: sop.confidence,
                  sourceTask: interaction.task
                })
              });
              if (sopResponse.ok) {
                sopsGenerated++;
              }
            }
          }
        }
      }
      this.lastAContextSync = Date.now();
      console.log(`[LearningLoop] AContext sync complete: ${tasksRecorded} tasks, ${sopsGenerated} SOPs`);
      return {
        success: true,
        tasksRecorded,
        sopsGenerated,
        timestamp: this.lastAContextSync
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[LearningLoop] AContext sync failed:", errorMsg);
      return {
        success: false,
        tasksRecorded,
        sopsGenerated,
        error: errorMsg,
        timestamp: Date.now()
      };
    }
  }
  /**
   * Import learnings from AContext
   * Pulls learned SOPs and patterns from the cloud
   */
  async importFromAContext() {
    if (!this.config.acontextEnabled || !this.config.acontextApiKey) {
      return {
        success: false,
        sopsImported: 0,
        patternsImported: 0,
        error: "AContext not configured"
      };
    }
    try {
      const response = await fetch(`${this.config.acontextApiUrl}/sops?limit=100`, {
        headers: {
          "Authorization": `Bearer ${this.config.acontextApiKey}`
        }
      });
      if (!response.ok) {
        throw new Error(`AContext API error: ${response.status}`);
      }
      const data = await response.json();
      const sops = data.sops || [];
      let patternsImported = 0;
      for (const sop of sops) {
        if (sop.skills.length >= 2) {
          const comboKey = sop.skills.sort().join("+");
          const key = `skill_combo:${comboKey}`;
          const existing = this.patterns.get(key);
          if (!existing || sop.confidence > existing.confidence) {
            this.patterns.set(key, {
              id: this.generateId(),
              type: "skill_combo",
              pattern: comboKey,
              confidence: sop.confidence,
              occurrences: 1,
              lastSeen: Date.now(),
              metadata: {
                skills: sop.skills,
                source: "acontext",
                sopName: sop.name
              }
            });
            patternsImported++;
          }
        }
      }
      if (patternsImported > 0) {
        await this.savePatterns();
      }
      console.log(`[LearningLoop] AContext import: ${sops.length} SOPs, ${patternsImported} new patterns`);
      return {
        success: true,
        sopsImported: sops.length,
        patternsImported
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[LearningLoop] AContext import failed:", errorMsg);
      return {
        success: false,
        sopsImported: 0,
        patternsImported: 0,
        error: errorMsg
      };
    }
  }
  /**
   * Get AContext connection status
   */
  getAContextStatus() {
    return {
      enabled: this.config.acontextEnabled,
      apiUrl: this.config.acontextApiUrl || "",
      hasApiKey: !!this.config.acontextApiKey,
      lastSync: this.lastAContextSync > 0 ? this.lastAContextSync : null,
      autoSyncEnabled: !!this.autoSyncTimer,
      autoSyncInterval: this.config.autoSyncInterval || 0
    };
  }
  /**
   * Clear all learnings
   */
  async clear() {
    this.interactions = [];
    this.patterns.clear();
    this.stopAutoSync();
    await this.saveInteractions();
    await this.savePatterns();
  }
  /**
   * Get default data directory
   */
  getDefaultDataDir() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data/learning"
    );
  }
};
var instance2 = null;
function getLearningLoop() {
  if (!instance2) {
    instance2 = new LearningLoop();
  }
  return instance2;
}
function resetLearningLoop() {
  instance2 = null;
}

export { LearningLoop, LearningObserverAgent, getLearningLoop, getLearningObserver, resetLearningLoop, resetLearningObserver };
