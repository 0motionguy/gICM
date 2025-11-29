// Backtester - Trading strategy backtesting engine
export { BacktestEngine, type BacktestOptions } from "./core/engine.js";
export { Portfolio } from "./core/portfolio.js";

// Types
export {
  type BacktesterConfig,
  type OHLCV,
  type Trade,
  type Position,
  type Order,
  type PortfolioSnapshot,
  type BacktestResult,
  type PerformanceMetrics,
  type Signal,
  type DataProvider,
  BacktesterConfigSchema,
} from "./core/types.js";

// Strategies
export { Strategy, SMACrossoverStrategy, RSIStrategy } from "./strategies/base.js";
export { Indicators } from "./strategies/indicators.js";

// Analytics
export { MetricsCalculator } from "./analytics/metrics.js";
export { RiskAnalyzer, type VaRResult, type DrawdownAnalysis } from "./analytics/risk.js";
export {
  MonteCarloSimulator,
  type MonteCarloResult,
  type SimulationOutcome,
} from "./analytics/monte-carlo.js";

// Data Providers
export { CSVDataProvider, type CSVDataConfig } from "./data/providers/csv.js";
