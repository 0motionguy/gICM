/**
 * Pattern Agent - Chart pattern recognition
 */

import { BaseAgent } from "./base-agent.js";
import type { AgentConfig, OHLCV, TokenInfo, PatternResult } from "./types.js";
import { detectPatterns } from "../patterns/detector.js";
import { detectCryptoPatterns } from "../patterns/crypto-patterns.js";
import { PATTERN_AGENT_PROMPT } from "../llm/prompts.js";

export class PatternAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super("PatternAgent", config);
  }

  async analyze(
    token: TokenInfo,
    data: OHLCV[]
  ): Promise<PatternResult | null> {
    this.log(`Scanning patterns for ${token.symbol}...`);

    if (data.length < 20) {
      this.log("Insufficient data for pattern detection");
      return null;
    }

    // Detect classical patterns
    const classicalPatterns = detectPatterns(data);

    // Detect crypto-specific patterns (pump/dump, accumulation, etc.)
    const cryptoPatterns = detectCryptoPatterns(data);

    const allPatterns = [...classicalPatterns, ...cryptoPatterns];

    if (allPatterns.length === 0) {
      this.log("No significant patterns detected");
      return null;
    }

    // Get the most significant pattern (highest confidence)
    const topPattern = allPatterns.sort((a, b) => b.confidence - a.confidence)[0];

    // Use LLM to analyze and refine the pattern detection
    const prompt = this.buildPrompt(token, data, topPattern, allPatterns);

    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const result = this.parseResponse(llmResponse, topPattern);
      this.log(`Pattern detected: ${result.pattern} (${result.confidence}% confidence)`);
      return result;
    } catch (error) {
      this.log("LLM analysis failed, using detected pattern", error);
      return {
        pattern: topPattern.pattern,
        confidence: topPattern.confidence,
        direction: topPattern.direction,
        priceTarget: topPattern.priceTarget,
        description: topPattern.description,
      };
    }
  }

  protected getSystemPrompt(): string {
    return PATTERN_AGENT_PROMPT;
  }

  private buildPrompt(
    token: TokenInfo,
    data: OHLCV[],
    topPattern: ReturnType<typeof detectPatterns>[0],
    allPatterns: ReturnType<typeof detectPatterns>
  ): string {
    const metrics = this.getPriceMetrics(data);

    return `
Analyze chart patterns for ${token.symbol}:

Current Price: $${metrics.currentPrice.toFixed(6)}
24h Range: $${metrics.low24h.toFixed(6)} - $${metrics.high24h.toFixed(6)}
24h Change: ${metrics.priceChangePercent.toFixed(2)}%

DETECTED PATTERNS:
${allPatterns.map((p) => `- ${p.pattern}: ${p.confidence}% confidence, ${p.direction}`).join("\n")}

TOP PATTERN: ${topPattern.pattern}
Initial Confidence: ${topPattern.confidence}%
Direction: ${topPattern.direction}
${topPattern.priceTarget ? `Price Target: $${topPattern.priceTarget.toFixed(6)}` : ""}
Description: ${topPattern.description}

PRICE DATA:
${this.formatDataForLLM(data)}

Analyze this pattern and provide:
1. Refined confidence level based on pattern clarity
2. Price target if pattern completes
3. Key levels to watch
4. Brief description of the pattern

Respond in JSON format:
{
  "pattern": "string",
  "confidence": number,
  "direction": "bullish" | "bearish" | "neutral",
  "priceTarget": number | null,
  "description": "string"
}
`;
  }

  private parseResponse(
    response: string,
    fallback: ReturnType<typeof detectPatterns>[0]
  ): PatternResult {
    const parsed = this.parseJSON<{
      pattern: string;
      confidence: number;
      direction: "bullish" | "bearish" | "neutral";
      priceTarget: number | null;
      description: string;
    }>(response);

    if (parsed) {
      return {
        pattern: parsed.pattern || fallback.pattern,
        confidence: parsed.confidence || fallback.confidence,
        direction: parsed.direction || fallback.direction,
        priceTarget: parsed.priceTarget ?? fallback.priceTarget,
        description: parsed.description || fallback.description,
      };
    }

    return {
      pattern: fallback.pattern,
      confidence: fallback.confidence,
      direction: fallback.direction,
      priceTarget: fallback.priceTarget,
      description: fallback.description,
    };
  }
}
