# Tree Shaking

Enable tree shaking to remove unused code. Significantly reduces bundle size.

## Overview

Enables tree shaking (dead code elimination) in bundlers. Removes unused exports and code paths, dramatically reducing bundle sizes. Essential for production builds.

## Configuration

**Category:** Optimization
**Type:** Boolean
**Default:** true
**Recommended:** true for all environments

## Usage

```bash
# Enable tree shaking (default)
npx @gicm/cli settings add optimization/tree-shaking --value true

# Disable tree shaking
npx @gicm/cli settings add optimization/tree-shaking --value false
```

## How It Works

**Example - Before tree shaking:**
```typescript
// utils.ts (100 KB)
export function foo() { /* ... */ }
export function bar() { /* ... */ }
export function baz() { /* ... */ }
// ... 50 more functions

// app.ts
import { foo } from './utils';
foo(); // Only uses 1 function

// Bundle includes ALL 53 functions (100 KB)
```

**After tree shaking:**
```typescript
// Bundle only includes foo() (2 KB)
// 98 KB saved!
```

## Savings by Library

**Typical savings:**
- lodash: ~90% (use only needed functions)
- @solana/web3.js: ~70% (unused RPC methods)
- lucide-react: ~95% (only icons used)
- recharts: ~60% (unused chart types)
- date-fns: ~85% (only needed functions)

## Side Effects Configuration

**Mark side-effect-free packages:**
```json
{
  "tree-shaking": true,
  "sideEffects": {
    "default": false,
    "overrides": {
      "*.css": true,
      "*.scss": true,
      "polyfills.js": true
    }
  }
}
```

## ESM vs CommonJS

**Tree shaking requires ESM:**
```typescript
// ✓ Can be tree-shaken (ESM)
import { foo } from './utils';

// ✗ Cannot be tree-shaken (CommonJS)
const { foo } = require('./utils');
```

**Configuration:**
```json
{
  "tree-shaking": true,
  "force-esm": {
    "enabled": true,
    "convert-commonjs": true
  }
}
```

## Aggressive Optimization

**Maximum tree shaking:**
```json
{
  "tree-shaking": true,
  "aggressive": {
    "enabled": true,
    "remove-unused-classes": true,
    "remove-unused-css": true,
    "minify-identifiers": true
  }
}
```

## Affected Components

- `bundler-optimizer` - Bundle optimization
- `build-system-engineer` - Build configuration

## Verification

**Check tree shaking effectiveness:**
```bash
# Build with tree shaking
npm run build

# Analyze bundle
npx @gicm/cli bundle analyze

# Output shows:
# Before: 850 KB
# After: 320 KB
# Removed: 530 KB (62%)
```

## Common Issues

**Problem: Tree shaking not working**
```
⚠️  Tree shaking ineffective

Detected CommonJS imports:
  - lodash (use lodash-es instead)
  - moment (use date-fns instead)
  - @material-ui (has side effects)

Recommendations:
  1. Replace lodash with lodash-es
  2. Replace moment with date-fns
  3. Use named imports from @material-ui
```

**Problem: CSS not being tree-shaken**
```
💡 CSS Tree Shaking

Install PurgeCSS for CSS optimization:
  npm install -D @fullhuman/postcss-purgecss

Potential savings: ~75% of CSS (180 KB → 45 KB)
```

## Library-Specific Optimizations

**Lodash:**
```typescript
// ✗ Bad: imports entire library
import _ from 'lodash';

// ✓ Good: imports only needed function
import debounce from 'lodash/debounce';
```

**Lucide Icons:**
```typescript
// ✗ Bad: imports all icons
import * as Icons from 'lucide-react';

// ✓ Good: imports only needed icons
import { Menu, X, User } from 'lucide-react';
```

## Related Settings

- `bundle-analyzer-enabled` - Visualize results
- `code-splitting-strategy` - Split code into chunks
- `compression-enabled` - Compress output

## Examples

### Maximum Optimization (Production)
```json
{
  "tree-shaking": true,
  "aggressive": {
    "enabled": true,
    "remove-unused-classes": true,
    "remove-unused-css": true
  },
  "force-esm": {
    "enabled": true,
    "convert-commonjs": true
  }
}
```

### Development
```json
{
  "tree-shaking": true,
  "aggressive": {
    "enabled": false
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
