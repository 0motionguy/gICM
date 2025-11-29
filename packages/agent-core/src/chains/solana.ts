import type { ChainProvider, TransactionRequest } from "./types.js";
import type { Token, Transaction } from "../types.js";

interface SolanaRPCResponse<T> {
  jsonrpc: string;
  result?: T;
  id: number;
}

interface BalanceResult {
  value: number;
}

interface TokenAccountsResult {
  value: Array<{
    account: {
      data: {
        parsed: {
          info: {
            tokenAmount: { amount: string };
          };
        };
      };
    };
  }>;
}

interface TransactionResult {
  slot: number;
  meta?: { err?: unknown };
  transaction?: {
    message?: {
      accountKeys?: Array<{ pubkey: string }>;
    };
  };
}

interface AccountInfoResult {
  value?: {
    data?: {
      parsed?: {
        info?: { decimals?: number };
      };
    };
  };
}

interface BlockhashResult {
  value?: { blockhash: string };
}

export interface SolanaProviderConfig {
  rpcUrl: string;
  network: string;
  privateKey?: string;
}

export class SolanaChainProvider implements ChainProvider {
  chain = "solana" as const;
  network: string;
  private config: SolanaProviderConfig;

  constructor(config: SolanaProviderConfig) {
    this.config = config;
    this.network = config.network;
  }

  async getBalance(address: string): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        params: [address],
        id: 1,
      }),
    });
    const data = (await response.json()) as SolanaRPCResponse<BalanceResult>;
    return data.result?.value?.toString() ?? "0";
  }

  async getTokenBalance(address: string, tokenMint: string): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccountsByOwner",
        params: [
          address,
          { mint: tokenMint },
          { encoding: "jsonParsed" },
        ],
        id: 1,
      }),
    });
    const data = (await response.json()) as SolanaRPCResponse<TokenAccountsResult>;
    const accounts = data.result?.value ?? [];
    if (accounts.length === 0) return "0";

    const tokenAmount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount;
    return tokenAmount?.amount ?? "0";
  }

  async sendTransaction(_tx: TransactionRequest): Promise<Transaction> {
    throw new Error(
      "Direct transaction sending requires wallet integration. Use Solana Agent Kit."
    );
  }

  async getTransaction(signature: string): Promise<Transaction | null> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTransaction",
        params: [signature, { encoding: "jsonParsed" }],
        id: 1,
      }),
    });
    const data = (await response.json()) as SolanaRPCResponse<TransactionResult>;

    if (!data.result) return null;

    const tx = data.result;
    return {
      hash: signature,
      chain: "solana",
      network: this.network,
      from: tx.transaction?.message?.accountKeys?.[0]?.pubkey ?? "",
      to: tx.transaction?.message?.accountKeys?.[1]?.pubkey,
      status: tx.meta?.err ? "failed" : "confirmed",
      blockNumber: tx.slot,
    };
  }

  async estimateGas(_tx: TransactionRequest): Promise<string> {
    return "5000";
  }

  async getTokenInfo(mintAddress: string): Promise<Token | null> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getAccountInfo",
        params: [mintAddress, { encoding: "jsonParsed" }],
        id: 1,
      }),
    });
    const data = (await response.json()) as SolanaRPCResponse<AccountInfoResult>;

    if (!data.result?.value) return null;

    const parsed = data.result.value.data?.parsed?.info;
    return {
      address: mintAddress,
      name: mintAddress.slice(0, 8),
      symbol: mintAddress.slice(0, 4).toUpperCase(),
      decimals: parsed?.decimals ?? 9,
      chain: "solana",
    };
  }

  async getRecentBlockhash(): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getLatestBlockhash",
        params: [],
        id: 1,
      }),
    });
    const data = (await response.json()) as SolanaRPCResponse<BlockhashResult>;
    return data.result?.value?.blockhash ?? "";
  }
}

export const SOLANA_NETWORKS: Record<string, SolanaProviderConfig> = {
  "mainnet-beta": {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
  },
  devnet: {
    rpcUrl: "https://api.devnet.solana.com",
    network: "devnet",
  },
  testnet: {
    rpcUrl: "https://api.testnet.solana.com",
    network: "testnet",
  },
};
