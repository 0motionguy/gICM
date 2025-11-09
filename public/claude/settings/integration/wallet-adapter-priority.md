# Wallet Adapter Priority

Wallet connection priority order. Comma-separated list. Example: phantom,solflare,backpack for Solana.

## Overview

Defines the order in which wallet adapters are attempted when connecting. First available wallet in the list will be used. Customize based on your target user base.

## Configuration

**Category:** Integration
**Type:** Array (string list)
**Default:** ["phantom", "solflare", "backpack"]

## Usage

```bash
# Solana wallets (default)
npx @gicm/cli settings add integration/wallet-adapter-priority --value "phantom,solflare,backpack"

# Ethereum wallets
npx @gicm/cli settings add integration/wallet-adapter-priority --value "metamask,walletconnect,coinbase"
```

## Wallet Priorities

### Solana
**Recommended order:**
```json
["phantom", "solflare", "backpack", "glow", "slope"]
```

**Rationale:**
- Phantom: Most popular (~80% market share)
- Solflare: Second most popular
- Backpack: Growing adoption
- Glow: Mobile-first
- Slope: Legacy support

### Ethereum
**Recommended order:**
```json
["metamask", "walletconnect", "coinbase", "rainbow"]
```

**Rationale:**
- MetaMask: Most popular (~70% market share)
- WalletConnect: Universal protocol
- Coinbase Wallet: Exchange users
- Rainbow: Mobile-first

## How It Works

**Connection flow:**
```
User clicks "Connect Wallet"
  ↓
🔍 Checking for wallets in priority order...
  ↓
  1. Phantom - Found ✓
  2. Solflare - Skipped (Phantom already connected)
  ↓
✓ Connected to Phantom
```

**No wallet found:**
```
User clicks "Connect Wallet"
  ↓
🔍 Checking for wallets...
  ↓
  1. Phantom - Not installed ✗
  2. Solflare - Not installed ✗
  3. Backpack - Not installed ✗
  ↓
❌ No supported wallet found
💡 Please install Phantom, Solflare, or Backpack
```

## Affected Components

- `frontend-fusion-engine` - Wallet integration in UI

## User Choice Override

**Allow user to select wallet:**
```json
{
  "wallet-adapter-priority": ["phantom", "solflare", "backpack"],
  "allow-wallet-selection": true
}
```

**Shows wallet picker UI instead of auto-connecting.**

## Mobile vs Desktop

**Different priorities per platform:**
```json
{
  "wallet-adapter-priority": {
    "desktop": ["phantom", "solflare", "backpack"],
    "mobile": ["glow", "phantom-mobile", "solflare-mobile"]
  }
}
```

## Auto-Connect Behavior

**Auto-connect to last used wallet:**
```json
{
  "wallet-adapter-priority": ["phantom", "solflare"],
  "auto-connect": {
    "enabled": true,
    "remember-last-wallet": true
  }
}
```

## Related Settings

- `network-timeout` - Wallet connection timeout
- `default-rpc-provider` - RPC provider for wallet

## Examples

### ICM Motion (Solana Launch Platform)
```json
{
  "wallet-adapter-priority": [
    "phantom",
    "solflare",
    "backpack"
  ],
  "auto-connect": {
    "enabled": true,
    "remember-last-wallet": true
  },
  "allow-wallet-selection": true
}
```

### Multi-Chain DApp
```json
{
  "wallet-adapter-priority": {
    "solana": ["phantom", "solflare"],
    "ethereum": ["metamask", "walletconnect"]
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
