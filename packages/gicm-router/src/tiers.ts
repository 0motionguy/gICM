/**
 * @gicm/router - Tier Definitions and Rules
 *
 * 4-tier system:
 * - Tier 0: Free/regex (no LLM) - time, date, math, greetings
 * - Tier 1: Cheap LLM - simple Q&A, summaries, formatting
 * - Tier 2: Balanced - code tasks, analysis, complex writing
 * - Tier 3: Premium - architecture, novel reasoning, critical decisions
 */

import type { TierConfig, TierRule } from "./types.js";

/**
 * Default tier configurations with model selections and pricing
 */
export const DEFAULT_TIER_CONFIGS: Record<number, TierConfig> = {
  0: {
    primary: "regex",
    fallback: [],
    maxTokens: 0,
    costPer1kInput: 0,
    costPer1kOutput: 0,
  },
  1: {
    primary: "anthropic/claude-3-haiku-20240307",
    fallback: ["google/gemini-2.0-flash-exp:free", "ollama/llama3.2"],
    maxTokens: 200_000,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
  },
  2: {
    primary: "anthropic/claude-sonnet-4.5-20250514",
    fallback: ["openai/gpt-4o", "anthropic/claude-3-5-sonnet-20241022"],
    maxTokens: 200_000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  3: {
    primary: "anthropic/claude-opus-4-6-20250514",
    fallback: ["openai/o1", "anthropic/claude-opus-4-20250514"],
    maxTokens: 200_000,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
  },
};

/**
 * Default tier classification rules
 * Checked in order: Tier 0 patterns → Tier 3 keywords → Tier 2 keywords → Tier 1 default
 */
export const DEFAULT_TIER_RULES: TierRule[] = [
  // Tier 0: Simple tasks solvable without LLM
  {
    tier: 0,
    patterns: [
      /what time/i,
      /what day/i,
      /what date/i,
      /\b(hello|hi|hey|greetings)\b/i,
      /^\d+\s*[+\-*/]\s*\d+$/,
      /^calculate\s+\d+/i,
    ],
    keywords: [],
  },

  // Tier 3: Architecture, novel reasoning, critical decisions
  {
    tier: 3,
    patterns: [],
    keywords: [
      "architect",
      "design system",
      "security audit",
      "novel algorithm",
      "critical decision",
      "distributed system",
      "scale to millions",
      "blockchain",
      "cryptography",
      "zero-knowledge",
      "formal verification",
      "theorem proving",
    ],
  },

  // Tier 2: Code tasks, analysis, complex writing
  {
    tier: 2,
    patterns: [],
    keywords: [
      "refactor",
      "debug",
      "review",
      "analyze",
      "design",
      "implement",
      "optimize",
      "fix bug",
      "write code",
      "create function",
      "add feature",
      "integrate",
      "test",
      "benchmark",
      "performance",
      "complexity",
    ],
  },

  // Tier 1: Simple Q&A, summaries, formatting
  {
    tier: 1,
    patterns: [],
    keywords: [
      "summarize",
      "translate",
      "format",
      "list",
      "explain simply",
      "what is",
      "how do i",
      "can you",
      "tell me",
      "show me",
    ],
  },
];
