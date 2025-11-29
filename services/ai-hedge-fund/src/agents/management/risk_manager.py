"""
Risk Manager Agent
Portfolio risk assessment and position sizing
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


RISK_MANAGER_CONFIG = AgentConfig(
    name="Risk Manager",
    description=(
        "Portfolio risk controller. "
        "Position sizing, correlation analysis, and risk limits."
    ),
    philosophy="""
- Preservation of capital is paramount
- Position sizing based on conviction and volatility
- Correlation matters - avoid concentrated bets
- Set stops and respect them
- Liquidity is a risk factor
- Never risk more than you can afford to lose
""",
    risk_tolerance="low",
    time_horizon="medium",
    focus_areas=[
        "Position sizing recommendations",
        "Portfolio concentration analysis",
        "Volatility assessment",
        "Liquidity risk evaluation",
        "Correlation with existing positions",
        "Stop loss and take profit levels",
    ],
)


class RiskManagerAgent(BaseAgent):
    """Portfolio risk management specialist"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, RISK_MANAGER_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are a risk manager overseeing a crypto portfolio.

RISK PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

RISK FRAMEWORK:
1. What is the appropriate position size?
2. How volatile is this asset?
3. What's the liquidity situation?
4. How does this correlate with existing positions?
5. Where should stops be placed?
6. What's the max acceptable loss on this trade?

You prioritize capital preservation over returns.
You think probabilistically about outcomes.
You enforce discipline and risk limits.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your risk assessment",
    "position_size": "percentage of portfolio",
    "max_position_usd": "dollar amount",
    "stop_loss": "price or percentage",
    "take_profit_levels": ["tp1", "tp2", "tp3"],
    "volatility_assessment": "low/medium/high/extreme",
    "liquidity_risk": "low/medium/high",
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
        """Assess risk for a trade"""
        portfolio = context.get("portfolio", {}) if context else {}

        user_prompt = f"""
Assess risk for a potential {token} position.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}

VOLATILITY:
- 24h Change: {market_data.get('change_24h', 'N/A')}%
- 7d Change: {market_data.get('change_7d', 'N/A')}%
- 30d Change: {market_data.get('change_30d', 'N/A')}%
- 30d Volatility: {market_data.get('volatility_30d', 'N/A')}%
- ATH Drawdown: {market_data.get('ath_change', 'N/A')}%

LIQUIDITY:
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- DEX Liquidity: ${market_data.get('dex_liquidity', 'N/A')}
- Bid-Ask Spread: {market_data.get('spread', 'N/A')}%
- Slippage (10k): {market_data.get('slippage_10k', 'N/A')}%

PORTFOLIO CONTEXT:
- Portfolio Size: ${portfolio.get('total_value', 'N/A')}
- Current Allocation: {portfolio.get('current_allocation', 'None')}
- Existing {token} Position: {portfolio.get(f'{token}_position', 'None')}
- Max Single Position: {portfolio.get('max_position_pct', 10)}%
- Available Capital: ${portfolio.get('available_capital', 'N/A')}

OTHER SIGNALS:
- Aggregate Agent Sentiment: {context.get('aggregate_sentiment', 'N/A') if context else 'N/A'}
- Average Confidence: {context.get('avg_confidence', 'N/A') if context else 'N/A'}

ADDITIONAL CONTEXT:
{context.get('notes', 'None provided') if context else 'None provided'}

As Risk Manager, provide position sizing and risk parameters.
How much should we allocate? Where are the stops?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
