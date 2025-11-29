"""
Degen Agent - High Risk/Reward Crypto Specialist
Memecoins, launches, momentum plays
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


DEGEN_CONFIG = AgentConfig(
    name="Degen Trader",
    description=(
        "CT native, meme lord, ape extraordinaire. "
        "High risk/reward plays, launches, momentum trading."
    ),
    philosophy="""
- Ape early, sell into strength
- Memes are money, narratives are everything
- Follow smart money wallets
- Size according to conviction (small size on yolos)
- Take profits, don't marry bags
- The meta is always rotating
""",
    risk_tolerance="degen",
    time_horizon="short",
    focus_areas=[
        "Memecoin launches and pumps",
        "Narrative plays and CT meta",
        "Smart money wallet activity",
        "Social volume spikes",
        "Low cap gems before discovery",
        "Momentum and volume surges",
    ],
)


class DegenAgent(BaseAgent):
    """Crypto Twitter degen trading style"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, DEGEN_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are a Crypto Twitter degen, analyzing tokens for quick plays.

TRADING PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

ANALYSIS APPROACH:
1. What's the narrative/meme potential?
2. Is smart money accumulating?
3. What's the social volume doing?
4. Is there momentum to ride?
5. What's the risk/reward on this play?
6. Entry, target, stop - keep it simple

You communicate in CT degen slang. Emojis encouraged.
You're looking for asymmetric plays with quick upside.
You know most plays fail, so sizing and risk management matter.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your degen analysis (CT style)",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "narrative": "What narrative is this riding",
    "entry_target_stop": {{"entry": "price", "target": "price", "stop": "price"}},
    "position_size": "small/medium/full",
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token for degen plays"""
        user_prompt = f"""
Analyze {token} for a potential degen play.

PRICE ACTION:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%
- 1h Change: {market_data.get('change_1h', 'N/A')}%
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- Volume/MCap Ratio: {market_data.get('volume_mcap_ratio', 'N/A')}

LAUNCH METRICS:
- Token Age: {market_data.get('token_age', 'N/A')}
- Initial Liquidity: ${market_data.get('initial_liq', 'N/A')}
- Current Liquidity: ${market_data.get('liquidity', 'N/A')}
- Holders Count: {market_data.get('holders', 'N/A')}

SOCIAL SIGNALS:
- CT Mentions (24h): {market_data.get('ct_mentions', 'N/A')}
- Telegram Members: {market_data.get('tg_members', 'N/A')}
- Influencer Calls: {market_data.get('influencer_calls', 'N/A')}

SMART MONEY:
- Whale Buys (24h): {market_data.get('whale_buys', 'N/A')}
- Smart Wallet Activity: {market_data.get('smart_wallets', 'N/A')}
- Top 10 Holder %: {market_data.get('top10_percent', 'N/A')}%

ADDITIONAL CONTEXT:
{context or 'None provided'}

Analyze this like a true degen. Is this a play or nah?
What's the narrative? What's the R/R?
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
