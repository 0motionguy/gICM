import { EventEmitter } from "events";
import type {
  ContextConfig,
  SkillEntry,
  ScoredSkill,
  InjectionResult,
  ContextStats,
  ContextEvents,
} from "./types.js";
import { ContextConfigSchema } from "./types.js";
import { rankSkills } from "./scorer.js";
import { parseSkillMd } from "./parser.js";

export class ContextEngine extends EventEmitter {
  private config: ContextConfig;
  private skills: Map<string, SkillEntry> = new Map();
  private hitCounts: Map<string, number> = new Map();
  private lastIndexed: Date | null = null;

  constructor(config?: Partial<ContextConfig>) {
    super();
    this.config = ContextConfigSchema.parse(config || {});
  }

  // Register a skill manually
  addSkill(skill: SkillEntry): void {
    this.skills.set(skill.id, skill);
  }

  // Register a skill from SKILL.md content
  addSkillFromMarkdown(content: string, path: string): SkillEntry | null {
    const skill = parseSkillMd(content, path);
    if (skill) {
      this.skills.set(skill.id, skill);
    }
    return skill;
  }

  // Index skills from an array of {content, path} pairs
  indexSkills(sources: Array<{ content: string; path: string }>): number {
    let count = 0;
    for (const source of sources) {
      const skill = this.addSkillFromMarkdown(source.content, source.path);
      if (skill) count++;
    }
    this.lastIndexed = new Date();
    this.emit("context:indexed", count);
    return count;
  }

  // Core: inject relevant context for a message
  inject(message: string): InjectionResult {
    const ranked = rankSkills(
      Array.from(this.skills.values()),
      message,
      this.config
    );

    const selected: ScoredSkill[] = [];
    let totalTokens = 0;

    for (const scored of ranked) {
      if (selected.length >= this.config.maxSkills) break;
      if (totalTokens + scored.skill.tokens > this.config.maxTokens) {
        this.emit(
          "context:budget-exceeded",
          totalTokens + scored.skill.tokens,
          this.config.maxTokens
        );
        continue; // Try next (smaller) skill
      }

      selected.push(scored);
      totalTokens += scored.skill.tokens;

      // Track hit counts
      const current = this.hitCounts.get(scored.skill.id) || 0;
      this.hitCounts.set(scored.skill.id, current + 1);
    }

    const prompt = this.formatPrompt(selected);

    this.emit(
      "context:injected",
      selected.map((s) => s.skill.id),
      totalTokens
    );

    return {
      skills: selected,
      totalTokens,
      budgetUsed:
        this.config.maxTokens > 0 ? totalTokens / this.config.maxTokens : 0,
      prompt,
    };
  }

  // Format selected skills into a prompt string
  private formatPrompt(skills: ScoredSkill[]): string {
    if (skills.length === 0) return "";

    const sections: string[] = ["## Loaded Context\n"];

    for (const { skill, score, matchReasons } of skills) {
      sections.push(`### ${skill.name} (relevance: ${score.toFixed(1)})`);
      if (skill.description) sections.push(`> ${skill.description}\n`);
      sections.push(skill.content);
      sections.push(""); // blank line separator
    }

    return sections.join("\n");
  }

  // Get stats
  getStats(): ContextStats {
    let totalTokens = 0;
    for (const skill of this.skills.values()) {
      totalTokens += skill.tokens;
    }

    const topSkills = Array.from(this.hitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, hitCount]) => ({ id, hitCount }));

    return {
      totalSkills: this.skills.size,
      totalTokens,
      lastIndexed: this.lastIndexed,
      avgTokensPerSkill:
        this.skills.size > 0 ? Math.round(totalTokens / this.skills.size) : 0,
      topSkills,
    };
  }

  // Get a specific skill
  getSkill(id: string): SkillEntry | undefined {
    return this.skills.get(id);
  }

  // Remove a skill
  removeSkill(id: string): boolean {
    this.hitCounts.delete(id);
    return this.skills.delete(id);
  }

  // Clear all skills
  clear(): void {
    this.skills.clear();
    this.hitCounts.clear();
    this.lastIndexed = null;
  }

  // Get all skill IDs
  getSkillIds(): string[] {
    return Array.from(this.skills.keys());
  }
}
