"""
Cathie Wood Agent - Adapted for Crypto
Disruptive innovation and exponential growth focus
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


WOOD_CONFIG = AgentConfig(
    name="Cathie Wood",
    description=(
        "ARK Invest's innovation evangelist. "
        "5-year time horizon, exponential growth, disruption thesis."
    ),
    philosophy="""
- Focus on disruptive innovation platforms
- 5-year investment time horizon minimum
- Embrace volatility as opportunity
- Conviction in exponential growth curves
- Research-driven, thesis-based investing
- Concentrate in highest-conviction ideas
""",
    risk_tolerance="high",
    time_horizon="long",
    focus_areas=[
        "DeFi protocols disrupting traditional finance",
        "Layer 1s with scaling innovation",
        "AI + Crypto convergence",
        "NFT/Gaming infrastructure",
        "Cross-chain interoperability",
        "Zero-knowledge technology",
    ],
)


class CathieWoodAgent(BaseAgent):
    """Cathie Wood's innovation investing style applied to crypto"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, WOOD_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are Cathie Wood, CEO of ARK Invest, analyzing cryptocurrency investments.

INVESTMENT PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

ANALYSIS FRAMEWORK:
1. Is this a disruptive innovation platform?
2. What is the 5-year potential if the thesis plays out?
3. Is there exponential growth potential (not linear)?
4. What convergence opportunities exist (AI+Crypto, DeFi+TradFi)?
5. Is the team capable of executing on the vision?
6. What's the addressable market if this succeeds?

You communicate with enthusiasm about innovation and disruption.
You're willing to hold through volatility for long-term conviction plays.
You think in terms of Wright's Law and S-curves.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your innovation-focused analysis",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "disruption_thesis": "How this disrupts existing systems",
    "five_year_potential": "Bull case scenario",
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token through ARK's innovation lens"""
        user_prompt = f"""
Analyze {token} for disruptive innovation potential.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%

GROWTH METRICS:
- User Growth (30d): {market_data.get('user_growth', 'N/A')}%
- Transaction Growth (30d): {market_data.get('tx_growth', 'N/A')}%
- Developer Activity Trend: {market_data.get('dev_activity', 'N/A')}
- TVL Growth: {market_data.get('tvl_growth', 'N/A')}%

INNOVATION INDICATORS:
- Technology Category: {market_data.get('category', 'N/A')}
- Unique Technical Features: {market_data.get('tech_features', 'N/A')}
- Integration Partners: {market_data.get('partners', 'N/A')}
- Ecosystem Size: {market_data.get('ecosystem_size', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

As Cathie Wood:
1. What is the disruptive innovation thesis here?
2. What's the 5-year bull case?
3. Is this exponential or linear growth potential?
4. Where are the convergence opportunities?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
