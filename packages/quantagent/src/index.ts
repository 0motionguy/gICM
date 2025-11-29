/**
 * @gicm/quantagent - Multi-agent LLM trading signals for crypto
 *
 * A gICM marketplace skill that provides AI-powered trading analysis
 * using 4 specialized agents:
 * - IndicatorAgent: Technical indicator analysis (RSI, MACD, etc.)
 * - PatternAgent: Chart pattern recognition
 * - TrendAgent: Trend and momentum analysis
 * - RiskAgent: Risk assessment and trade synthesis
 */

// Main orchestrator
export {
  TradingGraph,
  createTradingGraph,
} from "./orchestrator/trading-graph.js";
export type { TradingGraphConfig } from "./orchestrator/trading-graph.js";

// Agents
export { IndicatorAgent } from "./agents/indicator-agent.js";
export { PatternAgent } from "./agents/pattern-agent.js";
export { TrendAgent } from "./agents/trend-agent.js";
export { RiskAgent } from "./agents/risk-agent.js";

// Types
export type {
  OHLCV,
  TokenInfo,
  TradeDecision,
  IndicatorResult,
  PatternResult,
  TrendResult,
  RiskResult,
  AnalysisRequest,
  AgentConfig,
} from "./agents/types.js";

// Data fetching
export { fetchTokenData, fetchMarketData, searchTokens } from "./data/index.js";

// Indicators
export { calculateRSI, calculateRSIWithDivergence } from "./indicators/rsi.js";
export { calculateMACD, getMACDHistogramTrend } from "./indicators/macd.js";
export { calculateStochastic, calculateStochRSI } from "./indicators/stochastic.js";
export { calculateBollingerBands, getBandwidthTrend, detectBollingerBreakout } from "./indicators/bollinger.js";
export { analyzeVolume, calculateOBV, calculateVWAP, calculateMFI } from "./indicators/volume.js";

// Patterns
export { detectPatterns } from "./patterns/detector.js";
export { detectCryptoPatterns } from "./patterns/crypto-patterns.js";

// LLM
export { LLMClient, createDefaultClient } from "./llm/client.js";

/**
 * Quick analysis function - analyze a token with minimal setup
 *
 * @example
 * ```typescript
 * import { analyzeToken } from '@gicm/quantagent';
 *
 * const decision = await analyzeToken('SOL', {
 *   timeframe: '4h',
 *   provider: 'anthropic'
 * });
 *
 * console.log(decision.action);     // "LONG" | "SHORT" | "HOLD"
 * console.log(decision.confidence); // 0-100
 * console.log(decision.rationale);  // Explanation
 * ```
 */
export async function analyzeToken(
  symbol: string,
  options?: {
    address?: string;
    chain?: "solana" | "ethereum" | "base";
    timeframe?: "1h" | "4h" | "1d";
    provider?: "anthropic" | "openai";
    model?: string;
  }
): Promise<import("./agents/types.js").TradeDecision> {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    model: options?.model,
    showLogs: true,
  });

  return graph.analyze({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana",
    },
    timeframe: options?.timeframe || "4h",
  });
}

/**
 * Quick signal function - get a fast bullish/bearish/neutral signal
 *
 * @example
 * ```typescript
 * import { quickSignal } from '@gicm/quantagent';
 *
 * const signal = await quickSignal('BONK');
 * console.log(signal.signal);     // "bullish" | "bearish" | "neutral"
 * console.log(signal.confidence); // 0-100
 * ```
 */
export async function quickSignal(
  symbol: string,
  options?: {
    address?: string;
    chain?: "solana" | "ethereum" | "base";
    timeframe?: "1h" | "4h" | "1d";
    provider?: "anthropic" | "openai";
  }
): Promise<{
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  summary: string;
}> {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    showLogs: false,
  });

  return graph.quickAnalysis({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana",
    },
    timeframe: options?.timeframe || "4h",
  });
}
