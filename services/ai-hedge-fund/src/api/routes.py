"""
FastAPI Routes for AI Hedge Fund
"""

from typing import Literal, Any
from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse

from ..workflow import create_trading_graph, analyze_token
from ..data import get_market_data

router = APIRouter(prefix="/api/v1", tags=["trading"])


# Request/Response Models

class AnalyzeRequest(BaseModel):
    """Request to analyze a token"""
    token: str = Field(..., description="Token symbol or address")
    chain: str = Field(default="solana", description="Blockchain")
    mode: Literal["full", "fast", "degen"] = Field(
        default="full",
        description="Analysis mode: full (all agents), fast (quick), degen (memecoin focus)"
    )
    provider: Literal["anthropic", "openai"] = Field(
        default="anthropic",
        description="LLM provider"
    )
    context: dict[str, Any] | None = Field(
        default=None,
        description="Additional context for agents"
    )


class QuickSignalRequest(BaseModel):
    """Request for quick signal"""
    token: str
    chain: str = "solana"


class AgentSignalResponse(BaseModel):
    """Agent signal in response"""
    agent: str
    action: str
    confidence: float
    reasoning: str
    key_metrics: list[str] = []
    risks: list[str] = []


class AnalyzeResponse(BaseModel):
    """Full analysis response"""
    token: str
    chain: str
    market_data: dict[str, Any]
    agent_signals: list[AgentSignalResponse]
    risk_assessment: AgentSignalResponse | None
    final_decision: dict[str, Any]
    summary: str


class QuickSignalResponse(BaseModel):
    """Quick signal response"""
    token: str
    price: float | None
    change_24h: float | None
    sentiment: str
    confidence: float
    signals: list[AgentSignalResponse]
    quick_take: str


class MarketDataResponse(BaseModel):
    """Market data response"""
    token: str
    chain: str
    data: dict[str, Any]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    agents_available: int


# Routes

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        agents_available=12,  # 5 personas + 5 crypto + 2 management
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Run full multi-agent analysis on a token.

    This runs all configured agents in parallel and synthesizes
    their signals into a final trading decision.
    """
    try:
        graph = create_trading_graph(
            provider=request.provider,
            mode=request.mode,
            show_reasoning=False,
        )

        result = await graph.analyze(
            token=request.token,
            chain=request.chain,
            context=request.context,
        )

        if result.get("error"):
            raise HTTPException(status_code=400, detail=result["error"])

        return AnalyzeResponse(
            token=result["token"],
            chain=result["chain"],
            market_data=result["market_data"],
            agent_signals=[
                AgentSignalResponse(**signal)
                for signal in result["agent_signals"]
            ],
            risk_assessment=AgentSignalResponse(**result["risk_assessment"])
            if result.get("risk_assessment") else None,
            final_decision=result["final_decision"],
            summary=result["summary"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-signal", response_model=QuickSignalResponse)
async def quick_signal(request: QuickSignalRequest):
    """
    Get a quick trading signal with minimal analysis.

    Uses 3 key agents for fast screening.
    Good for quick checks before deeper analysis.
    """
    try:
        graph = create_trading_graph(mode="fast", show_reasoning=False)
        result = await graph.quick_signal(
            token=request.token,
            chain=request.chain,
        )

        if result.get("error"):
            raise HTTPException(status_code=400, detail=result["error"])

        return QuickSignalResponse(
            token=result["token"],
            price=result.get("price"),
            change_24h=result.get("change_24h"),
            sentiment=result["sentiment"],
            confidence=result["confidence"],
            signals=[
                AgentSignalResponse(**signal)
                for signal in result["signals"]
            ],
            quick_take=result["quick_take"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market-data/{token}", response_model=MarketDataResponse)
async def get_token_market_data(token: str, chain: str = "solana"):
    """
    Get raw market data for a token.

    Fetches from CoinGecko, DexScreener, and Jupiter (for Solana).
    """
    try:
        data = await get_market_data(token, chain)

        if not data.get("price"):
            raise HTTPException(
                status_code=404,
                detail=f"No market data found for {token}"
            )

        return MarketDataResponse(
            token=token,
            chain=chain,
            data=data,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents")
async def list_agents():
    """List all available agents and their configurations"""
    from ..agents import (
        BUFFETT_CONFIG, BURRY_CONFIG, MUNGER_CONFIG,
        WOOD_CONFIG, ACKMAN_CONFIG, DEGEN_CONFIG,
        SOLANA_CONFIG, WHALE_CONFIG, PUMP_TRADER_CONFIG,
        ONCHAIN_CONFIG, RISK_MANAGER_CONFIG, PORTFOLIO_MANAGER_CONFIG,
    )

    configs = [
        BUFFETT_CONFIG, BURRY_CONFIG, MUNGER_CONFIG,
        WOOD_CONFIG, ACKMAN_CONFIG, DEGEN_CONFIG,
        SOLANA_CONFIG, WHALE_CONFIG, PUMP_TRADER_CONFIG,
        ONCHAIN_CONFIG, RISK_MANAGER_CONFIG, PORTFOLIO_MANAGER_CONFIG,
    ]

    return {
        "agents": [
            {
                "name": c.name,
                "description": c.description,
                "risk_tolerance": c.risk_tolerance,
                "time_horizon": c.time_horizon,
                "focus_areas": c.focus_areas,
            }
            for c in configs
        ]
    }


@router.post("/analyze/batch")
async def analyze_batch(tokens: list[str], chain: str = "solana"):
    """
    Analyze multiple tokens in parallel.

    Uses quick_signal for efficiency on multiple tokens.
    """
    try:
        graph = create_trading_graph(mode="fast", show_reasoning=False)

        results = []
        for token in tokens[:10]:  # Limit to 10 tokens
            try:
                result = await graph.quick_signal(token, chain)
                results.append(result)
            except Exception as e:
                results.append({"token": token, "error": str(e)})

        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
