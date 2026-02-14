/**
 * @gicm/polyclaw-pro — 7-strategy prediction market trading engine
 *
 * Supports Polymarket and Kalshi. Pure TypeScript, no native deps.
 * Does NOT execute real trades — provides signals, positions, and risk analysis.
 */

// Main class
export { PolyclawPro } from "./polyclaw.js";
export type { PolyclawStatus, TradeDecision } from "./polyclaw.js";

// Scanner
export { MarketScanner } from "./scanner.js";
export type { ScanResult, ScanOptions } from "./scanner.js";

// Strategies
export {
  STRATEGIES,
  runStrategy,
  runAllStrategies,
  momentumStrategy,
  contrarianStrategy,
  arbitrageStrategy,
  volumeSpikeStrategy,
  meanReversionStrategy,
  eventCatalystStrategy,
  whaleFollowingStrategy,
} from "./strategies.js";
export type { StrategyInput, StrategyResult } from "./strategies.js";

// Signals
export { SignalEngine } from "./signals.js";

// Positions
export { PositionManager } from "./positions.js";

// Risk
export { RiskManager } from "./risk.js";

// Types
export type {
  Platform,
  MarketStatus,
  Outcome,
  Side,
  Market,
  MarketSnapshot,
  PricePoint,
  StrategyName,
  SignalStrength,
  SignalDirection,
  Signal,
  SignalAggregate,
  PositionStatus,
  Position,
  TradeRecord,
  PerformanceMetrics,
  StrategyPerformance,
  RiskConfig,
  RiskAssessment,
  StrategyConfig,
  PolyclawConfig,
} from "./types.js";

// Defaults and schemas
export {
  DEFAULT_RISK_CONFIG,
  DEFAULT_STRATEGY_CONFIGS,
  RiskConfigSchema,
  PolyclawConfigSchema,
} from "./types.js";
