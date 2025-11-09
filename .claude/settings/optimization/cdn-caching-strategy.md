# CDN Caching Strategy

CDN cache strategy. Options: aggressive, balanced, conservative. Recommended: balanced for most apps.

## Overview

Controls CDN caching behavior. 'aggressive' caches everything with long TTLs (best for static sites), 'balanced' caches static assets with moderate TTLs (recommended), 'conservative' minimal caching with short TTLs (for frequently updated content).

## Configuration

**Category:** Optimization
**Type:** String (enum)
**Default:** balanced
**Options:** aggressive, balanced, conservative

## Usage

```bash
# Balanced strategy (default)
npx @gicm/cli settings add optimization/cdn-caching-strategy --value balanced

# Aggressive caching
npx @gicm/cli settings add optimization/cdn-caching-strategy --value aggressive

# Conservative caching
npx @gicm/cli settings add optimization/cdn-caching-strategy --value conservative
```

## Caching Strategies

### Aggressive
**Best for:** Static sites, documentation, marketing pages

**Cache rules:**
- HTML: 1 hour (with revalidation)
- CSS/JS: 1 year (with versioning)
- Images: 1 year
- Fonts: 1 year
- API responses: 5 minutes

**Headers:**
```
Cache-Control: public, max-age=31536000, immutable
```

### Balanced (Recommended)
**Best for:** Most web applications

**Cache rules:**
- HTML: 5 minutes (with revalidation)
- CSS/JS: 1 month (with versioning)
- Images: 1 month
- Fonts: 1 year
- API responses: no-cache

**Headers:**
```
Cache-Control: public, max-age=2592000, must-revalidate
```

### Conservative
**Best for:** Frequently updated apps, dashboards, real-time apps

**Cache rules:**
- HTML: no-cache
- CSS/JS: 1 day (with versioning)
- Images: 1 week
- Fonts: 1 month
- API responses: no-cache

**Headers:**
```
Cache-Control: public, max-age=86400, must-revalidate
```

## Cache Control by File Type

**Fine-grained control:**
```json
{
  "cdn-caching-strategy": "balanced",
  "cache-rules": {
    "html": {
      "max-age": 300,
      "stale-while-revalidate": 60
    },
    "static-assets": {
      "max-age": 2592000,
      "immutable": true
    },
    "images": {
      "max-age": 2592000,
      "s-maxage": 31536000
    },
    "api": {
      "no-cache": true,
      "must-revalidate": true
    }
  }
}
```

## Versioning Strategy

**Asset versioning for cache busting:**
```json
{
  "cdn-caching-strategy": "aggressive",
  "versioning": {
    "enabled": true,
    "strategy": "hash",
    "length": 8
  }
}
```

**Output:**
```
Before: /app.js
After: /app.a3f2d8b1.js
```

## Purge Configuration

**Configure cache purging:**
```json
{
  "cdn-caching-strategy": "balanced",
  "purge": {
    "on-deploy": true,
    "selective": true,
    "patterns": [
      "/api/*",
      "/*.html"
    ]
  }
}
```

## CDN Providers

**Vercel:**
```json
{
  "cdn-caching-strategy": "balanced",
  "provider": "vercel",
  "vercel": {
    "regions": ["iad1", "sfo1"],
    "edge-config": {
      "enabled": true
    }
  }
}
```

**Cloudflare:**
```json
{
  "cdn-caching-strategy": "balanced",
  "provider": "cloudflare",
  "cloudflare": {
    "zone-id": "${CLOUDFLARE_ZONE_ID}",
    "cache-level": "aggressive",
    "browser-ttl": 31536000
  }
}
```

## Performance Impact

**Cache hit rates:**
- Aggressive: 95-98% (best performance)
- Balanced: 85-92% (good performance)
- Conservative: 60-75% (fresh content)

**TTFB (Time to First Byte):**
- Cache hit: 50-100ms
- Cache miss: 200-500ms
- No cache: 300-800ms

## Stale-While-Revalidate

**Serve stale content while updating:**
```json
{
  "cdn-caching-strategy": "balanced",
  "stale-while-revalidate": {
    "enabled": true,
    "stale-ttl": 86400,
    "revalidate-in-background": true
  }
}
```

**User experience:**
```
User 1 requests /page (cache expired)
  → Served stale content (50ms)
  → Cache updated in background

User 2 requests /page (10s later)
  → Served fresh content (50ms)
```

## Affected Components

- `deployment-strategist` - Deployment configuration

## Related Settings

- `image-optimization` - Optimize cached images
- `compression-enabled` - Compress cached content
- `bundle-analyzer-enabled` - Monitor cache efficiency

## Examples

### Static Site (Maximum Caching)
```json
{
  "cdn-caching-strategy": "aggressive",
  "cache-rules": {
    "html": {
      "max-age": 3600,
      "stale-while-revalidate": 300
    },
    "static-assets": {
      "max-age": 31536000,
      "immutable": true
    }
  },
  "versioning": {
    "enabled": true,
    "strategy": "hash"
  }
}
```

### Dynamic Web App (Balanced)
```json
{
  "cdn-caching-strategy": "balanced",
  "cache-rules": {
    "html": {
      "max-age": 300,
      "stale-while-revalidate": 60
    },
    "api": {
      "no-cache": true
    }
  },
  "purge": {
    "on-deploy": true,
    "patterns": ["/*.html", "/api/*"]
  }
}
```

### Real-Time Dashboard (Conservative)
```json
{
  "cdn-caching-strategy": "conservative",
  "cache-rules": {
    "html": {
      "no-cache": true,
      "must-revalidate": true
    },
    "static-assets": {
      "max-age": 86400
    }
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
