# Critical Bug Fix: Install Command Slug Mismatch

## Issue Discovered
**Date:** November 9, 2025
**Severity:** CRITICAL
**Impact:** 30% of CLI installations failing (121/409 items)

## Problem
Install commands in the registry used shortened slugs that didn't match the actual item slugs in the database, causing 404 errors when users tried to install items via CLI.

**Example:**
```bash
# Install command said:
npx @gicm/cli add agent/backend-api

# But actual slug was:
backend-api-specialist

# Result: 404 Not Found
```

## Root Cause
The registry entries had mismatched `install` fields and `slug` fields:

```typescript
{
  id: "backend-api-specialist",
  slug: "backend-api-specialist",     // Full slug
  install: "npx @gicm/cli add agent/backend-api",  // Shortened slug ❌
}
```

The API lookup uses `slug` field, so requests for "backend-api" failed.

## Items Affected

### Agents (34 items)
- agent/frontend-fusion → frontend-fusion-engine
- agent/rust-systems → rust-systems-architect
- agent/typescript-precision → typescript-precision-engineer
- agent/database-schema → database-schema-oracle
- agent/api-contract → api-contract-designer
- agent/web3-integration → web3-integration-maestro
- agent/backend-api → backend-api-specialist
- + 27 more

### Skills (87 items)
- skill/pwa → progressive-web-apps
- skill/solana-anchor → solana-anchor-mastery
- skill/web3-wallet → web3-wallet-integration
- skill/bonding-curve → bonding-curve-mathematics
- skill/nextjs-app-router → nextjs-app-router-patterns
- + 82 more

## Solution
Created automated fix script (`fix-install-slugs.js`) that:
1. Scanned registry for slug mismatches
2. Updated all 121 install commands to use full slugs
3. Verified 0 mismatches remaining

**Before:**
```typescript
install: "npx @gicm/cli add agent/backend-api"
```

**After:**
```typescript
install: "npx @gicm/cli add agent/backend-api-specialist"
```

## Verification

### Automated Check
```bash
$ node check-install-slugs.js
SLUG MISMATCHES FOUND: 0
✅ All install commands match their slugs!
```

### Build Status
```bash
$ npm run build
✓ Compiled successfully
✓ Generating static pages (430/430)
```

### Manual Testing
Previously failing installations:
```bash
# Now works:
✅ npx @gicm/cli add agent/backend-api-specialist
✅ npx @gicm/cli add skill/progressive-web-apps
✅ npx @gicm/cli add agent/frontend-fusion-engine
```

## Deployment
- **Commit:** c9bd95f
- **Deployed:** November 9, 2025
- **Status:** ✅ Live on production

## Impact
- ✅ Fixed 121 broken install commands
- ✅ 100% of marketplace items now installable
- ✅ No breaking changes to existing installations
- ✅ URLs and slugs remain unchanged

## Prevention
Added `check-install-slugs.js` script to CI/CD:
- Runs during build
- Fails if mismatches detected
- Prevents regression

## Related Files
- `src/lib/registry.ts` - Updated install commands
- `fix-install-slugs.js` - Automated fix script
- `check-install-slugs.js` - Validation script
