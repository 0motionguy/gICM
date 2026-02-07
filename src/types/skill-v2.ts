import { z } from "zod";

// ============================================================================
// Agent Skills v2 Types - Claude Agent Skills Protocol
// ============================================================================

// Reserved words that cannot appear in skill names or IDs
const RESERVED_WORDS = ["anthropic", "claude", "official"] as const;
type ReservedWord = (typeof RESERVED_WORDS)[number];

/**
 * Validates that a string does not contain reserved words.
 * Reserved words include: "anthropic", "claude", "official"
 */
const noReservedWords = (field: string) =>
  z.string().refine(
    (val) => {
      const lower = val.toLowerCase();
      return !RESERVED_WORDS.some((word) => lower.includes(word));
    },
    {
      message: `${field} cannot contain reserved words: ${RESERVED_WORDS.join(", ")}`,
    }
  );

// ============================================================================
// Skill Metadata Schema
// ============================================================================

/**
 * Skill metadata with strict validation per Agent Skills v2 spec.
 * - name: max 64 characters
 * - description: max 1024 characters
 * - No reserved words in name or ID
 */
export const SkillMetadataSchema = z.object({
  // Core identification
  skillId: noReservedWords("skillId")
    .min(1)
    .max(64)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "skillId must be lowercase alphanumeric with hyphens, not starting/ending with hyphen"
    ),
  name: noReservedWords("name").min(1).max(64),
  description: z.string().min(1).max(1024),

  // Version and author
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be semver format (e.g., 1.0.0)"),
  author: z.string().min(1).max(128),

  // Categorization
  category: z.string().min(1).max(64),
  tags: z.array(z.string().max(32)).max(10),

  // Discovery
  keywords: z.array(z.string().max(32)).max(20).optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string().max(32).default("MIT"),
});

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

// ============================================================================
// Progressive Disclosure Schema
// ============================================================================

/**
 * Token budget allocation across disclosure levels.
 * Level 1: Metadata only (~100 tokens) - always loaded
 * Level 2: Instructions (<5k tokens) - loaded on match
 * Level 3: Resources (unlimited) - loaded on demand
 */
export const ProgressiveDisclosureSchema = z.object({
  level1Tokens: z.number().int().min(0).max(200).default(100),
  level2Tokens: z.number().int().min(0).max(5000),
  level3Estimate: z.number().int().min(0), // No max - resources can be large
});

export type ProgressiveDisclosure = z.infer<typeof ProgressiveDisclosureSchema>;

// ============================================================================
// Code Execution Schema
// ============================================================================

/**
 * Code execution capabilities and constraints.
 * Defines sandbox mode, network access, and available packages.
 */
export const CodeExecutionSchema = z.object({
  sandbox: z.boolean().default(true),
  networkAccess: z.boolean().default(false),
  preinstalledPackages: z.array(z.string()).default([]),
  maxExecutionTime: z.number().int().min(1000).max(300000).optional(), // ms
  memoryLimit: z.number().int().min(64).max(4096).optional(), // MB
});

export type CodeExecution = z.infer<typeof CodeExecutionSchema>;

// ============================================================================
// Resources Schema
// ============================================================================

/**
 * External resources available to the skill.
 * - scripts: Executable scripts (bash, python, etc.)
 * - templates: Template files for generation
 * - references: Reference documentation
 */
export const SkillResourcesSchema = z.object({
  scripts: z.array(z.string()).default([]),
  templates: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
  examples: z.array(z.string()).optional(),
  schemas: z.array(z.string()).optional(), // JSON schemas, Zod schemas, etc.
});

export type SkillResources = z.infer<typeof SkillResourcesSchema>;

// ============================================================================
// Skill Content Levels
// ============================================================================

/**
 * Level 1: Metadata only - Always loaded for skill discovery.
 * Minimal token footprint (~100 tokens).
 */
export const SkillLevel1Schema = z.object({
  level: z.literal(1),
  metadata: SkillMetadataSchema,
  triggerPatterns: z.array(z.string()).min(1).max(20), // Patterns that activate this skill
  estimatedTokens: z.number().int().max(200),
});

export type SkillLevel1 = z.infer<typeof SkillLevel1Schema>;

/**
 * Level 2: Instructions - Loaded when skill is matched.
 * Contains the actual skill instructions (<5k tokens).
 */
export const SkillLevel2Schema = z.object({
  level: z.literal(2),
  systemPrompt: z.string().max(20000), // Main instructions
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  constraints: z.array(z.string()).optional(),
  outputFormat: z.string().optional(),
  estimatedTokens: z.number().int().max(5000),
});

export type SkillLevel2 = z.infer<typeof SkillLevel2Schema>;

/**
 * Level 3: Resources - Loaded on demand.
 * Contains external resources, no token limit.
 */
export const SkillLevel3Schema = z.object({
  level: z.literal(3),
  resources: SkillResourcesSchema,
  codeExecution: CodeExecutionSchema.optional(),
  externalApis: z
    .array(
      z.object({
        name: z.string(),
        baseUrl: z.string().url(),
        authType: z.enum(["none", "api_key", "bearer", "oauth"]),
        rateLimit: z.number().optional(),
      })
    )
    .optional(),
  estimatedTokens: z.number().int().optional(), // Can be very large
});

export type SkillLevel3 = z.infer<typeof SkillLevel3Schema>;

// ============================================================================
// Complete Skill Definition
// ============================================================================

/**
 * Complete Agent Skill v2 definition.
 * Combines all levels into a single deployable skill.
 */
export const AgentSkillV2Schema = z.object({
  // Schema version
  schemaVersion: z.literal("2.0"),

  // Content levels
  level1: SkillLevel1Schema,
  level2: SkillLevel2Schema,
  level3: SkillLevel3Schema.optional(),

  // Progressive disclosure config
  progressiveDisclosure: ProgressiveDisclosureSchema,

  // Compatibility
  compatibility: z
    .object({
      minClaudeVersion: z.string().optional(),
      requiredCapabilities: z
        .array(z.enum(["code_execution", "web_search", "file_access", "mcp"]))
        .optional(),
      platforms: z
        .array(z.enum(["claude", "api", "claude-code"]))
        .default(["claude"]),
    })
    .optional(),

  // Deployment status
  status: z
    .enum(["draft", "testing", "published", "deprecated"])
    .default("draft"),
  publishedAt: z.string().datetime().optional(),
  deprecatedAt: z.string().datetime().optional(),
  deprecationReason: z.string().optional(),
});

export type AgentSkillV2 = z.infer<typeof AgentSkillV2Schema>;

// ============================================================================
// Skill Validation Utilities
// ============================================================================

/**
 * Validates a skill ID against reserved words and format rules.
 */
export function validateSkillId(
  skillId: string
): { valid: true } | { valid: false; error: string } {
  // Check format
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(skillId)) {
    return {
      valid: false,
      error:
        "Skill ID must be lowercase alphanumeric with hyphens, not starting/ending with hyphen",
    };
  }

  // Check length
  if (skillId.length > 64) {
    return {
      valid: false,
      error: "Skill ID must be 64 characters or less",
    };
  }

  // Check reserved words
  const lower = skillId.toLowerCase();
  for (const word of RESERVED_WORDS) {
    if (lower.includes(word)) {
      return {
        valid: false,
        error: `Skill ID cannot contain reserved word: "${word}"`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates skill name against reserved words and length limits.
 */
export function validateSkillName(
  name: string
): { valid: true } | { valid: false; error: string } {
  // Check length
  if (name.length > 64) {
    return {
      valid: false,
      error: "Skill name must be 64 characters or less",
    };
  }

  // Check reserved words
  const lower = name.toLowerCase();
  for (const word of RESERVED_WORDS) {
    if (lower.includes(word)) {
      return {
        valid: false,
        error: `Skill name cannot contain reserved word: "${word}"`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculates total token estimate for a skill.
 */
export function calculateTotalTokens(skill: AgentSkillV2): number {
  const level1 = skill.level1.estimatedTokens;
  const level2 = skill.level2.estimatedTokens;
  const level3 = skill.level3?.estimatedTokens ?? 0;
  return level1 + level2 + level3;
}

/**
 * Type guard to check if a skill has Level 3 resources.
 */
export function hasLevel3Resources(
  skill: AgentSkillV2
): skill is AgentSkillV2 & { level3: SkillLevel3 } {
  return skill.level3 !== undefined;
}

// ============================================================================
// Skill Builder Types (for creating skills programmatically)
// ============================================================================

/**
 * Input type for creating a new skill.
 * Uses z.input to get the type before transforms/defaults.
 */
export type CreateSkillInput = z.input<typeof AgentSkillV2Schema>;

/**
 * Partial skill for updates.
 */
export type UpdateSkillInput = Partial<CreateSkillInput> & {
  skillId: string;
};

// ============================================================================
// Skill Registry Types
// ============================================================================

/**
 * Skill index entry for fast lookups (Level 1 only).
 */
export interface SkillIndexEntry {
  skillId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  triggerPatterns: string[];
  version: string;
  status: AgentSkillV2["status"];
}

/**
 * Skill search result with relevance score.
 */
export interface SkillSearchResult {
  skill: SkillIndexEntry;
  score: number;
  matchedPatterns: string[];
}

// ============================================================================
// OpenSkills Compatibility Types
// ============================================================================

/**
 * OpenSkills YAML frontmatter schema.
 * Compatible with Anthropic SKILL.md standard for:
 * - Claude Code (native)
 * - Cursor (via openskills)
 * - Windsurf (via openskills)
 * - Aider (via openskills)
 */
export const OpenSkillsFrontmatterSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(1024),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.0.0"),
  author: z.string().default("ClawdBot Community"),
  license: z.string().default("Apache-2.0"),

  // ClawdBot-specific extensions (optional, stripped for pure OpenSkills)
  gicm: z
    .object({
      progressiveDisclosure: z.boolean().default(false),
      tokenBudgets: z.array(z.number()).optional(), // [compact, expanded]
      tier: z.number().int().min(1).max(3).optional(),
      mcpConnections: z.array(z.string()).optional(),
    })
    .optional(),
});

export type OpenSkillsFrontmatter = z.infer<typeof OpenSkillsFrontmatterSchema>;

/**
 * Bundled resources for OpenSkills skills.
 * Maps to the `references/`, `scripts/`, `assets/` directories.
 */
export const OpenSkillsBundledResourcesSchema = z.object({
  references: z.array(z.string()).optional(), // Reference docs
  scripts: z.array(z.string()).optional(), // Executable scripts
  assets: z.array(z.string()).optional(), // Images, data files
});

export type OpenSkillsBundledResources = z.infer<
  typeof OpenSkillsBundledResourcesSchema
>;

/**
 * Complete OpenSkills-compatible skill definition.
 */
export const OpenSkillsSkillSchema = z.object({
  // YAML frontmatter
  frontmatter: OpenSkillsFrontmatterSchema,

  // Markdown content (after frontmatter)
  content: z.string(),

  // Bundled resources (optional)
  resources: OpenSkillsBundledResourcesSchema.optional(),

  // Source path (for internal tracking)
  sourcePath: z.string().optional(),
});

export type OpenSkillsSkill = z.infer<typeof OpenSkillsSkillSchema>;

/**
 * OpenSkills catalog entry for AGENTS.md generation.
 */
export interface OpenSkillsCatalogEntry {
  name: string;
  description: string;
  location: "project" | "global" | "plugin";
  skillId?: string;
  tags?: string[];
}

/**
 * Check if a skill has ClawdBot extensions.
 */
export function hasGicmExtensions(skill: OpenSkillsSkill): boolean {
  return skill.frontmatter.gicm !== undefined;
}

/**
 * Strip ClawdBot extensions for pure OpenSkills export.
 */
export function stripGicmExtensions(
  frontmatter: OpenSkillsFrontmatter
): Omit<OpenSkillsFrontmatter, "gicm"> {
  const { gicm: _, ...rest } = frontmatter;
  return rest;
}
