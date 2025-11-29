/**
 * Base Agent - Common functionality for all trading agents
 */

import type { AgentConfig, OHLCV, TokenInfo } from "./types.js";
import { LLMClient } from "../llm/client.js";

export abstract class BaseAgent {
  protected name: string;
  protected config: AgentConfig;
  protected llm: LLMClient;

  constructor(name: string, config: AgentConfig) {
    this.name = name;
    this.config = config;
    this.llm = new LLMClient(config);
  }

  /**
   * Execute the agent's analysis
   */
  abstract analyze(
    token: TokenInfo,
    data: OHLCV[],
    context?: Record<string, unknown>
  ): Promise<unknown>;

  /**
   * Get the agent's system prompt
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Format OHLCV data for LLM consumption
   */
  protected formatDataForLLM(data: OHLCV[]): string {
    const recent = data.slice(-20); // Last 20 candles

    return recent
      .map((candle, i) => {
        const date = new Date(candle.timestamp).toISOString().slice(0, 16);
        return `[${i + 1}] ${date} | O:${candle.open.toFixed(6)} H:${candle.high.toFixed(6)} L:${candle.low.toFixed(6)} C:${candle.close.toFixed(6)} V:${candle.volume.toFixed(0)}`;
      })
      .join("\n");
  }

  /**
   * Calculate basic price metrics from OHLCV data
   */
  protected getPriceMetrics(data: OHLCV[]): {
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent: number;
    high24h: number;
    low24h: number;
    volume24h: number;
  } {
    if (data.length === 0) {
      return {
        currentPrice: 0,
        priceChange24h: 0,
        priceChangePercent: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
      };
    }

    const current = data[data.length - 1];
    const last24h = data.slice(-24);

    const high24h = Math.max(...last24h.map((d) => d.high));
    const low24h = Math.min(...last24h.map((d) => d.low));
    const volume24h = last24h.reduce((sum, d) => sum + d.volume, 0);
    const priceChange24h = current.close - last24h[0].close;
    const priceChangePercent = (priceChange24h / last24h[0].close) * 100;

    return {
      currentPrice: current.close,
      priceChange24h,
      priceChangePercent,
      high24h,
      low24h,
      volume24h,
    };
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  protected calculateEMA(data: number[], period: number): number {
    if (data.length < period) {
      return data.reduce((a, b) => a + b, 0) / data.length;
    }

    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calculate SMA (Simple Moving Average)
   */
  protected calculateSMA(data: number[], period: number): number {
    if (data.length < period) {
      return data.reduce((a, b) => a + b, 0) / data.length;
    }

    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate ATR (Average True Range)
   */
  protected calculateATR(data: OHLCV[], period: number = 14): number {
    if (data.length < 2) {
      return 0;
    }

    const trs: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trs.push(tr);
    }

    const recentTRs = trs.slice(-period);
    return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
  }

  /**
   * Log agent activity
   */
  protected log(message: string, data?: unknown): void {
    console.log(`[${this.name}] ${message}`, data || "");
  }

  /**
   * Parse JSON from LLM response, handling markdown code blocks
   */
  protected parseJSON<T>(response: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks first
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }

      // Try to find raw JSON object
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      this.log("Failed to parse JSON from response", error);
      return null;
    }
  }
}
