# Stats Grab

> **ID:** `stats-grab`
> **Tier:** 3
> **Token Cost:** 4000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts statistics/metrics sections from screenshots and converts them to animated, responsive React components with number counters, icons, and flexible grid layouts.

- Stats section conversion from designs to responsive grids
- Animated counters with easing and intersection observer
- Icon integration with Lucide, Heroicons, or custom SVGs
- Grid layout variations for different screen sizes

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** stats, metrics, grab stats, numbers, counters, KPIs
- **File Types:** N/A
- **Directories:** components/stats, components/metrics

## 🚀 Core Capabilities

### 1. Stats Section Conversion

Transform statistics sections from designs into responsive, reusable components.

**Best Practices:**
- Use semantic HTML with proper heading hierarchy
- Implement responsive grid that adapts to content count
- Include proper ARIA labels for screen readers
- Support both horizontal and vertical layouts
- Use CSS Grid for consistent spacing
- Handle long numbers and text gracefully

**Common Patterns:**

```typescript
// Stats section component with flexible layout
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsSectionProps {
  title?: string;
  description?: string;
  stats: Stat[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'cards' | 'minimal' | 'bordered';
  className?: string;
}

export function StatsSection({
  title,
  description,
  stats,
  columns = 4,
  variant = 'default',
  className,
}: StatsSectionProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container">
        {(title || description) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn('grid grid-cols-1 gap-8', gridCols[columns])}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, variant }: { stat: Stat; variant: string }) {
  const Icon = stat.icon;

  const cardStyles = {
    default: 'text-center',
    cards: 'bg-card border rounded-lg p-6 text-center shadow-sm',
    minimal: 'text-left',
    bordered: 'border-l-4 border-primary pl-4',
  };

  return (
    <div className={cn(cardStyles[variant as keyof typeof cardStyles])}>
      {Icon && variant === 'cards' && (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="flex items-baseline justify-center gap-1">
        {stat.prefix && (
          <span className="text-2xl font-semibold text-muted-foreground">
            {stat.prefix}
          </span>
        )}
        <span className="text-4xl md:text-5xl font-bold tracking-tight">
          {stat.value}
        </span>
        {stat.suffix && (
          <span className="text-2xl font-semibold text-muted-foreground">
            {stat.suffix}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-muted-foreground">
        {stat.label}
      </p>

      {stat.description && (
        <p className="mt-1 text-xs text-muted-foreground/70">
          {stat.description}
        </p>
      )}

      {stat.trend && (
        <div
          className={cn(
            'mt-2 inline-flex items-center text-sm font-medium',
            stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          <span>{stat.trend.isPositive ? '↑' : '↓'}</span>
          <span className="ml-1">{Math.abs(stat.trend.value)}%</span>
        </div>
      )}
    </div>
  );
}
```

**Responsive Stats Grid:**

```typescript
// Auto-responsive grid based on stat count
interface AutoGridStatsProps {
  stats: Stat[];
}

export function AutoGridStats({ stats }: AutoGridStatsProps) {
  const count = stats.length;

  // Determine optimal grid columns based on count
  const gridClass = cn(
    'grid gap-8',
    count === 1 && 'grid-cols-1 max-w-sm mx-auto',
    count === 2 && 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto',
    count === 3 && 'grid-cols-1 sm:grid-cols-3',
    count === 4 && 'grid-cols-2 lg:grid-cols-4',
    count === 5 && 'grid-cols-2 lg:grid-cols-5',
    count >= 6 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  );

  return (
    <div className={gridClass}>
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} variant="default" />
      ))}
    </div>
  );
}
```

**Gotchas:**
- Test with varying number lengths (1 vs 1,000,000)
- Ensure grid doesn't break with long labels
- Handle RTL layouts for international apps
- Consider using tabular-nums for consistent number spacing

### 2. Animated Counters

Smooth number animations with configurable easing and scroll triggers.

**Best Practices:**
- Use requestAnimationFrame for smooth animations
- Trigger animation on scroll into view with IntersectionObserver
- Support various number formats (decimals, percentages)
- Provide option to disable animation for reduced motion
- Use proper easing functions for natural feel
- Format numbers with locale-aware separators

**Common Patterns:**

```typescript
// Animated counter with intersection observer
import { useState, useEffect, useRef, useCallback } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  easing = 'easeOut',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  };

  const animate = useCallback(() => {
    const startTime = performance.now();
    const easeFn = easingFunctions[easing];

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeFn(progress);
      const currentValue = easedProgress * end;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, easing]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animate();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animate, hasAnimated, end]);

  // Format number with separators
  const formatNumber = (num: number) => {
    return num
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
```

**Counter Hook for Flexibility:**

```typescript
// Custom hook for animated counting
import { useState, useEffect, useRef } from 'react';

interface UseCounterOptions {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCounter({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  enabled = true,
}: UseCounterOptions) {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }

    const startTime = performance.now();
    const range = end - start;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut

      setValue(start + range * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, enabled]);

  return decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
}

// Usage
function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const count = useCounter({ end: 1000, enabled: isVisible });

  return <span ref={observerRef}>{count}</span>;
}
```

**Gotchas:**
- Cancel animation on unmount to prevent memory leaks
- Handle edge cases like end < start (counting down)
- Respect prefers-reduced-motion accessibility preference
- Avoid animating too many counters simultaneously (performance)

### 3. Icon Integration

Seamless icon integration with stats using Lucide, Heroicons, or custom SVGs.

**Best Practices:**
- Use icon component libraries for consistency
- Size icons proportionally to stat values
- Support custom icon colors and backgrounds
- Provide fallbacks for missing icons
- Use semantic icons that match stat context
- Consider icon-only mode for compact displays

**Common Patterns:**

```typescript
// Stats with configurable icons
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Star,
  Clock,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for common stat types
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  revenue: DollarSign,
  growth: TrendingUp,
  products: Package,
  rating: Star,
  time: Clock,
};

interface StatWithIconProps {
  label: string;
  value: string | number;
  icon: LucideIcon | string;
  iconPosition?: 'left' | 'top' | 'background';
  iconColor?: string;
  iconBg?: string;
}

export function StatWithIcon({
  label,
  value,
  icon,
  iconPosition = 'top',
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatWithIconProps) {
  // Resolve icon from string key or use component directly
  const Icon = typeof icon === 'string' ? iconMap[icon] || Users : icon;

  const layouts = {
    left: 'flex items-center gap-4',
    top: 'flex flex-col items-center text-center',
    background: 'relative text-center',
  };

  return (
    <div className={layouts[iconPosition]}>
      {iconPosition === 'background' && (
        <Icon
          className="absolute inset-0 w-full h-full text-muted-foreground/5"
          strokeWidth={0.5}
        />
      )}

      {iconPosition !== 'background' && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            iconPosition === 'left' ? 'w-12 h-12' : 'w-14 h-14 mb-4',
            iconBg
          )}
        >
          <Icon
            className={cn(
              iconPosition === 'left' ? 'h-5 w-5' : 'h-6 w-6',
              iconColor
            )}
          />
        </div>
      )}

      <div className={iconPosition === 'background' ? 'relative z-10' : ''}>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
```

**Icon Color Themes:**

```typescript
// Stats with themed icons
const themes = {
  primary: {
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  success: {
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200',
  },
  warning: {
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200',
  },
  danger: {
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200',
  },
  info: {
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200',
  },
};

interface ThemedStatProps {
  stat: Stat;
  theme?: keyof typeof themes;
}

export function ThemedStat({ stat, theme = 'primary' }: ThemedStatProps) {
  const { iconColor, iconBg, border } = themes[theme];
  const Icon = stat.icon;

  return (
    <div className={cn('p-6 rounded-lg border', border)}>
      {Icon && (
        <div className={cn('inline-flex p-3 rounded-full mb-4', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      )}
      <p className="text-3xl font-bold">{stat.value}</p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}
```

**Gotchas:**
- Ensure icon contrast meets accessibility standards
- Use consistent icon weights throughout the design
- Test icons at various sizes for clarity
- Provide text fallback for icon-only displays

### 4. Grid Layout

Flexible grid systems for different stat display contexts.

**Best Practices:**
- Use CSS Grid for consistent alignment
- Support asymmetric layouts for featured stats
- Handle different stat counts gracefully
- Implement container queries for component-level responsiveness
- Add dividers or separators for visual grouping
- Consider vertical scrolling for many stats on mobile

**Common Patterns:**

```typescript
// Multiple grid layout options
import { cn } from '@/lib/utils';

type GridLayout =
  | 'equal'        // Equal width columns
  | 'featured'     // First stat larger
  | 'split'        // Two columns with vertical stack
  | 'masonry'      // Variable height items
  | 'horizontal';  // Single row with scroll

interface StatsGridProps {
  stats: Stat[];
  layout?: GridLayout;
  className?: string;
}

export function StatsGrid({ stats, layout = 'equal', className }: StatsGridProps) {
  const gridClasses = {
    equal: 'grid grid-cols-2 md:grid-cols-4 gap-6',
    featured: 'grid grid-cols-2 md:grid-cols-4 gap-6',
    split: 'grid grid-cols-1 md:grid-cols-2 gap-8',
    masonry: 'columns-2 md:columns-4 gap-6 space-y-6',
    horizontal: 'flex gap-8 overflow-x-auto pb-4 snap-x',
  };

  if (layout === 'featured' && stats.length > 0) {
    const [featured, ...rest] = stats;
    return (
      <div className={cn('space-y-6', className)}>
        {/* Featured stat */}
        <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center">
          <p className="text-5xl md:text-6xl font-bold">{featured.value}</p>
          <p className="text-lg opacity-90 mt-2">{featured.label}</p>
        </div>

        {/* Rest in grid */}
        <div className="grid grid-cols-3 gap-4">
          {rest.map((stat, i) => (
            <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'split') {
    const half = Math.ceil(stats.length / 2);
    const left = stats.slice(0, half);
    const right = stats.slice(half);

    return (
      <div className={cn(gridClasses.split, className)}>
        <div className="space-y-6">
          {left.map((stat, i) => (
            <StatCard key={i} stat={stat} variant="bordered" />
          ))}
        </div>
        <div className="space-y-6">
          {right.map((stat, i) => (
            <StatCard key={i} stat={stat} variant="bordered" />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div className={cn(gridClasses.horizontal, className)}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-48 text-center p-4 snap-start"
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(gridClasses[layout], className)}>
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} variant="default" />
      ))}
    </div>
  );
}
```

**Stats with Dividers:**

```typescript
// Stats row with dividers
export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-wrap justify-center divide-x divide-border">
      {stats.map((stat, i) => (
        <div key={i} className="px-8 py-4 text-center">
          <p className="text-3xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// Stats with vertical dividers (responsive)
export function ResponsiveStatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
      {stats.map((stat, i) => (
        <div key={i} className="p-6 text-center">
          <p className="text-3xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
```

**Gotchas:**
- Test grid with odd numbers of stats
- Ensure dividers don't break on mobile
- Handle overflow gracefully on small screens
- Consider minimum widths to prevent text wrapping

## 💡 Real-World Examples

### Example 1: SaaS Metrics Dashboard

```typescript
// Dashboard stats section
const dashboardStats: Stat[] = [
  {
    label: 'Total Users',
    value: 12847,
    icon: Users,
    trend: { value: 12, isPositive: true },
  },
  {
    label: 'Monthly Revenue',
    value: 48392,
    prefix: '$',
    icon: DollarSign,
    trend: { value: 8, isPositive: true },
  },
  {
    label: 'Active Projects',
    value: 342,
    icon: FolderOpen,
    trend: { value: 3, isPositive: false },
  },
  {
    label: 'Avg. Response Time',
    value: 1.2,
    suffix: 's',
    icon: Clock,
    trend: { value: 15, isPositive: true },
  },
];

export function DashboardHeader() {
  return (
    <StatsSection
      stats={dashboardStats}
      columns={4}
      variant="cards"
    />
  );
}
```

### Example 2: Landing Page Social Proof

```typescript
// Landing page stats with animation
const socialProofStats = [
  { label: 'Happy Customers', value: 10000, suffix: '+' },
  { label: 'Projects Delivered', value: 5000, suffix: '+' },
  { label: 'Team Members', value: 150 },
  { label: 'Countries', value: 45 },
];

export function SocialProofSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {socialProofStats.map((stat, i) => (
            <div key={i} className="text-center">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                className="text-4xl md:text-5xl font-bold"
                duration={2500}
              />
              <p className="mt-2 text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## 🔗 Related Skills

- `react-grab` - Base React component patterns
- `hero-grab` - Hero sections often include stats
- `card-grab` - Card-based stat displays
- `chart-grab` - Data visualization patterns

## 📖 Further Reading

- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Lucide Icons](https://lucide.dev/) - Icon library
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
