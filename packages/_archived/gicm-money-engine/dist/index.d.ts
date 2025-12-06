import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { EventEmitter } from 'eventemitter3';

/**
 * gICM Money Engine Types
 */

interface Treasury {
    balances: {
        sol: Decimal;
        usdc: Decimal;
        tokens: Map<string, TokenBalance>;
    };
    allocations: {
        trading: Decimal;
        operations: Decimal;
        growth: Decimal;
        reserve: Decimal;
    };
    wallets: {
        main: string;
        trading: string;
        operations: string;
        cold: string;
    };
    thresholds: {
        minOperatingBalance: Decimal;
        maxTradingAllocation: Decimal;
        rebalanceThreshold: Decimal;
    };
    lastUpdated: number;
    lastRebalance: number;
}
interface TokenBalance {
    mint: string;
    symbol: string;
    balance: Decimal;
    valueUsd: Decimal;
    price: Decimal;
}
type TradingMode = "paper" | "micro" | "live";
type BotType = "hedge-fund" | "dca" | "yield" | "arbitrage" | "grid";
type BotStatus = "running" | "paused" | "error" | "stopped";
interface TradingBot {
    id: string;
    type: BotType;
    name: string;
    status: BotStatus;
    mode: TradingMode;
    config: BotConfig;
    performance: BotPerformance;
    riskParams: RiskParameters;
    positions: Position[];
    pendingOrders: Order[];
    createdAt: number;
    lastTradeAt?: number;
    lastErrorAt?: number;
}
interface BotConfig {
    allocatedCapital: Decimal;
    maxPositionSize: Decimal;
    pairs: string[];
    strategyParams: Record<string, unknown>;
    slippageTolerance: number;
    priorityFee: number;
}
interface BotPerformance {
    totalPnL: Decimal;
    realizedPnL: Decimal;
    unrealizedPnL: Decimal;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    dailyPnL: Decimal;
    weeklyPnL: Decimal;
    monthlyPnL: Decimal;
}
interface RiskParameters {
    maxPositionPercent: number;
    maxTotalExposure: number;
    stopLossPercent: number;
    dailyLossLimit: Decimal;
    weeklyLossLimit: Decimal;
    maxDrawdownPercent: number;
    cooldownAfterLoss: number;
}
interface Position {
    id: string;
    botId: string;
    token: string;
    symbol: string;
    side: "long" | "short";
    size: Decimal;
    entryPrice: Decimal;
    currentPrice: Decimal;
    unrealizedPnL: Decimal;
    unrealizedPnLPercent: number;
    stopLoss?: Decimal;
    takeProfit?: Decimal;
    openedAt: number;
    updatedAt: number;
}
interface Order {
    id: string;
    botId: string;
    type: "market" | "limit";
    side: "buy" | "sell";
    token: string;
    size: Decimal;
    price?: Decimal;
    status: "pending" | "filled" | "cancelled" | "failed";
    txSignature?: string;
    filledAt?: number;
    filledPrice?: Decimal;
    createdAt: number;
}
interface Trade {
    id: string;
    botId: string;
    positionId: string;
    side: "buy" | "sell";
    token: string;
    symbol: string;
    size: Decimal;
    price: Decimal;
    valueUsd: Decimal;
    fee: Decimal;
    slippage: number;
    realizedPnL?: Decimal;
    txSignature: string;
    executedAt: number;
}
interface RevenueStream {
    source: "subscriptions" | "api" | "marketplace" | "trading";
    daily: Decimal;
    weekly: Decimal;
    monthly: Decimal;
    allTime: Decimal;
    growthRate: number;
}
interface Subscription {
    id: string;
    userId: string;
    tier: "free" | "pro" | "enterprise";
    price: Decimal;
    currency: "USD" | "SOL";
    billingCycle: "monthly" | "yearly";
    startDate: number;
    nextBillingDate: number;
    status: "active" | "cancelled" | "past_due";
    paymentMethod: "card" | "crypto";
    walletAddress?: string;
}
interface Expense {
    id: string;
    category: ExpenseCategory;
    subcategory: string;
    name: string;
    description: string;
    amount: Decimal;
    currency: "USD" | "SOL";
    type: "one-time" | "recurring";
    frequency?: "daily" | "weekly" | "monthly" | "yearly";
    nextDueDate?: number;
    status: "pending" | "paid" | "overdue" | "cancelled";
    autoPay: boolean;
    paymentMethod?: "card" | "crypto" | "api_deduction";
    lastPaidAt?: number;
    paidAmount?: Decimal;
    txSignature?: string;
}
type ExpenseCategory = "api_subscriptions" | "infrastructure" | "marketing" | "tools" | "legal" | "other";
interface Budget {
    limits: Record<ExpenseCategory, Decimal>;
    spent: Record<ExpenseCategory, Decimal>;
    alertThreshold: number;
    periodStart: number;
    periodEnd: number;
}
interface FinancialReport {
    period: "daily" | "weekly" | "monthly";
    startDate: number;
    endDate: number;
    summary: {
        totalRevenue: Decimal;
        totalExpenses: Decimal;
        netProfit: Decimal;
        profitMargin: number;
    };
    revenue: {
        trading: Decimal;
        subscriptions: Decimal;
        api: Decimal;
        marketplace: Decimal;
    };
    expenses: Record<ExpenseCategory, Decimal>;
    trading: {
        totalPnL: Decimal;
        winRate: number;
        tradesExecuted: number;
        bestTrade: Decimal;
        worstTrade: Decimal;
    };
    treasury: {
        totalValue: Decimal;
        change: Decimal;
        changePercent: number;
    };
    health: {
        runway: number;
        burnRate: Decimal;
        selfSustaining: boolean;
    };
}
interface MoneyEngineConfig {
    rpcUrl: string;
    tradingMode: TradingMode;
    enableTrading: boolean;
    dcaAmountPerBuy: number;
    dcaSchedule: string;
    autoPayExpenses: boolean;
}

/**
 * Treasury Management
 *
 * Manages all gICM funds, allocations, and rebalancing.
 */

declare class TreasuryManager {
    private connection;
    private treasury;
    private logger;
    private keypair;
    constructor(connection: Connection, keypair: Keypair);
    private initializeTreasury;
    /**
     * Refresh all balances
     */
    refreshBalances(): Promise<void>;
    /**
     * Get total treasury value in USD
     */
    getTotalValueUsd(solPrice: number): Promise<Decimal>;
    /**
     * Get allocation amounts
     */
    getAllocations(solPrice: number): Promise<{
        trading: Decimal;
        operations: Decimal;
        growth: Decimal;
        reserve: Decimal;
    }>;
    /**
     * Check if rebalance needed
     */
    needsRebalance(solPrice: number): Promise<boolean>;
    /**
     * Get available for trading
     */
    getAvailableForTrading(solPrice: number): Promise<Decimal>;
    /**
     * Get runway in months
     */
    getRunwayMonths(monthlyExpenses: Decimal, solPrice: number): Promise<number>;
    /**
     * Check if self-sustaining
     */
    isSelfSustaining(monthlyRevenue: Decimal, monthlyExpenses: Decimal): boolean;
    /**
     * Get treasury status
     */
    getStatus(solPrice: number): Promise<{
        totalValueUsd: Decimal;
        balances: {
            sol: Decimal;
            usdc: Decimal;
        };
        allocations: {
            trading: Decimal;
            operations: Decimal;
            growth: Decimal;
            reserve: Decimal;
        };
        health: {
            runway: number;
            needsRebalance: boolean;
        };
    }>;
    /**
     * Export state
     */
    getState(): Treasury;
    /**
     * Get wallet address
     */
    getWalletAddress(): string;
}

/**
 * Expense Manager
 *
 * Tracks and auto-pays recurring expenses.
 */

declare class ExpenseManager {
    private expenses;
    private budget;
    private logger;
    private checkJob?;
    private paymentHandler?;
    constructor();
    private initializeBudget;
    /**
     * Start expense monitoring
     */
    start(paymentHandler: (expense: Expense) => Promise<boolean>): void;
    /**
     * Stop expense monitoring
     */
    stop(): void;
    /**
     * Add a recurring expense
     */
    addExpense(expense: Omit<Expense, "id" | "status">): Expense;
    /**
     * Add common gICM expenses
     */
    addDefaultExpenses(): void;
    /**
     * Check for due expenses and auto-pay
     */
    checkDueExpenses(): Promise<void>;
    /**
     * Process a payment
     */
    processPayment(expense: Expense): Promise<boolean>;
    /**
     * Check if expense fits in budget
     */
    checkBudget(category: ExpenseCategory, amount: Decimal): boolean;
    /**
     * Get budget status
     */
    getBudgetStatus(): {
        total: {
            limit: Decimal;
            spent: Decimal;
            remaining: Decimal;
        };
        byCategory: Record<ExpenseCategory, {
            limit: Decimal;
            spent: Decimal;
            percent: number;
        }>;
        alerts: string[];
    };
    /**
     * Get monthly expense total
     */
    getMonthlyTotal(): Decimal;
    /**
     * Get all expenses
     */
    getExpenses(): Expense[];
    /**
     * Get upcoming expenses
     */
    getUpcoming(days?: number): Expense[];
    private getNextMonthStart;
    private getNextYearStart;
    private getNextDueDate;
}

/**
 * Constants for the Money Engine
 */

declare const USDC_MINT: PublicKey;
declare const SOL_MINT: PublicKey;
declare const USDC_DECIMALS = 6;
declare const SOL_DECIMALS = 9;
declare const DEFAULT_SLIPPAGE_BPS = 50;
declare const DEFAULT_PRIORITY_FEE = 10000;
declare const DEFAULT_ALLOCATIONS: {
    trading: number;
    operations: number;
    growth: number;
    reserve: number;
};
declare const DEFAULT_THRESHOLDS: {
    minOperatingBalance: number;
    maxTradingAllocation: number;
    rebalanceThreshold: number;
};
declare const DEFAULT_RISK_PARAMS: {
    maxPositionPercent: number;
    maxTotalExposure: number;
    stopLossPercent: number;
    dailyLossLimitPercent: number;
    weeklyLossLimitPercent: number;
    maxDrawdownPercent: number;
    cooldownAfterLoss: number;
};
declare const DEFAULT_BUDGET_LIMITS: {
    api_subscriptions: number;
    infrastructure: number;
    marketing: number;
    tools: number;
    legal: number;
    other: number;
};

/**
 * Risk Manager
 *
 * Manages trading risk parameters and validates positions.
 */

declare class RiskManager {
    private params;
    private logger;
    private dailyLossTracking;
    private weeklyLossTracking;
    private lastDailyReset;
    private lastWeeklyReset;
    constructor(params?: Partial<RiskParameters>);
    /**
     * Check if a new position can be opened
     */
    canOpenPosition(performance: BotPerformance, positionSize: Decimal, totalCapital: Decimal): boolean;
    /**
     * Calculate current exposure as percentage
     */
    private calculateCurrentExposure;
    /**
     * Record a loss for tracking
     */
    recordLoss(amount: Decimal): void;
    /**
     * Record a profit for tracking
     */
    recordProfit(amount: Decimal): void;
    /**
     * Reset tracking counters if period has passed
     */
    private resetTrackingIfNeeded;
    /**
     * Calculate optimal position size based on risk
     */
    calculatePositionSize(totalCapital: Decimal, riskPercent?: number): Decimal;
    /**
     * Get stop loss price for a position
     */
    getStopLossPrice(entryPrice: Decimal, side: "long" | "short"): Decimal;
    /**
     * Check if bot should be paused due to losses
     */
    shouldPauseTrading(performance: BotPerformance): boolean;
    /**
     * Get parameters
     */
    getParams(): RiskParameters;
    /**
     * Update parameters
     */
    updateParams(params: Partial<RiskParameters>): void;
}

/**
 * Logger utility using Pino
 */
declare class Logger {
    private logger;
    constructor(name: string);
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
}
declare const logger: Logger;

/**
 * Base Trading Bot
 *
 * Abstract base class for all trading bots.
 */

interface BotEvents {
    started: () => void;
    stopped: () => void;
    trade: (trade: Trade) => void;
    "position:opened": (position: Position) => void;
    "position:closed": (position: Position, pnl: Decimal) => void;
    error: (error: Error) => void;
    "risk:alert": (message: string) => void;
}
declare abstract class BaseBot extends EventEmitter<BotEvents> {
    protected id: string;
    protected name: string;
    protected botType: BotType;
    protected mode: TradingMode;
    protected status: BotStatus;
    protected config: BotConfig;
    protected performance: BotPerformance;
    protected riskManager: RiskManager;
    protected logger: Logger;
    protected positions: Map<string, Position>;
    protected pendingOrders: Map<string, Order>;
    protected tradeHistory: Trade[];
    constructor(id: string, name: string, botType: BotType, config: BotConfig, riskParams: RiskParameters, mode?: TradingMode);
    private initializePerformance;
    start(): Promise<void>;
    stop(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    protected abstract onStart(): Promise<void>;
    protected abstract onStop(): Promise<void>;
    protected abstract onTick(): Promise<void>;
    protected abstract getPrice(token: string): Promise<Decimal>;
    protected abstract executeBuy(token: string, amount: Decimal): Promise<Trade | null>;
    protected abstract executeSell(token: string, amount: Decimal): Promise<Trade | null>;
    protected openPosition(token: string, symbol: string, size: Decimal, side?: "long" | "short"): Promise<Position | null>;
    protected closePosition(positionId: string): Promise<Decimal | null>;
    protected closeAllPositions(): Promise<void>;
    protected updatePositions(): Promise<void>;
    private calculateTakeProfit;
    private shouldTriggerStopLoss;
    private shouldTriggerTakeProfit;
    private updateWinRate;
    getId(): string;
    getName(): string;
    getStatus(): BotStatus;
    getMode(): TradingMode;
    getPerformance(): BotPerformance;
    getPositions(): Position[];
    getTradeHistory(): Trade[];
    getState(): TradingBot;
}

/**
 * Dollar-Cost Averaging Bot
 *
 * Simple, safe bot that buys fixed amounts at regular intervals.
 */

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
declare class DCABot extends BaseBot {
    private connection;
    private keypair;
    private jupiter;
    private cronJob?;
    private dcaConfig;
    constructor(connection: Connection, keypair: Keypair, config: DCAConfig, riskParams: RiskParameters, mode?: TradingMode);
    protected onStart(): Promise<void>;
    protected onStop(): Promise<void>;
    protected onTick(): Promise<void>;
    /**
     * Execute DCA buy
     */
    private executeDCA;
    protected getPrice(token: string): Promise<Decimal>;
    protected executeBuy(token: string, amountUsdc: Decimal): Promise<Trade | null>;
    protected executeSell(token: string, amount: Decimal): Promise<Trade | null>;
    /**
     * Paper trading buy
     */
    private paperBuy;
    /**
     * Paper trading sell
     */
    private paperSell;
    /**
     * Real buy via Jupiter
     */
    private realBuy;
    /**
     * Real sell via Jupiter
     */
    private realSell;
    /**
     * Manually trigger DCA (for testing)
     */
    triggerDCA(): Promise<void>;
}
/**
 * Create a DCA bot for SOL accumulation
 */
declare function createSOLDCABot(connection: Connection, keypair: Keypair, amountPerBuy?: number, schedule?: string, mode?: TradingMode): DCABot;

/**
 * Jupiter DEX Client
 *
 * Handles token swaps on Solana via Jupiter aggregator.
 */

interface SwapParams {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps: number;
    wallet: Keypair;
}
interface SwapResult {
    txSignature: string;
    inputAmount: number;
    outputAmount: number;
    price: number;
    fee?: number;
    slippage?: number;
}
interface QuoteResult {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    routePlan: unknown[];
}
declare class JupiterClient {
    private logger;
    private baseUrl;
    constructor();
    /**
     * Get price for a token in USDC
     */
    getPrice(tokenMint: string): Promise<number>;
    /**
     * Get swap quote
     */
    getQuote(inputMint: string, outputMint: string, amount: number, slippageBps: number): Promise<QuoteResult | null>;
    /**
     * Execute a swap
     */
    swap(params: SwapParams): Promise<SwapResult>;
    /**
     * Get SOL price in USD
     */
    getSolPrice(): Promise<number>;
}

/**
 * gICM Money Engine
 *
 * Self-funding system for gICM platform.
 */

declare class MoneyEngine {
    private config;
    private connection;
    private keypair;
    private logger;
    private treasury;
    private expenseManager;
    private tradingBots;
    private jupiter;
    private isRunning;
    constructor(config: MoneyEngineConfig, keypair: Keypair);
    /**
     * Start the money engine
     */
    start(): Promise<void>;
    /**
     * Stop the money engine
     */
    stop(): Promise<void>;
    /**
     * Start trading bots
     */
    private startTradingBots;
    /**
     * Get financial status
     */
    getStatus(): Promise<{
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
    }>;
    /**
     * Print status to console
     */
    printStatus(): Promise<void>;
    /**
     * Trigger manual DCA (for testing)
     */
    triggerDCA(): Promise<void>;
    /**
     * Get treasury manager
     */
    getTreasury(): TreasuryManager;
    /**
     * Get expense manager
     */
    getExpenseManager(): ExpenseManager;
    /**
     * Check if running
     */
    isEngineRunning(): boolean;
}

export { BaseBot, type BotConfig, type BotEvents, type BotPerformance, type BotStatus, type BotType, type Budget, DCABot, DEFAULT_ALLOCATIONS, DEFAULT_BUDGET_LIMITS, DEFAULT_PRIORITY_FEE, DEFAULT_RISK_PARAMS, DEFAULT_SLIPPAGE_BPS, DEFAULT_THRESHOLDS, type Expense, type ExpenseCategory, ExpenseManager, type FinancialReport, JupiterClient, Logger, MoneyEngine, type MoneyEngineConfig, type Order, type Position, type QuoteResult, type RevenueStream, RiskManager, type RiskParameters, SOL_DECIMALS, SOL_MINT, type Subscription, type SwapParams, type SwapResult, type TokenBalance, type Trade, type TradingBot, type TradingMode, type Treasury, TreasuryManager, USDC_DECIMALS, USDC_MINT, createSOLDCABot, logger };
