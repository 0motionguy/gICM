/**
 * @gicm/router - Intent Classifier
 *
 * Pure regex/keyword matching for fast tier classification (<5ms)
 */

import type { Tier, TierRule } from "./types.js";

/**
 * Classify message intent to determine appropriate tier
 *
 * Algorithm:
 * 1. Check Tier 0 patterns (regex matches for trivial tasks)
 * 2. Check Tier 3 keywords (highest value patterns)
 * 3. Check Tier 2 keywords (code/analysis tasks)
 * 4. Default to Tier 1 (cheapest LLM)
 *
 * @param message - User message to classify
 * @param rules - Tier rules (defaults to DEFAULT_TIER_RULES)
 * @returns Tier level (0-3)
 */
export function classifyIntent(
  message: string,
  rules: TierRule[],
  defaultTier: Tier = 1
): Tier {
  const lowerMessage = message.toLowerCase().trim();

  // Sort rules: Tier 0 first, then descending (3→2→1)
  const sortedRules = [...rules].sort((a, b) => {
    if (a.tier === 0) return -1;
    if (b.tier === 0) return 1;
    return b.tier - a.tier;
  });

  // Check each tier's rules
  for (const rule of sortedRules) {
    // Check regex patterns first (Tier 0 only)
    if (rule.patterns.length > 0) {
      for (const pattern of rule.patterns) {
        if (pattern.test(message)) {
          return rule.tier;
        }
      }
    }

    // Check keywords
    if (rule.keywords.length > 0) {
      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return rule.tier;
        }
      }
    }
  }

  // Default to configured tier (cheapest LLM by default)
  return defaultTier;
}
