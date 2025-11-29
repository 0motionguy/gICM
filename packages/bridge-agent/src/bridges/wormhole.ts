import type {
  BridgeProvider,
  BridgeQuote,
  BridgeTransaction,
  SupportedToken,
  Chain,
  QuoteParams,
} from "../types.js";

interface WormholeChainConfig {
  chainId: number;
  name: string;
}

interface WormholeTokenResponse {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  logoURI?: string;
}

interface WormholeQuoteResponse {
  srcChainId: number;
  dstChainId: number;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  dstAmount: string;
  fee: string;
  feeUsd: number;
  estimatedTime: number;
}

interface WormholeTxResponse {
  id: string;
  status: string;
  srcChainId: number;
  dstChainId: number;
  srcTx: string;
  dstTx?: string;
  timestamp: number;
  completedAt?: number;
}

// Wormhole chain IDs
const WORMHOLE_CHAINS: Record<Chain, WormholeChainConfig> = {
  ethereum: { chainId: 2, name: "Ethereum" },
  bsc: { chainId: 4, name: "BSC" },
  polygon: { chainId: 5, name: "Polygon" },
  arbitrum: { chainId: 23, name: "Arbitrum" },
  optimism: { chainId: 24, name: "Optimism" },
  base: { chainId: 30, name: "Base" },
  avalanche: { chainId: 6, name: "Avalanche" },
  solana: { chainId: 1, name: "Solana" },
  sui: { chainId: 21, name: "Sui" },
  aptos: { chainId: 22, name: "Aptos" },
};

export class WormholeProvider implements BridgeProvider {
  name = "Wormhole";
  id = "wormhole";
  supportedChains: Chain[] = Object.keys(WORMHOLE_CHAINS) as Chain[];
  private apiUrl: string;

  constructor(apiUrl = "https://wormhole-v2-mainnet-api.certus.one") {
    this.apiUrl = apiUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`);
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async getQuote(params: QuoteParams): Promise<BridgeQuote | null> {
    const sourceChainId = WORMHOLE_CHAINS[params.sourceChain]?.chainId;
    const destChainId = WORMHOLE_CHAINS[params.destChain]?.chainId;

    if (!sourceChainId || !destChainId) {
      console.error("Unsupported chain for Wormhole");
      return null;
    }

    // Wormhole Portal API for quotes
    // In production, would use their SDK
    try {
      const quote = await this.fetch<WormholeQuoteResponse>(
        `/v1/quote?srcChain=${sourceChainId}&dstChain=${destChainId}&srcToken=${params.sourceToken}&dstToken=${params.destToken}&amount=${params.amount}`
      );

      if (!quote) {
        // Simulate quote for demo
        return this.simulateQuote(params);
      }

      return {
        bridgeId: "wormhole",
        bridgeName: "Wormhole",
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        sourceToken: params.sourceToken,
        destToken: params.destToken,
        inputAmount: params.amount,
        outputAmount: quote.dstAmount,
        fee: quote.fee,
        feeUsd: quote.feeUsd,
        estimatedTime: quote.estimatedTime,
        priceImpact: 0,
        slippage: params.slippage ?? 0.5,
      };
    } catch {
      return this.simulateQuote(params);
    }
  }

  private simulateQuote(params: QuoteParams): BridgeQuote {
    // Simulate a realistic quote for demo purposes
    const fee = "0.001";
    const feeUsd = 2.5;
    const outputAmount = (
      parseFloat(params.amount) * 0.997 // 0.3% fee simulation
    ).toString();

    return {
      bridgeId: "wormhole",
      bridgeName: "Wormhole",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee,
      feeUsd,
      estimatedTime: 900, // 15 minutes average
      priceImpact: 0.1,
      slippage: params.slippage ?? 0.5,
    };
  }

  async getTransaction(txId: string): Promise<BridgeTransaction | null> {
    try {
      const tx = await this.fetch<WormholeTxResponse>(`/v1/transaction/${txId}`);

      if (!tx) return null;

      const sourceChain = Object.entries(WORMHOLE_CHAINS).find(
        ([, config]) => config.chainId === tx.srcChainId
      )?.[0] as Chain;
      const destChain = Object.entries(WORMHOLE_CHAINS).find(
        ([, config]) => config.chainId === tx.dstChainId
      )?.[0] as Chain;

      return {
        id: tx.id,
        bridgeId: "wormhole",
        bridgeName: "Wormhole",
        sourceChain,
        destChain,
        sourceToken: "",
        destToken: "",
        inputAmount: "",
        status: this.mapStatus(tx.status),
        sourceTxHash: tx.srcTx,
        destTxHash: tx.dstTx,
        createdAt: new Date(tx.timestamp * 1000),
        completedAt: tx.completedAt ? new Date(tx.completedAt * 1000) : undefined,
      };
    } catch {
      return null;
    }
  }

  private mapStatus(status: string): BridgeTransaction["status"] {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "processing":
      case "attested":
        return "processing";
      case "completed":
      case "redeemed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "pending";
    }
  }

  async getSupportedTokens(chain: Chain): Promise<SupportedToken[]> {
    const chainConfig = WORMHOLE_CHAINS[chain];
    if (!chainConfig) return [];

    try {
      const tokens = await this.fetch<WormholeTokenResponse[]>(
        `/v1/tokens?chainId=${chainConfig.chainId}`
      );

      if (!tokens) return [];

      return tokens.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        chain,
        decimals: t.decimals,
        name: t.name,
        logoUri: t.logoURI,
      }));
    } catch {
      return [];
    }
  }
}
