/**
 * Constants for the Money Engine
 */

import { PublicKey } from "@solana/web3.js";

// Token mints
export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// Common token decimals
export const USDC_DECIMALS = 6;
export const SOL_DECIMALS = 9;

// Default configuration
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const DEFAULT_PRIORITY_FEE = 10000; // lamports

// Treasury defaults
export const DEFAULT_ALLOCATIONS = {
  trading: 0.4,      // 40%
  operations: 0.3,   // 30%
  growth: 0.2,       // 20%
  reserve: 0.1,      // 10%
};

export const DEFAULT_THRESHOLDS = {
  minOperatingBalance: 1000,    // $1000
  maxTradingAllocation: 0.5,    // 50%
  rebalanceThreshold: 0.1,      // 10%
};

// Risk defaults
export const DEFAULT_RISK_PARAMS = {
  maxPositionPercent: 10,       // 10% of capital per position
  maxTotalExposure: 80,         // 80% max exposure
  stopLossPercent: 5,           // 5% stop loss
  dailyLossLimitPercent: 3,     // 3% daily loss limit
  weeklyLossLimitPercent: 10,   // 10% weekly loss limit
  maxDrawdownPercent: 15,       // 15% max drawdown
  cooldownAfterLoss: 3600,      // 1 hour cooldown
};

// Budget defaults
export const DEFAULT_BUDGET_LIMITS = {
  api_subscriptions: 500,
  infrastructure: 200,
  marketing: 300,
  tools: 100,
  legal: 100,
  other: 100,
};
