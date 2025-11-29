import { A as AgentConfig, a as AgentTool, b as AgentContext, c as AgentResult } from './index-qMQMZZWY.js';
export { d as AgentConfigSchema, e as AgentResultSchema, k as ChainProvider, C as ChainType, D as DexProvider, s as EVM_NETWORKS, r as EvmChainProvider, E as EvmNetwork, q as EvmProviderConfig, v as SOLANA_NETWORKS, u as SolanaChainProvider, S as SolanaNetwork, t as SolanaProviderConfig, o as SwapParams, n as SwapParamsSchema, p as SwapQuote, h as Token, g as TokenSchema, f as Transaction, m as TransactionRequest, l as TransactionRequestSchema, T as TransactionSchema, i as WalletBalance, W as WalletBalanceSchema, j as createChainProvider } from './index-qMQMZZWY.js';
export { LLMClient, LLMConfig, LLMConfigSchema, LLMMessage, LLMProvider, LLMProviderSchema, LLMResponse, UniversalLLMClient, createLLMClient } from './llm/index.js';
import 'zod';

declare abstract class BaseAgent {
    protected name: string;
    protected config: AgentConfig;
    protected tools: AgentTool[];
    constructor(name: string, config: AgentConfig);
    abstract getSystemPrompt(): string;
    abstract analyze(context: AgentContext): Promise<AgentResult>;
    getName(): string;
    getConfig(): AgentConfig;
    getTools(): AgentTool[];
    protected registerTool(tool: AgentTool): void;
    protected createResult(success: boolean, data?: unknown, error?: string, confidence?: number, reasoning?: string): AgentResult;
    protected log(message: string, data?: unknown): void;
    protected parseJSON<T>(response: string): T | null;
}

export { AgentConfig, AgentContext, AgentResult, AgentTool, BaseAgent };
