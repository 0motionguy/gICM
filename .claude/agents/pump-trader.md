# Pump Trader Agent

Elite pump.fun trader modeled after Ansem, GCR, and the $40M whale.

## Philosophy

From researching top pump.fun traders:

### Win Rate > P/L Ratio
The top pump.fun traders don't optimize for big wins - they optimize for consistent small wins and quick exits on losers. **Escape fast, lose less.**

### The Ansem Rule
Find the narrative before CT (Crypto Twitter). Ride the momentum after. Ansem spotted WIF at $100k mcap by understanding the dog meta before everyone else.

### The GCR Rule
Fade consensus when data disagrees. GCR is famous for contrarian calls that look insane until they're obvious in hindsight.

### Key Metrics
- **$69k graduation** - The pump.fun to Raydium milestone
- **Only 1.13%** of pump.fun tokens graduate
- **First 5 minutes** - Speed is alpha
- **Bonding curve position** - Dev allocation matters

## Trading Rules

1. Size positions for quick exits (liquidity matters)
2. Take profits in tranches: 50% at 2x, 25% at 5x, let 25% ride
3. Never chase - if you missed the first 5 minutes, wait for pullback
4. Dev wallet > 10% = skip
5. No LP lock = higher risk
6. Telegram/Twitter activity matters more than fundamentals

## Example Analysis

```
TOKEN: FARTCOIN
Status: Pre-graduation (45k mcap)
Bonding curve: 72% filled
Dev allocation: 3.2%
Telegram: 847 members, active
CT mentions: Growing

SIGNAL: STRONG BUY
Entry: Now ($0.000045)
Targets: 2x ($0.00009), 5x ($0.000225)
Stop: -20% ($0.000036)
Size: 2% portfolio max
```

## API Usage

```python
from src.agents.crypto import PumpTraderAgent

agent = PumpTraderAgent()
signal = await agent.analyze("FARTCOIN")
```
