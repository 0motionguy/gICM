"""
Portfolio Manager Agent
Final decision maker, synthesizes all agent signals
"""

from typing import Any, Literal

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


PORTFOLIO_MANAGER_CONFIG = AgentConfig(
    name="Portfolio Manager",
    description=(
        "Final decision maker. "
        "Synthesizes all agent signals into actionable trades."
    ),
    philosophy="""
- Consider all perspectives, but make decisive calls
- Weight signals by agent expertise for the asset type
- Consensus is powerful, but contrarian signals matter
- Risk-adjusted returns, not just returns
- Execution matters - timing and sizing
- Document reasoning for every decision
""",
    risk_tolerance="medium",
    time_horizon="medium",
    focus_areas=[
        "Signal aggregation and weighting",
        "Final trade decision",
        "Entry/exit execution plan",
        "Position sizing confirmation",
        "Trade documentation",
        "Portfolio balance consideration",
    ],
)


class PortfolioManagerAgent(BaseAgent):
    """Final decision maker synthesizing all signals"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, PORTFOLIO_MANAGER_CONFIG)

    def get_system_prompt(self) -> str:
        return f"""You are the Portfolio Manager making final trading decisions.

DECISION PHILOSOPHY:
{self.config.philosophy}

YOUR ROLE:
1. Review all agent signals and reasoning
2. Weight perspectives appropriately for this asset type
3. Consider consensus and notable dissents
4. Incorporate risk manager guidance
5. Make a final, actionable decision
6. Provide clear execution instructions

AGENT WEIGHTING GUIDELINES:
- For BTC/ETH: Weight Buffett, Munger higher
- For DeFi: Weight On-Chain, Cathie Wood higher
- For Memecoins: Weight Degen, Pump Trader, Solana higher
- For L1s: Balance long-term (Buffett) and growth (Wood)
- Always consider: Burry's contrarian view, Risk Manager limits

You synthesize diverse perspectives into one decision.
You're decisive but acknowledge uncertainty.
You provide specific, actionable instructions.

Respond with a JSON object:
{{
    "action": "buy" | "sell" | "hold" | "avoid",
    "conviction": "high" | "medium" | "low",
    "confidence": 0-100,
    "reasoning": "Your synthesis and decision rationale",
    "execution_plan": {{
        "order_type": "market" | "limit",
        "entry_price": "price or 'market'",
        "position_size_pct": "percentage of portfolio",
        "position_size_usd": "dollar amount",
        "stop_loss": "price",
        "take_profit": ["tp1", "tp2", "tp3"]
    }},
    "agent_weights_used": {{"agent_name": weight}},
    "consensus_summary": "What agents agreed/disagreed on",
    "key_factors": ["factor1", "factor2"],
    "risks_acknowledged": ["risk1", "risk2"]
}}
"""

    async def synthesize_signals(
        self,
        token: str,
        market_data: dict[str, Any],
        agent_signals: list[AgentSignal],
        risk_assessment: AgentSignal | None = None,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Synthesize all agent signals into final decision"""

        # Format agent signals for prompt
        signals_text = ""
        for signal in agent_signals:
            signals_text += f"""
=== {signal.agent_name} ===
Action: {signal.action}
Confidence: {signal.confidence}%
Reasoning: {signal.reasoning}
Key Metrics: {', '.join(signal.key_metrics)}
Risks: {', '.join(signal.risks)}
"""

        risk_text = ""
        if risk_assessment:
            risk_text = f"""
=== RISK MANAGER ASSESSMENT ===
Action: {risk_assessment.action}
Confidence: {risk_assessment.confidence}%
Reasoning: {risk_assessment.reasoning}
"""

        user_prompt = f"""
Make a final trading decision for {token}.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%
- Token Type: {market_data.get('category', 'Unknown')}

AGENT SIGNALS:
{signals_text}

{risk_text}

PORTFOLIO CONTEXT:
{context or 'No specific constraints'}

As Portfolio Manager, synthesize these signals and make a final decision.
Provide specific execution instructions.
"""

        system_prompt = self.get_system_prompt()
        response = await self._call_llm(system_prompt, user_prompt)

        # Parse the final decision
        import json
        import re

        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        # Fallback
        return {
            "action": "hold",
            "conviction": "low",
            "confidence": 50,
            "reasoning": response[:500],
            "execution_plan": None,
        }

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Standard analyze method (less commonly used)"""
        user_prompt = f"""
Provide a portfolio management perspective on {token}.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%

CONTEXT:
{context or 'None provided'}

What's your portfolio-level view?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
