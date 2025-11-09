# Cost Tracking

Track API usage costs in real-time. Shows estimated costs for Claude API, RPC calls, and external services.

## Overview

Enables real-time cost tracking for all API usage including Claude API calls, blockchain RPC requests, and external service integrations. Provides cost estimates and budget alerts.

## Configuration

**Category:** Monitoring
**Type:** Boolean
**Default:** false
**Recommended:** true for all environments

## Usage

```bash
# Enable cost tracking
npx @gicm/cli settings add monitoring/cost-tracking --value true

# Disable cost tracking (default)
npx @gicm/cli settings add monitoring/cost-tracking --value false
```

## Cost Breakdown

**Tracks costs for:**
- Claude API calls (Sonnet, Opus, Haiku)
- RPC requests (Alchemy, Helius, Infura)
- Database operations (Supabase queries)
- External APIs (GitHub, The Graph, etc.)
- Storage (IPFS pinning, S3, etc.)

## Real-Time Display

**Console output:**
```
💰 Session Cost Summary

Claude API:
  ├─ Sonnet 4.5: $2.47 (150k input, 45k output)
  ├─ Opus 4: $0.85 (20k input, 8k output)
  └─ Total: $3.32

RPC Calls:
  ├─ Helius (Solana): $0.12 (450 requests)
  ├─ Alchemy (ETH): $0.08 (200 requests)
  └─ Total: $0.20

External Services:
  ├─ GitHub API: $0.00 (free tier)
  ├─ The Graph: $0.05 (5k queries)
  └─ Total: $0.05

━━━━━━━━━━━━━━━━━━━━━━━━
Session Total: $3.57
Daily Total: $12.43
Monthly Estimate: $373
```

## Budget Alerts

**Configure budget limits:**
```json
{
  "cost-tracking": true,
  "budgets": {
    "daily-limit": 50.00,
    "monthly-limit": 1000.00,
    "session-limit": 10.00
  }
}
```

**Alert when approaching limit:**
```
⚠️  Budget Alert

Daily spending: $42.30 / $50.00 (85%)
Estimated end-of-day: $48.50

Monthly spending: $847.20 / $1000.00 (85%)
Estimated end-of-month: $986.00

Consider:
- Reducing token usage
- Optimizing batch sizes
- Enabling caching
```

## Cost Optimization Suggestions

**Automatic suggestions:**
```
💡 Cost Optimization Opportunities

1. Enable lazy skill loading
   Potential savings: ~40% on Claude API costs
   Current: $3.32/day → Estimated: $2.00/day

2. Increase cache TTL for skills
   Potential savings: ~20% on repeated operations
   Current: 0s → Suggested: 3600s

3. Batch RPC requests
   Potential savings: ~15% on RPC costs
   Current: 450 individual calls → Suggested: 45 batched calls

Apply all suggestions? [Y/n]
```

## Cost Reports

**Generate cost reports:**
```bash
# Daily report
npx @gicm/cli costs report --period daily

# Monthly report with breakdown
npx @gicm/cli costs report --period monthly --detailed

# Export to CSV
npx @gicm/cli costs export --format csv --output costs.csv
```

**Report format:**
```
┌─────────────────┬──────────┬────────────┬─────────┐
│ Service         │ Requests │ Cost       │ % Total │
├─────────────────┼──────────┼────────────┼─────────┤
│ Claude Sonnet   │ 245      │ $42.30     │ 67%     │
│ Claude Opus     │ 12       │ $8.50      │ 14%     │
│ Helius RPC      │ 1,250    │ $3.20      │ 5%      │
│ Alchemy RPC     │ 680      │ $2.40      │ 4%      │
│ The Graph       │ 15,000   │ $6.00      │ 10%     │
├─────────────────┼──────────┼────────────┼─────────┤
│ Total           │ 17,187   │ $62.40     │ 100%    │
└─────────────────┴──────────┴────────────┴─────────┘
```

## Cost Attribution

**Track costs by project/feature:**
```json
{
  "cost-tracking": true,
  "attribution": {
    "enabled": true,
    "tags": {
      "project": "icm-motion",
      "environment": "development",
      "team": "backend"
    }
  }
}
```

## Integration with Billing

**Export to accounting systems:**
```json
{
  "cost-tracking": true,
  "export": {
    "enabled": true,
    "format": "csv",
    "schedule": "daily",
    "destination": "s3://accounting/gicm-costs/"
  }
}
```

## Related Settings

- `rate-limit-per-hour` - Limit API usage
- `token-budget-limit` - Limit token usage
- `monitoring-dashboard` - Visualize costs

## Examples

### Cost-Conscious Configuration
```json
{
  "cost-tracking": true,
  "budgets": {
    "daily-limit": 20.00,
    "monthly-limit": 500.00
  },
  "auto-optimize": {
    "enabled": true,
    "apply-suggestions": true
  },
  "alerts": {
    "threshold-percent": 80,
    "webhook": "${SLACK_WEBHOOK_URL}"
  }
}
```

### Enterprise Configuration
```json
{
  "cost-tracking": true,
  "budgets": {
    "monthly-limit": 10000.00
  },
  "attribution": {
    "enabled": true,
    "tags": {
      "department": "engineering",
      "cost-center": "12345"
    }
  },
  "export": {
    "enabled": true,
    "format": "csv",
    "schedule": "daily"
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
