import type { AnalyticsEvent } from "@/types/analytics";
import { REGISTRY } from "./registry";

/**
 * Baseline token costs for traditional implementation approaches
 * These represent the average tokens needed without using gICM components
 */
export const BASELINE_TOKENS = {
  agent: 5000, // Traditional agent setup/configuration prompts
  skill: 12000, // Traditional skill implementation prompts
  command: 2000, // Traditional command implementation
  workflow: 8000, // Traditional workflow orchestration prompts
  mcp: 3000, // Traditional MCP server setup
  setting: 500, // Settings configuration
  component: 1000, // Component implementation
} as const;

/**
 * Claude API pricing per million tokens
 * Using weighted average based on typical usage (70% Sonnet, 30% Opus)
 */
export const CLAUDE_PRICING = {
  sonnet: {
    input: 3.0, // $ per million input tokens
    output: 15.0,
  },
  opus: {
    input: 15.0,
    output: 75.0,
  },
  // Weighted average for general calculations
  weighted: {
    input: 6.6, // (3.0 * 0.7) + (15.0 * 0.3)
    output: 33.0, // (15.0 * 0.7) + (75.0 * 0.3)
  },
} as const;

export interface TokenSavingsMetrics {
  tokensSavedToday: number;
  costSavedToday: number;
  avgTokensPerStack: number;
  avgCostPerStack: number;
  totalTokensSaved: number;
  totalCostSaved: number;
  savingsRate: number; // Percentage change week over week
  itemsSavedToday: number; // Count of items added today
  itemsSavedTotal: number; // Total items added all time
}

/**
 * Calculate tokens saved from a single item addition
 */
function calculateItemSavings(itemId: string): {
  tokens: number;
  cost: number;
} {
  const item = REGISTRY.find((i) => i.id === itemId);
  if (!item) {
    return { tokens: 0, cost: 0 };
  }

  const baselineTokens = BASELINE_TOKENS[item.kind] || 0;

  // Use tokenSavings percentage if available (mainly for skills)
  // Otherwise use conservative estimates based on kind
  let savingsPercent = 0;
  if (item.tokenSavings) {
    savingsPercent = item.tokenSavings;
  } else {
    // Conservative default savings estimates
    switch (item.kind) {
      case "agent":
        savingsPercent = 75; // Agents save ~75% of setup tokens
        break;
      case "skill":
        savingsPercent = 85; // Skills average ~85%
        break;
      case "command":
        savingsPercent = 80; // Commands save ~80%
        break;
      case "workflow":
        savingsPercent = 75; // Workflows save ~75% on average
        break;
      case "mcp":
        savingsPercent = 70; // MCP servers save ~70%
        break;
      case "setting":
        savingsPercent = 60; // Settings save ~60%
        break;
      case "component":
        savingsPercent = 90; // Components save ~90%
        break;
    }
  }

  const tokensSaved = baselineTokens * (savingsPercent / 100);
  const costSaved = (tokensSaved / 1_000_000) * CLAUDE_PRICING.weighted.input;

  return {
    tokens: Math.round(tokensSaved),
    cost: parseFloat(costSaved.toFixed(4)),
  };
}

/**
 * Calculate token savings metrics from analytics events
 */
export function calculateTokenSavings(
  events: AnalyticsEvent[]
): TokenSavingsMetrics {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Filter item_add_to_stack events
  const addEvents = events.filter((e) => e.type === "item_add_to_stack");

  // Today's events
  const todayEvents = addEvents.filter(
    (e) => new Date(e.timestamp) >= todayStart
  );

  // This week's events
  const thisWeekEvents = addEvents.filter(
    (e) => new Date(e.timestamp) >= weekAgo
  );

  // Last week's events (for growth rate)
  const lastWeekEvents = addEvents.filter((e) => {
    const timestamp = new Date(e.timestamp);
    return timestamp >= twoWeeksAgo && timestamp < weekAgo;
  });

  // Calculate savings for today
  let tokensSavedToday = 0;
  let costSavedToday = 0;
  todayEvents.forEach((event) => {
    if (event.itemId) {
      const savings = calculateItemSavings(event.itemId);
      tokensSavedToday += savings.tokens;
      costSavedToday += savings.cost;
    }
  });

  // Calculate total savings (all time)
  let totalTokensSaved = 0;
  let totalCostSaved = 0;
  addEvents.forEach((event) => {
    if (event.itemId) {
      const savings = calculateItemSavings(event.itemId);
      totalTokensSaved += savings.tokens;
      totalCostSaved += savings.cost;
    }
  });

  // Calculate average per stack
  const bundleEvents = events.filter((e) => e.type === "bundle_created");
  const avgTokensPerStack = bundleEvents.length
    ? Math.round(totalTokensSaved / bundleEvents.length)
    : 0;
  const avgCostPerStack = bundleEvents.length
    ? parseFloat((totalCostSaved / bundleEvents.length).toFixed(2))
    : 0;

  // Calculate week-over-week growth rate
  let savingsRate = 0;
  if (lastWeekEvents.length > 0) {
    const thisWeekCount = thisWeekEvents.length;
    const lastWeekCount = lastWeekEvents.length;
    savingsRate = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
  } else if (thisWeekEvents.length > 0) {
    savingsRate = 100; // If no data last week but activity this week, show 100% growth
  }

  return {
    tokensSavedToday: Math.round(tokensSavedToday),
    costSavedToday: parseFloat(costSavedToday.toFixed(2)),
    avgTokensPerStack,
    avgCostPerStack,
    totalTokensSaved: Math.round(totalTokensSaved),
    totalCostSaved: parseFloat(totalCostSaved.toFixed(2)),
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    itemsSavedToday: todayEvents.length,
    itemsSavedTotal: addEvents.length,
  };
}

/**
 * Format large numbers for display (1.2M, 847K, etc.)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 10_000) {
    return `$${formatLargeNumber(amount)}`;
  }
  return `$${amount.toFixed(2)}`;
}
