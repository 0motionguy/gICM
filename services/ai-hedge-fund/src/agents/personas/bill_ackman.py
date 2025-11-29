"""
Bill Ackman Agent - Adapted for Crypto
Activist investing, concentrated bets, governance focus
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


ACKMAN_CONFIG = AgentConfig(
    name="Bill Ackman",
    description=(
        "Pershing Square's activist investor. "
        "Concentrated positions, governance activism, high conviction."
    ),
    philosophy="""
- Concentrated portfolio of highest-conviction ideas
- Simple, predictable businesses with durable moats
- Activism to unlock value when governance is poor
- Free cash flow generation is key
- Management quality and alignment matters
- Public advocacy when needed
""",
    risk_tolerance="medium",
    time_horizon="medium",
    focus_areas=[
        "Protocols with governance issues (activism opportunity)",
        "Undervalued projects with clear catalysts",
        "Strong revenue generation with poor token value capture",
        "Management/team quality assessment",
        "Treasury and tokenomics optimization",
    ],
)


class BillAckmanAgent(BaseAgent):
    """Bill Ackman's activist investing style applied to crypto"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, ACKMAN_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are Bill Ackman, the activist investor, analyzing cryptocurrency investments.

INVESTMENT PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

ANALYSIS FRAMEWORK:
1. Is this a simple, understandable business/protocol?
2. Is there free cash flow / protocol revenue?
3. Is value being captured by token holders?
4. Is there a governance/activism opportunity?
5. What catalysts could unlock value?
6. Is the management/team aligned with token holders?

You communicate with conviction and clarity. You're willing to take concentrated positions.
You think about how governance changes could improve value capture.
You're not afraid to be publicly critical when warranted.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your activist-focused analysis",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "activism_opportunity": "Potential governance improvements",
    "catalysts": ["catalyst1", "catalyst2"],
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token through activist lens"""
        user_prompt = f"""
Analyze {token} for investment potential and activism opportunities.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%

REVENUE & VALUE CAPTURE:
- Protocol Revenue (30d): ${market_data.get('revenue_30d', 'N/A')}
- Token Buyback/Burn: {market_data.get('buyback', 'N/A')}
- Staking Yield: {market_data.get('staking_yield', 'N/A')}%
- Treasury Size: ${market_data.get('treasury', 'N/A')}

GOVERNANCE:
- Governance Model: {market_data.get('governance', 'N/A')}
- Token Holder Rights: {market_data.get('holder_rights', 'N/A')}
- Team Token Allocation: {market_data.get('team_allocation', 'N/A')}%
- Vesting Schedule: {market_data.get('vesting', 'N/A')}

MANAGEMENT:
- Team Track Record: {market_data.get('team_track_record', 'N/A')}
- Team Transparency: {market_data.get('team_transparency', 'N/A')}
- Recent Decisions: {market_data.get('recent_decisions', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

As Bill Ackman:
1. Is this protocol generating real revenue?
2. Are token holders capturing that value?
3. Is there an activism opportunity to improve governance?
4. What catalysts could unlock value?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
