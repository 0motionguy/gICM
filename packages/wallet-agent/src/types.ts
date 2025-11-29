import { z } from "zod";

export const WalletActionSchema = z.enum([
  "transfer",
  "swap",
  "balance",
  "deploy_token",
  "mint_nft",
  "stake",
  "unstake",
]);
export type WalletAction = z.infer<typeof WalletActionSchema>;

export const TransferParamsSchema = z.object({
  action: z.literal("transfer"),
  to: z.string(),
  amount: z.string(),
  token: z.string().optional(),
});
export type TransferParams = z.infer<typeof TransferParamsSchema>;

export const SwapParamsSchema = z.object({
  action: z.literal("swap"),
  inputToken: z.string(),
  outputToken: z.string(),
  amount: z.string(),
  slippage: z.number().default(0.5),
});
export type SwapParams = z.infer<typeof SwapParamsSchema>;

export const BalanceParamsSchema = z.object({
  action: z.literal("balance"),
  address: z.string().optional(),
  token: z.string().optional(),
});
export type BalanceParams = z.infer<typeof BalanceParamsSchema>;

export const DeployTokenParamsSchema = z.object({
  action: z.literal("deploy_token"),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().default(18),
  initialSupply: z.string().optional(),
});
export type DeployTokenParams = z.infer<typeof DeployTokenParamsSchema>;

export const WalletCommandSchema = z.discriminatedUnion("action", [
  TransferParamsSchema,
  SwapParamsSchema,
  BalanceParamsSchema,
  DeployTokenParamsSchema,
]);
export type WalletCommand = z.infer<typeof WalletCommandSchema>;

export interface WalletAgentConfig {
  chain: "evm" | "solana";
  network: string;
  privateKey?: string;
  cdpApiKeyName?: string;
  cdpApiKeyPrivate?: string;
}
