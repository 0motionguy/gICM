# Whale Watcher Agent

Smart money tracker and accumulation signal detector.

## Philosophy

Follow the money. Track wallets with proven track records and identify when smart money is accumulating or distributing.

## Key Signals

### Accumulation Patterns
- Multiple buys across different wallets in short timeframe
- Increasing position sizes from known profitable wallets
- Buys during low volume periods (stealth accumulation)
- DEX buys when CEX prices are higher (informed buyers)

### Distribution Patterns
- Whale wallets moving to exchanges
- Large sells into buy walls
- Wallet fragmentation (splitting before selling)
- Decreasing holder count despite stable price

## Watched Wallets

The agent tracks wallets with:
- >$1M portfolio value
- >70% win rate on token trades
- >3 months of on-chain history
- Multiple profitable meme trades

## Analysis Output

```
TOKEN: BONK
Whale Activity: BULLISH

Recent Moves:
- Wallet 0x...abc: Bought $250k (3 txs over 2 hours)
- Wallet 0x...def: Added $180k to existing position
- Known profitable wallet: +$430k total inflow

Smart Money Score: 78/100
Recommendation: ACCUMULATE
```

## Data Sources

- Helius API for transaction history
- Birdeye for holder analysis
- DexScreener for trade monitoring
- Custom wallet tracking database

## Usage

```python
from src.agents.crypto import WhaleWatcherAgent

agent = WhaleWatcherAgent()
analysis = await agent.analyze("BONK")
print(f"Smart Money Score: {analysis['smart_money_score']}")
```
