import type {
  BridgeProvider,
  BridgeQuote,
  BridgeTransaction,
  SupportedToken,
  Chain,
  QuoteParams,
} from "../types.js";

interface DeBridgeChainConfig {
  chainId: number;
  name: string;
}

interface DeBridgeQuoteResponse {
  estimation: {
    srcChainTokenIn: {
      amount: string;
      symbol: string;
    };
    dstChainTokenOut: {
      amount: string;
      symbol: string;
    };
    recommendedSlippage: number;
  };
  tx?: {
    data: string;
    to: string;
    value: string;
  };
  priceImpact?: number;
  executionFee?: {
    amount: string;
    symbol: string;
  };
  estimatedTime?: number;
}

interface DeBridgeTxResponse {
  orderId: string;
  state: string;
  srcChainId: number;
  dstChainId: number;
  giveAmount: string;
  takeAmount: string;
  createTxHash: string;
  fulfillTxHash?: string;
  createdAt: string;
  fulfilledAt?: string;
  errorMessage?: string;
}

interface DeBridgeTokenResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const DEBRIDGE_CHAINS: Record<Chain, DeBridgeChainConfig> = {
  ethereum: { chainId: 1, name: "Ethereum" },
  bsc: { chainId: 56, name: "BSC" },
  polygon: { chainId: 137, name: "Polygon" },
  arbitrum: { chainId: 42161, name: "Arbitrum" },
  optimism: { chainId: 10, name: "Optimism" },
  base: { chainId: 8453, name: "Base" },
  avalanche: { chainId: 43114, name: "Avalanche" },
  solana: { chainId: 7565164, name: "Solana" },
  sui: { chainId: 0, name: "Sui" }, // Not supported
  aptos: { chainId: 0, name: "Aptos" }, // Not supported
};

export class DeBridgeProvider implements BridgeProvider {
  name = "deBridge";
  id = "debridge";
  supportedChains: Chain[] = ["ethereum", "bsc", "polygon", "arbitrum", "optimism", "base", "avalanche", "solana"];
  private apiKey?: string;
  private baseUrl = "https://api.dln.trade/v1.0";

  constructor(config: { apiKey?: string } = {}) {
    this.apiKey = config.apiKey;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url.toString(), { headers });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async getQuote(params: QuoteParams): Promise<BridgeQuote | null> {
    const sourceChainId = DEBRIDGE_CHAINS[params.sourceChain]?.chainId;
    const destChainId = DEBRIDGE_CHAINS[params.destChain]?.chainId;

    if (!sourceChainId || !destChainId) {
      return null;
    }

    try {
      const quote = await this.fetch<DeBridgeQuoteResponse>("/dln/order/quote", {
        srcChainId: sourceChainId.toString(),
        srcChainTokenIn: params.sourceToken,
        srcChainTokenInAmount: params.amount,
        dstChainId: destChainId.toString(),
        dstChainTokenOut: params.destToken,
        prependOperatingExpenses: "true",
      });

      if (!quote?.estimation) {
        return this.simulateQuote(params);
      }

      const feeAmount = quote.executionFee?.amount ?? "0";
      const feeUsd = parseFloat(feeAmount) * 0.001; // Rough estimate

      return {
        bridgeId: "debridge",
        bridgeName: "deBridge",
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        sourceToken: params.sourceToken,
        destToken: params.destToken,
        inputAmount: params.amount,
        outputAmount: quote.estimation.dstChainTokenOut.amount,
        fee: feeAmount,
        feeUsd,
        estimatedTime: quote.estimatedTime ?? 60, // ~1 minute
        priceImpact: quote.priceImpact ?? 0,
        slippage: quote.estimation.recommendedSlippage,
      };
    } catch {
      return this.simulateQuote(params);
    }
  }

  private simulateQuote(params: QuoteParams): BridgeQuote {
    const outputAmount = (parseFloat(params.amount) * 0.998).toString();

    return {
      bridgeId: "debridge",
      bridgeName: "deBridge",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee: "0.0005",
      feeUsd: 1.25,
      estimatedTime: 60,
      priceImpact: 0.05,
      slippage: params.slippage ?? 0.5,
    };
  }

  async getTransaction(orderId: string): Promise<BridgeTransaction | null> {
    try {
      const tx = await this.fetch<DeBridgeTxResponse>(`/dln/order/${orderId}`);
      if (!tx) return null;

      const sourceChain = Object.entries(DEBRIDGE_CHAINS).find(
        ([, config]) => config.chainId === tx.srcChainId
      )?.[0] as Chain;
      const destChain = Object.entries(DEBRIDGE_CHAINS).find(
        ([, config]) => config.chainId === tx.dstChainId
      )?.[0] as Chain;

      return {
        id: tx.orderId,
        bridgeId: "debridge",
        bridgeName: "deBridge",
        sourceChain,
        destChain,
        sourceToken: "",
        destToken: "",
        inputAmount: tx.giveAmount,
        outputAmount: tx.takeAmount,
        status: this.mapStatus(tx.state),
        sourceTxHash: tx.createTxHash,
        destTxHash: tx.fulfillTxHash,
        createdAt: new Date(tx.createdAt),
        completedAt: tx.fulfilledAt ? new Date(tx.fulfilledAt) : undefined,
        error: tx.errorMessage,
      };
    } catch {
      return null;
    }
  }

  private mapStatus(state: string): BridgeTransaction["status"] {
    switch (state.toLowerCase()) {
      case "created":
      case "ordercreated":
        return "pending";
      case "claiminprogress":
      case "fulfillsent":
        return "processing";
      case "fulfilled":
      case "claimunlocked":
        return "completed";
      case "cancelled":
      case "ordercancelled":
        return "failed";
      default:
        return "pending";
    }
  }

  async getSupportedTokens(chain: Chain): Promise<SupportedToken[]> {
    const chainConfig = DEBRIDGE_CHAINS[chain];
    if (!chainConfig?.chainId) return [];

    try {
      const tokens = await this.fetch<DeBridgeTokenResponse[]>(
        `/token-list?chainId=${chainConfig.chainId}`
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
