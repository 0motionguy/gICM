"""
Alert Manager - Coordinates all alert channels
"""

from typing import Any
from .telegram import TelegramAlerter
from .discord import DiscordAlerter


class AlertManager:
    """Manages multiple alert channels"""

    def __init__(self):
        self.telegram: TelegramAlerter | None = None
        self.discord: DiscordAlerter | None = None
        self._enabled = False

    def configure_telegram(self, bot_token: str, chat_id: str) -> None:
        """Configure Telegram alerts"""
        self.telegram = TelegramAlerter(bot_token, chat_id)
        self._enabled = True

    def configure_discord(self, webhook_url: str) -> None:
        """Configure Discord alerts"""
        self.discord = DiscordAlerter(webhook_url)
        self._enabled = True

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    async def send_signal(
        self,
        token: str,
        action: str,
        confidence: float,
        reasoning: str,
        price: float | None = None,
        execution_plan: dict | None = None,
        market_data: dict | None = None,
    ) -> dict[str, bool]:
        """Send signal to all configured channels"""
        results = {}

        if self.telegram:
            results["telegram"] = await self.telegram.send_signal(
                token, action, confidence, reasoning, price, execution_plan
            )

        if self.discord:
            results["discord"] = await self.discord.send_signal(
                token, action, confidence, reasoning, price, execution_plan, market_data
            )

        return results

    async def send_analysis_complete(
        self,
        token: str,
        signals: list[dict],
        final_decision: dict,
        market_data: dict | None = None,
    ) -> dict[str, bool]:
        """Send analysis completion to all channels"""
        results = {}

        if self.telegram:
            results["telegram"] = await self.telegram.send_analysis_summary(
                token, signals, final_decision
            )

        if self.discord:
            results["discord"] = await self.discord.send_analysis_summary(
                token, signals, final_decision, market_data
            )

        return results


# Global alert manager instance
alert_manager = AlertManager()


def get_alert_manager() -> AlertManager:
    """Get the global alert manager"""
    return alert_manager
