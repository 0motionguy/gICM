import type { OHLCV } from "../core/types.js";

export class Indicators {
  // Simple Moving Average
  static SMA(prices: number[], period: number): number[] {
    const result: number[] = [];
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
  static EMA(prices: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        // First EMA is SMA
        const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        result.push(sma);
      } else {
        const prevEMA = result[i - 1]!;
        const currentPrice = prices[i]!;
        result.push((currentPrice - prevEMA) * multiplier + prevEMA);
      }
    }
    return result;
  }

  // Relative Strength Index
  static RSI(bars: OHLCV[], period = 14): number[] {
    const closes = bars.map((b) => b.close);
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < closes.length; i++) {
      const change = closes[i]! - closes[i - 1]!;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    result.push(NaN); // First bar has no RSI

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
  static MACD(
    prices: number[],
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    const fastEMA = this.EMA(prices, fastPeriod);
    const slowEMA = this.EMA(prices, slowPeriod);

    const macdLine: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(fastEMA[i]!) || isNaN(slowEMA[i]!)) {
        macdLine.push(NaN);
      } else {
        macdLine.push(fastEMA[i]! - slowEMA[i]!);
      }
    }

    const validMacd = macdLine.filter((v) => !isNaN(v));
    const signalEMA = this.EMA(validMacd, signalPeriod);

    // Align signal with MACD
    const signal: number[] = [];
    let signalIdx = 0;
    for (let i = 0; i < macdLine.length; i++) {
      if (isNaN(macdLine[i]!)) {
        signal.push(NaN);
      } else {
        signal.push(signalEMA[signalIdx++] ?? NaN);
      }
    }

    const histogram: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(macdLine[i]!) || isNaN(signal[i]!)) {
        histogram.push(NaN);
      } else {
        histogram.push(macdLine[i]! - signal[i]!);
      }
    }

    return { macd: macdLine, signal, histogram };
  }

  // Bollinger Bands
  static BollingerBands(
    prices: number[],
    period = 20,
    stdDev = 2
  ): { upper: number[]; middle: number[]; lower: number[] } {
    const middle = this.SMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = middle[i]!;
        const variance =
          slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const sd = Math.sqrt(variance);

        upper.push(mean + stdDev * sd);
        lower.push(mean - stdDev * sd);
      }
    }

    return { upper, middle, lower };
  }

  // Average True Range
  static ATR(bars: OHLCV[], period = 14): number[] {
    const trueRanges: number[] = [];

    for (let i = 0; i < bars.length; i++) {
      const current = bars[i]!;
      if (i === 0) {
        trueRanges.push(current.high - current.low);
      } else {
        const prev = bars[i - 1]!;
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
  static Stochastic(
    bars: OHLCV[],
    kPeriod = 14,
    dPeriod = 3
  ): { k: number[]; d: number[] } {
    const k: number[] = [];

    for (let i = 0; i < bars.length; i++) {
      if (i < kPeriod - 1) {
        k.push(NaN);
      } else {
        const slice = bars.slice(i - kPeriod + 1, i + 1);
        const highs = slice.map((b) => b.high);
        const lows = slice.map((b) => b.low);

        const highestHigh = Math.max(...highs);
        const lowestLow = Math.min(...lows);
        const currentClose = bars[i]!.close;

        if (highestHigh === lowestLow) {
          k.push(50);
        } else {
          k.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100);
        }
      }
    }

    const validK = k.filter((v) => !isNaN(v));
    const dValues = this.SMA(validK, dPeriod);

    // Align D with K
    const d: number[] = [];
    let dIdx = 0;
    for (let i = 0; i < k.length; i++) {
      if (isNaN(k[i]!)) {
        d.push(NaN);
      } else {
        d.push(dValues[dIdx++] ?? NaN);
      }
    }

    return { k, d };
  }

  // Volume Weighted Average Price
  static VWAP(bars: OHLCV[]): number[] {
    const result: number[] = [];
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
}
