"""
Birdeye API Integration
Premium Solana token data (requires API key)
"""

import httpx
from typing import Any


class BirdeyeClient:
    """
    Birdeye API client for Solana token data
    Free tier: 100 requests/day
    """

    BASE_URL = "https://public-api.birdeye.so"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers["X-API-KEY"] = api_key

    async def get_token_overview(self, address: str) -> dict[str, Any]:
        """Get comprehensive token overview"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/defi/token_overview",
                    params={"address": address},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return {}

                data = response.json()
                return data.get("data", {})
            except Exception:
                return {}

    async def get_token_security(self, address: str) -> dict[str, Any]:
        """Get token security info (honeypot, rugpull risk, etc.)"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/defi/token_security",
                    params={"address": address},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return {}

                data = response.json()
                return data.get("data", {})
            except Exception:
                return {}

    async def get_price_history(
        self,
        address: str,
        interval: str = "1H",
        time_from: int | None = None,
        time_to: int | None = None,
    ) -> list[dict]:
        """Get OHLCV price history"""
        async with httpx.AsyncClient() as client:
            try:
                params = {
                    "address": address,
                    "type": interval,
                }
                if time_from:
                    params["time_from"] = time_from
                if time_to:
                    params["time_to"] = time_to

                response = await client.get(
                    f"{self.BASE_URL}/defi/ohlcv",
                    params=params,
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return []

                data = response.json()
                return data.get("data", {}).get("items", [])
            except Exception:
                return []

    async def get_trades(
        self,
        address: str,
        limit: int = 50,
        tx_type: str = "all",
    ) -> list[dict]:
        """Get recent trades for a token"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/defi/txs/token",
                    params={
                        "address": address,
                        "limit": limit,
                        "tx_type": tx_type,
                    },
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return []

                data = response.json()
                return data.get("data", {}).get("items", [])
            except Exception:
                return []

    async def get_top_traders(self, address: str, limit: int = 20) -> list[dict]:
        """Get top traders for a token"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/defi/token_top_traders",
                    params={"address": address, "limit": limit},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return []

                data = response.json()
                return data.get("data", {}).get("items", [])
            except Exception:
                return []

    async def search_tokens(self, query: str, limit: int = 10) -> list[dict]:
        """Search for tokens"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/defi/v3/search",
                    params={"keyword": query, "limit": limit},
                    headers=self.headers,
                )

                if response.status_code != 200:
                    return []

                data = response.json()
                return data.get("data", {}).get("tokens", [])
            except Exception:
                return []
