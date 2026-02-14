import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatLargeNumber,
  formatDuration,
  formatPercent,
  formatTokens,
  formatBytes,
  getRelativeTime,
  getStatusColor,
  getTrendColor,
  getActivityColor,
} from "../formatters.js";
import { renderStatusCard } from "../components/StatusCard.js";
import { renderMetricsPanel } from "../components/MetricsPanel.js";
import { renderEventFeed } from "../components/EventFeed.js";
import { renderCostChart } from "../components/CostChart.js";
import { renderHealthGrid } from "../components/HealthGrid.js";
import type {
  MetricData,
  ActivityEvent,
  CostDataPoint,
  ServiceHealth,
} from "../types.js";

// ---------------------------------------------------------------------------
// Formatters (12 tests)
// ---------------------------------------------------------------------------

describe("formatPrice", () => {
  it("formats standard prices with dollar sign", () => {
    const result = formatPrice(1234.56);
    expect(result).toContain("$");
    expect(result).toMatch(/1,?234/);
  });

  it("shows micro-price decimals for very small values", () => {
    const result = formatPrice(0.000001);
    expect(result).toBe("$0.00000100");
  });

  it("compacts large prices to millions notation", () => {
    const result = formatPrice(1_500_000);
    expect(result).toBe("$1.50M");
  });

  it("handles zero correctly", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles NaN gracefully", () => {
    expect(formatPrice(NaN)).toBe("$NaN");
  });

  it("handles Infinity gracefully", () => {
    expect(formatPrice(Infinity)).toBe("$Infinity");
    expect(formatPrice(-Infinity)).toBe("-$Infinity");
  });
});

describe("formatLargeNumber", () => {
  it("formats thousands with K suffix", () => {
    expect(formatLargeNumber(1500)).toBe("1.5K");
  });

  it("formats millions with M suffix", () => {
    expect(formatLargeNumber(1_500_000)).toBe("1.5M");
  });

  it("formats billions with B suffix", () => {
    expect(formatLargeNumber(1_500_000_000)).toBe("1.5B");
  });
});

describe("formatDuration", () => {
  it("formats short durations in seconds", () => {
    expect(formatDuration(45000)).toBe("45s");
  });

  it("formats long durations with hours and minutes", () => {
    const result = formatDuration(3661000);
    expect(result).toContain("1h");
    expect(result).toContain("1m");
    expect(result).toContain("1s");
  });
});

describe("formatPercent", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercent(0.856)).toBe("85.6%");
  });
});

describe("formatTokens", () => {
  it("formats token count with suffix", () => {
    expect(formatTokens(1500000)).toBe("1.5M tokens");
  });
});

describe("formatBytes", () => {
  it("formats bytes into human-readable form", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});

describe("getRelativeTime", () => {
  it("returns a string containing 'ago' for recent dates", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = getRelativeTime(fiveMinutesAgo);
    expect(result).toContain("ago");
  });

  it("returns 'just now' for very recent dates", () => {
    const result = getRelativeTime(new Date());
    expect(result).toBe("just now");
  });
});

describe("getStatusColor", () => {
  it("returns different colors for each status", () => {
    const healthy = getStatusColor("healthy");
    const degraded = getStatusColor("degraded");
    const unhealthy = getStatusColor("unhealthy");
    const unknown = getStatusColor("unknown");

    // All should be strings
    expect(typeof healthy).toBe("string");
    expect(typeof degraded).toBe("string");
    expect(typeof unhealthy).toBe("string");
    expect(typeof unknown).toBe("string");

    // All should be distinct
    const colors = new Set([healthy, degraded, unhealthy, unknown]);
    expect(colors.size).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// StatusCard (3 tests)
// ---------------------------------------------------------------------------

describe("renderStatusCard", () => {
  const baseMetric: MetricData = {
    id: "m1",
    label: "Total Users",
    value: 12500,
    prefix: "$",
  };

  it("returns a formatted value", () => {
    const result = renderStatusCard({ metric: baseMetric });
    expect(result.formattedValue).toBeDefined();
    expect(result.formattedValue.length).toBeGreaterThan(0);
    expect(result.label).toBe("Total Users");
  });

  it("includes trend direction and color when trend is set", () => {
    const metric: MetricData = {
      ...baseMetric,
      trend: "up",
      trendValue: 12.5,
    };
    const result = renderStatusCard({ metric });
    expect(result.trend).not.toBeNull();
    expect(result.trend!.direction).toBe("up");
    expect(result.trend!.value).toContain("+12.5%");
    expect(result.trend!.color).toBeDefined();
  });

  it("returns null trend when no trend is set", () => {
    const result = renderStatusCard({ metric: baseMetric });
    expect(result.trend).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MetricsPanel (3 tests)
// ---------------------------------------------------------------------------

describe("renderMetricsPanel", () => {
  const metrics: MetricData[] = [
    { id: "1", label: "Users", value: 1000, trend: "up", trendValue: 5 },
    { id: "2", label: "Revenue", value: 50000, trend: "down", trendValue: -2 },
    { id: "3", label: "Latency", value: 120, trend: "up", trendValue: 10 },
    { id: "4", label: "Errors", value: 3, trend: "flat" },
  ];

  it("renders all metrics as cards", () => {
    const result = renderMetricsPanel({ metrics });
    expect(result.cards).toHaveLength(4);
    expect(result.summary.total).toBe(4);
  });

  it("counts trending up and down correctly", () => {
    const result = renderMetricsPanel({ metrics });
    expect(result.summary.trending_up).toBe(2);
    expect(result.summary.trending_down).toBe(1);
  });

  it("defaults to 4 columns", () => {
    const result = renderMetricsPanel({ metrics });
    expect(result.columns).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// EventFeed (3 tests)
// ---------------------------------------------------------------------------

describe("renderEventFeed", () => {
  const now = Date.now();
  const events: ActivityEvent[] = [
    {
      id: "e1",
      type: "info",
      message: "Oldest event",
      timestamp: new Date(now - 300_000),
      source: "system",
    },
    {
      id: "e2",
      type: "success",
      message: "Middle event",
      timestamp: new Date(now - 60_000),
    },
    {
      id: "e3",
      type: "error",
      message: "Newest event",
      timestamp: new Date(now - 10_000),
      source: "api",
    },
    {
      id: "e4",
      type: "warning",
      message: "Extra event",
      timestamp: new Date(now - 120_000),
    },
    {
      id: "e5",
      type: "agent",
      message: "Agent event",
      timestamp: new Date(now - 200_000),
    },
  ];

  it("limits output to maxItems", () => {
    const result = renderEventFeed({ events, maxItems: 3 });
    expect(result.items).toHaveLength(3);
    expect(result.hasMore).toBe(true);
    expect(result.totalCount).toBe(5);
  });

  it("sorts events newest first", () => {
    const result = renderEventFeed({ events });
    expect(result.items[0].id).toBe("e3"); // newest
    expect(result.items[result.items.length - 1].id).toBe("e1"); // oldest
  });

  it("includes relative time for each item", () => {
    const result = renderEventFeed({ events });
    for (const item of result.items) {
      expect(item.relativeTime).toBeDefined();
      expect(item.relativeTime.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// CostChart (2 tests)
// ---------------------------------------------------------------------------

describe("renderCostChart", () => {
  const data: CostDataPoint[] = [
    { date: "2025-01-01", cost: 50, budget: 100, savings: 10 },
    { date: "2025-01-02", cost: 75, budget: 60, savings: 5 },
    { date: "2025-01-03", cost: 30, budget: 80, savings: 20 },
  ];

  it("calculates total cost and savings", () => {
    const result = renderCostChart({ data });
    // Total cost: 50 + 75 + 30 = 155
    expect(result.summary.totalCost).toContain("$");
    expect(result.summary.totalCost).toContain("155");
    // Total savings: 10 + 5 + 20 = 35
    expect(result.summary.totalSavings).toContain("$");
    expect(result.summary.totalSavings).toContain("35");
    // Total budget should exist
    expect(result.summary.totalBudget).not.toBeNull();
  });

  it("detects over-budget data points", () => {
    const result = renderCostChart({ data });
    // Point 2: cost 75 > budget 60 → overBudget
    expect(result.points[0].overBudget).toBe(false); // 50 <= 100
    expect(result.points[1].overBudget).toBe(true); // 75 > 60
    expect(result.points[2].overBudget).toBe(false); // 30 <= 80
  });
});

// ---------------------------------------------------------------------------
// HealthGrid (2 tests)
// ---------------------------------------------------------------------------

describe("renderHealthGrid", () => {
  const services: ServiceHealth[] = [
    {
      id: "s1",
      name: "API Gateway",
      status: "healthy",
      latency: 45,
      uptime: 99.9,
      lastCheck: new Date(),
    },
    {
      id: "s2",
      name: "Database",
      status: "degraded",
      latency: 250,
      uptime: 98.5,
    },
    {
      id: "s3",
      name: "Cache",
      status: "unhealthy",
      message: "Connection refused",
    },
    { id: "s4", name: "Queue", status: "unknown" },
  ];

  it("counts status summary correctly", () => {
    const result = renderHealthGrid({ services });
    expect(result.summary.total).toBe(4);
    expect(result.summary.healthy).toBe(1);
    expect(result.summary.degraded).toBe(1);
    expect(result.summary.unhealthy).toBe(1);
    expect(result.summary.unknown).toBe(1);
  });

  it("formats latency and uptime when present", () => {
    const result = renderHealthGrid({ services });
    // API Gateway has latency 45ms
    expect(result.items[0].latency).toBeDefined();
    expect(result.items[0].latency).toContain("45");
    // API Gateway has uptime 99.9
    expect(result.items[0].uptime).toBeDefined();
    expect(result.items[0].uptime).toContain("%");
    // Queue has no latency/uptime
    expect(result.items[3].latency).toBeNull();
    expect(result.items[3].uptime).toBeNull();
  });
});
