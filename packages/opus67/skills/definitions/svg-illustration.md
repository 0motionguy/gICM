# SVG & Illustration Expert

> **ID:** `svg-illustration`
> **Tier:** 3
> **Token Cost:** 5000
> **MCP Connections:** None

## 🎯 What This Skill Does

Master SVG creation, optimization, and animation for web applications. Build custom illustrations, icon systems, and data visualizations with performant, accessible vector graphics.

- Create custom SVG illustrations from scratch or modify existing ones
- Animate SVGs with CSS, SMIL, and JavaScript/Framer Motion
- Build scalable icon systems with proper accessibility
- Optimize SVGs for web performance
- Create interactive data visualizations
- Build interactive SVG components with React

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** svg, icon, illustration, vector, draw, chart, visualization, animated
- **File Types:** .svg
- **Directories:** assets/icons, assets/illustrations, components/icons

## 🚀 Core Capabilities

### 1. Create Custom SVG Illustrations

Build SVG illustrations using path commands, shapes, and gradients.

**Best Practices:**
- Use a consistent viewBox for scalability
- Group related elements with `<g>` tags
- Name layers and paths meaningfully
- Use relative coordinates for compactness
- Apply transforms instead of absolute positioning
- Keep stroke widths relative to viewBox

**Common Patterns:**

```tsx
// Custom SVG component in React
interface IllustrationProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function HeroIllustration({
  className,
  primaryColor = 'currentColor',
  secondaryColor = '#E5E7EB',
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Developer working on laptop"
    >
      {/* Background shapes */}
      <circle cx="200" cy="150" r="120" fill={secondaryColor} opacity="0.5" />

      {/* Laptop base */}
      <rect
        x="100"
        y="140"
        width="200"
        height="120"
        rx="8"
        fill={primaryColor}
      />

      {/* Screen */}
      <rect
        x="110"
        y="150"
        width="180"
        height="100"
        rx="4"
        fill="white"
      />

      {/* Code lines on screen */}
      <g stroke={primaryColor} strokeWidth="2" strokeLinecap="round">
        <line x1="120" y1="170" x2="180" y2="170" />
        <line x1="120" y1="185" x2="200" y2="185" opacity="0.6" />
        <line x1="130" y1="200" x2="170" y2="200" opacity="0.4" />
        <line x1="130" y1="215" x2="190" y2="215" opacity="0.6" />
        <line x1="120" y1="230" x2="160" y2="230" opacity="0.4" />
      </g>

      {/* Decorative elements */}
      <circle cx="320" cy="80" r="20" fill={primaryColor} opacity="0.2" />
      <circle cx="80" cy="200" r="15" fill={primaryColor} opacity="0.3" />
      <rect
        x="50"
        y="100"
        width="30"
        height="30"
        rx="4"
        fill={primaryColor}
        opacity="0.15"
        transform="rotate(15 65 115)"
      />
    </svg>
  );
}
```

**Path Commands Reference:**

```tsx
// Common SVG path commands
const pathExamples = {
  // Move to (M), Line to (L)
  line: 'M 10 10 L 90 90',

  // Horizontal (H) and Vertical (V) lines
  hvLines: 'M 10 10 H 90 V 90 H 10 Z', // Rectangle

  // Cubic Bezier curve (C)
  curve: 'M 10 80 C 40 10, 65 10, 95 80',

  // Quadratic Bezier (Q)
  quadratic: 'M 10 80 Q 52.5 10, 95 80',

  // Arc (A): rx ry rotation large-arc-flag sweep-flag x y
  arc: 'M 10 80 A 45 45 0 0 1 95 80',

  // Smooth curves (S, T)
  smooth: 'M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80',
};

// Draw a custom shape
export function CustomShape() {
  return (
    <svg viewBox="0 0 100 100">
      <path
        d="M 50 10
           L 90 40
           L 75 90
           L 25 90
           L 10 40
           Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
```

**Gotchas:**
- Always set viewBox for responsive scaling
- Use `fill="currentColor"` for CSS color inheritance
- Close paths with `Z` to avoid rendering issues
- Test SVGs at various sizes for stroke clarity

### 2. Animate SVGs with CSS and JS

Create smooth, performant SVG animations using multiple techniques.

**Best Practices:**
- Prefer CSS transforms for performance
- Use will-change for complex animations
- Animate transform and opacity (GPU-accelerated)
- Avoid animating path data directly (expensive)
- Use SMIL for simple, declarative animations
- Consider Framer Motion for React integration

**Common Patterns:**

```tsx
// CSS-animated SVG with keyframes
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="80 200"
        className="origin-center"
      />
    </svg>
  );
}

// CSS for dash animation
const dashAnimationCSS = `
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -125;
  }
}

.animate-dash {
  animation: dash 1.5s ease-in-out infinite;
}
`;
```

**Framer Motion SVG Animation:**

```tsx
// Animated SVG with Framer Motion
import { motion } from 'framer-motion';

const pathVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: 'easeInOut' },
      opacity: { duration: 0.5 },
    },
  },
};

export function AnimatedCheckmark({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 50 50"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        variants={pathVariants}
      />
      <motion.path
        d="M 15 25 L 22 32 L 35 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={pathVariants}
      />
    </motion.svg>
  );
}
```

**SMIL Animation (Native SVG):**

```tsx
// SMIL animation embedded in SVG
export function PulsingCircle() {
  return (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="20" fill="currentColor">
        <animate
          attributeName="r"
          values="20;25;20"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
```

**Gotchas:**
- SMIL animations don't work in IE/old Edge
- Path morphing requires same number of points
- Heavy animations can impact scroll performance
- Test animations on mobile devices

### 3. Build Icon Systems

Create consistent, accessible icon libraries with proper tooling.

**Best Practices:**
- Use consistent viewBox across all icons
- Implement size and color props
- Add proper ARIA attributes
- Support both inline and sprite usage
- Use TypeScript for icon name autocomplete
- Provide fallback for custom icons

**Common Patterns:**

```tsx
// Icon component with variants
import { cn } from '@/lib/utils';
import { type LucideIcon, icons } from 'lucide-react';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  name: keyof typeof icons;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function Icon({
  name,
  size = 'md',
  className,
  strokeWidth = 2,
  'aria-label': ariaLabel,
}: IconProps) {
  const IconComponent = icons[name] as LucideIcon;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      strokeWidth={strokeWidth}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    />
  );
}
```

**Custom Icon Sprite System:**

```tsx
// SVG sprite component
interface SpriteIconProps {
  id: string;
  size?: number;
  className?: string;
  title?: string;
}

export function SpriteIcon({ id, size = 24, className, title }: SpriteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden={!title}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

// icons.svg sprite file
const spriteExample = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </symbol>
  <symbol id="icon-user" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="5"/>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </symbol>
</svg>
`;
```

**Gotchas:**
- Sprite must be in DOM or linked via absolute URL
- Use symbols, not defs, for sprite icons
- Check icon alignment with text baselines
- Test icons in both light and dark themes

### 4. Optimize SVG for Web

Reduce SVG file size and improve rendering performance.

**Best Practices:**
- Remove editor metadata and comments
- Minimize path precision (2-3 decimal places)
- Use SVGO for automated optimization
- Combine paths where possible
- Remove hidden/unused elements
- Use viewBox instead of width/height

**Common Patterns:**

```typescript
// SVGO configuration
// svgo.config.js
export default {
  multipass: true,
  plugins: [
    'preset-default',
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name', 'class'],
      },
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [{ 'aria-hidden': 'true' }],
      },
    },
    {
      name: 'convertPathData',
      params: {
        floatPrecision: 2,
      },
    },
  ],
};
```

**Manual Optimization Checklist:**

```tsx
// Before optimization
const beforeSVG = `
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="100px" height="100px"
     viewBox="0 0 100 100">
  <!-- Generator: Adobe Illustrator 24.0.0 -->
  <title>icon</title>
  <desc>Created with Illustrator</desc>
  <g id="Layer_1">
    <path fill="#000000" d="M 50.0000 10.0000 L 90.0000 40.0000 L 75.0000 90.0000 L 25.0000 90.0000 L 10.0000 40.0000 Z"/>
  </g>
</svg>
`;

// After optimization
const afterSVG = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <path fill="currentColor" d="M50 10l40 30-15 50H25L10 40z"/>
</svg>
`;

// Optimization results:
// Before: 423 bytes
// After: 89 bytes (79% reduction)
```

**Gotchas:**
- Over-optimization can break gradients/filters
- Test optimized SVGs visually before deploying
- Preserve IDs needed for CSS/JS targeting
- Keep accessibility attributes intact

### 5. Create Data Visualizations

Build charts and graphs with SVG primitives.

**Best Practices:**
- Use semantic grouping for chart elements
- Implement proper scales and axes
- Add tooltips for interactivity
- Make charts accessible with ARIA
- Support responsive sizing
- Handle empty/loading states

**Common Patterns:**

```tsx
// Simple bar chart component
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  barColor = 'currentColor',
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = 100 / data.length;
  const padding = barWidth * 0.2;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      role="img"
      aria-label="Bar chart"
    >
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 20);
        const x = index * barWidth + padding / 2;
        const y = height - barHeight - 10;

        return (
          <g key={item.label} role="listitem">
            <rect
              x={x}
              y={y}
              width={barWidth - padding}
              height={barHeight}
              fill={barColor}
              rx={2}
            />
            <title>{`${item.label}: ${item.value}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
```

**Pie/Donut Chart:**

```tsx
// Donut chart with segments
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className}>
      {data.map((segment) => {
        const percentage = segment.value / total;
        const strokeDasharray = `${percentage * circumference} ${circumference}`;
        const rotation = accumulatedPercentage * 360 - 90;
        accumulatedPercentage += percentage;

        return (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          >
            <title>{`${segment.label}: ${segment.value} (${(percentage * 100).toFixed(1)}%)`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
```

**Gotchas:**
- Use proper aspect ratio for chart accuracy
- Handle zero/negative values gracefully
- Add labels for accessibility
- Test chart readability at small sizes

### 6. Interactive SVG Components

Build interactive SVG elements with hover, click, and drag support.

**Best Practices:**
- Use pointer events for cross-device support
- Implement focus states for keyboard users
- Add appropriate cursor styles
- Use React state for interactivity
- Consider touch targets (44px minimum)
- Provide visual feedback on interaction

**Common Patterns:**

```tsx
// Interactive SVG button
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveStarProps {
  filled?: boolean;
  onToggle?: (filled: boolean) => void;
  size?: number;
  className?: string;
}

export function InteractiveStar({
  filled = false,
  onToggle,
  size = 24,
  className,
}: InteractiveStarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(
        'cursor-pointer transition-transform',
        isHovered && 'scale-110',
        className
      )}
      onClick={() => onToggle?.(!filled)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle?.(!filled);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={filled}
      aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled || isHovered ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-200"
      />
    </svg>
  );
}
```

**Interactive Map Region:**

```tsx
// Clickable SVG map region
interface MapRegionProps {
  path: string;
  name: string;
  value: number;
  onSelect: (name: string) => void;
  isSelected: boolean;
}

export function MapRegion({
  path,
  name,
  value,
  onSelect,
  isSelected,
}: MapRegionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Color based on value intensity
  const getColor = () => {
    if (isSelected) return 'var(--color-primary)';
    if (isHovered) return 'var(--color-primary-light)';
    const opacity = 0.2 + (value / 100) * 0.6;
    return `rgba(var(--color-primary-rgb), ${opacity})`;
  };

  return (
    <path
      d={path}
      fill={getColor()}
      stroke="white"
      strokeWidth="1"
      className="cursor-pointer transition-colors"
      onClick={() => onSelect(name)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${name}: ${value}`}
    />
  );
}
```

**Gotchas:**
- SVG elements need tabIndex for keyboard focus
- Use role="button" for clickable elements
- Test touch targets on mobile devices
- Handle both click and keyboard events

## 💡 Real-World Examples

### Example 1: Animated Hero Illustration

```tsx
// Animated landing page illustration
import { motion } from 'framer-motion';

export function AnimatedHeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full max-w-lg">
      {/* Background blob */}
      <motion.ellipse
        cx="250"
        cy="200"
        rx="180"
        ry="150"
        fill="url(#gradient)"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Floating elements */}
      {[1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          r={10 + i * 5}
          fill="currentColor"
          opacity={0.2}
          initial={{ y: 200 }}
          animate={{ y: [200, 180, 200] }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          cx={100 + i * 120}
        />
      ))}

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
}
```

### Example 2: Rating Stars Component

```tsx
// 5-star rating component
export function StarRating({
  rating,
  onChange,
  readonly = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <InteractiveStar
          key={star}
          filled={star <= rating}
          onToggle={readonly ? undefined : () => onChange?.(star)}
          size={20}
          className={readonly ? 'pointer-events-none' : ''}
        />
      ))}
    </div>
  );
}
```

## 🔗 Related Skills

- `react-grab` - React component patterns
- `stats-grab` - Stats with icons
- `chart-grab` - Data visualization
- `theme-grab` - Color and styling

## 📖 Further Reading

- [MDN SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [SVG Path Syntax](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [SVGO Optimizer](https://github.com/svg/svgo)
- [Framer Motion SVG](https://www.framer.com/motion/component/#svg)
- [Sara Soueidan's Blog](https://www.sarasoueidan.com/tags/svg/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
