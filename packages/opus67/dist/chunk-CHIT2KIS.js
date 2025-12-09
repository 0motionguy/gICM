import { createMemory } from './chunk-2BMLDUKW.js';
import { EventEmitter } from 'eventemitter3';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, appendFileSync, watch } from 'fs';
import { join } from 'path';

// src/evolution/types.ts
var DEFAULT_EVOLUTION_CONFIG = {
  usageTracker: {
    enabled: true,
    bufferSize: 20,
    flushIntervalMs: 5e3,
    storageLocation: ".opus67/evolution/usage",
    maxEventsPerDay: 1e4,
    trackContext: true,
    contextMaxLength: 200
  },
  learningGenerator: {
    enabled: true,
    minEvidenceCount: 3,
    minConfidence: 0.6,
    confidenceDecay: 0.01,
    generateIntervalMs: 6e4
  },
  adaptiveMatcher: {
    enabled: true,
    learningBoostWeight: 0.3,
    maxBoost: 1.5,
    minConfidenceToApply: 0.5
  }
};
function generateId(prefix = "evo") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function hashTask(task) {
  let hash = 0;
  for (let i = 0; i < task.length; i++) {
    const char = task.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
var DEFAULT_CONFIG = {
  storageLocation: ".opus67/evolution/learnings",
  maxLearnings: 500,
  autoDeprecateThreshold: 10,
  confidenceDecayRate: 0.01
};
var LearningStore = class extends EventEmitter {
  config;
  learnings = /* @__PURE__ */ new Map();
  indexByType = /* @__PURE__ */ new Map();
  indexByEntity = /* @__PURE__ */ new Map();
  dirty = false;
  constructor(config) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureStorageDir();
    this.load();
  }
  /**
   * Ensure storage directory exists
   */
  ensureStorageDir() {
    const dir = this.config.storageLocation;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  /**
   * Load learnings from storage
   */
  load() {
    const mainFile = join(this.config.storageLocation, "learnings.json");
    if (!existsSync(mainFile)) {
      return;
    }
    try {
      const content = readFileSync(mainFile, "utf-8");
      const data = JSON.parse(content);
      for (const learning of data) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    } catch (error) {
      console.error("[LearningStore] Failed to load:", error);
    }
  }
  /**
   * Save learnings to storage
   */
  save() {
    if (!this.dirty) return;
    const mainFile = join(this.config.storageLocation, "learnings.json");
    const learnings = Array.from(this.learnings.values());
    try {
      writeFileSync(mainFile, JSON.stringify(learnings, null, 2), "utf-8");
      this.dirty = false;
    } catch (error) {
      console.error("[LearningStore] Failed to save:", error);
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
    }
  }
  /**
   * Add learning to indices
   */
  addToIndices(learning) {
    if (!this.indexByType.has(learning.type)) {
      this.indexByType.set(learning.type, /* @__PURE__ */ new Set());
    }
    this.indexByType.get(learning.type).add(learning.id);
    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      if (!this.indexByEntity.has(key)) {
        this.indexByEntity.set(key, /* @__PURE__ */ new Set());
      }
      this.indexByEntity.get(key).add(learning.id);
    }
  }
  /**
   * Remove learning from indices
   */
  removeFromIndices(learning) {
    this.indexByType.get(learning.type)?.delete(learning.id);
    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      this.indexByEntity.get(key)?.delete(learning.id);
    }
  }
  /**
   * Create a new learning
   */
  create(params) {
    const similar = this.findSimilar(params.type, params.entities);
    if (similar) {
      return this.addEvidence(similar.id, params.evidence);
    }
    if (this.learnings.size >= this.config.maxLearnings) {
      this.pruneOldLearnings();
    }
    const learning = {
      id: generateId("learning"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      type: params.type,
      insight: params.insight,
      confidence: Math.min(1, Math.max(0, params.confidence)),
      evidenceCount: params.evidence.length,
      evidence: params.evidence.slice(0, 20),
      // Keep last 20 evidence items
      triggerConditions: params.triggerConditions,
      entities: params.entities,
      expectedBenefit: params.expectedBenefit,
      applicationCount: 0,
      status: "active"
    };
    this.learnings.set(learning.id, learning);
    this.addToIndices(learning);
    this.dirty = true;
    this.emit("learning:created", learning);
    return learning;
  }
  /**
   * Find similar existing learning
   */
  findSimilar(type, entities) {
    const typeLearnings = this.indexByType.get(type);
    if (!typeLearnings) return null;
    for (const id of typeLearnings) {
      const learning = this.learnings.get(id);
      if (!learning || learning.status !== "active") continue;
      const entityIds = entities.map((e) => `${e.type}:${e.id}`).sort();
      const learningEntityIds = learning.entities.map((e) => `${e.type}:${e.id}`).sort();
      if (entityIds.join(",") === learningEntityIds.join(",")) {
        return learning;
      }
    }
    return null;
  }
  /**
   * Add evidence to existing learning
   */
  addEvidence(learningId, evidence) {
    const learning = this.learnings.get(learningId);
    if (!learning) {
      throw new Error(`Learning not found: ${learningId}`);
    }
    learning.evidence.unshift(...evidence);
    learning.evidence = learning.evidence.slice(0, 20);
    learning.evidenceCount += evidence.length;
    const positiveCount = evidence.filter((e) => e.outcome === "positive").length;
    const negativeCount = evidence.filter((e) => e.outcome === "negative").length;
    if (positiveCount > negativeCount) {
      learning.confidence = Math.min(1, learning.confidence + 0.05 * positiveCount);
    } else if (negativeCount > positiveCount) {
      learning.confidence = Math.max(0, learning.confidence - 0.1 * negativeCount);
    }
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.dirty = true;
    this.emit("learning:updated", learning);
    return learning;
  }
  /**
   * Record that a learning was applied
   */
  recordApplication(learningId, success) {
    const learning = this.learnings.get(learningId);
    if (!learning) return null;
    learning.applicationCount++;
    if (learning.actualBenefit === void 0) {
      learning.actualBenefit = success ? 1 : 0;
    } else {
      learning.actualBenefit = (learning.actualBenefit * (learning.applicationCount - 1) + (success ? 1 : 0)) / learning.applicationCount;
    }
    if (learning.applicationCount >= this.config.autoDeprecateThreshold && (learning.actualBenefit ?? 0) < 0.3) {
      learning.status = "deprecated";
      this.emit("learning:deprecated", learning);
    }
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.dirty = true;
    return learning;
  }
  /**
   * Get a learning by ID
   */
  get(id) {
    return this.learnings.get(id);
  }
  /**
   * Get all active learnings
   */
  getActive() {
    return Array.from(this.learnings.values()).filter((l) => l.status === "active");
  }
  /**
   * Get learnings by type
   */
  getByType(type) {
    const ids = this.indexByType.get(type) ?? /* @__PURE__ */ new Set();
    return Array.from(ids).map((id) => this.learnings.get(id)).filter((l) => l !== void 0 && l.status === "active");
  }
  /**
   * Get learnings for an entity
   */
  getForEntity(entityType, entityId) {
    const key = `${entityType}:${entityId}`;
    const ids = this.indexByEntity.get(key) ?? /* @__PURE__ */ new Set();
    return Array.from(ids).map((id) => this.learnings.get(id)).filter((l) => l !== void 0 && l.status === "active");
  }
  /**
   * Find relevant learnings for a task context
   */
  findRelevant(context, limit = 10) {
    const activeLearnings = this.getActive();
    const scores = [];
    const lowerContext = context.toLowerCase();
    for (const learning of activeLearnings) {
      let score = 0;
      for (const condition of learning.triggerConditions) {
        if (condition.type === "keyword") {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        } else if (condition.type === "context") {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        }
      }
      score *= learning.confidence;
      if (score > 0) {
        scores.push({ learning, score });
      }
    }
    return scores.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.learning);
  }
  /**
   * Deprecate a learning
   */
  deprecate(id, reason) {
    const learning = this.learnings.get(id);
    if (!learning) return false;
    learning.status = "deprecated";
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (reason) {
      learning.entities.push({
        type: "skill",
        id: "deprecation_reason",
        effect: "exclude",
        weight: 0
      });
    }
    this.dirty = true;
    this.emit("learning:deprecated", learning);
    return true;
  }
  /**
   * Prune old/low-performing learnings
   */
  pruneOldLearnings() {
    const sorted = Array.from(this.learnings.values()).filter((l) => l.status === "active").sort((a, b) => {
      const scoreA = a.confidence * (a.actualBenefit ?? a.expectedBenefit) * (1 / (Date.now() - new Date(a.updatedAt).getTime()));
      const scoreB = b.confidence * (b.actualBenefit ?? b.expectedBenefit) * (1 / (Date.now() - new Date(b.updatedAt).getTime()));
      return scoreA - scoreB;
    });
    const toRemove = Math.ceil(sorted.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      const learning = sorted[i];
      learning.status = "deprecated";
      this.emit("learning:deprecated", learning);
    }
    this.dirty = true;
  }
  /**
   * Apply confidence decay to unused learnings
   */
  applyDecay() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1e3;
    for (const learning of this.learnings.values()) {
      if (learning.status !== "active") continue;
      const daysSinceUpdate = (now - new Date(learning.updatedAt).getTime()) / dayMs;
      if (daysSinceUpdate > 7) {
        const decay = this.config.confidenceDecayRate * Math.floor(daysSinceUpdate / 7);
        learning.confidence = Math.max(0.1, learning.confidence - decay);
        this.dirty = true;
      }
    }
  }
  /**
   * Get stats
   */
  getStats() {
    const all = Array.from(this.learnings.values());
    const active = all.filter((l) => l.status === "active");
    const totalApplications = all.reduce((sum, l) => sum + l.applicationCount, 0);
    const avgConfidence = active.length > 0 ? active.reduce((sum, l) => sum + l.confidence, 0) / active.length : 0;
    const avgBenefit = active.length > 0 ? active.reduce((sum, l) => sum + (l.actualBenefit ?? l.expectedBenefit), 0) / active.length : 0;
    return {
      totalLearnings: all.length,
      activeLearnings: active.length,
      avgConfidence,
      totalApplications,
      avgBenefit
    };
  }
  /**
   * Export learnings for backup
   */
  export() {
    return Array.from(this.learnings.values());
  }
  /**
   * Import learnings from backup
   */
  import(learnings) {
    for (const learning of learnings) {
      if (!this.learnings.has(learning.id)) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    }
    this.dirty = true;
    this.save();
  }
};
var learningStore = new LearningStore();
var UnifiedBus = class extends EventEmitter {
  adapters = /* @__PURE__ */ new Map();
  sourceStatus = /* @__PURE__ */ new Map();
  pendingWrites = /* @__PURE__ */ new Map();
  initialized = false;
  constructor() {
    super();
    this.setupInternalHandlers();
  }
  /**
   * Set up internal event handlers for cross-store communication
   */
  setupInternalHandlers() {
    this.on("memory:add", async (payload, source) => {
      console.log(`[UnifiedBus] memory:add from ${source}: ${payload.type}`);
      if (payload.destinations) {
        const otherDestinations = payload.destinations.filter(
          (d) => d !== source
        );
        for (const dest of otherDestinations) {
          const adapter = this.adapters.get(dest);
          if (adapter?.write && this.sourceStatus.get(dest)) {
            try {
              await adapter.write(payload);
            } catch (error) {
              console.warn(
                `[UnifiedBus] Failed to propagate to ${dest}:`,
                error
              );
            }
          }
        }
      }
    });
    this.on("sync:broadcast", (results, source) => {
      console.log(
        `[UnifiedBus] sync:broadcast from ${source}: ${results.length} items`
      );
    });
  }
  /**
   * Register a memory adapter
   */
  registerAdapter(adapter) {
    const source = adapter.source;
    this.adapters.set(source, adapter);
    this.sourceStatus.set(source, false);
    this.emit("adapter:register", source, adapter);
    console.log(`[UnifiedBus] Registered adapter: ${source}`);
  }
  /**
   * Unregister a memory adapter
   */
  unregisterAdapter(source) {
    this.adapters.delete(source);
    this.sourceStatus.delete(source);
    this.emit("adapter:unregister", source);
    console.log(`[UnifiedBus] Unregistered adapter: ${source}`);
  }
  /**
   * Initialize all registered adapters
   */
  async initialize() {
    if (this.initialized) return;
    const initPromises = Array.from(this.adapters.entries()).map(
      async ([source, adapter]) => {
        try {
          const available = await adapter.initialize();
          this.sourceStatus.set(source, available);
          if (available) {
            this.emit("source:available", source);
          } else {
            this.emit(
              "source:unavailable",
              source,
              new Error("Initialization returned false")
            );
          }
          return { source, available };
        } catch (error) {
          this.sourceStatus.set(source, false);
          this.emit(
            "source:unavailable",
            source,
            error instanceof Error ? error : new Error(String(error))
          );
          return { source, available: false };
        }
      }
    );
    const results = await Promise.all(initPromises);
    const availableCount = results.filter((r) => r.available).length;
    console.log(
      `[UnifiedBus] Initialized ${availableCount}/${results.length} adapters`
    );
    this.initialized = true;
    this.emit("ready");
  }
  /**
   * Get an adapter by source
   */
  getAdapter(source) {
    return this.adapters.get(source);
  }
  /**
   * Check if a source is available
   */
  isAvailable(source) {
    return this.sourceStatus.get(source) ?? false;
  }
  /**
   * Get all available sources
   */
  getAvailableSources() {
    return Array.from(this.sourceStatus.entries()).filter(([_, available]) => available).map(([source]) => source);
  }
  /**
   * Query across multiple sources in parallel
   */
  async queryParallel(query, sources, options) {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const availableSources = sources.filter((s) => this.isAvailable(s));
    const queryPromises = availableSources.map(async (source) => {
      const adapter = this.adapters.get(source);
      if (!adapter) return [];
      try {
        const results = await adapter.query(query, { limit, minScore });
        return results;
      } catch (error) {
        console.warn(`[UnifiedBus] Query failed for ${source}:`, error);
        return [];
      }
    });
    const allResults = await Promise.all(queryPromises);
    const flatResults = allResults.flat();
    const seen = /* @__PURE__ */ new Set();
    return flatResults.filter((r) => r.score >= minScore).sort((a, b) => b.score - a.score).filter((r) => {
      const key = `${r.source}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  }
  /**
   * Write to multiple destinations
   */
  async writeToDestinations(payload, destinations) {
    const result = {
      success: false,
      destinations: [],
      ids: {},
      errors: {}
    };
    const availableDestinations = destinations.filter(
      (d) => this.isAvailable(d)
    );
    if (availableDestinations.length === 0) {
      result.errors = { graphiti: "No available destinations" };
      return result;
    }
    const primary = availableDestinations[0];
    const primaryAdapter = this.adapters.get(primary);
    if (!primaryAdapter?.write) {
      result.errors[primary] = "Adapter does not support write";
      return result;
    }
    try {
      const id = await primaryAdapter.write(payload);
      if (id) {
        result.ids[primary] = id;
        result.destinations.push(primary);
        result.success = true;
        this.emit("memory:add", payload, primary);
      } else {
        result.errors[primary] = "Write returned null";
        return result;
      }
    } catch (error) {
      result.errors[primary] = String(error);
      return result;
    }
    const secondaryDestinations = availableDestinations.slice(1);
    const secondaryPromises = secondaryDestinations.map(async (dest) => {
      const adapter = this.adapters.get(dest);
      if (!adapter?.write) return { dest, id: null, error: "No write support" };
      try {
        const id = await adapter.write(payload);
        return { dest, id, error: null };
      } catch (error) {
        return { dest, id: null, error: String(error) };
      }
    });
    const secondaryResults = await Promise.allSettled(secondaryPromises);
    for (const settledResult of secondaryResults) {
      if (settledResult.status === "fulfilled") {
        const { dest, id, error } = settledResult.value;
        if (id) {
          result.ids[dest] = id;
          result.destinations.push(dest);
        } else if (error) {
          result.errors[dest] = error;
        }
      }
    }
    this.emit("write:complete", payload, result);
    return result;
  }
  /**
   * Request sync from one source to targets
   */
  async requestSync(source, targets) {
    const adapter = this.adapters.get(source);
    if (!adapter || !this.isAvailable(source)) {
      console.warn(`[UnifiedBus] Cannot sync - ${source} not available`);
      return 0;
    }
    this.emit("sync:start", source);
    try {
      const results = await adapter.query("", { limit: 100 });
      const targetSources = targets ?? this.getAvailableSources().filter((s) => s !== source);
      this.emit("sync:broadcast", results, source);
      this.emit("sync:complete", source, results.length);
      return results.length;
    } catch (error) {
      console.error(`[UnifiedBus] Sync failed for ${source}:`, error);
      return 0;
    }
  }
  /**
   * Get status of all sources
   */
  getStatus() {
    return Object.fromEntries(this.sourceStatus);
  }
  /**
   * Shutdown all adapters
   */
  async shutdown() {
    const shutdownPromises = Array.from(this.adapters.entries()).map(
      async ([source, adapter]) => {
        if (adapter.disconnect) {
          try {
            await adapter.disconnect();
          } catch (error) {
            console.warn(`[UnifiedBus] Failed to disconnect ${source}:`, error);
          }
        }
      }
    );
    await Promise.all(shutdownPromises);
    this.adapters.clear();
    this.sourceStatus.clear();
    this.initialized = false;
    console.log("[UnifiedBus] Shutdown complete");
  }
};
function createUnifiedBus() {
  return new UnifiedBus();
}
var MarkdownLoader = class {
  source = "markdown";
  memoryPath;
  entries = /* @__PURE__ */ new Map();
  initialized = false;
  watcher = null;
  constructor(memoryPath) {
    this.memoryPath = memoryPath ?? join(process.cwd(), ".claude", "memory");
  }
  /**
   * Initialize by loading all markdown files
   */
  async initialize() {
    if (this.initialized) return true;
    if (!existsSync(this.memoryPath)) {
      console.warn(
        `[MarkdownLoader] Memory path not found: ${this.memoryPath}`
      );
      return false;
    }
    try {
      await this.loadAll();
      this.initialized = true;
      console.log(
        `[MarkdownLoader] Loaded ${this.entries.size} entries from ${this.memoryPath}`
      );
      return true;
    } catch (error) {
      console.error("[MarkdownLoader] Failed to initialize:", error);
      return false;
    }
  }
  /**
   * Check if adapter is available
   */
  isAvailable() {
    return this.initialized && existsSync(this.memoryPath);
  }
  /**
   * Load all markdown files from memory directories
   */
  async loadAll() {
    const subdirs = ["wins", "decisions", "learnings", "context"];
    for (const subdir of subdirs) {
      const dirPath = join(this.memoryPath, subdir);
      if (!existsSync(dirPath)) continue;
      const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const filePath = join(dirPath, file);
        await this.loadFile(filePath, subdir);
      }
    }
  }
  /**
   * Load and parse a single markdown file
   */
  async loadFile(filePath, category) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const entries = this.parseMarkdown(content, category, filePath);
      for (const entry of entries) {
        const id = `md_${category}_${entry.title.replace(/\s+/g, "_").toLowerCase()}_${entry.timestamp.getTime()}`;
        this.entries.set(id, entry);
      }
    } catch (error) {
      console.warn(`[MarkdownLoader] Failed to load ${filePath}:`, error);
    }
  }
  /**
   * Parse markdown content into entries
   */
  parseMarkdown(content, category, file) {
    const entries = [];
    const lines = content.split("\n");
    let currentEntry = null;
    let contentLines = [];
    for (const line of lines) {
      if (line.startsWith("### ")) {
        if (currentEntry?.title) {
          currentEntry.content = contentLines.join("\n").trim();
          entries.push(currentEntry);
        }
        currentEntry = {
          title: line.replace("### ", "").trim(),
          type: category,
          metadata: {},
          timestamp: /* @__PURE__ */ new Date(),
          file
        };
        contentLines = [];
        continue;
      }
      const metaMatch = line.match(/^-\s+\*\*([^:]+):\*\*\s*(.+)$/);
      if (metaMatch && currentEntry) {
        const [, key, value] = metaMatch;
        const normalizedKey = key.toLowerCase().trim();
        currentEntry.metadata[normalizedKey] = value.trim();
        if (normalizedKey === "time" || normalizedKey === "timestamp" || normalizedKey === "date") {
          const parsed = this.parseTimestamp(value);
          if (parsed) currentEntry.timestamp = parsed;
        }
        continue;
      }
      if (currentEntry) {
        contentLines.push(line);
      }
    }
    if (currentEntry?.title) {
      currentEntry.content = contentLines.join("\n").trim();
      entries.push(currentEntry);
    }
    return entries;
  }
  /**
   * Parse timestamp from various formats
   */
  parseTimestamp(value) {
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) return isoDate;
    const timeMatch = value.match(
      /(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i
    );
    if (timeMatch) {
      const now = /* @__PURE__ */ new Date();
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const ampm = timeMatch[4]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      now.setHours(hours, minutes, seconds, 0);
      return now;
    }
    return null;
  }
  /**
   * Query markdown entries
   */
  async query(query, options) {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const lowerQuery = query.toLowerCase();
    const results = [];
    for (const [id, entry] of this.entries) {
      let score = 0;
      if (entry.title.toLowerCase().includes(lowerQuery)) {
        score += 0.8;
      }
      if (entry.content.toLowerCase().includes(lowerQuery)) {
        score += 0.5;
      }
      if (entry.type.toLowerCase().includes(lowerQuery)) {
        score += 0.3;
      }
      for (const [key, value] of Object.entries(entry.metadata)) {
        if (typeof value === "string" && value.toLowerCase().includes(lowerQuery)) {
          score += 0.2;
        }
      }
      const ageInDays = (Date.now() - entry.timestamp.getTime()) / (1e3 * 60 * 60 * 24);
      if (ageInDays < 1) score *= 1.5;
      else if (ageInDays < 7) score *= 1.2;
      score = Math.min(1, score);
      if (score >= minScore || query === "") {
        results.push({
          id,
          source: "markdown",
          content: `${entry.title}: ${entry.content}`,
          score: query === "" ? 0.5 : score,
          metadata: {
            type: entry.type,
            key: entry.title,
            timestamp: entry.timestamp,
            path: entry.file,
            ...entry.metadata
          }
        });
      }
    }
    if (options?.timeRange) {
      const { start, end } = options.timeRange;
      return results.filter((r) => {
        const ts = r.metadata.timestamp;
        if (!ts) return true;
        if (start && ts < start) return false;
        if (end && ts > end) return false;
        return true;
      }).sort((a, b) => b.score - a.score).slice(0, limit);
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  /**
   * Write a new entry to markdown
   */
  async write(payload) {
    const { type, content, key, metadata } = payload;
    let subdir = "learnings";
    if (type === "win") subdir = "wins";
    else if (type === "decision") subdir = "decisions";
    const today = /* @__PURE__ */ new Date();
    const monthStr = today.toISOString().slice(0, 7);
    const targetFile = join(this.memoryPath, subdir, `${monthStr}.md`);
    const timestamp = today.toLocaleTimeString();
    const title = key ?? content.slice(0, 50).replace(/\n/g, " ");
    let entry = `
### ${title}
`;
    entry += `- **Type:** ${type}
`;
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        entry += `- **${k.charAt(0).toUpperCase() + k.slice(1)}:** ${v}
`;
      }
    }
    entry += `- **Time:** ${timestamp}
`;
    if (content !== title) {
      entry += `
${content}
`;
    }
    try {
      appendFileSync(targetFile, entry);
      const id = `md_${subdir}_${title.replace(/\s+/g, "_").toLowerCase()}_${today.getTime()}`;
      this.entries.set(id, {
        title,
        type: subdir,
        content,
        metadata: metadata ?? {},
        timestamp: today,
        file: targetFile
      });
      return id;
    } catch (error) {
      console.error("[MarkdownLoader] Failed to write:", error);
      return null;
    }
  }
  /**
   * Watch for file changes
   */
  startWatching() {
    if (this.watcher) return;
    this.watcher = watch(
      this.memoryPath,
      { recursive: true },
      async (event, filename) => {
        if (filename?.endsWith(".md")) {
          console.log(`[MarkdownLoader] File changed: ${filename}`);
          const category = filename.split(/[/\\]/)[0];
          const filePath = join(this.memoryPath, filename);
          if (existsSync(filePath)) {
            await this.loadFile(filePath, category);
          }
        }
      }
    );
  }
  /**
   * Stop watching for changes
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
  /**
   * Get all wins
   */
  getWins() {
    return Array.from(this.entries.values()).filter((e) => e.type === "wins").map((e) => ({
      title: e.title,
      type: e.metadata.type ?? "general",
      value: parseInt(e.metadata.value ?? "1", 10),
      description: e.content,
      timestamp: e.timestamp
    }));
  }
  /**
   * Get all decisions
   */
  getDecisions() {
    return Array.from(this.entries.values()).filter((e) => e.type === "decisions").map((e) => ({
      title: e.title,
      description: e.content,
      rationale: e.metadata.rationale,
      review: e.metadata.review,
      timestamp: e.timestamp
    }));
  }
  /**
   * Get all learnings
   */
  getLearnings() {
    return Array.from(this.entries.values()).filter((e) => e.type === "learnings").map((e) => ({
      title: e.title,
      content: e.content,
      category: e.metadata.category,
      timestamp: e.timestamp
    }));
  }
  /**
   * Get stats
   */
  async getStats() {
    let lastSync;
    for (const entry of this.entries.values()) {
      if (!lastSync || entry.timestamp > lastSync) {
        lastSync = entry.timestamp;
      }
    }
    return {
      count: this.entries.size,
      lastSync
    };
  }
  /**
   * Disconnect (stop watching)
   */
  async disconnect() {
    this.stopWatching();
    this.entries.clear();
    this.initialized = false;
  }
};
function createMarkdownLoader(memoryPath) {
  return new MarkdownLoader(memoryPath);
}

// src/memory/unified/learning-sync.ts
var LearningSyncBridge = class {
  source = "learning";
  learningStore;
  graphiti;
  initialized = false;
  syncEnabled = true;
  constructor(store, graphiti, options) {
    this.learningStore = store ?? learningStore;
    this.graphiti = graphiti ?? null;
    this.syncEnabled = options?.syncEnabled ?? true;
  }
  /**
   * Initialize the bridge
   */
  async initialize() {
    if (this.initialized) return true;
    try {
      if (this.syncEnabled) {
        this.setupEventHandlers();
      }
      this.initialized = true;
      console.log(
        `[LearningSyncBridge] Initialized with ${this.learningStore.getActive().length} active learnings`
      );
      return true;
    } catch (error) {
      console.error("[LearningSyncBridge] Failed to initialize:", error);
      return false;
    }
  }
  /**
   * Check if adapter is available
   */
  isAvailable() {
    return this.initialized;
  }
  /**
   * Set up bidirectional sync handlers
   */
  setupEventHandlers() {
    this.learningStore.on("learning:created", async (learning) => {
      if (!this.graphiti) return;
      try {
        const node = await this.graphiti.addFact(
          `learning:${learning.type}:${learning.id}`,
          learning.insight,
          {
            learningId: learning.id,
            type: learning.type,
            confidence: learning.confidence,
            expectedBenefit: learning.expectedBenefit,
            entities: learning.entities,
            source: "learning-store"
          }
        );
        for (const entity of learning.entities) {
          if (entity.type === "skill") {
            console.log(
              `[LearningSyncBridge] Would link to skill: ${entity.id}`
            );
          }
        }
        console.log(
          `[LearningSyncBridge] Synced learning ${learning.id} to Graphiti as ${node.id}`
        );
      } catch (error) {
        console.warn(
          `[LearningSyncBridge] Failed to sync learning to Graphiti:`,
          error
        );
      }
    });
    this.learningStore.on("learning:updated", async (learning) => {
      if (!this.graphiti) return;
      console.log(`[LearningSyncBridge] Learning updated: ${learning.id}`);
    });
    this.learningStore.on("learning:deprecated", async (learning) => {
      console.log(`[LearningSyncBridge] Learning deprecated: ${learning.id}`);
    });
  }
  /**
   * Query learnings
   */
  async query(query, options) {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const lowerQuery = query.toLowerCase();
    let learnings;
    if (query && query.trim()) {
      learnings = this.learningStore.findRelevant(query, limit * 2);
    } else {
      learnings = this.learningStore.getActive();
    }
    const results = [];
    for (const learning of learnings) {
      let score = learning.confidence;
      if (query) {
        if (learning.insight.toLowerCase().includes(lowerQuery)) {
          score += 0.3;
        }
        if (learning.type.toLowerCase().includes(lowerQuery)) {
          score += 0.2;
        }
        for (const trigger of learning.triggerConditions) {
          if (trigger.value.toLowerCase().includes(lowerQuery)) {
            score += trigger.weight * 0.5;
          }
        }
      }
      if (learning.actualBenefit !== void 0) {
        score *= 0.5 + learning.actualBenefit * 0.5;
      }
      score = Math.min(1, score);
      if (score >= minScore || query === "") {
        results.push({
          id: learning.id,
          source: "learning",
          content: learning.insight,
          score,
          metadata: {
            type: learning.type,
            key: `${learning.type}:${learning.id}`,
            timestamp: new Date(learning.updatedAt),
            confidence: learning.confidence,
            applicationCount: learning.applicationCount,
            actualBenefit: learning.actualBenefit,
            expectedBenefit: learning.expectedBenefit,
            entities: learning.entities,
            triggerConditions: learning.triggerConditions
          }
        });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  /**
   * Write a new learning
   */
  async write(payload) {
    if (payload.type !== "learning") {
      console.warn(
        `[LearningSyncBridge] Cannot write type ${payload.type}, only 'learning' supported`
      );
      return null;
    }
    try {
      const learning = this.learningStore.create({
        type: payload.metadata?.learningType ?? "pattern",
        insight: payload.content,
        confidence: payload.metadata?.confidence ?? 0.7,
        evidence: [],
        triggerConditions: payload.metadata?.triggers ?? [
          {
            type: "keyword",
            value: payload.key ?? payload.content.slice(0, 30),
            weight: 1
          }
        ],
        entities: payload.metadata?.entities ?? [],
        expectedBenefit: payload.metadata?.expectedBenefit ?? 0.5
      });
      this.learningStore.save();
      return learning.id;
    } catch (error) {
      console.error("[LearningSyncBridge] Failed to write learning:", error);
      return null;
    }
  }
  /**
   * Get stats
   */
  async getStats() {
    const stats = this.learningStore.getStats();
    return {
      count: stats.activeLearnings
    };
  }
  /**
   * Get learnings for a specific entity (skill, mode, etc.)
   */
  getForEntity(entityType, entityId) {
    return this.learningStore.getForEntity(entityType, entityId);
  }
  /**
   * Get learnings by type
   */
  getByType(type) {
    return this.learningStore.getByType(type);
  }
  /**
   * Record that a learning was applied
   */
  recordApplication(learningId, success) {
    this.learningStore.recordApplication(learningId, success);
    this.learningStore.save();
  }
  /**
   * Connect to Graphiti for bidirectional sync
   */
  connectGraphiti(graphiti) {
    this.graphiti = graphiti;
    if (this.initialized && this.syncEnabled) {
      this.setupEventHandlers();
    }
  }
  /**
   * Sync all existing learnings to Graphiti
   */
  async syncAllToGraphiti() {
    if (!this.graphiti) {
      console.warn("[LearningSyncBridge] No Graphiti instance connected");
      return 0;
    }
    const learnings = this.learningStore.getActive();
    let synced = 0;
    for (const learning of learnings) {
      try {
        await this.graphiti.addFact(
          `learning:${learning.type}:${learning.id}`,
          learning.insight,
          {
            learningId: learning.id,
            type: learning.type,
            confidence: learning.confidence,
            expectedBenefit: learning.expectedBenefit,
            source: "learning-store-sync"
          }
        );
        synced++;
      } catch (error) {
        console.warn(
          `[LearningSyncBridge] Failed to sync learning ${learning.id}:`,
          error
        );
      }
    }
    console.log(
      `[LearningSyncBridge] Synced ${synced}/${learnings.length} learnings to Graphiti`
    );
    return synced;
  }
  /**
   * Disconnect
   */
  async disconnect() {
    this.learningStore.removeAllListeners();
    this.graphiti = null;
    this.initialized = false;
  }
};
function createLearningSyncBridge(store, graphiti, options) {
  return new LearningSyncBridge(store, graphiti, options);
}

// src/memory/unified/adapters/hmlr-adapter.ts
var HMLRAdapter = class {
  source = "hmlr";
  graphiti;
  initialized = false;
  maxHops;
  temporalWindowMs;
  constructor(graphiti, options) {
    this.graphiti = graphiti;
    this.maxHops = options?.maxHops ?? 3;
    this.temporalWindowMs = options?.temporalWindowMs ?? 5 * 60 * 1e3;
  }
  /**
   * Initialize adapter
   */
  async initialize() {
    if (this.initialized) return true;
    try {
      await this.graphiti.search("test", { limit: 1 });
      this.initialized = true;
      console.log(
        "[HMLRAdapter] Initialized with TypeScript multi-hop reasoning"
      );
      return true;
    } catch (error) {
      console.warn(
        "[HMLRAdapter] Graphiti not available, HMLR disabled:",
        error
      );
      return false;
    }
  }
  /**
   * Check if adapter is available
   */
  isAvailable() {
    return this.initialized;
  }
  /**
   * Query with multi-hop reasoning
   */
  async query(query, options) {
    options?.maxHops ?? this.maxHops;
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const decision = this.getGovernorDecision(query);
    if (decision.action === "single_hop") {
      return this.singleHopQuery(query, limit, minScore);
    }
    return this.multiHopQuery(query, decision.maxHops, limit, minScore);
  }
  /**
   * Governor - Decide query strategy based on query analysis
   */
  getGovernorDecision(query) {
    const lowerQuery = query.toLowerCase();
    const multiHopIndicators = [
      "why",
      "because",
      "led to",
      "caused",
      "resulted in",
      "how did",
      "what happened after",
      "consequence",
      "history of",
      "evolution of",
      "chain of"
    ];
    const temporalIndicators = [
      "when",
      "yesterday",
      "last week",
      "before",
      "after",
      "since",
      "until",
      "during",
      "timeline"
    ];
    const graphIndicators = [
      "related",
      "connected",
      "depends on",
      "links to",
      "associated",
      "similar to",
      "based on"
    ];
    let multiHopScore = 0;
    let temporalScore = 0;
    let graphScore = 0;
    for (const indicator of multiHopIndicators) {
      if (lowerQuery.includes(indicator)) multiHopScore++;
    }
    for (const indicator of temporalIndicators) {
      if (lowerQuery.includes(indicator)) temporalScore++;
    }
    for (const indicator of graphIndicators) {
      if (lowerQuery.includes(indicator)) graphScore++;
    }
    if (multiHopScore >= 2 || multiHopScore >= 1 && graphScore >= 1) {
      return {
        action: "multi_hop",
        maxHops: Math.min(5, 2 + multiHopScore),
        confidence: 0.8 + multiHopScore * 0.05,
        reasoning: `Detected ${multiHopScore} multi-hop indicators, ${graphScore} graph indicators`
      };
    }
    if (temporalScore >= 2) {
      return {
        action: "temporal",
        maxHops: 2,
        confidence: 0.7 + temporalScore * 0.1,
        reasoning: `Detected ${temporalScore} temporal indicators`
      };
    }
    if (graphScore >= 2) {
      return {
        action: "graph",
        maxHops: 2,
        confidence: 0.75 + graphScore * 0.05,
        reasoning: `Detected ${graphScore} graph relationship indicators`
      };
    }
    return {
      action: "single_hop",
      maxHops: 1,
      confidence: 0.9,
      reasoning: "No multi-hop indicators detected, using direct semantic search"
    };
  }
  /**
   * Single-hop semantic search
   */
  async singleHopQuery(query, limit, minScore) {
    const results = await this.graphiti.search(query, { limit });
    return results.filter((r) => r.score >= minScore).map((r) => this.searchResultToUnified(r, 0));
  }
  /**
   * Multi-hop query - chain facts via relationships with temporal validation
   */
  async multiHopQuery(query, maxHops, limit, minScore) {
    const results = [];
    const visited = /* @__PURE__ */ new Set();
    const reasoning = [];
    const initial = await this.graphiti.search(query, {
      limit: Math.ceil(limit / 2)
    });
    reasoning.push(`Hop 0: Found ${initial.length} initial matches`);
    for (const searchResult of initial) {
      if (visited.has(searchResult.node.id)) continue;
      visited.add(searchResult.node.id);
      const unified = this.searchResultToUnified(searchResult, 0);
      unified.metadata.reasoning = [...reasoning];
      results.push(unified);
    }
    for (let hop = 1; hop <= maxHops; hop++) {
      const currentLayer = results.filter((r) => r.metadata.hops === hop - 1);
      if (currentLayer.length === 0) {
        reasoning.push(`Hop ${hop}: No nodes to traverse from`);
        break;
      }
      let foundInHop = 0;
      for (const node of currentLayer) {
        const related = await this.graphiti.getRelated(node.id, { depth: 1 });
        for (const relatedNode of related) {
          if (visited.has(relatedNode.id)) continue;
          if (!this.isTemporallyValid(
            node.metadata.timestamp,
            relatedNode.createdAt
          )) {
            continue;
          }
          visited.add(relatedNode.id);
          foundInHop++;
          const decayFactor = Math.pow(0.7, hop);
          const score = node.score * decayFactor;
          if (score >= minScore) {
            results.push({
              id: relatedNode.id,
              source: "hmlr",
              content: relatedNode.value,
              score,
              metadata: {
                type: relatedNode.type,
                key: relatedNode.key,
                timestamp: relatedNode.createdAt,
                hops: hop,
                reasoning: [
                  ...reasoning,
                  `Hop ${hop}: Traversed from ${node.id}`
                ],
                originalNode: relatedNode
              }
            });
          }
        }
      }
      reasoning.push(`Hop ${hop}: Found ${foundInHop} new nodes`);
      if (foundInHop === 0) break;
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  /**
   * Temporal validation - only traverse if timestamps align
   * Either forward in time OR within the temporal window
   */
  isTemporallyValid(fromTime, toTime) {
    if (!fromTime || !toTime) return true;
    const diff = toTime.getTime() - fromTime.getTime();
    return diff >= -this.temporalWindowMs;
  }
  /**
   * Convert Graphiti SearchResult to UnifiedResult
   */
  searchResultToUnified(searchResult, hops) {
    return {
      id: searchResult.node.id,
      source: "hmlr",
      content: searchResult.node.value,
      score: searchResult.score,
      metadata: {
        type: searchResult.node.type,
        key: searchResult.node.key,
        timestamp: searchResult.node.createdAt,
        hops,
        originalNode: searchResult.node
      }
    };
  }
  /**
   * Extract facts from content using regex patterns
   * These can then be stored in Graphiti for future multi-hop queries
   */
  async extractFacts(content) {
    const facts = [];
    const now = /* @__PURE__ */ new Date();
    const patterns = [
      // Decisions
      {
        regex: /(?:decided|chose|selected|went with)\s+(?:to\s+)?(.+?)(?:\.|$)/gi,
        template: (m) => ({
          key: `decision:${m[1].slice(0, 30)}`,
          value: m[0],
          source: "extraction"
        })
      },
      // Learnings
      {
        regex: /(?:learned|discovered|found out|realized)\s+(?:that\s+)?(.+?)(?:\.|$)/gi,
        template: (m) => ({
          key: `learning:${m[1].slice(0, 30)}`,
          value: m[0],
          source: "extraction"
        })
      },
      // Fixes
      {
        regex: /(?:fixed|resolved|solved)\s+(.+?)\s+(?:by|with|using)\s+(.+?)(?:\.|$)/gi,
        template: (m) => ({
          key: `fix:${m[1].slice(0, 20)}`,
          value: `Fixed ${m[1]} by ${m[2]}`,
          source: "extraction"
        })
      },
      // Causes
      {
        regex: /(.+?)\s+(?:caused|led to|resulted in)\s+(.+?)(?:\.|$)/gi,
        template: (m) => ({
          key: `cause:${m[1].slice(0, 20)}`,
          value: `${m[1]} caused ${m[2]}`,
          source: "inference"
        })
      },
      // Requirements
      {
        regex: /(?:need|require|must have)\s+(.+?)\s+(?:for|to)\s+(.+?)(?:\.|$)/gi,
        template: (m) => ({
          key: `requirement:${m[1].slice(0, 20)}`,
          value: `Need ${m[1]} for ${m[2]}`,
          source: "extraction"
        })
      }
    ];
    for (const { regex, template } of patterns) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[0].length > 10) {
          const partial = template(match);
          facts.push({
            id: `fact_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
            key: partial.key,
            value: partial.value,
            confidence: 0.7,
            source: partial.source,
            createdAt: now,
            updatedAt: now
          });
        }
      }
    }
    return facts;
  }
  /**
   * Store extracted facts in Graphiti
   */
  async storeFacts(facts) {
    let stored = 0;
    for (const fact of facts) {
      try {
        await this.graphiti.addFact(fact.key, fact.value, {
          confidence: fact.confidence,
          source: fact.source,
          hmlrExtracted: true
        });
        stored++;
      } catch (error) {
        console.warn(`[HMLRAdapter] Failed to store fact:`, error);
      }
    }
    return stored;
  }
  /**
   * Full multi-hop query with result packaging
   */
  async fullMultiHopQuery(query, maxHops) {
    const results = await this.multiHopQuery(
      query,
      maxHops ?? this.maxHops,
      20,
      0.3
    );
    const hopsUsed = Math.max(...results.map((r) => r.metadata.hops ?? 0), 0);
    const reasoning = results[0]?.metadata.reasoning ?? [];
    const factsChained = results.map((r) => r.metadata.key ?? r.id);
    return {
      results,
      hopsUsed,
      reasoning,
      factsChained
    };
  }
  /**
   * Write - extracts facts from content and stores them
   */
  async write(payload) {
    const facts = await this.extractFacts(payload.content);
    if (facts.length === 0) {
      console.log("[HMLRAdapter] No facts extracted from content");
      return null;
    }
    const stored = await this.storeFacts(facts);
    console.log(`[HMLRAdapter] Extracted and stored ${stored} facts`);
    return `hmlr_batch_${Date.now()}`;
  }
  /**
   * Get stats
   */
  async getStats() {
    const graphitiStats = await this.graphiti.getStats();
    return {
      count: graphitiStats.totalMemories
    };
  }
  /**
   * Disconnect
   */
  async disconnect() {
    this.initialized = false;
  }
};
function createHMLRAdapter(graphiti, options) {
  return new HMLRAdapter(graphiti, options);
}

// src/memory/unified/unified-memory.ts
var GraphitiAdapter = class {
  source = "graphiti";
  graphiti;
  initialized = false;
  constructor(graphiti) {
    this.graphiti = graphiti;
  }
  async initialize() {
    if (this.initialized) return true;
    await this.graphiti.connect();
    this.initialized = true;
    return true;
  }
  isAvailable() {
    return this.initialized;
  }
  async query(query, options) {
    const results = await this.graphiti.search(query, {
      limit: options?.limit ?? 10
    });
    return results.map((r) => ({
      id: r.node.id,
      source: "graphiti",
      content: r.node.value,
      score: r.score,
      metadata: {
        type: r.node.type,
        key: r.node.key,
        timestamp: r.node.createdAt,
        originalNode: r.node
      }
    }));
  }
  async write(payload) {
    const node = await this.graphiti.addFact(
      payload.key ?? `${payload.type}:${Date.now()}`,
      payload.content,
      payload.metadata
    );
    return node.id;
  }
  async getStats() {
    const stats = await this.graphiti.getStats();
    return {
      count: stats.totalMemories,
      lastSync: stats.newestMemory ?? void 0
    };
  }
  async disconnect() {
    await this.graphiti.disconnect();
    this.initialized = false;
  }
  getGraphiti() {
    return this.graphiti;
  }
};
var UnifiedMemory = class extends EventEmitter {
  config;
  bus;
  initialized = false;
  // Adapters
  graphitiAdapter = null;
  markdownLoader = null;
  learningSyncBridge = null;
  hmlrAdapter = null;
  // Cache
  queryCache = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    const defaultConfig = {
      enableNeo4j: true,
      enableSQLite: true,
      enableClaudeMem: true,
      enableHMLR: true,
      projectRoot: process.cwd(),
      markdownMemoryPath: ".claude/memory",
      sessionLogsPath: ".claude/logs",
      maxContextTokens: 4e3,
      maxResults: 10,
      maxHops: 3,
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1e3
    };
    this.config = { ...defaultConfig, ...config };
    this.bus = createUnifiedBus();
  }
  /**
   * Initialize all memory sources
   */
  async initialize() {
    if (this.initialized) return;
    console.log("[UnifiedMemory] Initializing...");
    const graphiti = createMemory();
    this.graphitiAdapter = new GraphitiAdapter(graphiti);
    this.bus.registerAdapter(this.graphitiAdapter);
    const mdPath = join(
      this.config.projectRoot,
      this.config.markdownMemoryPath
    );
    this.markdownLoader = createMarkdownLoader(mdPath);
    this.bus.registerAdapter(this.markdownLoader);
    this.learningSyncBridge = createLearningSyncBridge(
      void 0,
      this.graphitiAdapter.getGraphiti(),
      { syncEnabled: true }
    );
    this.bus.registerAdapter(this.learningSyncBridge);
    if (this.config.enableHMLR) {
      this.hmlrAdapter = createHMLRAdapter(this.graphitiAdapter.getGraphiti(), {
        maxHops: this.config.maxHops
      });
      this.bus.registerAdapter(this.hmlrAdapter);
    }
    await this.bus.initialize();
    this.initialized = true;
    this.emit("ready");
    console.log(
      "[UnifiedMemory] Initialized with sources:",
      this.bus.getAvailableSources()
    );
  }
  /**
   * Auto-detect query type from query string
   */
  detectQueryType(query) {
    const lower = query.toLowerCase();
    if (lower.includes("why") || lower.includes("because") || lower.includes("led to") || lower.includes("caused") || lower.includes("history of")) {
      return "multi-hop";
    }
    if (lower.includes("yesterday") || lower.includes("last week") || lower.includes("when") || lower.includes("recent")) {
      return "temporal";
    }
    if (lower.includes("related") || lower.includes("connected") || lower.includes("depends")) {
      return "graph";
    }
    if (lower.includes("skill:") || lower.includes("mcp:") || lower.startsWith("find ")) {
      return "keyword";
    }
    return "semantic";
  }
  /**
   * Get sources for a query type
   */
  getSourcesForQueryType(queryType) {
    const priorities = {
      semantic: ["graphiti", "learning", "markdown"],
      keyword: ["markdown", "learning"],
      graph: ["graphiti", "hmlr", "learning"],
      temporal: ["graphiti", "markdown"],
      structured: ["graphiti"],
      "multi-hop": ["hmlr", "graphiti", "learning"]
    };
    return priorities[queryType] ?? ["graphiti", "markdown", "learning"];
  }
  /**
   * Query across all available memory sources
   */
  async query(params) {
    if (!this.initialized) {
      await this.initialize();
    }
    const { query } = params;
    const queryType = params.type ?? this.detectQueryType(query);
    const limit = params.limit ?? this.config.maxResults;
    const minScore = params.minScore ?? 0.3;
    const cacheKey = `${queryType}:${query}:${limit}`;
    if (this.config.cacheEnabled) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        return cached.results;
      }
    }
    this.emit("query:start", params);
    const startTime = Date.now();
    const sources = params.sources ?? this.getSourcesForQueryType(queryType);
    const availableSources = sources.filter((s) => this.bus.isAvailable(s));
    const results = await this.bus.queryParallel(query, availableSources, {
      limit: limit * 2,
      // Get more and filter
      minScore
    });
    const seen = /* @__PURE__ */ new Set();
    const dedupedResults = results.filter((r) => {
      const contentKey = r.content.slice(0, 100).toLowerCase();
      if (seen.has(contentKey)) return false;
      seen.add(contentKey);
      return true;
    });
    const finalResults = dedupedResults.slice(0, limit);
    const latency = Date.now() - startTime;
    if (this.config.cacheEnabled) {
      this.queryCache.set(cacheKey, {
        results: finalResults,
        timestamp: Date.now()
      });
    }
    this.emit("query:complete", query, finalResults, latency);
    return finalResults;
  }
  /**
   * Write to appropriate destinations
   */
  async write(payload) {
    if (!this.initialized) {
      await this.initialize();
    }
    const writeRoutes = {
      fact: ["graphiti"],
      episode: ["graphiti"],
      learning: ["learning", "graphiti"],
      win: ["markdown", "graphiti"],
      decision: ["markdown", "graphiti"],
      goal: ["graphiti", "learning"],
      improvement: ["graphiti", "learning"]
    };
    const destinations = payload.destinations ?? writeRoutes[payload.type] ?? ["graphiti"];
    const result = await this.bus.writeToDestinations(payload, destinations);
    this.emit("write:complete", payload, result);
    return result;
  }
  /**
   * Get context bundle for a topic
   */
  async getContext(topic, maxTokens) {
    const tokenLimit = maxTokens ?? this.config.maxContextTokens;
    const results = await this.query({
      query: topic,
      type: "semantic",
      limit: 20
    });
    let tokenEstimate = 0;
    const filteredResults = [];
    for (const result of results) {
      const resultTokens = Math.ceil(result.content.length / 4);
      if (tokenEstimate + resultTokens <= tokenLimit) {
        filteredResults.push(result);
        tokenEstimate += resultTokens;
      }
    }
    const sources = {
      graphiti: 0,
      learning: 0,
      sqlite: 0,
      context: 0,
      markdown: 0,
      session: 0,
      "claude-mem": 0,
      hmlr: 0
    };
    for (const result of filteredResults) {
      sources[result.source]++;
    }
    return {
      results: filteredResults,
      sources,
      tokenEstimate,
      query: topic,
      queryType: "semantic"
    };
  }
  /**
   * Multi-hop query using HMLR
   */
  async multiHopQuery(query, maxHops) {
    if (!this.hmlrAdapter || !this.hmlrAdapter.isAvailable()) {
      console.warn(
        "[UnifiedMemory] HMLR not available, falling back to semantic query"
      );
      return this.query({ query, type: "semantic" });
    }
    return this.hmlrAdapter.query(query, {
      maxHops: maxHops ?? this.config.maxHops,
      limit: this.config.maxResults
    });
  }
  /**
   * Get memory stats
   */
  async getStats() {
    const stats = {
      sources: {
        graphiti: { available: false, count: 0 },
        learning: { available: false, count: 0 },
        sqlite: { available: false, count: 0 },
        context: { available: false, count: 0 },
        markdown: { available: false, count: 0 },
        session: { available: false, count: 0 },
        "claude-mem": { available: false, count: 0 },
        hmlr: { available: false, count: 0 }
      },
      totalMemories: 0,
      backends: {
        neo4j: false,
        sqlite: false,
        claudeMem: false,
        hmlr: false
      }
    };
    const availableSources = this.bus.getAvailableSources();
    for (const source of availableSources) {
      const adapter = this.bus.getAdapter(source);
      if (adapter?.getStats) {
        const adapterStats = await adapter.getStats();
        stats.sources[source] = {
          available: true,
          count: adapterStats.count,
          lastSync: adapterStats.lastSync
        };
        stats.totalMemories += adapterStats.count;
      } else {
        stats.sources[source] = { available: true, count: 0 };
      }
    }
    stats.backends.neo4j = this.graphitiAdapter?.isAvailable() ?? false;
    stats.backends.hmlr = this.hmlrAdapter?.isAvailable() ?? false;
    return stats;
  }
  /**
   * Format status for display
   */
  async formatStatus() {
    const stats = await this.getStats();
    const sources = this.bus.getAvailableSources();
    let output = `
\u250C\u2500 UNIFIED MEMORY STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  SOURCES: ${sources.length} available                                        \u2502
`;
    for (const [source, info] of Object.entries(stats.sources)) {
      if (info.available) {
        output += `\u2502  \u2022 ${source.padEnd(12)}: ${String(info.count).padEnd(6)} memories                      \u2502
`;
      }
    }
    output += `\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500  \u2502
\u2502  TOTAL: ${String(stats.totalMemories).padEnd(6)} memories                                    \u2502
\u2502  HMLR: ${stats.backends.hmlr ? "\u25CF ENABLED" : "\u25CB DISABLED"}                                          \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
    return output;
  }
  /**
   * Clear query cache
   */
  clearCache() {
    this.queryCache.clear();
  }
  /**
   * Shutdown
   */
  async shutdown() {
    await this.bus.shutdown();
    this.initialized = false;
    this.queryCache.clear();
    console.log("[UnifiedMemory] Shutdown complete");
  }
  /**
   * Get the underlying bus
   */
  getBus() {
    return this.bus;
  }
  /**
   * Get Graphiti instance
   */
  getGraphiti() {
    return this.graphitiAdapter?.getGraphiti() ?? null;
  }
};
async function createUnifiedMemory(config) {
  const memory = new UnifiedMemory(config);
  await memory.initialize();
  return memory;
}
var globalMemory = null;
function getUnifiedMemory() {
  if (!globalMemory) {
    globalMemory = new UnifiedMemory();
  }
  return globalMemory;
}

// src/memory/unified/types.ts
({
  projectRoot: process.cwd()});

export { DEFAULT_EVOLUTION_CONFIG, createUnifiedMemory, generateId, getUnifiedMemory, hashTask, truncate };
