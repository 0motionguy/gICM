// src/core/types.ts
import { z } from "zod";
var BacktesterConfigSchema = z.object({
  initialCapital: z.number().default(1e4),
  currency: z.string().default("USD"),
  slippage: z.number().default(1e-3),
  // 0.1%
  commission: z.number().default(1e-3),
  // 0.1%
  marginEnabled: z.boolean().default(false),
  maxLeverage: z.number().default(1),
  riskFreeRate: z.number().default(0.05)
  // 5% annual
});

// src/core/portfolio.ts
var Portfolio = class {
  cash;
  positions = /* @__PURE__ */ new Map();
  trades = [];
  orders = /* @__PURE__ */ new Map();
  snapshots = [];
  config;
  highWaterMark;
  tradeCounter = 0;
  orderCounter = 0;
  constructor(config) {
    this.config = config;
    this.cash = config.initialCapital;
    this.highWaterMark = config.initialCapital;
  }
  getEquity(prices) {
    let positionsValue = 0;
    for (const [symbol, position] of this.positions) {
      const price = prices.get(symbol) ?? position.currentPrice;
      positionsValue += position.quantity * price;
    }
    return this.cash + positionsValue;
  }
  getCash() {
    return this.cash;
  }
  getPosition(symbol) {
    return this.positions.get(symbol);
  }
  getAllPositions() {
    return Array.from(this.positions.values());
  }
  getTrades() {
    return this.trades;
  }
  placeOrder(order) {
    const newOrder = {
      ...order,
      id: `order_${++this.orderCounter}`,
      createdAt: /* @__PURE__ */ new Date(),
      status: "pending"
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }
  executeOrder(orderId, price, timestamp) {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "pending") return null;
    const slippage = order.side === "buy" ? price * (1 + this.config.slippage) : price * (1 - this.config.slippage);
    const executionPrice = slippage;
    const commission = order.quantity * executionPrice * this.config.commission;
    if (order.side === "buy") {
      const totalCost = order.quantity * executionPrice + commission;
      if (totalCost > this.cash) {
        order.status = "rejected";
        return null;
      }
    }
    order.status = "filled";
    order.filledAt = timestamp;
    order.filledPrice = executionPrice;
    order.filledQuantity = order.quantity;
    const trade = this.processTrade(order, executionPrice, timestamp, commission);
    return trade;
  }
  processTrade(order, price, timestamp, commission) {
    const symbol = order.symbol;
    let position = this.positions.get(symbol);
    const trade = {
      id: `trade_${++this.tradeCounter}`,
      symbol,
      side: order.side === "buy" ? "long" : "short",
      entryPrice: price,
      quantity: order.quantity,
      entryTime: timestamp,
      fees: commission,
      status: "open"
    };
    if (order.side === "buy") {
      this.cash -= order.quantity * price + commission;
      if (!position) {
        position = {
          symbol,
          side: "long",
          quantity: order.quantity,
          avgEntryPrice: price,
          currentPrice: price,
          unrealizedPnl: 0,
          realizedPnl: 0,
          openTime: timestamp,
          trades: [trade]
        };
      } else {
        const totalQuantity = position.quantity + order.quantity;
        position.avgEntryPrice = (position.avgEntryPrice * position.quantity + price * order.quantity) / totalQuantity;
        position.quantity = totalQuantity;
        position.trades.push(trade);
      }
    } else {
      if (position && position.side === "long") {
        const closeQuantity = Math.min(position.quantity, order.quantity);
        const pnl = (price - position.avgEntryPrice) * closeQuantity - commission;
        trade.exitPrice = price;
        trade.exitTime = timestamp;
        trade.pnl = pnl;
        trade.pnlPercent = pnl / (position.avgEntryPrice * closeQuantity) * 100;
        trade.status = "closed";
        this.cash += closeQuantity * price - commission;
        position.realizedPnl += pnl;
        position.quantity -= closeQuantity;
        if (position.quantity <= 0) {
          this.positions.delete(symbol);
        }
      }
    }
    if (position && position.quantity > 0) {
      this.positions.set(symbol, position);
    }
    this.trades.push(trade);
    return trade;
  }
  updatePrices(prices, timestamp) {
    for (const [symbol, position] of this.positions) {
      const price = prices.get(symbol);
      if (price !== void 0) {
        position.currentPrice = price;
        position.unrealizedPnl = (price - position.avgEntryPrice) * position.quantity * (position.side === "long" ? 1 : -1);
      }
    }
    const equity = this.getEquity(prices);
    this.highWaterMark = Math.max(this.highWaterMark, equity);
    const drawdown = this.highWaterMark - equity;
    const drawdownPercent = this.highWaterMark > 0 ? drawdown / this.highWaterMark * 100 : 0;
    this.snapshots.push({
      timestamp,
      equity,
      cash: this.cash,
      positionsValue: equity - this.cash,
      positions: this.getAllPositions().map((p) => ({ ...p })),
      drawdown,
      drawdownPercent
    });
  }
  getSnapshots() {
    return this.snapshots;
  }
  getHighWaterMark() {
    return this.highWaterMark;
  }
  reset() {
    this.cash = this.config.initialCapital;
    this.positions.clear();
    this.trades = [];
    this.orders.clear();
    this.snapshots = [];
    this.highWaterMark = this.config.initialCapital;
    this.tradeCounter = 0;
    this.orderCounter = 0;
  }
};

// src/analytics/metrics.ts
var MetricsCalculator = class {
  config;
  constructor(config) {
    this.config = config;
  }
  calculate(snapshots, trades, startDate, endDate) {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const returns = this.calculateReturns(snapshots);
    const totalReturn = this.calculateTotalReturn(snapshots);
    const annualizedReturn = this.calculateAnnualizedReturn(
      totalReturn,
      startDate,
      endDate
    );
    const cagr = this.calculateCAGR(snapshots, startDate, endDate);
    const volatility = this.calculateVolatility(returns);
    const { maxDrawdown, maxDrawdownDuration } = this.calculateMaxDrawdown(snapshots);
    const calmarRatio = this.calculateCalmarRatio(annualizedReturn, maxDrawdown);
    const sharpeRatio = this.calculateSharpeRatio(returns, volatility);
    const sortinoRatio = this.calculateSortinoRatio(returns);
    const tradingMetrics = this.calculateTradingMetrics(closedTrades);
    const exposureMetrics = this.calculateExposureMetrics(snapshots);
    return {
      totalReturn,
      annualizedReturn,
      cagr,
      volatility,
      maxDrawdown,
      maxDrawdownDuration,
      calmarRatio,
      sharpeRatio,
      sortinoRatio,
      ...tradingMetrics,
      ...exposureMetrics
    };
  }
  calculateReturns(snapshots) {
    const returns = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1].equity;
      const curr = snapshots[i].equity;
      returns.push((curr - prev) / prev);
    }
    return returns;
  }
  calculateTotalReturn(snapshots) {
    if (snapshots.length < 2) return 0;
    const first = snapshots[0].equity;
    const last = snapshots[snapshots.length - 1].equity;
    return (last - first) / first;
  }
  calculateAnnualizedReturn(totalReturn, startDate, endDate) {
    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1e3);
    if (years === 0) return 0;
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }
  calculateCAGR(snapshots, startDate, endDate) {
    if (snapshots.length < 2) return 0;
    const first = snapshots[0].equity;
    const last = snapshots[snapshots.length - 1].equity;
    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1e3);
    if (years === 0) return 0;
    return Math.pow(last / first, 1 / years) - 1;
  }
  calculateVolatility(returns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252);
  }
  calculateMaxDrawdown(snapshots) {
    let maxDrawdown = 0;
    let maxDrawdownDuration = 0;
    let peak = snapshots[0]?.equity ?? 0;
    let drawdownStart = null;
    let currentDuration = 0;
    for (const snapshot of snapshots) {
      if (snapshot.equity > peak) {
        peak = snapshot.equity;
        if (drawdownStart) {
          const duration = (snapshot.timestamp.getTime() - drawdownStart.getTime()) / (24 * 60 * 60 * 1e3);
          maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
          drawdownStart = null;
        }
        currentDuration = 0;
      } else {
        const drawdown = (peak - snapshot.equity) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
        if (!drawdownStart) {
          drawdownStart = snapshot.timestamp;
        }
      }
    }
    return { maxDrawdown, maxDrawdownDuration };
  }
  calculateSharpeRatio(returns, volatility) {
    if (volatility === 0 || returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const annualizedReturn = avgReturn * 252;
    return (annualizedReturn - this.config.riskFreeRate) / volatility;
  }
  calculateSortinoRatio(returns) {
    if (returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const negativeReturns = returns.filter((r) => r < 0);
    if (negativeReturns.length === 0) return Infinity;
    const downsideVariance = negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
    if (downsideDeviation === 0) return Infinity;
    const annualizedReturn = avgReturn * 252;
    return (annualizedReturn - this.config.riskFreeRate) / downsideDeviation;
  }
  calculateCalmarRatio(annualizedReturn, maxDrawdown) {
    if (maxDrawdown === 0) return Infinity;
    return annualizedReturn / maxDrawdown;
  }
  calculateTradingMetrics(trades) {
    const winners = trades.filter((t) => (t.pnl ?? 0) > 0);
    const losers = trades.filter((t) => (t.pnl ?? 0) < 0);
    const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / winners.length : 0;
    const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, t) => sum + (t.pnl ?? 0), 0)) / losers.length : 0;
    const totalWins = winners.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : Infinity;
    const durations = trades.filter((t) => t.exitTime).map((t) => (t.exitTime.getTime() - t.entryTime.getTime()) / (1e3 * 60 * 60));
    const avgTradeDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    for (const trade of trades) {
      if ((trade.pnl ?? 0) > 0) {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      } else if ((trade.pnl ?? 0) < 0) {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      }
    }
    return {
      totalTrades: trades.length,
      winningTrades: winners.length,
      losingTrades: losers.length,
      winRate: trades.length > 0 ? winners.length / trades.length : 0,
      avgWin,
      avgLoss,
      profitFactor,
      avgTradeDuration,
      maxConsecutiveWins,
      maxConsecutiveLosses
    };
  }
  calculateExposureMetrics(snapshots) {
    if (snapshots.length === 0) {
      return { avgExposure: 0, maxExposure: 0, avgLeverage: 0 };
    }
    const exposures = snapshots.map((s) => s.positionsValue / s.equity);
    const avgExposure = exposures.reduce((a, b) => a + b, 0) / exposures.length;
    const maxExposure = Math.max(...exposures);
    return {
      avgExposure,
      maxExposure,
      avgLeverage: avgExposure
      // For non-margin, exposure = leverage
    };
  }
};

// src/core/engine.ts
var BacktestEngine = class {
  config;
  portfolio;
  strategy;
  dataProvider;
  metricsCalculator;
  constructor(config = {}) {
    this.config = BacktesterConfigSchema.parse(config);
    this.portfolio = new Portfolio(this.config);
    this.metricsCalculator = new MetricsCalculator(this.config);
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  setDataProvider(provider) {
    this.dataProvider = provider;
  }
  async run(options) {
    if (!this.strategy) {
      throw new Error("Strategy not set");
    }
    if (!this.dataProvider) {
      throw new Error("Data provider not set");
    }
    this.portfolio.reset();
    this.strategy.reset();
    const dataMap = /* @__PURE__ */ new Map();
    for (const symbol of options.symbols) {
      const data = await this.dataProvider.getOHLCV(
        symbol,
        options.interval,
        options.startDate,
        options.endDate
      );
      dataMap.set(symbol, data);
    }
    const alignedData = this.alignData(dataMap);
    const warmupPeriod = options.warmupPeriod ?? 20;
    for (let i = 0; i < alignedData.length; i++) {
      const bar = alignedData[i];
      const timestamp = bar.timestamp;
      const historicalBars = alignedData.slice(Math.max(0, i - 100), i + 1);
      const prices = /* @__PURE__ */ new Map();
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
      if (i < warmupPeriod) continue;
      const signals = await this.strategy.generateSignals(
        historicalBars,
        this.portfolio.getAllPositions()
      );
      for (const signal of signals) {
        await this.executeSignal(signal, prices, timestamp);
      }
    }
    const finalBar = alignedData[alignedData.length - 1];
    if (finalBar) {
      const finalPrices = /* @__PURE__ */ new Map();
      for (const symbol of options.symbols) {
        const symbolData = dataMap.get(symbol);
        const lastBar = symbolData?.[symbolData.length - 1];
        if (lastBar) {
          finalPrices.set(symbol, lastBar.close);
        }
      }
      this.closeAllPositions(finalPrices, finalBar.timestamp);
    }
    const metrics = this.metricsCalculator.calculate(
      this.portfolio.getSnapshots(),
      this.portfolio.getTrades(),
      options.startDate,
      options.endDate
    );
    const finalEquity = this.portfolio.getEquity(/* @__PURE__ */ new Map());
    return {
      startDate: options.startDate,
      endDate: options.endDate,
      initialCapital: this.config.initialCapital,
      finalEquity,
      totalReturn: finalEquity - this.config.initialCapital,
      totalReturnPercent: (finalEquity - this.config.initialCapital) / this.config.initialCapital * 100,
      trades: this.portfolio.getTrades(),
      snapshots: this.portfolio.getSnapshots(),
      metrics
    };
  }
  alignData(dataMap) {
    const timestamps = /* @__PURE__ */ new Set();
    for (const data of dataMap.values()) {
      for (const bar of data) {
        timestamps.add(bar.timestamp.getTime());
      }
    }
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);
    const firstSymbol = Array.from(dataMap.keys())[0];
    const firstData = dataMap.get(firstSymbol);
    if (!firstData) return [];
    return sortedTimestamps.map((ts) => firstData.find((b) => b.timestamp.getTime() === ts)).filter((b) => b !== void 0);
  }
  async executeSignal(signal, prices, timestamp) {
    const currentPrice = prices.get(signal.symbol);
    if (!currentPrice) return;
    const position = this.portfolio.getPosition(signal.symbol);
    const equity = this.portfolio.getEquity(prices);
    if (signal.action === "buy" && !position) {
      const positionValue = equity * 0.1;
      const quantity = positionValue / currentPrice;
      const order = this.portfolio.placeOrder({
        symbol: signal.symbol,
        side: "buy",
        type: "market",
        quantity
      });
      this.portfolio.executeOrder(order.id, currentPrice, timestamp);
    } else if (signal.action === "sell" && position) {
      const order = this.portfolio.placeOrder({
        symbol: signal.symbol,
        side: "sell",
        type: "market",
        quantity: position.quantity
      });
      this.portfolio.executeOrder(order.id, currentPrice, timestamp);
    }
  }
  closeAllPositions(prices, timestamp) {
    for (const position of this.portfolio.getAllPositions()) {
      const price = prices.get(position.symbol);
      if (price) {
        const order = this.portfolio.placeOrder({
          symbol: position.symbol,
          side: "sell",
          type: "market",
          quantity: position.quantity
        });
        this.portfolio.executeOrder(order.id, price, timestamp);
      }
    }
  }
  getPortfolio() {
    return this.portfolio;
  }
};

// src/data/providers/csv.ts
var CSVDataProvider = class {
  name = "csv";
  data = /* @__PURE__ */ new Map();
  async loadFromString(symbol, csv, config = {}) {
    const delimiter = config.delimiter ?? ",";
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
    const dateCol = headers.indexOf(config.dateColumn?.toLowerCase() ?? "date");
    const openCol = headers.indexOf(config.openColumn?.toLowerCase() ?? "open");
    const highCol = headers.indexOf(config.highColumn?.toLowerCase() ?? "high");
    const lowCol = headers.indexOf(config.lowColumn?.toLowerCase() ?? "low");
    const closeCol = headers.indexOf(config.closeColumn?.toLowerCase() ?? "close");
    const volumeCol = headers.indexOf(config.volumeColumn?.toLowerCase() ?? "volume");
    const bars = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(delimiter);
      try {
        const timestamp = this.parseDate(values[dateCol] ?? "", config.dateFormat);
        const open = parseFloat(values[openCol] ?? "0");
        const high = parseFloat(values[highCol] ?? "0");
        const low = parseFloat(values[lowCol] ?? "0");
        const close = parseFloat(values[closeCol] ?? "0");
        const volume = parseFloat(values[volumeCol] ?? "0");
        if (!isNaN(timestamp.getTime()) && !isNaN(close)) {
          bars.push({ timestamp, open, high, low, close, volume });
        }
      } catch {
        continue;
      }
    }
    bars.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.data.set(symbol, bars);
  }
  parseDate(dateStr, format) {
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    const timestamp = parseInt(dateStr);
    if (!isNaN(timestamp)) {
      if (timestamp > 1e12) {
        return new Date(timestamp);
      } else {
        return new Date(timestamp * 1e3);
      }
    }
    return /* @__PURE__ */ new Date();
  }
  async getOHLCV(symbol, _interval, start, end) {
    const allData = this.data.get(symbol) ?? [];
    return allData.filter(
      (bar) => bar.timestamp >= start && bar.timestamp <= end
    );
  }
  async getLatestPrice(symbol) {
    const data = this.data.get(symbol);
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].close;
  }
  getSymbols() {
    return Array.from(this.data.keys());
  }
  hasData(symbol) {
    return this.data.has(symbol) && this.data.get(symbol).length > 0;
  }
  getDataRange(symbol) {
    const data = this.data.get(symbol);
    if (!data || data.length === 0) return null;
    return {
      start: data[0].timestamp,
      end: data[data.length - 1].timestamp
    };
  }
};

// src/strategies/base.ts
var Strategy = class {
  name;
  description;
  parameters;
  constructor(config) {
    this.name = config.name;
    this.description = config.description ?? "";
    this.parameters = config.parameters;
  }
  getName() {
    return this.name;
  }
  getDescription() {
    return this.description;
  }
  getParameters() {
    return this.parameters;
  }
  setParameter(key, value) {
    this.parameters[key] = value;
  }
};
var SMACrossoverStrategy = class extends Strategy {
  shortPeriod;
  longPeriod;
  symbol;
  constructor(config) {
    super({
      name: "SMA Crossover",
      description: "Buy when short SMA crosses above long SMA, sell when it crosses below",
      parameters: {
        shortPeriod: config.shortPeriod ?? 10,
        longPeriod: config.longPeriod ?? 30,
        symbol: config.symbol
      }
    });
    this.shortPeriod = config.shortPeriod ?? 10;
    this.longPeriod = config.longPeriod ?? 30;
    this.symbol = config.symbol;
  }
  async generateSignals(bars, positions) {
    if (bars.length < this.longPeriod + 1) return [];
    const signals = [];
    const closes = bars.map((b) => b.close);
    const shortSMA = this.calculateSMA(closes, this.shortPeriod);
    const longSMA = this.calculateSMA(closes, this.longPeriod);
    const prevShortSMA = this.calculateSMA(closes.slice(0, -1), this.shortPeriod);
    const prevLongSMA = this.calculateSMA(closes.slice(0, -1), this.longPeriod);
    const currentBar = bars[bars.length - 1];
    const hasPosition = positions.some((p) => p.symbol === this.symbol);
    if (prevShortSMA <= prevLongSMA && shortSMA > longSMA && !hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "buy",
        strength: 0.8,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: "Golden cross: Short SMA crossed above Long SMA"
      });
    }
    if (prevShortSMA >= prevLongSMA && shortSMA < longSMA && hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "sell",
        strength: 0.8,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: "Death cross: Short SMA crossed below Long SMA"
      });
    }
    return signals;
  }
  calculateSMA(prices, period) {
    if (prices.length < period) return 0;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }
  reset() {
  }
};
var RSIStrategy = class extends Strategy {
  period;
  oversoldThreshold;
  overboughtThreshold;
  symbol;
  constructor(config) {
    super({
      name: "RSI Strategy",
      description: "Buy when RSI is oversold, sell when overbought",
      parameters: {
        period: config.period ?? 14,
        oversoldThreshold: config.oversoldThreshold ?? 30,
        overboughtThreshold: config.overboughtThreshold ?? 70,
        symbol: config.symbol
      }
    });
    this.period = config.period ?? 14;
    this.oversoldThreshold = config.oversoldThreshold ?? 30;
    this.overboughtThreshold = config.overboughtThreshold ?? 70;
    this.symbol = config.symbol;
  }
  async generateSignals(bars, positions) {
    if (bars.length < this.period + 1) return [];
    const signals = [];
    const rsi = this.calculateRSI(bars);
    const currentBar = bars[bars.length - 1];
    const hasPosition = positions.some((p) => p.symbol === this.symbol);
    if (rsi < this.oversoldThreshold && !hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "buy",
        strength: (this.oversoldThreshold - rsi) / this.oversoldThreshold,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `RSI oversold at ${rsi.toFixed(2)}`
      });
    }
    if (rsi > this.overboughtThreshold && hasPosition) {
      signals.push({
        symbol: this.symbol,
        action: "sell",
        strength: (rsi - this.overboughtThreshold) / (100 - this.overboughtThreshold),
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `RSI overbought at ${rsi.toFixed(2)}`
      });
    }
    return signals;
  }
  calculateRSI(bars) {
    const closes = bars.map((b) => b.close);
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }
    const recentChanges = changes.slice(-this.period);
    const gains = recentChanges.filter((c) => c > 0);
    const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c));
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / this.period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / this.period : 0;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
  reset() {
  }
};

export {
  BacktesterConfigSchema,
  Portfolio,
  MetricsCalculator,
  BacktestEngine,
  CSVDataProvider,
  Strategy,
  SMACrossoverStrategy,
  RSIStrategy
};
//# sourceMappingURL=chunk-6GHRCX3X.js.map