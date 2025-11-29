"""
Agents module - All trading agents for AI Hedge Fund
"""

from .base_agent import BaseAgent, AgentSignal, AgentConfig

# Persona agents
from .personas import (
    WarrenBuffettAgent,
    BUFFETT_CONFIG,
    MichaelBurryAgent,
    BURRY_CONFIG,
    CharlieMungerAgent,
    MUNGER_CONFIG,
    CathieWoodAgent,
    WOOD_CONFIG,
    BillAckmanAgent,
    ACKMAN_CONFIG,
)

# Crypto-native agents
from .crypto import (
    DegenAgent,
    DEGEN_CONFIG,
    SolanaSpecialistAgent,
    SOLANA_CONFIG,
    WhaleWatcherAgent,
    WHALE_CONFIG,
    PumpTraderAgent,
    PUMP_TRADER_CONFIG,
    OnChainAnalystAgent,
    ONCHAIN_CONFIG,
)

# Management agents
from .management import (
    RiskManagerAgent,
    RISK_MANAGER_CONFIG,
    PortfolioManagerAgent,
    PORTFOLIO_MANAGER_CONFIG,
)

__all__ = [
    # Base
    "BaseAgent",
    "AgentSignal",
    "AgentConfig",
    # Personas
    "WarrenBuffettAgent",
    "BUFFETT_CONFIG",
    "MichaelBurryAgent",
    "BURRY_CONFIG",
    "CharlieMungerAgent",
    "MUNGER_CONFIG",
    "CathieWoodAgent",
    "WOOD_CONFIG",
    "BillAckmanAgent",
    "ACKMAN_CONFIG",
    # Crypto
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
    # Management
    "RiskManagerAgent",
    "RISK_MANAGER_CONFIG",
    "PortfolioManagerAgent",
    "PORTFOLIO_MANAGER_CONFIG",
]
