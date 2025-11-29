import type {
  BacktesterConfig,
  OHLCV,
  BacktestResult,
  Signal,
  DataProvider,
} from "./types.js";
import { BacktesterConfigSchema } from "./types.js";
import { Portfolio } from "./portfolio.js";
import type { Strategy } from "../strategies/base.js";
import { MetricsCalculator } from "../analytics/metrics.js";

export interface BacktestOptions {
  startDate: Date;
  endDate: Date;
  symbols: string[];
  interval: string;
  warmupPeriod?: number;
}

export class BacktestEngine {
  private config: BacktesterConfig;
  private portfolio: Portfolio;
  private strategy?: Strategy;
  private dataProvider?: DataProvider;
  private metricsCalculator: MetricsCalculator;

  constructor(config: Partial<BacktesterConfig> = {}) {
    this.config = BacktesterConfigSchema.parse(config);
    this.portfolio = new Portfolio(this.config);
    this.metricsCalculator = new MetricsCalculator(this.config);
  }

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  setDataProvider(provider: DataProvider): void {
    this.dataProvider = provider;
  }

  async run(options: BacktestOptions): Promise<BacktestResult> {
    if (!this.strategy) {
      throw new Error("Strategy not set");
    }
    if (!this.dataProvider) {
      throw new Error("Data provider not set");
    }

    this.portfolio.reset();
    this.strategy.reset();

    // Fetch data for all symbols
    const dataMap = new Map<string, OHLCV[]>();
    for (const symbol of options.symbols) {
      const data = await this.dataProvider.getOHLCV(
        symbol,
        options.interval,
        options.startDate,
        options.endDate
      );
      dataMap.set(symbol, data);
    }

    // Align data by timestamp
    const alignedData = this.alignData(dataMap);
    const warmupPeriod = options.warmupPeriod ?? 20;

    // Run simulation
    for (let i = 0; i < alignedData.length; i++) {
      const bar = alignedData[i]!;
      const timestamp = bar.timestamp;
      const historicalBars = alignedData.slice(Math.max(0, i - 100), i + 1);

      // Update prices
      const prices = new Map<string, number>();
      for (const symbol of options.symbols) {
        const symbolData = dataMap.get(symbol);
        const currentBar = symbolData?.find(
          (b) => b.timestamp.getTime() === timestamp.getTime()
        );
        if (currentBar) {
          prices.set(symbol, currentBar.close);
        }
      }

      this.portfolio.updatePrices(prices, timestamp);

      // Skip warmup period
      if (i < warmupPeriod) continue;

      // Generate signals
      const signals = await this.strategy.generateSignals(
        historicalBars,
        this.portfolio.getAllPositions()
      );

      // Execute signals
      for (const signal of signals) {
        await this.executeSignal(signal, prices, timestamp);
      }
    }

    // Close all open positions at end
    const finalBar = alignedData[alignedData.length - 1];
    if (finalBar) {
      const finalPrices = new Map<string, number>();
      for (const symbol of options.symbols) {
        const symbolData = dataMap.get(symbol);
        const lastBar = symbolData?.[symbolData.length - 1];
        if (lastBar) {
          finalPrices.set(symbol, lastBar.close);
        }
      }
      this.closeAllPositions(finalPrices, finalBar.timestamp);
    }

    // Calculate metrics
    const metrics = this.metricsCalculator.calculate(
      this.portfolio.getSnapshots(),
      this.portfolio.getTrades(),
      options.startDate,
      options.endDate
    );

    const finalEquity = this.portfolio.getEquity(new Map());

    return {
      startDate: options.startDate,
      endDate: options.endDate,
      initialCapital: this.config.initialCapital,
      finalEquity,
      totalReturn: finalEquity - this.config.initialCapital,
      totalReturnPercent:
        ((finalEquity - this.config.initialCapital) / this.config.initialCapital) * 100,
      trades: this.portfolio.getTrades(),
      snapshots: this.portfolio.getSnapshots(),
      metrics,
    };
  }

  private alignData(dataMap: Map<string, OHLCV[]>): OHLCV[] {
    // Get all unique timestamps
    const timestamps = new Set<number>();
    for (const data of dataMap.values()) {
      for (const bar of data) {
        timestamps.add(bar.timestamp.getTime());
      }
    }

    // Sort timestamps
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

    // Create aligned data (using first symbol as reference)
    const firstSymbol = Array.from(dataMap.keys())[0];
    const firstData = dataMap.get(firstSymbol!);
    if (!firstData) return [];

    return sortedTimestamps
      .map((ts) => firstData.find((b) => b.timestamp.getTime() === ts))
      .filter((b): b is OHLCV => b !== undefined);
  }

  private async executeSignal(
    signal: Signal,
    prices: Map<string, number>,
    timestamp: Date
  ): Promise<void> {
    const currentPrice = prices.get(signal.symbol);
    if (!currentPrice) return;

    const position = this.portfolio.getPosition(signal.symbol);
    const equity = this.portfolio.getEquity(prices);

    if (signal.action === "buy" && !position) {
      // Calculate position size (example: 10% of equity)
      const positionValue = equity * 0.1;
      const quantity = positionValue / currentPrice;

      const order = this.portfolio.placeOrder({
        symbol: signal.symbol,
        side: "buy",
        type: "market",
        quantity,
      });

      this.portfolio.executeOrder(order.id, currentPrice, timestamp);
    } else if (signal.action === "sell" && position) {
      const order = this.portfolio.placeOrder({
        symbol: signal.symbol,
        side: "sell",
        type: "market",
        quantity: position.quantity,
      });

      this.portfolio.executeOrder(order.id, currentPrice, timestamp);
    }
  }

  private closeAllPositions(prices: Map<string, number>, timestamp: Date): void {
    for (const position of this.portfolio.getAllPositions()) {
      const price = prices.get(position.symbol);
      if (price) {
        const order = this.portfolio.placeOrder({
          symbol: position.symbol,
          side: "sell",
          type: "market",
          quantity: position.quantity,
        });
        this.portfolio.executeOrder(order.id, price, timestamp);
      }
    }
  }

  getPortfolio(): Portfolio {
    return this.portfolio;
  }
}
