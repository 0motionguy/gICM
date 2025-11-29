"""
FastAPI Application for AI Hedge Fund
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router
from ..config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("AI Hedge Fund API starting up...")
    yield
    # Shutdown
    print("AI Hedge Fund API shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    settings = get_settings()

    app = FastAPI(
        title="AI Hedge Fund",
        description="""
Multi-agent AI trading analysis powered by famous investor personas.

## Features

- **12 AI Agents**: Warren Buffett, Michael Burry, Degen Trader, and more
- **Multiple Analysis Modes**: Full, Fast, and Degen modes
- **Real-time Market Data**: CoinGecko, DexScreener, Jupiter integration
- **Portfolio Management**: Risk assessment and position sizing

## Agents

### Persona Agents
- Warren Buffett: Long-term value investing
- Michael Burry: Contrarian, bubble detection
- Charlie Munger: Mental models, quality focus
- Cathie Wood: Disruptive innovation
- Bill Ackman: Activist investing

### Crypto-Native Agents
- Degen Trader: High risk/reward plays
- Pump Trader: Memecoin specialist (Cupsy-style)
- Solana Specialist: SOL ecosystem expert
- Whale Watcher: Smart money tracking
- On-Chain Analyst: Blockchain data analysis

### Management Agents
- Risk Manager: Position sizing, stops
- Portfolio Manager: Final decision synthesis
        """,
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routes
    app.include_router(router)

    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "src.api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
