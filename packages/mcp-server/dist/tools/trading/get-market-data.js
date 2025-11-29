/**
 * Get Market Data Tool
 * Fetches token market data from CoinGecko and DexScreener
 */
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
export async function getMarketData(token, chain = "solana") {
    const data = { token, chain };
    // Try DexScreener first (faster, better for new tokens)
    try {
        const dexResponse = await fetch(`${DEXSCREENER_BASE}/dex/search?q=${encodeURIComponent(token)}`);
        if (dexResponse.ok) {
            const dexData = await dexResponse.json();
            const pairs = dexData.pairs || [];
            // Filter by chain and get first match
            const chainPairs = pairs.filter((p) => p.chainId === chain);
            const pair = chainPairs[0] || pairs[0];
            if (pair) {
                data.price = parseFloat(pair.priceUsd || "0");
                data.priceNative = parseFloat(pair.priceNative || "0");
                data.volume24h = parseFloat(pair.volume?.h24 || "0");
                data.liquidity = parseFloat(pair.liquidity?.usd || "0");
                data.change24h = pair.priceChange?.h24;
                data.fdv = parseFloat(pair.fdv || "0");
                data.dex = pair.dexId;
            }
        }
    }
    catch (e) {
        // Continue to CoinGecko
    }
    // Try CoinGecko for additional data
    try {
        const cgResponse = await fetch(`${COINGECKO_BASE}/coins/${token.toLowerCase()}?localization=false&tickers=false`);
        if (cgResponse.ok) {
            const cgData = await cgResponse.json();
            const market = cgData.market_data || {};
            // Only override if we don't have DexScreener data
            data.price = data.price || market.current_price?.usd;
            data.marketCap = market.market_cap?.usd;
            data.volume24h = data.volume24h || market.total_volume?.usd;
            data.change24h = data.change24h ?? market.price_change_percentage_24h;
            data.change7d = market.price_change_percentage_7d;
            data.change30d = market.price_change_percentage_30d;
            data.ath = market.ath?.usd;
            data.athChange = market.ath_change_percentage?.usd;
            data.fdv = data.fdv || market.fully_diluted_valuation?.usd;
        }
    }
    catch (e) {
        // Data from DexScreener is sufficient
    }
    return data;
}
//# sourceMappingURL=get-market-data.js.map