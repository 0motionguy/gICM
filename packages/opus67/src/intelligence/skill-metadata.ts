/**
 * OPUS 67 v4.0 - Skill Metadata System
 *
 * Deep semantic understanding of what each skill can and cannot do.
 * Powers anti-hallucination, capability validation, and intelligent routing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

export interface SkillCapability {
  action: string;
  confidence: number;  // 0-1
  requires_mcp?: string[];
}

export interface AntiHallucinationRule {
  trigger: string;  // Regex pattern
  response: string; // What to say instead
}

export interface SkillExample {
  task: string;
  approach: string;
  outcome: 'success' | 'partial' | 'failed';
  notes?: string;
}

export interface SkillSynergies {
  amplifying: string[];   // Skills that work well together
  conflicting: string[];  // Skills that should not be combined
  redundant?: string[];   // Skills that overlap
}

export interface DeepSkillMetadata {
  id: string;
  name?: string;

  // Semantic understanding
  semantic: {
    purpose: string;
    what_it_does: string[];
    what_it_cannot: string[];
  };

  // Capability definitions with confidence
  capabilities: SkillCapability[];

  // Anti-hallucination rules
  anti_hallucination: AntiHallucinationRule[];

  // Skill synergies
  synergies: SkillSynergies;

  // Usage examples
  examples: SkillExample[];

  // Token cost (from registry)
  token_cost?: number;

  // Tier (from registry)
  tier?: number;
}

export interface SkillMetadataIndex {
  version: string;
  total_skills: number;
  indexed_at: string;
  skills: Map<string, DeepSkillMetadata>;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize capabilities from different YAML formats to standard format
 * Format 1 (v4): { can: [{ name: { confidence, description } }], cannot: [...] }
 * Format 2 (standard): [{ action, confidence, requires_mcp }]
 */
/**
 * Normalize synergies from different YAML formats
 * Format 1 (v4): { amplifies, conflicts, works_well_with }
 * Format 2 (standard): { amplifying, conflicting, redundant }
 */
function normalizeSynergies(synergies: unknown): SkillSynergies {
  const defaults: SkillSynergies = { amplifying: [], conflicting: [] };
  if (!synergies || typeof synergies !== 'object') return defaults;

  const syn = synergies as Record<string, unknown>;

  return {
    amplifying: Array.isArray(syn.amplifying) ? syn.amplifying :
                Array.isArray(syn.amplifies) ? syn.amplifies : [],
    conflicting: Array.isArray(syn.conflicting) ? syn.conflicting :
                 Array.isArray(syn.conflicts) ? syn.conflicts : [],
    redundant: Array.isArray(syn.redundant) ? syn.redundant :
               Array.isArray(syn.works_well_with) ? syn.works_well_with : undefined
  };
}

function normalizeCapabilities(capabilities: unknown): SkillCapability[] {
  if (!capabilities) return [];

  // Already an array - standard format
  if (Array.isArray(capabilities)) {
    return capabilities;
  }

  // Object format with 'can' property
  if (typeof capabilities === 'object' && capabilities !== null) {
    const cap = capabilities as Record<string, unknown>;
    if ('can' in cap && Array.isArray(cap.can)) {
      return cap.can.map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          // Format: { name: { confidence, description } }
          const entries = Object.entries(item as Record<string, unknown>);
          if (entries.length > 0) {
            const [action, details] = entries[0];
            if (typeof details === 'object' && details !== null) {
              const d = details as Record<string, unknown>;
              return {
                action,
                confidence: typeof d.confidence === 'number' ? d.confidence : 0.5,
                requires_mcp: Array.isArray(d.requires_mcp) ? d.requires_mcp : undefined
              };
            }
          }
        }
        return { action: String(item), confidence: 0.5 };
      });
    }
  }

  return [];
}

// =============================================================================
// SKILL METADATA LOADER
// =============================================================================

export class SkillMetadataLoader {
  private metadataDir: string;
  private cache: Map<string, DeepSkillMetadata> = new Map();
  private indexLoaded: boolean = false;

  constructor(metadataDir?: string) {
    // Default to skills/metadata relative to package root
    // After bundling to dist/, we need to go up one level to reach skills/
    const baseDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

    // Try multiple possible locations (bundled vs source)
    const possiblePaths = [
      metadataDir,
      path.join(baseDir, '../skills/metadata'),      // From dist/
      path.join(baseDir, '../../skills/metadata'),   // From dist/intelligence/
      path.resolve(process.cwd(), 'packages/opus67/skills/metadata'), // Absolute fallback
      path.resolve(process.cwd(), 'skills/metadata') // CWD relative
    ].filter(Boolean) as string[];

    // Find first path that exists
    this.metadataDir = possiblePaths.find(p => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    }) || possiblePaths[0];
  }

  /**
   * Load all skill metadata files into memory
   */
  async loadAll(): Promise<Map<string, DeepSkillMetadata>> {
    if (this.indexLoaded && this.cache.size > 0) {
      return this.cache;
    }

    try {
      const files = fs.readdirSync(this.metadataDir)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

      for (const file of files) {
        const filePath = path.join(this.metadataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const raw = parseYaml(content) as Record<string, unknown>;

        if (raw.id) {
          // Normalize capabilities and synergies format
          const metadata: DeepSkillMetadata = {
            ...raw,
            capabilities: normalizeCapabilities(raw.capabilities),
            synergies: normalizeSynergies(raw.synergies)
          } as DeepSkillMetadata;
          this.cache.set(raw.id as string, metadata);
        }
      }

      this.indexLoaded = true;
    } catch (error) {
      // Directory might not exist yet - that's okay
      console.error(`[SkillMetadata] Could not load from ${this.metadataDir}:`, error);
    }

    return this.cache;
  }

  /**
   * Get metadata for a specific skill
   */
  async get(skillId: string): Promise<DeepSkillMetadata | null> {
    // Check cache first
    if (this.cache.has(skillId)) {
      return this.cache.get(skillId)!;
    }

    // Try to load individual file
    const filePath = path.join(this.metadataDir, `${skillId}.yaml`);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const raw = parseYaml(content) as Record<string, unknown>;
        // Normalize capabilities and synergies format
        const metadata: DeepSkillMetadata = {
          ...raw,
          capabilities: normalizeCapabilities(raw.capabilities),
          synergies: normalizeSynergies(raw.synergies)
        } as DeepSkillMetadata;
        this.cache.set(skillId, metadata);
        return metadata;
      }
    } catch (error) {
      console.error(`[SkillMetadata] Failed to load ${skillId}:`, error);
    }

    return null;
  }

  /**
   * Get all loaded skill IDs
   */
  getLoadedSkillIds(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if a skill can perform an action
   * Priority: capabilities > what_it_does > what_it_cannot
   * This ensures positive matches are found before negative exclusions
   */
  async canDo(skillId: string, action: string): Promise<{
    can: boolean;
    confidence: number;
    reasoning: string;
    requires_mcp?: string[];
  }> {
    const metadata = await this.get(skillId);

    if (!metadata) {
      return {
        can: false,
        confidence: 0,
        reasoning: `No metadata found for skill: ${skillId}`
      };
    }

    const actionLower = action.toLowerCase();
    const actionWords = actionLower.split(/\s+/);

    // FIRST: Check if action matches any capability (positive match first)
    const capabilities = metadata.capabilities ?? [];
    for (const cap of capabilities) {
      const capLower = cap.action.toLowerCase();
      // Check if action contains capability words or vice versa
      if (actionLower.includes(capLower) || capLower.includes(actionLower)) {
        return {
          can: true,
          confidence: cap.confidence,
          reasoning: `Skill can perform: ${cap.action}`,
          requires_mcp: cap.requires_mcp
        };
      }
      // Also check individual word matches for short actions like "swap"
      for (const word of actionWords) {
        if (word.length >= 3 && capLower.includes(word)) {
          return {
            can: true,
            confidence: cap.confidence * 0.9, // Slightly lower confidence for word match
            reasoning: `Skill capability matches "${word}": ${cap.action}`,
            requires_mcp: cap.requires_mcp
          };
        }
      }
    }

    // SECOND: Check what_it_does for partial matches
    const whatItDoes = metadata.semantic?.what_it_does ?? [];
    for (const canDoItem of whatItDoes) {
      const canDoLower = canDoItem.toLowerCase();
      if (actionLower.includes(canDoLower) || canDoLower.includes(actionLower)) {
        return {
          can: true,
          confidence: 0.7,
          reasoning: `Skill description includes: ${canDoItem}`
        };
      }
      // Word-level matching
      for (const word of actionWords) {
        if (word.length >= 3 && canDoLower.includes(word)) {
          return {
            can: true,
            confidence: 0.6,
            reasoning: `Skill description matches "${word}": ${canDoItem}`
          };
        }
      }
    }

    // THIRD: Check if action is in what_it_cannot (negative match last)
    // Only apply negative match if it's a strong match (action verb matches)
    const whatItCannot = metadata.semantic?.what_it_cannot ?? [];
    for (const cannot of whatItCannot) {
      const cannotLower = cannot.toLowerCase();
      // Require stronger match for exclusion - the full action phrase should match
      if (actionLower === cannotLower ||
          (actionLower.length > 5 && cannotLower.startsWith(actionLower)) ||
          (actionLower.length > 5 && actionLower.startsWith(cannotLower.split(' ')[0]))) {
        return {
          can: false,
          confidence: 0.9,
          reasoning: `Skill explicitly cannot: ${cannot}`
        };
      }
    }

    // Unknown capability - check purpose for weak match
    const purpose = metadata.semantic?.purpose?.toLowerCase() ?? '';
    for (const word of actionWords) {
      if (word.length >= 4 && purpose.includes(word)) {
        return {
          can: true,
          confidence: 0.5,
          reasoning: `Skill purpose mentions "${word}"`
        };
      }
    }

    return {
      can: false,
      confidence: 0.3,
      reasoning: `Action not found in skill capabilities or limitations`
    };
  }

  /**
   * Get anti-hallucination warning if query triggers a rule
   */
  async getAntiHallucinationWarning(skillId: string, query: string): Promise<string | null> {
    const metadata = await this.get(skillId);
    if (!metadata) return null;

    const queryLower = query.toLowerCase();

    // Handle different formats: array or object with 'rules' property
    let rules = metadata.anti_hallucination;
    if (!Array.isArray(rules)) {
      if (rules && typeof rules === 'object' && 'rules' in rules) {
        rules = (rules as { rules: AntiHallucinationRule[] }).rules;
      } else {
        return null; // No rules defined
      }
    }
    if (!Array.isArray(rules)) return null;

    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.trigger, 'i');
        if (regex.test(query)) {
          return rule.response;
        }
      } catch {
        // Fallback to simple includes if regex fails
        if (queryLower.includes(rule.trigger.toLowerCase())) {
          return rule.response;
        }
      }
    }

    return null;
  }

  /**
   * Get synergy information for skill combinations
   */
  async getSynergies(skillIds: string[]): Promise<{
    amplifying: Array<{ skills: string[]; reason: string }>;
    conflicting: Array<{ skills: string[]; reason: string }>;
    score: number;  // Overall synergy score 0-1
  }> {
    const result = {
      amplifying: [] as Array<{ skills: string[]; reason: string }>,
      conflicting: [] as Array<{ skills: string[]; reason: string }>,
      score: 1.0
    };

    for (const skillId of skillIds) {
      const metadata = await this.get(skillId);
      if (!metadata) continue;

      // Check for amplifying synergies
      for (const amp of metadata.synergies.amplifying) {
        if (skillIds.includes(amp)) {
          result.amplifying.push({
            skills: [skillId, amp],
            reason: `${skillId} works well with ${amp}`
          });
          result.score += 0.1;  // Boost score for good synergies
        }
      }

      // Check for conflicting synergies
      for (const conflict of metadata.synergies.conflicting) {
        if (skillIds.includes(conflict)) {
          result.conflicting.push({
            skills: [skillId, conflict],
            reason: `${skillId} conflicts with ${conflict}`
          });
          result.score -= 0.2;  // Penalize for conflicts
        }
      }
    }

    // Clamp score to 0-1
    result.score = Math.max(0, Math.min(1, result.score));

    return result;
  }

  /**
   * Get statistics about loaded metadata
   */
  getStats(): {
    totalSkills: number;
    withCapabilities: number;
    withAntiHallucination: number;
    withExamples: number;
  } {
    let withCapabilities = 0;
    let withAntiHallucination = 0;
    let withExamples = 0;

    for (const metadata of this.cache.values()) {
      if (metadata.capabilities?.length > 0) withCapabilities++;
      if (metadata.anti_hallucination?.length > 0) withAntiHallucination++;
      if (metadata.examples?.length > 0) withExamples++;
    }

    return {
      totalSkills: this.cache.size,
      withCapabilities,
      withAntiHallucination,
      withExamples
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: SkillMetadataLoader | null = null;

export function getSkillMetadataLoader(): SkillMetadataLoader {
  if (!instance) {
    instance = new SkillMetadataLoader();
  }
  return instance;
}

export function resetSkillMetadataLoader(): void {
  instance = null;
}
