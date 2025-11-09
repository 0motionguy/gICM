# Allowed Domains

Whitelist of domains for external API calls. Comma-separated list. Empty allows all domains.

## Overview

Restricts external API calls to specified domains only. Provides additional security by preventing calls to unexpected or malicious endpoints. Leave empty to allow all domains (default).

## Configuration

**Category:** Security
**Type:** Array (string list)
**Default:** [] (allow all)

## Usage

```bash
# Allow specific domains
npx @gicm/cli settings add security/allowed-domains --value "api.anthropic.com,supabase.io,alchemy.com"

# Allow all domains (default)
npx @gicm/cli settings add security/allowed-domains --value ""
```

## Common Whitelists

### Blockchain Development
```json
{
  "allowed-domains": [
    "api.anthropic.com",
    "solana-mainnet.rpc.extrnode.com",
    "api.helius.xyz",
    "api.alchemy.com",
    "rpc.ankr.com"
  ]
}
```

### Web3 + Database
```json
{
  "allowed-domains": [
    "api.anthropic.com",
    "supabase.io",
    "api.github.com",
    "api.alchemy.com",
    "thegraph.com"
  ]
}
```

### Minimal (Claude Only)
```json
{
  "allowed-domains": [
    "api.anthropic.com"
  ]
}
```

## Domain Matching Rules

**Exact match:**
```
"api.example.com" → Only api.example.com
```

**Subdomain wildcard:**
```
"*.example.com" → api.example.com, www.example.com, etc.
```

**Top-level domain:**
```
"example.com" → Includes all subdomains
```

## Blocked Request Behavior

When a request to non-whitelisted domain is attempted:

```
❌ Blocked API call to unauthorized domain: malicious-site.com
💡 Add to allowed-domains in .claude/settings.json or disable whitelist
```

## Security Trade-offs

**Whitelist Enabled:**
- **Pro:** Prevents data exfiltration
- **Pro:** Blocks malicious API calls
- **Pro:** Audit trail of allowed services
- **Con:** Must manually add legitimate services
- **Con:** May break integrations

**Whitelist Disabled (default):**
- **Pro:** No configuration needed
- **Pro:** All integrations work out of box
- **Con:** Potential security risk
- **Con:** No protection against malicious calls

## Related Settings

- `audit-log-enabled` - Log all API calls
- `require-env-validation` - Validate API endpoints
- `rate-limit-per-hour` - Limit total API requests

## Examples

### Maximum Security
```json
{
  "allowed-domains": [
    "api.anthropic.com"
  ],
  "audit-log-enabled": true,
  "sandbox-mode": true
}
```

### Production Web3 App
```json
{
  "allowed-domains": [
    "api.anthropic.com",
    "supabase.io",
    "api.helius.xyz",
    "api.github.com"
  ],
  "audit-log-enabled": true
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
