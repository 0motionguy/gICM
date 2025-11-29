import { z } from 'zod';
import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';

declare const TokenDataSchema: z.ZodObject<{
    address: z.ZodString;
    symbol: z.ZodString;
    name: z.ZodString;
    decimals: z.ZodNumber;
    price: z.ZodNumber;
    priceChange24h: z.ZodNumber;
    volume24h: z.ZodNumber;
    marketCap: z.ZodOptional<z.ZodNumber>;
    liquidity: z.ZodNumber;
    holders: z.ZodOptional<z.ZodNumber>;
    fdv: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    marketCap?: number | undefined;
    holders?: number | undefined;
    fdv?: number | undefined;
}, {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    marketCap?: number | undefined;
    holders?: number | undefined;
    fdv?: number | undefined;
}>;
type TokenData = z.infer<typeof TokenDataSchema>;
declare const PoolDataSchema: z.ZodObject<{
    address: z.ZodString;
    name: z.ZodString;
    dex: z.ZodString;
    token0: z.ZodObject<{
        address: z.ZodString;
        symbol: z.ZodString;
        name: z.ZodString;
        decimals: z.ZodNumber;
        price: z.ZodNumber;
        priceChange24h: z.ZodNumber;
        volume24h: z.ZodNumber;
        marketCap: z.ZodOptional<z.ZodNumber>;
        liquidity: z.ZodNumber;
        holders: z.ZodOptional<z.ZodNumber>;
        fdv: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    }, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    }>;
    token1: z.ZodObject<{
        address: z.ZodString;
        symbol: z.ZodString;
        name: z.ZodString;
        decimals: z.ZodNumber;
        price: z.ZodNumber;
        priceChange24h: z.ZodNumber;
        volume24h: z.ZodNumber;
        marketCap: z.ZodOptional<z.ZodNumber>;
        liquidity: z.ZodNumber;
        holders: z.ZodOptional<z.ZodNumber>;
        fdv: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    }, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    }>;
    tvl: z.ZodNumber;
    volume24h: z.ZodNumber;
    apy: z.ZodOptional<z.ZodNumber>;
    fee: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    address: string;
    name: string;
    volume24h: number;
    dex: string;
    token0: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    };
    token1: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    };
    tvl: number;
    fee: number;
    apy?: number | undefined;
}, {
    address: string;
    name: string;
    volume24h: number;
    dex: string;
    token0: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    };
    token1: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        price: number;
        priceChange24h: number;
        volume24h: number;
        liquidity: number;
        marketCap?: number | undefined;
        holders?: number | undefined;
        fdv?: number | undefined;
    };
    tvl: number;
    fee: number;
    apy?: number | undefined;
}>;
type PoolData = z.infer<typeof PoolDataSchema>;
declare const TradeSchema: z.ZodObject<{
    hash: z.ZodString;
    timestamp: z.ZodNumber;
    type: z.ZodEnum<["buy", "sell"]>;
    tokenIn: z.ZodString;
    tokenOut: z.ZodString;
    amountIn: z.ZodString;
    amountOut: z.ZodString;
    priceUsd: z.ZodNumber;
    trader: z.ZodString;
    dex: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "buy" | "sell";
    dex: string;
    hash: string;
    timestamp: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    priceUsd: number;
    trader: string;
}, {
    type: "buy" | "sell";
    dex: string;
    hash: string;
    timestamp: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    priceUsd: number;
    trader: string;
}>;
type Trade = z.infer<typeof TradeSchema>;
declare const WhaleAlertSchema: z.ZodObject<{
    wallet: z.ZodString;
    action: z.ZodEnum<["buy", "sell", "transfer"]>;
    token: z.ZodString;
    amount: z.ZodString;
    usdValue: z.ZodNumber;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    wallet: string;
    action: "buy" | "sell" | "transfer";
    token: string;
    amount: string;
    usdValue: number;
}, {
    timestamp: number;
    wallet: string;
    action: "buy" | "sell" | "transfer";
    token: string;
    amount: string;
    usdValue: number;
}>;
type WhaleAlert = z.infer<typeof WhaleAlertSchema>;
interface DeFiAnalysis {
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
interface DefiAgentConfig {
    birdeyeApiKey?: string;
    chain?: "solana" | "evm";
}

declare class BirdeyeProvider {
    private apiKey;
    constructor(apiKey: string);
    private fetch;
    getTokenPrice(address: string): Promise<TokenData | null>;
    getTokenTrades(address: string, limit?: number): Promise<Trade[]>;
    getTokenPools(address: string): Promise<PoolData[]>;
    getWalletPortfolio(wallet: string): Promise<TokenData[]>;
}

declare class DexScreenerProvider {
    getTokenPairs(address: string, chain?: string): Promise<PoolData[]>;
    searchTokens(query: string): Promise<TokenData[]>;
    getTrendingTokens(chain?: string): Promise<TokenData[]>;
}

declare class DefiAgent extends BaseAgent {
    private defiConfig;
    private birdeye;
    private dexscreener;
    constructor(config: AgentConfig, defiConfig?: DefiAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    analyzeToken(address: string, chain?: "solana" | "evm"): Promise<DeFiAnalysis>;
    private calculateSignals;
    private calculateRiskScore;
    private generateRecommendation;
    searchToken(query: string): Promise<TokenData[]>;
    getTrending(): Promise<TokenData[]>;
}

export { BirdeyeProvider, type DeFiAnalysis, DefiAgent, type DefiAgentConfig, DexScreenerProvider, type PoolData, PoolDataSchema, type TokenData, TokenDataSchema, type Trade, TradeSchema, type WhaleAlert, WhaleAlertSchema };
