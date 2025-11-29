/**
 * Agent type definitions for QuantAgent trading system
 */

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address?: string;
  chain: "solana" | "ethereum" | "base" | "other";
  poolAddress?: string;
}

export interface IndicatorResult {
  name: string;
  value: number;
  signal: "bullish" | "bearish" | "neutral";
  strength: number; // 0-100
  description: string;
}

export interface PatternResult {
  pattern: string;
  confidence: number; // 0-100
  direction: "bullish" | "bearish" | "neutral";
  priceTarget?: number;
  description: string;
  visualization?: string; // Base64 chart image
}

export interface TrendResult {
  direction: "up" | "down" | "sideways";
  strength: number; // 0-100
  support: number;
  resistance: number;
  momentum: number;
  description: string;
}

export interface RiskResult {
  riskScore: number; // 0-100 (higher = riskier)
  rewardRatio: number; // Risk/reward ratio
  stopLoss: number;
  takeProfit: number;
  positionSize: number; // Suggested % of portfolio
  warnings: string[];
}

export interface TradeDecision {
  action: "LONG" | "SHORT" | "HOLD" | "EXIT";
  confidence: number; // 0-100
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  rationale: string;

  // Agent reports
  indicators: IndicatorResult[];
  pattern: PatternResult | null;
  trend: TrendResult;
  risk: RiskResult;

  // Metadata
  timestamp: number;
  token: TokenInfo;
}

export interface AgentConfig {
  llmProvider: "anthropic" | "openai";
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisRequest {
  token: TokenInfo;
  timeframe: "1h" | "4h" | "1d";
  klineData?: OHLCV[]; // Optional: provide your own data
  includeChart?: boolean;
}

// LLM Response types
export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Analysis state for orchestrator
export interface AnalysisState {
  token: TokenInfo;
  timeframe: "1h" | "4h" | "1d";
  data: OHLCV[];
  indicatorAnalysis?: {
    indicators: IndicatorResult[];
    summary: string;
    overallSignal: "bullish" | "bearish" | "neutral";
    confidence: number;
  };
  patternAnalysis?: PatternResult | null;
  trendAnalysis?: TrendResult;
  decision?: TradeDecision;
}
