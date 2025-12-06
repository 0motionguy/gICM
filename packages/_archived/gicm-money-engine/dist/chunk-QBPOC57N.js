// src/index.ts
import { Connection as Connection2 } from "@solana/web3.js";
import Decimal7 from "decimal.js";

// src/core/treasury.ts
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";

// src/core/constants.ts
import { PublicKey } from "@solana/web3.js";
var USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
var SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
var USDC_DECIMALS = 6;
var SOL_DECIMALS = 9;
var DEFAULT_SLIPPAGE_BPS = 50;
var DEFAULT_PRIORITY_FEE = 1e4;
var DEFAULT_ALLOCATIONS = {
  trading: 0.4,
  // 40%
  operations: 0.3,
  // 30%
  growth: 0.2,
  // 20%
  reserve: 0.1
  // 10%
};
var DEFAULT_THRESHOLDS = {
  minOperatingBalance: 1e3,
  // $1000
  maxTradingAllocation: 0.5,
  // 50%
  rebalanceThreshold: 0.1
  // 10%
};
var DEFAULT_RISK_PARAMS = {
  maxPositionPercent: 10,
  // 10% of capital per position
  maxTotalExposure: 80,
  // 80% max exposure
  stopLossPercent: 5,
  // 5% stop loss
  dailyLossLimitPercent: 3,
  // 3% daily loss limit
  weeklyLossLimitPercent: 10,
  // 10% weekly loss limit
  maxDrawdownPercent: 15,
  // 15% max drawdown
  cooldownAfterLoss: 3600
  // 1 hour cooldown
};
var DEFAULT_BUDGET_LIMITS = {
  api_subscriptions: 500,
  infrastructure: 200,
  marketing: 300,
  tools: 100,
  legal: 100,
  other: 100
};

// src/utils/logger.ts
import pino from "pino";
var transport = pino.transport({
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname"
  }
});
var baseLogger = pino(
  {
    level: process.env.LOG_LEVEL || "info"
  },
  transport
);
var Logger = class {
  logger;
  constructor(name) {
    this.logger = baseLogger.child({ name });
  }
  info(message, data) {
    if (data) {
      this.logger.info(data, message);
    } else {
      this.logger.info(message);
    }
  }
  warn(message, data) {
    if (data) {
      this.logger.warn(data, message);
    } else {
      this.logger.warn(message);
    }
  }
  error(message, data) {
    if (data) {
      this.logger.error(data, message);
    } else {
      this.logger.error(message);
    }
  }
  debug(message, data) {
    if (data) {
      this.logger.debug(data, message);
    } else {
      this.logger.debug(message);
    }
  }
};
var logger = new Logger("MoneyEngine");

// src/core/treasury.ts
var TreasuryManager = class {
  connection;
  treasury;
  logger;
  keypair;
  constructor(connection, keypair) {
    this.connection = connection;
    this.keypair = keypair;
    this.logger = new Logger("Treasury");
    this.treasury = this.initializeTreasury();
  }
  initializeTreasury() {
    return {
      balances: {
        sol: new Decimal(0),
        usdc: new Decimal(0),
        tokens: /* @__PURE__ */ new Map()
      },
      allocations: {
        trading: new Decimal(DEFAULT_ALLOCATIONS.trading),
        operations: new Decimal(DEFAULT_ALLOCATIONS.operations),
        growth: new Decimal(DEFAULT_ALLOCATIONS.growth),
        reserve: new Decimal(DEFAULT_ALLOCATIONS.reserve)
      },
      wallets: {
        main: this.keypair.publicKey.toBase58(),
        trading: this.keypair.publicKey.toBase58(),
        operations: this.keypair.publicKey.toBase58(),
        cold: ""
      },
      thresholds: {
        minOperatingBalance: new Decimal(DEFAULT_THRESHOLDS.minOperatingBalance),
        maxTradingAllocation: new Decimal(DEFAULT_THRESHOLDS.maxTradingAllocation),
        rebalanceThreshold: new Decimal(DEFAULT_THRESHOLDS.rebalanceThreshold)
      },
      lastUpdated: Date.now(),
      lastRebalance: Date.now()
    };
  }
  /**
   * Refresh all balances
   */
  async refreshBalances() {
    this.logger.info("Refreshing treasury balances...");
    try {
      const solBalance = await this.connection.getBalance(this.keypair.publicKey);
      this.treasury.balances.sol = new Decimal(solBalance).div(LAMPORTS_PER_SOL);
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
  async getTotalValueUsd(solPrice) {
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
  async getAllocations(solPrice) {
    const total = await this.getTotalValueUsd(solPrice);
    return {
      trading: total.mul(this.treasury.allocations.trading),
      operations: total.mul(this.treasury.allocations.operations),
      growth: total.mul(this.treasury.allocations.growth),
      reserve: total.mul(this.treasury.allocations.reserve)
    };
  }
  /**
   * Check if rebalance needed
   */
  async needsRebalance(solPrice) {
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
  async getAvailableForTrading(solPrice) {
    const allocations = await this.getAllocations(solPrice);
    return allocations.trading;
  }
  /**
   * Get runway in months
   */
  async getRunwayMonths(monthlyExpenses, solPrice) {
    const total = await this.getTotalValueUsd(solPrice);
    if (monthlyExpenses.isZero()) return Infinity;
    return total.div(monthlyExpenses).toNumber();
  }
  /**
   * Check if self-sustaining
   */
  isSelfSustaining(monthlyRevenue, monthlyExpenses) {
    return monthlyRevenue.gte(monthlyExpenses);
  }
  /**
   * Get treasury status
   */
  async getStatus(solPrice) {
    await this.refreshBalances();
    return {
      totalValueUsd: await this.getTotalValueUsd(solPrice),
      balances: {
        sol: this.treasury.balances.sol,
        usdc: this.treasury.balances.usdc
      },
      allocations: await this.getAllocations(solPrice),
      health: {
        runway: await this.getRunwayMonths(new Decimal(500), solPrice),
        needsRebalance: await this.needsRebalance(solPrice)
      }
    };
  }
  /**
   * Export state
   */
  getState() {
    return { ...this.treasury };
  }
  /**
   * Get wallet address
   */
  getWalletAddress() {
    return this.keypair.publicKey.toBase58();
  }
};

// src/trading/bots/dca.ts
import Decimal5 from "decimal.js";
import { CronJob } from "cron";

// src/trading/base-bot.ts
import { EventEmitter } from "eventemitter3";
import Decimal3 from "decimal.js";

// src/trading/risk-manager.ts
import Decimal2 from "decimal.js";
var RiskManager = class {
  params;
  logger;
  dailyLossTracking = new Decimal2(0);
  weeklyLossTracking = new Decimal2(0);
  lastDailyReset = Date.now();
  lastWeeklyReset = Date.now();
  constructor(params) {
    this.logger = new Logger("RiskManager");
    this.params = {
      maxPositionPercent: params?.maxPositionPercent ?? DEFAULT_RISK_PARAMS.maxPositionPercent,
      maxTotalExposure: params?.maxTotalExposure ?? DEFAULT_RISK_PARAMS.maxTotalExposure,
      stopLossPercent: params?.stopLossPercent ?? DEFAULT_RISK_PARAMS.stopLossPercent,
      dailyLossLimit: params?.dailyLossLimit ?? new Decimal2(DEFAULT_RISK_PARAMS.dailyLossLimitPercent),
      weeklyLossLimit: params?.weeklyLossLimit ?? new Decimal2(DEFAULT_RISK_PARAMS.weeklyLossLimitPercent),
      maxDrawdownPercent: params?.maxDrawdownPercent ?? DEFAULT_RISK_PARAMS.maxDrawdownPercent,
      cooldownAfterLoss: params?.cooldownAfterLoss ?? DEFAULT_RISK_PARAMS.cooldownAfterLoss
    };
  }
  /**
   * Check if a new position can be opened
   */
  canOpenPosition(performance, positionSize, totalCapital) {
    this.resetTrackingIfNeeded();
    const positionPercent = positionSize.div(totalCapital).mul(100).toNumber();
    if (positionPercent > this.params.maxPositionPercent) {
      this.logger.warn(
        `Position size ${positionPercent.toFixed(2)}% exceeds max ${this.params.maxPositionPercent}%`
      );
      return false;
    }
    const currentExposure = this.calculateCurrentExposure(performance, totalCapital);
    const newExposure = currentExposure + positionPercent;
    if (newExposure > this.params.maxTotalExposure) {
      this.logger.warn(
        `Total exposure ${newExposure.toFixed(2)}% would exceed max ${this.params.maxTotalExposure}%`
      );
      return false;
    }
    if (this.dailyLossTracking.abs().gt(this.params.dailyLossLimit.mul(totalCapital).div(100))) {
      this.logger.warn("Daily loss limit reached");
      return false;
    }
    if (this.weeklyLossTracking.abs().gt(this.params.weeklyLossLimit.mul(totalCapital).div(100))) {
      this.logger.warn("Weekly loss limit reached");
      return false;
    }
    if (performance.maxDrawdown > this.params.maxDrawdownPercent) {
      this.logger.warn(
        `Max drawdown ${performance.maxDrawdown.toFixed(2)}% exceeds limit ${this.params.maxDrawdownPercent}%`
      );
      return false;
    }
    return true;
  }
  /**
   * Calculate current exposure as percentage
   */
  calculateCurrentExposure(performance, totalCapital) {
    if (totalCapital.isZero()) return 0;
    return performance.unrealizedPnL.abs().div(totalCapital).mul(100).toNumber();
  }
  /**
   * Record a loss for tracking
   */
  recordLoss(amount) {
    this.resetTrackingIfNeeded();
    this.dailyLossTracking = this.dailyLossTracking.sub(amount.abs());
    this.weeklyLossTracking = this.weeklyLossTracking.sub(amount.abs());
    this.logger.info(`Recorded loss: $${amount.toFixed(2)}`);
  }
  /**
   * Record a profit for tracking
   */
  recordProfit(amount) {
    this.resetTrackingIfNeeded();
    this.dailyLossTracking = this.dailyLossTracking.add(amount);
    this.weeklyLossTracking = this.weeklyLossTracking.add(amount);
  }
  /**
   * Reset tracking counters if period has passed
   */
  resetTrackingIfNeeded() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1e3;
    const weekMs = 7 * dayMs;
    if (now - this.lastDailyReset > dayMs) {
      this.dailyLossTracking = new Decimal2(0);
      this.lastDailyReset = now;
    }
    if (now - this.lastWeeklyReset > weekMs) {
      this.weeklyLossTracking = new Decimal2(0);
      this.lastWeeklyReset = now;
    }
  }
  /**
   * Calculate optimal position size based on risk
   */
  calculatePositionSize(totalCapital, riskPercent = 1) {
    const maxPosition = totalCapital.mul(this.params.maxPositionPercent).div(100);
    const riskBasedPosition = totalCapital.mul(riskPercent).div(100);
    return Decimal2.min(maxPosition, riskBasedPosition);
  }
  /**
   * Get stop loss price for a position
   */
  getStopLossPrice(entryPrice, side) {
    const stopPercent = this.params.stopLossPercent / 100;
    return side === "long" ? entryPrice.mul(1 - stopPercent) : entryPrice.mul(1 + stopPercent);
  }
  /**
   * Check if bot should be paused due to losses
   */
  shouldPauseTrading(performance) {
    return performance.maxDrawdown > this.params.maxDrawdownPercent;
  }
  /**
   * Get parameters
   */
  getParams() {
    return { ...this.params };
  }
  /**
   * Update parameters
   */
  updateParams(params) {
    this.params = { ...this.params, ...params };
    this.logger.info("Risk parameters updated");
  }
};

// src/trading/base-bot.ts
var BaseBot = class extends EventEmitter {
  id;
  name;
  botType;
  mode;
  status = "stopped";
  config;
  performance;
  riskManager;
  logger;
  positions = /* @__PURE__ */ new Map();
  pendingOrders = /* @__PURE__ */ new Map();
  tradeHistory = [];
  constructor(id, name, botType, config, riskParams, mode = "paper") {
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
  initializePerformance() {
    return {
      totalPnL: new Decimal3(0),
      realizedPnL: new Decimal3(0),
      unrealizedPnL: new Decimal3(0),
      winRate: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      dailyPnL: new Decimal3(0),
      weeklyPnL: new Decimal3(0),
      monthlyPnL: new Decimal3(0)
    };
  }
  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================
  async start() {
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
  async stop() {
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
  async pause() {
    this.status = "paused";
    this.logger.info(`${this.name} paused`);
  }
  async resume() {
    this.status = "running";
    this.logger.info(`${this.name} resumed`);
  }
  // ===========================================================================
  // POSITION MANAGEMENT
  // ===========================================================================
  async openPosition(token, symbol, size, side = "long") {
    if (!this.riskManager.canOpenPosition(this.performance, size, this.config.allocatedCapital)) {
      this.logger.warn(`Risk check failed for ${symbol}`);
      this.emit("risk:alert", `Cannot open position: risk limits exceeded`);
      return null;
    }
    const price = await this.getPrice(token);
    const trade = side === "long" ? await this.executeBuy(token, size) : await this.executeSell(token, size);
    if (!trade) {
      this.logger.error(`Failed to execute trade for ${symbol}`);
      return null;
    }
    const position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      botId: this.id,
      token,
      symbol,
      side,
      size,
      entryPrice: trade.price,
      currentPrice: trade.price,
      unrealizedPnL: new Decimal3(0),
      unrealizedPnLPercent: 0,
      stopLoss: this.riskManager.getStopLossPrice(trade.price, side),
      takeProfit: this.calculateTakeProfit(trade.price, side),
      openedAt: Date.now(),
      updatedAt: Date.now()
    };
    this.positions.set(position.id, position);
    this.tradeHistory.push(trade);
    this.emit("position:opened", position);
    this.logger.info(`Opened ${side} position: ${size} ${symbol} @ ${trade.price}`);
    return position;
  }
  async closePosition(positionId) {
    const position = this.positions.get(positionId);
    if (!position) {
      this.logger.warn(`Position not found: ${positionId}`);
      return null;
    }
    const trade = position.side === "long" ? await this.executeSell(position.token, position.size) : await this.executeBuy(position.token, position.size);
    if (!trade) {
      this.logger.error(`Failed to close position ${positionId}`);
      return null;
    }
    const pnl = position.side === "long" ? trade.price.sub(position.entryPrice).mul(position.size) : position.entryPrice.sub(trade.price).mul(position.size);
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
  async closeAllPositions() {
    this.logger.info("Closing all positions...");
    for (const [positionId] of this.positions) {
      await this.closePosition(positionId);
    }
  }
  async updatePositions() {
    let totalUnrealized = new Decimal3(0);
    for (const [id, position] of this.positions) {
      const currentPrice = await this.getPrice(position.token);
      position.currentPrice = currentPrice;
      if (position.side === "long") {
        position.unrealizedPnL = currentPrice.sub(position.entryPrice).mul(position.size);
      } else {
        position.unrealizedPnL = position.entryPrice.sub(currentPrice).mul(position.size);
      }
      position.unrealizedPnLPercent = position.unrealizedPnL.div(position.entryPrice.mul(position.size)).mul(100).toNumber();
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
  calculateTakeProfit(entryPrice, side) {
    const takeProfitPercent = 0.1;
    return side === "long" ? entryPrice.mul(1 + takeProfitPercent) : entryPrice.mul(1 - takeProfitPercent);
  }
  shouldTriggerStopLoss(position) {
    if (!position.stopLoss) return false;
    return position.side === "long" ? position.currentPrice.lte(position.stopLoss) : position.currentPrice.gte(position.stopLoss);
  }
  shouldTriggerTakeProfit(position) {
    if (!position.takeProfit) return false;
    return position.side === "long" ? position.currentPrice.gte(position.takeProfit) : position.currentPrice.lte(position.takeProfit);
  }
  updateWinRate() {
    if (this.performance.totalTrades === 0) {
      this.performance.winRate = 0;
    } else {
      this.performance.winRate = this.performance.winningTrades / this.performance.totalTrades * 100;
    }
  }
  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getStatus() {
    return this.status;
  }
  getMode() {
    return this.mode;
  }
  getPerformance() {
    return { ...this.performance };
  }
  getPositions() {
    return Array.from(this.positions.values());
  }
  getTradeHistory() {
    return [...this.tradeHistory];
  }
  getState() {
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
      lastTradeAt: this.tradeHistory.length > 0 ? this.tradeHistory[this.tradeHistory.length - 1].executedAt : void 0
    };
  }
};

// src/blockchain/jupiter.ts
import Decimal4 from "decimal.js";
var JupiterClient = class {
  logger;
  baseUrl = "https://quote-api.jup.ag/v6";
  constructor() {
    this.logger = new Logger("Jupiter");
  }
  /**
   * Get price for a token in USDC
   */
  async getPrice(tokenMint) {
    try {
      const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${tokenMint}`
      );
      const data = await response.json();
      return data.data[tokenMint]?.price ?? 0;
    } catch (error) {
      this.logger.error(`Failed to get price: ${error}`);
      return 0;
    }
  }
  /**
   * Get swap quote
   */
  async getQuote(inputMint, outputMint, amount, slippageBps) {
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
      );
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get quote: ${error}`);
      return null;
    }
  }
  /**
   * Execute a swap
   */
  async swap(params) {
    this.logger.info(`Executing swap: ${params.amount} ${params.inputMint} -> ${params.outputMint}`);
    const quote = await this.getQuote(
      params.inputMint,
      params.outputMint,
      params.amount,
      params.slippageBps
    );
    if (!quote) {
      throw new Error("Failed to get quote");
    }
    const inputAmount = params.amount;
    const outputAmount = parseInt(quote.outAmount);
    const price = new Decimal4(outputAmount).div(inputAmount).toNumber();
    this.logger.info(`Swap executed: ${inputAmount} -> ${outputAmount} @ ${price}`);
    return {
      txSignature: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      inputAmount,
      outputAmount,
      price,
      fee: inputAmount * 3e-3,
      // 0.3% simulated fee
      slippage: quote.priceImpactPct
    };
  }
  /**
   * Get SOL price in USD
   */
  async getSolPrice() {
    return this.getPrice("So11111111111111111111111111111111111111112");
  }
};

// src/trading/bots/dca.ts
var DCABot = class extends BaseBot {
  connection;
  keypair;
  jupiter;
  cronJob;
  dcaConfig;
  constructor(connection, keypair, config, riskParams, mode = "paper") {
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
  async onStart() {
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
  async onStop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }
  async onTick() {
    await this.updatePositions();
  }
  /**
   * Execute DCA buy
   */
  async executeDCA() {
    if (this.status !== "running") return;
    this.logger.info("Executing DCA buy...");
    try {
      let amount = new Decimal5(this.dcaConfig.strategyParams.amountPerBuy);
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
      this.emit("error", error);
    }
  }
  async getPrice(token) {
    const price = await this.jupiter.getPrice(token);
    return new Decimal5(price);
  }
  async executeBuy(token, amountUsdc) {
    if (this.mode === "paper") {
      return this.paperBuy(token, amountUsdc);
    }
    return this.realBuy(token, amountUsdc);
  }
  async executeSell(token, amount) {
    if (this.mode === "paper") {
      return this.paperSell(token, amount);
    }
    return this.realSell(token, amount);
  }
  /**
   * Paper trading buy
   */
  async paperBuy(token, amountUsdc) {
    const price = await this.getPrice(token);
    const size = amountUsdc.div(price);
    const trade = {
      id: `trade-${Date.now()}`,
      botId: this.id,
      positionId: "",
      side: "buy",
      token,
      symbol: this.dcaConfig.strategyParams.targetSymbol,
      size,
      price,
      valueUsd: amountUsdc,
      fee: amountUsdc.mul(3e-3),
      slippage: 0.1,
      txSignature: `paper-${Date.now()}`,
      executedAt: Date.now()
    };
    this.emit("trade", trade);
    return trade;
  }
  /**
   * Paper trading sell
   */
  async paperSell(token, amount) {
    const price = await this.getPrice(token);
    const valueUsd = amount.mul(price);
    const trade = {
      id: `trade-${Date.now()}`,
      botId: this.id,
      positionId: "",
      side: "sell",
      token,
      symbol: this.dcaConfig.strategyParams.targetSymbol,
      size: amount,
      price,
      valueUsd,
      fee: valueUsd.mul(3e-3),
      slippage: 0.1,
      txSignature: `paper-${Date.now()}`,
      executedAt: Date.now()
    };
    this.emit("trade", trade);
    return trade;
  }
  /**
   * Real buy via Jupiter
   */
  async realBuy(token, amountUsdc) {
    try {
      const result = await this.jupiter.swap({
        inputMint: USDC_MINT.toBase58(),
        outputMint: token,
        amount: amountUsdc.mul(1e6).toNumber(),
        slippageBps: this.config.slippageTolerance * 100,
        wallet: this.keypair
      });
      const trade = {
        id: `trade-${Date.now()}`,
        botId: this.id,
        positionId: "",
        side: "buy",
        token,
        symbol: this.dcaConfig.strategyParams.targetSymbol,
        size: new Decimal5(result.outputAmount),
        price: new Decimal5(result.price),
        valueUsd: amountUsdc,
        fee: new Decimal5(result.fee || 0),
        slippage: result.slippage || 0,
        txSignature: result.txSignature,
        executedAt: Date.now()
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
  async realSell(token, amount) {
    try {
      const result = await this.jupiter.swap({
        inputMint: token,
        outputMint: USDC_MINT.toBase58(),
        amount: amount.mul(10 ** SOL_DECIMALS).toNumber(),
        slippageBps: this.config.slippageTolerance * 100,
        wallet: this.keypair
      });
      const trade = {
        id: `trade-${Date.now()}`,
        botId: this.id,
        positionId: "",
        side: "sell",
        token,
        symbol: this.dcaConfig.strategyParams.targetSymbol,
        size: amount,
        price: new Decimal5(result.price),
        valueUsd: new Decimal5(result.outputAmount).div(1e6),
        fee: new Decimal5(result.fee || 0),
        slippage: result.slippage || 0,
        txSignature: result.txSignature,
        executedAt: Date.now()
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
  async triggerDCA() {
    await this.executeDCA();
  }
};
function createSOLDCABot(connection, keypair, amountPerBuy = 10, schedule = "0 */4 * * *", mode = "paper") {
  const config = {
    allocatedCapital: new Decimal5(1e3),
    maxPositionSize: new Decimal5(100),
    pairs: ["SOL/USDC"],
    slippageTolerance: 0.5,
    priorityFee: 1e4,
    strategyParams: {
      targetToken: SOL_MINT.toBase58(),
      targetSymbol: "SOL",
      amountPerBuy,
      schedule,
      closeOnStop: false,
      randomizeAmount: true,
      randomizeTime: false
    }
  };
  const riskParams = {
    maxPositionPercent: 100,
    maxTotalExposure: 100,
    stopLossPercent: 0,
    dailyLossLimit: new Decimal5(0),
    weeklyLossLimit: new Decimal5(0),
    maxDrawdownPercent: 0,
    cooldownAfterLoss: 0
  };
  return new DCABot(connection, keypair, config, riskParams, mode);
}

// src/expenses/index.ts
import Decimal6 from "decimal.js";
import { CronJob as CronJob2 } from "cron";
var ExpenseManager = class {
  expenses = /* @__PURE__ */ new Map();
  budget;
  logger;
  checkJob;
  paymentHandler;
  constructor() {
    this.logger = new Logger("Expenses");
    this.budget = this.initializeBudget();
  }
  initializeBudget() {
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      limits: {
        api_subscriptions: new Decimal6(DEFAULT_BUDGET_LIMITS.api_subscriptions),
        infrastructure: new Decimal6(DEFAULT_BUDGET_LIMITS.infrastructure),
        marketing: new Decimal6(DEFAULT_BUDGET_LIMITS.marketing),
        tools: new Decimal6(DEFAULT_BUDGET_LIMITS.tools),
        legal: new Decimal6(DEFAULT_BUDGET_LIMITS.legal),
        other: new Decimal6(DEFAULT_BUDGET_LIMITS.other)
      },
      spent: {
        api_subscriptions: new Decimal6(0),
        infrastructure: new Decimal6(0),
        marketing: new Decimal6(0),
        tools: new Decimal6(0),
        legal: new Decimal6(0),
        other: new Decimal6(0)
      },
      alertThreshold: 80,
      periodStart: startOfMonth.getTime(),
      periodEnd: endOfMonth.getTime()
    };
  }
  /**
   * Start expense monitoring
   */
  start(paymentHandler) {
    this.paymentHandler = paymentHandler;
    this.checkJob = new CronJob2("0 * * * *", async () => {
      await this.checkDueExpenses();
    });
    this.checkJob.start();
    this.logger.info("Expense manager started");
  }
  /**
   * Stop expense monitoring
   */
  stop() {
    if (this.checkJob) {
      this.checkJob.stop();
    }
  }
  /**
   * Add a recurring expense
   */
  addExpense(expense) {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newExpense = {
      ...expense,
      id,
      status: "pending"
    };
    this.expenses.set(id, newExpense);
    this.logger.info(`Added expense: ${expense.name} ($${expense.amount})`);
    return newExpense;
  }
  /**
   * Add common gICM expenses
   */
  addDefaultExpenses() {
    this.addExpense({
      category: "api_subscriptions",
      subcategory: "llm",
      name: "Claude API",
      description: "Anthropic Claude API usage",
      amount: new Decimal6(200),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card"
    });
    this.addExpense({
      category: "api_subscriptions",
      subcategory: "blockchain",
      name: "Helius RPC",
      description: "Solana RPC provider",
      amount: new Decimal6(50),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card"
    });
    this.addExpense({
      category: "infrastructure",
      subcategory: "hosting",
      name: "Vercel Pro",
      description: "Frontend hosting",
      amount: new Decimal6(20),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card"
    });
    this.addExpense({
      category: "infrastructure",
      subcategory: "domain",
      name: "gicm.dev domain",
      description: "Domain registration",
      amount: new Decimal6(15),
      currency: "USD",
      type: "recurring",
      frequency: "yearly",
      nextDueDate: this.getNextYearStart(),
      autoPay: true,
      paymentMethod: "card"
    });
    this.logger.info("Added default expenses");
  }
  /**
   * Check for due expenses and auto-pay
   */
  async checkDueExpenses() {
    const now = Date.now();
    for (const [, expense] of this.expenses) {
      if (expense.status === "cancelled") continue;
      if (!expense.nextDueDate) continue;
      if (expense.nextDueDate <= now) {
        if (expense.autoPay && this.paymentHandler) {
          await this.processPayment(expense);
        } else {
          expense.status = "overdue";
          this.logger.warn(`Expense overdue: ${expense.name}`);
        }
      }
    }
  }
  /**
   * Process a payment
   */
  async processPayment(expense) {
    if (!this.paymentHandler) {
      this.logger.error("No payment handler configured");
      return false;
    }
    if (!this.checkBudget(expense.category, expense.amount)) {
      this.logger.warn(`Budget exceeded for ${expense.category}`);
      return false;
    }
    try {
      this.logger.info(`Processing payment: ${expense.name} ($${expense.amount})`);
      const success = await this.paymentHandler(expense);
      if (success) {
        expense.status = "paid";
        expense.lastPaidAt = Date.now();
        expense.paidAmount = expense.amount;
        this.budget.spent[expense.category] = this.budget.spent[expense.category].add(
          expense.amount
        );
        if (expense.type === "recurring") {
          expense.nextDueDate = this.getNextDueDate(expense.frequency);
          expense.status = "pending";
        }
        this.logger.info(`Payment successful: ${expense.name}`);
        return true;
      } else {
        expense.status = "overdue";
        this.logger.error(`Payment failed: ${expense.name}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Payment error: ${error}`);
      expense.status = "overdue";
      return false;
    }
  }
  /**
   * Check if expense fits in budget
   */
  checkBudget(category, amount) {
    const limit = this.budget.limits[category];
    const spent = this.budget.spent[category];
    const remaining = limit.sub(spent);
    return amount.lte(remaining);
  }
  /**
   * Get budget status
   */
  getBudgetStatus() {
    const alerts = [];
    const byCategory = {};
    let totalLimit = new Decimal6(0);
    let totalSpent = new Decimal6(0);
    for (const category of Object.keys(this.budget.limits)) {
      const limit = this.budget.limits[category];
      const spent = this.budget.spent[category];
      const percent = limit.isZero() ? 0 : spent.div(limit).mul(100).toNumber();
      totalLimit = totalLimit.add(limit);
      totalSpent = totalSpent.add(spent);
      byCategory[category] = { limit, spent, percent };
      if (percent >= this.budget.alertThreshold) {
        alerts.push(`${category}: ${percent.toFixed(0)}% of budget used`);
      }
    }
    return {
      total: {
        limit: totalLimit,
        spent: totalSpent,
        remaining: totalLimit.sub(totalSpent)
      },
      byCategory,
      alerts
    };
  }
  /**
   * Get monthly expense total
   */
  getMonthlyTotal() {
    let total = new Decimal6(0);
    for (const expense of this.expenses.values()) {
      if (expense.status === "cancelled") continue;
      if (expense.frequency === "monthly") {
        total = total.add(expense.amount);
      } else if (expense.frequency === "yearly") {
        total = total.add(expense.amount.div(12));
      }
    }
    return total;
  }
  /**
   * Get all expenses
   */
  getExpenses() {
    return Array.from(this.expenses.values());
  }
  /**
   * Get upcoming expenses
   */
  getUpcoming(days = 30) {
    const cutoff = Date.now() + days * 24 * 60 * 60 * 1e3;
    return Array.from(this.expenses.values()).filter((e) => e.status !== "cancelled" && e.nextDueDate && e.nextDueDate <= cutoff).sort((a, b) => (a.nextDueDate || 0) - (b.nextDueDate || 0));
  }
  // Helpers
  getNextMonthStart() {
    const now = /* @__PURE__ */ new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  }
  getNextYearStart() {
    const now = /* @__PURE__ */ new Date();
    return new Date(now.getFullYear() + 1, 0, 1).getTime();
  }
  getNextDueDate(frequency) {
    const now = Date.now();
    switch (frequency) {
      case "daily":
        return now + 24 * 60 * 60 * 1e3;
      case "weekly":
        return now + 7 * 24 * 60 * 60 * 1e3;
      case "monthly":
        return this.getNextMonthStart();
      case "yearly":
        return this.getNextYearStart();
      default:
        return now;
    }
  }
};

// src/index.ts
var hub = null;
try {
  const { getHub } = await import("@gicm/integration-hub");
  hub = getHub();
} catch {
}
var MoneyEngine = class {
  config;
  connection;
  keypair;
  logger;
  treasury;
  expenseManager;
  tradingBots = /* @__PURE__ */ new Map();
  jupiter;
  isRunning = false;
  constructor(config, keypair) {
    this.config = config;
    this.keypair = keypair;
    this.logger = new Logger("MoneyEngine");
    this.connection = new Connection2(config.rpcUrl, "confirmed");
    this.treasury = new TreasuryManager(this.connection, keypair);
    this.expenseManager = new ExpenseManager();
    this.jupiter = new JupiterClient();
  }
  /**
   * Start the money engine
   */
  async start() {
    if (this.isRunning) return;
    this.logger.info("Starting gICM Money Engine...");
    this.isRunning = true;
    try {
      await this.treasury.refreshBalances();
    } catch (error) {
      this.logger.warn(`Could not refresh balances: ${error}`);
    }
    if (this.config.autoPayExpenses) {
      this.expenseManager.addDefaultExpenses();
      this.expenseManager.start(async (expense) => {
        this.logger.info(`Would pay: ${expense.name} - $${expense.amount}`);
        return true;
      });
    }
    if (this.config.enableTrading) {
      await this.startTradingBots();
    }
    if (hub) {
      hub.engineStarted("money-engine");
      setInterval(() => hub?.heartbeat("money-engine"), 3e4);
    }
    this.logger.info("Money Engine running");
    await this.printStatus();
  }
  /**
   * Stop the money engine
   */
  async stop() {
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
  async startTradingBots() {
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
      if (hub) {
        hub.publish("money-engine", "trade.executed", {
          asset: trade.symbol,
          amount: trade.size.toString(),
          price: trade.price.toString(),
          side: trade.side,
          timestamp: Date.now()
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
  async getStatus() {
    const solPrice = await this.jupiter.getSolPrice() || 225;
    let treasuryStatus;
    try {
      treasuryStatus = await this.treasury.getStatus(solPrice);
    } catch {
      treasuryStatus = {
        totalValueUsd: new Decimal7(0),
        balances: { sol: new Decimal7(0), usdc: new Decimal7(0) },
        allocations: {
          trading: new Decimal7(0),
          operations: new Decimal7(0),
          growth: new Decimal7(0),
          reserve: new Decimal7(0)
        },
        health: { runway: 0, needsRebalance: false }
      };
    }
    const monthlyExpenses = this.expenseManager.getMonthlyTotal();
    const budgetStatus = this.expenseManager.getBudgetStatus();
    let totalTradingPnL = new Decimal7(0);
    for (const [, bot] of this.tradingBots) {
      totalTradingPnL = totalTradingPnL.add(bot.getPerformance().totalPnL);
    }
    const monthlyRevenue = totalTradingPnL;
    return {
      treasury: treasuryStatus,
      expenses: {
        monthly: monthlyExpenses,
        upcoming: this.expenseManager.getUpcoming(7).length,
        budgetStatus
      },
      trading: {
        activeBots: this.tradingBots.size,
        totalPnL: totalTradingPnL
      },
      health: {
        selfSustaining: monthlyRevenue.gte(monthlyExpenses),
        runway: treasuryStatus.health.runway
      }
    };
  }
  /**
   * Print status to console
   */
  async printStatus() {
    const status = await this.getStatus();
    console.log("\n\u{1F4CA} gICM Money Engine Status");
    console.log("\u2550".repeat(50));
    console.log(`
\u{1F4B0} Treasury:`);
    console.log(`   SOL: ${status.treasury.balances.sol.toFixed(4)}`);
    console.log(`   USDC: $${status.treasury.balances.usdc.toFixed(2)}`);
    console.log(`   Total: $${status.treasury.totalValueUsd.toFixed(2)}`);
    console.log(`
\u{1F4E4} Expenses:`);
    console.log(`   Monthly: $${status.expenses.monthly.toFixed(2)}`);
    console.log(`   Upcoming (7d): ${status.expenses.upcoming}`);
    console.log(`
\u{1F4C8} Trading:`);
    console.log(`   Active bots: ${status.trading.activeBots}`);
    console.log(`   Total P&L: $${status.trading.totalPnL.toFixed(2)}`);
    console.log(`
\u2764\uFE0F Health:`);
    console.log(`   Self-sustaining: ${status.health.selfSustaining ? "Yes" : "No"}`);
    console.log(`   Runway: ${status.health.runway.toFixed(1)} months`);
    console.log("\u2550".repeat(50) + "\n");
  }
  /**
   * Trigger manual DCA (for testing)
   */
  async triggerDCA() {
    for (const [, bot] of this.tradingBots) {
      if (bot instanceof DCABot) {
        await bot.triggerDCA();
      }
    }
  }
  /**
   * Get treasury manager
   */
  getTreasury() {
    return this.treasury;
  }
  /**
   * Get expense manager
   */
  getExpenseManager() {
    return this.expenseManager;
  }
  /**
   * Check if running
   */
  isEngineRunning() {
    return this.isRunning;
  }
};

export {
  USDC_MINT,
  SOL_MINT,
  USDC_DECIMALS,
  SOL_DECIMALS,
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_PRIORITY_FEE,
  DEFAULT_ALLOCATIONS,
  DEFAULT_THRESHOLDS,
  DEFAULT_RISK_PARAMS,
  DEFAULT_BUDGET_LIMITS,
  Logger,
  logger,
  TreasuryManager,
  RiskManager,
  BaseBot,
  JupiterClient,
  DCABot,
  createSOLDCABot,
  ExpenseManager,
  MoneyEngine
};
