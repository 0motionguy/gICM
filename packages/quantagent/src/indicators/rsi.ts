/**
 * RSI (Relative Strength Index) Indicator
 */

export interface RSIResult {
  value: number;
  signal: "overbought" | "oversold" | "neutral";
  divergence?: "bullish" | "bearish" | null;
}

/**
 * Calculate RSI for a series of closing prices
 * @param closes - Array of closing prices
 * @param period - RSI period (default 14)
 */
export function calculateRSI(closes: number[], period: number = 14): RSIResult {
  if (closes.length < period + 1) {
    return { value: 50, signal: "neutral" };
  }

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Separate gains and losses
  const gains: number[] = [];
  const losses: number[] = [];

  for (const change of changes) {
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate smoothed averages using Wilder's smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  // Calculate RS and RSI
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  // Determine signal
  let signal: "overbought" | "oversold" | "neutral" = "neutral";
  if (rsi >= 70) {
    signal = "overbought";
  } else if (rsi <= 30) {
    signal = "oversold";
  }

  return {
    value: Math.round(rsi * 100) / 100,
    signal,
  };
}

/**
 * Calculate RSI with divergence detection
 */
export function calculateRSIWithDivergence(
  closes: number[],
  period: number = 14,
  lookback: number = 14
): RSIResult {
  const result = calculateRSI(closes, period);

  if (closes.length < lookback + period) {
    return result;
  }

  // Calculate RSI for the lookback period
  const rsiValues: number[] = [];
  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const rsi = calculateRSI(slice, period);
    rsiValues.push(rsi.value);
  }

  // Get price and RSI at start and end of lookback
  const priceStart = closes[closes.length - lookback - 1];
  const priceEnd = closes[closes.length - 1];
  const rsiStart = rsiValues[0];
  const rsiEnd = rsiValues[rsiValues.length - 1];

  // Detect divergences
  let divergence: "bullish" | "bearish" | null = null;

  // Bullish divergence: price makes lower low, RSI makes higher low
  if (priceEnd < priceStart && rsiEnd > rsiStart) {
    divergence = "bullish";
  }

  // Bearish divergence: price makes higher high, RSI makes lower high
  if (priceEnd > priceStart && rsiEnd < rsiStart) {
    divergence = "bearish";
  }

  return {
    ...result,
    divergence,
  };
}
