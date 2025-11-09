# Code Splitting Strategy

Code splitting strategy. Options: route, component, vendor. Recommended: route for Next.js apps.

## Overview

Defines how code is split into separate bundles. 'route' splits by page routes (recommended for Next.js), 'component' splits by component, 'vendor' separates vendor code from app code.

## Configuration

**Category:** Optimization
**Type:** String (enum)
**Default:** route
**Options:** route, component, vendor, manual

## Usage

```bash
# Route-based splitting (default, best for Next.js)
npx @gicm/cli settings add optimization/code-splitting-strategy --value route

# Component-based splitting
npx @gicm/cli settings add optimization/code-splitting-strategy --value component

# Vendor splitting
npx @gicm/cli settings add optimization/code-splitting-strategy --value vendor

# Manual splitting
npx @gicm/cli settings add optimization/code-splitting-strategy --value manual
```

## Splitting Strategies

### Route-Based (Recommended for Next.js)
**How it works:**
- Each page/route gets own bundle
- Shared code extracted to common chunk
- Perfect for Next.js App Router

**Example:**
```
Build output:
  ├─ app/page.js → 45 KB
  ├─ app/workflow/page.js → 38 KB
  ├─ app/analytics/page.js → 62 KB (includes recharts)
  └─ shared.js → 23 KB (common code)

User visits /workflow:
  Downloads: shared.js (23 KB) + workflow/page.js (38 KB) = 61 KB
  Not downloaded: page.js, analytics/page.js
```

### Component-Based
**How it works:**
- Large components split into separate chunks
- Loaded on-demand when component renders
- Good for heavy components

**Example:**
```typescript
// Heavy chart component split automatically
const ChartComponent = dynamic(() => import('@/components/Chart'), {
  loading: () => <Spinner />,
  ssr: false
});
```

### Vendor
**How it works:**
- Third-party dependencies in separate chunk
- App code in separate chunk
- Better caching (vendor changes less often)

**Example:**
```
Build output:
  ├─ vendor.js → 245 KB (react, next, etc.)
  ├─ app.js → 89 KB (your code)
  └─ runtime.js → 12 KB (webpack runtime)
```

### Manual
**How it works:**
- You define split points with dynamic imports
- Maximum control over chunking
- Advanced use case

**Example:**
```typescript
// Manual split point
const heavyModule = await import('./heavy-module');
```

## Affected Components

- `bundler-optimizer` - Bundle optimization
- `frontend-fusion-engine` - React/Next.js builds

## Route-Based Configuration

**Configure route splitting:**
```json
{
  "code-splitting-strategy": "route",
  "route-splitting": {
    "enabled": true,
    "min-size-kb": 20,
    "max-parallel-requests": 5,
    "prefetch-routes": ["/", "/workflow"]
  }
}
```

## Component-Based Configuration

**Configure component splitting:**
```json
{
  "code-splitting-strategy": "component",
  "component-splitting": {
    "enabled": true,
    "size-threshold-kb": 50,
    "patterns": [
      "**/components/Chart/**",
      "**/components/Editor/**"
    ]
  }
}
```

## Vendor Configuration

**Configure vendor splitting:**
```json
{
  "code-splitting-strategy": "vendor",
  "vendor-splitting": {
    "enabled": true,
    "chunk-name": "vendor",
    "cache-groups": {
      "react": {
        "test": /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        "priority": 20
      },
      "solana": {
        "test": /[\\/]node_modules[\\/]@solana[\\/]/,
        "priority": 15
      },
      "ui": {
        "test": /[\\/]node_modules[\\/](lucide-react|recharts)[\\/]/,
        "priority": 10
      }
    }
  }
}
```

## Performance Impact

**Initial load time:**
- Route: Best (only loads needed route)
- Component: Good (loads page + visible components)
- Vendor: Good (vendor caches well)

**Subsequent navigation:**
- Route: Excellent (pre-fetches routes)
- Component: Good (lazy loads components)
- Vendor: Excellent (vendor already cached)

## Prefetching

**Configure prefetching:**
```json
{
  "code-splitting-strategy": "route",
  "prefetching": {
    "enabled": true,
    "mode": "viewport",
    "priority-routes": ["/", "/workflow", "/stack"]
  }
}
```

## Related Settings

- `tree-shaking` - Remove unused code
- `bundle-analyzer-enabled` - Analyze chunks
- `image-optimization` - Optimize images

## Examples

### Next.js App (Route-Based)
```json
{
  "code-splitting-strategy": "route",
  "route-splitting": {
    "min-size-kb": 20,
    "max-parallel-requests": 5,
    "prefetch-routes": ["/", "/workflow"]
  },
  "prefetching": {
    "enabled": true,
    "mode": "viewport"
  }
}
```

### SPA with Heavy Components
```json
{
  "code-splitting-strategy": "component",
  "component-splitting": {
    "size-threshold-kb": 50,
    "patterns": ["**/Chart/**", "**/Editor/**"]
  }
}
```

### Vendor-Optimized
```json
{
  "code-splitting-strategy": "vendor",
  "vendor-splitting": {
    "cache-groups": {
      "react": {
        "test": /[\\/]node_modules[\\/]react/
      }
    }
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
