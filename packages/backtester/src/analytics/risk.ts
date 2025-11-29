import type { PortfolioSnapshot, Trade } from "../core/types.js";

export interface VaRResult {
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
}

export interface DrawdownAnalysis {
  currentDrawdown: number;
  maxDrawdown: number;
  avgDrawdown: number;
  drawdownPeriods: Array<{
    start: Date;
    end: Date;
    depth: number;
    duration: number;
    recovery: number;
  }>;
}

export class RiskAnalyzer {
  // Value at Risk calculation (Historical method)
  calculateVaR(returns: number[]): VaRResult {
    if (returns.length === 0) {
      return { var95: 0, var99: 0, cvar95: 0, cvar99: 0 };
    }

    const sorted = [...returns].sort((a, b) => a - b);
    const n = sorted.length;

    // VaR at 95% and 99% confidence
    const idx95 = Math.floor(n * 0.05);
    const idx99 = Math.floor(n * 0.01);

    const var95 = -sorted[idx95]!;
    const var99 = -sorted[idx99]!;

    // Conditional VaR (Expected Shortfall)
    const cvar95 = -sorted.slice(0, idx95 + 1).reduce((a, b) => a + b, 0) / (idx95 + 1);
    const cvar99 = -sorted.slice(0, idx99 + 1).reduce((a, b) => a + b, 0) / (idx99 + 1);

    return { var95, var99, cvar95, cvar99 };
  }

  // Parametric VaR (assumes normal distribution)
  calculateParametricVaR(
    mean: number,
    stdDev: number,
    confidence: number
  ): number {
    // Z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.9: 1.28,
      0.95: 1.645,
      0.99: 2.33,
    };

    const z = zScores[confidence] ?? 1.645;
    return mean - z * stdDev;
  }

  // Analyze drawdown periods
  analyzeDrawdowns(snapshots: PortfolioSnapshot[]): DrawdownAnalysis {
    if (snapshots.length === 0) {
      return {
        currentDrawdown: 0,
        maxDrawdown: 0,
        avgDrawdown: 0,
        drawdownPeriods: [],
      };
    }

    const periods: DrawdownAnalysis["drawdownPeriods"] = [];
    let peak = snapshots[0]!.equity;
    let drawdownStart: PortfolioSnapshot | null = null;
    let maxDrawdown = 0;
    let totalDrawdown = 0;
    let drawdownCount = 0;

    for (const snapshot of snapshots) {
      if (snapshot.equity > peak) {
        // New peak - close any open drawdown period
        if (drawdownStart && snapshot.drawdownPercent > 0) {
          const prevSnapshot = snapshots[snapshots.indexOf(snapshot) - 1];
          if (prevSnapshot) {
            periods.push({
              start: drawdownStart.timestamp,
              end: prevSnapshot.timestamp,
              depth: prevSnapshot.drawdownPercent,
              duration:
                (prevSnapshot.timestamp.getTime() - drawdownStart.timestamp.getTime()) /
                (24 * 60 * 60 * 1000),
              recovery:
                (snapshot.timestamp.getTime() - prevSnapshot.timestamp.getTime()) /
                (24 * 60 * 60 * 1000),
            });
          }
        }
        peak = snapshot.equity;
        drawdownStart = null;
      } else if (snapshot.drawdownPercent > 0 && !drawdownStart) {
        // Start of new drawdown
        drawdownStart = snapshot;
      }

      if (snapshot.drawdownPercent > maxDrawdown) {
        maxDrawdown = snapshot.drawdownPercent;
      }

      if (snapshot.drawdownPercent > 0) {
        totalDrawdown += snapshot.drawdownPercent;
        drawdownCount++;
      }
    }

    const currentDrawdown = snapshots[snapshots.length - 1]?.drawdownPercent ?? 0;
    const avgDrawdown = drawdownCount > 0 ? totalDrawdown / drawdownCount : 0;

    return {
      currentDrawdown,
      maxDrawdown,
      avgDrawdown,
      drawdownPeriods: periods,
    };
  }

  // Calculate position concentration risk
  calculateConcentrationRisk(snapshots: PortfolioSnapshot[]): {
    avgConcentration: number;
    maxConcentration: number;
    herfindahlIndex: number;
  } {
    if (snapshots.length === 0) {
      return { avgConcentration: 0, maxConcentration: 0, herfindahlIndex: 0 };
    }

    const concentrations: number[] = [];
    const herfindahlIndices: number[] = [];

    for (const snapshot of snapshots) {
      if (snapshot.positions.length === 0) {
        concentrations.push(0);
        herfindahlIndices.push(0);
        continue;
      }

      const totalValue = snapshot.positions.reduce(
        (sum, p) => sum + p.quantity * p.currentPrice,
        0
      );

      if (totalValue === 0) {
        concentrations.push(0);
        herfindahlIndices.push(0);
        continue;
      }

      const weights = snapshot.positions.map(
        (p) => (p.quantity * p.currentPrice) / totalValue
      );

      concentrations.push(Math.max(...weights));
      herfindahlIndices.push(weights.reduce((sum, w) => sum + w * w, 0));
    }

    return {
      avgConcentration:
        concentrations.reduce((a, b) => a + b, 0) / concentrations.length,
      maxConcentration: Math.max(...concentrations),
      herfindahlIndex:
        herfindahlIndices.reduce((a, b) => a + b, 0) / herfindahlIndices.length,
    };
  }

  // Calculate tail risk metrics
  calculateTailRisk(returns: number[]): {
    skewness: number;
    kurtosis: number;
    tailRatio: number;
  } {
    if (returns.length < 4) {
      return { skewness: 0, kurtosis: 0, tailRatio: 1 };
    }

    const n = returns.length;
    const mean = returns.reduce((a, b) => a + b, 0) / n;

    // Standard deviation
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return { skewness: 0, kurtosis: 0, tailRatio: 1 };
    }

    // Skewness
    const skewness =
      returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n;

    // Kurtosis (excess)
    const kurtosis =
      returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / n - 3;

    // Tail ratio (5th percentile / 95th percentile absolute values)
    const sorted = [...returns].sort((a, b) => a - b);
    const p5 = Math.abs(sorted[Math.floor(n * 0.05)]!);
    const p95 = Math.abs(sorted[Math.floor(n * 0.95)]!);
    const tailRatio = p95 > 0 ? p5 / p95 : 1;

    return { skewness, kurtosis, tailRatio };
  }

  // Calculate trade risk metrics
  calculateTradeRisk(trades: Trade[]): {
    avgRiskRewardRatio: number;
    largestWin: number;
    largestLoss: number;
    avgWinLossRatio: number;
  } {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

    if (closedTrades.length === 0) {
      return {
        avgRiskRewardRatio: 0,
        largestWin: 0,
        largestLoss: 0,
        avgWinLossRatio: 0,
      };
    }

    const pnls = closedTrades.map((t) => t.pnl!);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);

    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses) : 0;

    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss =
      losses.length > 0
        ? Math.abs(losses.reduce((a, b) => a + b, 0)) / losses.length
        : 0;

    const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : Infinity;

    // Average risk/reward ratio based on actual trades
    const avgRiskRewardRatio = avgWinLossRatio;

    return {
      avgRiskRewardRatio,
      largestWin,
      largestLoss,
      avgWinLossRatio,
    };
  }
}
