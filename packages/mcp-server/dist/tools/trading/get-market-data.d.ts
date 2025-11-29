/**
 * Get Market Data Tool
 * Fetches token market data from CoinGecko and DexScreener
 */
interface MarketData {
    token: string;
    chain: string;
    price?: number;
    priceNative?: number;
    marketCap?: number;
    volume24h?: number;
    change24h?: number;
    change7d?: number;
    change30d?: number;
    liquidity?: number;
    fdv?: number;
    ath?: number;
    athChange?: number;
    dex?: string;
}
export declare function getMarketData(token: string, chain?: string): Promise<MarketData>;
export {};
//# sourceMappingURL=get-market-data.d.ts.map