"""
Whale Watcher Agent
Tracks and interprets smart money movements
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


WHALE_CONFIG = AgentConfig(
    name="Whale Watcher",
    description=(
        "Smart money tracker. "
        "Follows whale wallets, institutional flows, and large transactions."
    ),
    philosophy="""
- Whales move markets, follow the money
- Large wallet accumulation precedes pumps
- Distribution patterns signal tops
- Track exchange flows for sentiment
- Not all whales are smart - filter signal from noise
- Timing matters - early whale tracking wins
""",
    risk_tolerance="medium",
    time_horizon="medium",
    focus_areas=[
        "Whale wallet accumulation/distribution",
        "Exchange inflow/outflow patterns",
        "Smart money wallet identification",
        "Large transaction analysis",
        "Dormant wallet movements",
        "Institutional entry signals",
    ],
)


class WhaleWatcherAgent(BaseAgent):
    """Whale and smart money tracking specialist"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, WHALE_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are a whale watcher, tracking smart money movements in crypto.

TRACKING PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

WHALE ANALYSIS FRAMEWORK:
1. Are large wallets accumulating or distributing?
2. What are exchange flows signaling?
3. Are known smart money wallets involved?
4. Is there unusual dormant wallet activity?
5. What's the whale/retail ratio doing?
6. Are there signs of coordinated whale activity?

You interpret on-chain whale data to predict price movements.
You distinguish between smart money and dumb money whales.
You track both accumulation and distribution patterns.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your whale analysis interpretation",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "whale_activity": "accumulating/distributing/neutral",
    "smart_money_signal": "positive/negative/neutral",
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze whale activity"""
        user_prompt = f"""
Analyze whale activity for {token}.

PRICE CONTEXT:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%

WHALE METRICS:
- Whale Transactions (24h): {market_data.get('whale_txs_24h', 'N/A')}
- Large Buys (>$100k): {market_data.get('large_buys', 'N/A')}
- Large Sells (>$100k): {market_data.get('large_sells', 'N/A')}
- Net Whale Flow: ${market_data.get('net_whale_flow', 'N/A')}

HOLDER DISTRIBUTION:
- Top 10 Holders: {market_data.get('top10_percent', 'N/A')}%
- Top 50 Holders: {market_data.get('top50_percent', 'N/A')}%
- Holder Concentration Change (7d): {market_data.get('concentration_change', 'N/A')}%

EXCHANGE FLOWS:
- Exchange Inflow (24h): ${market_data.get('exchange_inflow', 'N/A')}
- Exchange Outflow (24h): ${market_data.get('exchange_outflow', 'N/A')}
- Net Exchange Flow: ${market_data.get('net_exchange_flow', 'N/A')}

SMART MONEY:
- Known Smart Wallet Holdings: {market_data.get('smart_wallet_holdings', 'N/A')}
- Smart Wallet Activity (7d): {market_data.get('smart_wallet_activity', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

What are the whales telling us? Accumulation or distribution?
Is smart money involved? What's the signal?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
