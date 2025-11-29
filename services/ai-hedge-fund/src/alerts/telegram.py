"""
Telegram Alert Integration
Send trading signals to Telegram chats/channels
"""

import httpx
from typing import Any


class TelegramAlerter:
    """Send alerts to Telegram"""

    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"

    async def send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        """Send a text message"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/sendMessage",
                    json={
                        "chat_id": self.chat_id,
                        "text": text,
                        "parse_mode": parse_mode,
                        "disable_web_page_preview": True,
                    },
                )
                return response.status_code == 200
            except Exception:
                return False

    async def send_signal(
        self,
        token: str,
        action: str,
        confidence: float,
        reasoning: str,
        price: float | None = None,
        execution_plan: dict | None = None,
    ) -> bool:
        """Send a formatted trading signal"""
        # Emoji based on action
        emoji = {
            "buy": "🟢",
            "bullish": "🟢",
            "sell": "🔴",
            "bearish": "🔴",
            "avoid": "🔴",
            "hold": "🟡",
            "neutral": "🟡",
        }.get(action.lower(), "⚪")

        message = f"""
{emoji} <b>AI Hedge Fund Signal</b>

<b>Token:</b> {token}
<b>Action:</b> {action.upper()}
<b>Confidence:</b> {confidence:.0f}%
"""

        if price:
            message += f"<b>Price:</b> ${price:.6f}\n"

        message += f"\n<b>Analysis:</b>\n{reasoning[:500]}..."

        if execution_plan:
            message += f"""

<b>Execution Plan:</b>
• Entry: {execution_plan.get('entry_price', 'N/A')}
• Size: {execution_plan.get('position_size_pct', 'N/A')}
• Stop: {execution_plan.get('stop_loss', 'N/A')}
• TP: {', '.join(execution_plan.get('take_profit', []))}
"""

        message += "\n\n<i>Not financial advice. DYOR.</i>"

        return await self.send_message(message)

    async def send_analysis_summary(
        self,
        token: str,
        signals: list[dict],
        final_decision: dict,
    ) -> bool:
        """Send a summary of full analysis"""
        bullish = sum(1 for s in signals if s.get("action") == "bullish")
        bearish = sum(1 for s in signals if s.get("action") == "bearish")

        decision = final_decision.get("action", "unknown").upper()
        emoji = "🟢" if decision in ["BUY", "BULLISH"] else "🔴" if decision in ["SELL", "BEARISH", "AVOID"] else "🟡"

        message = f"""
{emoji} <b>{token} Analysis Complete</b>

<b>Consensus:</b> {bullish} bullish / {bearish} bearish
<b>Final Decision:</b> {decision}
<b>Conviction:</b> {final_decision.get('conviction', 'N/A')}
<b>Confidence:</b> {final_decision.get('confidence', 0):.0f}%

<b>Top Signals:</b>
"""

        # Add top 3 signals
        for signal in signals[:3]:
            action_emoji = "🟢" if signal.get("action") == "bullish" else "🔴" if signal.get("action") == "bearish" else "🟡"
            message += f"{action_emoji} {signal.get('agent')}: {signal.get('action')} ({signal.get('confidence')}%)\n"

        message += "\n<i>Use /analyze {token} for full details</i>"

        return await self.send_message(message)
