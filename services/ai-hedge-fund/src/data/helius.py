"""
Helius API Integration
Solana RPC + Enhanced APIs
"""

import httpx
from typing import Any


class HeliusClient:
    """
    Helius API client for Solana on-chain data
    Free tier: 100k credits/month
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key
        self.rpc_url = f"https://mainnet.helius-rpc.com/?api-key={api_key}" if api_key else None
        self.api_url = f"https://api.helius.xyz/v0" if api_key else None

    async def get_token_metadata(self, mint: str) -> dict[str, Any]:
        """Get token metadata"""
        if not self.api_key:
            return {}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/token-metadata",
                    params={"api-key": self.api_key, "mint": mint},
                )

                if response.status_code != 200:
                    return {}

                return response.json()
            except Exception:
                return {}

    async def get_token_holders(
        self,
        mint: str,
        limit: int = 100,
    ) -> list[dict]:
        """Get top token holders"""
        if not self.api_key:
            return []

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}/token/holders",
                    params={"api-key": self.api_key},
                    json={"mint": mint, "limit": limit},
                )

                if response.status_code != 200:
                    return []

                data = response.json()
                return data.get("result", [])
            except Exception:
                return []

    async def get_address_transactions(
        self,
        address: str,
        limit: int = 100,
    ) -> list[dict]:
        """Get transaction history for an address"""
        if not self.api_key:
            return []

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/addresses/{address}/transactions",
                    params={"api-key": self.api_key, "limit": limit},
                )

                if response.status_code != 200:
                    return []

                return response.json()
            except Exception:
                return []

    async def parse_transaction(self, signature: str) -> dict[str, Any]:
        """Parse a transaction for human-readable info"""
        if not self.api_key:
            return {}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}/transactions",
                    params={"api-key": self.api_key},
                    json={"transactions": [signature]},
                )

                if response.status_code != 200:
                    return {}

                data = response.json()
                return data[0] if data else {}
            except Exception:
                return {}

    async def get_nft_events(
        self,
        accounts: list[str],
        types: list[str] | None = None,
    ) -> list[dict]:
        """Get NFT events for addresses"""
        if not self.api_key:
            return []

        async with httpx.AsyncClient() as client:
            try:
                payload = {"query": {"accounts": accounts}}
                if types:
                    payload["query"]["types"] = types

                response = await client.post(
                    f"{self.api_url}/nft-events",
                    params={"api-key": self.api_key},
                    json=payload,
                )

                if response.status_code != 200:
                    return []

                return response.json()
            except Exception:
                return []

    async def get_balances(self, address: str) -> dict[str, Any]:
        """Get all token balances for an address"""
        if not self.api_key:
            return {}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/addresses/{address}/balances",
                    params={"api-key": self.api_key},
                )

                if response.status_code != 200:
                    return {}

                return response.json()
            except Exception:
                return {}

    async def get_name_lookup(self, name: str) -> str | None:
        """Lookup .sol domain to address"""
        if not self.api_key:
            return None

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/names/{name}",
                    params={"api-key": self.api_key},
                )

                if response.status_code != 200:
                    return None

                data = response.json()
                return data.get("owner")
            except Exception:
                return None
