/**
 * Boundary Configuration Manager
 */

import type { Boundaries } from "./types.js";

const DEFAULT_BOUNDARIES: Boundaries = {
  financial: {
    maxAutoExpense: 50,
    maxQueuedExpense: 200,
    maxDailySpend: 100,
    maxTradeSize: 500,
    maxDailyTradingLoss: 5,
    minTreasuryBalance: 1000,
  },
  content: {
    maxAutoPostsPerDay: 10,
    maxAutoBlogsPerWeek: 3,
    requireReviewForTopics: ["controversial", "financial_advice", "competitor_criticism"],
  },
  development: {
    maxAutoCommitLines: 100,
    maxAutoFilesChanged: 5,
    requireReviewForPaths: ["src/core/", "src/config/", ".env"],
    autoDeployToStaging: true,
    autoDeployToProduction: false,
  },
  trading: {
    allowedBots: ["dca"],
    allowedTokens: ["SOL", "USDC"],
    maxPositionPercent: 20,
    requireApprovalForNewTokens: true,
  },
  time: {
    activeHours: { start: 6, end: 22 },
    quietHours: { start: 23, end: 6 },
    maintenanceWindow: { day: 0, hour: 4 },
  },
};

export function getDefaultBoundaries(): Boundaries {
  return JSON.parse(JSON.stringify(DEFAULT_BOUNDARIES));
}

export function mergeBoundaries(
  base: Boundaries,
  overrides: Partial<Boundaries>
): Boundaries {
  return {
    financial: { ...base.financial, ...overrides.financial },
    content: { ...base.content, ...overrides.content },
    development: { ...base.development, ...overrides.development },
    trading: { ...base.trading, ...overrides.trading },
    time: { ...base.time, ...overrides.time },
  };
}
