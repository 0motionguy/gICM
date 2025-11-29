import type {
  PerformanceMetrics,
  PortfolioSnapshot,
  Trade,
  BacktesterConfig,
} from "../core/types.js";

export class MetricsCalculator {
  private config: BacktesterConfig;

  constructor(config: BacktesterConfig) {
    this.config = config;
  }

  calculate(
    snapshots: PortfolioSnapshot[],
    trades: Trade[],
    startDate: Date,
    endDate: Date
  ): PerformanceMetrics {
    const closedTrades = trades.filter((t) => t.status === "closed");

    // Returns
    const returns = this.calculateReturns(snapshots);
    const totalReturn = this.calculateTotalReturn(snapshots);
    const annualizedReturn = this.calculateAnnualizedReturn(
      totalReturn,
      startDate,
      endDate
    );
    const cagr = this.calculateCAGR(snapshots, startDate, endDate);

    // Risk
    const volatility = this.calculateVolatility(returns);
    const { maxDrawdown, maxDrawdownDuration } = this.calculateMaxDrawdown(snapshots);
    const calmarRatio = this.calculateCalmarRatio(annualizedReturn, maxDrawdown);

    // Risk-adjusted
    const sharpeRatio = this.calculateSharpeRatio(returns, volatility);
    const sortinoRatio = this.calculateSortinoRatio(returns);

    // Trading metrics
    const tradingMetrics = this.calculateTradingMetrics(closedTrades);

    // Exposure
    const exposureMetrics = this.calculateExposureMetrics(snapshots);

    return {
      totalReturn,
      annualizedReturn,
      cagr,
      volatility,
      maxDrawdown,
      maxDrawdownDuration,
      calmarRatio,
      sharpeRatio,
      sortinoRatio,
      ...tradingMetrics,
      ...exposureMetrics,
    };
  }

  private calculateReturns(snapshots: PortfolioSnapshot[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1]!.equity;
      const curr = snapshots[i]!.equity;
      returns.push((curr - prev) / prev);
    }
    return returns;
  }

  private calculateTotalReturn(snapshots: PortfolioSnapshot[]): number {
    if (snapshots.length < 2) return 0;
    const first = snapshots[0]!.equity;
    const last = snapshots[snapshots.length - 1]!.equity;
    return (last - first) / first;
  }

  private calculateAnnualizedReturn(
    totalReturn: number,
    startDate: Date,
    endDate: Date
  ): number {
    const years =
      (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years === 0) return 0;
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private calculateCAGR(
    snapshots: PortfolioSnapshot[],
    startDate: Date,
    endDate: Date
  ): number {
    if (snapshots.length < 2) return 0;
    const first = snapshots[0]!.equity;
    const last = snapshots[snapshots.length - 1]!.equity;
    const years =
      (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years === 0) return 0;
    return Math.pow(last / first, 1 / years) - 1;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      (returns.length - 1);
    // Annualize assuming daily returns
    return Math.sqrt(variance) * Math.sqrt(252);
  }

  private calculateMaxDrawdown(
    snapshots: PortfolioSnapshot[]
  ): { maxDrawdown: number; maxDrawdownDuration: number } {
    let maxDrawdown = 0;
    let maxDrawdownDuration = 0;
    let peak = snapshots[0]?.equity ?? 0;
    let drawdownStart: Date | null = null;
    let currentDuration = 0;

    for (const snapshot of snapshots) {
      if (snapshot.equity > peak) {
        peak = snapshot.equity;
        if (drawdownStart) {
          const duration =
            (snapshot.timestamp.getTime() - drawdownStart.getTime()) /
            (24 * 60 * 60 * 1000);
          maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
          drawdownStart = null;
        }
        currentDuration = 0;
      } else {
        const drawdown = (peak - snapshot.equity) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
        if (!drawdownStart) {
          drawdownStart = snapshot.timestamp;
        }
      }
    }

    return { maxDrawdown, maxDrawdownDuration };
  }

  private calculateSharpeRatio(returns: number[], volatility: number): number {
    if (volatility === 0 || returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const annualizedReturn = avgReturn * 252;
    return (annualizedReturn - this.config.riskFreeRate) / volatility;
  }

  private calculateSortinoRatio(returns: number[]): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const negativeReturns = returns.filter((r) => r < 0);

    if (negativeReturns.length === 0) return Infinity;

    const downsideVariance =
      negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);

    if (downsideDeviation === 0) return Infinity;

    const annualizedReturn = avgReturn * 252;
    return (annualizedReturn - this.config.riskFreeRate) / downsideDeviation;
  }

  private calculateCalmarRatio(
    annualizedReturn: number,
    maxDrawdown: number
  ): number {
    if (maxDrawdown === 0) return Infinity;
    return annualizedReturn / maxDrawdown;
  }

  private calculateTradingMetrics(trades: Trade[]): {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    avgTradeDuration: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
  } {
    const winners = trades.filter((t) => (t.pnl ?? 0) > 0);
    const losers = trades.filter((t) => (t.pnl ?? 0) < 0);

    const avgWin =
      winners.length > 0
        ? winners.reduce((sum, t) => sum + (t.pnl ?? 0), 0) / winners.length
        : 0;

    const avgLoss =
      losers.length > 0
        ? Math.abs(losers.reduce((sum, t) => sum + (t.pnl ?? 0), 0)) / losers.length
        : 0;

    const totalWins = winners.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : Infinity;

    // Average trade duration
    const durations = trades
      .filter((t) => t.exitTime)
      .map((t) => (t.exitTime!.getTime() - t.entryTime.getTime()) / (1000 * 60 * 60));
    const avgTradeDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    // Consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    for (const trade of trades) {
      if ((trade.pnl ?? 0) > 0) {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      } else if ((trade.pnl ?? 0) < 0) {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      }
    }

    return {
      totalTrades: trades.length,
      winningTrades: winners.length,
      losingTrades: losers.length,
      winRate: trades.length > 0 ? winners.length / trades.length : 0,
      avgWin,
      avgLoss,
      profitFactor,
      avgTradeDuration,
      maxConsecutiveWins,
      maxConsecutiveLosses,
    };
  }

  private calculateExposureMetrics(snapshots: PortfolioSnapshot[]): {
    avgExposure: number;
    maxExposure: number;
    avgLeverage: number;
  } {
    if (snapshots.length === 0) {
      return { avgExposure: 0, maxExposure: 0, avgLeverage: 0 };
    }

    const exposures = snapshots.map((s) => s.positionsValue / s.equity);
    const avgExposure = exposures.reduce((a, b) => a + b, 0) / exposures.length;
    const maxExposure = Math.max(...exposures);

    return {
      avgExposure,
      maxExposure,
      avgLeverage: avgExposure, // For non-margin, exposure = leverage
    };
  }
}
