# Default RPC Provider

Default blockchain RPC provider. Options: alchemy, infura, quicknode, helius. Recommended: helius for Solana.

## Overview

Sets the default RPC provider for blockchain interactions. Different providers offer different performance, reliability, and pricing. Helius recommended for Solana, Alchemy/Infura for EVM chains.

## Configuration

**Category:** Integration
**Type:** String (enum)
**Default:** helius
**Options:** alchemy, infura, quicknode, helius, custom

## Usage

```bash
# Helius (Solana - default)
npx @gicm/cli settings add integration/default-rpc-provider --value helius

# Alchemy (EVM chains)
npx @gicm/cli settings add integration/default-rpc-provider --value alchemy

# Custom RPC endpoint
npx @gicm/cli settings add integration/default-rpc-provider --value custom
```

## Provider Recommendations

| Provider | Best For | Chains | Free Tier |
|----------|----------|--------|-----------|
| Helius | Solana | Solana | 100k requests/day |
| Alchemy | Ethereum, Polygon | EVM chains | 300M compute units/month |
| Infura | Ethereum | EVM chains | 100k requests/day |
| QuickNode | Multi-chain | All major chains | 3M API credits |

## Environment Variables

**Required env vars per provider:**

**Helius:**
```bash
HELIUS_API_KEY=your_key_here
SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=your_key_here
```

**Alchemy:**
```bash
ALCHEMY_API_KEY=your_key_here
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here
```

**Infura:**
```bash
INFURA_API_KEY=your_key_here
ETH_RPC_URL=https://mainnet.infura.io/v3/your_key_here
```

**Custom:**
```bash
RPC_ENDPOINT=https://your-custom-rpc.com
```

## Affected Components

- `icm-anchor-architect` - Solana program deployment
- `alchemy-mcp` - Alchemy API integration
- `infura-mcp` - Infura API integration
- `quicknode-mcp` - QuickNode API integration

## Multi-Chain Configuration

**Configure per chain:**
```json
{
  "default-rpc-provider": "helius",
  "rpc-providers": {
    "solana": "helius",
    "ethereum": "alchemy",
    "polygon": "alchemy",
    "arbitrum": "infura"
  }
}
```

## Failover Configuration

**Automatic failover:**
```json
{
  "default-rpc-provider": "helius",
  "rpc-failover": {
    "enabled": true,
    "providers": ["helius", "quicknode", "custom"],
    "retry-delay": 1000
  }
}
```

## Performance Comparison

**Average response times:**
- Helius (Solana): 50-100ms
- Alchemy (Ethereum): 100-200ms
- Infura (Ethereum): 150-250ms
- QuickNode: 100-180ms

## Related Settings

- `network-timeout` - RPC request timeout
- `mcp-timeout-duration` - MCP operation timeout
- `mcp-retry-attempts` - Retry failed RPC calls

## Examples

### ICM Motion (Solana Launch Platform)
```json
{
  "default-rpc-provider": "helius",
  "network-timeout": 30000,
  "mcp-retry-attempts": 3
}
```

### Multi-Chain DApp
```json
{
  "default-rpc-provider": "alchemy",
  "rpc-providers": {
    "ethereum": "alchemy",
    "polygon": "alchemy",
    "solana": "helius"
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
