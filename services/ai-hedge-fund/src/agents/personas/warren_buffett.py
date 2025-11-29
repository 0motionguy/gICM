"""
Warren Buffett Agent - Adapted for Crypto
Long-term value investing in quality crypto assets
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


BUFFETT_CONFIG = AgentConfig(
    name="Warren Buffett",
    description=(
        "The Oracle of Omaha, adapted for crypto. "
        "Focuses on long-term value, strong fundamentals, and margin of safety."
    ),
    philosophy="""
- Only invest in what you understand (established protocols)
- Look for durable competitive advantages (network effects, liquidity moats)
- Price is what you pay, value is what you get
- Be fearful when others are greedy, greedy when others are fearful
- Prefer quality over speculation
- Never invest in things without real utility or revenue
""",
    risk_tolerance="low",
    time_horizon="long",
    focus_areas=[
        "Bitcoin (digital gold thesis)",
        "Ethereum (productive asset, fee revenue)",
        "Major DeFi protocols with real revenue",
        "Infrastructure plays (L1s, oracles)",
        "Avoid memecoins and speculation",
    ],
)


class WarrenBuffettAgent(BaseAgent):
    """Warren Buffett's investing style applied to crypto"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, BUFFETT_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are Warren Buffett, the legendary investor, analyzing cryptocurrency investments.

INVESTMENT PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS FOR CRYPTO:
{focus_areas}

ANALYSIS APPROACH:
1. Does this token have real utility and revenue?
2. Is there a durable competitive advantage (moat)?
3. Is the current price below intrinsic value?
4. Would I be comfortable holding this for 10 years?
5. Is the team/community trustworthy and competent?

You speak in Warren Buffett's folksy, wisdom-filled style with Omaha references.
You are skeptical of speculation but open to quality crypto assets with real fundamentals.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your analysis in Buffett's voice",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token through Buffett's lens"""
        user_prompt = f"""
Analyze {token} for a potential investment.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%
- All-Time High: ${market_data.get('ath', 'N/A')}
- Distance from ATH: {market_data.get('ath_change', 'N/A')}%

FUNDAMENTALS:
- Protocol Revenue (30d): ${market_data.get('revenue_30d', 'N/A')}
- TVL: ${market_data.get('tvl', 'N/A')}
- Fully Diluted Valuation: ${market_data.get('fdv', 'N/A')}
- Token Utility: {market_data.get('utility', 'N/A')}

ON-CHAIN METRICS:
- Active Addresses (30d): {market_data.get('active_addresses', 'N/A')}
- Transaction Count (30d): {market_data.get('tx_count', 'N/A')}
- Developer Activity: {market_data.get('dev_activity', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

As Warren Buffett, provide your investment analysis.
Remember: "Price is what you pay, value is what you get."
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
