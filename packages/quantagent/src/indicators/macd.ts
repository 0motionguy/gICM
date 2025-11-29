/**
 * MACD (Moving Average Convergence Divergence) Indicator
 */

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  trend: "bullish" | "bearish" | "neutral";
  crossover?: "bullish" | "bearish" | null;
}

/**
 * Calculate EMA for a series of values
 */
function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];

  const multiplier = 2 / (period + 1);
  const emas: number[] = [];

  // First EMA is SMA of first 'period' values
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emas.push(ema);

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    emas.push(ema);
  }

  return emas;
}

/**
 * Calculate MACD
 * @param closes - Array of closing prices
 * @param fastPeriod - Fast EMA period (default 12)
 * @param slowPeriod - Slow EMA period (default 26)
 * @param signalPeriod - Signal line period (default 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (closes.length < slowPeriod + signalPeriod) {
    return {
      macd: 0,
      signal: 0,
      histogram: 0,
      trend: "neutral",
    };
  }

  // Calculate fast and slow EMAs
  const fastEMAs = calculateEMA(closes, fastPeriod);
  const slowEMAs = calculateEMA(closes, slowPeriod);

  // Calculate MACD line (difference between fast and slow EMAs)
  const macdLine: number[] = [];
  const startIndex = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMAs.length; i++) {
    const fastIndex = i + startIndex;
    if (fastIndex >= 0 && fastIndex < fastEMAs.length) {
      macdLine.push(fastEMAs[fastIndex] - slowEMAs[i]);
    }
  }

  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);

  // Get current values
  const macd = macdLine[macdLine.length - 1] || 0;
  const signal = signalLine[signalLine.length - 1] || 0;
  const histogram = macd - signal;

  // Determine trend
  let trend: "bullish" | "bearish" | "neutral" = "neutral";
  if (histogram > 0 && macd > 0) {
    trend = "bullish";
  } else if (histogram < 0 && macd < 0) {
    trend = "bearish";
  }

  // Detect crossovers
  let crossover: "bullish" | "bearish" | null = null;
  if (macdLine.length >= 2 && signalLine.length >= 2) {
    const prevMacd = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];

    // Bullish crossover: MACD crosses above signal
    if (prevMacd <= prevSignal && macd > signal) {
      crossover = "bullish";
    }
    // Bearish crossover: MACD crosses below signal
    else if (prevMacd >= prevSignal && macd < signal) {
      crossover = "bearish";
    }
  }

  return {
    macd: Math.round(macd * 1e8) / 1e8,
    signal: Math.round(signal * 1e8) / 1e8,
    histogram: Math.round(histogram * 1e8) / 1e8,
    trend,
    crossover,
  };
}

/**
 * Calculate MACD histogram trend
 */
export function getMACDHistogramTrend(
  closes: number[],
  lookback: number = 5
): "increasing" | "decreasing" | "neutral" {
  if (closes.length < 26 + 9 + lookback) {
    return "neutral";
  }

  const histograms: number[] = [];

  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const macd = calculateMACD(slice);
    histograms.push(macd.histogram);
  }

  // Check if histogram is consistently increasing or decreasing
  let increasing = 0;
  let decreasing = 0;

  for (let i = 1; i < histograms.length; i++) {
    if (histograms[i] > histograms[i - 1]) {
      increasing++;
    } else if (histograms[i] < histograms[i - 1]) {
      decreasing++;
    }
  }

  if (increasing >= lookback * 0.7) return "increasing";
  if (decreasing >= lookback * 0.7) return "decreasing";
  return "neutral";
}
