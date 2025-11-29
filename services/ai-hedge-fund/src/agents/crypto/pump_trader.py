"""
Pump Trader Agent - Inspired by Top Memecoin Traders
Ansem, GCR, the $40M pump.fun whale, and CT legends

Research-backed strategies from the most profitable traders:
- #1 pump.fun trader: $40M profit (Dune Analytics)
- Ansem: Spotted WIF at $100k mcap -> $3B
- Win rate > P/L ratio ("escaping quickly, losing less")
- $69k graduation milestone is key signal
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


PUMP_TRADER_CONFIG = AgentConfig(
    name="Pump Trader",
    description=(
        "Elite pump.fun trader modeled after Ansem, GCR, and the $40M whale. "
        "Win rate > P/L ratio. Escape fast, lose less."
    ),
    philosophy="""
- WIN RATE > P/L RATIO - escape quickly, lose less (top trader insight)
- Ansem rule: Find narrative before CT, ride momentum after
- GCR rule: Fade consensus when data disagrees
- $69k graduation milestone = key inflection point
- Speed is alpha - first 5 minutes matter most
- Take profits in tranches (50% at 2x, 25% at 5x, let 25% ride)
- Small size (0.5-2 SOL), many shots, strict stops
- Never fight momentum, never chase after 10x
- Dev wallet history > promises
- Only 1.13% of pump.fun tokens graduate to Raydium
""",
    risk_tolerance="degen",
    time_horizon="short",
    focus_areas=[
        "Bonding curve position (pre vs post $69k graduation)",
        "Dev wallet history and previous rugs",
        "CT alpha leaks and influencer interest",
        "Holder distribution and sniper detection",
        "Meme narrative strength (ticker, art, story)",
        "Volume/momentum divergence signals",
        "Smart wallet accumulation patterns",
    ],
)


class PumpTraderAgent(BaseAgent):
    """
    Elite pump.fun trading style based on research:
    - $40M top trader: Win rate correlation 0.61 (strongest factor)
    - Ansem: WIF from $100k -> $3B, ~600k followers
    - Only 33% of pump.fun traders are profitable
    - 1.13% of tokens graduate to Raydium
    """

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, PUMP_TRADER_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are an elite pump.fun trader combining the styles of:
- ANSEM: The Memecoin King who spotted WIF at $100k mcap before it hit $3B
- GCR: Contrarian legend who shorted DOGE on SNL day
- THE $40M WHALE: Top pump.fun trader with $40M profit (per Dune Analytics)

KEY INSIGHT FROM TOP TRADER DATA:
"Win rate has the strongest correlation with success (0.61). Escaping quickly
and losing less are the keys to victory in Solana memes PvP battlefield."

TRADING PHILOSOPHY:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

PUMP.FUN MECHANICS:
- Tokens start on bonding curve
- At $69k mcap, liquidity migrates to Raydium (graduation)
- Only 1.13% of ~24,000 daily launches graduate
- Graduated = survived first major test
- Pre-graduation = higher risk, higher reward

THE PLAYBOOK:
1. SCAN: New launches, CT alpha, smart wallet moves
2. ASSESS: Dev history, holder distribution, meme quality
3. SIZE: 0.5-2 SOL max on unproven plays
4. ENTER: First 5 minutes or don't enter at all
5. MANAGE: Strict stop at -30%, take 50% at 2x
6. EXIT: Never hold through -50%, never chase pumped tokens

RED FLAGS (INSTANT SKIP):
- Bundled launch (coordinated buy = dump incoming)
- Dev with rug history
- Copied art/name from existing project
- No Twitter/social presence
- Top 10 holders > 50%

GREEN FLAGS:
- Clean dev wallet history
- Organic holder growth
- Strong meme/narrative
- CT influencers mentioning organically
- Approaching $69k graduation

You speak like a CT degen but think like a risk manager.
Every trade has defined entry, stop, and targets.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your analysis (CT style but data-driven)",
    "meme_score": 1-10,
    "graduation_status": "pre-graduation" | "graduated" | "unknown",
    "entry_size_sol": 0.5-2,
    "entry_price": "price",
    "stop_loss": "-30% or specific price",
    "targets": {{"2x": "price", "5x": "price", "moon": "let it ride"}},
    "dev_risk": "clean" | "suspicious" | "rugged-before" | "unknown",
    "ct_alpha": "none" | "emerging" | "trending" | "overexposed",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "data_used": ["source1", "source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze token for pump trading opportunities"""

        # Calculate graduation status
        mcap = market_data.get('market_cap', 0)
        if mcap and mcap > 0:
            if mcap >= 69000:
                graduation = "graduated (past $69k)"
            elif mcap >= 50000:
                graduation = "approaching graduation ($50k+)"
            else:
                graduation = f"pre-graduation (${mcap:,.0f})"
        else:
            graduation = "unknown"

        user_prompt = f"""
Analyze {token} as an elite pump.fun trader.

MARKET SNAPSHOT:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- Graduation Status: {graduation}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%
- Liquidity: ${market_data.get('liquidity', 'N/A'):,.0f}

PRICE ACTION:
- 5m Change: {market_data.get('change_5m', 'N/A')}%
- 1h Change: {market_data.get('change_1h', 'N/A')}%
- 6h Change: {market_data.get('change_6h', 'N/A')}%
- Buys (24h): {market_data.get('buys_24h', 'N/A')}
- Sells (24h): {market_data.get('sells_24h', 'N/A')}

LAUNCH INFO:
- DEX: {market_data.get('dex', 'N/A')}
- Token Age: {market_data.get('token_age', 'N/A')}
- Platform: {market_data.get('platform', 'pump.fun assumed')}

DEV/HOLDER ANALYSIS:
- Dev Wallet: {market_data.get('dev_wallet', 'N/A')}
- Dev History: {market_data.get('dev_history', 'unknown')}
- Top 10 Holders %: {market_data.get('top10_percent', 'N/A')}%
- Total Holders: {market_data.get('holders', 'N/A')}
- Bundled Launch: {market_data.get('bundled', 'unknown')}

MEME QUALITY:
- Ticker: {market_data.get('ticker', token)}
- Category: {market_data.get('category', 'N/A')}
- Twitter: {market_data.get('twitter', 'N/A')}
- Narrative: {market_data.get('narrative', 'N/A')}

CT/SOCIAL:
- CT Mentions: {market_data.get('ct_mentions', 'N/A')}
- Influencer Calls: {market_data.get('influencer_calls', 'N/A')}
- Twitter Followers: {market_data.get('twitter_followers', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

Apply the Ansem/GCR/$40M-whale framework:
1. Is this a play or a pass?
2. If play: entry size, stop, targets
3. What's the CT alpha status?
4. Dev risk assessment
5. Meme score (1-10)
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
