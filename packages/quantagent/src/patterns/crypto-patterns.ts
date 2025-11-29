/**
 * Crypto-Specific Pattern Detection
 * Patterns unique to cryptocurrency markets
 */

import type { OHLCV } from "../agents/types.js";
import type { DetectedPattern } from "./detector.js";

/**
 * Detect crypto-specific patterns
 */
export function detectCryptoPatterns(data: OHLCV[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (data.length < 10) {
    return patterns;
  }

  const pumpPattern = detectPumpPattern(data);
  if (pumpPattern) patterns.push(pumpPattern);

  const dumpPattern = detectDumpPattern(data);
  if (dumpPattern) patterns.push(dumpPattern);

  const accumulation = detectAccumulation(data);
  if (accumulation) patterns.push(accumulation);

  const distribution = detectDistribution(data);
  if (distribution) patterns.push(distribution);

  const vShapeRecovery = detectVShapeRecovery(data);
  if (vShapeRecovery) patterns.push(vShapeRecovery);

  const roundingBottom = detectRoundingBottom(data);
  if (roundingBottom) patterns.push(roundingBottom);

  return patterns;
}

/**
 * Detect pump pattern (rapid price increase)
 * Common in memecoin markets
 */
function detectPumpPattern(data: OHLCV[]): DetectedPattern | null {
  const recent = data.slice(-10);

  if (recent.length < 5) return null;

  // Check for rapid price increase with high volume
  const firstPrice = recent[0].close;
  const lastPrice = recent[recent.length - 1].close;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  if (priceChange < 20) return null; // Need at least 20% pump

  // Check volume spike
  const avgVolume =
    data.slice(-30, -10).reduce((sum, d) => sum + d.volume, 0) / 20;
  const recentVolume =
    recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;

  const volumeMultiple = avgVolume > 0 ? recentVolume / avgVolume : 1;

  if (volumeMultiple < 2) return null; // Need at least 2x volume

  // Higher price change and volume = higher confidence
  const confidence = Math.min(
    50 +
      Math.min(priceChange, 50) * 0.5 +
      Math.min(volumeMultiple, 5) * 5,
    95
  );

  return {
    pattern: "Pump Pattern",
    confidence,
    direction: "bullish", // Currently bullish, but be cautious of dump
    startIndex: data.length - 10,
    endIndex: data.length - 1,
    description: `${priceChange.toFixed(1)}% pump with ${volumeMultiple.toFixed(1)}x volume - watch for potential dump`,
  };
}

/**
 * Detect dump pattern (rapid price decrease)
 */
function detectDumpPattern(data: OHLCV[]): DetectedPattern | null {
  const recent = data.slice(-10);

  if (recent.length < 5) return null;

  const firstPrice = recent[0].close;
  const lastPrice = recent[recent.length - 1].close;
  const priceChange = ((firstPrice - lastPrice) / firstPrice) * 100;

  if (priceChange < 20) return null; // Need at least 20% dump

  // Check for high selling volume
  const avgVolume =
    data.slice(-30, -10).reduce((sum, d) => sum + d.volume, 0) / 20;
  const recentVolume =
    recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;

  const volumeMultiple = avgVolume > 0 ? recentVolume / avgVolume : 1;

  const confidence = Math.min(
    50 +
      Math.min(priceChange, 50) * 0.5 +
      Math.min(volumeMultiple, 5) * 5,
    95
  );

  return {
    pattern: "Dump Pattern",
    confidence,
    direction: "bearish",
    startIndex: data.length - 10,
    endIndex: data.length - 1,
    description: `${priceChange.toFixed(1)}% dump with ${volumeMultiple.toFixed(1)}x volume - potential capitulation`,
  };
}

/**
 * Detect accumulation phase
 * Sideways price action with increasing buying volume
 */
function detectAccumulation(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 20) return null;

  const recent = data.slice(-20);

  // Check for sideways price action
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const priceRange = (Math.max(...highs) - Math.min(...lows)) / Math.min(...lows);

  if (priceRange > 0.15) return null; // Range should be tight (< 15%)

  // Check for increasing volume on up candles
  let upVolume = 0;
  let downVolume = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].close > recent[i - 1].close) {
      upVolume += recent[i].volume;
    } else {
      downVolume += recent[i].volume;
    }
  }

  const volumeRatio = downVolume > 0 ? upVolume / downVolume : 2;

  if (volumeRatio < 1.2) return null; // Up volume should exceed down volume

  return {
    pattern: "Accumulation",
    confidence: 55 + Math.min(volumeRatio * 10, 30),
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    description: `Accumulation phase with ${volumeRatio.toFixed(1)}x more buying volume`,
  };
}

/**
 * Detect distribution phase
 * Sideways price action with increasing selling volume
 */
function detectDistribution(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 20) return null;

  const recent = data.slice(-20);

  // Check for sideways price action
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const priceRange = (Math.max(...highs) - Math.min(...lows)) / Math.min(...lows);

  if (priceRange > 0.15) return null;

  // Check for increasing volume on down candles
  let upVolume = 0;
  let downVolume = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].close > recent[i - 1].close) {
      upVolume += recent[i].volume;
    } else {
      downVolume += recent[i].volume;
    }
  }

  const volumeRatio = upVolume > 0 ? downVolume / upVolume : 2;

  if (volumeRatio < 1.2) return null;

  return {
    pattern: "Distribution",
    confidence: 55 + Math.min(volumeRatio * 10, 30),
    direction: "bearish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    description: `Distribution phase with ${volumeRatio.toFixed(1)}x more selling volume`,
  };
}

/**
 * Detect V-shape recovery
 * Sharp drop followed by equally sharp recovery
 */
function detectVShapeRecovery(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 15) return null;

  const recent = data.slice(-15);
  const midpoint = Math.floor(recent.length / 2);

  // Find the lowest point
  let lowestIndex = 0;
  let lowestPrice = recent[0].low;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].low < lowestPrice) {
      lowestPrice = recent[i].low;
      lowestIndex = i;
    }
  }

  // Lowest should be roughly in the middle
  if (lowestIndex < 3 || lowestIndex > recent.length - 3) return null;

  // Calculate drop and recovery
  const startPrice = recent[0].close;
  const endPrice = recent[recent.length - 1].close;
  const drop = ((startPrice - lowestPrice) / startPrice) * 100;
  const recovery = ((endPrice - lowestPrice) / lowestPrice) * 100;

  if (drop < 10 || recovery < 10) return null;

  // Recovery should be significant relative to drop
  const recoveryRatio = recovery / drop;

  if (recoveryRatio < 0.7) return null;

  return {
    pattern: "V-Shape Recovery",
    confidence: 60 + Math.min(recovery, 30),
    direction: "bullish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: startPrice * (1 + recovery / 100 * 0.5),
    description: `V-shape with ${drop.toFixed(1)}% drop and ${recovery.toFixed(1)}% recovery`,
  };
}

/**
 * Detect rounding bottom (cup without handle)
 */
function detectRoundingBottom(data: OHLCV[]): DetectedPattern | null {
  if (data.length < 20) return null;

  const recent = data.slice(-20);

  // Find the lowest point
  let lowestIndex = 0;
  let lowestPrice = recent[0].low;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].low < lowestPrice) {
      lowestPrice = recent[i].low;
      lowestIndex = i;
    }
  }

  // Lowest should be in the middle third
  if (lowestIndex < 6 || lowestIndex > 14) return null;

  // Check for gradual decline before and rise after
  const beforeLow = recent.slice(0, lowestIndex);
  const afterLow = recent.slice(lowestIndex);

  // Before should be declining
  let declining = true;
  for (let i = 1; i < beforeLow.length; i++) {
    if (beforeLow[i].close > beforeLow[i - 1].close * 1.02) {
      declining = false;
      break;
    }
  }

  // After should be rising
  let rising = true;
  for (let i = 1; i < afterLow.length; i++) {
    if (afterLow[i].close < afterLow[i - 1].close * 0.98) {
      rising = false;
      break;
    }
  }

  if (!declining || !rising) return null;

  const startPrice = recent[0].close;
  const endPrice = recent[recent.length - 1].close;

  return {
    pattern: "Rounding Bottom",
    confidence: 65,
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: Math.max(startPrice, endPrice) * 1.1,
    description: `Rounding bottom with support at $${lowestPrice.toFixed(6)}`,
  };
}
