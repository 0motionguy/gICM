import { describe, it, expect, beforeEach } from "vitest";
import { BudgetManager, Goldfish } from "../goldfish.js";
import { calculateCost } from "../pricing.js";
import { BudgetConfigSchema } from "../types.js";
import type { BudgetConfig, CostEvent } from "../types.js";

describe("BudgetConfig Validation", () => {
  it("should validate a valid config", () => {
    const config: BudgetConfig = {
      daily: { amount: 10.0, resetAt: "00:00" },
      weekly: { amount: 50.0, resetDay: "monday" },
      monthly: { amount: 200.0, resetDay: 1 },
      thresholds: {
        soft: 0.7,
        throttle: 0.9,
        hard: 1.0,
      },
    };

    const result = BudgetConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("should reject negative amounts", () => {
    const config = {
      daily: { amount: -10.0, resetAt: "00:00" },
      weekly: { amount: 50.0, resetDay: "monday" },
      monthly: { amount: 200.0, resetDay: 1 },
      thresholds: {
        soft: 0.7,
        throttle: 0.9,
        hard: 1.0,
      },
    };

    const result = BudgetConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("should reject invalid threshold values", () => {
    const config = {
      daily: { amount: 10.0, resetAt: "00:00" },
      weekly: { amount: 50.0, resetDay: "monday" },
      monthly: { amount: 200.0, resetDay: 1 },
      thresholds: {
        soft: 1.5, // > 1.0
        throttle: 0.9,
        hard: 1.0,
      },
    };

    const result = BudgetConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("should reject invalid resetDay for monthly", () => {
    const config = {
      daily: { amount: 10.0, resetAt: "00:00" },
      weekly: { amount: 50.0, resetDay: "monday" },
      monthly: { amount: 200.0, resetDay: 32 }, // > 28
      thresholds: {
        soft: 0.7,
        throttle: 0.9,
        hard: 1.0,
      },
    };

    const result = BudgetConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe("Cost Calculation", () => {
  it("should calculate cost for claude-opus-4-6", () => {
    const cost = calculateCost("claude-opus-4-6", {
      input: 100_000,
      output: 50_000,
    });

    // (100k * 15) / 1M + (50k * 75) / 1M = 1.5 + 3.75 = 5.25
    expect(cost).toBeCloseTo(5.25, 2);
  });

  it("should calculate cost with cache tokens", () => {
    const cost = calculateCost("claude-sonnet-4-5", {
      input: 100_000,
      output: 50_000,
      cacheRead: 200_000,
      cacheWrite: 50_000,
    });

    // (100k * 3) / 1M + (50k * 15) / 1M + (200k * 0.3) / 1M + (50k * 3.75) / 1M
    // = 0.3 + 0.75 + 0.06 + 0.1875 = 1.2975
    expect(cost).toBeCloseTo(1.2975, 4);
  });

  it("should use fallback pricing for unknown models", () => {
    const cost = calculateCost("unknown/model", {
      input: 100_000,
      output: 50_000,
    });

    // Fallback: (100k * 1.0) / 1M + (50k * 5.0) / 1M = 0.1 + 0.25 = 0.35
    expect(cost).toBeCloseTo(0.35, 2);
  });

  it("should calculate zero cost for free models", () => {
    const cost = calculateCost("gemini-2.0-flash", {
      input: 1_000_000,
      output: 500_000,
    });

    expect(cost).toBe(0);
  });
});

describe("BudgetManager", () => {
  let manager: BudgetManager;
  let config: BudgetConfig;

  beforeEach(() => {
    config = {
      daily: { amount: 10.0, resetAt: "00:00" },
      weekly: { amount: 50.0, resetDay: "monday" },
      monthly: { amount: 200.0, resetDay: 1 },
      thresholds: {
        soft: 0.7,
        throttle: 0.9,
        hard: 1.0,
      },
    };

    // Use in-memory database for tests
    manager = new BudgetManager(config, ":memory:");
  });

  it("should initialize with zero spend", () => {
    const status = manager.getStatus("daily");
    expect(status.spent).toBe(0);
    expect(status.remaining).toBe(10.0);
    expect(status.percentUsed).toBe(0);
    expect(status.level).toBe("ok");
  });

  it("should record costs and update spend", () => {
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      inputTokens: 100_000,
      outputTokens: 50_000,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 1.05,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);

    const status = manager.getStatus("daily");
    expect(status.spent).toBeCloseTo(1.05, 2);
    expect(status.remaining).toBeCloseTo(8.95, 2);
    expect(status.percentUsed).toBeCloseTo(10.5, 1);
  });

  it("should detect soft threshold at 70%", () => {
    let softEmitted = false;
    manager.on("budget:soft", () => {
      softEmitted = true;
    });

    // Record cost to reach 70% (7.0 out of 10.0)
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 7.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);

    const status = manager.getStatus("daily");
    expect(status.level).toBe("soft");
    expect(softEmitted).toBe(true);
  });

  it("should detect throttle threshold at 90%", () => {
    let throttleEmitted = false;
    manager.on("budget:throttle", () => {
      throttleEmitted = true;
    });

    // Record cost to reach 90% (9.0 out of 10.0)
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 9.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);

    const status = manager.getStatus("daily");
    expect(status.level).toBe("throttle");
    expect(throttleEmitted).toBe(true);
  });

  it("should detect hard limit at 100%", () => {
    let hardEmitted = false;
    manager.on("budget:hard", () => {
      hardEmitted = true;
    });

    // Record cost to reach 100% (10.0 out of 10.0)
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 10.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);

    const status = manager.getStatus("daily");
    expect(status.level).toBe("hard");
    expect(hardEmitted).toBe(true);
  });

  it("should provide shouldThrottle convenience method", () => {
    expect(manager.shouldThrottle()).toBe(false);

    // Record cost to reach throttle threshold
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 9.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);
    expect(manager.shouldThrottle()).toBe(true);
  });

  it("should provide shouldBlock convenience method", () => {
    expect(manager.shouldBlock()).toBe(false);

    // Record cost to reach hard limit
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 10.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);
    expect(manager.shouldBlock()).toBe(true);
  });

  it("should generate full report for all periods", () => {
    const report = manager.getReport();

    expect(report.daily).toBeDefined();
    expect(report.weekly).toBeDefined();
    expect(report.monthly).toBeDefined();

    expect(report.daily.period).toBe("daily");
    expect(report.weekly.period).toBe("weekly");
    expect(report.monthly.period).toBe("monthly");
  });

  it("should reset period tracking", () => {
    // Record cost to reach soft threshold
    const event: CostEvent = {
      timestamp: new Date().toISOString(),
      model: "claude-haiku-4-5",
      provider: "anthropic",
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      cost: 7.0,
      agentId: "test-agent",
      sessionId: "test-session",
      taskType: "chat",
      tier: 1,
    };

    manager.recordCost(event);
    expect(manager.getStatus("daily").level).toBe("soft");

    manager.resetPeriod("daily");

    // Spend is still there (historical data preserved), but threshold tracking reset
    expect(manager.getStatus("daily").spent).toBe(7.0);
  });

  it("should use Goldfish alias", () => {
    const goldfish = new Goldfish(config, ":memory:");
    expect(goldfish).toBeInstanceOf(BudgetManager);
  });
});
