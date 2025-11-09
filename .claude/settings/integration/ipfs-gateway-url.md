# IPFS Gateway URL

IPFS gateway preference. Options: ipfs.io, cloudflare-ipfs.com, dweb.link, custom.

## Overview

Sets the IPFS gateway for retrieving NFT metadata and assets. Cloudflare gateway offers better performance and reliability. Can specify custom gateway URL.

## Configuration

**Category:** Integration
**Type:** String
**Default:** cloudflare-ipfs.com

## Usage

```bash
# Cloudflare gateway (default - fastest)
npx @gicm/cli settings add integration/ipfs-gateway-url --value cloudflare-ipfs.com

# IPFS.io gateway
npx @gicm/cli settings add integration/ipfs-gateway-url --value ipfs.io

# Dweb.link gateway
npx @gicm/cli settings add integration/ipfs-gateway-url --value dweb.link

# Custom gateway
npx @gicm/cli settings add integration/ipfs-gateway-url --value gateway.pinata.cloud
```

## Gateway Comparison

| Gateway | Speed | Reliability | CDN | Rate Limits |
|---------|-------|-------------|-----|-------------|
| cloudflare-ipfs.com | Fast | High | Yes | Generous |
| ipfs.io | Medium | Medium | No | Moderate |
| dweb.link | Medium | High | Yes | Generous |
| gateway.pinata.cloud | Fast | High | Yes | Requires API key |

## URL Format

**IPFS URL transformation:**
```
IPFS URI: ipfs://QmX...abc/metadata.json
↓
Gateway URL: https://cloudflare-ipfs.com/ipfs/QmX...abc/metadata.json
```

## Performance

**Average response times:**
- Cloudflare: 100-300ms
- IPFS.io: 300-800ms
- Dweb.link: 150-400ms
- Pinata: 100-250ms

## Caching

**Gateway caching behavior:**
```json
{
  "ipfs-gateway-url": "cloudflare-ipfs.com",
  "ipfs-cache": {
    "enabled": true,
    "ttl": 86400,
    "max-size-mb": 100
  }
}
```

## Fallback Configuration

**Multiple gateways with failover:**
```json
{
  "ipfs-gateway-url": "cloudflare-ipfs.com",
  "ipfs-gateway-fallback": [
    "dweb.link",
    "ipfs.io"
  ],
  "failover-timeout": 5000
}
```

## Custom Gateway with Authentication

**Pinata gateway with API key:**
```json
{
  "ipfs-gateway-url": "gateway.pinata.cloud",
  "ipfs-gateway-auth": {
    "type": "bearer",
    "token": "${PINATA_JWT}"
  }
}
```

## Use Cases

**NFT Metadata Fetching:**
```typescript
const metadataUri = "ipfs://QmX.../metadata.json";
const gateway = getIPFSGateway(); // Uses setting
const url = metadataUri.replace("ipfs://", `https://${gateway}/ipfs/`);
const metadata = await fetch(url).then(r => r.json());
```

## Related Settings

- `network-timeout` - IPFS request timeout
- `mcp-retry-attempts` - Retry failed IPFS requests

## Examples

### Maximum Performance
```json
{
  "ipfs-gateway-url": "cloudflare-ipfs.com",
  "ipfs-cache": {
    "enabled": true,
    "ttl": 86400
  },
  "network-timeout": 30000
}
```

### High Reliability
```json
{
  "ipfs-gateway-url": "cloudflare-ipfs.com",
  "ipfs-gateway-fallback": [
    "dweb.link",
    "gateway.pinata.cloud",
    "ipfs.io"
  ],
  "failover-timeout": 3000
}
```

### Custom Pinata Gateway
```json
{
  "ipfs-gateway-url": "gateway.pinata.cloud",
  "ipfs-gateway-auth": {
    "type": "bearer",
    "token": "${PINATA_JWT}"
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
