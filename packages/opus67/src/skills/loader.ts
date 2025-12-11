/**
 * OPUS 67 - Skill Loader
 * Loads and manages the 100+ specialist skills with evolution-based learning
 */

import { readFileSync, existsSync } from "fs";
import { parse as parseYaml } from "yaml";
import { join } from "path";
import { EventEmitter } from "eventemitter3";
import type {
  UsageTracker,
  SignalCollector,
  AdaptiveMatcher,
  LearningStore,
  InvocationTrigger,
} from "../evolution/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SkillDefinition {
  id: string;
  name: string;
  category: string;
  tokens: number;
  priority: number;
  triggers: {
    extensions?: string[];
    keywords?: string[];
    directories?: string[];
    files?: string[];
  };
  mcp_connections?: string[];
  capabilities: string[];
  knowledge?: string;
}

export interface SkillRegistry {
  version: string;
  total_skills: number;
  skills: SkillDefinition[];
  loading: {
    max_concurrent_skills: number;
    priority_threshold: number;
    token_budget: number;
    always_load?: string[];
    manual_only?: string[];
  };
  bundles: Record<string, string[]>;
}

export interface LoadedSkill {
  id: string;
  name: string;
  knowledge: string;
  capabilities: string[];
  tokens: number;
}

export interface EvolutionIntegration {
  usageTracker?: UsageTracker;
  signalCollector?: SignalCollector;
  adaptiveMatcher?: AdaptiveMatcher;
  learningStore?: LearningStore;
  enabled: boolean;
}

interface SkillLoaderEvents {
  "skill:loaded": (skill: LoadedSkill, trigger: InvocationTrigger) => void;
  "skill:detected": (skillIds: string[], context: string) => void;
  "bundle:loaded": (bundleName: string, skills: LoadedSkill[]) => void;
  "evolution:enhanced": (original: string[], enhanced: string[]) => void;
}

// =============================================================================
// SKILL LOADER
// =============================================================================

export class SkillLoader extends EventEmitter<SkillLoaderEvents> {
  private registryPath: string;
  private registry: SkillRegistry | null = null;
  private loadedSkills: Map<string, LoadedSkill> = new Map();
  private knowledgePath: string;
  private evolution: EvolutionIntegration = { enabled: false };
  private currentTaskContext: string = "";

  constructor(registryPath: string) {
    super();
    this.registryPath = registryPath;
    this.knowledgePath = join(registryPath, "..", "definitions");
  }

  /**
   * Enable evolution-based learning integration
   */
  enableEvolution(integration: Omit<EvolutionIntegration, "enabled">): void {
    this.evolution = { ...integration, enabled: true };
    console.log("[SkillLoader] Evolution integration enabled");
  }

  /**
   * Disable evolution integration
   */
  disableEvolution(): void {
    this.evolution = { enabled: false };
  }

  /**
   * Set current task context for tracking
   */
  setTaskContext(context: string): void {
    this.currentTaskContext = context;

    // Start a new tracking session if evolution is enabled
    if (this.evolution.enabled && this.evolution.usageTracker) {
      this.evolution.usageTracker.startSession(context);
    }
  }

  /**
   * End current task/session
   */
  endTask(success?: boolean): void {
    if (this.evolution.enabled && this.evolution.usageTracker) {
      const outcome =
        success === undefined
          ? undefined
          : success
            ? ("success" as const)
            : ("failure" as const);
      this.evolution.usageTracker.endSession(outcome);
    }
    this.currentTaskContext = "";
  }

  /**
   * Load the skills registry from YAML
   */
  async loadRegistry(): Promise<SkillRegistry> {
    const content = readFileSync(this.registryPath, "utf-8");
    this.registry = parseYaml(content) as SkillRegistry;

    // Auto-load always_load skills
    if (this.registry.loading?.always_load) {
      for (const skillId of this.registry.loading.always_load) {
        await this.loadSkill(skillId);
      }
    }

    return this.registry;
  }

  /**
   * Get the raw registry
   */
  getRegistry(): SkillRegistry {
    if (!this.registry) {
      throw new Error("Registry not loaded. Call loadRegistry() first.");
    }
    return this.registry;
  }

  /**
   * Load skills for a detected task
   */
  async loadForTask(
    skillIds: string[],
    trigger: InvocationTrigger = "auto"
  ): Promise<LoadedSkill[]> {
    const loaded: LoadedSkill[] = [];
    let totalTokens = 0;
    const budget = this.registry?.loading?.token_budget || 50000;

    for (const skillId of skillIds) {
      const skill = this.findSkill(skillId);
      if (!skill) continue;

      // Check token budget
      if (totalTokens + skill.tokens > budget) {
        console.warn(
          `[SkillLoader] Token budget exceeded, skipping ${skillId}`
        );
        break;
      }

      const loadedSkill = await this.loadSkill(skillId, trigger);
      if (loadedSkill) {
        loaded.push(loadedSkill);
        totalTokens += loadedSkill.tokens;
      }
    }

    return loaded;
  }

  /**
   * Load a single skill by ID
   */
  async loadSkill(
    skillId: string,
    trigger: InvocationTrigger = "auto"
  ): Promise<LoadedSkill | null> {
    // Already loaded?
    if (this.loadedSkills.has(skillId)) {
      // Still track usage even if already loaded
      this.trackSkillUsage(
        skillId,
        this.loadedSkills.get(skillId)!.name,
        trigger
      );
      return this.loadedSkills.get(skillId)!;
    }

    const skill = this.findSkill(skillId);
    if (!skill) {
      console.warn(`[SkillLoader] Skill not found: ${skillId}`);
      return null;
    }

    // Check if manual-only
    if (this.registry?.loading?.manual_only?.includes(skillId)) {
      console.warn(`[SkillLoader] Skill ${skillId} is manual-only`);
      return null;
    }

    // Load knowledge (from inline or file)
    let knowledge = skill.knowledge || "";

    // Try loading extended knowledge from file
    const knowledgeFile = join(this.knowledgePath, `${skillId}.md`);
    if (existsSync(knowledgeFile)) {
      knowledge = readFileSync(knowledgeFile, "utf-8");
    }

    const loaded: LoadedSkill = {
      id: skill.id,
      name: skill.name,
      knowledge,
      capabilities: skill.capabilities,
      tokens: skill.tokens,
    };

    this.loadedSkills.set(skillId, loaded);
    console.log(`[SkillLoader] Loaded: ${skill.name} (${skill.tokens} tokens)`);

    // Track skill usage for evolution learning
    this.trackSkillUsage(skillId, skill.name, trigger);
    this.emit("skill:loaded", loaded, trigger);

    return loaded;
  }

  /**
   * Track skill usage for evolution learning
   */
  private trackSkillUsage(
    skillId: string,
    skillName: string,
    trigger: InvocationTrigger
  ): void {
    if (!this.evolution.enabled || !this.evolution.usageTracker) return;

    this.evolution.usageTracker.trackSkill(skillId, skillName, {
      trigger,
      taskContext: this.currentTaskContext,
      metadata: {
        loadedSkills: Array.from(this.loadedSkills.keys()),
      },
    });
  }

  /**
   * Load a bundle of skills
   */
  async loadBundle(bundleName: string): Promise<LoadedSkill[]> {
    if (!this.registry?.bundles?.[bundleName]) {
      throw new Error(`Bundle not found: ${bundleName}`);
    }

    const skillIds = this.registry.bundles[bundleName];
    const loaded = await this.loadForTask(skillIds, "bundle");

    this.emit("bundle:loaded", bundleName, loaded);
    return loaded;
  }

  /**
   * Find skill definition by ID
   */
  private findSkill(skillId: string): SkillDefinition | undefined {
    return this.registry?.skills.find((s) => s.id === skillId);
  }

  /**
   * Detect skills needed based on input (with optional evolution-enhanced selection)
   */
  detectSkills(input: string, filePaths?: string[]): string[] {
    if (!this.registry) return [];

    const detected: Set<string> = new Set();
    const lowerInput = input.toLowerCase();

    // Store task context for tracking
    this.currentTaskContext = input;

    for (const skill of this.registry.skills) {
      // Skip low-priority skills by default
      if (skill.priority > (this.registry.loading?.priority_threshold || 3)) {
        continue;
      }

      let matched = false;

      // Check keywords
      for (const keyword of skill.triggers.keywords || []) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          matched = true;
          break;
        }
      }

      // Check file extensions
      if (!matched && filePaths) {
        for (const ext of skill.triggers.extensions || []) {
          if (filePaths.some((p) => p.endsWith(ext))) {
            matched = true;
            break;
          }
        }
      }

      // Check directories
      if (!matched && filePaths) {
        for (const dir of skill.triggers.directories || []) {
          if (filePaths.some((p) => p.includes(dir))) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        detected.add(skill.id);
      }
    }

    // Sort by priority
    let sorted = Array.from(detected).sort((a, b) => {
      const skillA = this.findSkill(a);
      const skillB = this.findSkill(b);
      return (skillA?.priority || 99) - (skillB?.priority || 99);
    });

    // Apply evolution-based enhancements if enabled
    if (this.evolution.enabled && this.evolution.adaptiveMatcher) {
      sorted = this.enhanceWithLearnings(sorted, input, filePaths);
    }

    const maxSkills = this.registry.loading?.max_concurrent_skills || 5;
    const result = sorted.slice(0, maxSkills);

    this.emit("skill:detected", result, input);
    return result;
  }

  /**
   * Enhance skill selection using evolution learnings
   */
  private enhanceWithLearnings(
    skillIds: string[],
    taskContext: string,
    filePaths?: string[]
  ): string[] {
    if (!this.evolution.adaptiveMatcher) return skillIds;

    // Build entities for scoring
    const entities = skillIds.map((id) => {
      const skill = this.findSkill(id);
      return {
        id,
        type: "skill" as const,
        name: skill?.name ?? id,
        baseScore: 1 / (skill?.priority ?? 1), // Higher priority = higher score
      };
    });

    // Get enhanced scores from adaptive matcher
    const scores = this.evolution.adaptiveMatcher.enhanceScores(entities, {
      taskContext,
      filePaths,
      currentEntities: entities.map((e) => ({ type: e.type, id: e.id })),
    });

    // Get suggestions for additional skills we might have missed
    const suggestions = this.evolution.adaptiveMatcher.getSuggestions(
      entities.map((e) => ({ type: e.type, id: e.id })),
      { taskContext, filePaths }
    );

    // Add high-confidence suggestions
    for (const suggestion of suggestions) {
      if (suggestion.confidence > 0.6 && suggestion.entityType === "skill") {
        if (!scores.find((s) => s.entityId === suggestion.entityId)) {
          scores.push({
            entityId: suggestion.entityId,
            entityType: "skill",
            baseScore: 0.5,
            learningBoost: suggestion.confidence,
            appliedLearnings: [],
            finalScore: suggestion.confidence,
          });
        }
      }
    }

    // Sort by final score and extract IDs
    const enhanced = scores
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((s) => s.entityId);

    // Emit evolution event if results changed
    if (JSON.stringify(skillIds) !== JSON.stringify(enhanced)) {
      this.emit("evolution:enhanced", skillIds, enhanced);
    }

    return enhanced;
  }

  /**
   * Get warnings from evolution learnings
   */
  getEvolutionWarnings(): Array<{
    skillId: string;
    warning: string;
    confidence: number;
  }> {
    if (!this.evolution.enabled || !this.evolution.adaptiveMatcher) return [];

    const currentEntities = Array.from(this.loadedSkills.keys()).map((id) => ({
      type: "skill" as const,
      id,
    }));

    return this.evolution.adaptiveMatcher
      .getWarnings(currentEntities, {
        taskContext: this.currentTaskContext,
      })
      .map((w) => ({
        skillId: w.entityId,
        warning: w.warning,
        confidence: w.confidence,
      }));
  }

  /**
   * Get skill suggestions from evolution learnings
   */
  getEvolutionSuggestions(): Array<{
    skillId: string;
    reason: string;
    confidence: number;
  }> {
    if (!this.evolution.enabled || !this.evolution.adaptiveMatcher) return [];

    const currentEntities = Array.from(this.loadedSkills.keys()).map((id) => ({
      type: "skill" as const,
      id,
    }));

    return this.evolution.adaptiveMatcher
      .getSuggestions(currentEntities, {
        taskContext: this.currentTaskContext,
      })
      .map((s) => ({
        skillId: s.entityId,
        reason: s.reason,
        confidence: s.confidence,
      }));
  }

  /**
   * Get required MCP connections for loaded skills
   */
  getRequiredMCPs(): string[] {
    const mcps: Set<string> = new Set();

    for (const [_, skill] of this.loadedSkills) {
      const def = this.findSkill(skill.id);
      if (def?.mcp_connections) {
        def.mcp_connections.forEach((m) => mcps.add(m));
      }
    }

    return Array.from(mcps);
  }

  /**
   * Get list of loaded skills
   */
  getLoaded(): LoadedSkill[] {
    return Array.from(this.loadedSkills.values());
  }

  /**
   * Unload a skill
   */
  unload(skillId: string): boolean {
    return this.loadedSkills.delete(skillId);
  }

  /**
   * Unload all non-essential skills
   */
  cleanup(): void {
    const alwaysLoad = this.registry?.loading?.always_load || [];

    for (const [skillId] of this.loadedSkills) {
      if (!alwaysLoad.includes(skillId)) {
        this.loadedSkills.delete(skillId);
      }
    }
  }

  /**
   * Get stats
   */
  getStats(): { total: number; loaded: number; tokens: number } {
    let tokens = 0;
    for (const skill of this.loadedSkills.values()) {
      tokens += skill.tokens;
    }

    return {
      total: this.registry?.skills.length || 0,
      loaded: this.loadedSkills.size,
      tokens,
    };
  }

  /**
   * Format loaded skills for prompt injection
   */
  formatForPrompt(): string {
    if (this.loadedSkills.size === 0) {
      return "";
    }

    const sections: string[] = [];

    sections.push("## Active Skills\n");

    for (const skill of this.loadedSkills.values()) {
      sections.push(`### ${skill.name}`);
      sections.push(`**Capabilities:** ${skill.capabilities.join(", ")}`);
      if (skill.knowledge) {
        sections.push(`\n${skill.knowledge}`);
      }
      sections.push("---\n");
    }

    return sections.join("\n");
  }
}

export default SkillLoader;
