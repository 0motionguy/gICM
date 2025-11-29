import type {
  BridgeProvider,
  BridgeQuote,
  BridgeTransaction,
  SupportedToken,
  Chain,
  QuoteParams,
} from "../types.js";

interface LayerZeroChainConfig {
  chainId: number;
  endpointId: number;
  name: string;
}

// LayerZero Endpoint IDs
const LAYERZERO_CHAINS: Record<Chain, LayerZeroChainConfig> = {
  ethereum: { chainId: 1, endpointId: 101, name: "Ethereum" },
  bsc: { chainId: 56, endpointId: 102, name: "BSC" },
  polygon: { chainId: 137, endpointId: 109, name: "Polygon" },
  arbitrum: { chainId: 42161, endpointId: 110, name: "Arbitrum" },
  optimism: { chainId: 10, endpointId: 111, name: "Optimism" },
  base: { chainId: 8453, endpointId: 184, name: "Base" },
  avalanche: { chainId: 43114, endpointId: 106, name: "Avalanche" },
  solana: { chainId: 0, endpointId: 168, name: "Solana" },
  sui: { chainId: 0, endpointId: 0, name: "Sui" }, // Not supported
  aptos: { chainId: 0, endpointId: 108, name: "Aptos" },
};

export class LayerZeroProvider implements BridgeProvider {
  name = "LayerZero";
  id = "layerzero";
  supportedChains: Chain[] = ["ethereum", "bsc", "polygon", "arbitrum", "optimism", "base", "avalanche", "aptos"];
  private endpointUrl?: string;

  constructor(endpointUrl?: string) {
    this.endpointUrl = endpointUrl;
  }

  async getQuote(params: QuoteParams): Promise<BridgeQuote | null> {
    const sourceConfig = LAYERZERO_CHAINS[params.sourceChain];
    const destConfig = LAYERZERO_CHAINS[params.destChain];

    if (!sourceConfig?.endpointId || !destConfig?.endpointId) {
      return null;
    }

    // LayerZero uses OFT (Omnichain Fungible Token) standard
    // Quote calculation would need contract interaction
    // Simplified simulation for demo

    const fee = this.estimateFee(params.sourceChain, params.destChain);
    const outputAmount = (
      parseFloat(params.amount) * (1 - fee.percentage / 100)
    ).toString();

    return {
      bridgeId: "layerzero",
      bridgeName: "LayerZero",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee: fee.native.toString(),
      feeUsd: fee.usd,
      estimatedTime: 120, // ~2 minutes (much faster than traditional bridges)
      priceImpact: 0,
      slippage: params.slippage ?? 0.5,
    };
  }

  private estimateFee(
    source: Chain,
    dest: Chain
  ): { native: number; usd: number; percentage: number } {
    // Base fee varies by chain pair
    const baseFees: Record<string, number> = {
      "ethereum-arbitrum": 0.001,
      "ethereum-optimism": 0.001,
      "ethereum-base": 0.001,
      "ethereum-polygon": 0.002,
      "ethereum-bsc": 0.003,
      "arbitrum-optimism": 0.0005,
      default: 0.002,
    };

    const key = `${source}-${dest}`;
    const reverseKey = `${dest}-${source}`;
    const nativeFee = baseFees[key] ?? baseFees[reverseKey] ?? baseFees.default;

    // Rough USD estimate
    const ethPrice = 2500;
    const usdFee = nativeFee * ethPrice;

    return {
      native: nativeFee,
      usd: usdFee,
      percentage: 0.1, // LayerZero has very low fees
    };
  }

  async getTransaction(_txId: string): Promise<BridgeTransaction | null> {
    // Would need to use LayerZero Scan API
    // https://layerzeroscan.com/api
    return null;
  }

  async getSupportedTokens(_chain: Chain): Promise<SupportedToken[]> {
    // Would query OFT contracts on the chain
    // Common OFT tokens: STG (Stargate), USDC, USDT
    return [];
  }

  getEndpointId(chain: Chain): number | null {
    return LAYERZERO_CHAINS[chain]?.endpointId ?? null;
  }
}
