/**
 * SignalEngine — aggregates signals from all strategies, produces consensus.
 */

import type {
  Market,
  PricePoint,
  Signal,
  SignalAggregate,
  SignalDirection,
  StrategyConfig,
  StrategyName,
} from "./types.js";
import { runAllStrategies } from "./strategies.js";

export class SignalEngine {
  private configs: Partial<Record<StrategyName, StrategyConfig>>;
  private signalHistory: Signal[] = [];
  private maxHistory = 1000;

  constructor(configs: Partial<Record<StrategyName, StrategyConfig>>) {
    this.configs = configs;
  }

  /**
   * Analyze a market through all enabled strategies.
   */
  analyze(
    market: Market,
    priceHistory: PricePoint[],
    crossPlatformPrices?: Map<string, number>
  ): SignalAggregate {
    const signals = runAllStrategies(
      { market, priceHistory, crossPlatformPrices },
      this.configs
    );

    // Store in history
    this.signalHistory.push(...signals);
    if (this.signalHistory.length > this.maxHistory) {
      this.signalHistory = this.signalHistory.slice(-this.maxHistory);
    }

    return this.aggregate(market.id, signals);
  }

  /**
   * Aggregate signals for a single market.
   */
  private aggregate(marketId: string, signals: Signal[]): SignalAggregate {
    if (signals.length === 0) {
      return {
        marketId,
        signals: [],
        consensus: "hold",
        avgConfidence: 0,
        strongSignals: 0,
        totalSignals: 0,
      };
    }

    // Weighted vote: each signal's direction is weighted by confidence * strategy weight
    let buyWeight = 0;
    let sellWeight = 0;
    let holdWeight = 0;
    let totalConfidence = 0;
    let strongCount = 0;

    for (const signal of signals) {
      const stratConfig = this.configs[signal.strategy];
      const weight = (stratConfig?.weight ?? 0.5) * signal.confidence;

      if (signal.direction === "buy") buyWeight += weight;
      else if (signal.direction === "sell") sellWeight += weight;
      else holdWeight += weight;

      totalConfidence += signal.confidence;
      if (signal.strength === "strong") strongCount++;
    }

    let consensus: SignalDirection = "hold";
    if (buyWeight > sellWeight && buyWeight > holdWeight) consensus = "buy";
    else if (sellWeight > buyWeight && sellWeight > holdWeight)
      consensus = "sell";

    return {
      marketId,
      signals,
      consensus,
      avgConfidence: totalConfidence / signals.length,
      strongSignals: strongCount,
      totalSignals: signals.length,
    };
  }

  /**
   * Get recent signals for a market.
   */
  getSignalsForMarket(marketId: string, limit = 20): Signal[] {
    return this.signalHistory
      .filter((s) => s.marketId === marketId)
      .slice(-limit);
  }

  /**
   * Get all recent signals.
   */
  getRecentSignals(limit = 50): Signal[] {
    return this.signalHistory.slice(-limit);
  }

  /**
   * Update strategy configs.
   */
  updateConfig(strategy: StrategyName, config: Partial<StrategyConfig>): void {
    const existing = this.configs[strategy] ?? {
      enabled: false,
      weight: 0.5,
      params: {},
    };
    this.configs[strategy] = { ...existing, ...config };
  }

  /**
   * Get enabled strategy names.
   */
  getEnabledStrategies(): StrategyName[] {
    return Object.entries(this.configs)
      .filter(([, c]) => c?.enabled)
      .map(([name]) => name as StrategyName);
  }

  /**
   * Clear signal history.
   */
  clearHistory(): void {
    this.signalHistory = [];
  }
}
