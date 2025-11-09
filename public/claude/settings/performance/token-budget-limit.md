# Token Budget Limit

Maximum tokens per request. Recommended: 200000 for complex tasks, 100000 for standard operations.

## Overview

Sets the maximum number of tokens that can be used in a single request. Helps control costs and prevents runaway token usage. Lower limits force more efficient prompting.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 200000
**Range:** 10000-200000

## Usage

```bash
# Install with default value (200k)
npx @gicm/cli settings add performance/token-budget-limit

# Install with custom value (100k)
npx @gicm/cli settings add performance/token-budget-limit --value 100000
```

## Recommendations

| Use Case | Recommended Value | Rationale |
|----------|-------------------|-----------|
| Complex Multi-File Tasks | 200000 | Maximum context for large operations |
| Standard Development | 100000 | Balance between capability and cost |
| Simple Tasks | 50000 | Encourage efficient prompting |
| CI/CD Automation | 75000 | Controlled costs for automated runs |

## Cost Impact

**Claude Sonnet 4.5 Pricing (example):**
- 200k tokens: ~$1.50 per request (input + output)
- 100k tokens: ~$0.75 per request
- 50k tokens: ~$0.38 per request

## What Happens When Limit Reached

1. Claude warns about approaching limit
2. Switches to more efficient strategies (progressive disclosure)
3. May require breaking task into smaller chunks
4. Graceful error if limit must be exceeded

## Budget Optimization Strategies

**Automatic:**
- Progressive disclosure for skills (88-92% token savings)
- Lazy loading of agent prompts
- Compressed responses
- Targeted file reads (offset/limit)

**Manual:**
- Break large tasks into smaller steps
- Use specific file paths instead of glob searches
- Limit grep output with head_limit

## Related Settings

- `lazy-skill-loading` - Reduce skill token usage
- `agent-cache-strategy` - Cache agent prompts
- `compression-enabled` - Compress responses
- `context-window-size` - Maximum context size

## Examples

### Cost-Optimized Configuration
```json
{
  "token-budget-limit": 75000,
  "lazy-skill-loading": true,
  "agent-cache-strategy": "session",
  "compression-enabled": true
}
```

### Maximum Capability Configuration
```json
{
  "token-budget-limit": 200000,
  "lazy-skill-loading": false,
  "context-window-size": 200000
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
