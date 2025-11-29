/**
 * Volume Analysis Indicators
 */

export interface VolumeResult {
  currentVolume: number;
  averageVolume: number;
  ratio: number; // Current volume / average volume
  trend: "bullish" | "bearish" | "neutral";
  description: string;
  isHighVolume: boolean;
  isLowVolume: boolean;
}

/**
 * Analyze volume relative to its moving average
 * @param volumes - Array of volume values
 * @param closes - Array of closing prices (for trend confirmation)
 * @param period - Moving average period (default 20)
 */
export function analyzeVolume(
  volumes: number[],
  closes: number[],
  period: number = 20
): VolumeResult {
  if (volumes.length < period || closes.length < period) {
    return {
      currentVolume: volumes[volumes.length - 1] || 0,
      averageVolume: 0,
      ratio: 1,
      trend: "neutral",
      description: "Insufficient data for volume analysis",
      isHighVolume: false,
      isLowVolume: false,
    };
  }

  // Calculate average volume
  const recentVolumes = volumes.slice(-period);
  const averageVolume =
    recentVolumes.reduce((a, b) => a + b, 0) / period;

  // Get current volume and price change
  const currentVolume = volumes[volumes.length - 1];
  const ratio = averageVolume > 0 ? currentVolume / averageVolume : 1;

  // Calculate price direction
  const currentClose = closes[closes.length - 1];
  const previousClose = closes[closes.length - 2];
  const priceUp = currentClose > previousClose;
  const priceDown = currentClose < previousClose;

  // Determine volume trend
  let trend: "bullish" | "bearish" | "neutral" = "neutral";
  let description = "";

  const isHighVolume = ratio > 1.5;
  const isLowVolume = ratio < 0.5;

  if (isHighVolume) {
    if (priceUp) {
      trend = "bullish";
      description =
        "High volume on price increase - strong buying pressure";
    } else if (priceDown) {
      trend = "bearish";
      description =
        "High volume on price decrease - strong selling pressure";
    } else {
      description = "High volume with neutral price action";
    }
  } else if (isLowVolume) {
    if (priceUp) {
      trend = "neutral";
      description =
        "Low volume price increase - weak buying, potential reversal";
    } else if (priceDown) {
      trend = "neutral";
      description =
        "Low volume price decrease - weak selling, potential reversal";
    } else {
      description = "Low volume consolidation";
    }
  } else {
    if (priceUp) {
      trend = "bullish";
      description = "Normal volume on price increase";
    } else if (priceDown) {
      trend = "bearish";
      description = "Normal volume on price decrease";
    } else {
      description = "Normal volume with stable price";
    }
  }

  return {
    currentVolume,
    averageVolume: Math.round(averageVolume),
    ratio: Math.round(ratio * 100) / 100,
    trend,
    description,
    isHighVolume,
    isLowVolume,
  };
}

/**
 * On-Balance Volume (OBV) calculation
 * Cumulative volume indicator that adds volume on up days
 * and subtracts on down days
 */
export function calculateOBV(
  closes: number[],
  volumes: number[]
): {
  obv: number;
  trend: "bullish" | "bearish" | "neutral";
  divergence?: "bullish" | "bearish" | null;
} {
  if (closes.length < 2 || volumes.length < 2) {
    return { obv: 0, trend: "neutral" };
  }

  let obv = 0;
  const obvValues: number[] = [0];

  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
    // If close is same, OBV doesn't change
    obvValues.push(obv);
  }

  // Determine trend from recent OBV movement
  const recentOBV = obvValues.slice(-10);
  const obvChange = recentOBV[recentOBV.length - 1] - recentOBV[0];

  let trend: "bullish" | "bearish" | "neutral" = "neutral";
  if (obvChange > 0) {
    trend = "bullish";
  } else if (obvChange < 0) {
    trend = "bearish";
  }

  // Check for divergence
  const priceChange = closes[closes.length - 1] - closes[closes.length - 10];
  let divergence: "bullish" | "bearish" | null = null;

  // Bullish divergence: price down, OBV up
  if (priceChange < 0 && obvChange > 0) {
    divergence = "bullish";
  }
  // Bearish divergence: price up, OBV down
  else if (priceChange > 0 && obvChange < 0) {
    divergence = "bearish";
  }

  return {
    obv,
    trend,
    divergence,
  };
}

/**
 * Volume Weighted Average Price (VWAP)
 * Useful for intraday trading
 */
export function calculateVWAP(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): {
  vwap: number;
  currentPrice: number;
  position: "above" | "below" | "at";
} {
  if (
    highs.length === 0 ||
    lows.length === 0 ||
    closes.length === 0 ||
    volumes.length === 0
  ) {
    return { vwap: 0, currentPrice: 0, position: "at" };
  }

  // Calculate typical price for each period
  let cumulativePV = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativePV += typicalPrice * volumes[i];
    cumulativeVolume += volumes[i];
  }

  const vwap = cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : 0;
  const currentPrice = closes[closes.length - 1];

  let position: "above" | "below" | "at" = "at";
  const threshold = vwap * 0.001; // 0.1% threshold

  if (currentPrice > vwap + threshold) {
    position = "above";
  } else if (currentPrice < vwap - threshold) {
    position = "below";
  }

  return {
    vwap: Math.round(vwap * 1e8) / 1e8,
    currentPrice,
    position,
  };
}

/**
 * Money Flow Index (MFI) - Volume-weighted RSI
 */
export function calculateMFI(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period: number = 14
): {
  mfi: number;
  signal: "overbought" | "oversold" | "neutral";
} {
  if (
    highs.length < period + 1 ||
    lows.length < period + 1 ||
    closes.length < period + 1 ||
    volumes.length < period + 1
  ) {
    return { mfi: 50, signal: "neutral" };
  }

  // Calculate typical prices
  const typicalPrices = closes.map(
    (close, i) => (highs[i] + lows[i] + close) / 3
  );

  // Calculate raw money flow
  const rawMoneyFlows = typicalPrices.map(
    (tp, i) => tp * volumes[i]
  );

  // Separate positive and negative money flows
  let positiveFlow = 0;
  let negativeFlow = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveFlow += rawMoneyFlows[i];
    } else if (typicalPrices[i] < typicalPrices[i - 1]) {
      negativeFlow += rawMoneyFlows[i];
    }
  }

  // Calculate MFI
  const moneyFlowRatio =
    negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
  const mfi = 100 - 100 / (1 + moneyFlowRatio);

  // Determine signal
  let signal: "overbought" | "oversold" | "neutral" = "neutral";
  if (mfi >= 80) {
    signal = "overbought";
  } else if (mfi <= 20) {
    signal = "oversold";
  }

  return {
    mfi: Math.round(mfi * 100) / 100,
    signal,
  };
}
