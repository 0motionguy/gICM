/**
 * Indicator Agent - Technical indicator analysis
 */

import { BaseAgent } from "./base-agent.js";
import type { AgentConfig, OHLCV, TokenInfo, IndicatorResult } from "./types.js";
import { calculateRSI } from "../indicators/rsi.js";
import { calculateMACD } from "../indicators/macd.js";
import { calculateStochastic } from "../indicators/stochastic.js";
import { calculateBollingerBands } from "../indicators/bollinger.js";
import { analyzeVolume } from "../indicators/volume.js";
import { INDICATOR_AGENT_PROMPT } from "../llm/prompts.js";

export interface IndicatorAnalysis {
  indicators: IndicatorResult[];
  summary: string;
  overallSignal: "bullish" | "bearish" | "neutral";
  confidence: number;
}

export class IndicatorAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super("IndicatorAgent", config);
  }

  async analyze(token: TokenInfo, data: OHLCV[]): Promise<IndicatorAnalysis> {
    this.log(`Analyzing ${token.symbol}...`);

    if (data.length < 26) {
      this.log("Insufficient data for full analysis");
      return {
        indicators: [],
        summary: "Insufficient data for analysis",
        overallSignal: "neutral",
        confidence: 0,
      };
    }

    // Extract price arrays
    const closes = data.map((d) => d.close);
    const highs = data.map((d) => d.high);
    const lows = data.map((d) => d.low);
    const volumes = data.map((d) => d.volume);

    // Calculate all indicators
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);
    const stochastic = calculateStochastic(highs, lows, closes);
    const bollinger = calculateBollingerBands(closes);
    const volumeAnalysis = analyzeVolume(volumes, closes);

    // Build indicator results
    const indicators: IndicatorResult[] = [
      {
        name: "RSI (14)",
        value: rsi.value,
        signal:
          rsi.signal === "overbought"
            ? "bearish"
            : rsi.signal === "oversold"
              ? "bullish"
              : "neutral",
        strength: Math.abs(50 - rsi.value) * 2,
        description:
          rsi.signal === "overbought"
            ? "Overbought - potential reversal down"
            : rsi.signal === "oversold"
              ? "Oversold - potential bounce"
              : "Neutral momentum",
      },
      {
        name: "MACD",
        value: macd.histogram,
        signal: macd.trend === "bullish" ? "bullish" : macd.trend === "bearish" ? "bearish" : "neutral",
        strength: Math.min(Math.abs(macd.histogram) * 10000, 100),
        description:
          macd.crossover === "bullish"
            ? "Bullish crossover detected"
            : macd.crossover === "bearish"
              ? "Bearish crossover detected"
              : `MACD: ${macd.histogram > 0 ? "Positive" : "Negative"} histogram`,
      },
      {
        name: "Stochastic",
        value: stochastic.k,
        signal:
          stochastic.signal === "overbought"
            ? "bearish"
            : stochastic.signal === "oversold"
              ? "bullish"
              : "neutral",
        strength: Math.abs(50 - stochastic.k) * 2,
        description: `%K: ${stochastic.k.toFixed(1)}, %D: ${stochastic.d.toFixed(1)}${stochastic.crossover ? ` - ${stochastic.crossover} crossover` : ""}`,
      },
      {
        name: "Bollinger Bands",
        value: bollinger.percentB,
        signal:
          bollinger.signal === "overbought"
            ? "bearish"
            : bollinger.signal === "oversold"
              ? "bullish"
              : "neutral",
        strength: Math.abs(0.5 - bollinger.percentB) * 200,
        description: `Price at ${(bollinger.percentB * 100).toFixed(1)}% of bands${bollinger.squeeze ? " (Squeeze detected!)" : ""}`,
      },
      {
        name: "Volume",
        value: volumeAnalysis.ratio,
        signal: volumeAnalysis.trend,
        strength: Math.min(volumeAnalysis.ratio * 50, 100),
        description: volumeAnalysis.description,
      },
    ];

    // Use LLM to synthesize analysis
    const prompt = this.buildPrompt(token, data, indicators);

    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const analysis = this.parseResponse(llmResponse, indicators);
      this.log(`Analysis complete: ${analysis.overallSignal} (${analysis.confidence}%)`);
      return analysis;
    } catch (error) {
      this.log("LLM analysis failed, using fallback", error);
      return this.fallbackAnalysis(indicators);
    }
  }

  protected getSystemPrompt(): string {
    return INDICATOR_AGENT_PROMPT;
  }

  private buildPrompt(
    token: TokenInfo,
    data: OHLCV[],
    indicators: IndicatorResult[]
  ): string {
    const metrics = this.getPriceMetrics(data);
    const indicatorSummary = indicators
      .map(
        (i) =>
          `${i.name}: ${i.value.toFixed(4)} (${i.signal}, strength: ${i.strength.toFixed(0)}%)`
      )
      .join("\n");

    return `
Analyze the following technical indicators for ${token.symbol}:

Current Price: $${metrics.currentPrice.toFixed(6)}
24h Change: ${metrics.priceChangePercent.toFixed(2)}%
24h High: $${metrics.high24h.toFixed(6)}
24h Low: $${metrics.low24h.toFixed(6)}
24h Volume: $${metrics.volume24h.toFixed(0)}

INDICATORS:
${indicatorSummary}

RECENT PRICE DATA:
${this.formatDataForLLM(data)}

Based on these indicators, provide:
1. Overall signal (BULLISH, BEARISH, or NEUTRAL)
2. Confidence level (0-100)
3. Brief summary of the indicator confluence

Respond in JSON format:
{
  "overallSignal": "bullish" | "bearish" | "neutral",
  "confidence": number,
  "summary": "string"
}
`;
  }

  private parseResponse(
    response: string,
    indicators: IndicatorResult[]
  ): IndicatorAnalysis {
    const parsed = this.parseJSON<{
      overallSignal: "bullish" | "bearish" | "neutral";
      confidence: number;
      summary: string;
    }>(response);

    if (parsed) {
      return {
        indicators,
        summary: parsed.summary || "Analysis complete",
        overallSignal: parsed.overallSignal || "neutral",
        confidence: parsed.confidence || 50,
      };
    }

    return this.fallbackAnalysis(indicators);
  }

  private fallbackAnalysis(indicators: IndicatorResult[]): IndicatorAnalysis {
    // Fallback: calculate from indicators
    const bullish = indicators.filter((i) => i.signal === "bullish").length;
    const bearish = indicators.filter((i) => i.signal === "bearish").length;

    const overallSignal =
      bullish > bearish
        ? "bullish"
        : bearish > bullish
          ? "bearish"
          : "neutral";

    const confidence = Math.abs(bullish - bearish) * 20 + 30;

    return {
      indicators,
      summary: `${bullish} bullish, ${bearish} bearish, ${indicators.length - bullish - bearish} neutral indicators`,
      overallSignal,
      confidence: Math.min(confidence, 100),
    };
  }
}
