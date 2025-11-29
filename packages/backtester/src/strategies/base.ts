import type { OHLCV, Signal, Position } from "../core/types.js";

export interface StrategyConfig {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

export abstract class Strategy {
  protected name: string;
  protected description: string;
  protected parameters: Record<string, unknown>;

  constructor(config: StrategyConfig) {
    this.name = config.name;
    this.description = config.description ?? "";
    this.parameters = config.parameters;
  }

  abstract generateSignals(
    bars: OHLCV[],
    positions: Position[]
  ): Promise<Signal[]>;

  abstract reset(): void;

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getParameters(): Record<string, unknown> {
    return this.parameters;
  }

  setParameter(key: string, value: unknown): void {
    this.parameters[key] = value;
  }
}

// Simple Moving Average Crossover Strategy
export class SMACrossoverStrategy extends Strategy {
  private shortPeriod: number;
  private longPeriod: number;
  private symbol: string;

  constructor(config: { symbol: string; shortPeriod?: number; longPeriod?: number }) {
    super({
      name: "SMA Crossover",
      description: "Buy when short SMA crosses above long SMA, sell when it crosses below",
      parameters: {
        shortPeriod: config.shortPeriod ?? 10,
        longPeriod: config.longPeriod ?? 30,
        symbol: config.symbol,
      },
    });
    this.shortPeriod = config.shortPeriod ?? 10;
    this.longPeriod = config.longPeriod ?? 30;
    this.symbol = config.symbol;
  }

  async generateSignals(bars: OHLCV[], positions: Position[]): Promise<Signal[]> {
    if (bars.length < this.longPeriod + 1) return [];

    const signals: Signal[] = [];
    const closes = bars.map((b) => b.close);

    // Calculate SMAs
    const shortSMA = this.calculateSMA(closes, this.shortPeriod);
    const longSMA = this.calculateSMA(closes, this.longPeriod);
    const prevShortSMA = this.calculateSMA(closes.slice(0, -1), this.shortPeriod);
    const prevLongSMA = this.calculateSMA(closes.slice(0, -1), this.longPeriod);

    const currentBar = bars[bars.length - 1]!;
    const hasPosition = positions.some((p) => p.symbol === this.symbol);

    // Golden cross (buy signal)
    if (prevShortSMA <= prevLongSMA && shortSMA > longSMA && !hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "buy",
        strength: 0.8,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: "Golden cross: Short SMA crossed above Long SMA",
      });
    }

    // Death cross (sell signal)
    if (prevShortSMA >= prevLongSMA && shortSMA < longSMA && hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "sell",
        strength: 0.8,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: "Death cross: Short SMA crossed below Long SMA",
      });
    }

    return signals;
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  reset(): void {
    // No state to reset for this strategy
  }
}

// RSI Strategy
export class RSIStrategy extends Strategy {
  private period: number;
  private oversoldThreshold: number;
  private overboughtThreshold: number;
  private symbol: string;

  constructor(config: {
    symbol: string;
    period?: number;
    oversoldThreshold?: number;
    overboughtThreshold?: number;
  }) {
    super({
      name: "RSI Strategy",
      description: "Buy when RSI is oversold, sell when overbought",
      parameters: {
        period: config.period ?? 14,
        oversoldThreshold: config.oversoldThreshold ?? 30,
        overboughtThreshold: config.overboughtThreshold ?? 70,
        symbol: config.symbol,
      },
    });
    this.period = config.period ?? 14;
    this.oversoldThreshold = config.oversoldThreshold ?? 30;
    this.overboughtThreshold = config.overboughtThreshold ?? 70;
    this.symbol = config.symbol;
  }

  async generateSignals(bars: OHLCV[], positions: Position[]): Promise<Signal[]> {
    if (bars.length < this.period + 1) return [];

    const signals: Signal[] = [];
    const rsi = this.calculateRSI(bars);
    const currentBar = bars[bars.length - 1]!;
    const hasPosition = positions.some((p) => p.symbol === this.symbol);

    // Oversold (buy signal)
    if (rsi < this.oversoldThreshold && !hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "buy",
        strength: (this.oversoldThreshold - rsi) / this.oversoldThreshold,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `RSI oversold at ${rsi.toFixed(2)}`,
      });
    }

    // Overbought (sell signal)
    if (rsi > this.overboughtThreshold && hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "sell",
        strength: (rsi - this.overboughtThreshold) / (100 - this.overboughtThreshold),
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `RSI overbought at ${rsi.toFixed(2)}`,
      });
    }

    return signals;
  }

  private calculateRSI(bars: OHLCV[]): number {
    const closes = bars.map((b) => b.close);
    const changes: number[] = [];

    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i]! - closes[i - 1]!);
    }

    const recentChanges = changes.slice(-this.period);
    const gains = recentChanges.filter((c) => c > 0);
    const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c));

    const avgGain = gains.length > 0
      ? gains.reduce((a, b) => a + b, 0) / this.period
      : 0;
    const avgLoss = losses.length > 0
      ? losses.reduce((a, b) => a + b, 0) / this.period
      : 0;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  reset(): void {
    // No state to reset
  }
}
