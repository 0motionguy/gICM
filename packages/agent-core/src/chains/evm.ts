import type { ChainProvider, TransactionRequest } from "./types.js";
import type { Token, Transaction } from "../types.js";

interface JsonRpcResponse<T = string> {
  jsonrpc: string;
  result: T;
  id: number;
}

interface TransactionReceiptResult {
  from: string;
  to: string;
  status: string;
  blockNumber: string;
  gasUsed: string;
}

export interface EvmProviderConfig {
  rpcUrl: string;
  chainId: number;
  network: string;
  privateKey?: string;
}

export class EvmChainProvider implements ChainProvider {
  chain = "evm" as const;
  network: string;
  private config: EvmProviderConfig;

  constructor(config: EvmProviderConfig) {
    this.config = config;
    this.network = config.network;
  }

  async getBalance(address: string): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });
    const data = (await response.json()) as JsonRpcResponse;
    return BigInt(data.result).toString();
  }

  async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
    const balanceOfSelector = "0x70a08231";
    const paddedAddress = address.slice(2).padStart(64, "0");

    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: `${balanceOfSelector}${paddedAddress}`,
          },
          "latest",
        ],
        id: 1,
      }),
    });
    const data = (await response.json()) as JsonRpcResponse;
    return BigInt(data.result).toString();
  }

  async sendTransaction(tx: TransactionRequest): Promise<Transaction> {
    throw new Error(
      "Direct transaction sending requires wallet integration. Use Coinbase AgentKit or similar."
    );
  }

  async getTransaction(hash: string): Promise<Transaction | null> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [hash],
        id: 1,
      }),
    });
    const data = (await response.json()) as JsonRpcResponse<TransactionReceiptResult | null>;

    if (!data.result) return null;

    return {
      hash,
      chain: "evm",
      network: this.network,
      from: data.result.from,
      to: data.result.to,
      status: data.result.status === "0x1" ? "confirmed" : "failed",
      blockNumber: parseInt(data.result.blockNumber, 16),
      gasUsed: BigInt(data.result.gasUsed).toString(),
    };
  }

  async estimateGas(tx: TransactionRequest): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_estimateGas",
        params: [tx],
        id: 1,
      }),
    });
    const data = (await response.json()) as JsonRpcResponse;
    return BigInt(data.result).toString();
  }

  async getTokenInfo(address: string): Promise<Token | null> {
    const nameSelector = "0x06fdde03";
    const symbolSelector = "0x95d89b41";
    const decimalsSelector = "0x313ce567";

    try {
      const [nameRes, symbolRes, decimalsRes] = await Promise.all([
        this.call(address, nameSelector),
        this.call(address, symbolSelector),
        this.call(address, decimalsSelector),
      ]);

      return {
        address,
        name: this.decodeString(nameRes),
        symbol: this.decodeString(symbolRes),
        decimals: parseInt(decimalsRes, 16),
        chain: "evm",
      };
    } catch {
      return null;
    }
  }

  private async call(to: string, data: string): Promise<string> {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to, data }, "latest"],
        id: 1,
      }),
    });
    const result = (await response.json()) as JsonRpcResponse;
    return result.result;
  }

  private decodeString(hex: string): string {
    if (hex === "0x" || hex.length < 130) return "";
    const offset = parseInt(hex.slice(2, 66), 16) * 2 + 2;
    const length = parseInt(hex.slice(offset, offset + 64), 16);
    const strHex = hex.slice(offset + 64, offset + 64 + length * 2);
    return Buffer.from(strHex, "hex").toString("utf8");
  }
}

export const EVM_NETWORKS: Record<string, EvmProviderConfig> = {
  mainnet: {
    rpcUrl: "https://eth.llamarpc.com",
    chainId: 1,
    network: "mainnet",
  },
  base: {
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    network: "base",
  },
  arbitrum: {
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    network: "arbitrum",
  },
  optimism: {
    rpcUrl: "https://mainnet.optimism.io",
    chainId: 10,
    network: "optimism",
  },
  polygon: {
    rpcUrl: "https://polygon-rpc.com",
    chainId: 137,
    network: "polygon",
  },
};
