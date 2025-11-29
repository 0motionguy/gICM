/**
 * Chart Pattern Detection Engine
 */

import type { OHLCV } from "../agents/types.js";

export interface DetectedPattern {
  pattern: string;
  confidence: number;
  direction: "bullish" | "bearish" | "neutral";
  startIndex: number;
  endIndex: number;
  priceTarget?: number;
  description: string;
}

/**
 * Detect common chart patterns in OHLCV data
 */
export function detectPatterns(data: OHLCV[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (data.length < 20) {
    return patterns;
  }

  // Detect various patterns
  const doubleTop = detectDoubleTop(data);
  if (doubleTop) patterns.push(doubleTop);

  const doubleBottom = detectDoubleBottom(data);
  if (doubleBottom) patterns.push(doubleBottom);

  const headAndShoulders = detectHeadAndShoulders(data);
  if (headAndShoulders) patterns.push(headAndShoulders);

  const inverseHeadAndShoulders = detectInverseHeadAndShoulders(data);
  if (inverseHeadAndShoulders) patterns.push(inverseHeadAndShoulders);

  const ascendingTriangle = detectAscendingTriangle(data);
  if (ascendingTriangle) patterns.push(ascendingTriangle);

  const descendingTriangle = detectDescendingTriangle(data);
  if (descendingTriangle) patterns.push(descendingTriangle);

  const bullishFlag = detectBullishFlag(data);
  if (bullishFlag) patterns.push(bullishFlag);

  const bearishFlag = detectBearishFlag(data);
  if (bearishFlag) patterns.push(bearishFlag);

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Find local peaks in the data
 */
function findPeaks(data: OHLCV[], window: number = 3): number[] {
  const peaks: number[] = [];

  for (let i = window; i < data.length - window; i++) {
    let isPeak = true;
    const currentHigh = data[i].high;

    for (let j = 1; j <= window; j++) {
      if (
        data[i - j].high >= currentHigh ||
        data[i + j].high >= currentHigh
      ) {
        isPeak = false;
        break;
      }
    }

    if (isPeak) {
      peaks.push(i);
    }
  }

  return peaks;
}

/**
 * Find local troughs in the data
 */
function findTroughs(data: OHLCV[], window: number = 3): number[] {
  const troughs: number[] = [];

  for (let i = window; i < data.length - window; i++) {
    let isTrough = true;
    const currentLow = data[i].low;

    for (let j = 1; j <= window; j++) {
      if (
        data[i - j].low <= currentLow ||
        data[i + j].low <= currentLow
      ) {
        isTrough = false;
        break;
      }
    }

    if (isTrough) {
      troughs.push(i);
    }
  }

  return troughs;
}

/**
 * Check if two prices are approximately equal
 */
function pricesEqual(p1: number, p2: number, tolerance: number = 0.02): boolean {
  return Math.abs(p1 - p2) / ((p1 + p2) / 2) < tolerance;
}

/**
 * Detect Double Top pattern (bearish)
 */
function detectDoubleTop(data: OHLCV[]): DetectedPattern | null {
  const peaks = findPeaks(data, 3);

  if (peaks.length < 2) return null;

  // Check last two peaks
  const peak1 = peaks[peaks.length - 2];
  const peak2 = peaks[peaks.length - 1];

  const high1 = data[peak1].high;
  const high2 = data[peak2].high;

  // Peaks should be at similar levels
  if (!pricesEqual(high1, high2, 0.03)) return null;

  // Should have a valley between peaks
  const middleData = data.slice(peak1, peak2 + 1);
  const neckline = Math.min(...middleData.map((d) => d.low));

  // Current price should be near or below neckline
  const currentPrice = data[data.length - 1].close;
  const peakAvg = (high1 + high2) / 2;

  if (currentPrice > peakAvg) return null;

  // Calculate confidence based on pattern clarity
  const confidence =
    60 +
    (pricesEqual(high1, high2, 0.01) ? 20 : 0) +
    (currentPrice < neckline ? 15 : 0);

  // Price target: neckline - (peak - neckline)
  const priceTarget = neckline - (peakAvg - neckline);

  return {
    pattern: "Double Top",
    confidence,
    direction: "bearish",
    startIndex: peak1,
    endIndex: data.length - 1,
    priceTarget,
    description: `Double top at $${peakAvg.toFixed(6)}, neckline at $${neckline.toFixed(6)}`,
  };
}

/**
 * Detect Double Bottom pattern (bullish)
 */
function detectDoubleBottom(data: OHLCV[]): DetectedPattern | null {
  const troughs = findTroughs(data, 3);

  if (troughs.length < 2) return null;

  const trough1 = troughs[troughs.length - 2];
  const trough2 = troughs[troughs.length - 1];

  const low1 = data[trough1].low;
  const low2 = data[trough2].low;

  if (!pricesEqual(low1, low2, 0.03)) return null;

  const middleData = data.slice(trough1, trough2 + 1);
  const neckline = Math.max(...middleData.map((d) => d.high));

  const currentPrice = data[data.length - 1].close;
  const troughAvg = (low1 + low2) / 2;

  if (currentPrice < troughAvg) return null;

  const confidence =
    60 +
    (pricesEqual(low1, low2, 0.01) ? 20 : 0) +
    (currentPrice > neckline ? 15 : 0);

  const priceTarget = neckline + (neckline - troughAvg);

  return {
    pattern: "Double Bottom",
    confidence,
    direction: "bullish",
    startIndex: trough1,
    endIndex: data.length - 1,
    priceTarget,
    description: `Double bottom at $${troughAvg.toFixed(6)}, neckline at $${neckline.toFixed(6)}`,
  };
}

/**
 * Detect Head and Shoulders pattern (bearish)
 */
function detectHeadAndShoulders(data: OHLCV[]): DetectedPattern | null {
  const peaks = findPeaks(data, 3);

  if (peaks.length < 3) return null;

  // Get last 3 peaks
  const leftShoulder = peaks[peaks.length - 3];
  const head = peaks[peaks.length - 2];
  const rightShoulder = peaks[peaks.length - 1];

  const leftHigh = data[leftShoulder].high;
  const headHigh = data[head].high;
  const rightHigh = data[rightShoulder].high;

  // Head should be highest
  if (headHigh <= leftHigh || headHigh <= rightHigh) return null;

  // Shoulders should be at similar levels
  if (!pricesEqual(leftHigh, rightHigh, 0.05)) return null;

  // Find neckline
  const leftTrough = Math.min(
    ...data.slice(leftShoulder, head + 1).map((d) => d.low)
  );
  const rightTrough = Math.min(
    ...data.slice(head, rightShoulder + 1).map((d) => d.low)
  );
  const neckline = (leftTrough + rightTrough) / 2;

  const confidence =
    55 +
    (pricesEqual(leftHigh, rightHigh, 0.02) ? 20 : 0) +
    (headHigh > leftHigh * 1.05 ? 15 : 0);

  const priceTarget = neckline - (headHigh - neckline);

  return {
    pattern: "Head and Shoulders",
    confidence,
    direction: "bearish",
    startIndex: leftShoulder,
    endIndex: data.length - 1,
    priceTarget,
    description: `H&S with head at $${headHigh.toFixed(6)}, neckline at $${neckline.toFixed(6)}`,
  };
}

/**
 * Detect Inverse Head and Shoulders pattern (bullish)
 */
function detectInverseHeadAndShoulders(data: OHLCV[]): DetectedPattern | null {
  const troughs = findTroughs(data, 3);

  if (troughs.length < 3) return null;

  const leftShoulder = troughs[troughs.length - 3];
  const head = troughs[troughs.length - 2];
  const rightShoulder = troughs[troughs.length - 1];

  const leftLow = data[leftShoulder].low;
  const headLow = data[head].low;
  const rightLow = data[rightShoulder].low;

  // Head should be lowest
  if (headLow >= leftLow || headLow >= rightLow) return null;

  // Shoulders should be at similar levels
  if (!pricesEqual(leftLow, rightLow, 0.05)) return null;

  const leftPeak = Math.max(
    ...data.slice(leftShoulder, head + 1).map((d) => d.high)
  );
  const rightPeak = Math.max(
    ...data.slice(head, rightShoulder + 1).map((d) => d.high)
  );
  const neckline = (leftPeak + rightPeak) / 2;

  const confidence =
    55 +
    (pricesEqual(leftLow, rightLow, 0.02) ? 20 : 0) +
    (headLow < leftLow * 0.95 ? 15 : 0);

  const priceTarget = neckline + (neckline - headLow);

  return {
    pattern: "Inverse Head and Shoulders",
    confidence,
    direction: "bullish",
    startIndex: leftShoulder,
    endIndex: data.length - 1,
    priceTarget,
    description: `Inverse H&S with head at $${headLow.toFixed(6)}, neckline at $${neckline.toFixed(6)}`,
  };
}

/**
 * Detect Ascending Triangle pattern (bullish)
 */
function detectAscendingTriangle(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 15) return null;

  const recent = data.slice(-15);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);

  // Flat resistance (highs should be similar)
  const maxHigh = Math.max(...highs);
  const flatResistance = highs.filter((h) => h > maxHigh * 0.98).length >= 3;

  // Rising support (lows should be increasing)
  let risingSupport = true;
  for (let i = 3; i < lows.length; i++) {
    const recentLows = lows.slice(i - 3, i + 1);
    const avgRecent = recentLows.reduce((a, b) => a + b, 0) / recentLows.length;
    const earlierLows = lows.slice(0, i - 3);
    const avgEarlier =
      earlierLows.reduce((a, b) => a + b, 0) / earlierLows.length || avgRecent;

    if (avgRecent < avgEarlier * 0.99) {
      risingSupport = false;
      break;
    }
  }

  if (!flatResistance || !risingSupport) return null;

  const currentPrice = recent[recent.length - 1].close;
  const resistance = maxHigh;
  const support = Math.min(...lows.slice(-5));

  return {
    pattern: "Ascending Triangle",
    confidence: 65,
    direction: "bullish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: resistance + (resistance - support),
    description: `Ascending triangle with resistance at $${resistance.toFixed(6)}`,
  };
}

/**
 * Detect Descending Triangle pattern (bearish)
 */
function detectDescendingTriangle(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 15) return null;

  const recent = data.slice(-15);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);

  // Flat support (lows should be similar)
  const minLow = Math.min(...lows);
  const flatSupport = lows.filter((l) => l < minLow * 1.02).length >= 3;

  // Declining resistance (highs should be decreasing)
  let decliningResistance = true;
  for (let i = 3; i < highs.length; i++) {
    const recentHighs = highs.slice(i - 3, i + 1);
    const avgRecent =
      recentHighs.reduce((a, b) => a + b, 0) / recentHighs.length;
    const earlierHighs = highs.slice(0, i - 3);
    const avgEarlier =
      earlierHighs.reduce((a, b) => a + b, 0) / earlierHighs.length || avgRecent;

    if (avgRecent > avgEarlier * 1.01) {
      decliningResistance = false;
      break;
    }
  }

  if (!flatSupport || !decliningResistance) return null;

  const support = minLow;
  const resistance = Math.max(...highs.slice(-5));

  return {
    pattern: "Descending Triangle",
    confidence: 65,
    direction: "bearish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: support - (resistance - support),
    description: `Descending triangle with support at $${support.toFixed(6)}`,
  };
}

/**
 * Detect Bullish Flag pattern
 */
function detectBullishFlag(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 20) return null;

  const recent = data.slice(-20);

  // Look for a strong upward move (pole) followed by consolidation (flag)
  const first5 = recent.slice(0, 5);
  const pole = first5[first5.length - 1].close - first5[0].close;
  const polePercent = (pole / first5[0].close) * 100;

  if (polePercent < 5) return null; // Need at least 5% move

  // Check for consolidation in the flag portion
  const flag = recent.slice(5);
  const flagHighs = flag.map((d) => d.high);
  const flagLows = flag.map((d) => d.low);

  const flagRange =
    (Math.max(...flagHighs) - Math.min(...flagLows)) /
    Math.min(...flagLows);

  if (flagRange > 0.1) return null; // Consolidation should be tight

  // Flag should slope slightly downward
  const flagStart = (flag[0].high + flag[0].low) / 2;
  const flagEnd = (flag[flag.length - 1].high + flag[flag.length - 1].low) / 2;

  if (flagEnd > flagStart) return null;

  return {
    pattern: "Bullish Flag",
    confidence: 60,
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: recent[recent.length - 1].close + pole,
    description: `Bullish flag after ${polePercent.toFixed(1)}% move`,
  };
}

/**
 * Detect Bearish Flag pattern
 */
function detectBearishFlag(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 20) return null;

  const recent = data.slice(-20);

  // Look for a strong downward move (pole) followed by consolidation (flag)
  const first5 = recent.slice(0, 5);
  const pole = first5[0].close - first5[first5.length - 1].close;
  const polePercent = (pole / first5[0].close) * 100;

  if (polePercent < 5) return null;

  const flag = recent.slice(5);
  const flagHighs = flag.map((d) => d.high);
  const flagLows = flag.map((d) => d.low);

  const flagRange =
    (Math.max(...flagHighs) - Math.min(...flagLows)) /
    Math.min(...flagLows);

  if (flagRange > 0.1) return null;

  // Flag should slope slightly upward
  const flagStart = (flag[0].high + flag[0].low) / 2;
  const flagEnd = (flag[flag.length - 1].high + flag[flag.length - 1].low) / 2;

  if (flagEnd < flagStart) return null;

  return {
    pattern: "Bearish Flag",
    confidence: 60,
    direction: "bearish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: recent[recent.length - 1].close - pole,
    description: `Bearish flag after ${polePercent.toFixed(1)}% drop`,
  };
}
