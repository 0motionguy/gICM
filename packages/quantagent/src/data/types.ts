/**
 * Data provider types
 */

export interface PriceData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  address?: string;
  decimals?: number;
  totalSupply?: number;
  circulatingSupply?: number;
}

export interface PoolData {
  address: string;
  dex: string;
  baseToken: TokenMetadata;
  quoteToken: TokenMetadata;
  liquidity: number;
  volume24h: number;
  priceUsd: number;
  priceChange24h: number;
  txCount24h: number;
  createdAt?: number;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DataProviderConfig {
  timeout?: number;
  retries?: number;
}
