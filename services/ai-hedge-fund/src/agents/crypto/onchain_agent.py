"""
On-Chain Analyst Agent
Deep on-chain data analysis and interpretation
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


ONCHAIN_CONFIG = AgentConfig(
    name="On-Chain Analyst",
    description=(
        "Deep on-chain data specialist. "
        "Blockchain forensics, metrics, and behavioral analysis."
    ),
    philosophy="""
- On-chain data doesn't lie, narratives do
- Transaction patterns reveal intentions
- Active addresses = real usage
- Fee revenue = sustainable value
- Velocity and holding time matter
- Cross-reference multiple on-chain sources
""",
    risk_tolerance="medium",
    time_horizon="medium",
    focus_areas=[
        "Active address trends",
        "Transaction patterns and velocity",
        "Protocol revenue and fees",
        "Token velocity and holding periods",
        "Contract interaction patterns",
        "DeFi TVL and utilization",
    ],
)


class OnChainAnalystAgent(BaseAgent):
    """On-chain data analysis specialist"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, ONCHAIN_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are an on-chain data analyst, deriving insights from blockchain data.

ANALYSIS PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

ON-CHAIN ANALYSIS FRAMEWORK:
1. What do active addresses tell us about real usage?
2. Is transaction count growing or declining?
3. What's the fee revenue trend? (Sustainable value)
4. How is token velocity affecting price?
5. Are contracts being used or is it wash trading?
6. What does DeFi TVL say about protocol health?

You interpret raw blockchain data into actionable insights.
You distinguish between real usage and artificial metrics.
You focus on fundamentals that can't be faked.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your on-chain data interpretation",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "usage_trend": "growing/stable/declining",
    "revenue_health": "strong/moderate/weak",
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze on-chain metrics"""
        user_prompt = f"""
Analyze on-chain data for {token}.

PRICE CONTEXT:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%

USAGE METRICS:
- Active Addresses (24h): {market_data.get('active_addresses_24h', 'N/A')}
- Active Addresses (7d avg): {market_data.get('active_addresses_7d', 'N/A')}
- Active Address Growth (30d): {market_data.get('address_growth_30d', 'N/A')}%
- Transaction Count (24h): {market_data.get('tx_count_24h', 'N/A')}
- Transaction Count (7d avg): {market_data.get('tx_count_7d', 'N/A')}

REVENUE & FEES:
- Protocol Revenue (24h): ${market_data.get('revenue_24h', 'N/A')}
- Protocol Revenue (30d): ${market_data.get('revenue_30d', 'N/A')}
- Revenue Growth (MoM): {market_data.get('revenue_growth', 'N/A')}%
- Average Fee: ${market_data.get('avg_fee', 'N/A')}

DEFI METRICS:
- TVL: ${market_data.get('tvl', 'N/A')}
- TVL Change (7d): {market_data.get('tvl_change_7d', 'N/A')}%
- TVL/MCap Ratio: {market_data.get('tvl_mcap_ratio', 'N/A')}

TOKEN VELOCITY:
- Token Velocity: {market_data.get('velocity', 'N/A')}
- Average Holding Period: {market_data.get('avg_holding_days', 'N/A')} days
- Tokens Moving (24h): {market_data.get('tokens_moved_24h', 'N/A')}%

DEVELOPER ACTIVITY:
- GitHub Commits (30d): {market_data.get('github_commits', 'N/A')}
- Active Contributors: {market_data.get('contributors', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

What does the on-chain data reveal?
Is this real usage or manufactured activity?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
