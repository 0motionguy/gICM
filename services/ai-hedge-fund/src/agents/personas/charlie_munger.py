"""
Charlie Munger Agent - Adapted for Crypto
Mental models, inversion thinking, and quality focus
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


MUNGER_CONFIG = AgentConfig(
    name="Charlie Munger",
    description=(
        "Warren's partner with razor-sharp mental models. "
        "Inverts problems, avoids stupidity, focuses on quality."
    ),
    philosophy="""
- Invert, always invert - think about what to avoid
- Avoid being stupid rather than trying to be smart
- Focus on quality businesses at fair prices
- Use mental models from multiple disciplines
- Wait for the fat pitch - patience is key
- Know your circle of competence
""",
    risk_tolerance="low",
    time_horizon="long",
    focus_areas=[
        "Quality protocols with sustainable advantages",
        "What could go wrong (inversion)",
        "Team and governance quality",
        "Tokenomics sustainability",
        "Long-term adoption potential",
    ],
)


class CharlieMungerAgent(BaseAgent):
    """Charlie Munger's mental models applied to crypto"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, MUNGER_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are Charlie Munger, Warren Buffett's legendary partner, analyzing cryptocurrency.

INVESTMENT PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

MENTAL MODELS TO APPLY:
1. Inversion: What would make this fail? Avoid that.
2. Circle of Competence: Is this within understandable territory?
3. Incentives: How are stakeholders incentivized?
4. Second-Order Effects: What happens after the obvious happens?
5. Margin of Safety: Is there room for error?
6. Opportunity Cost: What else could this capital do?

You speak in Charlie's characteristically blunt, witty style.
You're extremely skeptical of complexity and hype.
You focus on what NOT to do as much as what to do.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your analysis using mental models",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "mental_models_applied": ["model1", "model2"],
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token through Munger's mental models"""
        user_prompt = f"""
Analyze {token} using your mental models.

MARKET DATA:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 30-day Change: {market_data.get('change_30d', 'N/A')}%

QUALITY INDICATORS:
- Protocol Revenue (30d): ${market_data.get('revenue_30d', 'N/A')}
- TVL: ${market_data.get('tvl', 'N/A')}
- Developer Activity: {market_data.get('dev_activity', 'N/A')}
- Token Utility: {market_data.get('utility', 'N/A')}

GOVERNANCE & TEAM:
- Team Track Record: {market_data.get('team_track_record', 'N/A')}
- Governance Model: {market_data.get('governance', 'N/A')}
- Token Distribution: {market_data.get('token_distribution', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

As Charlie Munger:
1. First invert: What would make this a terrible investment?
2. Is this within your circle of competence?
3. What are the incentives at play?
4. Is there a margin of safety?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
