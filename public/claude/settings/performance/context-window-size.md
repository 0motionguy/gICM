# Context Window Size

Maximum context window size in tokens. Recommended: 200000 for Opus/Sonnet.

## Overview

Controls the maximum size of the context window. Larger windows allow more context but use more tokens. Adjust based on your model and use case.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 200000
**Range:** 10000-200000

## Usage

```bash
# Install with default value (200k)
npx @gicm/cli settings add performance/context-window-size

# Install with custom value (100k)
npx @gicm/cli settings add performance/context-window-size --value 100000
```

## Model Limits

| Model | Maximum Context | Recommended |
|-------|-----------------|-------------|
| Claude Sonnet 4.5 | 200000 | 200000 |
| Claude Opus 4 | 200000 | 200000 |
| Claude Haiku 4 | 200000 | 100000 (cost optimization) |

## Context Budgeting

**Typical Token Usage:**
- System prompts: 2000-5000 tokens
- Agent prompts (cached): 500-2000 tokens each
- Skill prompts (lazy): 30-50 tokens each
- Code files: 100-5000 tokens per file
- Conversation history: 500-10000 tokens

## Related Settings

- `token-budget-limit` - Maximum tokens per request
- `lazy-skill-loading` - Reduce skill token usage
- `agent-cache-strategy` - Cache agent prompts

## Examples

### Maximum Context
```json
{
  "context-window-size": 200000,
  "token-budget-limit": 200000
}
```

### Cost-Optimized
```json
{
  "context-window-size": 100000,
  "token-budget-limit": 75000,
  "lazy-skill-loading": true
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
