import type { TokenData, PoolData, Trade } from "../types.js";

const BIRDEYE_BASE = "https://public-api.birdeye.so";

export class BirdeyeProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BIRDEYE_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      headers: {
        "X-API-KEY": this.apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { data: T };
    return data.data;
  }

  async getTokenPrice(address: string): Promise<TokenData | null> {
    try {
      const data = await this.fetch<{
        value: number;
        updateUnixTime: number;
        updateHumanTime: string;
        priceChange24h: number;
      }>("/defi/price", { address });

      const overview = await this.fetch<{
        symbol: string;
        name: string;
        decimals: number;
        liquidity: number;
        v24hUSD: number;
        mc: number;
        holder: number;
      }>("/defi/token_overview", { address });

      return {
        address,
        symbol: overview.symbol,
        name: overview.name,
        decimals: overview.decimals,
        price: data.value,
        priceChange24h: data.priceChange24h,
        volume24h: overview.v24hUSD,
        marketCap: overview.mc,
        liquidity: overview.liquidity,
        holders: overview.holder,
      };
    } catch (error) {
      console.error("[Birdeye] getTokenPrice failed:", error);
      return null;
    }
  }

  async getTokenTrades(
    address: string,
    limit = 50
  ): Promise<Trade[]> {
    try {
      const data = await this.fetch<
        Array<{
          txHash: string;
          blockUnixTime: number;
          side: string;
          tokenAddress: string;
          tokenAmount: string;
          vsTokenAddress: string;
          vsTokenAmount: string;
          owner: string;
          source: string;
        }>
      >("/defi/txs/token", {
        address,
        limit: limit.toString(),
        tx_type: "swap",
      });

      return data.map((tx) => ({
        hash: tx.txHash,
        timestamp: tx.blockUnixTime * 1000,
        type: tx.side === "buy" ? "buy" : "sell",
        tokenIn: tx.side === "buy" ? tx.vsTokenAddress : tx.tokenAddress,
        tokenOut: tx.side === "buy" ? tx.tokenAddress : tx.vsTokenAddress,
        amountIn: tx.side === "buy" ? tx.vsTokenAmount : tx.tokenAmount,
        amountOut: tx.side === "buy" ? tx.tokenAmount : tx.vsTokenAmount,
        priceUsd: 0,
        trader: tx.owner,
        dex: tx.source,
      }));
    } catch (error) {
      console.error("[Birdeye] getTokenTrades failed:", error);
      return [];
    }
  }

  async getTokenPools(address: string): Promise<PoolData[]> {
    try {
      const data = await this.fetch<
        Array<{
          address: string;
          name: string;
          source: string;
          tvl: number;
          volume24h: number;
          fee: number;
          apy: number;
        }>
      >("/defi/pool_list", { address });

      return data.map((pool) => ({
        address: pool.address,
        name: pool.name,
        dex: pool.source,
        token0: {} as TokenData,
        token1: {} as TokenData,
        tvl: pool.tvl,
        volume24h: pool.volume24h,
        apy: pool.apy,
        fee: pool.fee,
      }));
    } catch (error) {
      console.error("[Birdeye] getTokenPools failed:", error);
      return [];
    }
  }

  async getWalletPortfolio(wallet: string): Promise<TokenData[]> {
    try {
      const data = await this.fetch<{
        items: Array<{
          address: string;
          symbol: string;
          name: string;
          decimals: number;
          balance: string;
          uiAmount: number;
          priceUsd: number;
          valueUsd: number;
        }>;
      }>("/v1/wallet/token_list", { wallet });

      return data.items.map((item) => ({
        address: item.address,
        symbol: item.symbol,
        name: item.name,
        decimals: item.decimals,
        price: item.priceUsd,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0,
      }));
    } catch (error) {
      console.error("[Birdeye] getWalletPortfolio failed:", error);
      return [];
    }
  }
}
