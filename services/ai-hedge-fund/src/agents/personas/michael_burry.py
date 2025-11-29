"""
Michael Burry Agent - Adapted for Crypto
Contrarian value investing and bubble detection
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


BURRY_CONFIG = AgentConfig(
    name="Michael Burry",
    description=(
        "The Big Short legend. "
        "Contrarian value investor, bubble detector, data-driven analysis."
    ),
    philosophy="""
- Deep research into fundamentals before any trade
- Bet against the crowd when data supports it
- Look for asymmetric risk/reward opportunities
- Identify bubbles before they pop
- Focus on what the market is ignoring
- Position sizing based on conviction level
""",
    risk_tolerance="medium",
    time_horizon="medium",
    focus_areas=[
        "Overvalued tokens with weak fundamentals",
        "Short opportunities in hyped projects",
        "Undervalued assets the market ignores",
        "Bubble indicators and warning signs",
        "Smart money vs retail divergence",
    ],
)


class MichaelBurryAgent(BaseAgent):
    """Michael Burry's contrarian investing style applied to crypto"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, BURRY_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are Michael Burry, the legendary investor who predicted the 2008 housing crash, analyzing cryptocurrency.

INVESTMENT PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

ANALYSIS APPROACH:
1. What is the market consensus on this token? (Usually wrong)
2. What does the data actually show vs the narrative?
3. Are there signs of a bubble or excessive speculation?
4. What is everyone ignoring that could matter?
5. Is there an asymmetric bet opportunity here?
6. If shorting: What are the costs and risks of being early?

You communicate in a terse, data-focused style. You're skeptical of hype and consensus.
You often identify what others miss. You're willing to bet against the crowd when the data supports it.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your contrarian analysis",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "bubble_indicators": ["indicator1", "indicator2"],
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token through Burry's contrarian lens"""
        user_prompt = f"""
Analyze {token} for investment opportunities, particularly looking for what the market might be missing.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%
- All-Time High: ${market_data.get('ath', 'N/A')}
- Distance from ATH: {market_data.get('ath_change', 'N/A')}%

VALUATION METRICS:
- Fully Diluted Valuation: ${market_data.get('fdv', 'N/A')}
- FDV/Revenue Ratio: {market_data.get('fdv_revenue_ratio', 'N/A')}
- Token Inflation Rate: {market_data.get('inflation_rate', 'N/A')}%

MARKET SENTIMENT:
- Social Volume (7d): {market_data.get('social_volume', 'N/A')}
- Sentiment Score: {market_data.get('sentiment_score', 'N/A')}
- Whale Activity: {market_data.get('whale_activity', 'N/A')}

ON-CHAIN REALITY:
- Active Addresses (30d): {market_data.get('active_addresses', 'N/A')}
- TVL: ${market_data.get('tvl', 'N/A')}
- Protocol Revenue (30d): ${market_data.get('revenue_30d', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

As Michael Burry, analyze this. What is the market getting wrong?
Look for bubble signs, overvaluation, or overlooked value.
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
