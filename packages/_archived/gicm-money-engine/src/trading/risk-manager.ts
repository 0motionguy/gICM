/**
 * Risk Manager
 *
 * Manages trading risk parameters and validates positions.
 */

import Decimal from "decimal.js";
import type { RiskParameters, BotPerformance } from "../core/types.js";
import { DEFAULT_RISK_PARAMS } from "../core/constants.js";
import { Logger } from "../utils/logger.js";

export class RiskManager {
  private params: RiskParameters;
  private logger: Logger;
  private dailyLossTracking: Decimal = new Decimal(0);
  private weeklyLossTracking: Decimal = new Decimal(0);
  private lastDailyReset: number = Date.now();
  private lastWeeklyReset: number = Date.now();

  constructor(params?: Partial<RiskParameters>) {
    this.logger = new Logger("RiskManager");
    this.params = {
      maxPositionPercent: params?.maxPositionPercent ?? DEFAULT_RISK_PARAMS.maxPositionPercent,
      maxTotalExposure: params?.maxTotalExposure ?? DEFAULT_RISK_PARAMS.maxTotalExposure,
      stopLossPercent: params?.stopLossPercent ?? DEFAULT_RISK_PARAMS.stopLossPercent,
      dailyLossLimit: params?.dailyLossLimit ?? new Decimal(DEFAULT_RISK_PARAMS.dailyLossLimitPercent),
      weeklyLossLimit: params?.weeklyLossLimit ?? new Decimal(DEFAULT_RISK_PARAMS.weeklyLossLimitPercent),
      maxDrawdownPercent: params?.maxDrawdownPercent ?? DEFAULT_RISK_PARAMS.maxDrawdownPercent,
      cooldownAfterLoss: params?.cooldownAfterLoss ?? DEFAULT_RISK_PARAMS.cooldownAfterLoss,
    };
  }

  /**
   * Check if a new position can be opened
   */
  canOpenPosition(
    performance: BotPerformance,
    positionSize: Decimal,
    totalCapital: Decimal
  ): boolean {
    this.resetTrackingIfNeeded();

    // Check position size limit
    const positionPercent = positionSize.div(totalCapital).mul(100).toNumber();
    if (positionPercent > this.params.maxPositionPercent) {
      this.logger.warn(
        `Position size ${positionPercent.toFixed(2)}% exceeds max ${this.params.maxPositionPercent}%`
      );
      return false;
    }

    // Check total exposure
    const currentExposure = this.calculateCurrentExposure(performance, totalCapital);
    const newExposure = currentExposure + positionPercent;
    if (newExposure > this.params.maxTotalExposure) {
      this.logger.warn(
        `Total exposure ${newExposure.toFixed(2)}% would exceed max ${this.params.maxTotalExposure}%`
      );
      return false;
    }

    // Check daily loss limit
    if (this.dailyLossTracking.abs().gt(this.params.dailyLossLimit.mul(totalCapital).div(100))) {
      this.logger.warn("Daily loss limit reached");
      return false;
    }

    // Check weekly loss limit
    if (this.weeklyLossTracking.abs().gt(this.params.weeklyLossLimit.mul(totalCapital).div(100))) {
      this.logger.warn("Weekly loss limit reached");
      return false;
    }

    // Check max drawdown
    if (performance.maxDrawdown > this.params.maxDrawdownPercent) {
      this.logger.warn(
        `Max drawdown ${performance.maxDrawdown.toFixed(2)}% exceeds limit ${this.params.maxDrawdownPercent}%`
      );
      return false;
    }

    return true;
  }

  /**
   * Calculate current exposure as percentage
   */
  private calculateCurrentExposure(performance: BotPerformance, totalCapital: Decimal): number {
    if (totalCapital.isZero()) return 0;
    return performance.unrealizedPnL.abs().div(totalCapital).mul(100).toNumber();
  }

  /**
   * Record a loss for tracking
   */
  recordLoss(amount: Decimal): void {
    this.resetTrackingIfNeeded();
    this.dailyLossTracking = this.dailyLossTracking.sub(amount.abs());
    this.weeklyLossTracking = this.weeklyLossTracking.sub(amount.abs());
    this.logger.info(`Recorded loss: $${amount.toFixed(2)}`);
  }

  /**
   * Record a profit for tracking
   */
  recordProfit(amount: Decimal): void {
    this.resetTrackingIfNeeded();
    this.dailyLossTracking = this.dailyLossTracking.add(amount);
    this.weeklyLossTracking = this.weeklyLossTracking.add(amount);
  }

  /**
   * Reset tracking counters if period has passed
   */
  private resetTrackingIfNeeded(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    if (now - this.lastDailyReset > dayMs) {
      this.dailyLossTracking = new Decimal(0);
      this.lastDailyReset = now;
    }

    if (now - this.lastWeeklyReset > weekMs) {
      this.weeklyLossTracking = new Decimal(0);
      this.lastWeeklyReset = now;
    }
  }

  /**
   * Calculate optimal position size based on risk
   */
  calculatePositionSize(
    totalCapital: Decimal,
    riskPercent: number = 1
  ): Decimal {
    const maxPosition = totalCapital.mul(this.params.maxPositionPercent).div(100);
    const riskBasedPosition = totalCapital.mul(riskPercent).div(100);
    return Decimal.min(maxPosition, riskBasedPosition);
  }

  /**
   * Get stop loss price for a position
   */
  getStopLossPrice(entryPrice: Decimal, side: "long" | "short"): Decimal {
    const stopPercent = this.params.stopLossPercent / 100;
    return side === "long"
      ? entryPrice.mul(1 - stopPercent)
      : entryPrice.mul(1 + stopPercent);
  }

  /**
   * Check if bot should be paused due to losses
   */
  shouldPauseTrading(performance: BotPerformance): boolean {
    return performance.maxDrawdown > this.params.maxDrawdownPercent;
  }

  /**
   * Get parameters
   */
  getParams(): RiskParameters {
    return { ...this.params };
  }

  /**
   * Update parameters
   */
  updateParams(params: Partial<RiskParameters>): void {
    this.params = { ...this.params, ...params };
    this.logger.info("Risk parameters updated");
  }
}
