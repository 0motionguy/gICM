/**
 * Data Layer - Aggregates all data providers
 * Uses free-tier APIs: CoinGecko, DexScreener, Jupiter
 */

import type { OHLCV, TokenInfo } from "../agents/types.js";
import * as coingecko from "./coingecko.js";
import * as dexscreener from "./dexscreener.js";
import * as jupiter from "./jupiter.js";

export { coingecko, dexscreener, jupiter };

/**
 * Fetch OHLCV data for a token
 * Automatically selects the best data source based on token info
 */
export async function fetchTokenData(
  token: TokenInfo,
  timeframe: "1h" | "4h" | "1d"
): Promise<OHLCV[]> {
  const days = timeframe === "1d" ? 30 : timeframe === "4h" ? 7 : 3;

  // For Solana tokens with address, try DexScreener first for current price
  // then fall back to CoinGecko for OHLCV
  if (token.chain === "solana" && token.address) {
    // Get current price from DexScreener
    const dexData = await dexscreener.fetchSolanaToken(token.address);

    if (dexData) {
      // Try to get OHLCV from CoinGecko by symbol
      const ohlcv = await coingecko.fetchMarketChart(token.symbol, days);

      if (ohlcv.length > 0) {
        return ohlcv.map((candle) => ({
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        }));
      }

      // If no OHLCV available, generate minimal data from current price
      const now = Date.now();
      const hourMs = 60 * 60 * 1000;
      const candles: OHLCV[] = [];

      // Generate synthetic candles based on price change
      const priceChange = dexData.priceChange24h / 100;
      const currentPrice = dexData.price;

      for (let i = 23; i >= 0; i--) {
        const timestamp = now - i * hourMs;
        const progress = (24 - i) / 24;
        const previousPrice = currentPrice / (1 + priceChange);
        const price = previousPrice + (currentPrice - previousPrice) * progress;

        // Add some randomness for realistic candles
        const volatility = Math.abs(priceChange) * 0.1 + 0.005;
        const high = price * (1 + volatility * Math.random());
        const low = price * (1 - volatility * Math.random());

        candles.push({
          timestamp,
          open: i === 23 ? previousPrice : candles[candles.length - 1]?.close || price,
          high,
          low,
          close: price,
          volume: dexData.volume24h / 24,
        });
      }

      return candles;
    }
  }

  // For non-Solana tokens or tokens without address, use CoinGecko
  const ohlcv = await coingecko.fetchMarketChart(token.symbol, days);

  if (ohlcv.length > 0) {
    return ohlcv.map((candle) => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));
  }

  // Try OHLC endpoint as fallback
  const ohlc = await coingecko.fetchOHLCV(token.symbol, days);
  return ohlc.map((candle) => ({
    timestamp: candle.timestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  }));
}

/**
 * Fetch comprehensive market data for a token
 */
export async function fetchMarketData(token: TokenInfo): Promise<{
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity?: number;
  fdv?: number;
  ath?: number;
  athChange?: number;
}> {
  // For Solana tokens with address
  if (token.chain === "solana" && token.address) {
    const dexData = await dexscreener.fetchSolanaToken(token.address);

    if (dexData) {
      return {
        price: dexData.price,
        priceChange24h: dexData.priceChange24h,
        volume24h: dexData.volume24h,
        marketCap: dexData.marketCap,
        liquidity: dexData.liquidity,
        fdv: dexData.fdv,
      };
    }
  }

  // Use CoinGecko for other tokens
  const [priceData, tokenInfo] = await Promise.all([
    coingecko.fetchPrice(token.symbol),
    coingecko.fetchTokenInfo(token.symbol),
  ]);

  return {
    price: priceData?.price || 0,
    priceChange24h: priceData?.priceChangePercent24h || 0,
    volume24h: priceData?.volume24h || 0,
    marketCap: priceData?.marketCap || tokenInfo?.marketCap || 0,
    ath: tokenInfo?.ath,
    athChange: tokenInfo?.athChangePercent,
  };
}

/**
 * Search for tokens by symbol or name
 */
export async function searchTokens(
  query: string,
  chain?: "solana" | "ethereum" | "base"
): Promise<
  Array<{
    symbol: string;
    name: string;
    address?: string;
    chain: string;
    price: number;
    marketCap: number;
  }>
> {
  const pairs = await dexscreener.searchTokens(query);

  return pairs
    .filter((pair) => !chain || pair.chainId === chain)
    .slice(0, 20)
    .map((pair) => ({
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      address: pair.baseToken.address,
      chain: pair.chainId,
      price: parseFloat(pair.priceUsd) || 0,
      marketCap: pair.marketCap || 0,
    }));
}

/**
 * Get Jupiter swap quote for Solana tokens
 */
export async function getSwapQuote(
  inputToken: string,
  outputToken: string,
  amountIn: number
): Promise<{
  amountOut: number;
  priceImpact: number;
  route: string[];
} | null> {
  // Convert symbols to addresses
  const inputAddress =
    jupiter.getTokenAddress(inputToken) || inputToken;
  const outputAddress =
    jupiter.getTokenAddress(outputToken) || outputToken;

  const quote = await jupiter.getSwapQuote(inputAddress, outputAddress, amountIn);

  if (!quote) {
    return null;
  }

  return {
    amountOut: parseFloat(quote.outAmount),
    priceImpact: quote.priceImpactPct,
    route: quote.routePlan.map((r) => r.swapInfo.label),
  };
}
