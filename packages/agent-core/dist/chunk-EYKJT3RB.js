// src/chains/types.ts
import { z } from "zod";
var TransactionRequestSchema = z.object({
  to: z.string(),
  value: z.string().optional(),
  data: z.string().optional(),
  gasLimit: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional()
});
var SwapParamsSchema = z.object({
  inputToken: z.string(),
  outputToken: z.string(),
  amount: z.string(),
  slippage: z.number().min(0).max(100).default(0.5),
  recipient: z.string().optional()
});

// src/chains/evm.ts
var EvmChainProvider = class {
  chain = "evm";
  network;
  config;
  constructor(config) {
    this.config = config;
    this.network = config.network;
  }
  async getBalance(address) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
      })
    });
    const data = await response.json();
    return BigInt(data.result).toString();
  }
  async getTokenBalance(address, tokenAddress) {
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
            data: `${balanceOfSelector}${paddedAddress}`
          },
          "latest"
        ],
        id: 1
      })
    });
    const data = await response.json();
    return BigInt(data.result).toString();
  }
  async sendTransaction(tx) {
    throw new Error(
      "Direct transaction sending requires wallet integration. Use Coinbase AgentKit or similar."
    );
  }
  async getTransaction(hash) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [hash],
        id: 1
      })
    });
    const data = await response.json();
    if (!data.result) return null;
    return {
      hash,
      chain: "evm",
      network: this.network,
      from: data.result.from,
      to: data.result.to,
      status: data.result.status === "0x1" ? "confirmed" : "failed",
      blockNumber: parseInt(data.result.blockNumber, 16),
      gasUsed: BigInt(data.result.gasUsed).toString()
    };
  }
  async estimateGas(tx) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_estimateGas",
        params: [tx],
        id: 1
      })
    });
    const data = await response.json();
    return BigInt(data.result).toString();
  }
  async getTokenInfo(address) {
    const nameSelector = "0x06fdde03";
    const symbolSelector = "0x95d89b41";
    const decimalsSelector = "0x313ce567";
    try {
      const [nameRes, symbolRes, decimalsRes] = await Promise.all([
        this.call(address, nameSelector),
        this.call(address, symbolSelector),
        this.call(address, decimalsSelector)
      ]);
      return {
        address,
        name: this.decodeString(nameRes),
        symbol: this.decodeString(symbolRes),
        decimals: parseInt(decimalsRes, 16),
        chain: "evm"
      };
    } catch {
      return null;
    }
  }
  async call(to, data) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to, data }, "latest"],
        id: 1
      })
    });
    const result = await response.json();
    return result.result;
  }
  decodeString(hex) {
    if (hex === "0x" || hex.length < 130) return "";
    const offset = parseInt(hex.slice(2, 66), 16) * 2 + 2;
    const length = parseInt(hex.slice(offset, offset + 64), 16);
    const strHex = hex.slice(offset + 64, offset + 64 + length * 2);
    return Buffer.from(strHex, "hex").toString("utf8");
  }
};
var EVM_NETWORKS = {
  mainnet: {
    rpcUrl: "https://eth.llamarpc.com",
    chainId: 1,
    network: "mainnet"
  },
  base: {
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    network: "base"
  },
  arbitrum: {
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    network: "arbitrum"
  },
  optimism: {
    rpcUrl: "https://mainnet.optimism.io",
    chainId: 10,
    network: "optimism"
  },
  polygon: {
    rpcUrl: "https://polygon-rpc.com",
    chainId: 137,
    network: "polygon"
  }
};

// src/chains/solana.ts
var SolanaChainProvider = class {
  chain = "solana";
  network;
  config;
  constructor(config) {
    this.config = config;
    this.network = config.network;
  }
  async getBalance(address) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        params: [address],
        id: 1
      })
    });
    const data = await response.json();
    return data.result?.value?.toString() ?? "0";
  }
  async getTokenBalance(address, tokenMint) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccountsByOwner",
        params: [
          address,
          { mint: tokenMint },
          { encoding: "jsonParsed" }
        ],
        id: 1
      })
    });
    const data = await response.json();
    const accounts = data.result?.value ?? [];
    if (accounts.length === 0) return "0";
    const tokenAmount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount;
    return tokenAmount?.amount ?? "0";
  }
  async sendTransaction(_tx) {
    throw new Error(
      "Direct transaction sending requires wallet integration. Use Solana Agent Kit."
    );
  }
  async getTransaction(signature) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTransaction",
        params: [signature, { encoding: "jsonParsed" }],
        id: 1
      })
    });
    const data = await response.json();
    if (!data.result) return null;
    const tx = data.result;
    return {
      hash: signature,
      chain: "solana",
      network: this.network,
      from: tx.transaction?.message?.accountKeys?.[0]?.pubkey ?? "",
      to: tx.transaction?.message?.accountKeys?.[1]?.pubkey,
      status: tx.meta?.err ? "failed" : "confirmed",
      blockNumber: tx.slot
    };
  }
  async estimateGas(_tx) {
    return "5000";
  }
  async getTokenInfo(mintAddress) {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getAccountInfo",
        params: [mintAddress, { encoding: "jsonParsed" }],
        id: 1
      })
    });
    const data = await response.json();
    if (!data.result?.value) return null;
    const parsed = data.result.value.data?.parsed?.info;
    return {
      address: mintAddress,
      name: mintAddress.slice(0, 8),
      symbol: mintAddress.slice(0, 4).toUpperCase(),
      decimals: parsed?.decimals ?? 9,
      chain: "solana"
    };
  }
  async getRecentBlockhash() {
    const response = await fetch(this.config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getLatestBlockhash",
        params: [],
        id: 1
      })
    });
    const data = await response.json();
    return data.result?.value?.blockhash ?? "";
  }
};
var SOLANA_NETWORKS = {
  "mainnet-beta": {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta"
  },
  devnet: {
    rpcUrl: "https://api.devnet.solana.com",
    network: "devnet"
  },
  testnet: {
    rpcUrl: "https://api.testnet.solana.com",
    network: "testnet"
  }
};

// src/chains/index.ts
function createChainProvider(chain, network) {
  if (chain === "evm") {
    const config = EVM_NETWORKS[network];
    if (!config) {
      throw new Error(`Unknown EVM network: ${network}`);
    }
    return new EvmChainProvider(config);
  }
  if (chain === "solana") {
    const config = SOLANA_NETWORKS[network];
    if (!config) {
      throw new Error(`Unknown Solana network: ${network}`);
    }
    return new SolanaChainProvider(config);
  }
  throw new Error(`Unknown chain type: ${chain}`);
}

export {
  TransactionRequestSchema,
  SwapParamsSchema,
  EvmChainProvider,
  EVM_NETWORKS,
  SolanaChainProvider,
  SOLANA_NETWORKS,
  createChainProvider
};
//# sourceMappingURL=chunk-EYKJT3RB.js.map