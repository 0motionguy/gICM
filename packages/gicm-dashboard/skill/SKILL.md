---
name: gicm-dashboard
description: >
  React component library for AI agent dashboards. Formatters (price, number,
  duration, percent, tokens, bytes), StatusCard, MetricsPanel, EventFeed,
  CostChart, HealthGrid. Dark/light theme support.
user-invocable: true
metadata:
  openclaw:
    emoji: "📊"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/dashboard"
        label: "Install gICM Dashboard"
---

# @gicm/dashboard

Dashboard components: formatters (price/number/duration/percent), StatusCard, MetricsPanel, EventFeed, CostChart, HealthGrid. All with dark/light theme support.

## Quick Start

```typescript
import {
  formatPrice,
  formatLargeNumber,
  renderMetricsPanel,
} from "@gicm/dashboard";
formatPrice(0.000001); // "$0.000001"
formatLargeNumber(1_500_000); // "1.5M"
```
