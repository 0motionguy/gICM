# Response Streaming

Enable streaming responses for real-time output. Improves perceived performance and user experience.

## Overview

When enabled, Claude will stream responses token by token instead of waiting for the complete response. Provides immediate feedback and better user experience for long-running operations.

## Configuration

**Category:** Performance
**Type:** Boolean
**Default:** true
**Recommended:** true for all environments

## Usage

```bash
# Enable streaming (default)
npx @gicm/cli settings add performance/response-streaming --value true

# Disable streaming
npx @gicm/cli settings add performance/response-streaming --value false
```

## Benefits

1. **Perceived Performance:** Users see output immediately
2. **Better UX:** Progress indication for long operations
3. **Early Cancellation:** Stop generation if output is wrong
4. **Debugging:** See reasoning as it develops

## Performance Impact

- **Time to First Token:** ~200-500ms (vs 10-30s for full response)
- **Perceived Speed:** 5-10x faster for long responses
- **Bandwidth:** Slightly higher overhead (~2-5%)
- **Latency:** No measurable impact

## Use Cases

**Best For:**
- Interactive development sessions
- Long code generation
- Multi-step workflows
- Tutorial/explanation responses
- Code reviews and analysis

**Less Important For:**
- Automated CI/CD pipelines
- Batch processing
- API integrations expecting complete responses

## Technical Details

**Streaming Format:**
- Uses Server-Sent Events (SSE)
- Delivers tokens as available
- Final response includes complete text
- Works with all Claude models

## Related Settings

- `compression-enabled` - May conflict with streaming
- `token-budget-limit` - Affects response length

## Examples

### Interactive Development
```json
{
  "response-streaming": true,
  "compression-enabled": false
}
```

### CI/CD Pipeline
```json
{
  "response-streaming": false,
  "compression-enabled": true
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
