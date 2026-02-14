/**
 * RiskManager — enforces position limits, stop-losses, and drawdown caps.
 */

import type { RiskConfig, RiskAssessment, Signal, Position } from "./types.js";
import { DEFAULT_RISK_CONFIG as DEFAULTS } from "./types.js";

export class RiskManager {
  private config: RiskConfig;
  private dailyLoss = 0;
  private dailyLossResetDate = "";

  constructor(config: Partial<RiskConfig> = {}) {
    this.config = { ...DEFAULTS, ...config };
  }

  /**
   * Assess whether a new position is allowed.
   */
  assess(
    signal: Signal,
    proposedSize: number,
    openPositions: Position[],
    totalExposure: number,
    dailyPnL: number
  ): RiskAssessment {
    const warnings: string[] = [];
    let adjustedSize = proposedSize;

    // Reset daily loss tracker at midnight
    const today = new Date().toISOString().split("T")[0];
    if (today !== this.dailyLossResetDate) {
      this.dailyLoss = 0;
      this.dailyLossResetDate = today;
    }
    this.dailyLoss = Math.min(dailyPnL, 0);

    // Check minimum confidence
    if (signal.confidence < this.config.minConfidence) {
      return {
        allowed: false,
        reason: `Confidence ${(signal.confidence * 100).toFixed(0)}% below minimum ${(this.config.minConfidence * 100).toFixed(0)}%`,
        riskScore: 90,
        warnings,
      };
    }

    // Check max positions
    if (openPositions.length >= this.config.maxPositions) {
      return {
        allowed: false,
        reason: `Max positions (${this.config.maxPositions}) reached`,
        riskScore: 80,
        warnings,
      };
    }

    // Check daily loss limit
    if (Math.abs(this.dailyLoss) >= this.config.dailyLossLimit) {
      return {
        allowed: false,
        reason: `Daily loss limit $${this.config.dailyLossLimit} reached`,
        riskScore: 95,
        warnings,
      };
    }

    // Check position size
    const positionValue = proposedSize * signal.currentPrice;
    if (positionValue > this.config.maxPositionSize) {
      adjustedSize = this.config.maxPositionSize / signal.currentPrice;
      warnings.push(
        `Size reduced from ${proposedSize.toFixed(0)} to ${adjustedSize.toFixed(0)} (max $${this.config.maxPositionSize})`
      );
    }

    // Check total exposure
    const newExposure = totalExposure + adjustedSize * signal.currentPrice;
    if (newExposure > this.config.maxTotalExposure) {
      const maxAdditional = this.config.maxTotalExposure - totalExposure;
      if (maxAdditional <= 0) {
        return {
          allowed: false,
          reason: `Total exposure $${totalExposure.toFixed(0)} at max $${this.config.maxTotalExposure}`,
          riskScore: 85,
          warnings,
        };
      }
      adjustedSize = maxAdditional / signal.currentPrice;
      warnings.push(
        `Size limited to $${(adjustedSize * signal.currentPrice).toFixed(0)} due to exposure cap`
      );
    }

    // Check market liquidity
    // This would need the market object, but we check from the signal's metadata
    // For now, skip (scanner already filters by minLiquidity)

    // Calculate risk score (lower = safer)
    const exposureRatio = newExposure / this.config.maxTotalExposure;
    const lossRatio =
      this.config.dailyLossLimit > 0
        ? Math.abs(this.dailyLoss) / this.config.dailyLossLimit
        : 0;
    const positionRatio = openPositions.length / this.config.maxPositions;
    const riskScore =
      Math.round(
        (exposureRatio * 40 + lossRatio * 40 + positionRatio * 20) * 100
      ) / 100;

    if (riskScore > 70) {
      warnings.push(`Risk score ${riskScore}/100 — approaching limits`);
    }

    return {
      allowed: true,
      adjustedSize,
      riskScore: Math.min(riskScore, 100),
      warnings,
    };
  }

  /**
   * Calculate stop-loss price for a position.
   */
  getStopLoss(entryPrice: number, side: "buy" | "sell"): number {
    if (side === "buy") {
      return entryPrice * (1 - this.config.stopLossPercent);
    }
    return entryPrice * (1 + this.config.stopLossPercent);
  }

  /**
   * Calculate take-profit price.
   */
  getTakeProfit(entryPrice: number, side: "buy" | "sell"): number {
    if (side === "buy") {
      return entryPrice * (1 + this.config.takeProfitPercent);
    }
    return entryPrice * (1 - this.config.takeProfitPercent);
  }

  /**
   * Check if max drawdown is breached.
   */
  isDrawdownBreached(maxDrawdown: number): boolean {
    return maxDrawdown >= this.config.maxDrawdownPercent;
  }

  /**
   * Get current config.
   */
  getConfig(): Readonly<RiskConfig> {
    return { ...this.config };
  }

  /**
   * Update config.
   */
  updateConfig(updates: Partial<RiskConfig>): void {
    Object.assign(this.config, updates);
  }
}
