"""
Base Agent - Foundation for all trading agents
"""

from abc import ABC, abstractmethod
from typing import Any, Literal
import json
import re

from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel


class AgentSignal(BaseModel):
    """Trading signal from an agent"""

    action: Literal["bullish", "bearish", "neutral"]
    confidence: float = Field(ge=0, le=100, description="Confidence 0-100")
    reasoning: str = Field(description="Explanation for the signal")
    token: str = Field(description="Token symbol analyzed")
    agent_name: str = Field(description="Name of the agent")
    data_used: list[str] = Field(default_factory=list)

    # Optional detailed analysis
    key_metrics: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)


class AgentConfig(BaseModel):
    """Configuration for an agent"""

    name: str
    description: str
    philosophy: str
    risk_tolerance: Literal["low", "medium", "high", "degen"]
    time_horizon: Literal["short", "medium", "long"]
    focus_areas: list[str]


class BaseAgent(ABC):
    """Base class for all trading agents"""

    def __init__(self, llm: BaseChatModel, config: AgentConfig):
        self.llm = llm
        self.config = config
        self.name = config.name

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass

    @abstractmethod
    async def analyze(
        self,
        token: str,
        market_data: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> AgentSignal:
        """Analyze a token and return a trading signal"""
        pass

    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Call the LLM with prompts"""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await self.llm.ainvoke(messages)
        return str(response.content)

    def _parse_signal(self, response: str, token: str) -> AgentSignal:
        """Parse LLM response into AgentSignal"""
        # Try to extract JSON from response
        json_match = re.search(r"\{[\s\S]*\}", response)

        if json_match:
            try:
                data = json.loads(json_match.group())
                return AgentSignal(
                    action=data.get("action", "neutral"),
                    confidence=float(data.get("confidence", 50)),
                    reasoning=data.get("reasoning", response[:500]),
                    token=token,
                    agent_name=self.name,
                    data_used=data.get("data_used", []),
                    key_metrics=data.get("key_metrics", []),
                    risks=data.get("risks", []),
                )
            except (json.JSONDecodeError, ValueError):
                pass

        # Fallback: parse from text
        action: Literal["bullish", "bearish", "neutral"] = "neutral"
        if "bullish" in response.lower():
            action = "bullish"
        elif "bearish" in response.lower():
            action = "bearish"

        return AgentSignal(
            action=action,
            confidence=50,
            reasoning=response[:500],
            token=token,
            agent_name=self.name,
        )

    def _format_market_data(self, market_data: dict[str, Any]) -> str:
        """Format market data for prompts"""
        lines = []
        for key, value in market_data.items():
            if value is not None and value != "N/A":
                formatted_key = key.replace("_", " ").title()
                if isinstance(value, float):
                    if "percent" in key or "change" in key:
                        lines.append(f"- {formatted_key}: {value:.2f}%")
                    elif value < 1:
                        lines.append(f"- {formatted_key}: ${value:.6f}")
                    else:
                        lines.append(f"- {formatted_key}: ${value:,.2f}")
                else:
                    lines.append(f"- {formatted_key}: {value}")
        return "\n".join(lines)
