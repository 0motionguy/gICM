import type { Trade, PerformanceMetrics } from "../core/types.js";

export interface MonteCarloResult {
  simulations: number;
  percentiles: {
    p5: SimulationOutcome;
    p25: SimulationOutcome;
    p50: SimulationOutcome;
    p75: SimulationOutcome;
    p95: SimulationOutcome;
  };
  probability: {
    profit: number;
    loss: number;
    doubling: number;
    ruin: number;
  };
  distribution: SimulationOutcome[];
}

export interface SimulationOutcome {
  finalEquity: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export class MonteCarloSimulator {
  private initialCapital: number;
  private riskFreeRate: number;

  constructor(config: { initialCapital: number; riskFreeRate?: number }) {
    this.initialCapital = config.initialCapital;
    this.riskFreeRate = config.riskFreeRate ?? 0.05;
  }

  // Run Monte Carlo simulation using trade resampling
  runTradeResampling(
    trades: Trade[],
    simulations: number,
    tradesPerSimulation: number
  ): MonteCarloResult {
    const closedTrades = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

    if (closedTrades.length === 0) {
      return this.emptyResult();
    }

    const outcomes: SimulationOutcome[] = [];

    for (let i = 0; i < simulations; i++) {
      const outcome = this.runSingleSimulation(closedTrades, tradesPerSimulation);
      outcomes.push(outcome);
    }

    // Sort by final equity
    outcomes.sort((a, b) => a.finalEquity - b.finalEquity);

    return {
      simulations,
      percentiles: {
        p5: outcomes[Math.floor(simulations * 0.05)]!,
        p25: outcomes[Math.floor(simulations * 0.25)]!,
        p50: outcomes[Math.floor(simulations * 0.5)]!,
        p75: outcomes[Math.floor(simulations * 0.75)]!,
        p95: outcomes[Math.floor(simulations * 0.95)]!,
      },
      probability: this.calculateProbabilities(outcomes),
      distribution: outcomes,
    };
  }

  private runSingleSimulation(
    trades: Trade[],
    numTrades: number
  ): SimulationOutcome {
    let equity = this.initialCapital;
    let peak = equity;
    let maxDrawdown = 0;
    const equityCurve: number[] = [equity];

    // Randomly sample trades with replacement
    for (let i = 0; i < numTrades; i++) {
      const randomIndex = Math.floor(Math.random() * trades.length);
      const trade = trades[randomIndex]!;

      // Scale PnL relative to initial position
      const pnlPercent = trade.pnlPercent ?? 0;
      const pnl = equity * (pnlPercent / 100);

      equity += pnl;
      equityCurve.push(equity);

      if (equity > peak) {
        peak = equity;
      }

      const drawdown = (peak - equity) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      // Stop if ruined
      if (equity <= 0) {
        equity = 0;
        break;
      }
    }

    const returns = this.calculateReturns(equityCurve);
    const sharpeRatio = this.calculateSharpe(returns);

    return {
      finalEquity: equity,
      totalReturn: (equity - this.initialCapital) / this.initialCapital,
      maxDrawdown,
      sharpeRatio,
    };
  }

  private calculateReturns(equityCurve: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1]!;
      if (prev > 0) {
        returns.push((equityCurve[i]! - prev) / prev);
      }
    }
    return returns;
  }

  private calculateSharpe(returns: number[]): number {
    if (returns.length < 2) return 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualize assuming daily returns
    const annualizedReturn = mean * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);

    return (annualizedReturn - this.riskFreeRate) / annualizedStdDev;
  }

  private calculateProbabilities(outcomes: SimulationOutcome[]): {
    profit: number;
    loss: number;
    doubling: number;
    ruin: number;
  } {
    const n = outcomes.length;
    const profitCount = outcomes.filter((o) => o.totalReturn > 0).length;
    const doublingCount = outcomes.filter((o) => o.finalEquity >= this.initialCapital * 2).length;
    const ruinCount = outcomes.filter((o) => o.finalEquity <= this.initialCapital * 0.1).length;

    return {
      profit: profitCount / n,
      loss: (n - profitCount) / n,
      doubling: doublingCount / n,
      ruin: ruinCount / n,
    };
  }

  // Run Monte Carlo using return distribution
  runReturnSimulation(
    returns: number[],
    simulations: number,
    periodsPerSimulation: number
  ): MonteCarloResult {
    if (returns.length === 0) {
      return this.emptyResult();
    }

    const outcomes: SimulationOutcome[] = [];

    for (let i = 0; i < simulations; i++) {
      let equity = this.initialCapital;
      let peak = equity;
      let maxDrawdown = 0;
      const equityCurve: number[] = [equity];

      for (let j = 0; j < periodsPerSimulation; j++) {
        const randomReturn = returns[Math.floor(Math.random() * returns.length)]!;
        equity *= 1 + randomReturn;
        equityCurve.push(equity);

        if (equity > peak) {
          peak = equity;
        }

        const drawdown = (peak - equity) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }

      const simReturns = this.calculateReturns(equityCurve);
      const sharpeRatio = this.calculateSharpe(simReturns);

      outcomes.push({
        finalEquity: equity,
        totalReturn: (equity - this.initialCapital) / this.initialCapital,
        maxDrawdown,
        sharpeRatio,
      });
    }

    outcomes.sort((a, b) => a.finalEquity - b.finalEquity);

    return {
      simulations,
      percentiles: {
        p5: outcomes[Math.floor(simulations * 0.05)]!,
        p25: outcomes[Math.floor(simulations * 0.25)]!,
        p50: outcomes[Math.floor(simulations * 0.5)]!,
        p75: outcomes[Math.floor(simulations * 0.75)]!,
        p95: outcomes[Math.floor(simulations * 0.95)]!,
      },
      probability: this.calculateProbabilities(outcomes),
      distribution: outcomes,
    };
  }

  private emptyResult(): MonteCarloResult {
    const emptyOutcome: SimulationOutcome = {
      finalEquity: this.initialCapital,
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    };

    return {
      simulations: 0,
      percentiles: {
        p5: emptyOutcome,
        p25: emptyOutcome,
        p50: emptyOutcome,
        p75: emptyOutcome,
        p95: emptyOutcome,
      },
      probability: {
        profit: 0,
        loss: 0,
        doubling: 0,
        ruin: 0,
      },
      distribution: [],
    };
  }
}
