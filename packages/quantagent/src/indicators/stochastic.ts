/**
 * Stochastic Oscillator Indicator
 */

export interface StochasticResult {
  k: number; // Fast stochastic
  d: number; // Slow stochastic (signal line)
  signal: "overbought" | "oversold" | "neutral";
  crossover?: "bullish" | "bearish" | null;
}

/**
 * Calculate Stochastic Oscillator
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param kPeriod - %K period (default 14)
 * @param dPeriod - %D smoothing period (default 3)
 * @param smooth - Smoothing for %K (default 3)
 */
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3,
  smooth: number = 3
): StochasticResult {
  if (
    highs.length < kPeriod + smooth + dPeriod ||
    lows.length < kPeriod + smooth + dPeriod ||
    closes.length < kPeriod + smooth + dPeriod
  ) {
    return { k: 50, d: 50, signal: "neutral" };
  }

  // Calculate raw %K values
  const rawKValues: number[] = [];

  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    const currentClose = closes[i];

    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);

    const denominator = highestHigh - lowestLow;
    const rawK =
      denominator === 0
        ? 50
        : ((currentClose - lowestLow) / denominator) * 100;

    rawKValues.push(rawK);
  }

  // Smooth %K values (Fast Stochastic becomes Slow Stochastic)
  const smoothedK: number[] = [];
  for (let i = smooth - 1; i < rawKValues.length; i++) {
    const slice = rawKValues.slice(i - smooth + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / smooth;
    smoothedK.push(avg);
  }

  // Calculate %D (SMA of smoothed %K)
  const dValues: number[] = [];
  for (let i = dPeriod - 1; i < smoothedK.length; i++) {
    const slice = smoothedK.slice(i - dPeriod + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / dPeriod;
    dValues.push(avg);
  }

  // Get current values
  const k = smoothedK[smoothedK.length - 1] || 50;
  const d = dValues[dValues.length - 1] || 50;

  // Determine signal
  let signal: "overbought" | "oversold" | "neutral" = "neutral";
  if (k >= 80 && d >= 80) {
    signal = "overbought";
  } else if (k <= 20 && d <= 20) {
    signal = "oversold";
  }

  // Detect crossovers
  let crossover: "bullish" | "bearish" | null = null;
  if (smoothedK.length >= 2 && dValues.length >= 2) {
    const prevK = smoothedK[smoothedK.length - 2];
    const prevD = dValues[dValues.length - 2];

    // Bullish crossover: %K crosses above %D in oversold territory
    if (prevK <= prevD && k > d && k < 30) {
      crossover = "bullish";
    }
    // Bearish crossover: %K crosses below %D in overbought territory
    else if (prevK >= prevD && k < d && k > 70) {
      crossover = "bearish";
    }
  }

  return {
    k: Math.round(k * 100) / 100,
    d: Math.round(d * 100) / 100,
    signal,
    crossover,
  };
}

/**
 * Calculate Stochastic RSI
 * Combines Stochastic with RSI for more sensitive readings
 */
export function calculateStochRSI(
  closes: number[],
  rsiPeriod: number = 14,
  stochPeriod: number = 14,
  kSmooth: number = 3,
  dSmooth: number = 3
): StochasticResult {
  if (closes.length < rsiPeriod + stochPeriod + kSmooth + dSmooth) {
    return { k: 50, d: 50, signal: "neutral" };
  }

  // First calculate RSI values
  const rsiValues: number[] = [];

  for (let i = rsiPeriod; i <= closes.length; i++) {
    const slice = closes.slice(0, i);

    // Calculate RSI for this slice
    const changes: number[] = [];
    for (let j = 1; j < slice.length; j++) {
      changes.push(slice[j] - slice[j - 1]);
    }

    const gains = changes.map((c) => (c > 0 ? c : 0));
    const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));

    let avgGain =
      gains.slice(-rsiPeriod).reduce((a, b) => a + b, 0) / rsiPeriod;
    let avgLoss =
      losses.slice(-rsiPeriod).reduce((a, b) => a + b, 0) / rsiPeriod;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    rsiValues.push(rsi);
  }

  // Now calculate Stochastic of RSI values
  const stochK: number[] = [];

  for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
    const periodRSI = rsiValues.slice(i - stochPeriod + 1, i + 1);
    const highestRSI = Math.max(...periodRSI);
    const lowestRSI = Math.min(...periodRSI);
    const currentRSI = rsiValues[i];

    const denominator = highestRSI - lowestRSI;
    const k =
      denominator === 0
        ? 50
        : ((currentRSI - lowestRSI) / denominator) * 100;

    stochK.push(k);
  }

  // Smooth %K
  const smoothedK: number[] = [];
  for (let i = kSmooth - 1; i < stochK.length; i++) {
    const slice = stochK.slice(i - kSmooth + 1, i + 1);
    smoothedK.push(slice.reduce((a, b) => a + b, 0) / kSmooth);
  }

  // Calculate %D
  const dValues: number[] = [];
  for (let i = dSmooth - 1; i < smoothedK.length; i++) {
    const slice = smoothedK.slice(i - dSmooth + 1, i + 1);
    dValues.push(slice.reduce((a, b) => a + b, 0) / dSmooth);
  }

  const k = smoothedK[smoothedK.length - 1] || 50;
  const d = dValues[dValues.length - 1] || 50;

  let signal: "overbought" | "oversold" | "neutral" = "neutral";
  if (k >= 80) signal = "overbought";
  else if (k <= 20) signal = "oversold";

  return {
    k: Math.round(k * 100) / 100,
    d: Math.round(d * 100) / 100,
    signal,
  };
}
