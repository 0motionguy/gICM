"""
AI Hedge Fund - Multi-Agent Trading Analysis

A sophisticated trading analysis system powered by AI agents
modeled after famous investors and crypto-native strategies.

Features:
- 12 AI Agents (persona, crypto-native, management)
- Multiple analysis modes (full, fast, degen)
- Free-tier market data (CoinGecko, DexScreener, Jupiter)
- FastAPI and CLI interfaces

Usage:
    # Python
    from ai_hedge_fund import analyze_token
    result = await analyze_token("SOL")

    # CLI
    ai-hedge-fund analyze SOL --mode full
    ai-hedge-fund quick BONK
    ai-hedge-fund serve --port 8001
"""

from .workflow import (
    TradingGraph,
    create_trading_graph,
    analyze_token,
)
from .agents import (
    BaseAgent,
    AgentSignal,
    AgentConfig,
)

__version__ = "1.0.0"

__all__ = [
    # Workflow
    "TradingGraph",
    "create_trading_graph",
    "analyze_token",
    # Agents
    "BaseAgent",
    "AgentSignal",
    "AgentConfig",
    # Version
    "__version__",
]
