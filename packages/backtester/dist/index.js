import {
  BacktestEngine,
  BacktesterConfigSchema,
  CSVDataProvider,
  MetricsCalculator,
  Portfolio,
  RSIStrategy,
  SMACrossoverStrategy,
  Strategy
} from "./chunk-6GHRCX3X.js";

// src/strategies/indicators.ts
var Indicators = class {
  // Simple Moving Average
  static SMA(prices, period) {
    const result = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        result.push(slice.reduce((a, b) => a + b, 0) / period);
      }
    }
    return result;
  }
  // Exponential Moving Average
  static EMA(prices, period) {
    const result = [];
    const multiplier = 2 / (period + 1);
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        result.push(sma);
      } else {
        const prevEMA = result[i - 1];
        const currentPrice = prices[i];
        result.push((currentPrice - prevEMA) * multiplier + prevEMA);
      }
    }
    return result;
  }
  // Relative Strength Index
  static RSI(bars, period = 14) {
    const closes = bars.map((b) => b.close);
    const result = [];
    const gains = [];
    const losses = [];
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    result.push(NaN);
    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const recentGains = gains.slice(i - period + 1, i + 1);
        const recentLosses = losses.slice(i - period + 1, i + 1);
        const avgGain = recentGains.reduce((a, b) => a + b, 0) / period;
        const avgLoss = recentLosses.reduce((a, b) => a + b, 0) / period;
        if (avgLoss === 0) {
          result.push(100);
        } else {
          const rs = avgGain / avgLoss;
          result.push(100 - 100 / (1 + rs));
        }
      }
    }
    return result;
  }
  // MACD
  static MACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.EMA(prices, fastPeriod);
    const slowEMA = this.EMA(prices, slowPeriod);
    const macdLine = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
        macdLine.push(NaN);
      } else {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }
    }
    const validMacd = macdLine.filter((v) => !isNaN(v));
    const signalEMA = this.EMA(validMacd, signalPeriod);
    const signal = [];
    let signalIdx = 0;
    for (let i = 0; i < macdLine.length; i++) {
      if (isNaN(macdLine[i])) {
        signal.push(NaN);
      } else {
        signal.push(signalEMA[signalIdx++] ?? NaN);
      }
    }
    const histogram = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(macdLine[i]) || isNaN(signal[i])) {
        histogram.push(NaN);
      } else {
        histogram.push(macdLine[i] - signal[i]);
      }
    }
    return { macd: macdLine, signal, histogram };
  }
  // Bollinger Bands
  static BollingerBands(prices, period = 20, stdDev = 2) {
    const middle = this.SMA(prices, period);
    const upper = [];
    const lower = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = middle[i];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const sd = Math.sqrt(variance);
        upper.push(mean + stdDev * sd);
        lower.push(mean - stdDev * sd);
      }
    }
    return { upper, middle, lower };
  }
  // Average True Range
  static ATR(bars, period = 14) {
    const trueRanges = [];
    for (let i = 0; i < bars.length; i++) {
      const current = bars[i];
      if (i === 0) {
        trueRanges.push(current.high - current.low);
      } else {
        const prev = bars[i - 1];
        const tr = Math.max(
          current.high - current.low,
          Math.abs(current.high - prev.close),
          Math.abs(current.low - prev.close)
        );
        trueRanges.push(tr);
      }
    }
    return this.SMA(trueRanges, period);
  }
  // Stochastic Oscillator
  static Stochastic(bars, kPeriod = 14, dPeriod = 3) {
    const k = [];
    for (let i = 0; i < bars.length; i++) {
      if (i < kPeriod - 1) {
        k.push(NaN);
      } else {
        const slice = bars.slice(i - kPeriod + 1, i + 1);
        const highs = slice.map((b) => b.high);
        const lows = slice.map((b) => b.low);
        const highestHigh = Math.max(...highs);
        const lowestLow = Math.min(...lows);
        const currentClose = bars[i].close;
        if (highestHigh === lowestLow) {
          k.push(50);
        } else {
          k.push((currentClose - lowestLow) / (highestHigh - lowestLow) * 100);
        }
      }
    }
    const validK = k.filter((v) => !isNaN(v));
    const dValues = this.SMA(validK, dPeriod);
    const d = [];
    let dIdx = 0;
    for (let i = 0; i < k.length; i++) {
      if (isNaN(k[i])) {
        d.push(NaN);
      } else {
        d.push(dValues[dIdx++] ?? NaN);
      }
    }
    return { k, d };
  }
  // Volume Weighted Average Price
  static VWAP(bars) {
    const result = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    for (const bar of bars) {
      const typicalPrice = (bar.high + bar.low + bar.close) / 3;
      cumulativeTPV += typicalPrice * bar.volume;
      cumulativeVolume += bar.volume;
      if (cumulativeVolume === 0) {
        result.push(typicalPrice);
      } else {
        result.push(cumulativeTPV / cumulativeVolume);
      }
    }
    return result;
  }
};

// src/analytics/risk.ts
var RiskAnalyzer = class {
  // Value at Risk calculation (Historical method)
  calculateVaR(returns) {
    if (returns.length === 0) {
      return { var95: 0, var99: 0, cvar95: 0, cvar99: 0 };
    }
    const sorted = [...returns].sort((a, b) => a - b);
    const n = sorted.length;
    const idx95 = Math.floor(n * 0.05);
    const idx99 = Math.floor(n * 0.01);
    const var95 = -sorted[idx95];
    const var99 = -sorted[idx99];
    const cvar95 = -sorted.slice(0, idx95 + 1).reduce((a, b) => a + b, 0) / (idx95 + 1);
    const cvar99 = -sorted.slice(0, idx99 + 1).reduce((a, b) => a + b, 0) / (idx99 + 1);
    return { var95, var99, cvar95, cvar99 };
  }
  // Parametric VaR (assumes normal distribution)
  calculateParametricVaR(mean, stdDev, confidence) {
    const zScores = {
      0.9: 1.28,
      0.95: 1.645,
      0.99: 2.33
    };
    const z = zScores[confidence] ?? 1.645;
    return mean - z * stdDev;
  }
  // Analyze drawdown periods
  analyzeDrawdowns(snapshots) {
    if (snapshots.length === 0) {
      return {
        currentDrawdown: 0,
        maxDrawdown: 0,
        avgDrawdown: 0,
        drawdownPeriods: []
      };
    }
    const periods = [];
    let peak = snapshots[0].equity;
    let drawdownStart = null;
    let maxDrawdown = 0;
    let totalDrawdown = 0;
    let drawdownCount = 0;
    for (const snapshot of snapshots) {
      if (snapshot.equity > peak) {
        if (drawdownStart && snapshot.drawdownPercent > 0) {
          const prevSnapshot = snapshots[snapshots.indexOf(snapshot) - 1];
          if (prevSnapshot) {
            periods.push({
              start: drawdownStart.timestamp,
              end: prevSnapshot.timestamp,
              depth: prevSnapshot.drawdownPercent,
              duration: (prevSnapshot.timestamp.getTime() - drawdownStart.timestamp.getTime()) / (24 * 60 * 60 * 1e3),
              recovery: (snapshot.timestamp.getTime() - prevSnapshot.timestamp.getTime()) / (24 * 60 * 60 * 1e3)
            });
          }
        }
        peak = snapshot.equity;
        drawdownStart = null;
      } else if (snapshot.drawdownPercent > 0 && !drawdownStart) {
        drawdownStart = snapshot;
      }
      if (snapshot.drawdownPercent > maxDrawdown) {
        maxDrawdown = snapshot.drawdownPercent;
      }
      if (snapshot.drawdownPercent > 0) {
        totalDrawdown += snapshot.drawdownPercent;
        drawdownCount++;
      }
    }
    const currentDrawdown = snapshots[snapshots.length - 1]?.drawdownPercent ?? 0;
    const avgDrawdown = drawdownCount > 0 ? totalDrawdown / drawdownCount : 0;
    return {
      currentDrawdown,
      maxDrawdown,
      avgDrawdown,
      drawdownPeriods: periods
    };
  }
  // Calculate position concentration risk
  calculateConcentrationRisk(snapshots) {
    if (snapshots.length === 0) {
      return { avgConcentration: 0, maxConcentration: 0, herfindahlIndex: 0 };
    }
    const concentrations = [];
    const herfindahlIndices = [];
    for (const snapshot of snapshots) {
      if (snapshot.positions.length === 0) {
        concentrations.push(0);
        herfindahlIndices.push(0);
        continue;
      }
      const totalValue = snapshot.positions.reduce(
        (sum, p) => sum + p.quantity * p.currentPrice,
        0
      );
      if (totalValue === 0) {
        concentrations.push(0);
        herfindahlIndices.push(0);
        continue;
      }
      const weights = snapshot.positions.map(
        (p) => p.quantity * p.currentPrice / totalValue
      );
      concentrations.push(Math.max(...weights));
      herfindahlIndices.push(weights.reduce((sum, w) => sum + w * w, 0));
    }
    return {
      avgConcentration: concentrations.reduce((a, b) => a + b, 0) / concentrations.length,
      maxConcentration: Math.max(...concentrations),
      herfindahlIndex: herfindahlIndices.reduce((a, b) => a + b, 0) / herfindahlIndices.length
    };
  }
  // Calculate tail risk metrics
  calculateTailRisk(returns) {
    if (returns.length < 4) {
      return { skewness: 0, kurtosis: 0, tailRatio: 1 };
    }
    const n = returns.length;
    const mean = returns.reduce((a, b) => a + b, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) {
      return { skewness: 0, kurtosis: 0, tailRatio: 1 };
    }
    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n;
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / n - 3;
    const sorted = [...returns].sort((a, b) => a - b);
    const p5 = Math.abs(sorted[Math.floor(n * 0.05)]);
    const p95 = Math.abs(sorted[Math.floor(n * 0.95)]);
    const tailRatio = p95 > 0 ? p5 / p95 : 1;
    return { skewness, kurtosis, tailRatio };
  }
  // Calculate trade risk metrics
  calculateTradeRisk(trades) {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== void 0);
    if (closedTrades.length === 0) {
      return {
        avgRiskRewardRatio: 0,
        largestWin: 0,
        largestLoss: 0,
        avgWinLossRatio: 0
      };
    }
    const pnls = closedTrades.map((t) => t.pnl);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses) : 0;
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0)) / losses.length : 0;
    const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : Infinity;
    const avgRiskRewardRatio = avgWinLossRatio;
    return {
      avgRiskRewardRatio,
      largestWin,
      largestLoss,
      avgWinLossRatio
    };
  }
};

// src/analytics/monte-carlo.ts
var MonteCarloSimulator = class {
  initialCapital;
  riskFreeRate;
  constructor(config) {
    this.initialCapital = config.initialCapital;
    this.riskFreeRate = config.riskFreeRate ?? 0.05;
  }
  // Run Monte Carlo simulation using trade resampling
  runTradeResampling(trades, simulations, tradesPerSimulation) {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== void 0);
    if (closedTrades.length === 0) {
      return this.emptyResult();
    }
    const outcomes = [];
    for (let i = 0; i < simulations; i++) {
      const outcome = this.runSingleSimulation(closedTrades, tradesPerSimulation);
      outcomes.push(outcome);
    }
    outcomes.sort((a, b) => a.finalEquity - b.finalEquity);
    return {
      simulations,
      percentiles: {
        p5: outcomes[Math.floor(simulations * 0.05)],
        p25: outcomes[Math.floor(simulations * 0.25)],
        p50: outcomes[Math.floor(simulations * 0.5)],
        p75: outcomes[Math.floor(simulations * 0.75)],
        p95: outcomes[Math.floor(simulations * 0.95)]
      },
      probability: this.calculateProbabilities(outcomes),
      distribution: outcomes
    };
  }
  runSingleSimulation(trades, numTrades) {
    let equity = this.initialCapital;
    let peak = equity;
    let maxDrawdown = 0;
    const equityCurve = [equity];
    for (let i = 0; i < numTrades; i++) {
      const randomIndex = Math.floor(Math.random() * trades.length);
      const trade = trades[randomIndex];
      const pnlPercent = trade.pnlPercent ?? 0;
      const pnl = equity * (pnlPercent / 100);
      equity += pnl;
      equityCurve.push(equity);
      if (equity > peak) {
        peak = equity;
      }
      const drawdown = (peak - equity) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
      if (equity <= 0) {
        equity = 0;
        break;
      }
    }
    const returns = this.calculateReturns(equityCurve);
    const sharpeRatio = this.calculateSharpe(returns);
    return {
      finalEquity: equity,
      totalReturn: (equity - this.initialCapital) / this.initialCapital,
      maxDrawdown,
      sharpeRatio
    };
  }
  calculateReturns(equityCurve) {
    const returns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1];
      if (prev > 0) {
        returns.push((equityCurve[i] - prev) / prev);
      }
    }
    return returns;
  }
  calculateSharpe(returns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) return 0;
    const annualizedReturn = mean * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);
    return (annualizedReturn - this.riskFreeRate) / annualizedStdDev;
  }
  calculateProbabilities(outcomes) {
    const n = outcomes.length;
    const profitCount = outcomes.filter((o) => o.totalReturn > 0).length;
    const doublingCount = outcomes.filter((o) => o.finalEquity >= this.initialCapital * 2).length;
    const ruinCount = outcomes.filter((o) => o.finalEquity <= this.initialCapital * 0.1).length;
    return {
      profit: profitCount / n,
      loss: (n - profitCount) / n,
      doubling: doublingCount / n,
      ruin: ruinCount / n
    };
  }
  // Run Monte Carlo using return distribution
  runReturnSimulation(returns, simulations, periodsPerSimulation) {
    if (returns.length === 0) {
      return this.emptyResult();
    }
    const outcomes = [];
    for (let i = 0; i < simulations; i++) {
      let equity = this.initialCapital;
      let peak = equity;
      let maxDrawdown = 0;
      const equityCurve = [equity];
      for (let j = 0; j < periodsPerSimulation; j++) {
        const randomReturn = returns[Math.floor(Math.random() * returns.length)];
        equity *= 1 + randomReturn;
        equityCurve.push(equity);
        if (equity > peak) {
          peak = equity;
        }
        const drawdown = (peak - equity) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      const simReturns = this.calculateReturns(equityCurve);
      const sharpeRatio = this.calculateSharpe(simReturns);
      outcomes.push({
        finalEquity: equity,
        totalReturn: (equity - this.initialCapital) / this.initialCapital,
        maxDrawdown,
        sharpeRatio
      });
    }
    outcomes.sort((a, b) => a.finalEquity - b.finalEquity);
    return {
      simulations,
      percentiles: {
        p5: outcomes[Math.floor(simulations * 0.05)],
        p25: outcomes[Math.floor(simulations * 0.25)],
        p50: outcomes[Math.floor(simulations * 0.5)],
        p75: outcomes[Math.floor(simulations * 0.75)],
        p95: outcomes[Math.floor(simulations * 0.95)]
      },
      probability: this.calculateProbabilities(outcomes),
      distribution: outcomes
    };
  }
  emptyResult() {
    const emptyOutcome = {
      finalEquity: this.initialCapital,
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
    return {
      simulations: 0,
      percentiles: {
        p5: emptyOutcome,
        p25: emptyOutcome,
        p50: emptyOutcome,
        p75: emptyOutcome,
        p95: emptyOutcome
      },
      probability: {
        profit: 0,
        loss: 0,
        doubling: 0,
        ruin: 0
      },
      distribution: []
    };
  }
};
export {
  BacktestEngine,
  BacktesterConfigSchema,
  CSVDataProvider,
  Indicators,
  MetricsCalculator,
  MonteCarloSimulator,
  Portfolio,
  RSIStrategy,
  RiskAnalyzer,
  SMACrossoverStrategy,
  Strategy
};
//# sourceMappingURL=index.js.map