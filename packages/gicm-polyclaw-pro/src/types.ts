import { z } from "zod";

// ============================================================================
// Market Types
// ============================================================================

export type Platform = "polymarket" | "kalshi";
export type MarketStatus = "active" | "closed" | "resolved";
export type Outcome = "YES" | "NO";
export type Side = "buy" | "sell";

export interface Market {
  id: string;
  platform: Platform;
  slug: string;
  question: string;
  category: string;
  outcomes: string[];
  prices: number[]; // 0-1 (probability)
  volume: number;
  volume24h: number;
  liquidity: number;
  openInterest?: number;
  status: MarketStatus;
  endDate?: string;
  lastUpdated: string;
}

export interface MarketSnapshot {
  market: Market;
  timestamp: string;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

// ============================================================================
// Signal Types
// ============================================================================

export type StrategyName =
  | "momentum"
  | "contrarian"
  | "arbitrage"
  | "volume-spike"
  | "mean-reversion"
  | "event-catalyst"
  | "whale-following";

export type SignalStrength = "strong" | "moderate" | "weak";
export type SignalDirection = "buy" | "sell" | "hold";

export interface Signal {
  id: string;
  strategy: StrategyName;
  marketId: string;
  platform: Platform;
  direction: SignalDirection;
  strength: SignalStrength;
  confidence: number; // 0-1
  outcome: Outcome;
  targetPrice: number;
  currentPrice: number;
  expectedReturn: number; // percentage
  reasoning: string;
  timestamp: string;
  expiresAt?: string;
}

export interface SignalAggregate {
  marketId: string;
  signals: Signal[];
  consensus: SignalDirection;
  avgConfidence: number;
  strongSignals: number;
  totalSignals: number;
}

// ============================================================================
// Position Types
// ============================================================================

export type PositionStatus = "open" | "closed" | "expired";

export interface Position {
  id: string;
  marketId: string;
  platform: Platform;
  outcome: Outcome;
  side: Side;
  size: number; // shares/contracts
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  stopLoss?: number;
  takeProfit?: number;
  status: PositionStatus;
  strategy: StrategyName;
  openedAt: string;
  closedAt?: string;
}

export interface TradeRecord {
  id: string;
  positionId: string;
  marketId: string;
  platform: Platform;
  outcome: Outcome;
  side: Side;
  size: number;
  price: number;
  value: number;
  fee: number;
  timestamp: string;
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  avgReturn: number;
  bestTrade: number;
  worstTrade: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  byStrategy: Map<StrategyName, StrategyPerformance>;
}

export interface StrategyPerformance {
  strategy: StrategyName;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgReturn: number;
}

// ============================================================================
// Risk Types
// ============================================================================

export interface RiskConfig {
  maxPositionSize: number;
  maxTotalExposure: number;
  maxPositions: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  dailyLossLimit: number;
  maxDrawdownPercent: number;
  minLiquidity: number;
  minConfidence: number;
}

export interface RiskAssessment {
  allowed: boolean;
  reason?: string;
  adjustedSize?: number;
  riskScore: number; // 0-100
  warnings: string[];
}

// ============================================================================
// Strategy Config Types
// ============================================================================

export interface StrategyConfig {
  enabled: boolean;
  weight: number; // 0-1, how much to trust this strategy
  params: Record<string, number>;
}

export interface PolyclawConfig {
  platforms: Platform[];
  strategies: Partial<Record<StrategyName, StrategyConfig>>;
  risk: RiskConfig;
  scanIntervalMs: number;
  maxMarketsToScan: number;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const RiskConfigSchema = z.object({
  maxPositionSize: z.number().positive(),
  maxTotalExposure: z.number().positive(),
  maxPositions: z.number().int().positive(),
  stopLossPercent: z.number().min(0).max(1),
  takeProfitPercent: z.number().min(0).max(1),
  dailyLossLimit: z.number().positive(),
  maxDrawdownPercent: z.number().min(0).max(1),
  minLiquidity: z.number().nonnegative(),
  minConfidence: z.number().min(0).max(1),
});

export const PolyclawConfigSchema = z.object({
  platforms: z.array(z.enum(["polymarket", "kalshi"])),
  strategies: z.record(
    z.object({
      enabled: z.boolean(),
      weight: z.number().min(0).max(1),
      params: z.record(z.number()),
    })
  ),
  risk: RiskConfigSchema,
  scanIntervalMs: z.number().int().positive(),
  maxMarketsToScan: z.number().int().positive(),
});

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  maxPositionSize: 100, // $100 max per position
  maxTotalExposure: 500, // $500 max total
  maxPositions: 10,
  stopLossPercent: 0.15, // 15% stop loss
  takeProfitPercent: 0.5, // 50% take profit
  dailyLossLimit: 50, // $50/day max loss
  maxDrawdownPercent: 0.2, // 20% max drawdown
  minLiquidity: 5000, // $5K min market liquidity
  minConfidence: 0.6, // 60% min signal confidence
};

export const DEFAULT_STRATEGY_CONFIGS: Record<StrategyName, StrategyConfig> = {
  momentum: {
    enabled: true,
    weight: 0.8,
    params: { lookbackPeriods: 5, trendThreshold: 0.05 },
  },
  contrarian: {
    enabled: true,
    weight: 0.7,
    params: { extremeThreshold: 0.15, exitThreshold: 0.4 },
  },
  arbitrage: {
    enabled: true,
    weight: 0.9,
    params: { minSpread: 0.03, feeBuffer: 0.01 },
  },
  "volume-spike": {
    enabled: true,
    weight: 0.6,
    params: { spikeMultiplier: 3.0, minVolume: 10000 },
  },
  "mean-reversion": {
    enabled: true,
    weight: 0.7,
    params: { deviationThreshold: 0.15, lookbackDays: 7 },
  },
  "event-catalyst": {
    enabled: true,
    weight: 0.8,
    params: { daysBeforeEvent: 3, minPriceMove: 0.1 },
  },
  "whale-following": {
    enabled: false,
    weight: 0.5,
    params: { minTradeSize: 5000, followDelay: 60 },
  },
};
