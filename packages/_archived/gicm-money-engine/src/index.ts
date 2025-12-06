/**
 * gICM Money Engine
 *
 * Self-funding system for gICM platform.
 */

import { Connection, Keypair } from "@solana/web3.js";
import Decimal from "decimal.js";
import { TreasuryManager } from "./core/treasury.js";
import { DCABot, createSOLDCABot } from "./trading/bots/dca.js";
import { ExpenseManager } from "./expenses/index.js";
import { JupiterClient } from "./blockchain/jupiter.js";
import { Logger } from "./utils/logger.js";
import type { MoneyEngineConfig, FinancialReport } from "./core/types.js";

// Optional integration hub (may not be installed)
let hub: {
  engineStarted(name: string): void;
  heartbeat(name: string): void;
  publish(source: string, type: string, payload: Record<string, unknown>): void;
} | null = null;
try {
  const { getHub } = await import("@gicm/integration-hub");
  hub = getHub();
} catch {
  // Integration hub not available
}

export class MoneyEngine {
  private config: MoneyEngineConfig;
  private connection: Connection;
  private keypair: Keypair;
  private logger: Logger;

  private treasury: TreasuryManager;
  private expenseManager: ExpenseManager;
  private tradingBots: Map<string, DCABot> = new Map();
  private jupiter: JupiterClient;

  private isRunning: boolean = false;

  constructor(config: MoneyEngineConfig, keypair: Keypair) {
    this.config = config;
    this.keypair = keypair;
    this.logger = new Logger("MoneyEngine");

    this.connection = new Connection(config.rpcUrl, "confirmed");
    this.treasury = new TreasuryManager(this.connection, keypair);
    this.expenseManager = new ExpenseManager();
    this.jupiter = new JupiterClient();
  }

  /**
   * Start the money engine
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.logger.info("Starting gICM Money Engine...");
    this.isRunning = true;

    // Initialize treasury
    try {
      await this.treasury.refreshBalances();
    } catch (error) {
      this.logger.warn(`Could not refresh balances: ${error}`);
    }

    // Set up expense management
    if (this.config.autoPayExpenses) {
      this.expenseManager.addDefaultExpenses();
      this.expenseManager.start(async (expense) => {
        this.logger.info(`Would pay: ${expense.name} - $${expense.amount}`);
        return true;
      });
    }

    // Start trading bots
    if (this.config.enableTrading) {
      await this.startTradingBots();
    }

    // Emit engine started event to hub
    if (hub) {
      hub.engineStarted("money-engine");
      // Heartbeat every 30 seconds
      setInterval(() => hub?.heartbeat("money-engine"), 30000);
    }

    this.logger.info("Money Engine running");
    await this.printStatus();
  }

  /**
   * Stop the money engine
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.logger.info("Stopping Money Engine...");

    for (const [, bot] of this.tradingBots) {
      await bot.stop();
    }

    this.expenseManager.stop();

    this.isRunning = false;
    this.logger.info("Money Engine stopped");
  }

  /**
   * Start trading bots
   */
  private async startTradingBots(): Promise<void> {
    const dcaBot = createSOLDCABot(
      this.connection,
      this.keypair,
      this.config.dcaAmountPerBuy,
      this.config.dcaSchedule,
      this.config.tradingMode
    );

    dcaBot.on("trade", (trade) => {
      this.logger.info(
        `Trade executed: ${trade.side} ${trade.size} ${trade.symbol} @ ${trade.price}`
      );

      // Emit trade event to hub
      if (hub) {
        hub.publish("money-engine", "trade.executed", {
          asset: trade.symbol,
          amount: trade.size.toString(),
          price: trade.price.toString(),
          side: trade.side,
          timestamp: Date.now(),
        });
      }
    });

    dcaBot.on("error", (error) => {
      this.logger.error(`Bot error: ${error.message}`);
    });

    await dcaBot.start();
    this.tradingBots.set(dcaBot.getId(), dcaBot);

    this.logger.info(`Started ${this.tradingBots.size} trading bots`);
  }

  /**
   * Get financial status
   */
  async getStatus(): Promise<{
    treasury: Awaited<ReturnType<TreasuryManager["getStatus"]>>;
    expenses: {
      monthly: Decimal;
      upcoming: number;
      budgetStatus: ReturnType<ExpenseManager["getBudgetStatus"]>;
    };
    trading: {
      activeBots: number;
      totalPnL: Decimal;
    };
    health: {
      selfSustaining: boolean;
      runway: number;
    };
  }> {
    const solPrice = await this.jupiter.getSolPrice() || 225;

    let treasuryStatus;
    try {
      treasuryStatus = await this.treasury.getStatus(solPrice);
    } catch {
      treasuryStatus = {
        totalValueUsd: new Decimal(0),
        balances: { sol: new Decimal(0), usdc: new Decimal(0) },
        allocations: {
          trading: new Decimal(0),
          operations: new Decimal(0),
          growth: new Decimal(0),
          reserve: new Decimal(0),
        },
        health: { runway: 0, needsRebalance: false },
      };
    }

    const monthlyExpenses = this.expenseManager.getMonthlyTotal();
    const budgetStatus = this.expenseManager.getBudgetStatus();

    let totalTradingPnL = new Decimal(0);
    for (const [, bot] of this.tradingBots) {
      totalTradingPnL = totalTradingPnL.add(bot.getPerformance().totalPnL);
    }

    const monthlyRevenue = totalTradingPnL;

    return {
      treasury: treasuryStatus,
      expenses: {
        monthly: monthlyExpenses,
        upcoming: this.expenseManager.getUpcoming(7).length,
        budgetStatus,
      },
      trading: {
        activeBots: this.tradingBots.size,
        totalPnL: totalTradingPnL,
      },
      health: {
        selfSustaining: monthlyRevenue.gte(monthlyExpenses),
        runway: treasuryStatus.health.runway,
      },
    };
  }

  /**
   * Print status to console
   */
  async printStatus(): Promise<void> {
    const status = await this.getStatus();

    console.log("\n📊 gICM Money Engine Status");
    console.log("═".repeat(50));
    console.log(`\n💰 Treasury:`);
    console.log(`   SOL: ${status.treasury.balances.sol.toFixed(4)}`);
    console.log(`   USDC: $${status.treasury.balances.usdc.toFixed(2)}`);
    console.log(`   Total: $${status.treasury.totalValueUsd.toFixed(2)}`);
    console.log(`\n📤 Expenses:`);
    console.log(`   Monthly: $${status.expenses.monthly.toFixed(2)}`);
    console.log(`   Upcoming (7d): ${status.expenses.upcoming}`);
    console.log(`\n📈 Trading:`);
    console.log(`   Active bots: ${status.trading.activeBots}`);
    console.log(`   Total P&L: $${status.trading.totalPnL.toFixed(2)}`);
    console.log(`\n❤️ Health:`);
    console.log(`   Self-sustaining: ${status.health.selfSustaining ? "Yes" : "No"}`);
    console.log(`   Runway: ${status.health.runway.toFixed(1)} months`);
    console.log("═".repeat(50) + "\n");
  }

  /**
   * Trigger manual DCA (for testing)
   */
  async triggerDCA(): Promise<void> {
    for (const [, bot] of this.tradingBots) {
      if (bot instanceof DCABot) {
        await bot.triggerDCA();
      }
    }
  }

  /**
   * Get treasury manager
   */
  getTreasury(): TreasuryManager {
    return this.treasury;
  }

  /**
   * Get expense manager
   */
  getExpenseManager(): ExpenseManager {
    return this.expenseManager;
  }

  /**
   * Check if running
   */
  isEngineRunning(): boolean {
    return this.isRunning;
  }
}

// Export everything
export * from "./core/types.js";
export * from "./core/treasury.js";
export * from "./core/constants.js";
export * from "./trading/index.js";
export * from "./expenses/index.js";
export * from "./blockchain/jupiter.js";
export * from "./utils/logger.js";
