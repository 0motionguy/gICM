import { z } from "zod";
import type { ChainType, Token, Transaction } from "../types.js";

export interface ChainProvider {
  chain: ChainType;
  network: string;

  getBalance(address: string): Promise<string>;
  getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  sendTransaction(tx: TransactionRequest): Promise<Transaction>;
  getTransaction(hash: string): Promise<Transaction | null>;
  estimateGas(tx: TransactionRequest): Promise<string>;
  getTokenInfo(address: string): Promise<Token | null>;
}

export const TransactionRequestSchema = z.object({
  to: z.string(),
  value: z.string().optional(),
  data: z.string().optional(),
  gasLimit: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
});
export type TransactionRequest = z.infer<typeof TransactionRequestSchema>;

export const SwapParamsSchema = z.object({
  inputToken: z.string(),
  outputToken: z.string(),
  amount: z.string(),
  slippage: z.number().min(0).max(100).default(0.5),
  recipient: z.string().optional(),
});
export type SwapParams = z.infer<typeof SwapParamsSchema>;

export interface SwapQuote {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: string[];
  estimatedGas: string;
}

export interface DexProvider {
  name: string;
  chain: ChainType;

  getQuote(params: SwapParams): Promise<SwapQuote>;
  buildSwapTransaction(params: SwapParams): Promise<TransactionRequest>;
}
