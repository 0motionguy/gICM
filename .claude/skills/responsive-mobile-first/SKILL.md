---
name: responsive-mobile-first
description: "{/* 16px mobile, 24px tablet, 32px desktop */}"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Responsive Mobile-First Design

**Skill ID:** `responsive-mobile-first`
**Domain:** Frontend / CSS / Responsive Design
**Complexity:** Intermediate
**Prerequisites:** CSS fundamentals, Flexbox, Grid

## Quick Reference

```css
/* Mobile-first approach */
.container {
  padding: 1rem;           /* Mobile */
}

@media (min-width: 640px) {
  .container {
    padding: 1.5rem;       /* Tablet */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;         /* Desktop */
  }
}
```

```tsx
// Tailwind CSS (mobile-first)
<div className="px-4 sm:px-6 lg:px-8">
  {/* 16px mobile, 24px tablet, 32px desktop */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>

// Viewport units
<div className="h-screen w-screen">
  {/* 100vh x 100vw */}
</div>

// Container queries
<div className="@container">
  <div className="text-base @lg:text-lg">
    {/* Responds to container width */}
  </div>
</div>
```

## Core Concepts

### 1. Mobile-First Philosophy

Start with mobile design, then enhance for larger screens.

**Why mobile-first?**
- Mobile traffic > desktop (60%+)
- Easier to scale up than down
- Forces focus on essential content
- Better performance (progressive enhancement)

**Mobile-first CSS:**
```css
/* Base (mobile) */
.element {
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    font-size: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    font-size: 18px;
  }
}
```

### 2. Breakpoints

**Common breakpoint system:**
- **xs**: 0px (base mobile)
- **sm**: 640px (large mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

**Tailwind default breakpoints:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### 3. Viewport Meta Tag

Essential for responsive design:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 4. Flexible Units

- **rem/em**: Relative to font size
- **%**: Relative to parent
- **vw/vh**: Viewport width/height
- **vmin/vmax**: Smallest/largest viewport dimension
- **ch**: Width of '0' character

### 5. Responsive Images

```html
<!-- Responsive image -->
<img
  src="image.jpg"
  srcset="image-320w.jpg 320w,
          image-640w.jpg 640w,
          image-1280w.jpg 1280w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="Description"
/>

<!-- Next.js Image component (automatic optimization) -->
<Image
  src="/image.jpg"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Description"
/>
```

## Common Patterns

### Pattern 1: Responsive Navigation

```tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <a href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </a>
            <a href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </a>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 md:hidden">
          <div className="space-y-1 px-4 py-3">
            <a
              href="/"
              className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Home
            </a>
            <a
              href="/about"
              className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              About
            </a>
            <a
              href="/contact"
              className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Contact
            </a>
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
```

### Pattern 2: Responsive Grid Layouts

```tsx
// Auto-responsive grid (no breakpoints needed)
export function AutoGrid({ items }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
      {items.map(item => (
        <Card key={item.id}>{item.content}</Card>
      ))}
    </div>
  )
}

// Breakpoint-based grid
export function ResponsiveGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map(item => (
        <Card key={item.id}>{item.content}</Card>
      ))}
    </div>
  )
}

// Asymmetric grid (featured item)
export function FeaturedGrid({ featured, items }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Featured - spans 2 columns on desktop */}
      <div className="lg:col-span-2">
        <FeaturedCard item={featured} />
      </div>

      {/* Regular items */}
      {items.map(item => (
        <Card key={item.id}>{item.content}</Card>
      ))}
    </div>
  )
}

// Dashboard layout
export function DashboardLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main content */}
      <div className="lg:col-span-8 space-y-6">
        <StatsCards />
        <Chart />
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-4 space-y-6">
        <QuickActions />
        <RecentActivity />
      </aside>
    </div>
  )
}
```

### Pattern 3: Responsive Typography

```tsx
// Fluid typography with clamp()
const fluidTypography = {
  h1: 'clamp(2rem, 5vw, 4rem)',      // 32px - 64px
  h2: 'clamp(1.5rem, 4vw, 3rem)',    // 24px - 48px
  h3: 'clamp(1.25rem, 3vw, 2rem)',   // 20px - 32px
  body: 'clamp(1rem, 2.5vw, 1.125rem)', // 16px - 18px
}

// Tailwind responsive typography
export function Article({ content }) {
  return (
    <article className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
        Responsive Heading
      </h1>

      <p className="text-base sm:text-lg lg:text-xl text-gray-600">
        Body text that scales with viewport
      </p>

      {content}
    </article>
  )
}

// Line clamping
export function Card({ title, description }) {
  return (
    <div className="rounded-lg border p-6">
      {/* Single line on mobile, 2 lines on desktop */}
      <h3 className="text-xl font-bold line-clamp-1 md:line-clamp-2">
        {title}
      </h3>

      {/* 3 lines on mobile, 4 on desktop */}
      <p className="mt-2 text-gray-600 line-clamp-3 md:line-clamp-4">
        {description}
      </p>
    </div>
  )
}
```

### Pattern 4: Responsive Spacing

```tsx
// Container with responsive padding
export function Container({ children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}

// Section spacing
export function Section({ children }) {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      {children}
    </section>
  )
}

// Card spacing
export function Card({ children }) {
  return (
    <div className="rounded-lg border p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  )
}

// Stack spacing
export function Stack({ children }) {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {children}
    </div>
  )
}
```

## Advanced Techniques

### 1. Container Queries

```tsx
// Install plugin
// npm install @tailwindcss/container-queries

// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}

// Usage
export function ResponsiveCard({ product }) {
  return (
    <div className="@container">
      {/* Responds to container width, not viewport */}
      <div className="flex flex-col @md:flex-row gap-4">
        <img
          src={product.image}
          className="w-full @md:w-48 h-48 object-cover rounded-lg"
        />

        <div className="flex-1">
          <h3 className="text-lg @lg:text-xl @xl:text-2xl font-bold">
            {product.name}
          </h3>

          <p className="text-sm @md:text-base text-gray-600 mt-2">
            {product.description}
          </p>

          <div className="mt-4 @md:mt-auto">
            <span className="text-xl @lg:text-2xl font-bold">
              ${product.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2. Responsive Hooks

```tsx
import { useEffect, useState } from 'react'

// useMediaQuery hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Usage
export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}

// useBreakpoint hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('md')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

// Usage
export function AdaptiveLayout() {
  const breakpoint = useBreakpoint()

  return (
    <div>
      Current breakpoint: {breakpoint}
      {breakpoint === 'sm' && <MobileLayout />}
      {['md', 'lg'].includes(breakpoint) && <TabletLayout />}
      {['xl', '2xl'].includes(breakpoint) && <DesktopLayout />}
    </div>
  )
}
```

### 3. Viewport Height Issues (Mobile)

```css
/* Fix for mobile browser address bar */
.full-height {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
}

/* Or use JS */
```

```tsx
import { useEffect, useState } from 'react'

export function useDynamicViewportHeight() {
  const [height, setHeight] = useState('100vh')

  useEffect(() => {
    const updateHeight = () => {
      setHeight(`${window.innerHeight}px`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return height
}

// Usage
export function FullScreenModal() {
  const height = useDynamicViewportHeight()

  return (
    <div style={{ height }} className="overflow-auto">
      Modal content
    </div>
  )
}
```

### 4. Touch-Friendly Interactions

```tsx
// Minimum touch target: 44x44px (iOS), 48x48px (Android)
export function TouchButton({ children, ...props }) {
  return (
    <button
      className="min-h-[44px] min-w-[44px] touch-manipulation"
      {...props}
    >
      {children}
    </button>
  )
}

// Disable zoom on double-tap
// Add to head:
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// Prevent pinch zoom (CSS)
html {
  touch-action: pan-x pan-y;
}

// Larger tap areas on mobile
export function MobileCard() {
  return (
    <a
      href="/product"
      className="block p-4 hover:bg-gray-50 active:bg-gray-100 -mx-4 md:mx-0"
    >
      {/* Entire area is tappable on mobile */}
      <h3>Product Name</h3>
      <p>Description</p>
    </a>
  )
}
```

## Production Examples

### Example 1: E-commerce Product Grid

```tsx
export function ProductGrid({ products }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Grid: 1 col mobile, 2 tablet, 3 desktop, 4 large desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <div className="group rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            ${product.price}
          </span>

          <button className="rounded-lg bg-blue-600 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Responsive Hero Section

```tsx
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 sm:py-16 lg:py-20">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">
              Build Better Apps
            </h1>

            <p className="mt-4 sm:mt-6 text-lg sm:text-xl lg:text-2xl text-blue-100">
              The fastest way to build modern web applications with React and Next.js
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-blue-600 hover:bg-gray-100">
                Get Started
              </button>

              <button className="rounded-lg border-2 border-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-white/10">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  100K+
                </div>
                <div className="mt-1 text-sm sm:text-base text-blue-100">
                  Users
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  50K+
                </div>
                <div className="mt-1 text-sm sm:text-base text-blue-100">
                  Projects
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  99.9%
                </div>
                <div className="mt-1 text-sm sm:text-base text-blue-100">
                  Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Image/Graphic */}
          <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[32rem]">
            <img
              src="/hero-image.png"
              alt="Dashboard preview"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-white/10 blur-3xl" />
    </section>
  )
}
```

### Example 3: Responsive Dashboard

```tsx
export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, drawer on tablet, fixed on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <span className="text-xl font-bold">Dashboard</span>

          {/* Close button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink href="/dashboard">Overview</NavLink>
          <NavLink href="/analytics">Analytics</NavLink>
          <NavLink href="/users">Users</NavLink>
          <NavLink href="/settings">Settings</NavLink>
        </nav>
      </aside>

      {/* Overlay - mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          {/* Menu button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg sm:text-xl font-semibold hidden sm:block">
            Dashboard
          </h1>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="rounded-lg p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatsCard title="Revenue" value="$12,345" />
              <StatsCard title="Users" value="1,234" />
              <StatsCard title="Orders" value="567" />
              <StatsCard title="Conversion" value="3.4%" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-semibold mb-4">Revenue Chart</h2>
                <RevenueChart />
              </Card>

              <Card>
                <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                <UserChart />
              </Card>
            </div>

            {/* Table */}
            <Card>
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <OrdersTable />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
```

## Best Practices

### 1. Mobile-First CSS

```css
/* ✅ Do: Mobile first */
.element {
  padding: 1rem;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .element {
    padding: 2rem;
    font-size: 1.25rem;
  }
}

/* ❌ Don't: Desktop first */
.element {
  padding: 2rem;
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .element {
    padding: 1rem;
    font-size: 1rem;
  }
}
```

### 2. Touch Targets

```tsx
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Click me
</button>

// Add padding for easier tapping
<a className="block py-3 px-4 -mx-4 hover:bg-gray-50">
  Link with larger tap area
</a>
```

### 3. Performance

```tsx
// Lazy load images
<img loading="lazy" src="/image.jpg" alt="Description" />

// Next.js Image with responsive sizes
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false}
/>

// Responsive video
<video className="w-full h-auto" poster="/poster.jpg">
  <source src="/video-mobile.mp4" media="(max-width: 768px)" />
  <source src="/video-desktop.mp4" media="(min-width: 769px)" />
</video>
```

### 4. Accessibility

```tsx
// Skip navigation link (mobile)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>

// Responsive focus indicators
<button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:focus:ring-offset-4">
  Click me
</button>
```

## Common Pitfalls

### 1. Not Testing on Real Devices

**❌ Don't:**
```
Only test in browser DevTools
```

**✅ Do:**
```
- Test on real iOS and Android devices
- Test in portrait and landscape
- Test with slow network (throttling)
- Test with different font sizes
```

### 2. Fixed Widths

**❌ Don't:**
```tsx
<div style={{ width: '800px' }}>
  Content
</div>
```

**✅ Do:**
```tsx
<div className="max-w-4xl mx-auto px-4">
  Content
</div>
```

### 3. Ignoring Touch Events

**❌ Don't:**
```tsx
<div onMouseEnter={handleHover}>
  Hover me
</div>
```

**✅ Do:**
```tsx
<button onClick={handleClick}>
  Tap/Click me
</button>
```

### 4. Small Text on Mobile

**❌ Don't:**
```css
body {
  font-size: 12px;  /* Too small on mobile */
}
```

**✅ Do:**
```css
body {
  font-size: 16px;  /* Readable base size */
}
```

## Resources

- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [Responsive Images](https://responsiveimages.org)
- [Can I Use](https://caniuse.com) - Browser support
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit
