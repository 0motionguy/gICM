import { z } from 'zod';
import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';

declare const WalletActionSchema: z.ZodEnum<["transfer", "swap", "balance", "deploy_token", "mint_nft", "stake", "unstake"]>;
type WalletAction = z.infer<typeof WalletActionSchema>;
declare const TransferParamsSchema: z.ZodObject<{
    action: z.ZodLiteral<"transfer">;
    to: z.ZodString;
    amount: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "transfer";
    to: string;
    amount: string;
    token?: string | undefined;
}, {
    action: "transfer";
    to: string;
    amount: string;
    token?: string | undefined;
}>;
type TransferParams = z.infer<typeof TransferParamsSchema>;
declare const SwapParamsSchema: z.ZodObject<{
    action: z.ZodLiteral<"swap">;
    inputToken: z.ZodString;
    outputToken: z.ZodString;
    amount: z.ZodString;
    slippage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: "swap";
    amount: string;
    inputToken: string;
    outputToken: string;
    slippage: number;
}, {
    action: "swap";
    amount: string;
    inputToken: string;
    outputToken: string;
    slippage?: number | undefined;
}>;
type SwapParams = z.infer<typeof SwapParamsSchema>;
declare const BalanceParamsSchema: z.ZodObject<{
    action: z.ZodLiteral<"balance">;
    address: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "balance";
    token?: string | undefined;
    address?: string | undefined;
}, {
    action: "balance";
    token?: string | undefined;
    address?: string | undefined;
}>;
type BalanceParams = z.infer<typeof BalanceParamsSchema>;
declare const DeployTokenParamsSchema: z.ZodObject<{
    action: z.ZodLiteral<"deploy_token">;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodDefault<z.ZodNumber>;
    initialSupply: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "deploy_token";
    name: string;
    decimals: number;
    initialSupply?: string | undefined;
}, {
    symbol: string;
    action: "deploy_token";
    name: string;
    decimals?: number | undefined;
    initialSupply?: string | undefined;
}>;
type DeployTokenParams = z.infer<typeof DeployTokenParamsSchema>;
declare const WalletCommandSchema: z.ZodDiscriminatedUnion<"action", [z.ZodObject<{
    action: z.ZodLiteral<"transfer">;
    to: z.ZodString;
    amount: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "transfer";
    to: string;
    amount: string;
    token?: string | undefined;
}, {
    action: "transfer";
    to: string;
    amount: string;
    token?: string | undefined;
}>, z.ZodObject<{
    action: z.ZodLiteral<"swap">;
    inputToken: z.ZodString;
    outputToken: z.ZodString;
    amount: z.ZodString;
    slippage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: "swap";
    amount: string;
    inputToken: string;
    outputToken: string;
    slippage: number;
}, {
    action: "swap";
    amount: string;
    inputToken: string;
    outputToken: string;
    slippage?: number | undefined;
}>, z.ZodObject<{
    action: z.ZodLiteral<"balance">;
    address: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "balance";
    token?: string | undefined;
    address?: string | undefined;
}, {
    action: "balance";
    token?: string | undefined;
    address?: string | undefined;
}>, z.ZodObject<{
    action: z.ZodLiteral<"deploy_token">;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodDefault<z.ZodNumber>;
    initialSupply: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    action: "deploy_token";
    name: string;
    decimals: number;
    initialSupply?: string | undefined;
}, {
    symbol: string;
    action: "deploy_token";
    name: string;
    decimals?: number | undefined;
    initialSupply?: string | undefined;
}>]>;
type WalletCommand = z.infer<typeof WalletCommandSchema>;
interface WalletAgentConfig {
    chain: "evm" | "solana";
    network: string;
    privateKey?: string;
    cdpApiKeyName?: string;
    cdpApiKeyPrivate?: string;
}

declare function parseNaturalLanguage(input: string): WalletCommand | null;
declare function formatAmount(amount: string, decimals: number): bigint;
declare function parseAmount(raw: bigint, decimals: number): string;

declare class WalletAgent extends BaseAgent {
    private walletConfig;
    private evmProvider;
    private solanaProvider;
    constructor(config: AgentConfig, walletConfig: WalletAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    executeWalletCommand(command: WalletCommand, context: AgentContext): Promise<AgentResult>;
    getBalance(address?: string): Promise<AgentResult>;
    transfer(to: string, amount: string, token?: string): Promise<AgentResult>;
    swap(inputToken: string, outputToken: string, amount: string, slippage?: number): Promise<AgentResult>;
}

declare class EvmWalletProvider {
    private config;
    private address;
    constructor(config: WalletAgentConfig);
    initialize(): Promise<string>;
    executeCommand(command: WalletCommand, context: AgentContext): Promise<AgentResult>;
    private getBalance;
    private transfer;
    private swap;
    private deployToken;
    private getRpcUrl;
}

declare class SolanaWalletProvider {
    private config;
    private address;
    private rpcUrl;
    constructor(config: WalletAgentConfig);
    initialize(): Promise<string>;
    executeCommand(command: WalletCommand, context: AgentContext): Promise<AgentResult>;
    private getBalance;
    private transfer;
    private swap;
    private deployToken;
    private getRpcUrl;
}

export { type BalanceParams, BalanceParamsSchema, type DeployTokenParams, DeployTokenParamsSchema, EvmWalletProvider, SolanaWalletProvider, type SwapParams, SwapParamsSchema, type TransferParams, TransferParamsSchema, type WalletAction, WalletActionSchema, WalletAgent, type WalletAgentConfig, type WalletCommand, WalletCommandSchema, formatAmount, parseAmount, parseNaturalLanguage };
