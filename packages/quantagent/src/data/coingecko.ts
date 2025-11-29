/**
 * CoinGecko Data Provider - Free tier, no API key required
 * Docs: https://www.coingecko.com/en/api/documentation
 */

import type { CandleData, PriceData } from "./types.js";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Common token ID mappings
const TOKEN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BONK: "bonk",
  WIF: "dogwifcoin",
  JUP: "jupiter-exchange-solana",
  RAY: "raydium",
  ORCA: "orca",
  PYTH: "pyth-network",
  JTO: "jito-governance-token",
  RENDER: "render-token",
  HNT: "helium",
  RNDR: "render-token",
  INJ: "injective-protocol",
  TIA: "celestia",
  SEI: "sei-network",
  SUI: "sui",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
};

function getTokenId(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return TOKEN_IDS[upperSymbol] || symbol.toLowerCase();
}

export async function fetchPrice(symbol: string): Promise<PriceData | null> {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
    );

    if (!response.ok) {
      console.warn(`CoinGecko price fetch failed for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const tokenData = data[id];

    if (!tokenData) {
      return null;
    }

    return {
      price: tokenData.usd || 0,
      priceChange24h: 0, // Calculated from percent
      priceChangePercent24h: tokenData.usd_24h_change || 0,
      volume24h: tokenData.usd_24h_vol || 0,
      marketCap: tokenData.usd_market_cap || 0,
      high24h: 0, // Not available in simple endpoint
      low24h: 0,
    };
  } catch (error) {
    console.error(`CoinGecko error for ${symbol}:`, error);
    return null;
  }
}

export async function fetchOHLCV(
  symbol: string,
  days: number = 7
): Promise<CandleData[]> {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/coins/${id}/ohlc?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      console.warn(`CoinGecko OHLCV fetch failed for ${symbol}: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // CoinGecko returns [timestamp, open, high, low, close]
    return data.map((candle: number[]) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0, // OHLC endpoint doesn't include volume
    }));
  } catch (error) {
    console.error(`CoinGecko OHLCV error for ${symbol}:`, error);
    return [];
  }
}

export async function fetchMarketChart(
  symbol: string,
  days: number = 7
): Promise<CandleData[]> {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      console.warn(`CoinGecko market_chart failed for ${symbol}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const prices = data.prices || [];
    const volumes = data.total_volumes || [];

    // Convert to OHLCV format (prices are [timestamp, price])
    // Group into hourly candles
    const candles: CandleData[] = [];
    const hourMs = 60 * 60 * 1000;

    for (let i = 0; i < prices.length; i++) {
      const [timestamp, price] = prices[i];
      const volume = volumes[i]?.[1] || 0;

      // Round to hour
      const hourTimestamp = Math.floor(timestamp / hourMs) * hourMs;

      // Find or create candle for this hour
      let candle = candles.find((c) => c.timestamp === hourTimestamp);
      if (!candle) {
        candle = {
          timestamp: hourTimestamp,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0,
        };
        candles.push(candle);
      }

      // Update candle
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += volume / (prices.length / candles.length); // Approximate
    }

    return candles.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error(`CoinGecko market_chart error for ${symbol}:`, error);
    return [];
  }
}

export async function fetchTokenInfo(symbol: string): Promise<{
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  rank: number;
  ath: number;
  athChangePercent: number;
  atl: number;
  atlChangePercent: number;
} | null> {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(`${BASE_URL}/coins/${id}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      marketCap: data.market_data?.market_cap?.usd || 0,
      rank: data.market_cap_rank || 0,
      ath: data.market_data?.ath?.usd || 0,
      athChangePercent: data.market_data?.ath_change_percentage?.usd || 0,
      atl: data.market_data?.atl?.usd || 0,
      atlChangePercent: data.market_data?.atl_change_percentage?.usd || 0,
    };
  } catch (error) {
    console.error(`CoinGecko token info error for ${symbol}:`, error);
    return null;
  }
}
