import { z } from "zod";

export const TokenDataSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  price: z.number(),
  priceChange24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number().optional(),
  liquidity: z.number(),
  holders: z.number().optional(),
  fdv: z.number().optional(),
});
export type TokenData = z.infer<typeof TokenDataSchema>;

export const PoolDataSchema = z.object({
  address: z.string(),
  name: z.string(),
  dex: z.string(),
  token0: TokenDataSchema,
  token1: TokenDataSchema,
  tvl: z.number(),
  volume24h: z.number(),
  apy: z.number().optional(),
  fee: z.number(),
});
export type PoolData = z.infer<typeof PoolDataSchema>;

export const TradeSchema = z.object({
  hash: z.string(),
  timestamp: z.number(),
  type: z.enum(["buy", "sell"]),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.string(),
  amountOut: z.string(),
  priceUsd: z.number(),
  trader: z.string(),
  dex: z.string(),
});
export type Trade = z.infer<typeof TradeSchema>;

export const WhaleAlertSchema = z.object({
  wallet: z.string(),
  action: z.enum(["buy", "sell", "transfer"]),
  token: z.string(),
  amount: z.string(),
  usdValue: z.number(),
  timestamp: z.number(),
});
export type WhaleAlert = z.infer<typeof WhaleAlertSchema>;

export interface DeFiAnalysis {
  token: TokenData;
  pools: PoolData[];
  recentTrades: Trade[];
  whaleActivity: WhaleAlert[];
  signals: {
    sentiment: "bullish" | "bearish" | "neutral";
    momentum: number;
    volumeTrend: "increasing" | "decreasing" | "stable";
    liquidityHealth: "good" | "warning" | "critical";
  };
  riskScore: number;
  recommendation: string;
}

export interface DefiAgentConfig {
  birdeyeApiKey?: string;
  chain?: "solana" | "evm";
}
