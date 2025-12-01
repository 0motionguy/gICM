#!/usr/bin/env npx tsx
/**
 * Pump.fun Sniper Bot
 * OPUS67 BUILD Mode - Quick Prototype
 *
 * Usage:
 *   npx tsx index.ts           # Start sniper
 *   npx tsx index.ts --dry-run # Dry run mode (default)
 *   npx tsx index.ts --live    # Live trading (careful!)
 */

import { PumpDetector, PumpAPIDetector, TokenLaunch } from "./detector.js";
import { JupiterExecutor, SwapResult } from "./executor.js";
import { CONFIG } from "./config.js";

interface SniperStats {
  started: number;
  tokensDetected: number;
  tokensFiltered: number;
  tradesExecuted: number;
  tradesSuccessful: number;
  totalSpentSol: number;
  dailyPnL: number;
}

class PumpSniper {
  private detector: PumpAPIDetector;
  private executor: JupiterExecutor;
  private stats: SniperStats;
  private running = false;

  constructor() {
    this.detector = new PumpAPIDetector();
    this.executor = new JupiterExecutor();
    this.stats = {
      started: Date.now(),
      tokensDetected: 0,
      tokensFiltered: 0,
      tradesExecuted: 0,
      tradesSuccessful: 0,
      totalSpentSol: 0,
      dailyPnL: 0,
    };
  }

  async start(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("  PUMP.FUN SNIPER - OPUS67 BUILD MODE");
    console.log("=".repeat(60));
    console.log(`  Mode: ${CONFIG.DRY_RUN ? "DRY RUN (safe)" : "LIVE TRADING"}`);
    console.log(`  Buy Amount: ${CONFIG.BUY_AMOUNT_SOL} SOL`);
    console.log(`  Slippage: ${CONFIG.SLIPPAGE_BPS / 100}%`);
    console.log(`  Max Market Cap: $${CONFIG.MAX_MARKET_CAP.toLocaleString()}`);
    console.log(`  Max Daily Trades: ${CONFIG.MAX_DAILY_TRADES}`);
    console.log("=".repeat(60) + "\n");

    // Check wallet balance
    const balance = await this.executor.getBalance();
    const wallet = this.executor.getWalletAddress();

    if (wallet) {
      console.log(`[SNIPER] Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-4)}`);
      console.log(`[SNIPER] Balance: ${balance.toFixed(4)} SOL\n`);
    } else {
      console.log("[SNIPER] No wallet configured - running in monitor mode\n");
    }

    this.running = true;

    // Listen for new tokens
    this.detector.on("launch", (token) => this.handleLaunch(token));

    // Start detector
    await this.detector.start();

    console.log("[SNIPER] Monitoring for new tokens...\n");

    // Status updates
    setInterval(() => this.printStatus(), 60000);

    // Handle shutdown
    process.on("SIGINT", () => this.stop());
    process.on("SIGTERM", () => this.stop());
  }

  private async handleLaunch(token: TokenLaunch): Promise<void> {
    this.stats.tokensDetected++;

    console.log("\n" + "-".repeat(50));
    console.log(`[NEW TOKEN] ${token.symbol || "???"} - ${token.name || "Unknown"}`);
    console.log(`  Mint: ${token.mint}`);
    console.log(`  Creator: ${token.creator.slice(0, 8)}...`);
    console.log(`  Liquidity: ${token.initialLiquidity} SOL`);
    console.log("-".repeat(50));

    // Apply filters
    const passesFilters = this.applyFilters(token);
    if (!passesFilters) {
      this.stats.tokensFiltered++;
      return;
    }

    // Check daily limits
    if (this.stats.tradesExecuted >= CONFIG.MAX_DAILY_TRADES) {
      console.log("[SNIPER] Daily trade limit reached - skipping");
      return;
    }

    if (Math.abs(this.stats.dailyPnL) >= CONFIG.MAX_DAILY_LOSS_SOL) {
      console.log("[SNIPER] Daily loss limit reached - skipping");
      return;
    }

    // Execute snipe
    console.log(`[SNIPER] Sniping ${token.symbol}...`);
    const result = await this.executor.executeSwap(token.mint, CONFIG.BUY_AMOUNT_SOL);

    this.stats.tradesExecuted++;
    if (result.success) {
      this.stats.tradesSuccessful++;
      this.stats.totalSpentSol += result.inputAmount;
      console.log(`[SNIPER] SUCCESS! Signature: ${result.signature}`);
      if (result.outputAmount) {
        console.log(`[SNIPER] Received: ${result.outputAmount.toLocaleString()} tokens`);
      }
    } else {
      console.log(`[SNIPER] FAILED: ${result.error}`);
    }
  }

  private applyFilters(token: TokenLaunch): boolean {
    // Skip keywords filter
    const name = (token.name + token.symbol).toLowerCase();
    for (const keyword of CONFIG.SKIP_KEYWORDS) {
      if (name.includes(keyword)) {
        console.log(`[FILTER] Skipped: contains "${keyword}"`);
        return false;
      }
    }

    // Liquidity filter
    if (token.initialLiquidity < CONFIG.MIN_LIQUIDITY) {
      console.log(`[FILTER] Skipped: low liquidity (${token.initialLiquidity} SOL)`);
      return false;
    }

    return true;
  }

  private printStatus(): void {
    const uptime = Math.floor((Date.now() - this.stats.started) / 60000);
    console.log("\n[STATUS]", {
      uptime: `${uptime}m`,
      detected: this.stats.tokensDetected,
      filtered: this.stats.tokensFiltered,
      trades: `${this.stats.tradesSuccessful}/${this.stats.tradesExecuted}`,
      spent: `${this.stats.totalSpentSol.toFixed(4)} SOL`,
    });
  }

  stop(): void {
    console.log("\n[SNIPER] Shutting down...");
    this.running = false;
    this.detector.stop();
    this.printStatus();
    process.exit(0);
  }
}

// CLI argument parsing
const args = process.argv.slice(2);
if (args.includes("--live")) {
  (CONFIG as any).DRY_RUN = false;
  console.log("\n*** LIVE TRADING MODE - REAL MONEY AT RISK ***\n");
}

// Start sniper
const sniper = new PumpSniper();
sniper.start().catch(console.error);
