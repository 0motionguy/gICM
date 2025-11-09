# Subgraph Endpoint

The Graph subgraph endpoint preference. Options: hosted, studio, decentralized.

## Overview

Selects which The Graph network to use. 'hosted' uses legacy hosted service (being deprecated), 'studio' uses Subgraph Studio, 'decentralized' uses the decentralized network (recommended for production).

## Configuration

**Category:** Integration
**Type:** String (enum)
**Default:** studio
**Options:** hosted, studio, decentralized

## Usage

```bash
# Subgraph Studio (default)
npx @gicm/cli settings add integration/subgraph-endpoint --value studio

# Decentralized Network
npx @gicm/cli settings add integration/subgraph-endpoint --value decentralized

# Hosted Service (deprecated)
npx @gicm/cli settings add integration/subgraph-endpoint --value hosted
```

## Endpoint Types

### Hosted Service (Deprecated)
- **Status:** Being sunset in 2024
- **Cost:** Free
- **Reliability:** Decreasing
- **Use case:** Legacy projects only

### Subgraph Studio
- **Status:** Current recommended
- **Cost:** Free for development
- **Reliability:** High
- **Use case:** Development and testing

### Decentralized Network
- **Status:** Production-ready
- **Cost:** Pay per query (GRT tokens)
- **Reliability:** Highest (decentralized)
- **Use case:** Production applications

## Environment Variables

**Required per endpoint:**

**Studio:**
```bash
GRAPH_API_KEY=your_studio_key
SUBGRAPH_URL=https://api.studio.thegraph.com/query/<id>/<name>/<version>
```

**Decentralized:**
```bash
GRAPH_API_KEY=your_api_key
GRT_BILLING_ADDRESS=0x...
```

## Affected Components

- `thegraph-mcp` - The Graph integration
- `graph-protocol-indexer` - Subgraph development

## Migration Path

**From Hosted to Studio:**
```
1. Create subgraph in Subgraph Studio
2. Deploy to Studio
3. Update endpoint configuration
4. Test queries
5. Switch production traffic
```

**From Studio to Decentralized:**
```
1. Publish subgraph to decentralized network
2. Allocate GRT for billing
3. Update endpoint configuration
4. Monitor query costs
```

## Cost Considerations

**Decentralized Network Pricing:**
- ~$0.00001 - $0.0001 per query
- Depends on indexer pricing
- Set query budget:

```json
{
  "subgraph-endpoint": "decentralized",
  "graph-query-budget": {
    "max-per-query": 0.001,
    "max-per-day": 1.0
  }
}
```

## Query Performance

**Average response times:**
- Hosted Service: 200-500ms
- Subgraph Studio: 100-300ms
- Decentralized: 150-400ms

## Related Settings

- `network-timeout` - Query timeout
- `mcp-retry-attempts` - Retry failed queries
- `rate-limit-per-hour` - Limit query rate

## Examples

### Development Configuration
```json
{
  "subgraph-endpoint": "studio",
  "network-timeout": 30000
}
```

### Production Configuration
```json
{
  "subgraph-endpoint": "decentralized",
  "graph-query-budget": {
    "max-per-day": 10.0
  },
  "network-timeout": 30000,
  "mcp-retry-attempts": 3
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
