/**
 * Risk Agent - Risk assessment and trade synthesis
 */

import { BaseAgent } from "./base-agent.js";
import type {
  AgentConfig,
  OHLCV,
  TokenInfo,
  RiskResult,
  TradeDecision,
  IndicatorResult,
  PatternResult,
  TrendResult,
} from "./types.js";
import { RISK_AGENT_PROMPT } from "../llm/prompts.js";

export interface RiskAgentInput {
  token: TokenInfo;
  data: OHLCV[];
  indicators: IndicatorResult[];
  indicatorSignal: "bullish" | "bearish" | "neutral";
  indicatorConfidence: number;
  pattern: PatternResult | null;
  trend: TrendResult;
}

export class RiskAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super("RiskAgent", config);
  }

  async analyze(input: RiskAgentInput): Promise<TradeDecision> {
    const { token, data, indicators, pattern, trend } = input;
    this.log(`Synthesizing trade decision for ${token.symbol}...`);

    if (data.length === 0) {
      return this.getDefaultDecision(token, input);
    }

    const metrics = this.getPriceMetrics(data);

    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(data, trend);

    // Build comprehensive prompt for LLM
    const prompt = this.buildPrompt(input, metrics, riskMetrics);

    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const decision = this.parseResponse(llmResponse, {
        token,
        indicators,
        pattern,
        trend,
        riskMetrics,
        currentPrice: metrics.currentPrice,
      });
      this.log(`Decision: ${decision.action} (${decision.confidence}% confidence)`);
      return decision;
    } catch (error) {
      this.log("LLM analysis failed, using calculated decision", error);
      return this.calculateFallbackDecision(input, metrics, riskMetrics);
    }
  }

  protected getSystemPrompt(): string {
    return RISK_AGENT_PROMPT;
  }

  private calculateRiskMetrics(data: OHLCV[], trend?: TrendResult): RiskResult {
    const currentPrice = data[data.length - 1]?.close || 0;

    if (currentPrice === 0) {
      return {
        riskScore: 100,
        rewardRatio: 0,
        stopLoss: 0,
        takeProfit: 0,
        positionSize: 0,
        warnings: ["No price data available"],
      };
    }

    // Calculate volatility using ATR
    const atr = this.calculateATR(data, 14);
    const volatility = (atr / currentPrice) * 100;

    // Default stop loss: 2x ATR below current price
    const stopLoss = currentPrice - atr * 2;

    // Default take profit based on trend resistance or 3x ATR
    const takeProfit = trend?.resistance || currentPrice + atr * 3;

    // Calculate risk/reward ratio
    const risk = currentPrice - stopLoss;
    const reward = takeProfit - currentPrice;
    const rewardRatio = risk > 0 ? reward / risk : 0;

    // Calculate risk score (higher = riskier)
    let riskScore = 50;

    // Volatility adjustments
    if (volatility > 10) riskScore += 15;
    if (volatility > 20) riskScore += 15;

    // Risk/reward adjustments
    if (rewardRatio < 1.5) riskScore += 10;
    if (rewardRatio < 1) riskScore += 15;

    // Trend strength adjustments
    if (trend?.strength && trend.strength < 30) riskScore += 10;

    // Collect warnings
    const warnings: string[] = [];

    if (volatility > 15) {
      warnings.push("High volatility detected - use wider stops");
    }
    if (rewardRatio < 1.5) {
      warnings.push("Poor risk/reward ratio - consider waiting for better entry");
    }
    if (trend?.strength && trend.strength < 30) {
      warnings.push("Weak trend - wait for confirmation");
    }
    if (atr > currentPrice * 0.05) {
      warnings.push("Very high ATR - reduce position size");
    }

    // Calculate position size based on risk score
    const positionSize = Math.max(100 - riskScore, 1);

    return {
      riskScore: Math.min(riskScore, 100),
      rewardRatio: Math.round(rewardRatio * 100) / 100,
      stopLoss: Math.round(stopLoss * 1e8) / 1e8,
      takeProfit: Math.round(takeProfit * 1e8) / 1e8,
      positionSize,
      warnings,
    };
  }

  private buildPrompt(
    input: RiskAgentInput,
    metrics: ReturnType<BaseAgent["getPriceMetrics"]>,
    riskMetrics: RiskResult
  ): string {
    const { token, indicators, indicatorSignal, indicatorConfidence, pattern, trend } = input;

    const indicatorSummary = indicators
      .map((i) => `${i.name}: ${i.signal} (strength: ${i.strength.toFixed(0)}%)`)
      .join("\n");

    return `
TRADE DECISION REQUEST for ${token.symbol} (${token.chain})

CURRENT MARKET STATE:
- Price: $${metrics.currentPrice.toFixed(6)}
- 24h Change: ${metrics.priceChangePercent.toFixed(2)}%
- 24h Range: $${metrics.low24h.toFixed(6)} - $${metrics.high24h.toFixed(6)}
- 24h Volume: $${metrics.volume24h.toFixed(0)}

INDICATOR ANALYSIS (${indicatorSignal.toUpperCase()}, ${indicatorConfidence}% confidence):
${indicatorSummary}

PATTERN ANALYSIS:
${
  pattern
    ? `${pattern.pattern} - ${pattern.direction} (${pattern.confidence}% confidence)
   Price Target: ${pattern.priceTarget ? `$${pattern.priceTarget.toFixed(6)}` : "N/A"}
   ${pattern.description}`
    : "No significant pattern detected"
}

TREND ANALYSIS:
- Direction: ${trend.direction}
- Strength: ${trend.strength.toFixed(0)}%
- Support: $${trend.support.toFixed(6)}
- Resistance: $${trend.resistance.toFixed(6)}
- Momentum: ${trend.momentum.toFixed(2)}%
- ${trend.description}

RISK METRICS:
- Risk Score: ${riskMetrics.riskScore}/100 (higher = riskier)
- Risk/Reward Ratio: ${riskMetrics.rewardRatio.toFixed(2)}
- Suggested Stop Loss: $${riskMetrics.stopLoss.toFixed(6)}
- Suggested Take Profit: $${riskMetrics.takeProfit.toFixed(6)}
- Suggested Position Size: ${riskMetrics.positionSize}% of portfolio
- Warnings: ${riskMetrics.warnings.length > 0 ? riskMetrics.warnings.join("; ") : "None"}

Based on ALL the above analysis, provide a trade decision.

Consider:
1. Agent confluence - do multiple agents agree?
2. Risk/reward - is it worth taking the trade?
3. Current market conditions
4. Any conflicting signals

Respond in JSON format:
{
  "action": "LONG" | "SHORT" | "HOLD" | "EXIT",
  "confidence": number (0-100),
  "entryPrice": number,
  "stopLoss": number,
  "takeProfit": number,
  "rationale": "string (2-3 sentences explaining the decision)"
}
`;
  }

  private parseResponse(
    response: string,
    context: {
      token: TokenInfo;
      indicators: IndicatorResult[];
      pattern: PatternResult | null;
      trend: TrendResult;
      riskMetrics: RiskResult;
      currentPrice: number;
    }
  ): TradeDecision {
    const parsed = this.parseJSON<{
      action: "LONG" | "SHORT" | "HOLD" | "EXIT";
      confidence: number;
      entryPrice: number;
      stopLoss: number;
      takeProfit: number;
      rationale: string;
    }>(response);

    if (parsed) {
      return {
        action: parsed.action || "HOLD",
        confidence: parsed.confidence || 50,
        entryPrice: parsed.entryPrice || context.currentPrice,
        stopLoss: parsed.stopLoss || context.riskMetrics.stopLoss,
        takeProfit: parsed.takeProfit || context.riskMetrics.takeProfit,
        timeframe: "4h",
        rationale: parsed.rationale || "Based on technical analysis",
        indicators: context.indicators,
        pattern: context.pattern,
        trend: context.trend,
        risk: context.riskMetrics,
        timestamp: Date.now(),
        token: context.token,
      };
    }

    // Fallback decision
    return {
      action: "HOLD",
      confidence: 30,
      entryPrice: context.currentPrice,
      stopLoss: context.riskMetrics.stopLoss,
      takeProfit: context.riskMetrics.takeProfit,
      timeframe: "4h",
      rationale: "Insufficient confluence for high-confidence trade",
      indicators: context.indicators,
      pattern: context.pattern,
      trend: context.trend,
      risk: context.riskMetrics,
      timestamp: Date.now(),
      token: context.token,
    };
  }

  private calculateFallbackDecision(
    input: RiskAgentInput,
    metrics: ReturnType<BaseAgent["getPriceMetrics"]>,
    riskMetrics: RiskResult
  ): TradeDecision {
    const { token, indicators, indicatorSignal, indicatorConfidence, pattern, trend } = input;

    // Determine action based on confluence
    let bullishSignals = 0;
    let bearishSignals = 0;

    if (indicatorSignal === "bullish") bullishSignals++;
    if (indicatorSignal === "bearish") bearishSignals++;
    if (pattern?.direction === "bullish") bullishSignals++;
    if (pattern?.direction === "bearish") bearishSignals++;
    if (trend.direction === "up") bullishSignals++;
    if (trend.direction === "down") bearishSignals++;

    let action: "LONG" | "SHORT" | "HOLD" | "EXIT" = "HOLD";
    let confidence = 30;

    if (bullishSignals >= 2 && bearishSignals === 0) {
      action = "LONG";
      confidence = Math.min(50 + bullishSignals * 15, 80);
    } else if (bearishSignals >= 2 && bullishSignals === 0) {
      action = "SHORT";
      confidence = Math.min(50 + bearishSignals * 15, 80);
    }

    // Reduce confidence if risk score is high
    if (riskMetrics.riskScore > 70) {
      confidence = Math.max(confidence - 20, 20);
    }

    const rationale =
      action === "HOLD"
        ? "Mixed signals - waiting for clearer direction"
        : action === "LONG"
          ? `${bullishSignals} bullish signals across agents`
          : `${bearishSignals} bearish signals across agents`;

    return {
      action,
      confidence,
      entryPrice: metrics.currentPrice,
      stopLoss: riskMetrics.stopLoss,
      takeProfit: riskMetrics.takeProfit,
      timeframe: "4h",
      rationale,
      indicators,
      pattern,
      trend,
      risk: riskMetrics,
      timestamp: Date.now(),
      token,
    };
  }

  private getDefaultDecision(token: TokenInfo, input: RiskAgentInput): TradeDecision {
    return {
      action: "HOLD",
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      timeframe: "4h",
      rationale: "Insufficient data for analysis",
      indicators: input.indicators,
      pattern: input.pattern,
      trend: input.trend,
      risk: {
        riskScore: 100,
        rewardRatio: 0,
        stopLoss: 0,
        takeProfit: 0,
        positionSize: 0,
        warnings: ["No data available"],
      },
      timestamp: Date.now(),
      token,
    };
  }
}
