/**
 * gICM Money Engine Types
 */

import Decimal from "decimal.js";

// ============================================================================
// TREASURY
// ============================================================================

export interface Treasury {
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

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: Decimal;
  valueUsd: Decimal;
  price: Decimal;
}

// ============================================================================
// TRADING
// ============================================================================

export type TradingMode = "paper" | "micro" | "live";
export type BotType = "hedge-fund" | "dca" | "yield" | "arbitrage" | "grid";
export type BotStatus = "running" | "paused" | "error" | "stopped";

export interface TradingBot {
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

export interface BotConfig {
  allocatedCapital: Decimal;
  maxPositionSize: Decimal;
  pairs: string[];
  strategyParams: Record<string, unknown>;
  slippageTolerance: number;
  priorityFee: number;
}

export interface BotPerformance {
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

export interface RiskParameters {
  maxPositionPercent: number;
  maxTotalExposure: number;
  stopLossPercent: number;
  dailyLossLimit: Decimal;
  weeklyLossLimit: Decimal;
  maxDrawdownPercent: number;
  cooldownAfterLoss: number;
}

export interface Position {
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

export interface Order {
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

export interface Trade {
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

// ============================================================================
// REVENUE
// ============================================================================

export interface RevenueStream {
  source: "subscriptions" | "api" | "marketplace" | "trading";
  daily: Decimal;
  weekly: Decimal;
  monthly: Decimal;
  allTime: Decimal;
  growthRate: number;
}

export interface Subscription {
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

// ============================================================================
// EXPENSES
// ============================================================================

export interface Expense {
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

export type ExpenseCategory =
  | "api_subscriptions"
  | "infrastructure"
  | "marketing"
  | "tools"
  | "legal"
  | "other";

export interface Budget {
  limits: Record<ExpenseCategory, Decimal>;
  spent: Record<ExpenseCategory, Decimal>;
  alertThreshold: number;
  periodStart: number;
  periodEnd: number;
}

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

export interface FinancialReport {
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

// ============================================================================
// CONFIG
// ============================================================================

export interface MoneyEngineConfig {
  rpcUrl: string;
  tradingMode: TradingMode;
  enableTrading: boolean;
  dcaAmountPerBuy: number;
  dcaSchedule: string;
  autoPayExpenses: boolean;
}
