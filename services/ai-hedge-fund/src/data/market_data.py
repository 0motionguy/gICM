"""
Market Data Fetcher - Free Tier APIs
CoinGecko, DexScreener, Jupiter for Solana
"""

import asyncio
from typing import Any
import httpx


class MarketDataFetcher:
    """Fetches market data from free tier APIs"""

    COINGECKO_BASE = "https://api.coingecko.com/api/v3"
    DEXSCREENER_BASE = "https://api.dexscreener.com/latest"
    JUPITER_PRICE_BASE = "https://price.jup.ag/v6"

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def get_token_data(
        self,
        token: str,
        chain: str = "solana"
    ) -> dict[str, Any]:
        """
        Get comprehensive token data from multiple sources.
        Returns aggregated market data for agent analysis.
        """
        # Fetch from multiple sources in parallel
        tasks = [
            self._fetch_coingecko(token),
            self._fetch_dexscreener(token, chain),
        ]

        if chain == "solana":
            tasks.append(self._fetch_jupiter_price(token))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Merge results
        data: dict[str, Any] = {
            "token": token,
            "chain": chain,
        }

        for result in results:
            if isinstance(result, dict):
                data.update(result)

        return data

    async def _fetch_coingecko(self, token_id: str) -> dict[str, Any]:
        """Fetch from CoinGecko (free tier)"""
        try:
            # Try to get by ID first
            url = f"{self.COINGECKO_BASE}/coins/{token_id.lower()}"
            params = {
                "localization": "false",
                "tickers": "false",
                "community_data": "true",
                "developer_data": "true",
            }

            response = await self.client.get(url, params=params)

            if response.status_code != 200:
                # Try search
                return await self._search_coingecko(token_id)

            data = response.json()
            market_data = data.get("market_data", {})

            return {
                "price": market_data.get("current_price", {}).get("usd"),
                "market_cap": market_data.get("market_cap", {}).get("usd"),
                "volume_24h": market_data.get("total_volume", {}).get("usd"),
                "change_24h": market_data.get("price_change_percentage_24h"),
                "change_7d": market_data.get("price_change_percentage_7d"),
                "change_30d": market_data.get("price_change_percentage_30d"),
                "ath": market_data.get("ath", {}).get("usd"),
                "ath_change": market_data.get("ath_change_percentage", {}).get("usd"),
                "fdv": market_data.get("fully_diluted_valuation", {}).get("usd"),
                "circulating_supply": market_data.get("circulating_supply"),
                "total_supply": market_data.get("total_supply"),
                "dev_activity": data.get("developer_data", {}).get("commit_count_4_weeks"),
                "github_commits": data.get("developer_data", {}).get("commit_count_4_weeks"),
                "twitter_followers": data.get("community_data", {}).get("twitter_followers"),
                "category": data.get("categories", ["Unknown"])[0] if data.get("categories") else "Unknown",
            }

        except Exception:
            return {}

    async def _search_coingecko(self, query: str) -> dict[str, Any]:
        """Search CoinGecko for token"""
        try:
            url = f"{self.COINGECKO_BASE}/search"
            response = await self.client.get(url, params={"query": query})

            if response.status_code != 200:
                return {}

            data = response.json()
            coins = data.get("coins", [])

            if not coins:
                return {}

            # Get first match
            coin_id = coins[0].get("id")
            if coin_id:
                return await self._fetch_coingecko(coin_id)

            return {}

        except Exception:
            return {}

    async def _fetch_dexscreener(
        self,
        token: str,
        chain: str = "solana"
    ) -> dict[str, Any]:
        """Fetch from DexScreener"""
        try:
            # Search by token symbol/address
            url = f"{self.DEXSCREENER_BASE}/dex/search"
            response = await self.client.get(url, params={"q": token})

            if response.status_code != 200:
                return {}

            data = response.json()
            pairs = data.get("pairs", [])

            if not pairs:
                return {}

            # Filter by chain if specified
            chain_pairs = [p for p in pairs if p.get("chainId") == chain]
            pair = chain_pairs[0] if chain_pairs else pairs[0]

            price_change = pair.get("priceChange", {})
            txns = pair.get("txns", {})
            txns_24h = txns.get("h24", {})

            return {
                "price": float(pair.get("priceUsd", 0)),
                "price_native": float(pair.get("priceNative", 0)),
                "volume_24h": float(pair.get("volume", {}).get("h24", 0)),
                "liquidity": float(pair.get("liquidity", {}).get("usd", 0)),
                "change_5m": price_change.get("m5"),
                "change_1h": price_change.get("h1"),
                "change_6h": price_change.get("h6"),
                "change_24h": price_change.get("h24"),
                "buys_24h": txns_24h.get("buys", 0),
                "sells_24h": txns_24h.get("sells", 0),
                "dex": pair.get("dexId"),
                "pair_address": pair.get("pairAddress"),
                "base_token": pair.get("baseToken", {}).get("symbol"),
                "fdv": float(pair.get("fdv", 0)),
            }

        except Exception:
            return {}

    async def _fetch_jupiter_price(self, token: str) -> dict[str, Any]:
        """Fetch from Jupiter (Solana)"""
        try:
            # Jupiter uses token mint addresses, but also supports symbols
            url = f"{self.JUPITER_PRICE_BASE}/price"
            params = {"ids": token}

            response = await self.client.get(url, params=params)

            if response.status_code != 200:
                return {}

            data = response.json()
            token_data = data.get("data", {}).get(token, {})

            if not token_data:
                return {}

            return {
                "jupiter_price": token_data.get("price"),
                "jupiter_vs_sol_price": token_data.get("vsTokenPrice"),
            }

        except Exception:
            return {}

    async def get_multiple_tokens(
        self,
        tokens: list[str],
        chain: str = "solana"
    ) -> dict[str, dict[str, Any]]:
        """Fetch data for multiple tokens in parallel"""
        tasks = [self.get_token_data(token, chain) for token in tokens]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            tokens[i]: result if isinstance(result, dict) else {}
            for i, result in enumerate(results)
        }


# Singleton instance
_fetcher: MarketDataFetcher | None = None


async def get_market_data(token: str, chain: str = "solana") -> dict[str, Any]:
    """Get market data for a token"""
    global _fetcher
    if _fetcher is None:
        _fetcher = MarketDataFetcher()
    return await _fetcher.get_token_data(token, chain)


async def get_multiple_market_data(
    tokens: list[str],
    chain: str = "solana"
) -> dict[str, dict[str, Any]]:
    """Get market data for multiple tokens"""
    global _fetcher
    if _fetcher is None:
        _fetcher = MarketDataFetcher()
    return await _fetcher.get_multiple_tokens(tokens, chain)
