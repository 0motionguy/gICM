# AI Hedge Fund Agent

Multi-agent AI trading system with 12 specialized agents modeled after famous investors and crypto-native traders.

## Overview

The AI Hedge Fund orchestrates multiple LLM agents to analyze crypto tokens from diverse perspectives, synthesizing their views into actionable trading signals.

## Agent Roster

### Traditional Finance Personas
1. **Warren Buffett** - Value investing, moats, long-term compounding
2. **Michael Burry** - Contrarian analysis, bubble detection
3. **Charlie Munger** - Mental models, quality focus, circle of competence
4. **Cathie Wood** - Disruptive innovation, ARK-style growth
5. **Bill Ackman** - Activist investing, catalyst identification

### Crypto-Native Personas
6. **Degen Agent** - CT alpha, memecoin momentum, ape-or-die
7. **Solana Specialist** - SOL ecosystem, Jupiter, Raydium expertise
8. **Whale Watcher** - Smart money tracking, accumulation signals
9. **Pump Trader** - pump.fun mechanics, graduation plays (inspired by Ansem, GCR, $40M whale)
10. **On-Chain Analyst** - Blockchain data, holder distribution, activity metrics

### Management
11. **Risk Manager** - Position sizing, stop losses, exposure limits
12. **Portfolio Manager** - Final synthesis, execution plan, confidence scoring

## Key Insights

From researching top pump.fun traders:
- **Win rate > P/L ratio** - Escape fast, lose less
- **Ansem rule**: Find narrative before CT, ride momentum after
- **GCR rule**: Fade consensus when data disagrees
- **$69k graduation milestone** = key inflection point
- Only 1.13% of pump.fun tokens graduate to Raydium

## API Endpoints

- `POST /analyze` - Full 12-agent analysis
- `POST /quick-signal` - Fast single-agent signal
- `GET /market-data/{token}` - Market data fetch
- `GET /health` - Health check

## Usage

```bash
# Quick signal
curl -X POST http://localhost:8001/quick-signal \
  -H "Content-Type: application/json" \
  -d '{"token": "BONK", "mode": "quick"}'

# Full analysis
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"token": "SOL"}'
```

## Configuration

Required environment variables:
- `ANTHROPIC_API_KEY` - Required for LLM agents
- `BIRDEYE_API_KEY` - Optional, for premium market data
- `HELIUS_API_KEY` - Optional, for on-chain data
- `TELEGRAM_BOT_TOKEN` - Optional, for alerts
- `DISCORD_WEBHOOK_URL` - Optional, for alerts

## Model Recommendation

- **opus** for full analysis (better reasoning)
- **sonnet** for quick signals (faster, cheaper)
