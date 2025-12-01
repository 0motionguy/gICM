/**
 * Pump.fun Sniper Configuration
 * OPUS67 BUILD Mode - vibe-coder + bonding-curve-master
 */

export const CONFIG = {
  // Solana RPC
  RPC_URL: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  WS_URL: process.env.SOLANA_WS_URL || "wss://api.mainnet-beta.solana.com",

  // Pump.fun Program
  PUMP_PROGRAM_ID: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
  PUMP_FEE_RECIPIENT: "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",

  // Jupiter API
  JUPITER_API: "https://quote-api.jup.ag/v6",

  // Trading Parameters
  BUY_AMOUNT_SOL: 0.1,           // Amount to buy in SOL
  SLIPPAGE_BPS: 1000,            // 10% slippage tolerance
  PRIORITY_FEE: 0.001,           // Priority fee in SOL

  // Risk Limits
  MAX_MARKET_CAP: 100000,        // Max $100k market cap
  MIN_LIQUIDITY: 5,              // Min 5 SOL liquidity
  MAX_DAILY_TRADES: 10,          // Max trades per day
  MAX_DAILY_LOSS_SOL: 0.5,       // Stop if down 0.5 SOL

  // Filters
  SKIP_KEYWORDS: ["rug", "scam", "honeypot", "test"],
  REQUIRE_SOCIAL: false,         // Require Twitter/Telegram

  // Mode
  DRY_RUN: true,                 // Set false for live trading
};

export type SniperConfig = typeof CONFIG;
