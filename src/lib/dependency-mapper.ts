/**
 * Dependency Mapper for gICM Registry
 *
 * Multi-strategy dependency detection for registry items.
 * Detects potential dependencies using content analysis, tag matching,
 * keyword extraction, and structural patterns.
 */

import type { RegistryItem } from "@/types/registry";

// ============================================================================
// Types
// ============================================================================

export type DependencySource = "content" | "tags" | "keywords" | "pattern";

export interface DependencyCandidate {
  targetId: string;
  confidence: number; // 0-100
  source: DependencySource;
  reason: string;
}

export interface DetectionResult {
  itemId: string;
  candidates: DependencyCandidate[];
  existingDependencies: string[];
  newSuggestions: DependencyCandidate[];
}

export interface ConsolidatedCandidate extends DependencyCandidate {
  sources: DependencySource[];
  aggregateConfidence: number;
}

// ============================================================================
// Structural Pattern Mappings
// ============================================================================

/**
 * Agent type to skill type mapping rules
 * These encode domain knowledge about which skills are commonly needed by which agents
 */
export const AGENT_TO_SKILL_PATTERNS: Record<string, string[]> = {
  // Solana/Anchor agents
  "solana-anchor": [
    "solana-anchor-mastery",
    "cross-program-invocations",
    "solana-program-security",
  ],
  anchor: [
    "solana-anchor-mastery",
    "cross-program-invocations",
    "solana-program-security",
  ],
  solana: ["solana-anchor-mastery", "solana-program-security"],

  // Frontend/Next.js agents
  "next.js": ["nextjs-app-router-patterns", "web3-wallet-integration"],
  nextjs: ["nextjs-app-router-patterns", "web3-wallet-integration"],
  frontend: [
    "nextjs-app-router-patterns",
    "web3-wallet-integration",
    "tailwind-shadcn-design",
  ],
  react: [
    "nextjs-app-router-patterns",
    "web3-wallet-integration",
    "tailwind-shadcn-design",
  ],

  // EVM/Solidity agents
  evm: [
    "evm-solidity-mastery",
    "smart-contract-security",
    "evm-gas-optimization",
  ],
  solidity: [
    "evm-solidity-mastery",
    "smart-contract-security",
    "evm-gas-optimization",
  ],
  ethereum: ["evm-solidity-mastery", "smart-contract-security"],

  // Database agents
  database: ["sql-optimization", "database-migration-strategies"],
  postgres: ["sql-optimization", "database-migration-strategies"],
  postgresql: ["sql-optimization", "database-migration-strategies"],
  sql: ["sql-optimization", "database-migration-strategies"],

  // API agents
  api: ["api-architecture-patterns", "api-versioning-strategies"],
  rest: ["api-architecture-patterns", "api-versioning-strategies"],
  graphql: ["graphql-schema-design"],

  // Security agents
  security: ["smart-contract-security", "solana-program-security"],
  auditor: ["smart-contract-security", "solana-program-security"],

  // TypeScript agents
  typescript: ["advanced-typescript-patterns", "strict-typescript"],
  "type-safe": ["advanced-typescript-patterns", "strict-typescript"],

  // DeFi agents
  defi: ["defi-integration", "bonding-curve-mastery"],
  "bonding-curve": ["bonding-curve-mastery", "defi-integration"],

  // Testing agents
  testing: ["foundry-testing-expert", "test-driven-development"],
  foundry: ["foundry-testing-expert"],
  hardhat: ["hardhat-deployment-specialist"],
};

/**
 * Skill to skill dependency patterns
 * Skills that commonly require other skills as prerequisites
 */
export const SKILL_DEPENDENCY_PATTERNS: Record<string, string[]> = {
  // Advanced skills depend on foundational skills
  "cross-program-invocations": ["solana-anchor-mastery"],
  "solana-program-security": ["solana-anchor-mastery"],
  "bonding-curve-mastery": ["solana-anchor-mastery"],
  "smart-contract-security": ["evm-solidity-mastery"],
  "evm-gas-optimization": ["evm-solidity-mastery"],
  "web3-wallet-integration": ["nextjs-app-router-patterns"],
  "account-abstraction-erc4337": ["evm-solidity-mastery"],
  "aave-flashloan-patterns": ["evm-solidity-mastery", "defi-integration"],
  "uniswap-v3-integration": ["evm-solidity-mastery", "defi-integration"],
};

/**
 * MCP to skill patterns
 * MCPs that work best with specific skills
 */
export const MCP_TO_SKILL_PATTERNS: Record<string, string[]> = {
  "mcp-solana": ["solana-anchor-mastery"],
  "mcp-anchor": ["solana-anchor-mastery"],
  "mcp-alchemy": ["evm-solidity-mastery"],
  "mcp-infura": ["evm-solidity-mastery"],
  "mcp-thegraph": ["graphql-schema-design"],
  "mcp-supabase": ["sql-optimization", "database-migration-strategies"],
  "mcp-postgresql": ["sql-optimization"],
};

// ============================================================================
// Strategy 1: Content Analysis
// ============================================================================

/**
 * Parse content (descriptions, file paths) for references to other items
 */
function analyzeContent(
  item: RegistryItem,
  allItems: RegistryItem[]
): DependencyCandidate[] {
  const candidates: DependencyCandidate[] = [];
  const searchText = [
    item.description,
    item.longDescription || "",
    ...(item.files || []),
  ]
    .join(" ")
    .toLowerCase();

  for (const target of allItems) {
    if (target.id === item.id) continue;
    if (item.dependencies?.includes(target.id)) continue;

    // Check for direct name/slug references
    const targetName = target.name.toLowerCase();
    const targetSlug = target.slug.toLowerCase();
    const targetId = target.id.toLowerCase();

    let confidence = 0;
    const reasons: string[] = [];

    // Direct ID reference (highest confidence)
    if (searchText.includes(targetId)) {
      confidence += 40;
      reasons.push(`Direct ID reference: "${target.id}"`);
    }

    // Name reference
    if (searchText.includes(targetName) && targetName.length > 3) {
      confidence += 30;
      reasons.push(`Name reference: "${target.name}"`);
    }

    // Slug reference
    if (
      searchText.includes(targetSlug) &&
      targetSlug.length > 3 &&
      targetSlug !== targetName
    ) {
      confidence += 25;
      reasons.push(`Slug reference: "${target.slug}"`);
    }

    // Check for partial matches on multi-word names
    const nameWords = targetName.split(/[\s-]+/).filter((w) => w.length > 4);
    const matchingWords = nameWords.filter((word) => searchText.includes(word));
    if (matchingWords.length >= 2) {
      confidence += 15;
      reasons.push(`Keyword match: ${matchingWords.join(", ")}`);
    }

    if (confidence > 0) {
      candidates.push({
        targetId: target.id,
        confidence: Math.min(confidence, 95),
        source: "content",
        reason: reasons.join("; "),
      });
    }
  }

  return candidates;
}

// ============================================================================
// Strategy 2: Tag Matching
// ============================================================================

/**
 * Items sharing 2+ identical tags have potential dependency relationships
 */
function analyzeTagMatching(
  item: RegistryItem,
  allItems: RegistryItem[]
): DependencyCandidate[] {
  const candidates: DependencyCandidate[] = [];
  const itemTags = new Set((item.tags || []).map((t) => t.toLowerCase()));

  if (itemTags.size === 0) return candidates;

  for (const target of allItems) {
    if (target.id === item.id) continue;
    if (item.dependencies?.includes(target.id)) continue;

    const targetTags = (target.tags || []).map((t) => t.toLowerCase());
    const matchingTags = targetTags.filter((t) => itemTags.has(t));

    if (matchingTags.length >= 2) {
      // Calculate confidence based on tag overlap percentage and count
      const overlapRatio =
        matchingTags.length / Math.min(itemTags.size, targetTags.length);
      const baseConfidence = Math.min(matchingTags.length * 15, 60);
      const confidence = Math.round(
        baseConfidence * (0.5 + overlapRatio * 0.5)
      );

      // Prefer skills as dependencies over other types
      const typeBonus = target.kind === "skill" ? 10 : 0;

      candidates.push({
        targetId: target.id,
        confidence: Math.min(confidence + typeBonus, 80),
        source: "tags",
        reason: `${matchingTags.length} shared tags: ${matchingTags.join(", ")}`,
      });
    }
  }

  return candidates;
}

// ============================================================================
// Strategy 3: Keyword Extraction
// ============================================================================

/**
 * Extract keywords from descriptions and match against item names
 */
function analyzeKeywords(
  item: RegistryItem,
  allItems: RegistryItem[]
): DependencyCandidate[] {
  const candidates: DependencyCandidate[] = [];

  // Extract meaningful keywords from description
  const keywords = extractKeywords(
    item.description + " " + (item.longDescription || "")
  );

  for (const target of allItems) {
    if (target.id === item.id) continue;
    if (item.dependencies?.includes(target.id)) continue;

    // Check how many keywords match the target name/slug
    const targetTerms = [
      target.name.toLowerCase(),
      target.slug.toLowerCase(),
      ...target.slug.split("-"),
    ];

    const matchingKeywords = keywords.filter((kw) =>
      targetTerms.some(
        (term) =>
          term.includes(kw) ||
          kw.includes(term) ||
          levenshteinSimilarity(kw, term) > 0.8
      )
    );

    if (matchingKeywords.length > 0) {
      const confidence = Math.min(matchingKeywords.length * 20, 70);

      candidates.push({
        targetId: target.id,
        confidence,
        source: "keywords",
        reason: `Keyword matches: ${matchingKeywords.join(", ")}`,
      });
    }
  }

  return candidates;
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  // Common stop words to filter out
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
    "shall",
    "can",
    "need",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "you",
    "your",
    "we",
    "our",
    "they",
    "their",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "also",
    "now",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "what",
    "which",
    "who",
    "whom",
    "up",
    "out",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "under",
    "again",
    "further",
    "then",
    "once",
    "using",
    "used",
    "uses",
    "use",
    "like",
    "based",
    "build",
    "builds",
    "built",
    "create",
    "creates",
    "created",
  ]);

  // Domain-specific terms to boost
  const domainTerms = new Set([
    "solana",
    "anchor",
    "ethereum",
    "evm",
    "solidity",
    "rust",
    "typescript",
    "javascript",
    "react",
    "nextjs",
    "next.js",
    "tailwind",
    "web3",
    "wallet",
    "defi",
    "nft",
    "token",
    "blockchain",
    "smart",
    "contract",
    "api",
    "graphql",
    "database",
    "sql",
    "postgres",
    "redis",
    "security",
    "audit",
    "testing",
    "foundry",
    "hardhat",
    "deploy",
    "integration",
    "optimization",
    "gas",
    "cpi",
    "pda",
    "account",
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Score and deduplicate
  const wordScores = new Map<string, number>();
  for (const word of words) {
    const score = domainTerms.has(word) ? 2 : 1;
    wordScores.set(word, (wordScores.get(word) || 0) + score);
  }

  // Return top keywords sorted by score
  return Array.from(wordScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

/**
 * Calculate Levenshtein similarity between two strings (0-1)
 */
function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

// ============================================================================
// Strategy 4: Structural Patterns
// ============================================================================

/**
 * Apply agent type to skill type mapping rules
 */
function analyzeStructuralPatterns(
  item: RegistryItem,
  allItems: RegistryItem[]
): DependencyCandidate[] {
  const candidates: DependencyCandidate[] = [];
  const itemText =
    `${item.name} ${item.slug} ${item.description}`.toLowerCase();

  // Determine which patterns apply based on item content
  const applicableSkills = new Set<string>();
  const patternReasons = new Map<string, string>();

  // Check agent-to-skill patterns
  for (const [pattern, skills] of Object.entries(AGENT_TO_SKILL_PATTERNS)) {
    if (itemText.includes(pattern)) {
      for (const skill of skills) {
        applicableSkills.add(skill);
        patternReasons.set(skill, `Pattern match: "${pattern}" -> ${skill}`);
      }
    }
  }

  // Check skill-to-skill patterns for skill items
  if (item.kind === "skill") {
    const matchingPatterns = SKILL_DEPENDENCY_PATTERNS[item.id];
    if (matchingPatterns) {
      for (const skill of matchingPatterns) {
        applicableSkills.add(skill);
        patternReasons.set(
          skill,
          `Skill prerequisite pattern: ${item.id} requires ${skill}`
        );
      }
    }
  }

  // Check MCP-to-skill patterns for MCP items
  if (item.kind === "mcp") {
    for (const [mcpPattern, skills] of Object.entries(MCP_TO_SKILL_PATTERNS)) {
      if (item.id.includes(mcpPattern) || item.slug.includes(mcpPattern)) {
        for (const skill of skills) {
          applicableSkills.add(skill);
          patternReasons.set(skill, `MCP pattern: ${mcpPattern} -> ${skill}`);
        }
      }
    }
  }

  // Convert applicable skills to candidates
  for (const skillId of applicableSkills) {
    if (item.dependencies?.includes(skillId)) continue;

    // Verify the skill exists in allItems
    const skillItem = allItems.find((i) => i.id === skillId);
    if (!skillItem) continue;

    candidates.push({
      targetId: skillId,
      confidence: 75, // Pattern-based matches have high confidence
      source: "pattern",
      reason: patternReasons.get(skillId) || `Structural pattern match`,
    });
  }

  return candidates;
}

// ============================================================================
// Main Detection & Consolidation Functions
// ============================================================================

/**
 * Detect dependencies using all 4 strategies
 */
export function detectDependencies(
  item: RegistryItem,
  allItems: RegistryItem[]
): DependencyCandidate[] {
  const allCandidates: DependencyCandidate[] = [];

  // Run all detection strategies in parallel
  allCandidates.push(...analyzeContent(item, allItems));
  allCandidates.push(...analyzeTagMatching(item, allItems));
  allCandidates.push(...analyzeKeywords(item, allItems));
  allCandidates.push(...analyzeStructuralPatterns(item, allItems));

  // Sort by confidence
  return allCandidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Consolidate candidates from multiple sources
 * Combines duplicate targetIds and calculates aggregate confidence
 */
export function consolidateCandidates(
  candidates: DependencyCandidate[]
): DependencyCandidate[] {
  const grouped = new Map<string, DependencyCandidate[]>();

  // Group by targetId
  for (const candidate of candidates) {
    const existing = grouped.get(candidate.targetId) || [];
    existing.push(candidate);
    grouped.set(candidate.targetId, existing);
  }

  // Consolidate each group
  const consolidated: DependencyCandidate[] = [];

  for (const [targetId, group] of grouped) {
    if (group.length === 1) {
      consolidated.push(group[0]);
      continue;
    }

    // Calculate aggregate confidence
    // Multiple sources increase confidence (diminishing returns)
    const sources = [...new Set(group.map((c) => c.source))];
    const baseConfidence = Math.max(...group.map((c) => c.confidence));
    const sourceBonus = (sources.length - 1) * 10; // +10 per additional source
    const aggregateConfidence = Math.min(baseConfidence + sourceBonus, 98);

    // Combine reasons
    const reasons = group.map((c) => `[${c.source}] ${c.reason}`);

    consolidated.push({
      targetId,
      confidence: aggregateConfidence,
      source: sources.length > 1 ? "pattern" : group[0].source, // Use 'pattern' for multi-source
      reason: reasons.join(" | "),
    });
  }

  // Sort by confidence
  return consolidated.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Full detection with consolidation
 */
export function detectAndConsolidate(
  item: RegistryItem,
  allItems: RegistryItem[]
): DetectionResult {
  const rawCandidates = detectDependencies(item, allItems);
  const consolidated = consolidateCandidates(rawCandidates);
  const existingDeps = item.dependencies || [];

  // Filter out existing dependencies
  const newSuggestions = consolidated.filter(
    (c) => !existingDeps.includes(c.targetId)
  );

  return {
    itemId: item.id,
    candidates: consolidated,
    existingDependencies: existingDeps,
    newSuggestions,
  };
}

/**
 * Batch detect dependencies for all items
 */
export function batchDetectDependencies(
  items: RegistryItem[]
): Map<string, DetectionResult> {
  const results = new Map<string, DetectionResult>();

  for (const item of items) {
    results.set(item.id, detectAndConsolidate(item, items));
  }

  return results;
}

/**
 * Get suggested dependencies above a confidence threshold
 */
export function getSuggestions(
  item: RegistryItem,
  allItems: RegistryItem[],
  minConfidence: number = 50
): DependencyCandidate[] {
  const result = detectAndConsolidate(item, allItems);
  return result.newSuggestions.filter((c) => c.confidence >= minConfidence);
}

/**
 * Generate a dependency report for an item
 */
export function generateDependencyReport(
  item: RegistryItem,
  allItems: RegistryItem[]
): string {
  const result = detectAndConsolidate(item, allItems);
  const lines: string[] = [];

  lines.push(`# Dependency Analysis: ${item.name}`);
  lines.push(`ID: ${item.id}`);
  lines.push(`Kind: ${item.kind}`);
  lines.push("");

  lines.push("## Existing Dependencies");
  if (result.existingDependencies.length === 0) {
    lines.push("- None");
  } else {
    for (const depId of result.existingDependencies) {
      const dep = allItems.find((i) => i.id === depId);
      lines.push(`- ${depId}${dep ? ` (${dep.name})` : " [NOT FOUND]"}`);
    }
  }
  lines.push("");

  lines.push("## Suggested Dependencies");
  if (result.newSuggestions.length === 0) {
    lines.push("- No suggestions");
  } else {
    for (const suggestion of result.newSuggestions.slice(0, 10)) {
      const target = allItems.find((i) => i.id === suggestion.targetId);
      lines.push(
        `- **${suggestion.targetId}** (${suggestion.confidence}% confidence)`
      );
      lines.push(`  - Name: ${target?.name || "Unknown"}`);
      lines.push(`  - Source: ${suggestion.source}`);
      lines.push(`  - Reason: ${suggestion.reason}`);
    }
  }

  return lines.join("\n");
}

// ============================================================================
// Export
// ============================================================================

export default {
  detectDependencies,
  consolidateCandidates,
  detectAndConsolidate,
  batchDetectDependencies,
  getSuggestions,
  generateDependencyReport,
  AGENT_TO_SKILL_PATTERNS,
  SKILL_DEPENDENCY_PATTERNS,
  MCP_TO_SKILL_PATTERNS,
};
