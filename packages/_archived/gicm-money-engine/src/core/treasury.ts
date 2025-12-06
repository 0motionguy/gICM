/**
 * Treasury Management
 *
 * Manages all gICM funds, allocations, and rebalancing.
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";
import type { Treasury, TokenBalance } from "./types.js";
import { USDC_MINT, DEFAULT_ALLOCATIONS, DEFAULT_THRESHOLDS } from "./constants.js";
import { Logger } from "../utils/logger.js";

export class TreasuryManager {
  private connection: Connection;
  private treasury: Treasury;
  private logger: Logger;
  private keypair: Keypair;

  constructor(connection: Connection, keypair: Keypair) {
    this.connection = connection;
    this.keypair = keypair;
    this.logger = new Logger("Treasury");
    this.treasury = this.initializeTreasury();
  }

  private initializeTreasury(): Treasury {
    return {
      balances: {
        sol: new Decimal(0),
        usdc: new Decimal(0),
        tokens: new Map(),
      },
      allocations: {
        trading: new Decimal(DEFAULT_ALLOCATIONS.trading),
        operations: new Decimal(DEFAULT_ALLOCATIONS.operations),
        growth: new Decimal(DEFAULT_ALLOCATIONS.growth),
        reserve: new Decimal(DEFAULT_ALLOCATIONS.reserve),
      },
      wallets: {
        main: this.keypair.publicKey.toBase58(),
        trading: this.keypair.publicKey.toBase58(),
        operations: this.keypair.publicKey.toBase58(),
        cold: "",
      },
      thresholds: {
        minOperatingBalance: new Decimal(DEFAULT_THRESHOLDS.minOperatingBalance),
        maxTradingAllocation: new Decimal(DEFAULT_THRESHOLDS.maxTradingAllocation),
        rebalanceThreshold: new Decimal(DEFAULT_THRESHOLDS.rebalanceThreshold),
      },
      lastUpdated: Date.now(),
      lastRebalance: Date.now(),
    };
  }

  /**
   * Refresh all balances
   */
  async refreshBalances(): Promise<void> {
    this.logger.info("Refreshing treasury balances...");

    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(this.keypair.publicKey);
      this.treasury.balances.sol = new Decimal(solBalance).div(LAMPORTS_PER_SOL);

      // Get USDC balance
      try {
        const usdcAta = await getAssociatedTokenAddress(USDC_MINT, this.keypair.publicKey);
        const usdcAccount = await getAccount(this.connection, usdcAta);
        this.treasury.balances.usdc = new Decimal(usdcAccount.amount.toString()).div(1e6);
      } catch {
        this.treasury.balances.usdc = new Decimal(0);
      }

      this.treasury.lastUpdated = Date.now();

      this.logger.info(
        `Treasury: ${this.treasury.balances.sol.toFixed(4)} SOL, $${this.treasury.balances.usdc.toFixed(2)} USDC`
      );
    } catch (error) {
      this.logger.error(`Failed to refresh balances: ${error}`);
      throw error;
    }
  }

  /**
   * Get total treasury value in USD
   */
  async getTotalValueUsd(solPrice: number): Promise<Decimal> {
    await this.refreshBalances();

    const solValue = this.treasury.balances.sol.mul(solPrice);
    const usdcValue = this.treasury.balances.usdc;

    let tokenValue = new Decimal(0);
    for (const [, token] of this.treasury.balances.tokens) {
      tokenValue = tokenValue.add(token.valueUsd);
    }

    return solValue.add(usdcValue).add(tokenValue);
  }

  /**
   * Get allocation amounts
   */
  async getAllocations(solPrice: number): Promise<{
    trading: Decimal;
    operations: Decimal;
    growth: Decimal;
    reserve: Decimal;
  }> {
    const total = await this.getTotalValueUsd(solPrice);

    return {
      trading: total.mul(this.treasury.allocations.trading),
      operations: total.mul(this.treasury.allocations.operations),
      growth: total.mul(this.treasury.allocations.growth),
      reserve: total.mul(this.treasury.allocations.reserve),
    };
  }

  /**
   * Check if rebalance needed
   */
  async needsRebalance(solPrice: number): Promise<boolean> {
    const total = await this.getTotalValueUsd(solPrice);
    const allocations = await this.getAllocations(solPrice);
    const threshold = this.treasury.thresholds.rebalanceThreshold;

    const tradingTarget = total.mul(this.treasury.allocations.trading);
    const tradingActual = allocations.trading;

    if (tradingTarget.isZero()) return false;

    const diff = tradingActual.sub(tradingTarget).abs().div(tradingTarget);
    return diff.gt(threshold);
  }

  /**
   * Get available for trading
   */
  async getAvailableForTrading(solPrice: number): Promise<Decimal> {
    const allocations = await this.getAllocations(solPrice);
    return allocations.trading;
  }

  /**
   * Get runway in months
   */
  async getRunwayMonths(monthlyExpenses: Decimal, solPrice: number): Promise<number> {
    const total = await this.getTotalValueUsd(solPrice);
    if (monthlyExpenses.isZero()) return Infinity;
    return total.div(monthlyExpenses).toNumber();
  }

  /**
   * Check if self-sustaining
   */
  isSelfSustaining(monthlyRevenue: Decimal, monthlyExpenses: Decimal): boolean {
    return monthlyRevenue.gte(monthlyExpenses);
  }

  /**
   * Get treasury status
   */
  async getStatus(solPrice: number): Promise<{
    totalValueUsd: Decimal;
    balances: { sol: Decimal; usdc: Decimal };
    allocations: { trading: Decimal; operations: Decimal; growth: Decimal; reserve: Decimal };
    health: { runway: number; needsRebalance: boolean };
  }> {
    await this.refreshBalances();

    return {
      totalValueUsd: await this.getTotalValueUsd(solPrice),
      balances: {
        sol: this.treasury.balances.sol,
        usdc: this.treasury.balances.usdc,
      },
      allocations: await this.getAllocations(solPrice),
      health: {
        runway: await this.getRunwayMonths(new Decimal(500), solPrice),
        needsRebalance: await this.needsRebalance(solPrice),
      },
    };
  }

  /**
   * Export state
   */
  getState(): Treasury {
    return { ...this.treasury };
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.keypair.publicKey.toBase58();
  }
}
