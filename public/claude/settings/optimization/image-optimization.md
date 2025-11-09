# Image Optimization

Enable automatic image optimization. Converts to WebP, generates responsive sizes.

## Overview

Automatically optimizes images by converting to WebP format, generating responsive sizes, and lazy loading. Dramatically improves page load times and Core Web Vitals scores.

## Configuration

**Category:** Optimization
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable image optimization (default)
npx @gicm/cli settings add optimization/image-optimization --value true

# Disable image optimization
npx @gicm/cli settings add optimization/image-optimization --value false
```

## Optimizations Applied

**Automatic:**
1. **Format conversion:** JPEG/PNG → WebP/AVIF
2. **Responsive sizes:** Generate multiple sizes for different devices
3. **Lazy loading:** Load images as they enter viewport
4. **Compression:** Reduce file size without quality loss
5. **Dimensions:** Add width/height to prevent layout shift

## Format Conversion

**Before:**
```html
<!-- Original: 245 KB JPEG -->
<img src="/hero.jpg" alt="Hero" />
```

**After:**
```html
<!-- Optimized: 87 KB WebP -->
<picture>
  <source srcset="/hero.webp" type="image/webp" />
  <source srcset="/hero.avif" type="image/avif" />
  <img src="/hero.jpg" alt="Hero" width="1200" height="630" loading="lazy" />
</picture>
```

**Savings: 158 KB (64% reduction)**

## Responsive Images

**Generates multiple sizes:**
```html
<img
  srcset="
    /hero-640w.webp 640w,
    /hero-768w.webp 768w,
    /hero-1024w.webp 1024w,
    /hero-1280w.webp 1280w,
    /hero-1920w.webp 1920w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  src="/hero-1024w.webp"
  alt="Hero"
  loading="lazy"
/>
```

**Browser loads appropriate size for device.**

## Configuration

**Customize optimization:**
```json
{
  "image-optimization": true,
  "image-config": {
    "formats": ["avif", "webp"],
    "quality": 80,
    "sizes": [640, 768, 1024, 1280, 1920],
    "lazy-loading": true,
    "placeholder": "blur"
  }
}
```

## Quality Settings

**Quality levels:**
- 90-100: Maximum quality, larger files
- 75-85: High quality, good compression (recommended)
- 60-75: Medium quality, significant compression
- <60: Low quality, maximum compression

## Lazy Loading

**Intersection Observer-based:**
```json
{
  "image-optimization": true,
  "lazy-loading": {
    "enabled": true,
    "threshold": 0.1,
    "rootMargin": "50px",
    "above-fold-count": 3
  }
}
```

**Above-fold images load immediately, below-fold lazy load.**

## Placeholder Strategies

**Blur placeholder:**
```json
{
  "image-optimization": true,
  "placeholder": {
    "type": "blur",
    "blur-data-url": true
  }
}
```

**Solid color placeholder:**
```json
{
  "image-optimization": true,
  "placeholder": {
    "type": "color",
    "color": "#f0f0f0"
  }
}
```

## Build-Time vs Runtime

**Build-time optimization (recommended):**
- Images optimized during build
- Fastest runtime performance
- Larger build time

**Runtime optimization:**
- Images optimized on first request
- Slower first load, cached after
- Faster build time

```json
{
  "image-optimization": true,
  "optimization-mode": "build-time"
}
```

## Affected Components

- `frontend-fusion-engine` - Next.js image optimization
- `performance-profiler` - Core Web Vitals tracking

## Performance Impact

**Typical savings:**
- File size: 60-80% reduction
- LCP (Largest Contentful Paint): 40-60% improvement
- CLS (Cumulative Layout Shift): Near zero with dimensions
- Bandwidth: 70-85% reduction

**Example:**
```
Before optimization:
  - 10 images, total 2.4 MB
  - LCP: 4.2s

After optimization:
  - 10 images, total 450 KB
  - LCP: 1.8s

Improvement: 81% smaller, 57% faster
```

## CDN Integration

**Optimize via CDN:**
```json
{
  "image-optimization": true,
  "cdn": {
    "enabled": true,
    "provider": "vercel",
    "domains": ["gicm.io"]
  }
}
```

## Related Settings

- `cdn-caching-strategy` - Cache optimized images
- `performance-profiler` - Monitor Core Web Vitals
- `bundle-analyzer-enabled` - Track image sizes

## Examples

### Maximum Quality (Portfolio Site)
```json
{
  "image-optimization": true,
  "image-config": {
    "formats": ["avif", "webp", "jpeg"],
    "quality": 90,
    "sizes": [640, 1024, 1920, 2560],
    "lazy-loading": true,
    "placeholder": "blur"
  }
}
```

### Maximum Performance (E-Commerce)
```json
{
  "image-optimization": true,
  "image-config": {
    "formats": ["avif", "webp"],
    "quality": 75,
    "sizes": [320, 640, 1024],
    "lazy-loading": true,
    "placeholder": "color",
    "aggressive-compression": true
  },
  "optimization-mode": "build-time"
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
