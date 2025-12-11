/**
 * Skill Transformer - Converts SKILL.md format to RegistryItem
 *
 * Handles parsing of Anthropic's official skill format (SKILL.md with YAML frontmatter)
 * into gICM RegistryItem format for marketplace integration.
 */

import type { RegistryItem } from "@/types/registry";

// ============================================================================
// Types
// ============================================================================

interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  author?: string;
  category?: string;
  tags?: string[];
  triggers?: string[];
}

interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  content: string;
}

// ============================================================================
// YAML Frontmatter Parser
// ============================================================================

/**
 * Parses YAML frontmatter from SKILL.md content.
 * Expects format:
 * ---
 * name: Skill Name
 * description: Description
 * ---
 * Content here...
 */
export function parseYamlFrontmatter(markdown: string): ParsedSkill {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    // No frontmatter, treat entire content as body
    return {
      frontmatter: {
        name: "Unknown Skill",
        description: "No description provided",
      },
      content: markdown,
    };
  }

  const [, yamlContent, bodyContent] = match;
  const frontmatter = parseSimpleYaml(yamlContent);

  return {
    frontmatter: {
      name: frontmatter.name || "Unknown Skill",
      description: frontmatter.description || "No description provided",
      version: frontmatter.version,
      author: frontmatter.author,
      category: frontmatter.category,
      tags: frontmatter.tags,
      triggers: frontmatter.triggers,
    },
    content: bodyContent.trim(),
  };
}

/**
 * Simple YAML parser for frontmatter (handles basic key: value pairs)
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();

    // Handle arrays (simple format: [item1, item2])
    if (value.startsWith("[") && value.endsWith("]")) {
      const items = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      result[key] = items;
    }
    // Handle quoted strings
    else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      result[key] = value.slice(1, -1);
    }
    // Handle plain values
    else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// Skill ID Generation
// ============================================================================

/**
 * Generates a valid skill ID from a name.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Adds prefix for namespacing
 */
export function generateSkillId(name: string, prefix = "anthropic"): string {
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${prefix}-${baseId}`;
}

// ============================================================================
// Category Mapping
// ============================================================================

const CATEGORY_MAP: Record<string, string> = {
  // Document skills
  docx: "Document Processing",
  pdf: "Document Processing",
  pptx: "Document Processing",
  xlsx: "Document Processing",
  "doc-coauthoring": "Document Processing",

  // Creative skills
  "algorithmic-art": "Creative & Design",
  "canvas-design": "Creative & Design",
  "frontend-design": "Creative & Design",
  "theme-factory": "Creative & Design",
  "slack-gif-creator": "Creative & Design",

  // Development skills
  "mcp-builder": "Development Tools",
  "web-artifacts-builder": "Development Tools",
  "webapp-testing": "Development Tools",

  // Enterprise skills
  "brand-guidelines": "Enterprise",
  "internal-comms": "Enterprise",

  // Meta skills
  "skill-creator": "Meta & Tooling",
};

/**
 * Maps a skill directory name to a category.
 */
export function mapCategory(skillName: string): string {
  const normalized = skillName.toLowerCase().replace(/\s+/g, "-");
  return CATEGORY_MAP[normalized] || "General";
}

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transforms a SKILL.md file into a RegistryItem.
 */
export function transformSkillMd(
  markdown: string,
  options: {
    skillName: string;
    prefix?: string;
    overrideCategory?: string;
  }
): RegistryItem {
  const { skillName, prefix = "anthropic", overrideCategory } = options;
  const parsed = parseYamlFrontmatter(markdown);

  const id = generateSkillId(parsed.frontmatter.name || skillName, prefix);
  const category = overrideCategory || mapCategory(skillName);

  // Extract trigger patterns from content or frontmatter
  const triggers =
    parsed.frontmatter.triggers || extractTriggers(parsed.content);

  return {
    id,
    name: parsed.frontmatter.name || skillName,
    description: parsed.frontmatter.description || `${skillName} skill`,
    type: "skill",
    category,
    author: parsed.frontmatter.author || "Anthropic",
    tags: parsed.frontmatter.tags || generateTags(skillName, category),
    content: parsed.content,
    // Optional fields
    skillId: id,
    progressiveDisclosure: {
      level1Tokens: estimateTokens(parsed.frontmatter.description || ""),
      level2Tokens: estimateTokens(parsed.content),
    },
    triggerPatterns: triggers,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts trigger patterns from skill content.
 * Looks for patterns like "when user asks about X" or specific keywords.
 */
function extractTriggers(content: string): string[] {
  const triggers: string[] = [];

  // Look for explicit trigger mentions
  const triggerMatches = content.match(/trigger[s]?:?\s*([^\n]+)/gi);
  if (triggerMatches) {
    for (const match of triggerMatches) {
      const trigger = match.replace(/trigger[s]?:?\s*/i, "").trim();
      if (trigger) triggers.push(trigger);
    }
  }

  // Extract key action verbs
  const actionVerbs = [
    "create",
    "generate",
    "build",
    "make",
    "design",
    "analyze",
    "convert",
  ];
  for (const verb of actionVerbs) {
    if (content.toLowerCase().includes(verb)) {
      triggers.push(verb);
    }
  }

  return triggers.length > 0 ? triggers : ["general"];
}

/**
 * Generates tags based on skill name and category.
 */
function generateTags(skillName: string, category: string): string[] {
  const tags = new Set<string>();

  // Add category-based tags
  tags.add(category.toLowerCase().replace(/\s+/g, "-"));

  // Add skill name parts
  const nameParts = skillName.toLowerCase().split(/[-_\s]+/);
  for (const part of nameParts) {
    if (part.length > 2) tags.add(part);
  }

  // Add common tags based on patterns
  if (skillName.includes("doc") || skillName.includes("pdf")) {
    tags.add("documents");
  }
  if (skillName.includes("design") || skillName.includes("art")) {
    tags.add("creative");
  }
  if (skillName.includes("test")) {
    tags.add("testing");
  }

  return Array.from(tags).slice(0, 10);
}

/**
 * Estimates token count for a string (rough approximation).
 * Uses ~4 characters per token as a baseline.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ============================================================================
// Batch Transformer
// ============================================================================

/**
 * Transforms multiple SKILL.md files into RegistryItems.
 */
export function transformMultipleSkills(
  skills: Array<{ name: string; content: string }>
): RegistryItem[] {
  return skills.map((skill) =>
    transformSkillMd(skill.content, { skillName: skill.name })
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { SkillFrontmatter, ParsedSkill };
