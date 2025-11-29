/**
 * Bollinger Bands Indicator
 */

export interface BollingerResult {
  upper: number;
  middle: number; // SMA
  lower: number;
  bandwidth: number;
  percentB: number; // Position within bands (0 = lower, 1 = upper)
  signal: "overbought" | "oversold" | "neutral";
  squeeze?: boolean; // Bollinger squeeze (low volatility)
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(data: number[], mean: number): number {
  if (data.length === 0) return 0;

  const squaredDiffs = data.map((value) => Math.pow(value - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((a, b) => a + b, 0) / data.length;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate Bollinger Bands
 * @param closes - Array of closing prices
 * @param period - Moving average period (default 20)
 * @param stdDevMultiplier - Standard deviation multiplier (default 2)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerResult {
  if (closes.length < period) {
    const currentPrice = closes[closes.length - 1] || 0;
    return {
      upper: currentPrice,
      middle: currentPrice,
      lower: currentPrice,
      bandwidth: 0,
      percentB: 0.5,
      signal: "neutral",
    };
  }

  // Get the most recent 'period' closes
  const recentCloses = closes.slice(-period);

  // Calculate middle band (SMA)
  const middle =
    recentCloses.reduce((a, b) => a + b, 0) / period;

  // Calculate standard deviation
  const stdDev = calculateStdDev(recentCloses, middle);

  // Calculate upper and lower bands
  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;

  // Calculate bandwidth (volatility measure)
  const bandwidth = ((upper - lower) / middle) * 100;

  // Calculate %B (position within bands)
  const currentPrice = closes[closes.length - 1];
  const percentB =
    upper - lower === 0 ? 0.5 : (currentPrice - lower) / (upper - lower);

  // Determine signal
  let signal: "overbought" | "oversold" | "neutral" = "neutral";
  if (percentB >= 1) {
    signal = "overbought"; // Price at or above upper band
  } else if (percentB <= 0) {
    signal = "oversold"; // Price at or below lower band
  }

  // Detect Bollinger squeeze (low volatility period)
  // Typically bandwidth < 4% indicates a squeeze
  const squeeze = bandwidth < 4;

  return {
    upper: Math.round(upper * 1e8) / 1e8,
    middle: Math.round(middle * 1e8) / 1e8,
    lower: Math.round(lower * 1e8) / 1e8,
    bandwidth: Math.round(bandwidth * 100) / 100,
    percentB: Math.round(percentB * 100) / 100,
    signal,
    squeeze,
  };
}

/**
 * Calculate Bollinger Band width history for trend analysis
 */
export function getBandwidthTrend(
  closes: number[],
  period: number = 20,
  lookback: number = 10
): "expanding" | "contracting" | "stable" {
  if (closes.length < period + lookback) {
    return "stable";
  }

  const bandwidths: number[] = [];

  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const bb = calculateBollingerBands(slice, period);
    bandwidths.push(bb.bandwidth);
  }

  // Calculate trend
  const firstHalf = bandwidths.slice(0, Math.floor(lookback / 2));
  const secondHalf = bandwidths.slice(Math.floor(lookback / 2));

  const firstAvg =
    firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = (secondAvg - firstAvg) / firstAvg;

  if (change > 0.1) return "expanding";
  if (change < -0.1) return "contracting";
  return "stable";
}

/**
 * Detect Bollinger Band breakouts
 */
export function detectBollingerBreakout(
  closes: number[],
  period: number = 20
): "bullish_breakout" | "bearish_breakout" | null {
  if (closes.length < period + 2) {
    return null;
  }

  // Get current and previous Bollinger Bands
  const currentBB = calculateBollingerBands(closes, period);
  const previousBB = calculateBollingerBands(
    closes.slice(0, -1),
    period
  );

  const currentClose = closes[closes.length - 1];
  const previousClose = closes[closes.length - 2];

  // Bullish breakout: price closes above upper band after being inside
  if (
    previousClose <= previousBB.upper &&
    currentClose > currentBB.upper
  ) {
    return "bullish_breakout";
  }

  // Bearish breakout: price closes below lower band after being inside
  if (
    previousClose >= previousBB.lower &&
    currentClose < currentBB.lower
  ) {
    return "bearish_breakout";
  }

  return null;
}
