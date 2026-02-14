/**
 * PositionManager — tracks open/closed positions and calculates P&L.
 */

import { randomUUID } from "crypto";
import type {
  Position,
  TradeRecord,
  PerformanceMetrics,
  StrategyPerformance,
  StrategyName,
  Signal,
  Side,
  Outcome,
} from "./types.js";

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private trades: TradeRecord[] = [];

  /**
   * Open a new position based on a signal.
   */
  openPosition(signal: Signal, size: number, side: Side = "buy"): Position {
    const position: Position = {
      id: randomUUID(),
      marketId: signal.marketId,
      platform: signal.platform,
      outcome: signal.outcome,
      side,
      size,
      entryPrice: signal.currentPrice,
      currentPrice: signal.currentPrice,
      unrealizedPnL: 0,
      realizedPnL: 0,
      stopLoss: undefined,
      takeProfit: undefined,
      status: "open",
      strategy: signal.strategy,
      openedAt: new Date().toISOString(),
    };

    this.positions.set(position.id, position);

    // Record the opening trade
    this.trades.push({
      id: randomUUID(),
      positionId: position.id,
      marketId: signal.marketId,
      platform: signal.platform,
      outcome: signal.outcome,
      side,
      size,
      price: signal.currentPrice,
      value: size * signal.currentPrice,
      fee: 0,
      timestamp: new Date().toISOString(),
    });

    return position;
  }

  /**
   * Close a position at the given price.
   */
  closePosition(positionId: string, exitPrice: number): Position | null {
    const position = this.positions.get(positionId);
    if (!position || position.status !== "open") return null;

    const pnl = this.calculatePnL(position, exitPrice);

    position.currentPrice = exitPrice;
    position.realizedPnL = pnl;
    position.unrealizedPnL = 0;
    position.status = "closed";
    position.closedAt = new Date().toISOString();

    // Record closing trade
    this.trades.push({
      id: randomUUID(),
      positionId: position.id,
      marketId: position.marketId,
      platform: position.platform,
      outcome: position.outcome,
      side: position.side === "buy" ? "sell" : "buy",
      size: position.size,
      price: exitPrice,
      value: position.size * exitPrice,
      fee: 0,
      timestamp: new Date().toISOString(),
    });

    return position;
  }

  /**
   * Update current prices for all open positions.
   */
  updatePrices(marketPrices: Map<string, number>): void {
    for (const position of this.positions.values()) {
      if (position.status !== "open") continue;
      const newPrice = marketPrices.get(position.marketId);
      if (newPrice !== undefined) {
        position.currentPrice = newPrice;
        position.unrealizedPnL = this.calculatePnL(position, newPrice);
      }
    }
  }

  /**
   * Check stop-loss and take-profit triggers.
   */
  checkTriggers(): Position[] {
    const triggered: Position[] = [];

    for (const position of this.positions.values()) {
      if (position.status !== "open") continue;

      if (
        position.stopLoss !== undefined &&
        position.side === "buy" &&
        position.currentPrice <= position.stopLoss
      ) {
        const closed = this.closePosition(position.id, position.currentPrice);
        if (closed) triggered.push(closed);
      } else if (
        position.takeProfit !== undefined &&
        position.side === "buy" &&
        position.currentPrice >= position.takeProfit
      ) {
        const closed = this.closePosition(position.id, position.currentPrice);
        if (closed) triggered.push(closed);
      }
    }

    return triggered;
  }

  /**
   * Set stop-loss and take-profit for a position.
   */
  setLimits(positionId: string, stopLoss?: number, takeProfit?: number): void {
    const position = this.positions.get(positionId);
    if (!position) return;
    if (stopLoss !== undefined) position.stopLoss = stopLoss;
    if (takeProfit !== undefined) position.takeProfit = takeProfit;
  }

  /**
   * Get all open positions.
   */
  getOpenPositions(): Position[] {
    return Array.from(this.positions.values()).filter(
      (p) => p.status === "open"
    );
  }

  /**
   * Get all closed positions.
   */
  getClosedPositions(): Position[] {
    return Array.from(this.positions.values()).filter(
      (p) => p.status === "closed"
    );
  }

  /**
   * Get position by ID.
   */
  getPosition(id: string): Position | undefined {
    return this.positions.get(id);
  }

  /**
   * Get all trade records.
   */
  getTradeHistory(): TradeRecord[] {
    return [...this.trades];
  }

  /**
   * Calculate full performance metrics.
   */
  getPerformance(): PerformanceMetrics {
    const closed = this.getClosedPositions();
    const open = this.getOpenPositions();

    const wins = closed.filter((p) => p.realizedPnL > 0);
    const losses = closed.filter((p) => p.realizedPnL <= 0);

    const realizedPnL = closed.reduce((s, p) => s + p.realizedPnL, 0);
    const unrealizedPnL = open.reduce((s, p) => s + p.unrealizedPnL, 0);

    const returns = closed.map((p) =>
      p.entryPrice > 0 ? p.realizedPnL / (p.size * p.entryPrice) : 0
    );
    const avgReturn =
      returns.length > 0
        ? returns.reduce((s, r) => s + r, 0) / returns.length
        : 0;

    const grossWins = wins.reduce((s, p) => s + p.realizedPnL, 0);
    const grossLosses = Math.abs(losses.reduce((s, p) => s + p.realizedPnL, 0));

    // Per-strategy breakdown
    const byStrategy = new Map<StrategyName, StrategyPerformance>();
    for (const pos of closed) {
      const existing = byStrategy.get(pos.strategy) ?? {
        strategy: pos.strategy,
        trades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnL: 0,
        avgReturn: 0,
      };
      existing.trades++;
      if (pos.realizedPnL > 0) existing.wins++;
      else existing.losses++;
      existing.totalPnL += pos.realizedPnL;
      existing.winRate =
        existing.trades > 0 ? existing.wins / existing.trades : 0;
      existing.avgReturn =
        existing.trades > 0 ? existing.totalPnL / existing.trades : 0;
      byStrategy.set(pos.strategy, existing);
    }

    return {
      totalTrades: closed.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: closed.length > 0 ? wins.length / closed.length : 0,
      totalPnL: realizedPnL + unrealizedPnL,
      realizedPnL,
      unrealizedPnL,
      avgReturn,
      bestTrade: returns.length > 0 ? Math.max(...returns) : 0,
      worstTrade: returns.length > 0 ? Math.min(...returns) : 0,
      sharpeRatio: this.calculateSharpe(returns),
      maxDrawdown: this.calculateMaxDrawdown(closed),
      profitFactor:
        grossLosses > 0
          ? grossWins / grossLosses
          : grossWins > 0
            ? Infinity
            : 0,
      byStrategy,
    };
  }

  /**
   * Get total exposure (sum of open position values).
   */
  getTotalExposure(): number {
    return this.getOpenPositions().reduce(
      (sum, p) => sum + p.size * p.currentPrice,
      0
    );
  }

  /**
   * Get daily realized P&L.
   */
  getDailyPnL(): number {
    const today = new Date().toISOString().split("T")[0];
    return this.getClosedPositions()
      .filter((p) => p.closedAt?.startsWith(today))
      .reduce((sum, p) => sum + p.realizedPnL, 0);
  }

  private calculatePnL(position: Position, currentPrice: number): number {
    const diff = currentPrice - position.entryPrice;
    return position.side === "buy"
      ? position.size * diff
      : position.size * -diff;
  }

  private calculateSharpe(returns: number[]): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance =
      returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    const stddev = Math.sqrt(variance);
    return stddev > 0 ? mean / stddev : 0;
  }

  private calculateMaxDrawdown(positions: Position[]): number {
    if (positions.length === 0) return 0;

    let peak = 0;
    let maxDrawdown = 0;
    let cumPnL = 0;

    for (const pos of positions) {
      cumPnL += pos.realizedPnL;
      if (cumPnL > peak) peak = cumPnL;
      const drawdown = peak > 0 ? (peak - cumPnL) / peak : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
  }
}
