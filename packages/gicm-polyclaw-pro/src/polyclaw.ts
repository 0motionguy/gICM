/**
 * PolyclawPro — main orchestrator combining scanner, signals, positions, and risk.
 */

import { MarketScanner, type ScanOptions } from "./scanner.js";
import { SignalEngine } from "./signals.js";
import { PositionManager } from "./positions.js";
import { RiskManager } from "./risk.js";
import type {
  Market,
  Signal,
  SignalAggregate,
  Position,
  PerformanceMetrics,
  PolyclawConfig,
  StrategyName,
} from "./types.js";
import {
  DEFAULT_RISK_CONFIG,
  DEFAULT_STRATEGY_CONFIGS as DEFAULTS,
} from "./types.js";

export interface PolyclawStatus {
  scanning: boolean;
  openPositions: number;
  totalExposure: number;
  dailyPnL: number;
  enabledStrategies: StrategyName[];
  marketsTracked: number;
  lastScanAt?: string;
}

export interface TradeDecision {
  signal: Signal;
  riskAllowed: boolean;
  riskReason?: string;
  riskWarnings: string[];
  suggestedSize: number;
  position?: Position;
}

export class PolyclawPro {
  readonly scanner: MarketScanner;
  readonly signals: SignalEngine;
  readonly positions: PositionManager;
  readonly risk: RiskManager;

  private config: PolyclawConfig;
  private scanning = false;
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private lastScanAt?: string;

  constructor(config?: Partial<PolyclawConfig>) {
    this.config = {
      platforms: config?.platforms ?? ["polymarket"],
      strategies: { ...DEFAULTS, ...(config?.strategies ?? {}) },
      risk: { ...DEFAULT_RISK_CONFIG, ...(config?.risk ?? {}) },
      scanIntervalMs: config?.scanIntervalMs ?? 600_000, // 10 min
      maxMarketsToScan: config?.maxMarketsToScan ?? 50,
    };

    this.scanner = new MarketScanner();
    this.signals = new SignalEngine(this.config.strategies);
    this.positions = new PositionManager();
    this.risk = new RiskManager(this.config.risk);
  }

  /**
   * Scan markets and generate signals.
   * Returns aggregated signals per market.
   */
  async scan(options?: ScanOptions): Promise<SignalAggregate[]> {
    const scanOpts: ScanOptions = {
      platforms: this.config.platforms,
      maxMarkets: this.config.maxMarketsToScan,
      ...options,
    };

    const result = await this.scanner.scan(scanOpts);
    this.lastScanAt = result.scannedAt;

    const aggregates: SignalAggregate[] = [];

    for (const market of result.markets) {
      const history = this.scanner.getPriceHistory(market.id);

      // Find cross-platform prices for arbitrage
      const crossPrices = this.findCrossPlatformPrices(market, result.markets);

      const aggregate = this.signals.analyze(market, history, crossPrices);
      if (aggregate.totalSignals > 0) {
        aggregates.push(aggregate);
      }
    }

    return aggregates.sort((a, b) => b.avgConfidence - a.avgConfidence);
  }

  /**
   * Evaluate a signal and decide whether to trade.
   */
  evaluate(signal: Signal, proposedSize = 50): TradeDecision {
    const assessment = this.risk.assess(
      signal,
      proposedSize,
      this.positions.getOpenPositions(),
      this.positions.getTotalExposure(),
      this.positions.getDailyPnL()
    );

    return {
      signal,
      riskAllowed: assessment.allowed,
      riskReason: assessment.reason,
      riskWarnings: assessment.warnings,
      suggestedSize: assessment.adjustedSize ?? proposedSize,
    };
  }

  /**
   * Execute a trade from a signal (opens a position).
   */
  execute(signal: Signal, size: number): TradeDecision {
    const decision = this.evaluate(signal, size);

    if (!decision.riskAllowed) {
      return decision;
    }

    const position = this.positions.openPosition(
      signal,
      decision.suggestedSize,
      signal.direction === "sell" ? "sell" : "buy"
    );

    // Set stop-loss and take-profit
    const stopLoss = this.risk.getStopLoss(position.entryPrice, position.side);
    const takeProfit = this.risk.getTakeProfit(
      position.entryPrice,
      position.side
    );
    this.positions.setLimits(position.id, stopLoss, takeProfit);

    decision.position = this.positions.getPosition(position.id);
    return decision;
  }

  /**
   * Close a position.
   */
  closePosition(positionId: string, exitPrice: number): Position | null {
    return this.positions.closePosition(positionId, exitPrice);
  }

  /**
   * Update prices and check triggers.
   */
  updatePrices(marketPrices: Map<string, number>): Position[] {
    this.positions.updatePrices(marketPrices);
    return this.positions.checkTriggers();
  }

  /**
   * Get current status.
   */
  getStatus(): PolyclawStatus {
    return {
      scanning: this.scanning,
      openPositions: this.positions.getOpenPositions().length,
      totalExposure: this.positions.getTotalExposure(),
      dailyPnL: this.positions.getDailyPnL(),
      enabledStrategies: this.signals.getEnabledStrategies(),
      marketsTracked: this.scanner.getCachedMarkets().length,
      lastScanAt: this.lastScanAt,
    };
  }

  /**
   * Get performance metrics.
   */
  getPerformance(): PerformanceMetrics {
    return this.positions.getPerformance();
  }

  /**
   * Start periodic scanning.
   */
  startScanning(): void {
    if (this.scanning) return;
    this.scanning = true;
    this.scanInterval = setInterval(
      () => this.scan().catch(console.error),
      this.config.scanIntervalMs
    );
  }

  /**
   * Stop periodic scanning.
   */
  stopScanning(): void {
    this.scanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Enable or disable a strategy.
   */
  setStrategy(strategy: StrategyName, enabled: boolean): void {
    this.signals.updateConfig(strategy, { enabled });
  }

  private findCrossPlatformPrices(
    market: Market,
    allMarkets: Market[]
  ): Map<string, number> | undefined {
    // Simple heuristic: find markets on other platforms with similar questions
    const crossPrices = new Map<string, number>();
    const keywords = market.question
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);

    for (const other of allMarkets) {
      if (other.platform === market.platform) continue;
      if (other.id === market.id) continue;

      const otherWords = other.question.toLowerCase();
      const matchCount = keywords.filter((k) => otherWords.includes(k)).length;

      if (matchCount >= 3 && keywords.length > 0) {
        crossPrices.set(
          `${other.platform}:${other.id}`,
          other.prices[0] ?? 0.5
        );
      }
    }

    return crossPrices.size > 0 ? crossPrices : undefined;
  }
}
