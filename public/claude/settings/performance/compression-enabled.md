# Compression Enabled

Enable response compression for large outputs. Reduces bandwidth and improves transfer speed.

## Overview

Enables gzip compression for API responses. Significantly reduces bandwidth usage for large responses, especially beneficial for reading large files or receiving extensive code generation.

## Configuration

**Category:** Performance
**Type:** Boolean
**Default:** true
**Recommended:** true for all environments

## Usage

```bash
# Enable compression (default)
npx @gicm/cli settings add performance/compression-enabled --value true

# Disable compression
npx @gicm/cli settings add performance/compression-enabled --value false
```

## Performance Impact

**Bandwidth Savings:**
- Code files: 70-80% reduction
- JSON responses: 60-70% reduction
- Text content: 50-60% reduction
- Binary data: 10-20% reduction (already compressed)

**Speed Impact:**
- Fast connections (>50 Mbps): Minimal improvement
- Medium connections (10-50 Mbps): 30-50% faster
- Slow connections (<10 Mbps): 50-70% faster

**CPU Impact:**
- Compression overhead: ~5-10ms per response
- Decompression overhead: ~2-5ms per response
- Net benefit: Positive for responses >10KB

## When to Disable

**Disable compression when:**
- Local development with fast filesystem
- Debugging response content
- Client doesn't support gzip
- Responses are already compressed (images, videos)

## Related Settings

- `response-streaming` - May conflict with compression
- `network-timeout` - Affects compressed transfer time

## Examples

### Production Configuration
```json
{
  "compression-enabled": true,
  "response-streaming": false
}
```

### Development Configuration
```json
{
  "compression-enabled": true,
  "response-streaming": true
}
```

### Debug Configuration
```json
{
  "compression-enabled": false,
  "response-streaming": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
