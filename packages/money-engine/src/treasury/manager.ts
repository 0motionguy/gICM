/**
 * Treasury Manager
 *
 * Manages all gICM funds, allocations, and rebalancing.
 */

import Decimal from "decimal.js";
import type {
  Treasury,
  TreasuryStatus,
  TokenBalance,
} from "../core/types.js";
import { Logger } from "../utils/logger.js";

const DEFAULT_ALLOCATIONS = {
  trading: new Decimal(0.4),      // 40%
  operations: new Decimal(0.3),   // 30%
  growth: new Decimal(0.2),       // 20%
  reserve: new Decimal(0.1),      // 10%
};

const DEFAULT_THRESHOLDS = {
  minOperatingBalance: new Decimal(1000),   // $1000 minimum
  maxTradingAllocation: new Decimal(0.5),   // Max 50% in trading
  rebalanceThreshold: new Decimal(0.1),     // Rebalance if 10% off target
};

export interface TreasuryManagerConfig {
  mainWallet: string;
  tradingWallet?: string;
  operationsWallet?: string;
  coldWallet?: string;
  allocations?: Partial<typeof DEFAULT_ALLOCATIONS>;
  thresholds?: Partial<typeof DEFAULT_THRESHOLDS>;
}

export class TreasuryManager {
  private treasury: Treasury;
  private logger: Logger;
  private solPrice: number = 0;

  constructor(config: TreasuryManagerConfig) {
    this.logger = new Logger("Treasury");
    this.treasury = this.initializeTreasury(config);
  }

  private initializeTreasury(config: TreasuryManagerConfig): Treasury {
    return {
      balances: {
        sol: new Decimal(0),
        usdc: new Decimal(0),
        tokens: new Map(),
      },
      allocations: {
        trading: config.allocations?.trading ?? DEFAULT_ALLOCATIONS.trading,
        operations: config.allocations?.operations ?? DEFAULT_ALLOCATIONS.operations,
        growth: config.allocations?.growth ?? DEFAULT_ALLOCATIONS.growth,
        reserve: config.allocations?.reserve ?? DEFAULT_ALLOCATIONS.reserve,
      },
      wallets: {
        main: config.mainWallet,
        trading: config.tradingWallet ?? config.mainWallet,
        operations: config.operationsWallet ?? config.mainWallet,
        cold: config.coldWallet ?? "",
      },
      thresholds: {
        minOperatingBalance: config.thresholds?.minOperatingBalance ?? DEFAULT_THRESHOLDS.minOperatingBalance,
        maxTradingAllocation: config.thresholds?.maxTradingAllocation ?? DEFAULT_THRESHOLDS.maxTradingAllocation,
        rebalanceThreshold: config.thresholds?.rebalanceThreshold ?? DEFAULT_THRESHOLDS.rebalanceThreshold,
      },
      lastUpdated: Date.now(),
      lastRebalance: Date.now(),
    };
  }

  /**
   * Set SOL price for USD calculations
   */
  setSolPrice(price: number): void {
    this.solPrice = price;
  }

  /**
   * Update balances from external source
   */
  updateBalances(balances: {
    sol: number;
    usdc: number;
    tokens?: Array<{ mint: string; symbol: string; balance: number; price: number }>;
  }): void {
    this.treasury.balances.sol = new Decimal(balances.sol);
    this.treasury.balances.usdc = new Decimal(balances.usdc);

    if (balances.tokens) {
      this.treasury.balances.tokens.clear();
      for (const token of balances.tokens) {
        const balance = new Decimal(token.balance);
        const price = new Decimal(token.price);
        this.treasury.balances.tokens.set(token.mint, {
          mint: token.mint,
          symbol: token.symbol,
          balance,
          price,
          valueUsd: balance.mul(price),
        });
      }
    }

    this.treasury.lastUpdated = Date.now();
    this.logger.info(`Balances updated: ${balances.sol} SOL, $${balances.usdc} USDC`);
  }

  /**
   * Get total treasury value in USD
   */
  getTotalValueUsd(): Decimal {
    const solValue = this.treasury.balances.sol.mul(this.solPrice);
    const usdcValue = this.treasury.balances.usdc;

    let tokenValue = new Decimal(0);
    for (const [_, token] of this.treasury.balances.tokens) {
      tokenValue = tokenValue.add(token.valueUsd);
    }

    return solValue.add(usdcValue).add(tokenValue);
  }

  /**
   * Get allocation amounts in USD
   */
  getAllocations(): {
    trading: Decimal;
    operations: Decimal;
    growth: Decimal;
    reserve: Decimal;
  } {
    const total = this.getTotalValueUsd();

    return {
      trading: total.mul(this.treasury.allocations.trading),
      operations: total.mul(this.treasury.allocations.operations),
      growth: total.mul(this.treasury.allocations.growth),
      reserve: total.mul(this.treasury.allocations.reserve),
    };
  }

  /**
   * Check if rebalance is needed
   */
  needsRebalance(): boolean {
    const total = this.getTotalValueUsd();
    if (total.isZero()) return false;

    const threshold = this.treasury.thresholds.rebalanceThreshold;
    const allocations = this.getAllocations();

    // Check if any allocation is off by more than threshold
    const tradingTarget = total.mul(this.treasury.allocations.trading);
    const tradingDiff = allocations.trading.sub(tradingTarget).abs().div(tradingTarget);

    return tradingDiff.gt(threshold);
  }

  /**
   * Get available amount for trading
   */
  getAvailableForTrading(): Decimal {
    const allocations = this.getAllocations();
    return allocations.trading;
  }

  /**
   * Calculate runway in months
   */
  getRunwayMonths(monthlyExpenses: Decimal): number {
    const total = this.getTotalValueUsd();
    if (monthlyExpenses.isZero()) return Infinity;
    return total.div(monthlyExpenses).toNumber();
  }

  /**
   * Check if revenue covers expenses (self-sustaining)
   */
  isSelfSustaining(monthlyRevenue: Decimal, monthlyExpenses: Decimal): boolean {
    return monthlyRevenue.gte(monthlyExpenses);
  }

  /**
   * Get full treasury status
   */
  getStatus(monthlyExpenses?: Decimal, monthlyRevenue?: Decimal): TreasuryStatus {
    const totalValueUsd = this.getTotalValueUsd();
    const allocations = this.getAllocations();
    const expenses = monthlyExpenses ?? new Decimal(500);
    const revenue = monthlyRevenue ?? new Decimal(0);

    return {
      totalValueUsd,
      balances: {
        sol: this.treasury.balances.sol,
        usdc: this.treasury.balances.usdc,
      },
      allocations,
      health: {
        runway: this.getRunwayMonths(expenses),
        needsRebalance: this.needsRebalance(),
        selfSustaining: this.isSelfSustaining(revenue, expenses),
      },
    };
  }

  /**
   * Get raw treasury state
   */
  getState(): Treasury {
    return { ...this.treasury };
  }

  /**
   * Get wallet addresses
   */
  getWallets(): Treasury["wallets"] {
    return { ...this.treasury.wallets };
  }
}
