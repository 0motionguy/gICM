/**
 * Jupiter Data Provider - Free tier, no API key required
 * Docs: https://station.jup.ag/docs/apis/price-api
 */

import type { CandleData } from "./types.js";

const PRICE_API_URL = "https://price.jup.ag/v6";
const QUOTE_API_URL = "https://quote-api.jup.ag/v6";

// Common Solana token addresses
export const SOLANA_TOKENS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  ORCA: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
  PYTH: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  JTO: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  RENDER: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof",
  POPCAT: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  MEW: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
  BOME: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
};

export function getTokenAddress(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();
  return SOLANA_TOKENS[upperSymbol] || null;
}

export async function fetchJupiterPrice(
  tokenAddressOrSymbol: string
): Promise<{ price: number; confidence: number } | null> {
  try {
    // Convert symbol to address if needed
    let address = tokenAddressOrSymbol;
    if (tokenAddressOrSymbol.length < 32) {
      const mapped = getTokenAddress(tokenAddressOrSymbol);
      if (!mapped) {
        console.warn(`Unknown token symbol: ${tokenAddressOrSymbol}`);
        return null;
      }
      address = mapped;
    }

    const response = await fetch(`${PRICE_API_URL}/price?ids=${address}`);

    if (!response.ok) {
      console.warn(`Jupiter price fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const tokenData = data.data?.[address];

    if (!tokenData) {
      return null;
    }

    return {
      price: tokenData.price || 0,
      confidence: tokenData.confidence || 0,
    };
  } catch (error) {
    console.error(`Jupiter price error:`, error);
    return null;
  }
}

export async function fetchMultiplePrices(
  addresses: string[]
): Promise<Record<string, number>> {
  try {
    const ids = addresses.join(",");
    const response = await fetch(`${PRICE_API_URL}/price?ids=${ids}`);

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const [address, tokenData] of Object.entries(data.data || {})) {
      prices[address] = (tokenData as { price: number }).price || 0;
    }

    return prices;
  } catch (error) {
    console.error(`Jupiter multi-price error:`, error);
    return {};
  }
}

export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number, // In lamports/smallest unit
  slippageBps: number = 50 // 0.5%
): Promise<{
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
} | null> {
  try {
    const response = await fetch(
      `${QUOTE_API_URL}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Jupiter quote error:`, error);
    return null;
  }
}

// Jupiter doesn't provide historical OHLCV data
// For Solana tokens with no CoinGecko listing, we need Birdeye (premium)
// This is a placeholder that returns current price
export async function fetchJupiterOHLCV(
  tokenAddress: string,
  _timeframe: "1h" | "4h" | "1d" = "1h"
): Promise<CandleData[]> {
  const priceData = await fetchJupiterPrice(tokenAddress);

  if (!priceData) {
    return [];
  }

  const now = Date.now();

  // Generate a single candle with current price
  // Real implementation would need Birdeye or similar for historical data
  return [
    {
      timestamp: now,
      open: priceData.price,
      high: priceData.price,
      low: priceData.price,
      close: priceData.price,
      volume: 0,
    },
  ];
}

// Token validation
export async function isValidSolanaToken(
  address: string
): Promise<boolean> {
  try {
    const price = await fetchJupiterPrice(address);
    return price !== null;
  } catch {
    return false;
  }
}
