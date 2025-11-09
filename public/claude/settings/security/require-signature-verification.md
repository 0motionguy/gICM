# Require Signature Verification

Verify package signatures before installation. Recommended for production environments.

## Overview

Enables cryptographic signature verification for all installed packages, agents, skills, and commands. Ensures code authenticity and prevents tampering.

## Configuration

**Category:** Security
**Type:** Boolean
**Default:** false
**Recommended:** true for production

## Usage

```bash
# Enable signature verification
npx @gicm/cli settings add security/require-signature-verification --value true

# Disable signature verification (default)
npx @gicm/cli settings add security/require-signature-verification --value false
```

## How It Works

1. **Package Signing:** gICM marketplace signs all packages with GPG
2. **Public Key:** Distributed with gICM CLI
3. **Verification:** Checks signature before installation
4. **Chain of Trust:** Verifies entire dependency tree

## Signature Verification Process

**Installation flow:**
```
1. Download package manifest
2. Verify manifest signature
3. Download package files
4. Verify file checksums match manifest
5. Install if all checks pass
```

## What Gets Verified

- **Agents:** All agent markdown files
- **Skills:** All skill files and dependencies
- **Commands:** Command definitions and scripts
- **MCPs:** MCP server configurations
- **Settings:** Settings configurations
- **Updates:** All package updates

## Verification Failure

When verification fails:

```
❌ Signature verification failed for package: frontend-fusion-engine
Reason: Signature does not match public key
Source: gicm.io/agents/frontend-fusion-engine

This package may have been tampered with.
Continue anyway? [y/N] (not recommended)
```

## Trust Management

**Trusted sources:**
```json
{
  "require-signature-verification": true,
  "trusted-sources": [
    "gicm.io",
    "marketplace.anthropic.com"
  ],
  "trusted-publishers": [
    "ICM Motion <security@gicm.io>",
    "Anthropic <security@anthropic.com>"
  ]
}
```

## Performance Impact

- **Installation time:** +2-5 seconds per package
- **Download size:** +5-10KB for signatures
- **CPU:** Minimal verification overhead

## Offline Mode

**With signature verification enabled:**
```bash
# Download signatures for offline use
npx @gicm/cli signatures download-all

# Use offline
npx @gicm/cli install agent/frontend-fusion --offline
```

## Developer Mode

**Disable for local development:**
```json
{
  "require-signature-verification": false,
  "allow-unsigned-packages": true,
  "local-package-paths": [
    "./custom-agents",
    "./custom-skills"
  ]
}
```

## Key Management

**View public keys:**
```bash
npx @gicm/cli keys list
```

**Add trusted key:**
```bash
npx @gicm/cli keys add --publisher "Custom Publisher" --key-file ./pubkey.gpg
```

**Revoke key:**
```bash
npx @gicm/cli keys revoke --publisher "Old Publisher"
```

## Related Settings

- `audit-log-enabled` - Log all installations
- `sandbox-mode` - Additional installation security
- `allowed-domains` - Restrict package sources

## Examples

### Maximum Security (Production)
```json
{
  "require-signature-verification": true,
  "trusted-sources": ["gicm.io"],
  "allow-unsigned-packages": false,
  "audit-log-enabled": true
}
```

### Development
```json
{
  "require-signature-verification": false,
  "allow-unsigned-packages": true
}
```

### Enterprise
```json
{
  "require-signature-verification": true,
  "trusted-sources": [
    "gicm.io",
    "internal-registry.company.com"
  ],
  "custom-signing-keys": [
    "/etc/gicm/company-public-key.gpg"
  ]
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
