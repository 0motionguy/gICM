/**
 * OPUS 67 v4.1 - Learning Loop
 *
 * Records interactions, extracts patterns, and improves over time.
 * Stores learnings locally with AContext cloud sync for auto-SOP generation.
 */

import * as fs from "fs";
import * as path from "path";
import { getSkillMetadataLoader } from "./skill-metadata.js";
import { getLearningObserver, type SOP } from "../agents/learning-observer.js";

// =============================================================================
// TYPES
// =============================================================================

export interface Interaction {
  id: string;
  timestamp: number;
  task: string;
  skills: string[];
  mode: string;
  outcome: "success" | "partial" | "failed";
  confidence: number;
  latencyMs: number;
  tokensUsed: number;
  feedback?: UserFeedback;
  context?: Record<string, unknown>;
}

export interface UserFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  corrections?: string[];
  timestamp: number;
}

export interface LearnedPattern {
  id: string;
  type: "skill_combo" | "task_pattern" | "anti_pattern" | "optimization";
  pattern: string;
  confidence: number;
  occurrences: number;
  lastSeen: number;
  metadata: Record<string, unknown>;
}

export interface LearningStats {
  totalInteractions: number;
  successRate: number;
  avgConfidence: number;
  avgLatencyMs: number;
  topSkills: Array<{ skillId: string; count: number }>;
  patterns: number;
  lastSync?: number;
}

export interface LearningConfig {
  dataDir: string;
  maxInteractions: number; // Max stored interactions
  syncEnabled: boolean;
  syncEndpoint?: string;
  syncApiKey?: string;
  autoLearn: boolean;
  minPatternOccurrences: number;
  // v4.1 AContext integration
  acontextEnabled: boolean;
  acontextApiUrl?: string;
  acontextApiKey?: string;
  autoSyncInterval?: number; // ms between auto-syncs (0 = disabled)
}

export interface AContextSyncResult {
  success: boolean;
  tasksRecorded: number;
  sopsGenerated: number;
  error?: string;
  timestamp: number;
}

// =============================================================================
// LEARNING LOOP
// =============================================================================

export class LearningLoop {
  private config: LearningConfig;
  private interactions: Interaction[] = [];
  private patterns: Map<string, LearnedPattern> = new Map();
  private initialized: boolean = false;
  private lastAContextSync: number = 0;
  private autoSyncTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      dataDir: config?.dataDir || this.getDefaultDataDir(),
      maxInteractions: config?.maxInteractions || 10000,
      syncEnabled: config?.syncEnabled ?? false,
      syncEndpoint: config?.syncEndpoint,
      syncApiKey: config?.syncApiKey,
      autoLearn: config?.autoLearn ?? true,
      minPatternOccurrences: config?.minPatternOccurrences || 3,
      // v4.1 AContext defaults
      acontextEnabled: config?.acontextEnabled ?? false,
      acontextApiUrl:
        config?.acontextApiUrl ||
        process.env.ACONTEXT_API_URL ||
        "http://localhost:8029/api/v1",
      acontextApiKey: config?.acontextApiKey || process.env.ACONTEXT_API_KEY,
      autoSyncInterval: config?.autoSyncInterval || 0, // Disabled by default
    };
  }

  /**
   * Initialize learning loop
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure data directory exists
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }

    // Load existing data
    await this.loadInteractions();
    await this.loadPatterns();

    // Start auto-sync timer if enabled
    if (
      this.config.acontextEnabled &&
      this.config.autoSyncInterval &&
      this.config.autoSyncInterval > 0
    ) {
      this.startAutoSync();
    }

    this.initialized = true;
    const acontextStatus = this.config.acontextEnabled
      ? " | AContext: enabled"
      : "";
    console.log(
      `[LearningLoop] Initialized with ${this.interactions.length} interactions, ${this.patterns.size} patterns${acontextStatus}`
    );
  }

  /**
   * Record an interaction
   */
  async record(
    interaction: Omit<Interaction, "id" | "timestamp">
  ): Promise<string> {
    await this.initialize();

    const id = this.generateId();
    const fullInteraction: Interaction = {
      ...interaction,
      id,
      timestamp: Date.now(),
    };

    this.interactions.push(fullInteraction);

    // Trim if over limit
    if (this.interactions.length > this.config.maxInteractions) {
      this.interactions = this.interactions.slice(-this.config.maxInteractions);
    }

    // Auto-learn patterns
    if (this.config.autoLearn) {
      await this.extractPatterns(fullInteraction);
    }

    // Save to disk
    await this.saveInteractions();

    return id;
  }

  /**
   * Add feedback to an interaction
   */
  async addFeedback(
    interactionId: string,
    feedback: Omit<UserFeedback, "timestamp">
  ): Promise<boolean> {
    const interaction = this.interactions.find((i) => i.id === interactionId);
    if (!interaction) return false;

    interaction.feedback = {
      ...feedback,
      timestamp: Date.now(),
    };

    // Update pattern confidence based on feedback
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
  private async extractPatterns(interaction: Interaction): Promise<void> {
    // Skill combination pattern
    if (interaction.skills.length >= 2 && interaction.outcome === "success") {
      const comboKey = interaction.skills.sort().join("+");
      await this.updatePattern({
        type: "skill_combo",
        pattern: comboKey,
        metadata: {
          skills: interaction.skills,
          avgConfidence: interaction.confidence,
        },
      });
    }

    // Task pattern (extract keywords)
    const taskKeywords = this.extractKeywords(interaction.task);
    if (taskKeywords.length > 0 && interaction.outcome === "success") {
      const taskPattern = taskKeywords.slice(0, 3).join(" ");
      await this.updatePattern({
        type: "task_pattern",
        pattern: taskPattern,
        metadata: {
          skills: interaction.skills,
          mode: interaction.mode,
        },
      });
    }

    // Optimization pattern (fast + high confidence)
    if (interaction.latencyMs < 1000 && interaction.confidence > 0.8) {
      await this.updatePattern({
        type: "optimization",
        pattern: `fast_${interaction.mode}`,
        metadata: {
          avgLatency: interaction.latencyMs,
          skills: interaction.skills,
        },
      });
    }
  }

  /**
   * Update or create a pattern
   */
  private async updatePattern(input: {
    type: LearnedPattern["type"];
    pattern: string;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    const key = `${input.type}:${input.pattern}`;
    const existing = this.patterns.get(key);

    if (existing) {
      existing.occurrences++;
      existing.lastSeen = Date.now();
      existing.confidence = Math.min(1, existing.confidence + 0.05);
      // Merge metadata
      existing.metadata = { ...existing.metadata, ...input.metadata };
    } else {
      this.patterns.set(key, {
        id: this.generateId(),
        type: input.type,
        pattern: input.pattern,
        confidence: 0.5,
        occurrences: 1,
        lastSeen: Date.now(),
        metadata: input.metadata,
      });
    }

    await this.savePatterns();
  }

  /**
   * Record an anti-pattern (something that didn't work)
   */
  private async recordAntiPattern(interaction: Interaction): Promise<void> {
    const key = `anti:${interaction.skills.sort().join("+")}`;

    await this.updatePattern({
      type: "anti_pattern",
      pattern: key,
      metadata: {
        task: interaction.task.slice(0, 100),
        reason: interaction.feedback?.comment || "Low rating",
      },
    });
  }

  /**
   * Reinforce a successful pattern
   */
  private async reinforcePattern(interaction: Interaction): Promise<void> {
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
  async getRecommendations(task: string): Promise<
    Array<{
      skills: string[];
      confidence: number;
      reason: string;
    }>
  > {
    await this.initialize();

    const recommendations: Array<{
      skills: string[];
      confidence: number;
      reason: string;
    }> = [];

    const taskKeywords = this.extractKeywords(task);

    // Find matching task patterns
    for (const [key, pattern] of this.patterns) {
      if (pattern.type === "task_pattern") {
        const patternWords = pattern.pattern.split(" ");
        const matchCount = patternWords.filter((w) =>
          taskKeywords.includes(w)
        ).length;

        if (
          matchCount >= 2 &&
          pattern.occurrences >= this.config.minPatternOccurrences
        ) {
          const skills = (pattern.metadata.skills as string[]) || [];
          recommendations.push({
            skills,
            confidence: pattern.confidence * (matchCount / patternWords.length),
            reason: `Matched pattern: "${pattern.pattern}" (${pattern.occurrences} uses)`,
          });
        }
      }
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations.slice(0, 5);
  }

  /**
   * Get anti-patterns to avoid
   */
  async getAntiPatterns(skills: string[]): Promise<
    Array<{
      pattern: string;
      reason: string;
    }>
  > {
    await this.initialize();

    const antiPatterns: Array<{ pattern: string; reason: string }> = [];
    const skillSet = new Set(skills);

    for (const [key, pattern] of this.patterns) {
      if (pattern.type === "anti_pattern") {
        const patternSkills = key.replace("anti:", "").split("+");
        const overlap = patternSkills.filter((s) => skillSet.has(s)).length;

        if (overlap >= 2) {
          antiPatterns.push({
            pattern: patternSkills.join(" + "),
            reason:
              (pattern.metadata.reason as string) || "Previously unsuccessful",
          });
        }
      }
    }

    return antiPatterns;
  }

  /**
   * Get learning statistics
   */
  async getStats(): Promise<LearningStats> {
    await this.initialize();

    const successCount = this.interactions.filter(
      (i) => i.outcome === "success"
    ).length;
    const avgConfidence =
      this.interactions.length > 0
        ? this.interactions.reduce((sum, i) => sum + i.confidence, 0) /
          this.interactions.length
        : 0;
    const avgLatency =
      this.interactions.length > 0
        ? this.interactions.reduce((sum, i) => sum + i.latencyMs, 0) /
          this.interactions.length
        : 0;

    // Count skill usage
    const skillCounts: Map<string, number> = new Map();
    for (const interaction of this.interactions) {
      for (const skill of interaction.skills) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
    }

    const topSkills = Array.from(skillCounts.entries())
      .map(([skillId, count]) => ({ skillId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalInteractions: this.interactions.length,
      successRate:
        this.interactions.length > 0
          ? successCount / this.interactions.length
          : 0,
      avgConfidence,
      avgLatencyMs: Math.round(avgLatency),
      topSkills,
      patterns: this.patterns.size,
    };
  }

  /**
   * Extract keywords from task
   */
  private extractKeywords(task: string): string[] {
    const stopWords = new Set([
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
      "their",
    ]);

    return task
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `learn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Load interactions from disk
   */
  private async loadInteractions(): Promise<void> {
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
  private async saveInteractions(): Promise<void> {
    const filePath = path.join(this.config.dataDir, "interactions.json");
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            version: "1.0.0",
            interactions: this.interactions,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("[LearningLoop] Failed to save interactions:", error);
    }
  }

  /**
   * Load patterns from disk
   */
  private async loadPatterns(): Promise<void> {
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
  private async savePatterns(): Promise<void> {
    const filePath = path.join(this.config.dataDir, "patterns.json");
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            version: "1.0.0",
            patterns: Object.fromEntries(this.patterns),
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("[LearningLoop] Failed to save patterns:", error);
    }
  }

  /**
   * Export learnings for cloud sync
   */
  async exportForSync(): Promise<{
    interactions: Interaction[];
    patterns: LearnedPattern[];
    exportedAt: string;
  }> {
    await this.initialize();

    return {
      interactions: this.interactions,
      patterns: Array.from(this.patterns.values()),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import learnings from cloud sync
   */
  async importFromSync(data: {
    interactions: Interaction[];
    patterns: LearnedPattern[];
  }): Promise<void> {
    await this.initialize();

    // Merge interactions (dedupe by ID)
    const existingIds = new Set(this.interactions.map((i) => i.id));
    for (const interaction of data.interactions) {
      if (!existingIds.has(interaction.id)) {
        this.interactions.push(interaction);
      }
    }

    // Merge patterns (take higher confidence)
    for (const pattern of data.patterns) {
      const key = `${pattern.type}:${pattern.pattern}`;
      const existing = this.patterns.get(key);

      if (!existing || pattern.confidence > existing.confidence) {
        this.patterns.set(key, pattern);
      }
    }

    // Trim and save
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
  private startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(async () => {
      try {
        await this.syncToAContext();
      } catch (error) {
        console.error("[LearningLoop] Auto-sync failed:", error);
      }
    }, this.config.autoSyncInterval!);

    console.log(
      `[LearningLoop] Auto-sync started (every ${this.config.autoSyncInterval! / 1000}s)`
    );
  }

  /**
   * Stop auto-sync timer
   */
  stopAutoSync(): void {
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
  async syncToAContext(): Promise<AContextSyncResult> {
    if (!this.config.acontextEnabled) {
      return {
        success: false,
        tasksRecorded: 0,
        sopsGenerated: 0,
        error: "AContext sync is disabled",
        timestamp: Date.now(),
      };
    }

    if (!this.config.acontextApiKey) {
      return {
        success: false,
        tasksRecorded: 0,
        sopsGenerated: 0,
        error: "AContext API key not configured",
        timestamp: Date.now(),
      };
    }

    await this.initialize();

    // Get interactions since last sync
    const unsyncedInteractions = this.interactions.filter(
      (i) => i.timestamp > this.lastAContextSync
    );

    if (unsyncedInteractions.length === 0) {
      return {
        success: true,
        tasksRecorded: 0,
        sopsGenerated: 0,
        timestamp: Date.now(),
      };
    }

    let tasksRecorded = 0;
    let sopsGenerated = 0;

    try {
      const observer = getLearningObserver();

      for (const interaction of unsyncedInteractions) {
        // Record task completion in AContext
        const taskPayload = {
          task: interaction.task,
          skills: interaction.skills,
          mode: interaction.mode,
          outcome: interaction.outcome,
          confidence: interaction.confidence,
          latencyMs: interaction.latencyMs,
          tokensUsed: interaction.tokensUsed,
          timestamp: interaction.timestamp,
          metadata: interaction.context || {},
        };

        const response = await fetch(`${this.config.acontextApiUrl}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.acontextApiKey}`,
          },
          body: JSON.stringify(taskPayload),
        });

        if (response.ok) {
          tasksRecorded++;

          // For successful interactions, also extract and submit SOP
          if (
            interaction.outcome === "success" &&
            interaction.skills.length >= 2
          ) {
            const sop = await observer.extractSOP({
              id: interaction.id,
              query: interaction.task,
              startTime: interaction.timestamp,
              endTime: interaction.timestamp + interaction.latencyMs,
              toolChain: [],
              skillsUsed: interaction.skills,
              success: true,
            });

            if (sop) {
              const sopResponse = await fetch(
                `${this.config.acontextApiUrl}/sops`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.config.acontextApiKey}`,
                  },
                  body: JSON.stringify({
                    id: sop.id,
                    use_when: sop.use_when,
                    preferences: sop.preferences,
                    tool_sops: sop.tool_sops,
                    created_at: sop.created_at,
                    success_rate: sop.success_rate,
                    usage_count: sop.usage_count,
                    sourceTask: interaction.task,
                  }),
                }
              );

              if (sopResponse.ok) {
                sopsGenerated++;
              }
            }
          }
        }
      }

      this.lastAContextSync = Date.now();

      console.log(
        `[LearningLoop] AContext sync complete: ${tasksRecorded} tasks, ${sopsGenerated} SOPs`
      );

      return {
        success: true,
        tasksRecorded,
        sopsGenerated,
        timestamp: this.lastAContextSync,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[LearningLoop] AContext sync failed:", errorMsg);

      return {
        success: false,
        tasksRecorded,
        sopsGenerated,
        error: errorMsg,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Import learnings from AContext
   * Pulls learned SOPs and patterns from the cloud
   */
  async importFromAContext(): Promise<{
    success: boolean;
    sopsImported: number;
    patternsImported: number;
    error?: string;
  }> {
    if (!this.config.acontextEnabled || !this.config.acontextApiKey) {
      return {
        success: false,
        sopsImported: 0,
        patternsImported: 0,
        error: "AContext not configured",
      };
    }

    try {
      // Fetch learned SOPs from AContext
      const response = await fetch(
        `${this.config.acontextApiUrl}/sops?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${this.config.acontextApiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`AContext API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        sops?: Array<{
          name: string;
          skills: string[];
          confidence: number;
        }>;
      };
      const sops = data.sops || [];

      let patternsImported = 0;

      // Convert SOPs to local patterns
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
                sopName: sop.name,
              },
            });
            patternsImported++;
          }
        }
      }

      if (patternsImported > 0) {
        await this.savePatterns();
      }

      console.log(
        `[LearningLoop] AContext import: ${sops.length} SOPs, ${patternsImported} new patterns`
      );

      return {
        success: true,
        sopsImported: sops.length,
        patternsImported,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[LearningLoop] AContext import failed:", errorMsg);

      return {
        success: false,
        sopsImported: 0,
        patternsImported: 0,
        error: errorMsg,
      };
    }
  }

  /**
   * Get AContext connection status
   */
  getAContextStatus(): {
    enabled: boolean;
    apiUrl: string;
    hasApiKey: boolean;
    lastSync: number | null;
    autoSyncEnabled: boolean;
    autoSyncInterval: number;
  } {
    return {
      enabled: this.config.acontextEnabled,
      apiUrl: this.config.acontextApiUrl || "",
      hasApiKey: !!this.config.acontextApiKey,
      lastSync: this.lastAContextSync > 0 ? this.lastAContextSync : null,
      autoSyncEnabled: !!this.autoSyncTimer,
      autoSyncInterval: this.config.autoSyncInterval || 0,
    };
  }

  /**
   * Clear all learnings
   */
  async clear(): Promise<void> {
    this.interactions = [];
    this.patterns.clear();
    this.stopAutoSync();
    await this.saveInteractions();
    await this.savePatterns();
  }

  /**
   * Get default data directory
   */
  private getDefaultDataDir(): string {
    return path.join(
      path.dirname(
        new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
      ),
      "../../data/learning"
    );
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: LearningLoop | null = null;

export function getLearningLoop(): LearningLoop {
  if (!instance) {
    instance = new LearningLoop();
  }
  return instance;
}

export function resetLearningLoop(): void {
  instance = null;
}
