/**
 * Dollar-Cost Averaging Bot
 *
 * Simple, safe bot that buys fixed amounts at regular intervals.
 */

import Decimal from "decimal.js";
import { CronJob } from "cron";
import { Connection, Keypair } from "@solana/web3.js";
import { BaseBot } from "../base-bot.js";
import type { BotConfig, RiskParameters, Trade, TradingMode } from "../../core/types.js";
import { JupiterClient } from "../../blockchain/jupiter.js";
import { SOL_MINT, USDC_MINT, SOL_DECIMALS } from "../../core/constants.js";

interface DCAConfig extends BotConfig {
  strategyParams: {
    targetToken: string;
    targetSymbol: string;
    amountPerBuy: number;
    schedule: string;
    closeOnStop: boolean;
    randomizeAmount: boolean;
    randomizeTime: boolean;
  };
}

export class DCABot extends BaseBot {
  private connection: Connection;
  private keypair: Keypair;
  private jupiter: JupiterClient;
  private cronJob?: CronJob;
  private dcaConfig: DCAConfig;

  constructor(
    connection: Connection,
    keypair: Keypair,
    config: DCAConfig,
    riskParams: RiskParameters,
    mode: TradingMode = "paper"
  ) {
    super(
      `dca-${config.strategyParams.targetSymbol}`,
      `DCA ${config.strategyParams.targetSymbol}`,
      "dca",
      config,
      riskParams,
      mode
    );

    this.connection = connection;
    this.keypair = keypair;
    this.dcaConfig = config;
    this.jupiter = new JupiterClient();
  }

  protected async onStart(): Promise<void> {
    this.logger.info(`Setting up DCA schedule: ${this.dcaConfig.strategyParams.schedule}`);

    this.cronJob = new CronJob(
      this.dcaConfig.strategyParams.schedule,
      async () => {
        await this.executeDCA();
      },
      null,
      true
    );
  }

  protected async onStop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  protected async onTick(): Promise<void> {
    await this.updatePositions();
  }

  /**
   * Execute DCA buy
   */
  private async executeDCA(): Promise<void> {
    if (this.status !== "running") return;

    this.logger.info("Executing DCA buy...");

    try {
      let amount = new Decimal(this.dcaConfig.strategyParams.amountPerBuy);

      if (this.dcaConfig.strategyParams.randomizeAmount) {
        const variance = 0.1;
        const multiplier = 1 + (Math.random() * 2 - 1) * variance;
        amount = amount.mul(multiplier);
      }

      const trade = await this.executeBuy(this.dcaConfig.strategyParams.targetToken, amount);

      if (trade) {
        this.logger.info(
          `DCA buy executed: ${trade.size} ${this.dcaConfig.strategyParams.targetSymbol} @ ${trade.price}`
        );
      }
    } catch (error) {
      this.logger.error(`DCA execution failed: ${error}`);
      this.emit("error", error as Error);
    }
  }

  protected async getPrice(token: string): Promise<Decimal> {
    const price = await this.jupiter.getPrice(token);
    return new Decimal(price);
  }

  protected async executeBuy(token: string, amountUsdc: Decimal): Promise<Trade | null> {
    if (this.mode === "paper") {
      return this.paperBuy(token, amountUsdc);
    }

    return this.realBuy(token, amountUsdc);
  }

  protected async executeSell(token: string, amount: Decimal): Promise<Trade | null> {
    if (this.mode === "paper") {
      return this.paperSell(token, amount);
    }

    return this.realSell(token, amount);
  }

  /**
   * Paper trading buy
   */
  private async paperBuy(token: string, amountUsdc: Decimal): Promise<Trade> {
    const price = await this.getPrice(token);
    const size = amountUsdc.div(price);

    const trade: Trade = {
      id: `trade-${Date.now()}`,
      botId: this.id,
      positionId: "",
      side: "buy",
      token,
      symbol: this.dcaConfig.strategyParams.targetSymbol,
      size,
      price,
      valueUsd: amountUsdc,
      fee: amountUsdc.mul(0.003),
      slippage: 0.1,
      txSignature: `paper-${Date.now()}`,
      executedAt: Date.now(),
    };

    this.emit("trade", trade);
    return trade;
  }

  /**
   * Paper trading sell
   */
  private async paperSell(token: string, amount: Decimal): Promise<Trade> {
    const price = await this.getPrice(token);
    const valueUsd = amount.mul(price);

    const trade: Trade = {
      id: `trade-${Date.now()}`,
      botId: this.id,
      positionId: "",
      side: "sell",
      token,
      symbol: this.dcaConfig.strategyParams.targetSymbol,
      size: amount,
      price,
      valueUsd,
      fee: valueUsd.mul(0.003),
      slippage: 0.1,
      txSignature: `paper-${Date.now()}`,
      executedAt: Date.now(),
    };

    this.emit("trade", trade);
    return trade;
  }

  /**
   * Real buy via Jupiter
   */
  private async realBuy(token: string, amountUsdc: Decimal): Promise<Trade | null> {
    try {
      const result = await this.jupiter.swap({
        inputMint: USDC_MINT.toBase58(),
        outputMint: token,
        amount: amountUsdc.mul(1e6).toNumber(),
        slippageBps: this.config.slippageTolerance * 100,
        wallet: this.keypair,
      });

      const trade: Trade = {
        id: `trade-${Date.now()}`,
        botId: this.id,
        positionId: "",
        side: "buy",
        token,
        symbol: this.dcaConfig.strategyParams.targetSymbol,
        size: new Decimal(result.outputAmount),
        price: new Decimal(result.price),
        valueUsd: amountUsdc,
        fee: new Decimal(result.fee || 0),
        slippage: result.slippage || 0,
        txSignature: result.txSignature,
        executedAt: Date.now(),
      };

      this.emit("trade", trade);
      return trade;
    } catch (error) {
      this.logger.error(`Real buy failed: ${error}`);
      return null;
    }
  }

  /**
   * Real sell via Jupiter
   */
  private async realSell(token: string, amount: Decimal): Promise<Trade | null> {
    try {
      const result = await this.jupiter.swap({
        inputMint: token,
        outputMint: USDC_MINT.toBase58(),
        amount: amount.mul(10 ** SOL_DECIMALS).toNumber(),
        slippageBps: this.config.slippageTolerance * 100,
        wallet: this.keypair,
      });

      const trade: Trade = {
        id: `trade-${Date.now()}`,
        botId: this.id,
        positionId: "",
        side: "sell",
        token,
        symbol: this.dcaConfig.strategyParams.targetSymbol,
        size: amount,
        price: new Decimal(result.price),
        valueUsd: new Decimal(result.outputAmount).div(1e6),
        fee: new Decimal(result.fee || 0),
        slippage: result.slippage || 0,
        txSignature: result.txSignature,
        executedAt: Date.now(),
      };

      this.emit("trade", trade);
      return trade;
    } catch (error) {
      this.logger.error(`Real sell failed: ${error}`);
      return null;
    }
  }

  /**
   * Manually trigger DCA (for testing)
   */
  async triggerDCA(): Promise<void> {
    await this.executeDCA();
  }
}

/**
 * Create a DCA bot for SOL accumulation
 */
export function createSOLDCABot(
  connection: Connection,
  keypair: Keypair,
  amountPerBuy: number = 10,
  schedule: string = "0 */4 * * *",
  mode: TradingMode = "paper"
): DCABot {
  const config: DCAConfig = {
    allocatedCapital: new Decimal(1000),
    maxPositionSize: new Decimal(100),
    pairs: ["SOL/USDC"],
    slippageTolerance: 0.5,
    priorityFee: 10000,
    strategyParams: {
      targetToken: SOL_MINT.toBase58(),
      targetSymbol: "SOL",
      amountPerBuy,
      schedule,
      closeOnStop: false,
      randomizeAmount: true,
      randomizeTime: false,
    },
  };

  const riskParams: RiskParameters = {
    maxPositionPercent: 100,
    maxTotalExposure: 100,
    stopLossPercent: 0,
    dailyLossLimit: new Decimal(0),
    weeklyLossLimit: new Decimal(0),
    maxDrawdownPercent: 0,
    cooldownAfterLoss: 0,
  };

  return new DCABot(connection, keypair, config, riskParams, mode);
}
