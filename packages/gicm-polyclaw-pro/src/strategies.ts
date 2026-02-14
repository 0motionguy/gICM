/**
 * 7 prediction market trading strategies.
 * Each analyzes market data and produces signals.
 */

import { randomUUID } from "crypto";
import type {
  Market,
  PricePoint,
  Signal,
  SignalDirection,
  SignalStrength,
  StrategyConfig,
  StrategyName,
} from "./types.js";

export interface StrategyInput {
  market: Market;
  priceHistory: PricePoint[];
  crossPlatformPrices?: Map<string, number>; // for arbitrage
  config: StrategyConfig;
}

export interface StrategyResult {
  signal: Signal | null;
}

type StrategyFn = (input: StrategyInput) => StrategyResult;

function makeSignal(
  strategy: StrategyName,
  market: Market,
  direction: SignalDirection,
  strength: SignalStrength,
  confidence: number,
  targetPrice: number,
  reasoning: string
): Signal {
  return {
    id: randomUUID(),
    strategy,
    marketId: market.id,
    platform: market.platform,
    direction,
    strength,
    confidence: Math.max(0, Math.min(1, confidence)),
    outcome: direction === "buy" ? "YES" : direction === "sell" ? "NO" : "YES",
    targetPrice,
    currentPrice: market.prices[0] ?? 0.5,
    expectedReturn:
      targetPrice > 0 && market.prices[0] > 0
        ? ((targetPrice - market.prices[0]) / market.prices[0]) * 100
        : 0,
    reasoning,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Strategy 1: Momentum
// Buy when price has been rising consistently, sell when falling
// ============================================================================
export const momentumStrategy: StrategyFn = ({
  market,
  priceHistory,
  config,
}) => {
  const lookback = config.params.lookbackPeriods ?? 5;
  const threshold = config.params.trendThreshold ?? 0.05;

  if (priceHistory.length < lookback + 1) return { signal: null };

  const recent = priceHistory.slice(-lookback);
  const priceChanges: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    priceChanges.push(recent[i].price - recent[i - 1].price);
  }

  const avgChange =
    priceChanges.reduce((sum, c) => sum + c, 0) / priceChanges.length;
  const consistency =
    priceChanges.filter((c) => Math.sign(c) === Math.sign(avgChange)).length /
    priceChanges.length;

  if (Math.abs(avgChange) < threshold) return { signal: null };

  const direction: SignalDirection = avgChange > 0 ? "buy" : "sell";
  const confidence = Math.min(consistency * Math.abs(avgChange) * 10, 1);
  const strength: SignalStrength =
    confidence > 0.8 ? "strong" : confidence > 0.5 ? "moderate" : "weak";

  const currentPrice = market.prices[0] ?? 0.5;
  const targetPrice = currentPrice + avgChange * lookback;

  return {
    signal: makeSignal(
      "momentum",
      market,
      direction,
      strength,
      confidence,
      Math.max(0, Math.min(1, targetPrice)),
      `Price moved ${(avgChange * 100).toFixed(1)}% avg over ${lookback} periods with ${(consistency * 100).toFixed(0)}% consistency`
    ),
  };
};

// ============================================================================
// Strategy 2: Contrarian
// Fade extreme prices — buy below 15%, sell above 85%
// ============================================================================
export const contrarianStrategy: StrategyFn = ({ market, config }) => {
  const extremeThreshold = config.params.extremeThreshold ?? 0.15;
  const exitThreshold = config.params.exitThreshold ?? 0.4;

  const price = market.prices[0] ?? 0.5;

  // Buy when price is very low (market undervalues YES)
  if (price <= extremeThreshold) {
    const confidence = (extremeThreshold - price) / extremeThreshold;
    return {
      signal: makeSignal(
        "contrarian",
        market,
        "buy",
        confidence > 0.5 ? "strong" : "moderate",
        0.5 + confidence * 0.4,
        exitThreshold,
        `Price ${(price * 100).toFixed(0)}% is below extreme threshold ${(extremeThreshold * 100).toFixed(0)}% — contrarian buy`
      ),
    };
  }

  // Sell when price is very high
  if (price >= 1 - extremeThreshold) {
    const confidence = (price - (1 - extremeThreshold)) / extremeThreshold;
    return {
      signal: makeSignal(
        "contrarian",
        market,
        "sell",
        confidence > 0.5 ? "strong" : "moderate",
        0.5 + confidence * 0.4,
        1 - exitThreshold,
        `Price ${(price * 100).toFixed(0)}% is above extreme threshold ${((1 - extremeThreshold) * 100).toFixed(0)}% — contrarian sell`
      ),
    };
  }

  return { signal: null };
};

// ============================================================================
// Strategy 3: Arbitrage
// Cross-platform price differences (Polymarket vs Kalshi)
// ============================================================================
export const arbitrageStrategy: StrategyFn = ({
  market,
  crossPlatformPrices,
  config,
}) => {
  if (!crossPlatformPrices || crossPlatformPrices.size === 0)
    return { signal: null };

  const minSpread = config.params.minSpread ?? 0.03;
  const feeBuffer = config.params.feeBuffer ?? 0.01;

  const currentPrice = market.prices[0] ?? 0.5;

  for (const [otherPlatform, otherPrice] of crossPlatformPrices) {
    const spread = Math.abs(currentPrice - otherPrice);
    const netSpread = spread - feeBuffer * 2; // account for fees on both sides

    if (netSpread > minSpread) {
      const direction: SignalDirection =
        currentPrice < otherPrice ? "buy" : "sell";
      const confidence = Math.min(netSpread / 0.1, 1);

      return {
        signal: makeSignal(
          "arbitrage",
          market,
          direction,
          confidence > 0.7 ? "strong" : "moderate",
          confidence,
          otherPrice,
          `${(spread * 100).toFixed(1)}% spread vs ${otherPlatform} (net ${(netSpread * 100).toFixed(1)}% after fees)`
        ),
      };
    }
  }

  return { signal: null };
};

// ============================================================================
// Strategy 4: Volume Spike
// Trade when 24h volume is abnormally high — something is happening
// ============================================================================
export const volumeSpikeStrategy: StrategyFn = ({
  market,
  priceHistory,
  config,
}) => {
  const spikeMultiplier = config.params.spikeMultiplier ?? 3.0;
  const minVolume = config.params.minVolume ?? 10000;

  if (market.volume24h < minVolume) return { signal: null };
  if (priceHistory.length < 3) return { signal: null };

  // Calculate average historical volume
  const historicalVolumes = priceHistory.slice(0, -1).map((p) => p.volume);
  const avgVolume =
    historicalVolumes.reduce((s, v) => s + v, 0) /
    Math.max(historicalVolumes.length, 1);

  if (avgVolume <= 0) return { signal: null };

  const volumeRatio = market.volume24h / avgVolume;

  if (volumeRatio < spikeMultiplier) return { signal: null };

  // Volume spike + price direction = follow the move
  const priceChange =
    priceHistory.length >= 2
      ? priceHistory[priceHistory.length - 1].price -
        priceHistory[priceHistory.length - 2].price
      : 0;

  const direction: SignalDirection =
    priceChange > 0 ? "buy" : priceChange < 0 ? "sell" : "hold";
  if (direction === "hold") return { signal: null };

  const confidence = Math.min((volumeRatio - spikeMultiplier) / 5 + 0.5, 0.95);

  return {
    signal: makeSignal(
      "volume-spike",
      market,
      direction,
      confidence > 0.7 ? "strong" : "moderate",
      confidence,
      market.prices[0] + priceChange * 2,
      `Volume spike ${volumeRatio.toFixed(1)}x average (${market.volume24h.toLocaleString()} vs avg ${avgVolume.toLocaleString()})`
    ),
  };
};

// ============================================================================
// Strategy 5: Mean Reversion
// Markets tend to revert to historical average
// ============================================================================
export const meanReversionStrategy: StrategyFn = ({
  market,
  priceHistory,
  config,
}) => {
  const deviationThreshold = config.params.deviationThreshold ?? 0.15;

  if (priceHistory.length < 5) return { signal: null };

  const prices = priceHistory.map((p) => p.price);
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const currentPrice = market.prices[0] ?? 0.5;
  const deviation = currentPrice - mean;

  if (Math.abs(deviation) < deviationThreshold) return { signal: null };

  // Price above mean → expect reversion down (sell), below mean → buy
  const direction: SignalDirection = deviation > 0 ? "sell" : "buy";
  const confidence = Math.min(Math.abs(deviation) / 0.3, 0.9);
  const strength: SignalStrength =
    Math.abs(deviation) > 0.25 ? "strong" : "moderate";

  return {
    signal: makeSignal(
      "mean-reversion",
      market,
      direction,
      strength,
      confidence,
      mean,
      `Price ${(currentPrice * 100).toFixed(0)}% deviates ${(deviation * 100).toFixed(1)}% from mean ${(mean * 100).toFixed(0)}%`
    ),
  };
};

// ============================================================================
// Strategy 6: Event Catalyst
// Markets with upcoming resolution dates often see price convergence
// ============================================================================
export const eventCatalystStrategy: StrategyFn = ({ market, config }) => {
  const daysBeforeEvent = config.params.daysBeforeEvent ?? 3;
  const minPriceMove = config.params.minPriceMove ?? 0.1;

  if (!market.endDate) return { signal: null };

  const endDate = new Date(market.endDate);
  const now = new Date();
  const daysUntilEnd =
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // Only trigger near event resolution
  if (daysUntilEnd < 0 || daysUntilEnd > daysBeforeEvent)
    return { signal: null };

  const price = market.prices[0] ?? 0.5;

  // Near-resolution, prices should be near 0 or 1
  // If still in the middle, there's opportunity
  if (price > 0.3 && price < 0.7) {
    // Ambiguous — no strong signal near resolution
    return { signal: null };
  }

  // Price is leaning one way near resolution — follow the lean
  const direction: SignalDirection = price > 0.5 ? "buy" : "sell";
  const distanceFromEdge = price > 0.5 ? 1 - price : price;
  const confidence = Math.min((1 - distanceFromEdge * 3) * 0.9, 0.9);

  if (confidence < 0.4) return { signal: null };

  const targetPrice =
    price > 0.5
      ? Math.min(price + minPriceMove, 0.98)
      : Math.max(price - minPriceMove, 0.02);

  return {
    signal: makeSignal(
      "event-catalyst",
      market,
      direction,
      confidence > 0.7 ? "strong" : "moderate",
      confidence,
      targetPrice,
      `${daysUntilEnd.toFixed(1)} days until resolution, price at ${(price * 100).toFixed(0)}% — momentum toward resolution`
    ),
  };
};

// ============================================================================
// Strategy 7: Whale Following
// Large position changes indicate informed trading
// ============================================================================
export const whaleFollowingStrategy: StrategyFn = ({
  market,
  priceHistory,
  config,
}) => {
  const minTradeSize = config.params.minTradeSize ?? 5000;

  if (priceHistory.length < 3) return { signal: null };

  // Detect large volume + price movement (proxy for whale activity)
  const recent = priceHistory.slice(-3);
  const volumeIncrease = recent[recent.length - 1].volume - recent[0].volume;
  const priceMove = recent[recent.length - 1].price - recent[0].price;

  if (volumeIncrease < minTradeSize) return { signal: null };
  if (Math.abs(priceMove) < 0.02) return { signal: null };

  const direction: SignalDirection = priceMove > 0 ? "buy" : "sell";
  const confidence = Math.min(
    (volumeIncrease / (minTradeSize * 5)) * Math.abs(priceMove) * 10,
    0.85
  );

  if (confidence < 0.4) return { signal: null };

  return {
    signal: makeSignal(
      "whale-following",
      market,
      direction,
      confidence > 0.65 ? "strong" : "moderate",
      confidence,
      market.prices[0] + priceMove,
      `Large volume increase ($${volumeIncrease.toLocaleString()}) with ${(priceMove * 100).toFixed(1)}% price move — whale activity`
    ),
  };
};

// ============================================================================
// Strategy Registry
// ============================================================================

export const STRATEGIES: Record<StrategyName, StrategyFn> = {
  momentum: momentumStrategy,
  contrarian: contrarianStrategy,
  arbitrage: arbitrageStrategy,
  "volume-spike": volumeSpikeStrategy,
  "mean-reversion": meanReversionStrategy,
  "event-catalyst": eventCatalystStrategy,
  "whale-following": whaleFollowingStrategy,
};

export function runStrategy(
  name: StrategyName,
  input: StrategyInput
): StrategyResult {
  const fn = STRATEGIES[name];
  if (!fn) return { signal: null };
  return fn(input);
}

export function runAllStrategies(
  input: Omit<StrategyInput, "config">,
  configs: Partial<Record<StrategyName, StrategyConfig>>
): Signal[] {
  const signals: Signal[] = [];

  for (const [name, config] of Object.entries(configs)) {
    if (!config?.enabled) continue;
    const result = runStrategy(name as StrategyName, { ...input, config });
    if (result.signal) {
      signals.push(result.signal);
    }
  }

  return signals;
}
