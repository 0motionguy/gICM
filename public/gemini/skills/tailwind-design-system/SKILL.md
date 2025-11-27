# Tailwind CSS Design System

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


**Skill ID:** `tailwind-design-system`
**Domain:** Frontend / Styling
**Complexity:** Intermediate
**Prerequisites:** CSS fundamentals, PostCSS

## Quick Reference

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

```tsx
// Common patterns
<div className="flex items-center justify-between gap-4 p-6">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-95 transition-all">
    Click me
  </button>
</div>

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

## Core Concepts

### 1. Utility-First Philosophy

Instead of writing custom CSS, compose designs using utility classes.

**Traditional CSS:**
```css
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
.btn-primary:hover {
  background-color: #2563eb;
}
```

**Tailwind:**
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  Button
</button>
```

### 2. Design Tokens

Tailwind provides a carefully crafted scale for:
- **Colors:** 50-900 shades for each color
- **Spacing:** 0, 0.5, 1, 2, 3... up to 96
- **Typography:** text-xs, text-sm... text-9xl
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

### 3. Responsive Design

Mobile-first with breakpoint prefixes:

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

### 4. State Variants

Handle interactive states with prefixes:

```tsx
<button className="hover:bg-blue-700 focus:ring-2 active:scale-95 disabled:opacity-50">
  Button
</button>
```

### 5. Dark Mode

Use the `dark:` variant:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Common Patterns

### Pattern 1: Design Token System

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          900: '#14532d',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
      },
      // Consistent spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Typography scale
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      // Border radius scale
      borderRadius: {
        '4xl': '2rem',
      },
      // Box shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      // Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
}
```

### Pattern 2: Component Classes with @apply

```css
/* styles/components.css */
@layer components {
  /* Button variants */
  .btn {
    @apply inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
    @apply focus:ring-blue-500 active:scale-95;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300;
    @apply dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600;
  }

  .btn-outline {
    @apply btn border-2 border-gray-300 bg-transparent text-gray-700;
    @apply hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300;
  }

  /* Card component */
  .card {
    @apply rounded-xl border border-gray-200 bg-white shadow-sm;
    @apply dark:border-gray-800 dark:bg-gray-900;
  }

  .card-header {
    @apply border-b border-gray-200 px-6 py-4;
    @apply dark:border-gray-800;
  }

  .card-body {
    @apply px-6 py-4;
  }

  /* Input */
  .input {
    @apply block w-full rounded-lg border border-gray-300 bg-white px-4 py-2;
    @apply focus:border-blue-500 focus:ring-2 focus:ring-blue-200;
    @apply dark:border-gray-600 dark:bg-gray-800 dark:text-white;
    @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
  }

  /* Badge */
  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
  }

  .badge-success {
    @apply badge bg-green-100 text-green-800;
    @apply dark:bg-green-900 dark:text-green-300;
  }

  .badge-danger {
    @apply badge bg-red-100 text-red-800;
    @apply dark:bg-red-900 dark:text-red-300;
  }
}

/* Utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-in {
    animation: fade-in 0.3s ease-out;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

### Pattern 3: Responsive Grid Layouts

```tsx
// Basic Grid
export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Masonry-style Grid
export function MasonryGrid({ items }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {items.map(item => (
        <div key={item.id} className="break-inside-avoid">
          <Card>{item.content}</Card>
        </div>
      ))}
    </div>
  )
}

// Dashboard Layout
export function DashboardLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main content - 8 columns on desktop */}
      <div className="lg:col-span-8 space-y-6">
        <StatsCards />
        <RevenueChart />
      </div>

      {/* Sidebar - 4 columns on desktop */}
      <aside className="lg:col-span-4 space-y-6">
        <RecentActivity />
        <TopProducts />
      </aside>
    </div>
  )
}

// Auto-fit Grid (responsive without breakpoints)
export function AutoGrid({ children }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
      {children}
    </div>
  )
}
```

### Pattern 4: Dark Mode Implementation

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

// Usage in components
export function Card({ children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {children}
    </div>
  )
}
```

## Advanced Techniques

### 1. Custom Plugin Development

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0,0,0,0.1)',
        },
      })

      // Add custom components
      addComponents({
        '.container-narrow': {
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
        },
        '.btn-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      })
    }),

    // Radix colors plugin
    plugin(function({ addBase, theme }) {
      addBase({
        ':root': {
          '--radius': '0.5rem',
        },
        '*': {
          'border-color': theme('colors.gray.200'),
        },
      })
    }),
  ],
}
```

### 2. Dynamic Class Generation

```tsx
// Using clsx/cn utility
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
export function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 bg-transparent': variant === 'outline',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}
```

### 3. Container Queries

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
```

```tsx
// Usage
export function ProductCard({ product }) {
  return (
    <div className="@container">
      <div className="flex flex-col @lg:flex-row gap-4">
        <img
          src={product.image}
          className="w-full @lg:w-48 h-48 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg @lg:text-xl font-bold">
            {product.name}
          </h3>
          <p className="text-sm @lg:text-base text-gray-600">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 4. Animation System

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        // Slide animations
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Scale animations
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // Shimmer effect
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
}
```

```tsx
// Usage
export function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

export function LoadingShimmer() {
  return (
    <div className="relative overflow-hidden bg-gray-200 rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-200 animate-shimmer"></div>
    </div>
  )
}
```

## Production Examples

### Example 1: Dashboard Card System

```tsx
// components/stats-card.tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down'
}

export function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950"></div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
          {icon}
        </div>
      </div>
    </div>
  )
}

// Usage
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value="$45,231"
        change={20.1}
        trend="up"
        icon={<DollarSign className="h-6 w-6 text-blue-600" />}
      />
      <StatsCard
        title="Active Users"
        value="2,345"
        change={15.3}
        trend="up"
        icon={<Users className="h-6 w-6 text-blue-600" />}
      />
      <StatsCard
        title="Orders"
        value="1,234"
        change={-5.2}
        trend="down"
        icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
      />
      <StatsCard
        title="Conversion"
        value="3.4%"
        change={2.1}
        trend="up"
        icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
      />
    </div>
  )
}
```

### Example 2: Form System

```tsx
// components/form-field.tsx
export function FormField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

// components/input.tsx
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-gray-800 dark:text-white',
        error
          ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
          : 'border-gray-300 dark:border-gray-600',
        className
      )}
      {...props}
    />
  )
})

// Usage
export function LoginForm() {
  const [errors, setErrors] = useState({})

  return (
    <form className="max-w-md mx-auto space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>

      <FormField
        label="Email"
        error={errors.email}
        hint="We'll never share your email"
        required
      >
        <Input
          type="email"
          placeholder="m@example.com"
          error={!!errors.email}
        />
      </FormField>

      <FormField
        label="Password"
        error={errors.password}
        required
      >
        <Input
          type="password"
          placeholder="••••••••"
          error={!!errors.password}
        />
      </FormField>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
      >
        Sign in
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <a href="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Sign up
        </a>
      </p>
    </form>
  )
}
```

### Example 3: Navigation System

```tsx
// components/navbar.tsx
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
              A
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Acme Inc
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <UserMenu />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <div className="space-y-1 px-4 py-3">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/products">Products</MobileNavLink>
            <MobileNavLink href="/analytics">Analytics</MobileNavLink>
            <MobileNavLink href="/settings">Settings</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }) {
  const isActive = usePathname() === href

  return (
    <a
      href={href}
      className={cn(
        'relative px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
      )}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
      )}
    </a>
  )
}
```

## Best Practices

### 1. Component Organization

```
styles/
  globals.css       # Tailwind directives, @layer base
  components.css    # @layer components
  utilities.css     # @layer utilities

tailwind.config.js  # Theme configuration
```

### 2. Naming Conventions

```tsx
// Semantic class names for @apply
.btn-primary     // Component classes
.card-elevated   // Component modifiers
.text-balance    // Utility classes

// Avoid overly specific names
.blue-button     // ❌ Too specific
.submit-btn      // ❌ Too specific
.btn             // ✅ Generic, composable
```

### 3. Responsive Design Strategy

```tsx
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  {/* Starts small, grows on larger screens */}
</div>

// Container strategy
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Responsive padding */}
</div>

// Grid strategy
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
  {/* Responsive columns and gaps */}
</div>
```

### 4. Performance Optimization

```js
// tailwind.config.js
module.exports = {
  // Only scan necessary files
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // Safelist classes generated dynamically
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
  ],

  // Or use patterns
  safelist: [
    {
      pattern: /bg-(red|green|blue)-(100|500|900)/,
    },
  ],
}
```

### 5. Dark Mode Best Practices

```tsx
// Always provide both light and dark variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// Use semantic dark mode colors
<div className="bg-gray-50 dark:bg-gray-800">  // ✅ Good contrast
<div className="bg-gray-100 dark:bg-gray-900"> // ✅ Better contrast

// Test readability
<p className="text-gray-600 dark:text-gray-400">  // ✅ Readable in both modes
```

## Common Pitfalls

### 1. Not Using Arbitrary Values When Needed

**❌ Don't:**
```tsx
// Extending config for one-off values
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: { '73': '18.25rem' }  // Only used once
    }
  }
}
```

**✅ Do:**
```tsx
// Use arbitrary values
<div className="w-[18.25rem]">
```

### 2. Overusing @apply

**❌ Don't:**
```css
.my-component {
  @apply flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow;
}
```

**✅ Do:**
```tsx
// Use utilities directly in JSX
<div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
```

### 3. Fighting the System

**❌ Don't:**
```tsx
<div className="w-[237px]">  // Arbitrary specific value
<div className="text-[15.5px]">  // Non-standard size
```

**✅ Do:**
```tsx
<div className="w-60">  // Use spacing scale
<div className="text-base">  // Use typography scale
```

### 4. Not Purging Properly

**❌ Don't:**
```tsx
// Dynamic class names that won't be detected
const colorClass = `bg-${color}-500`  // Will be purged!
```

**✅ Do:**
```tsx
// Full class names
const colorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
}
const colorClass = colorClasses[color]
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI](https://headlessui.com)
- [Tailwind Play (Playground)](https://play.tailwindcss.com)
- [Awesome Tailwind CSS](https://github.com/aniftyco/awesome-tailwindcss)
- [Tailwind CSS IntelliSense (VS Code)](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
