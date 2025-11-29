"""
Configuration for AI Hedge Fund
"""

from typing import Literal
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment"""

    # LLM settings
    llm_provider: Literal["anthropic", "openai"] = Field(
        default="anthropic",
        description="LLM provider to use"
    )
    llm_model: str = Field(
        default="claude-sonnet-4-20250514",
        description="Model name for the LLM"
    )
    llm_temperature: float = Field(
        default=0.3,
        description="Temperature for LLM responses"
    )

    # API keys
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")

    # Data provider keys (optional, for premium data)
    birdeye_api_key: str | None = Field(default=None, alias="BIRDEYE_API_KEY")
    helius_api_key: str | None = Field(default=None, alias="HELIUS_API_KEY")

    # Server settings
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8001)

    # Trading mode: paper (simulated), micro ($100-1000), live (full)
    trading_mode: Literal["paper", "micro", "live"] = Field(
        default="paper",
        description="Trading execution mode",
        alias="TRADING_MODE"
    )

    # Trading limits (for micro/live modes)
    max_position_size_usd: float = Field(
        default=100.0,
        description="Maximum position size in USD"
    )
    daily_loss_limit_usd: float = Field(
        default=50.0,
        description="Maximum daily loss before pausing"
    )
    require_approval: bool = Field(
        default=True,
        description="Require manual approval for micro/live trades"
    )

    # Feature flags
    show_reasoning: bool = Field(
        default=True,
        description="Show agent reasoning in output"
    )
    parallel_agents: bool = Field(
        default=True,
        description="Run agents in parallel where possible"
    )
    enable_live_trading: bool = Field(
        default=False,
        description="Enable actual trade execution (requires trading_mode != paper)"
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


def get_settings() -> Settings:
    """Get application settings"""
    return Settings()
