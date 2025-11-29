"""
Discord Webhook Alert Integration
Send trading signals to Discord channels
"""

import httpx
from typing import Any
from datetime import datetime


class DiscordAlerter:
    """Send alerts to Discord via webhooks"""

    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send_embed(self, embed: dict, content: str = "") -> bool:
        """Send a Discord embed message"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.webhook_url,
                    json={
                        "content": content,
                        "embeds": [embed],
                    },
                )
                return response.status_code in [200, 204]
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
        market_data: dict | None = None,
    ) -> bool:
        """Send a formatted trading signal as Discord embed"""
        # Color based on action
        color = {
            "buy": 0x22C55E,  # Green
            "bullish": 0x22C55E,
            "sell": 0xEF4444,  # Red
            "bearish": 0xEF4444,
            "avoid": 0xEF4444,
            "hold": 0xEAB308,  # Yellow
            "neutral": 0xEAB308,
        }.get(action.lower(), 0x6B7280)

        fields = [
            {"name": "Action", "value": action.upper(), "inline": True},
            {"name": "Confidence", "value": f"{confidence:.0f}%", "inline": True},
        ]

        if price:
            fields.append({"name": "Price", "value": f"${price:.6f}", "inline": True})

        if market_data:
            if market_data.get("market_cap"):
                fields.append({
                    "name": "Market Cap",
                    "value": f"${market_data['market_cap']:,.0f}",
                    "inline": True
                })
            if market_data.get("change_24h") is not None:
                change = market_data["change_24h"]
                emoji = "📈" if change >= 0 else "📉"
                fields.append({
                    "name": "24h Change",
                    "value": f"{emoji} {change:.2f}%",
                    "inline": True
                })

        if execution_plan:
            plan_text = f"""
**Entry:** {execution_plan.get('entry_price', 'Market')}
**Size:** {execution_plan.get('position_size_pct', 'N/A')}
**Stop:** {execution_plan.get('stop_loss', 'N/A')}
**TP:** {', '.join(execution_plan.get('take_profit', ['N/A']))}
"""
            fields.append({
                "name": "Execution Plan",
                "value": plan_text,
                "inline": False
            })

        embed = {
            "title": f"🤖 AI Hedge Fund: {token}",
            "description": reasoning[:1000] + ("..." if len(reasoning) > 1000 else ""),
            "color": color,
            "fields": fields,
            "footer": {
                "text": "Not financial advice | gICM AI Hedge Fund"
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        return await self.send_embed(embed)

    async def send_analysis_summary(
        self,
        token: str,
        signals: list[dict],
        final_decision: dict,
        market_data: dict | None = None,
    ) -> bool:
        """Send a summary of full analysis"""
        bullish = sum(1 for s in signals if s.get("action") == "bullish")
        bearish = sum(1 for s in signals if s.get("action") == "bearish")
        neutral = len(signals) - bullish - bearish

        decision = final_decision.get("action", "unknown")
        color = {
            "buy": 0x22C55E,
            "sell": 0xEF4444,
            "avoid": 0xEF4444,
            "hold": 0xEAB308,
        }.get(decision.lower(), 0x6B7280)

        # Build signal summary
        signal_lines = []
        for signal in signals[:5]:
            emoji = {"bullish": "🟢", "bearish": "🔴", "neutral": "🟡"}.get(
                signal.get("action", ""), "⚪"
            )
            signal_lines.append(
                f"{emoji} **{signal.get('agent')}**: {signal.get('action')} ({signal.get('confidence')}%)"
            )

        embed = {
            "title": f"📊 {token} Analysis Complete",
            "color": color,
            "fields": [
                {
                    "name": "Consensus",
                    "value": f"🟢 {bullish} | 🟡 {neutral} | 🔴 {bearish}",
                    "inline": True,
                },
                {
                    "name": "Final Decision",
                    "value": decision.upper(),
                    "inline": True,
                },
                {
                    "name": "Conviction",
                    "value": final_decision.get("conviction", "N/A").title(),
                    "inline": True,
                },
                {
                    "name": "Agent Signals",
                    "value": "\n".join(signal_lines) or "No signals",
                    "inline": False,
                },
            ],
            "footer": {
                "text": f"{len(signals)} agents analyzed | gICM AI Hedge Fund"
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        if market_data and market_data.get("price"):
            embed["fields"].insert(0, {
                "name": "Price",
                "value": f"${market_data['price']:.6f}",
                "inline": True,
            })

        return await self.send_embed(embed)
