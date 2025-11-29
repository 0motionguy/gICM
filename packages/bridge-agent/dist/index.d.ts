import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';
import { z } from 'zod';

declare const BridgeAgentConfigSchema: z.ZodObject<{
    wormholeRpc: z.ZodDefault<z.ZodString>;
    layerZeroEndpoint: z.ZodOptional<z.ZodString>;
    debridgeApiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    wormholeRpc: string;
    layerZeroEndpoint?: string | undefined;
    debridgeApiKey?: string | undefined;
}, {
    wormholeRpc?: string | undefined;
    layerZeroEndpoint?: string | undefined;
    debridgeApiKey?: string | undefined;
}>;
type BridgeAgentConfig = z.infer<typeof BridgeAgentConfigSchema>;
type Chain = "ethereum" | "bsc" | "polygon" | "arbitrum" | "optimism" | "base" | "avalanche" | "solana" | "sui" | "aptos";
interface BridgeQuote {
    bridgeId: string;
    bridgeName: string;
    sourceChain: Chain;
    destChain: Chain;
    sourceToken: string;
    destToken: string;
    inputAmount: string;
    outputAmount: string;
    fee: string;
    feeUsd: number;
    estimatedTime: number;
    priceImpact: number;
    slippage: number;
}
interface BridgeRoute {
    quotes: BridgeQuote[];
    bestQuote: BridgeQuote;
    comparison: {
        cheapest: BridgeQuote;
        fastest: BridgeQuote;
        bestValue: BridgeQuote;
    };
}
interface BridgeTransaction {
    id: string;
    bridgeId: string;
    bridgeName: string;
    sourceChain: Chain;
    destChain: Chain;
    sourceToken: string;
    destToken: string;
    inputAmount: string;
    outputAmount?: string;
    status: "pending" | "processing" | "completed" | "failed";
    sourceTxHash: string;
    destTxHash?: string;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}
interface SupportedToken {
    symbol: string;
    address: string;
    chain: Chain;
    decimals: number;
    name: string;
    logoUri?: string;
}
interface BridgeProvider {
    name: string;
    id: string;
    supportedChains: Chain[];
    getQuote(params: QuoteParams): Promise<BridgeQuote | null>;
    getTransaction(txId: string): Promise<BridgeTransaction | null>;
    getSupportedTokens(chain: Chain): Promise<SupportedToken[]>;
}
interface QuoteParams {
    sourceChain: Chain;
    destChain: Chain;
    sourceToken: string;
    destToken: string;
    amount: string;
    slippage?: number;
}

interface FeeEstimate {
    bridgeFee: number;
    bridgeFeeUsd: number;
    gasFeeSource: number;
    gasFeeSourceUsd: number;
    gasFeeDest: number;
    gasFeeDestUsd: number;
    totalFee: number;
    totalFeeUsd: number;
}
interface TimeEstimate {
    minTime: number;
    avgTime: number;
    maxTime: number;
    confidence: number;
}
declare class Estimator {
    estimateFees(quote: BridgeQuote, gasLevel?: "low" | "avg" | "high"): FeeEstimate;
    private estimateSourceGas;
    private estimateDestGas;
    estimateTime(bridgeId: string): TimeEstimate;
    calculateSlippageImpact(inputAmount: string, outputAmount: string, priceImpact: number): {
        effectiveRate: number;
        slippageLoss: number;
        slippageLossUsd: number;
    };
    compareQuotes(quotes: BridgeQuote[]): {
        ranked: Array<{
            quote: BridgeQuote;
            score: number;
            fees: FeeEstimate;
            time: TimeEstimate;
        }>;
    };
}

interface BridgeAgentAnalysis {
    route?: BridgeRoute;
    transaction?: BridgeTransaction;
    fees?: FeeEstimate;
    timeEstimate?: TimeEstimate;
    aiSummary?: string;
}
declare class BridgeAgent extends BaseAgent {
    private pathfinder;
    private estimator;
    private bridgeConfig;
    private llmClient?;
    constructor(config: BridgeAgentConfig & AgentConfig);
    private initializeTools;
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    getQuote(params: QuoteParams): Promise<BridgeQuote[]>;
    findBestRoute(params: QuoteParams): Promise<BridgeRoute | null>;
    compareBridges(params: QuoteParams): Promise<{
        ranked: Array<{
            quote: BridgeQuote;
            score: number;
            fees: FeeEstimate;
            time: TimeEstimate;
        }>;
    }>;
    trackTransaction(bridgeId: string, txId: string): Promise<BridgeTransaction | null>;
    estimateFees(quote: BridgeQuote): FeeEstimate;
    estimateTime(bridgeId: string): TimeEstimate;
    getSupportedChains(): Chain[];
}

declare class WormholeProvider implements BridgeProvider {
    name: string;
    id: string;
    supportedChains: Chain[];
    private apiUrl;
    constructor(apiUrl?: string);
    private fetch;
    getQuote(params: QuoteParams): Promise<BridgeQuote | null>;
    private simulateQuote;
    getTransaction(txId: string): Promise<BridgeTransaction | null>;
    private mapStatus;
    getSupportedTokens(chain: Chain): Promise<SupportedToken[]>;
}

declare class LayerZeroProvider implements BridgeProvider {
    name: string;
    id: string;
    supportedChains: Chain[];
    private endpointUrl?;
    constructor(endpointUrl?: string);
    getQuote(params: QuoteParams): Promise<BridgeQuote | null>;
    private estimateFee;
    getTransaction(_txId: string): Promise<BridgeTransaction | null>;
    getSupportedTokens(_chain: Chain): Promise<SupportedToken[]>;
    getEndpointId(chain: Chain): number | null;
}

declare class DeBridgeProvider implements BridgeProvider {
    name: string;
    id: string;
    supportedChains: Chain[];
    private apiKey?;
    private baseUrl;
    constructor(config?: {
        apiKey?: string;
    });
    private fetch;
    getQuote(params: QuoteParams): Promise<BridgeQuote | null>;
    private simulateQuote;
    getTransaction(orderId: string): Promise<BridgeTransaction | null>;
    private mapStatus;
    getSupportedTokens(chain: Chain): Promise<SupportedToken[]>;
}

interface PathfinderConfig {
    maxHops?: number;
    preferredBridges?: string[];
    excludeBridges?: string[];
}
declare class Pathfinder {
    private providers;
    private config;
    constructor(providers: BridgeProvider[], config?: PathfinderConfig);
    findBestRoute(params: QuoteParams): Promise<BridgeRoute | null>;
    getAllQuotes(params: QuoteParams): Promise<BridgeQuote[]>;
    private getActiveProviders;
    private findMultiHopRoutes;
    private selectBestRoute;
    private selectCheapest;
    private selectFastest;
    private selectBestValue;
    addProvider(provider: BridgeProvider): void;
    removeProvider(providerId: string): void;
}

export { BridgeAgent, type BridgeAgentAnalysis, type BridgeAgentConfig, BridgeAgentConfigSchema, type BridgeProvider, type BridgeQuote, type BridgeRoute, type BridgeTransaction, type Chain, DeBridgeProvider, Estimator, type FeeEstimate, LayerZeroProvider, Pathfinder, type PathfinderConfig, type QuoteParams, type SupportedToken, type TimeEstimate, WormholeProvider };
