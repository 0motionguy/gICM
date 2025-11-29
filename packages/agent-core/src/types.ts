import { z } from "zod";

export const ChainType = z.enum(["evm", "solana"]);
export type ChainType = z.infer<typeof ChainType>;

export const EvmNetwork = z.enum([
  "mainnet",
  "base",
  "arbitrum",
  "optimism",
  "polygon",
  "bsc",
]);
export type EvmNetwork = z.infer<typeof EvmNetwork>;

export const SolanaNetwork = z.enum(["mainnet-beta", "devnet", "testnet"]);
export type SolanaNetwork = z.infer<typeof SolanaNetwork>;

export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  llmProvider: z.enum(["openai", "anthropic", "gemini"]).default("openai"),
  llmModel: z.string().optional(),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(4096),
  verbose: z.boolean().default(false),
});
export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const AgentResultSchema = z.object({
  agent: z.string(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
  timestamp: z.number(),
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

export const TransactionSchema = z.object({
  hash: z.string(),
  chain: ChainType,
  network: z.string(),
  from: z.string(),
  to: z.string().optional(),
  value: z.string().optional(),
  data: z.string().optional(),
  status: z.enum(["pending", "confirmed", "failed"]),
  blockNumber: z.number().optional(),
  gasUsed: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  chain: ChainType,
  logoURI: z.string().optional(),
});
export type Token = z.infer<typeof TokenSchema>;

export const WalletBalanceSchema = z.object({
  address: z.string(),
  chain: ChainType,
  nativeBalance: z.string(),
  tokens: z.array(
    z.object({
      token: TokenSchema,
      balance: z.string(),
      usdValue: z.number().optional(),
    })
  ),
});
export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

export interface AgentContext {
  chain: ChainType;
  network: string;
  walletAddress?: string;
  userQuery?: string;
  previousResults?: AgentResult[];
  metadata?: Record<string, unknown>;
  // Action/params pattern for orchestrator commands
  action?: string;
  params?: Record<string, unknown>;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (params: unknown, context: AgentContext) => Promise<unknown>;
}
