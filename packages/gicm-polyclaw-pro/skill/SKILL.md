---
name: gicm-polyclaw-pro
description: >
  7-strategy prediction market trading engine for Polymarket and Kalshi.
  Momentum, contrarian, arbitrage, volume-spike, mean-reversion, event-catalyst,
  whale-following. Includes risk manager, position tracker, and signal engine.
user-invocable: true
metadata:
  openclaw:
    emoji: "🎯"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/polyclaw-pro"
        label: "Install Polyclaw Pro"
---

# @gicm/polyclaw-pro

7-strategy prediction market engine: momentum, contrarian, arbitrage, volume-spike, mean-reversion, event-catalyst, whale-following. Scans Polymarket + Kalshi markets, generates signals, manages positions with risk controls.

## Quick Start

```typescript
import { PolyclawPro } from "@gicm/polyclaw-pro";

const polyclaw = new PolyclawPro({
  platforms: ["polymarket"],
  risk: { maxPositionSize: 100, dailyLossLimit: 50 },
});

// Scan markets and get signals
const signals = await polyclaw.scan();
for (const agg of signals) {
  if (agg.consensus === "buy" && agg.avgConfidence > 0.7) {
    const decision = polyclaw.execute(agg.signals[0], 50);
    // decision.position has stop-loss and take-profit set automatically
  }
}

// Check performance
const perf = polyclaw.getPerformance();
// perf.winRate, perf.sharpeRatio, perf.byStrategy
```

## 7 Strategies

| #   | Strategy        | Signal         | When                              |
| --- | --------------- | -------------- | --------------------------------- |
| 1   | Momentum        | Follow trend   | Price rising/falling consistently |
| 2   | Contrarian      | Fade extremes  | Price below 15% or above 85%      |
| 3   | Arbitrage       | Cross-platform | Polymarket vs Kalshi spread > 3%  |
| 4   | Volume Spike    | Follow volume  | 24h volume 3x+ above average      |
| 5   | Mean Reversion  | Revert to mean | Price deviates >15% from average  |
| 6   | Event Catalyst  | Pre-resolution | <3 days to event, price leaning   |
| 7   | Whale Following | Copy whales    | Large volume + price movement     |

## Risk Controls

- Max position: $100 (configurable)
- Max exposure: $500 total
- Stop-loss: 15% automatic
- Take-profit: 50% automatic
- Daily loss limit: $50
- Max drawdown: 20%

## License

MIT
