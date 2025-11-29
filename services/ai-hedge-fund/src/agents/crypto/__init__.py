"""
Crypto-Native Trading Agents
"""

from .degen_agent import DegenAgent, DEGEN_CONFIG
from .solana_agent import SolanaSpecialistAgent, SOLANA_CONFIG
from .whale_agent import WhaleWatcherAgent, WHALE_CONFIG
from .pump_trader import PumpTraderAgent, PUMP_TRADER_CONFIG
from .onchain_agent import OnChainAnalystAgent, ONCHAIN_CONFIG

__all__ = [
    "DegenAgent",
    "DEGEN_CONFIG",
    "SolanaSpecialistAgent",
    "SOLANA_CONFIG",
    "WhaleWatcherAgent",
    "WHALE_CONFIG",
    "PumpTraderAgent",
    "PUMP_TRADER_CONFIG",
    "OnChainAnalystAgent",
    "ONCHAIN_CONFIG",
]
