/**
 * DexScreener Data Provider - Free tier, no API key required
 * Docs: https://docs.dexscreener.com/api/reference
 */

import type { CandleData, PoolData, TokenMetadata } from "./types.js";

const BASE_URL = "https://api.dexscreener.com";

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export async function fetchTokenPairs(
  tokenAddress: string
): Promise<DexScreenerPair[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/latest/dex/tokens/${tokenAddress}`
    );

    if (!response.ok) {
      console.warn(`DexScreener fetch failed for ${tokenAddress}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error(`DexScreener error for ${tokenAddress}:`, error);
    return [];
  }
}

export async function fetchPairByAddress(
  pairAddress: string,
  chainId: string = "solana"
): Promise<DexScreenerPair | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/latest/dex/pairs/${chainId}/${pairAddress}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.pair || null;
  } catch (error) {
    console.error(`DexScreener pair error:`, error);
    return null;
  }
}

export async function searchTokens(query: string): Promise<DexScreenerPair[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error(`DexScreener search error:`, error);
    return [];
  }
}

export function pairToPoolData(pair: DexScreenerPair): PoolData {
  return {
    address: pair.pairAddress,
    dex: pair.dexId,
    baseToken: {
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      address: pair.baseToken.address,
    },
    quoteToken: {
      symbol: pair.quoteToken.symbol,
      name: pair.quoteToken.name,
      address: pair.quoteToken.address,
    },
    liquidity: pair.liquidity?.usd || 0,
    volume24h: pair.volume?.h24 || 0,
    priceUsd: parseFloat(pair.priceUsd) || 0,
    priceChange24h: pair.priceChange?.h24 || 0,
    txCount24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
    createdAt: pair.pairCreatedAt,
  };
}

export async function fetchSolanaToken(
  address: string
): Promise<{
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  fdv: number;
  txCount24h: number;
  poolAddress: string;
  dex: string;
} | null> {
  const pairs = await fetchTokenPairs(address);

  if (pairs.length === 0) {
    return null;
  }

  // Get the pair with highest liquidity
  const bestPair = pairs
    .filter((p) => p.chainId === "solana")
    .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

  if (!bestPair) {
    return null;
  }

  return {
    price: parseFloat(bestPair.priceUsd) || 0,
    priceChange24h: bestPair.priceChange?.h24 || 0,
    volume24h: bestPair.volume?.h24 || 0,
    liquidity: bestPair.liquidity?.usd || 0,
    marketCap: bestPair.marketCap || 0,
    fdv: bestPair.fdv || 0,
    txCount24h:
      (bestPair.txns?.h24?.buys || 0) + (bestPair.txns?.h24?.sells || 0),
    poolAddress: bestPair.pairAddress,
    dex: bestPair.dexId,
  };
}

// Note: DexScreener doesn't provide OHLCV data directly
// For Solana tokens, we'll need to aggregate from the pair data
// or use Jupiter/Birdeye for OHLCV
export async function generatePseudoOHLCV(
  tokenAddress: string,
  _timeframe: "1h" | "4h" | "1d" = "1h"
): Promise<CandleData[]> {
  // DexScreener doesn't provide historical OHLCV
  // This returns current price as a single data point
  const token = await fetchSolanaToken(tokenAddress);

  if (!token) {
    return [];
  }

  const now = Date.now();
  const price = token.price;

  // Generate synthetic candles based on price change
  // This is a placeholder - real implementation should use Jupiter or Birdeye
  const priceChange = token.priceChange24h / 100;
  const previousPrice = price / (1 + priceChange);

  return [
    {
      timestamp: now - 24 * 60 * 60 * 1000,
      open: previousPrice,
      high: Math.max(previousPrice, price) * 1.02,
      low: Math.min(previousPrice, price) * 0.98,
      close: price,
      volume: token.volume24h,
    },
  ];
}
