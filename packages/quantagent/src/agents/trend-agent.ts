/**
 * Trend Agent - Trend and momentum analysis
 */

import { BaseAgent } from "./base-agent.js";
import type { AgentConfig, OHLCV, TokenInfo, TrendResult } from "./types.js";
import { TREND_AGENT_PROMPT } from "../llm/prompts.js";

export class TrendAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super("TrendAgent", config);
  }

  async analyze(token: TokenInfo, data: OHLCV[]): Promise<TrendResult> {
    this.log(`Analyzing trend for ${token.symbol}...`);

    if (data.length < 50) {
      this.log("Insufficient data for trend analysis");
      const currentPrice = data[data.length - 1]?.close || 0;
      return {
        direction: "sideways",
        strength: 0,
        support: currentPrice * 0.95,
        resistance: currentPrice * 1.05,
        momentum: 0,
        description: "Insufficient data for trend analysis",
      };
    }

    // Calculate trend metrics
    const trendMetrics = this.calculateTrendMetrics(data);

    // Use LLM for deeper analysis
    const prompt = this.buildPrompt(token, data, trendMetrics);

    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const result = this.parseResponse(llmResponse, trendMetrics);
      this.log(`Trend: ${result.direction} (strength: ${result.strength}%)`);
      return result;
    } catch (error) {
      this.log("LLM analysis failed, using calculated metrics", error);
      return {
        ...trendMetrics,
        description: `Trend is ${trendMetrics.direction} with ${trendMetrics.strength.toFixed(0)}% strength`,
      };
    }
  }

  protected getSystemPrompt(): string {
    return TREND_AGENT_PROMPT;
  }

  private calculateTrendMetrics(data: OHLCV[]): {
    direction: "up" | "down" | "sideways";
    strength: number;
    support: number;
    resistance: number;
    momentum: number;
    ema20: number;
    ema50: number;
    ema200: number;
  } {
    const closes = data.map((d) => d.close);

    // Calculate EMAs
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = closes.length >= 200 ? this.calculateEMA(closes, 200) : ema50;

    // Determine trend direction
    const currentPrice = closes[closes.length - 1];
    let direction: "up" | "down" | "sideways" = "sideways";

    if (currentPrice > ema20 && ema20 > ema50) {
      direction = "up";
    } else if (currentPrice < ema20 && ema20 < ema50) {
      direction = "down";
    }

    // Calculate trend strength (0-100)
    const priceVsEma20 = ((currentPrice - ema20) / ema20) * 100;
    const ema20Vs50 = ((ema20 - ema50) / ema50) * 100;
    const strength = Math.min(Math.abs(priceVsEma20 + ema20Vs50) * 5, 100);

    // Find support and resistance levels
    const { support, resistance } = this.findSupportResistance(data);

    // Calculate momentum (rate of change)
    const lookback = Math.min(20, closes.length - 1);
    const previousPrice = closes[closes.length - lookback - 1];
    const momentum = ((currentPrice - previousPrice) / previousPrice) * 100;

    return {
      direction,
      strength,
      support,
      resistance,
      momentum,
      ema20,
      ema50,
      ema200,
    };
  }

  private findSupportResistance(data: OHLCV[]): {
    support: number;
    resistance: number;
  } {
    // Use pivot points and recent highs/lows
    const recent = data.slice(-50);
    const lows = recent.map((d) => d.low);
    const highs = recent.map((d) => d.high);

    // Find significant lows (potential support)
    const sortedLows = [...lows].sort((a, b) => a - b);
    const support = sortedLows[Math.floor(sortedLows.length * 0.1)]; // 10th percentile

    // Find significant highs (potential resistance)
    const sortedHighs = [...highs].sort((a, b) => b - a);
    const resistance = sortedHighs[Math.floor(sortedHighs.length * 0.1)]; // 90th percentile

    return { support, resistance };
  }

  private buildPrompt(
    token: TokenInfo,
    data: OHLCV[],
    metrics: ReturnType<typeof this.calculateTrendMetrics>
  ): string {
    const priceMetrics = this.getPriceMetrics(data);

    return `
Analyze the trend for ${token.symbol}:

Current Price: $${priceMetrics.currentPrice.toFixed(6)}
EMA 20: $${metrics.ema20.toFixed(6)}
EMA 50: $${metrics.ema50.toFixed(6)}
EMA 200: $${metrics.ema200.toFixed(6)}
Support: $${metrics.support.toFixed(6)}
Resistance: $${metrics.resistance.toFixed(6)}
Momentum (20 period): ${metrics.momentum.toFixed(2)}%

Initial Assessment:
- Direction: ${metrics.direction}
- Strength: ${metrics.strength.toFixed(0)}%

PRICE DATA:
${this.formatDataForLLM(data)}

Provide refined trend analysis:
1. Confirm or adjust direction
2. Strength score (0-100)
3. Key support/resistance levels
4. Brief description

Respond in JSON format:
{
  "direction": "up" | "down" | "sideways",
  "strength": number,
  "support": number,
  "resistance": number,
  "momentum": number,
  "description": "string"
}
`;
  }

  private parseResponse(
    response: string,
    fallback: ReturnType<typeof this.calculateTrendMetrics>
  ): TrendResult {
    const parsed = this.parseJSON<{
      direction: "up" | "down" | "sideways";
      strength: number;
      support: number;
      resistance: number;
      momentum: number;
      description: string;
    }>(response);

    if (parsed) {
      return {
        direction: parsed.direction || fallback.direction,
        strength: parsed.strength || fallback.strength,
        support: parsed.support || fallback.support,
        resistance: parsed.resistance || fallback.resistance,
        momentum: parsed.momentum || fallback.momentum,
        description:
          parsed.description ||
          `Trend is ${fallback.direction} with ${fallback.strength}% strength`,
      };
    }

    return {
      direction: fallback.direction,
      strength: fallback.strength,
      support: fallback.support,
      resistance: fallback.resistance,
      momentum: fallback.momentum,
      description: `Trend is ${fallback.direction} with ${fallback.strength.toFixed(0)}% strength`,
    };
  }
}
