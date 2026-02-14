# Token Pricing Reference

## How Costs Are Calculated

```
cost = (inputTokens / 1M * inputRate) + (outputTokens / 1M * outputRate)
     - (cacheReadTokens / 1M * cacheReadRate)  // 90% discount
     + (cacheWriteTokens / 1M * cacheWriteRate) // 25% surcharge
```

## Model Pricing (per 1M tokens, USD)

| Model             | Input  | Output | Cache Read | Cache Write |
| ----------------- | ------ | ------ | ---------- | ----------- |
| claude-opus-4.6   | $15.00 | $75.00 | $1.50      | $18.75      |
| claude-sonnet-4.5 | $3.00  | $15.00 | $0.30      | $3.75       |
| claude-haiku-4.5  | $0.80  | $4.00  | $0.08      | $1.00       |
| gpt-4o            | $2.50  | $10.00 | —          | —           |
| gpt-4o-mini       | $0.15  | $0.60  | —          | —           |
| gemini-2.0-flash  | $0.00  | $0.00  | —          | —           |
| deepseek-chat     | $0.14  | $0.28  | —          | —           |
| deepseek-reasoner | $0.55  | $2.19  | —          | —           |
| grok-2            | $2.00  | $10.00 | —          | —           |

## Budget Examples

| Usage Pattern               | Daily Cost (no gICM) | Daily Cost (with gICM) |
| --------------------------- | -------------------- | ---------------------- |
| 50 casual messages          | $5-15                | $0.50-1.50             |
| Heavy coding session        | $15-40               | $2-5                   |
| 24/7 agent with heartbeats  | $30-100              | $3-10                  |
| Trading bot (200 calls/day) | $20-60               | $2-6                   |
