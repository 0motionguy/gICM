"""
Solana Specialist Agent
Deep Solana ecosystem expertise and SOL-native analysis
"""

from typing import Any

from langchain_core.language_models import BaseChatModel

from ..base_agent import BaseAgent, AgentConfig, AgentSignal


SOLANA_CONFIG = AgentConfig(
    name="Solana Specialist",
    description=(
        "Deep Solana ecosystem expertise. "
        "DeFi, NFTs, memecoins, and SPL token analysis."
    ),
    philosophy="""
- Solana ecosystem has unique dynamics
- Speed and low fees enable different use cases
- Watch for pump.fun launches and trends
- Jupiter aggregator data is key
- Understand SOL correlation vs ecosystem tokens
- Validator economics matter for staking plays
""",
    risk_tolerance="high",
    time_horizon="short",
    focus_areas=[
        "SPL token launches and pump.fun trends",
        "Solana DeFi protocols (Jupiter, Raydium, Orca)",
        "NFT ecosystem plays (Magic Eden, Tensor)",
        "MEV and trading infrastructure",
        "Liquid staking tokens (mSOL, jitoSOL, bSOL)",
        "SOL correlation analysis",
    ],
)


class SolanaSpecialistAgent(BaseAgent):
    """Solana ecosystem specialist"""

    def __init__(self, llm: BaseChatModel):
        super().__init__(llm, SOLANA_CONFIG)

    def get_system_prompt(self) -> str:
        focus_areas = "\n".join(f"- {area}" for area in self.config.focus_areas)

        return f"""You are a Solana ecosystem specialist analyzing SPL tokens.

EXPERTISE:
{self.config.philosophy}

FOCUS AREAS:
{focus_areas}

SOLANA-SPECIFIC ANALYSIS:
1. Is this on pump.fun or established DEXs?
2. What's the liquidity situation (Raydium, Orca, Meteora)?
3. How does this correlate with SOL?
4. What's the holder distribution like?
5. Is there VC/insider unlock risk?
6. What's the Jupiter routing efficiency?

You have deep knowledge of Solana's unique ecosystem.
You understand the difference between pump.fun memes and serious protocols.
You track Solana-specific metrics like TPS, priority fees, and MEV.

Respond with a JSON object:
{{
    "action": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "reasoning": "Your Solana-native analysis",
    "key_metrics": ["metric1", "metric2"],
    "risks": ["risk1", "risk2"],
    "sol_correlation": "high/medium/low",
    "liquidity_assessment": "deep/moderate/shallow",
    "data_used": ["data_source1", "data_source2"]
}}
"""

    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze Solana token"""
        user_prompt = f"""
Analyze {token} from a Solana ecosystem perspective.

PRICE & MARKET:
- Current Price: ${market_data.get('price', 'N/A')}
- Market Cap: ${market_data.get('market_cap', 'N/A'):,.0f}
- 24h Volume: ${market_data.get('volume_24h', 'N/A'):,.0f}
- 24h Change: {market_data.get('change_24h', 'N/A')}%

SOLANA-SPECIFIC:
- Token Program: {market_data.get('token_program', 'N/A')}
- Mint Authority: {market_data.get('mint_authority', 'N/A')}
- Freeze Authority: {market_data.get('freeze_authority', 'N/A')}
- Token Extensions: {market_data.get('token_extensions', 'N/A')}

LIQUIDITY:
- Raydium Liquidity: ${market_data.get('raydium_liq', 'N/A')}
- Orca Liquidity: ${market_data.get('orca_liq', 'N/A')}
- Meteora Liquidity: ${market_data.get('meteora_liq', 'N/A')}
- Total DEX Liquidity: ${market_data.get('total_liq', 'N/A')}

HOLDER ANALYSIS:
- Total Holders: {market_data.get('holders', 'N/A')}
- Top 10 Holder %: {market_data.get('top10_percent', 'N/A')}%
- LP Burned/Locked: {market_data.get('lp_status', 'N/A')}

SOL CORRELATION:
- 7d Correlation: {market_data.get('sol_correlation_7d', 'N/A')}
- Beta to SOL: {market_data.get('sol_beta', 'N/A')}

ADDITIONAL CONTEXT:
{context or 'None provided'}

Analyze this as a Solana ecosystem expert.
Consider Solana-specific risks and opportunities.
"""

        response = await self._call_llm(self.get_system_prompt(), user_prompt)
        return self._parse_signal(response, token)
