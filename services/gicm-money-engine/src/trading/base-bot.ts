/**
 * Base Trading Bot
 *
 * Abstract base class for all trading bots.
 */

import { EventEmitter } from "eventemitter3";
import Decimal from "decimal.js";
import type {
  TradingBot,
  BotConfig,
  BotPerformance,
  RiskParameters,
  Position,
  Order,
  Trade,
  TradingMode,
  BotStatus,
  BotType,
} from "../core/types.js";
import { RiskManager } from "./risk-manager.js";
import { Logger } from "../utils/logger.js";

export interface BotEvents {
  started: () => void;
  stopped: () => void;
  trade: (trade: Trade) => void;
  "position:opened": (position: Position) => void;
  "position:closed": (position: Position, pnl: Decimal) => void;
  error: (error: Error) => void;
  "risk:alert": (message: string) => void;
}

export abstract class BaseBot extends EventEmitter<BotEvents> {
  protected id: string;
  protected name: string;
  protected botType: BotType;
  protected mode: TradingMode;
  protected status: BotStatus = "stopped";
  protected config: BotConfig;
  protected performance: BotPerformance;
  protected riskManager: RiskManager;
  protected logger: Logger;

  protected positions: Map<string, Position> = new Map();
  protected pendingOrders: Map<string, Order> = new Map();
  protected tradeHistory: Trade[] = [];

  constructor(
    id: string,
    name: string,
    botType: BotType,
    config: BotConfig,
    riskParams: RiskParameters,
    mode: TradingMode = "paper"
  ) {
    super();
    this.id = id;
    this.name = name;
    this.botType = botType;
    this.config = config;
    this.mode = mode;
    this.logger = new Logger(`Bot:${name}`);
    this.riskManager = new RiskManager(riskParams);
    this.performance = this.initializePerformance();
  }

  private initializePerformance(): BotPerformance {
    return {
      totalPnL: new Decimal(0),
      realizedPnL: new Decimal(0),
      unrealizedPnL: new Decimal(0),
      winRate: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      dailyPnL: new Decimal(0),
      weeklyPnL: new Decimal(0),
      monthlyPnL: new Decimal(0),
    };
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  async start(): Promise<void> {
    if (this.status === "running") {
      this.logger.warn("Bot already running");
      return;
    }

    this.logger.info(`Starting ${this.name} in ${this.mode} mode...`);
    this.status = "running";

    await this.onStart();

    this.emit("started");
    this.logger.info(`${this.name} started`);
  }

  async stop(): Promise<void> {
    if (this.status === "stopped") return;

    this.logger.info(`Stopping ${this.name}...`);

    if (this.config.strategyParams.closeOnStop) {
      await this.closeAllPositions();
    }

    await this.onStop();

    this.status = "stopped";
    this.emit("stopped");
    this.logger.info(`${this.name} stopped`);
  }

  async pause(): Promise<void> {
    this.status = "paused";
    this.logger.info(`${this.name} paused`);
  }

  async resume(): Promise<void> {
    this.status = "running";
    this.logger.info(`${this.name} resumed`);
  }

  // ===========================================================================
  // ABSTRACT METHODS
  // ===========================================================================

  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onTick(): Promise<void>;
  protected abstract getPrice(token: string): Promise<Decimal>;
  protected abstract executeBuy(token: string, amount: Decimal): Promise<Trade | null>;
  protected abstract executeSell(token: string, amount: Decimal): Promise<Trade | null>;

  // ===========================================================================
  // POSITION MANAGEMENT
  // ===========================================================================

  protected async openPosition(
    token: string,
    symbol: string,
    size: Decimal,
    side: "long" | "short" = "long"
  ): Promise<Position | null> {
    if (!this.riskManager.canOpenPosition(this.performance, size, this.config.allocatedCapital)) {
      this.logger.warn(`Risk check failed for ${symbol}`);
      this.emit("risk:alert", `Cannot open position: risk limits exceeded`);
      return null;
    }

    const price = await this.getPrice(token);

    const trade =
      side === "long" ? await this.executeBuy(token, size) : await this.executeSell(token, size);

    if (!trade) {
      this.logger.error(`Failed to execute trade for ${symbol}`);
      return null;
    }

    const position: Position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      botId: this.id,
      token,
      symbol,
      side,
      size,
      entryPrice: trade.price,
      currentPrice: trade.price,
      unrealizedPnL: new Decimal(0),
      unrealizedPnLPercent: 0,
      stopLoss: this.riskManager.getStopLossPrice(trade.price, side),
      takeProfit: this.calculateTakeProfit(trade.price, side),
      openedAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.positions.set(position.id, position);
    this.tradeHistory.push(trade);

    this.emit("position:opened", position);
    this.logger.info(`Opened ${side} position: ${size} ${symbol} @ ${trade.price}`);

    return position;
  }

  protected async closePosition(positionId: string): Promise<Decimal | null> {
    const position = this.positions.get(positionId);
    if (!position) {
      this.logger.warn(`Position not found: ${positionId}`);
      return null;
    }

    const trade =
      position.side === "long"
        ? await this.executeSell(position.token, position.size)
        : await this.executeBuy(position.token, position.size);

    if (!trade) {
      this.logger.error(`Failed to close position ${positionId}`);
      return null;
    }

    const pnl =
      position.side === "long"
        ? trade.price.sub(position.entryPrice).mul(position.size)
        : position.entryPrice.sub(trade.price).mul(position.size);

    trade.realizedPnL = pnl;
    this.tradeHistory.push(trade);

    this.performance.realizedPnL = this.performance.realizedPnL.add(pnl);
    this.performance.totalTrades++;

    if (pnl.gt(0)) {
      this.performance.winningTrades++;
      this.riskManager.recordProfit(pnl);
    } else {
      this.performance.losingTrades++;
      this.riskManager.recordLoss(pnl);
    }

    this.updateWinRate();
    this.positions.delete(positionId);

    this.emit("position:closed", position, pnl);
    this.logger.info(`Closed position: ${position.symbol} PnL: ${pnl.toFixed(2)}`);

    return pnl;
  }

  protected async closeAllPositions(): Promise<void> {
    this.logger.info("Closing all positions...");

    for (const [positionId] of this.positions) {
      await this.closePosition(positionId);
    }
  }

  protected async updatePositions(): Promise<void> {
    let totalUnrealized = new Decimal(0);

    for (const [id, position] of this.positions) {
      const currentPrice = await this.getPrice(position.token);
      position.currentPrice = currentPrice;

      if (position.side === "long") {
        position.unrealizedPnL = currentPrice.sub(position.entryPrice).mul(position.size);
      } else {
        position.unrealizedPnL = position.entryPrice.sub(currentPrice).mul(position.size);
      }

      position.unrealizedPnLPercent = position.unrealizedPnL
        .div(position.entryPrice.mul(position.size))
        .mul(100)
        .toNumber();

      position.updatedAt = Date.now();
      totalUnrealized = totalUnrealized.add(position.unrealizedPnL);

      if (position.stopLoss && this.shouldTriggerStopLoss(position)) {
        this.logger.warn(`Stop loss triggered for ${position.symbol}`);
        await this.closePosition(id);
      }

      if (position.takeProfit && this.shouldTriggerTakeProfit(position)) {
        this.logger.info(`Take profit triggered for ${position.symbol}`);
        await this.closePosition(id);
      }
    }

    this.performance.unrealizedPnL = totalUnrealized;
    this.performance.totalPnL = this.performance.realizedPnL.add(totalUnrealized);
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private calculateTakeProfit(entryPrice: Decimal, side: "long" | "short"): Decimal {
    const takeProfitPercent = 0.1; // 10% default
    return side === "long"
      ? entryPrice.mul(1 + takeProfitPercent)
      : entryPrice.mul(1 - takeProfitPercent);
  }

  private shouldTriggerStopLoss(position: Position): boolean {
    if (!position.stopLoss) return false;
    return position.side === "long"
      ? position.currentPrice.lte(position.stopLoss)
      : position.currentPrice.gte(position.stopLoss);
  }

  private shouldTriggerTakeProfit(position: Position): boolean {
    if (!position.takeProfit) return false;
    return position.side === "long"
      ? position.currentPrice.gte(position.takeProfit)
      : position.currentPrice.lte(position.takeProfit);
  }

  private updateWinRate(): void {
    if (this.performance.totalTrades === 0) {
      this.performance.winRate = 0;
    } else {
      this.performance.winRate =
        (this.performance.winningTrades / this.performance.totalTrades) * 100;
    }
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): BotStatus {
    return this.status;
  }

  getMode(): TradingMode {
    return this.mode;
  }

  getPerformance(): BotPerformance {
    return { ...this.performance };
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getTradeHistory(): Trade[] {
    return [...this.tradeHistory];
  }

  getState(): TradingBot {
    return {
      id: this.id,
      type: this.botType,
      name: this.name,
      status: this.status,
      mode: this.mode,
      config: this.config,
      performance: this.performance,
      riskParams: this.riskManager.getParams(),
      positions: this.getPositions(),
      pendingOrders: Array.from(this.pendingOrders.values()),
      createdAt: Date.now(),
      lastTradeAt:
        this.tradeHistory.length > 0
          ? this.tradeHistory[this.tradeHistory.length - 1].executedAt
          : undefined,
    };
  }
}
