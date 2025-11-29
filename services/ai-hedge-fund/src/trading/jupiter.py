"""
Jupiter DEX Integration
Execute swaps on Solana via Jupiter aggregator
"""

import httpx
from typing import Any
from dataclasses import dataclass


@dataclass
class SwapQuote:
    """Quote for a swap"""
    input_mint: str
    output_mint: str
    input_amount: int
    output_amount: int
    price_impact_pct: float
    route_plan: list[dict]
    slippage_bps: int


@dataclass
class SwapResult:
    """Result of a swap execution"""
    success: bool
    signature: str | None
    input_amount: float
    output_amount: float
    price: float
    error: str | None = None


class JupiterClient:
    """
    Jupiter DEX client for Solana token swaps
    Uses Jupiter V6 API
    """

    QUOTE_API = "https://quote-api.jup.ag/v6"
    PRICE_API = "https://price.jup.ag/v6"

    # Common token mints
    SOL_MINT = "So11111111111111111111111111111111111111112"
    USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

    # Token symbols to mints mapping
    TOKEN_MINTS = {
        "SOL": "So11111111111111111111111111111111111111112",
        "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "WIF": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "ORCA": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    }

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    def get_mint(self, token: str) -> str:
        """Get mint address for token symbol or return as-is if already mint"""
        if len(token) > 20:  # Likely already a mint address
            return token
        return self.TOKEN_MINTS.get(token.upper(), token)

    async def get_price(self, token: str) -> float | None:
        """Get current price in USD"""
        try:
            mint = self.get_mint(token)
            response = await self.client.get(
                f"{self.PRICE_API}/price",
                params={"ids": mint}
            )

            if response.status_code != 200:
                return None

            data = response.json()
            return data.get("data", {}).get(mint, {}).get("price")
        except Exception:
            return None

    async def get_quote(
        self,
        input_token: str,
        output_token: str,
        amount: int,
        slippage_bps: int = 50,
    ) -> SwapQuote | None:
        """
        Get a quote for swapping tokens

        Args:
            input_token: Token to sell (symbol or mint)
            output_token: Token to buy (symbol or mint)
            amount: Amount in lamports/smallest unit
            slippage_bps: Slippage tolerance in basis points (50 = 0.5%)

        Returns:
            SwapQuote or None if failed
        """
        try:
            input_mint = self.get_mint(input_token)
            output_mint = self.get_mint(output_token)

            response = await self.client.get(
                f"{self.QUOTE_API}/quote",
                params={
                    "inputMint": input_mint,
                    "outputMint": output_mint,
                    "amount": amount,
                    "slippageBps": slippage_bps,
                }
            )

            if response.status_code != 200:
                return None

            data = response.json()

            return SwapQuote(
                input_mint=input_mint,
                output_mint=output_mint,
                input_amount=int(data.get("inAmount", 0)),
                output_amount=int(data.get("outAmount", 0)),
                price_impact_pct=float(data.get("priceImpactPct", 0)),
                route_plan=data.get("routePlan", []),
                slippage_bps=slippage_bps,
            )
        except Exception:
            return None

    async def simulate_swap(
        self,
        input_token: str,
        output_token: str,
        amount_usd: float,
    ) -> dict[str, Any]:
        """
        Simulate a swap (without executing)
        Good for testing and paper trading

        Args:
            input_token: Token to sell
            output_token: Token to buy
            amount_usd: Amount in USD

        Returns:
            Simulation result with expected output
        """
        try:
            # Get input token price
            input_price = await self.get_price(input_token)
            if not input_price:
                return {"error": f"Could not get price for {input_token}"}

            # Calculate amount in tokens
            token_amount = amount_usd / input_price

            # Get decimals (simplified - assume 9 for SOL, 6 for USDC)
            input_mint = self.get_mint(input_token)
            decimals = 6 if input_mint == self.USDC_MINT else 9
            amount_lamports = int(token_amount * (10 ** decimals))

            # Get quote
            quote = await self.get_quote(input_token, output_token, amount_lamports)

            if not quote:
                return {"error": "Could not get quote"}

            # Get output token price
            output_price = await self.get_price(output_token)

            # Calculate values
            output_decimals = 6 if quote.output_mint == self.USDC_MINT else 9
            output_tokens = quote.output_amount / (10 ** output_decimals)
            output_value = output_tokens * output_price if output_price else 0

            return {
                "input_token": input_token,
                "output_token": output_token,
                "input_amount": token_amount,
                "input_value_usd": amount_usd,
                "output_amount": output_tokens,
                "output_value_usd": output_value,
                "price_impact_pct": quote.price_impact_pct,
                "effective_price": amount_usd / output_tokens if output_tokens else 0,
                "slippage_bps": quote.slippage_bps,
                "route_hops": len(quote.route_plan),
            }
        except Exception as e:
            return {"error": str(e)}


# Singleton
_jupiter: JupiterClient | None = None


async def get_jupiter() -> JupiterClient:
    """Get Jupiter client singleton"""
    global _jupiter
    if _jupiter is None:
        _jupiter = JupiterClient()
    return _jupiter
