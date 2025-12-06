import { z } from 'zod';

declare const ChainType: z.ZodEnum<["evm", "solana"]>;
type ChainType = z.infer<typeof ChainType>;
declare const EvmNetwork: z.ZodEnum<["mainnet", "base", "arbitrum", "optimism", "polygon", "bsc"]>;
type EvmNetwork = z.infer<typeof EvmNetwork>;
declare const SolanaNetwork: z.ZodEnum<["mainnet-beta", "devnet", "testnet"]>;
type SolanaNetwork = z.infer<typeof SolanaNetwork>;
declare const AgentConfigSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    llmProvider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "gemini"]>>;
    llmModel: z.ZodOptional<z.ZodString>;
    apiKey: z.ZodOptional<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    llmProvider: "openai" | "anthropic" | "gemini";
    temperature: number;
    maxTokens: number;
    verbose: boolean;
    description?: string | undefined;
    llmModel?: string | undefined;
    apiKey?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    llmProvider?: "openai" | "anthropic" | "gemini" | undefined;
    llmModel?: string | undefined;
    apiKey?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    verbose?: boolean | undefined;
}>;
type AgentConfig = z.infer<typeof AgentConfigSchema>;
declare const AgentResultSchema: z.ZodObject<{
    agent: z.ZodString;
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    reasoning: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    agent: string;
    success: boolean;
    timestamp: number;
    data?: unknown;
    error?: string | undefined;
    confidence?: number | undefined;
    reasoning?: string | undefined;
}, {
    agent: string;
    success: boolean;
    timestamp: number;
    data?: unknown;
    error?: string | undefined;
    confidence?: number | undefined;
    reasoning?: string | undefined;
}>;
type AgentResult = z.infer<typeof AgentResultSchema>;
declare const TransactionSchema: z.ZodObject<{
    hash: z.ZodString;
    chain: z.ZodEnum<["evm", "solana"]>;
    network: z.ZodString;
    from: z.ZodString;
    to: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["pending", "confirmed", "failed"]>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "failed";
    hash: string;
    chain: "evm" | "solana";
    network: string;
    from: string;
    value?: string | undefined;
    data?: string | undefined;
    to?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: string | undefined;
}, {
    status: "pending" | "confirmed" | "failed";
    hash: string;
    chain: "evm" | "solana";
    network: string;
    from: string;
    value?: string | undefined;
    data?: string | undefined;
    to?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: string | undefined;
}>;
type Transaction = z.infer<typeof TransactionSchema>;
declare const TokenSchema: z.ZodObject<{
    address: z.ZodString;
    symbol: z.ZodString;
    name: z.ZodString;
    decimals: z.ZodNumber;
    chain: z.ZodEnum<["evm", "solana"]>;
    logoURI: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    name: string;
    chain: "evm" | "solana";
    address: string;
    decimals: number;
    logoURI?: string | undefined;
}, {
    symbol: string;
    name: string;
    chain: "evm" | "solana";
    address: string;
    decimals: number;
    logoURI?: string | undefined;
}>;
type Token = z.infer<typeof TokenSchema>;
declare const WalletBalanceSchema: z.ZodObject<{
    address: z.ZodString;
    chain: z.ZodEnum<["evm", "solana"]>;
    nativeBalance: z.ZodString;
    tokens: z.ZodArray<z.ZodObject<{
        token: z.ZodObject<{
            address: z.ZodString;
            symbol: z.ZodString;
            name: z.ZodString;
            decimals: z.ZodNumber;
            chain: z.ZodEnum<["evm", "solana"]>;
            logoURI: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        }, {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        }>;
        balance: z.ZodString;
        usdValue: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        token: {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        };
        balance: string;
        usdValue?: number | undefined;
    }, {
        token: {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        };
        balance: string;
        usdValue?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    chain: "evm" | "solana";
    address: string;
    nativeBalance: string;
    tokens: {
        token: {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        };
        balance: string;
        usdValue?: number | undefined;
    }[];
}, {
    chain: "evm" | "solana";
    address: string;
    nativeBalance: string;
    tokens: {
        token: {
            symbol: string;
            name: string;
            chain: "evm" | "solana";
            address: string;
            decimals: number;
            logoURI?: string | undefined;
        };
        balance: string;
        usdValue?: number | undefined;
    }[];
}>;
type WalletBalance = z.infer<typeof WalletBalanceSchema>;
interface AgentContext {
    chain: ChainType;
    network: string;
    walletAddress?: string;
    userQuery?: string;
    previousResults?: AgentResult[];
    metadata?: Record<string, unknown>;
    action?: string;
    params?: Record<string, unknown>;
}
interface AgentTool {
    name: string;
    description: string;
    parameters: z.ZodType;
    execute: (params: unknown, context: AgentContext) => Promise<unknown>;
}

interface ChainProvider {
    chain: ChainType;
    network: string;
    getBalance(address: string): Promise<string>;
    getTokenBalance(address: string, tokenAddress: string): Promise<string>;
    sendTransaction(tx: TransactionRequest): Promise<Transaction>;
    getTransaction(hash: string): Promise<Transaction | null>;
    estimateGas(tx: TransactionRequest): Promise<string>;
    getTokenInfo(address: string): Promise<Token | null>;
}
declare const TransactionRequestSchema: z.ZodObject<{
    to: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
    gasLimit: z.ZodOptional<z.ZodString>;
    maxFeePerGas: z.ZodOptional<z.ZodString>;
    maxPriorityFeePerGas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    to: string;
    value?: string | undefined;
    data?: string | undefined;
    gasLimit?: string | undefined;
    maxFeePerGas?: string | undefined;
    maxPriorityFeePerGas?: string | undefined;
}, {
    to: string;
    value?: string | undefined;
    data?: string | undefined;
    gasLimit?: string | undefined;
    maxFeePerGas?: string | undefined;
    maxPriorityFeePerGas?: string | undefined;
}>;
type TransactionRequest = z.infer<typeof TransactionRequestSchema>;
declare const SwapParamsSchema: z.ZodObject<{
    inputToken: z.ZodString;
    outputToken: z.ZodString;
    amount: z.ZodString;
    slippage: z.ZodDefault<z.ZodNumber>;
    recipient: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    inputToken: string;
    outputToken: string;
    amount: string;
    slippage: number;
    recipient?: string | undefined;
}, {
    inputToken: string;
    outputToken: string;
    amount: string;
    slippage?: number | undefined;
    recipient?: string | undefined;
}>;
type SwapParams = z.infer<typeof SwapParamsSchema>;
interface SwapQuote {
    inputToken: Token;
    outputToken: Token;
    inputAmount: string;
    outputAmount: string;
    priceImpact: number;
    route: string[];
    estimatedGas: string;
}
interface DexProvider {
    name: string;
    chain: ChainType;
    getQuote(params: SwapParams): Promise<SwapQuote>;
    buildSwapTransaction(params: SwapParams): Promise<TransactionRequest>;
}

interface EvmProviderConfig {
    rpcUrl: string;
    chainId: number;
    network: string;
    privateKey?: string;
}
declare class EvmChainProvider implements ChainProvider {
    chain: "evm";
    network: string;
    private config;
    constructor(config: EvmProviderConfig);
    getBalance(address: string): Promise<string>;
    getTokenBalance(address: string, tokenAddress: string): Promise<string>;
    sendTransaction(tx: TransactionRequest): Promise<Transaction>;
    getTransaction(hash: string): Promise<Transaction | null>;
    estimateGas(tx: TransactionRequest): Promise<string>;
    getTokenInfo(address: string): Promise<Token | null>;
    private call;
    private decodeString;
}
declare const EVM_NETWORKS: Record<string, EvmProviderConfig>;

interface SolanaProviderConfig {
    rpcUrl: string;
    network: string;
    privateKey?: string;
}
declare class SolanaChainProvider implements ChainProvider {
    chain: "solana";
    network: string;
    private config;
    constructor(config: SolanaProviderConfig);
    getBalance(address: string): Promise<string>;
    getTokenBalance(address: string, tokenMint: string): Promise<string>;
    sendTransaction(_tx: TransactionRequest): Promise<Transaction>;
    getTransaction(signature: string): Promise<Transaction | null>;
    estimateGas(_tx: TransactionRequest): Promise<string>;
    getTokenInfo(mintAddress: string): Promise<Token | null>;
    getRecentBlockhash(): Promise<string>;
}
declare const SOLANA_NETWORKS: Record<string, SolanaProviderConfig>;

declare function createChainProvider(chain: ChainType, network: string): ChainProvider;

export { type AgentConfig as A, ChainType as C, type DexProvider as D, EvmNetwork as E, SolanaNetwork as S, TransactionSchema as T, WalletBalanceSchema as W, type AgentTool as a, type AgentContext as b, type AgentResult as c, AgentConfigSchema as d, AgentResultSchema as e, type Transaction as f, TokenSchema as g, type Token as h, type WalletBalance as i, createChainProvider as j, type ChainProvider as k, TransactionRequestSchema as l, type TransactionRequest as m, SwapParamsSchema as n, type SwapParams as o, type SwapQuote as p, type EvmProviderConfig as q, EvmChainProvider as r, EVM_NETWORKS as s, type SolanaProviderConfig as t, SolanaChainProvider as u, SOLANA_NETWORKS as v };
