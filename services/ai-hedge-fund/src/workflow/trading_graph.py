"""
Trading Graph - LangGraph Workflow for Multi-Agent Analysis
Orchestrates all agents and synthesizes their signals
"""

import asyncio
from typing import Any, Literal, TypedDict
from dataclasses import dataclass, field

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel
from langgraph.graph import StateGraph, END

from ..agents import (
    AgentSignal,
    # Personas
    WarrenBuffettAgent,
    MichaelBurryAgent,
    CharlieMungerAgent,
    CathieWoodAgent,
    BillAckmanAgent,
    # Crypto
    DegenAgent,
    SolanaSpecialistAgent,
    WhaleWatcherAgent,
    PumpTraderAgent,
    OnChainAnalystAgent,
    # Management
    RiskManagerAgent,
    PortfolioManagerAgent,
)
from ..data import get_market_data
from ..config import get_settings


class GraphState(TypedDict):
    """State passed between nodes in the graph"""
    token: str
    chain: str
    market_data: dict[str, Any]
    agent_signals: list[AgentSignal]
    risk_assessment: AgentSignal | None
    final_decision: dict[str, Any] | None
    error: str | None
    mode: Literal["full", "fast", "degen"]


@dataclass
class TradingGraph:
    """Multi-agent trading analysis workflow"""

    llm: BaseChatModel
    mode: Literal["full", "fast", "degen"] = "full"
    show_reasoning: bool = True

    # Agents initialized lazily
    _persona_agents: list = field(default_factory=list)
    _crypto_agents: list = field(default_factory=list)
    _management_agents: dict = field(default_factory=dict)

    def __post_init__(self):
        """Initialize agents based on mode"""
        # Always available personas
        self._persona_agents = [
            WarrenBuffettAgent(self.llm),
            MichaelBurryAgent(self.llm),
        ]

        if self.mode == "full":
            self._persona_agents.extend([
                CharlieMungerAgent(self.llm),
                CathieWoodAgent(self.llm),
                BillAckmanAgent(self.llm),
            ])

        # Crypto agents based on mode
        if self.mode == "degen":
            self._crypto_agents = [
                DegenAgent(self.llm),
                PumpTraderAgent(self.llm),
                SolanaSpecialistAgent(self.llm),
            ]
        else:
            self._crypto_agents = [
                DegenAgent(self.llm),
                SolanaSpecialistAgent(self.llm),
                WhaleWatcherAgent(self.llm),
                OnChainAnalystAgent(self.llm),
            ]

            if self.mode == "full":
                self._crypto_agents.append(PumpTraderAgent(self.llm))

        # Management agents
        self._management_agents = {
            "risk": RiskManagerAgent(self.llm),
            "portfolio": PortfolioManagerAgent(self.llm),
        }

    async def analyze(
        self,
        token: str,
        chain: str = "solana",
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Run full multi-agent analysis on a token.

        Returns:
            Complete analysis with all agent signals and final decision
        """
        # Fetch market data
        market_data = await get_market_data(token, chain)

        if not market_data.get("price"):
            return {
                "error": f"Could not fetch market data for {token}",
                "token": token,
                "chain": chain,
            }

        # Run persona agents in parallel
        persona_signals = await self._run_agents_parallel(
            self._persona_agents,
            token,
            market_data,
            context,
        )

        # Run crypto agents in parallel
        crypto_signals = await self._run_agents_parallel(
            self._crypto_agents,
            token,
            market_data,
            context,
        )

        all_signals = persona_signals + crypto_signals

        # Get risk assessment
        risk_context = {
            **(context or {}),
            "aggregate_sentiment": self._calculate_sentiment(all_signals),
            "avg_confidence": sum(s.confidence for s in all_signals) / len(all_signals) if all_signals else 0,
        }

        risk_assessment = await self._management_agents["risk"].analyze(
            token, market_data, risk_context
        )

        # Get final decision from portfolio manager
        final_decision = await self._management_agents["portfolio"].synthesize_signals(
            token,
            market_data,
            all_signals,
            risk_assessment,
            context,
        )

        return {
            "token": token,
            "chain": chain,
            "market_data": market_data,
            "agent_signals": [self._signal_to_dict(s) for s in all_signals],
            "risk_assessment": self._signal_to_dict(risk_assessment),
            "final_decision": final_decision,
            "summary": self._generate_summary(all_signals, final_decision),
        }

    async def quick_signal(
        self,
        token: str,
        chain: str = "solana",
    ) -> dict[str, Any]:
        """
        Fast analysis with minimal agents.
        Good for quick screening.
        """
        market_data = await get_market_data(token, chain)

        if not market_data.get("price"):
            return {"error": f"No data for {token}", "token": token}

        # Run just 3 key agents
        agents = [
            DegenAgent(self.llm),
            OnChainAnalystAgent(self.llm),
            RiskManagerAgent(self.llm),
        ]

        signals = await self._run_agents_parallel(agents, token, market_data, None)

        sentiment = self._calculate_sentiment(signals)
        avg_confidence = sum(s.confidence for s in signals) / len(signals) if signals else 0

        return {
            "token": token,
            "price": market_data.get("price"),
            "change_24h": market_data.get("change_24h"),
            "sentiment": sentiment,
            "confidence": avg_confidence,
            "signals": [self._signal_to_dict(s) for s in signals],
            "quick_take": self._generate_quick_take(signals, sentiment, avg_confidence),
        }

    async def _run_agents_parallel(
        self,
        agents: list,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None,
    ) -> list[AgentSignal]:
        """Run multiple agents in parallel"""
        tasks = [
            agent.analyze(token, market_data, context)
            for agent in agents
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        signals = []
        for result in results:
            if isinstance(result, AgentSignal):
                signals.append(result)
            elif isinstance(result, Exception):
                if self.show_reasoning:
                    print(f"Agent error: {result}")

        return signals

    def _calculate_sentiment(self, signals: list[AgentSignal]) -> str:
        """Calculate aggregate sentiment from signals"""
        if not signals:
            return "neutral"

        bullish = sum(1 for s in signals if s.action == "bullish")
        bearish = sum(1 for s in signals if s.action == "bearish")

        if bullish > bearish * 2:
            return "very_bullish"
        elif bullish > bearish:
            return "bullish"
        elif bearish > bullish * 2:
            return "very_bearish"
        elif bearish > bullish:
            return "bearish"
        return "neutral"

    def _signal_to_dict(self, signal: AgentSignal) -> dict[str, Any]:
        """Convert AgentSignal to dict"""
        return {
            "agent": signal.agent_name,
            "action": signal.action,
            "confidence": signal.confidence,
            "reasoning": signal.reasoning,
            "key_metrics": signal.key_metrics,
            "risks": signal.risks,
        }

    def _generate_summary(
        self,
        signals: list[AgentSignal],
        decision: dict[str, Any],
    ) -> str:
        """Generate human-readable summary"""
        bullish = [s for s in signals if s.action == "bullish"]
        bearish = [s for s in signals if s.action == "bearish"]

        summary = f"**Analysis Complete**\n"
        summary += f"- {len(bullish)} agents bullish, {len(bearish)} bearish\n"
        summary += f"- Final action: {decision.get('action', 'unknown')}\n"
        summary += f"- Conviction: {decision.get('conviction', 'unknown')}\n"

        if decision.get("execution_plan"):
            plan = decision["execution_plan"]
            summary += f"\n**Execution Plan:**\n"
            summary += f"- Entry: {plan.get('entry_price', 'N/A')}\n"
            summary += f"- Size: {plan.get('position_size_pct', 'N/A')}%\n"
            summary += f"- Stop: {plan.get('stop_loss', 'N/A')}\n"

        return summary

    def _generate_quick_take(
        self,
        signals: list[AgentSignal],
        sentiment: str,
        confidence: float,
    ) -> str:
        """Generate quick take summary"""
        action_map = {
            "very_bullish": "Strong buy signal",
            "bullish": "Bullish lean",
            "neutral": "Mixed signals",
            "bearish": "Bearish lean",
            "very_bearish": "Strong sell/avoid signal",
        }

        take = action_map.get(sentiment, "Unclear")
        take += f" ({confidence:.0f}% avg confidence)"

        return take


def create_trading_graph(
    provider: Literal["anthropic", "openai"] = "anthropic",
    model: str | None = None,
    mode: Literal["full", "fast", "degen"] = "full",
    show_reasoning: bool = True,
) -> TradingGraph:
    """
    Factory function to create TradingGraph.

    Args:
        provider: LLM provider ("anthropic" or "openai")
        model: Model name (uses defaults if None)
        mode: Analysis mode
            - "full": All agents, comprehensive analysis
            - "fast": Minimal agents, quick screening
            - "degen": Optimized for memecoins/launches
        show_reasoning: Print agent reasoning to console

    Returns:
        Configured TradingGraph instance
    """
    settings = get_settings()

    if provider == "anthropic":
        llm = ChatAnthropic(
            model=model or settings.llm_model,
            temperature=settings.llm_temperature,
            api_key=settings.anthropic_api_key,
        )
    else:
        llm = ChatOpenAI(
            model=model or "gpt-4o",
            temperature=settings.llm_temperature,
            api_key=settings.openai_api_key,
        )

    return TradingGraph(
        llm=llm,
        mode=mode,
        show_reasoning=show_reasoning,
    )


async def analyze_token(
    token: str,
    chain: str = "solana",
    mode: Literal["full", "fast", "degen"] = "full",
    provider: Literal["anthropic", "openai"] = "anthropic",
) -> dict[str, Any]:
    """
    Convenience function to analyze a token.

    Args:
        token: Token symbol or address
        chain: Blockchain (default: solana)
        mode: Analysis mode
        provider: LLM provider

    Returns:
        Complete analysis result
    """
    graph = create_trading_graph(provider=provider, mode=mode)
    return await graph.analyze(token, chain)
