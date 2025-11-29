import {
  EVM_NETWORKS,
  EvmChainProvider,
  SOLANA_NETWORKS,
  SolanaChainProvider,
  SwapParamsSchema,
  TransactionRequestSchema,
  createChainProvider
} from "./chunk-EYKJT3RB.js";
import {
  LLMConfigSchema,
  LLMProviderSchema,
  UniversalLLMClient,
  createLLMClient
} from "./chunk-RHNOKY72.js";

// src/types.ts
import { z } from "zod";
var ChainType = z.enum(["evm", "solana"]);
var EvmNetwork = z.enum([
  "mainnet",
  "base",
  "arbitrum",
  "optimism",
  "polygon",
  "bsc"
]);
var SolanaNetwork = z.enum(["mainnet-beta", "devnet", "testnet"]);
var AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  llmProvider: z.enum(["openai", "anthropic", "gemini"]).default("openai"),
  llmModel: z.string().optional(),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(4096),
  verbose: z.boolean().default(false)
});
var AgentResultSchema = z.object({
  agent: z.string(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
  timestamp: z.number()
});
var TransactionSchema = z.object({
  hash: z.string(),
  chain: ChainType,
  network: z.string(),
  from: z.string(),
  to: z.string().optional(),
  value: z.string().optional(),
  data: z.string().optional(),
  status: z.enum(["pending", "confirmed", "failed"]),
  blockNumber: z.number().optional(),
  gasUsed: z.string().optional()
});
var TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  chain: ChainType,
  logoURI: z.string().optional()
});
var WalletBalanceSchema = z.object({
  address: z.string(),
  chain: ChainType,
  nativeBalance: z.string(),
  tokens: z.array(
    z.object({
      token: TokenSchema,
      balance: z.string(),
      usdValue: z.number().optional()
    })
  )
});

// src/base-agent.ts
var BaseAgent = class {
  name;
  config;
  tools = [];
  constructor(name, config) {
    this.name = name;
    this.config = {
      ...config,
      name
    };
  }
  getName() {
    return this.name;
  }
  getConfig() {
    return this.config;
  }
  getTools() {
    return this.tools;
  }
  registerTool(tool) {
    this.tools.push(tool);
  }
  createResult(success, data, error, confidence, reasoning) {
    return {
      agent: this.name,
      success,
      data,
      error,
      confidence,
      reasoning,
      timestamp: Date.now()
    };
  }
  log(message, data) {
    if (this.config.verbose) {
      console.log(`[${this.name}] ${message}`, data ?? "");
    }
  }
  parseJSON(response) {
    try {
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      this.log("Failed to parse JSON from response");
      return null;
    }
  }
};
export {
  AgentConfigSchema,
  AgentResultSchema,
  BaseAgent,
  ChainType,
  EVM_NETWORKS,
  EvmChainProvider,
  EvmNetwork,
  LLMConfigSchema,
  LLMProviderSchema,
  SOLANA_NETWORKS,
  SolanaChainProvider,
  SolanaNetwork,
  SwapParamsSchema,
  TokenSchema,
  TransactionRequestSchema,
  TransactionSchema,
  UniversalLLMClient,
  WalletBalanceSchema,
  createChainProvider,
  createLLMClient
};
//# sourceMappingURL=index.js.map