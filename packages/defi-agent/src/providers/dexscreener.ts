import type { TokenData, PoolData, Trade } from "../types.js";

interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  dexId: string;
  baseToken: { address: string; symbol: string; name: string };
  quoteToken: { address: string; symbol: string; name: string };
  liquidity: { usd: number };
  volume: { h24: number };
  priceUsd: string;
  priceChange: { h24: number };
  fdv: number;
}

interface DexScreenerPairsResponse {
  pairs?: DexScreenerPair[];
}

interface BoostedToken {
  chainId: string;
  tokenAddress: string;
  description: string;
  amount: number;
}

const DEXSCREENER_BASE = "https://api.dexscreener.com";

export class DexScreenerProvider {
  async getTokenPairs(
    address: string,
    chain = "solana"
  ): Promise<PoolData[]> {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/latest/dex/tokens/${address}`
      );
      const data = (await response.json()) as DexScreenerPairsResponse;

      if (!data.pairs) return [];

      return data.pairs
        .filter((pair) => pair.chainId === chain)
        .map((pair) => ({
            address: pair.pairAddress,
            name: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
            dex: pair.dexId,
            token0: {
              address: pair.baseToken.address,
              symbol: pair.baseToken.symbol,
              name: pair.baseToken.name,
              decimals: 9,
              price: parseFloat(pair.priceUsd),
              priceChange24h: pair.priceChange?.h24 || 0,
              volume24h: pair.volume?.h24 || 0,
              liquidity: pair.liquidity?.usd || 0,
              fdv: pair.fdv,
            },
            token1: {
              address: pair.quoteToken.address,
              symbol: pair.quoteToken.symbol,
              name: pair.quoteToken.name,
              decimals: 9,
              price: 0,
              priceChange24h: 0,
              volume24h: 0,
              liquidity: 0,
            },
            tvl: pair.liquidity?.usd || 0,
            volume24h: pair.volume?.h24 || 0,
            fee: 0.3,
          })
        );
    } catch (error) {
      console.error("[DexScreener] getTokenPairs failed:", error);
      return [];
    }
  }

  async searchTokens(query: string): Promise<TokenData[]> {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`
      );
      const data = (await response.json()) as DexScreenerPairsResponse;

      if (!data.pairs) return [];

      const seen = new Set<string>();
      return data.pairs
        .filter((pair) => {
          if (seen.has(pair.baseToken.address)) return false;
          seen.add(pair.baseToken.address);
          return true;
        })
        .slice(0, 10)
        .map((pair) => ({
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            decimals: 9,
            price: parseFloat(pair.priceUsd),
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            fdv: pair.fdv,
          })
        );
    } catch (error) {
      console.error("[DexScreener] searchTokens failed:", error);
      return [];
    }
  }

  async getTrendingTokens(chain = "solana"): Promise<TokenData[]> {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/token-boosts/top/v1`
      );
      const data = (await response.json()) as BoostedToken[];

      return (data || [])
        .filter((token) => token.chainId === chain)
        .slice(0, 20)
        .map((token) => ({
            address: token.tokenAddress,
            symbol: token.description?.slice(0, 10) || "???",
            name: token.description || "Unknown",
            decimals: 9,
            price: 0,
            priceChange24h: 0,
            volume24h: 0,
            liquidity: 0,
            boostAmount: token.amount,
          })
        );
    } catch (error) {
      console.error("[DexScreener] getTrendingTokens failed:", error);
      return [];
    }
  }
}
