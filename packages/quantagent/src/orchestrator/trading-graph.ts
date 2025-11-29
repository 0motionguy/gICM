/**
 * Trading Graph - Orchestrates all agents for multi-agent trading analysis
 */

import type {
  AgentConfig,
  OHLCV,
  TokenInfo,
  TradeDecision,
  AnalysisRequest,
} from "../agents/types.js";
import { IndicatorAgent } from "../agents/indicator-agent.js";
import { PatternAgent } from "../agents/pattern-agent.js";
import { TrendAgent } from "../agents/trend-agent.js";
import { RiskAgent } from "../agents/risk-agent.js";
import { fetchTokenData } from "../data/index.js";

export interface TradingGraphConfig {
  agentConfig: AgentConfig;
  defaultTimeframe?: "1h" | "4h" | "1d";
  showLogs?: boolean;
}

export class TradingGraph {
  private indicatorAgent: IndicatorAgent;
  private patternAgent: PatternAgent;
  private trendAgent: TrendAgent;
  private riskAgent: RiskAgent;
  private config: TradingGraphConfig;

  constructor(config: TradingGraphConfig) {
    this.config = config;

    // Initialize all agents with the same config
    this.indicatorAgent = new IndicatorAgent(config.agentConfig);
    this.patternAgent = new PatternAgent(config.agentConfig);
    this.trendAgent = new TrendAgent(config.agentConfig);
    this.riskAgent = new RiskAgent(config.agentConfig);
  }

  /**
   * Run full analysis pipeline
   * Executes all agents and synthesizes a trading decision
   */
  async analyze(request: AnalysisRequest): Promise<TradeDecision> {
    const { token, timeframe = this.config.defaultTimeframe || "4h" } = request;

    this.log(`\nStarting QuantAgent analysis for ${token.symbol}...`);
    this.log(`Timeframe: ${timeframe}`);

    // Fetch data if not provided
    let data = request.klineData;
    if (!data || data.length === 0) {
      this.log("Fetching market data...");
      try {
        data = await fetchTokenData(token, timeframe);
      } catch (error) {
        this.log(`Data fetch error: ${error}`);
        data = [];
      }
    }

    if (data.length < 50) {
      this.log(`Warning: Only ${data.length} candles available (need 50+ for full analysis)`);
    }

    // Run indicator, pattern, and trend agents in parallel
    this.log("\nRunning agents...");

    const startTime = Date.now();

    const [indicatorResult, patternResult, trendResult] = await Promise.all([
      this.runWithTiming("Indicator Agent", () =>
        this.indicatorAgent.analyze(token, data!)
      ),
      this.runWithTiming("Pattern Agent", () =>
        this.patternAgent.analyze(token, data!)
      ),
      this.runWithTiming("Trend Agent", () =>
        this.trendAgent.analyze(token, data!)
      ),
    ]);

    // Risk agent synthesizes all results into a final decision
    const decision = await this.runWithTiming("Risk Agent", () =>
      this.riskAgent.analyze({
        token,
        data: data!,
        indicators: indicatorResult.indicators,
        indicatorSignal: indicatorResult.overallSignal,
        indicatorConfidence: indicatorResult.confidence,
        pattern: patternResult,
        trend: trendResult,
      })
    );

    const totalTime = Date.now() - startTime;
    this.log(`\nAnalysis complete in ${totalTime}ms`);
    this.log(`Decision: ${decision.action} (${decision.confidence}% confidence)`);

    return decision;
  }

  /**
   * Quick analysis - indicators only (faster)
   * Good for initial screening
   */
  async quickAnalysis(request: AnalysisRequest): Promise<{
    signal: "bullish" | "bearish" | "neutral";
    confidence: number;
    summary: string;
  }> {
    const { token, timeframe = "4h" } = request;

    let data = request.klineData;
    if (!data) {
      data = await fetchTokenData(token, timeframe);
    }

    const result = await this.indicatorAgent.analyze(token, data);

    return {
      signal: result.overallSignal,
      confidence: result.confidence,
      summary: result.summary,
    };
  }

  /**
   * Get individual agent results without final synthesis
   * Useful for debugging or custom analysis
   */
  async getAgentResults(request: AnalysisRequest): Promise<{
    indicators: Awaited<ReturnType<IndicatorAgent["analyze"]>>;
    pattern: Awaited<ReturnType<PatternAgent["analyze"]>>;
    trend: Awaited<ReturnType<TrendAgent["analyze"]>>;
  }> {
    const { token, timeframe = "4h" } = request;

    let data = request.klineData;
    if (!data) {
      data = await fetchTokenData(token, timeframe);
    }

    const [indicators, pattern, trend] = await Promise.all([
      this.indicatorAgent.analyze(token, data),
      this.patternAgent.analyze(token, data),
      this.trendAgent.analyze(token, data),
    ]);

    return { indicators, pattern, trend };
  }

  private async runWithTiming<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.log(`  ${name}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.log(`  ${name}: FAILED after ${duration}ms - ${error}`);
      throw error;
    }
  }

  private log(message: string): void {
    if (this.config.showLogs !== false) {
      console.log(`[TradingGraph] ${message}`);
    }
  }
}

/**
 * Factory function for easy instantiation
 */
export function createTradingGraph(options?: {
  provider?: "anthropic" | "openai";
  model?: string;
  showLogs?: boolean;
}): TradingGraph {
  const provider = options?.provider || "anthropic";
  const model =
    options?.model ||
    (provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");

  return new TradingGraph({
    agentConfig: {
      llmProvider: provider,
      model,
      temperature: 0.3,
      maxTokens: 1000,
    },
    defaultTimeframe: "4h",
    showLogs: options?.showLogs ?? true,
  });
}
