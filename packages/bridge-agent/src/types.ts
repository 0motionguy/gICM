import { z } from "zod";

export const BridgeAgentConfigSchema = z.object({
  wormholeRpc: z.string().default("https://wormhole-v2-mainnet-api.certus.one"),
  layerZeroEndpoint: z.string().optional(),
  debridgeApiKey: z.string().optional(),
});

export type BridgeAgentConfig = z.infer<typeof BridgeAgentConfigSchema>;

export type Chain =
  | "ethereum"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "avalanche"
  | "solana"
  | "sui"
  | "aptos";

export interface BridgeQuote {
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
  estimatedTime: number; // seconds
  priceImpact: number;
  slippage: number;
}

export interface BridgeRoute {
  quotes: BridgeQuote[];
  bestQuote: BridgeQuote;
  comparison: {
    cheapest: BridgeQuote;
    fastest: BridgeQuote;
    bestValue: BridgeQuote;
  };
}

export interface BridgeTransaction {
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

export interface SupportedToken {
  symbol: string;
  address: string;
  chain: Chain;
  decimals: number;
  name: string;
  logoUri?: string;
}

export interface BridgeProvider {
  name: string;
  id: string;
  supportedChains: Chain[];

  getQuote(params: QuoteParams): Promise<BridgeQuote | null>;
  getTransaction(txId: string): Promise<BridgeTransaction | null>;
  getSupportedTokens(chain: Chain): Promise<SupportedToken[]>;
}

export interface QuoteParams {
  sourceChain: Chain;
  destChain: Chain;
  sourceToken: string;
  destToken: string;
  amount: string;
  slippage?: number;
}
