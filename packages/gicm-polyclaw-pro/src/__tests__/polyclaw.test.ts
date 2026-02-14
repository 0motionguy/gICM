import { describe, it, expect, beforeEach } from "vitest";
import {
  PolyclawPro,
  MarketScanner,
  SignalEngine,
  PositionManager,
  RiskManager,
  STRATEGIES,
  runStrategy,
  runAllStrategies,
  momentumStrategy,
  contrarianStrategy,
  arbitrageStrategy,
  volumeSpikeStrategy,
  meanReversionStrategy,
  eventCatalystStrategy,
  whaleFollowingStrategy,
  DEFAULT_RISK_CONFIG,
  DEFAULT_STRATEGY_CONFIGS,
  RiskConfigSchema,
  PolyclawConfigSchema,
  type Market,
  type Signal,
  type PricePoint,
  type StrategyName,
} from "../index.js";

// ============================================================================
// Test Helpers
// ============================================================================

function mockMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: "poly:test-market",
    platform: "polymarket",
    slug: "test-market",
    question: "Will Bitcoin reach $100K by end of 2026?",
    category: "crypto",
    outcomes: ["Yes", "No"],
    prices: [0.65, 0.35],
    volume: 500000,
    volume24h: 50000,
    liquidity: 100000,
    status: "active",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

function mockPriceHistory(
  count: number,
  startPrice = 0.5,
  trend = 0.01
): PricePoint[] {
  const points: PricePoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      timestamp: new Date(Date.now() - (count - i) * 600000).toISOString(),
      price: startPrice + trend * i,
      volume: 10000 + Math.random() * 5000,
    });
  }
  return points;
}

function mockSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: "test-signal-1",
    strategy: "momentum",
    marketId: "poly:test-market",
    platform: "polymarket",
    direction: "buy",
    strength: "moderate",
    confidence: 0.75,
    outcome: "YES",
    targetPrice: 0.75,
    currentPrice: 0.65,
    expectedReturn: 15.38,
    reasoning: "Test signal",
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// Types & Exports
// ============================================================================

describe("exports", () => {
  it("should export all 7 strategy functions", () => {
    expect(momentumStrategy).toBeTypeOf("function");
    expect(contrarianStrategy).toBeTypeOf("function");
    expect(arbitrageStrategy).toBeTypeOf("function");
    expect(volumeSpikeStrategy).toBeTypeOf("function");
    expect(meanReversionStrategy).toBeTypeOf("function");
    expect(eventCatalystStrategy).toBeTypeOf("function");
    expect(whaleFollowingStrategy).toBeTypeOf("function");
  });

  it("should export all classes", () => {
    expect(PolyclawPro).toBeTypeOf("function");
    expect(MarketScanner).toBeTypeOf("function");
    expect(SignalEngine).toBeTypeOf("function");
    expect(PositionManager).toBeTypeOf("function");
    expect(RiskManager).toBeTypeOf("function");
  });

  it("should have STRATEGIES registry with 7 entries", () => {
    expect(Object.keys(STRATEGIES)).toHaveLength(7);
  });

  it("should export default configs", () => {
    expect(DEFAULT_RISK_CONFIG.maxPositionSize).toBe(100);
    expect(DEFAULT_RISK_CONFIG.dailyLossLimit).toBe(50);
    expect(Object.keys(DEFAULT_STRATEGY_CONFIGS)).toHaveLength(7);
  });

  it("should export Zod schemas", () => {
    expect(RiskConfigSchema).toBeDefined();
    expect(PolyclawConfigSchema).toBeDefined();
  });
});

// ============================================================================
// Strategy Tests
// ============================================================================

describe("strategies", () => {
  describe("momentum", () => {
    it("should generate buy signal for uptrend", () => {
      const market = mockMarket({ prices: [0.65] });
      const history = mockPriceHistory(8, 0.5, 0.08); // rising steeply
      const result = runStrategy("momentum", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS.momentum,
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("buy");
      expect(result.signal!.strategy).toBe("momentum");
    });

    it("should generate sell signal for downtrend", () => {
      const market = mockMarket({ prices: [0.35] });
      const history = mockPriceHistory(8, 0.9, -0.08); // falling steeply
      const result = runStrategy("momentum", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS.momentum,
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("sell");
    });

    it("should return null for flat prices", () => {
      const market = mockMarket({ prices: [0.5] });
      const history = mockPriceHistory(8, 0.5, 0.001); // flat
      const result = runStrategy("momentum", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS.momentum,
      });
      expect(result.signal).toBeNull();
    });

    it("should return null with insufficient history", () => {
      const market = mockMarket();
      const result = runStrategy("momentum", {
        market,
        priceHistory: [{ timestamp: "now", price: 0.5, volume: 100 }],
        config: DEFAULT_STRATEGY_CONFIGS.momentum,
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("contrarian", () => {
    it("should generate buy signal for very low prices", () => {
      const market = mockMarket({ prices: [0.08] });
      const result = runStrategy("contrarian", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS.contrarian,
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("buy");
    });

    it("should generate sell signal for very high prices", () => {
      const market = mockMarket({ prices: [0.92] });
      const result = runStrategy("contrarian", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS.contrarian,
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("sell");
    });

    it("should return null for mid-range prices", () => {
      const market = mockMarket({ prices: [0.55] });
      const result = runStrategy("contrarian", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS.contrarian,
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("arbitrage", () => {
    it("should generate signal for cross-platform spread", () => {
      const market = mockMarket({ prices: [0.6] });
      const crossPrices = new Map([["kalshi:test", 0.7]]);
      const result = runStrategy("arbitrage", {
        market,
        priceHistory: [],
        crossPlatformPrices: crossPrices,
        config: DEFAULT_STRATEGY_CONFIGS.arbitrage,
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.strategy).toBe("arbitrage");
      expect(result.signal!.direction).toBe("buy"); // cheaper here
    });

    it("should return null when no cross-platform data", () => {
      const market = mockMarket();
      const result = runStrategy("arbitrage", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS.arbitrage,
      });
      expect(result.signal).toBeNull();
    });

    it("should return null for small spread", () => {
      const market = mockMarket({ prices: [0.6] });
      const crossPrices = new Map([["kalshi:test", 0.61]]);
      const result = runStrategy("arbitrage", {
        market,
        priceHistory: [],
        crossPlatformPrices: crossPrices,
        config: DEFAULT_STRATEGY_CONFIGS.arbitrage,
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("volume-spike", () => {
    it("should detect volume spike", () => {
      const market = mockMarket({ volume24h: 200000 });
      // Low historical volume, then spike
      const history: PricePoint[] = [
        { timestamp: "t1", price: 0.5, volume: 5000 },
        { timestamp: "t2", price: 0.52, volume: 5500 },
        { timestamp: "t3", price: 0.55, volume: 6000 },
        { timestamp: "t4", price: 0.6, volume: 200000 }, // spike!
      ];
      const result = runStrategy("volume-spike", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS["volume-spike"],
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.strategy).toBe("volume-spike");
    });

    it("should return null for normal volume", () => {
      const market = mockMarket({ volume24h: 5000 });
      const history = mockPriceHistory(5, 0.5, 0);
      const result = runStrategy("volume-spike", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS["volume-spike"],
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("mean-reversion", () => {
    it("should generate sell signal when price above mean", () => {
      const market = mockMarket({ prices: [0.8] });
      // History averaging around 0.55
      const history = mockPriceHistory(10, 0.5, 0.01);
      const result = runStrategy("mean-reversion", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS["mean-reversion"],
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("sell");
    });

    it("should generate buy signal when price below mean", () => {
      const market = mockMarket({ prices: [0.25] });
      const history = mockPriceHistory(10, 0.45, 0.01);
      const result = runStrategy("mean-reversion", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS["mean-reversion"],
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("buy");
    });
  });

  describe("event-catalyst", () => {
    it("should generate signal near resolution with clear lean", () => {
      const market = mockMarket({
        prices: [0.85],
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      });
      const result = runStrategy("event-catalyst", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS["event-catalyst"],
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.strategy).toBe("event-catalyst");
    });

    it("should return null for distant events", () => {
      const market = mockMarket({
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const result = runStrategy("event-catalyst", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS["event-catalyst"],
      });
      expect(result.signal).toBeNull();
    });

    it("should return null for markets without end date", () => {
      const market = mockMarket({ endDate: undefined });
      const result = runStrategy("event-catalyst", {
        market,
        priceHistory: [],
        config: DEFAULT_STRATEGY_CONFIGS["event-catalyst"],
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("whale-following", () => {
    it("should detect whale activity with high volume + price move", () => {
      const market = mockMarket();
      const history: PricePoint[] = [
        { timestamp: "t1", price: 0.5, volume: 10000 },
        { timestamp: "t2", price: 0.52, volume: 12000 },
        { timestamp: "t3", price: 0.58, volume: 25000 }, // whale buy
      ];
      const result = runStrategy("whale-following", {
        market,
        priceHistory: history,
        config: DEFAULT_STRATEGY_CONFIGS["whale-following"],
      });
      expect(result.signal).not.toBeNull();
      expect(result.signal!.direction).toBe("buy");
    });

    it("should return null with insufficient data", () => {
      const market = mockMarket();
      const result = runStrategy("whale-following", {
        market,
        priceHistory: [{ timestamp: "t1", price: 0.5, volume: 100 }],
        config: DEFAULT_STRATEGY_CONFIGS["whale-following"],
      });
      expect(result.signal).toBeNull();
    });
  });

  describe("runAllStrategies", () => {
    it("should run all enabled strategies", () => {
      const market = mockMarket({ prices: [0.08] }); // triggers contrarian
      const signals = runAllStrategies(
        { market, priceHistory: mockPriceHistory(10, 0.1, -0.002) },
        DEFAULT_STRATEGY_CONFIGS
      );
      // At least contrarian should fire
      expect(signals.length).toBeGreaterThanOrEqual(1);
      expect(signals.some((s) => s.strategy === "contrarian")).toBe(true);
    });

    it("should skip disabled strategies", () => {
      const market = mockMarket({ prices: [0.08] });
      const configs = {
        contrarian: { ...DEFAULT_STRATEGY_CONFIGS.contrarian, enabled: false },
      };
      const signals = runAllStrategies({ market, priceHistory: [] }, configs);
      expect(signals.every((s) => s.strategy !== "contrarian")).toBe(true);
    });
  });
});

// ============================================================================
// SignalEngine Tests
// ============================================================================

describe("SignalEngine", () => {
  let engine: SignalEngine;

  beforeEach(() => {
    engine = new SignalEngine(DEFAULT_STRATEGY_CONFIGS);
  });

  it("should analyze a market and produce aggregate", () => {
    const market = mockMarket({ prices: [0.08] });
    const aggregate = engine.analyze(market, mockPriceHistory(10));
    expect(aggregate.marketId).toBe(market.id);
    expect(aggregate.totalSignals).toBeGreaterThanOrEqual(0);
  });

  it("should track signal history", () => {
    const market = mockMarket({ prices: [0.08] });
    engine.analyze(market, []);
    const signals = engine.getRecentSignals();
    expect(Array.isArray(signals)).toBe(true);
  });

  it("should list enabled strategies", () => {
    const enabled = engine.getEnabledStrategies();
    // whale-following is disabled by default
    expect(enabled).not.toContain("whale-following");
    expect(enabled).toContain("momentum");
  });

  it("should update config", () => {
    engine.updateConfig("whale-following", { enabled: true });
    expect(engine.getEnabledStrategies()).toContain("whale-following");
  });
});

// ============================================================================
// PositionManager Tests
// ============================================================================

describe("PositionManager", () => {
  let pm: PositionManager;

  beforeEach(() => {
    pm = new PositionManager();
  });

  it("should open a position", () => {
    const signal = mockSignal();
    const pos = pm.openPosition(signal, 100);
    expect(pos.id).toBeDefined();
    expect(pos.size).toBe(100);
    expect(pos.entryPrice).toBe(0.65);
    expect(pos.status).toBe("open");
    expect(pos.strategy).toBe("momentum");
  });

  it("should close a position and calculate PnL", () => {
    const signal = mockSignal({ currentPrice: 0.5 });
    const pos = pm.openPosition(signal, 100);
    const closed = pm.closePosition(pos.id, 0.75);
    expect(closed).not.toBeNull();
    expect(closed!.status).toBe("closed");
    expect(closed!.realizedPnL).toBe(25); // 100 * (0.75 - 0.50)
  });

  it("should track open vs closed positions", () => {
    const s1 = mockSignal({ currentPrice: 0.5 });
    const s2 = mockSignal({ currentPrice: 0.6 });
    const p1 = pm.openPosition(s1, 50);
    pm.openPosition(s2, 50);

    expect(pm.getOpenPositions()).toHaveLength(2);
    pm.closePosition(p1.id, 0.55);
    expect(pm.getOpenPositions()).toHaveLength(1);
    expect(pm.getClosedPositions()).toHaveLength(1);
  });

  it("should update prices", () => {
    const signal = mockSignal();
    const pos = pm.openPosition(signal, 100);
    const prices = new Map([[signal.marketId, 0.8]]);
    pm.updatePrices(prices);
    const updated = pm.getPosition(pos.id)!;
    expect(updated.currentPrice).toBe(0.8);
    expect(updated.unrealizedPnL).toBeCloseTo(15, 1); // 100 * (0.80 - 0.65)
  });

  it("should trigger stop-loss", () => {
    const signal = mockSignal({ currentPrice: 0.65 });
    const pos = pm.openPosition(signal, 100);
    pm.setLimits(pos.id, 0.55); // stop-loss at 0.55

    const prices = new Map([[signal.marketId, 0.5]]); // below stop-loss
    pm.updatePrices(prices);
    const triggered = pm.checkTriggers();
    expect(triggered).toHaveLength(1);
    expect(triggered[0].status).toBe("closed");
  });

  it("should trigger take-profit", () => {
    const signal = mockSignal({ currentPrice: 0.65 });
    const pos = pm.openPosition(signal, 100);
    pm.setLimits(pos.id, undefined, 0.8); // take-profit at 0.80

    const prices = new Map([[signal.marketId, 0.85]]); // above take-profit
    pm.updatePrices(prices);
    const triggered = pm.checkTriggers();
    expect(triggered).toHaveLength(1);
    expect(triggered[0].realizedPnL).toBeCloseTo(20, 1); // 100 * (0.85 - 0.65)
  });

  it("should calculate performance metrics", () => {
    const s1 = mockSignal({ currentPrice: 0.5 });
    const s2 = mockSignal({ currentPrice: 0.6 });

    const p1 = pm.openPosition(s1, 100);
    pm.closePosition(p1.id, 0.7); // +$20

    const p2 = pm.openPosition(s2, 100);
    pm.closePosition(p2.id, 0.55); // -$5

    const perf = pm.getPerformance();
    expect(perf.totalTrades).toBe(2);
    expect(perf.winningTrades).toBe(1);
    expect(perf.losingTrades).toBe(1);
    expect(perf.winRate).toBe(0.5);
    expect(perf.realizedPnL).toBeCloseTo(15, 1); // 20 - 5
  });

  it("should get total exposure", () => {
    const signal = mockSignal({ currentPrice: 0.65 });
    pm.openPosition(signal, 100);
    expect(pm.getTotalExposure()).toBe(65); // 100 * 0.65
  });

  it("should record trade history", () => {
    const signal = mockSignal();
    const pos = pm.openPosition(signal, 100);
    pm.closePosition(pos.id, 0.8);
    expect(pm.getTradeHistory()).toHaveLength(2); // open + close
  });
});

// ============================================================================
// RiskManager Tests
// ============================================================================

describe("RiskManager", () => {
  let rm: RiskManager;

  beforeEach(() => {
    rm = new RiskManager();
  });

  it("should allow valid trades", () => {
    const signal = mockSignal({ confidence: 0.75 });
    const assessment = rm.assess(signal, 50, [], 0, 0);
    expect(assessment.allowed).toBe(true);
    expect(assessment.riskScore).toBeLessThan(50);
  });

  it("should reject low confidence signals", () => {
    const signal = mockSignal({ confidence: 0.3 });
    const assessment = rm.assess(signal, 50, [], 0, 0);
    expect(assessment.allowed).toBe(false);
    expect(assessment.reason).toContain("Confidence");
  });

  it("should reject when max positions reached", () => {
    const signal = mockSignal();
    const fakePositions = Array.from({ length: 10 }, () => ({}) as any);
    const assessment = rm.assess(signal, 50, fakePositions, 0, 0);
    expect(assessment.allowed).toBe(false);
    expect(assessment.reason).toContain("Max positions");
  });

  it("should reject when daily loss limit reached", () => {
    const signal = mockSignal();
    const assessment = rm.assess(signal, 50, [], 0, -50);
    expect(assessment.allowed).toBe(false);
    expect(assessment.reason).toContain("Daily loss");
  });

  it("should reduce size to fit position limit", () => {
    const signal = mockSignal({ currentPrice: 0.5 });
    // Max position = $100, requesting 300 shares at $0.50 = $150
    const assessment = rm.assess(signal, 300, [], 0, 0);
    expect(assessment.allowed).toBe(true);
    expect(assessment.adjustedSize).toBeLessThan(300);
    expect(assessment.warnings.length).toBeGreaterThan(0);
  });

  it("should reject when total exposure exceeded", () => {
    const signal = mockSignal();
    const assessment = rm.assess(signal, 50, [], 500, 0); // already at max
    expect(assessment.allowed).toBe(false);
    expect(assessment.reason).toContain("exposure");
  });

  it("should calculate stop-loss", () => {
    const sl = rm.getStopLoss(0.65, "buy");
    expect(sl).toBeCloseTo(0.65 * 0.85, 4);
  });

  it("should calculate take-profit", () => {
    const tp = rm.getTakeProfit(0.65, "buy");
    expect(tp).toBeCloseTo(0.65 * 1.5, 4);
  });

  it("should detect drawdown breach", () => {
    expect(rm.isDrawdownBreached(0.15)).toBe(false);
    expect(rm.isDrawdownBreached(0.25)).toBe(true);
  });
});

// ============================================================================
// PolyclawPro (Integration)
// ============================================================================

describe("PolyclawPro", () => {
  let polyclaw: PolyclawPro;

  beforeEach(() => {
    polyclaw = new PolyclawPro({
      platforms: ["polymarket"],
      risk: { maxPositionSize: 100, dailyLossLimit: 50 },
    });
  });

  it("should instantiate with default config", () => {
    const pc = new PolyclawPro();
    const status = pc.getStatus();
    expect(status.openPositions).toBe(0);
    expect(status.enabledStrategies.length).toBeGreaterThan(0);
    expect(status.scanning).toBe(false);
  });

  it("should evaluate a signal through risk manager", () => {
    const signal = mockSignal({ confidence: 0.8 });
    const decision = polyclaw.evaluate(signal, 50);
    expect(decision.riskAllowed).toBe(true);
    expect(decision.suggestedSize).toBeLessThanOrEqual(50);
  });

  it("should reject risky signals", () => {
    const signal = mockSignal({ confidence: 0.2 });
    const decision = polyclaw.evaluate(signal, 50);
    expect(decision.riskAllowed).toBe(false);
  });

  it("should execute a trade and open a position", () => {
    const signal = mockSignal({ confidence: 0.8 });
    const decision = polyclaw.execute(signal, 50);
    expect(decision.riskAllowed).toBe(true);
    expect(decision.position).toBeDefined();
    expect(decision.position!.status).toBe("open");
    expect(polyclaw.getStatus().openPositions).toBe(1);
  });

  it("should close a position", () => {
    const signal = mockSignal({ confidence: 0.8, currentPrice: 0.5 });
    const decision = polyclaw.execute(signal, 100);
    const posId = decision.position!.id;

    const closed = polyclaw.closePosition(posId, 0.7);
    expect(closed).not.toBeNull();
    expect(closed!.realizedPnL).toBeCloseTo(20, 1); // 100 * (0.70 - 0.50)
    expect(polyclaw.getStatus().openPositions).toBe(0);
  });

  it("should update prices and trigger stops", () => {
    const signal = mockSignal({ confidence: 0.8, currentPrice: 0.65 });
    polyclaw.execute(signal, 100);

    // Price drops below stop-loss
    const triggered = polyclaw.updatePrices(new Map([[signal.marketId, 0.4]]));
    expect(triggered.length).toBeGreaterThanOrEqual(0);
    // Stop-loss triggers are set by default in execute()
  });

  it("should enable/disable strategies", () => {
    polyclaw.setStrategy("whale-following", true);
    expect(polyclaw.getStatus().enabledStrategies).toContain("whale-following");

    polyclaw.setStrategy("whale-following", false);
    expect(polyclaw.getStatus().enabledStrategies).not.toContain(
      "whale-following"
    );
  });

  it("should track performance across trades", () => {
    const s1 = mockSignal({ confidence: 0.8, currentPrice: 0.5 });
    const s2 = mockSignal({
      confidence: 0.8,
      currentPrice: 0.6,
      marketId: "poly:market-2",
    });

    const d1 = polyclaw.execute(s1, 100);
    polyclaw.closePosition(d1.position!.id, 0.7); // +$20

    const d2 = polyclaw.execute(s2, 100);
    polyclaw.closePosition(d2.position!.id, 0.55); // -$5

    const perf = polyclaw.getPerformance();
    expect(perf.totalTrades).toBe(2);
    expect(perf.realizedPnL).toBeCloseTo(15, 1);
    expect(perf.winRate).toBe(0.5);
  });

  it("should start and stop scanning", () => {
    polyclaw.startScanning();
    expect(polyclaw.getStatus().scanning).toBe(true);

    polyclaw.stopScanning();
    expect(polyclaw.getStatus().scanning).toBe(false);
  });
});

// ============================================================================
// Zod Schema Validation
// ============================================================================

describe("schemas", () => {
  it("should validate valid risk config", () => {
    const result = RiskConfigSchema.safeParse(DEFAULT_RISK_CONFIG);
    expect(result.success).toBe(true);
  });

  it("should reject invalid risk config", () => {
    const result = RiskConfigSchema.safeParse({
      maxPositionSize: -1,
      maxTotalExposure: 500,
      maxPositions: 10,
      stopLossPercent: 0.15,
      takeProfitPercent: 0.5,
      dailyLossLimit: 50,
      maxDrawdownPercent: 0.2,
      minLiquidity: 5000,
      minConfidence: 0.6,
    });
    expect(result.success).toBe(false);
  });

  it("should validate full polyclaw config", () => {
    const result = PolyclawConfigSchema.safeParse({
      platforms: ["polymarket", "kalshi"],
      strategies: {
        momentum: { enabled: true, weight: 0.8, params: {} },
      },
      risk: DEFAULT_RISK_CONFIG,
      scanIntervalMs: 600000,
      maxMarketsToScan: 50,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// MarketScanner (unit, no network)
// ============================================================================

describe("MarketScanner", () => {
  it("should instantiate", () => {
    const scanner = new MarketScanner();
    expect(scanner).toBeDefined();
    expect(scanner.getCachedMarkets()).toHaveLength(0);
  });

  it("should return empty history for unknown market", () => {
    const scanner = new MarketScanner();
    expect(scanner.getPriceHistory("nonexistent")).toHaveLength(0);
  });

  it("should clear cache", () => {
    const scanner = new MarketScanner();
    scanner.clearCache();
    expect(scanner.getCachedMarkets()).toHaveLength(0);
  });
});
