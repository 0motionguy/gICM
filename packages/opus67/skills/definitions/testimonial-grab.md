# Testimonial Grab

> **ID:** `testimonial-grab`
> **Tier:** 3
> **Token Cost:** 4500
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts testimonial/review section designs from screenshots and converts them to animated React components with carousels, avatar handling, quote styling, and star ratings.

- Testimonial section to carousel with smooth navigation
- Avatar handling with fallbacks and loading states
- Quote styling with proper typography and attribution
- Star ratings with interactive and display modes

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** testimonial, review, grab testimonial, quote, customer feedback
- **File Types:** N/A
- **Directories:** components/testimonials, components/reviews

## 🚀 Core Capabilities

### 1. Testimonial Section to Carousel

Transform testimonial sections into accessible, animated carousel components.

**Best Practices:**
- Use Embla Carousel or similar for smooth swiping
- Support keyboard navigation (arrows)
- Implement autoplay with pause on hover
- Add proper ARIA labels for accessibility
- Show navigation dots/arrows as needed
- Handle single testimonial gracefully

**Common Patterns:**

```typescript
// Testimonial carousel with Embla
import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoplay = true,
  autoplayDelay = 5000,
  className,
}: TestimonialCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: true })] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className={cn('py-16', className)} aria-label="Customer testimonials">
      <div className="container">
        <div className="relative">
          {/* Carousel viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === selectedIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Single Testimonial Highlight:**

```typescript
// Featured single testimonial
export function FeaturedTestimonial({ testimonial }: { testimonial: Testimonial }) {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container max-w-4xl text-center">
        <blockquote className="relative">
          {/* Large quote mark */}
          <svg
            className="absolute -top-6 -left-4 w-16 h-16 text-muted-foreground/20"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
          </svg>

          <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
            "{testimonial.content}"
          </p>

          <footer className="flex flex-col items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={testimonial.author.avatar} alt={testimonial.author.name} />
              <AvatarFallback>{getInitials(testimonial.author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <cite className="not-italic font-semibold">{testimonial.author.name}</cite>
              {(testimonial.author.title || testimonial.author.company) && (
                <p className="text-sm text-muted-foreground">
                  {testimonial.author.title}
                  {testimonial.author.title && testimonial.author.company && ', '}
                  {testimonial.author.company}
                </p>
              )}
            </div>
            {testimonial.rating && <StarRating rating={testimonial.rating} readonly />}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
```

**Gotchas:**
- Test carousel on touch devices
- Handle resize events for responsive slides
- Pause autoplay when user interacts
- Add reduced-motion support

### 2. Avatar Handling

Implement robust avatar display with fallbacks and loading states.

**Best Practices:**
- Use next/image for optimized loading
- Show initials as fallback
- Handle loading and error states
- Support various sizes consistently
- Add proper alt text for accessibility
- Consider lazy loading for carousels

**Common Patterns:**

```typescript
// Avatar component with fallback
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initials = fallback || getInitials(alt);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              'object-cover transition-opacity duration-200',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center font-medium text-muted-foreground">
              {initials}
            </span>
          )}
        </>
      ) : (
        <span className="font-medium text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

**Avatar Group for Multiple Reviews:**

```typescript
// Stacked avatar group
interface AvatarGroupProps {
  avatars: { src?: string; alt: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className="flex items-center">
      {displayed.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'relative ring-2 ring-background rounded-full',
            index > 0 && overlapClasses[size]
          )}
          style={{ zIndex: displayed.length - index }}
        >
          <Avatar src={avatar.src} alt={avatar.alt} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted ring-2 ring-background font-medium text-muted-foreground',
            sizeClasses[size],
            overlapClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
```

**Gotchas:**
- Handle CORS issues with external avatar URLs
- Use appropriate image sizes for performance
- Test with missing/broken image URLs
- Consider placeholder blur for loading

### 3. Quote Styling

Create visually appealing quote presentations with proper typography.

**Best Practices:**
- Use proper `<blockquote>` and `<cite>` elements
- Apply appropriate typography (larger, italic, etc.)
- Add decorative quote marks
- Maintain proper text hierarchy
- Support long and short quotes
- Handle multiline quotes gracefully

**Common Patterns:**

```typescript
// Styled quote component
import { cn } from '@/lib/utils';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
  content: string;
  author?: string;
  source?: string;
  variant?: 'default' | 'large' | 'minimal' | 'bordered';
  className?: string;
}

export function QuoteBlock({
  content,
  author,
  source,
  variant = 'default',
  className,
}: QuoteBlockProps) {
  const variants = {
    default: {
      wrapper: 'bg-muted/50 p-6 rounded-lg',
      quote: 'text-lg',
      icon: 'text-primary',
    },
    large: {
      wrapper: 'py-8',
      quote: 'text-2xl md:text-3xl font-medium',
      icon: 'text-muted-foreground/20 w-16 h-16',
    },
    minimal: {
      wrapper: 'pl-4 border-l-4 border-primary',
      quote: 'text-base italic',
      icon: 'hidden',
    },
    bordered: {
      wrapper: 'border rounded-lg p-6',
      quote: 'text-lg',
      icon: 'text-primary',
    },
  };

  const styles = variants[variant];

  return (
    <blockquote className={cn(styles.wrapper, className)}>
      {variant !== 'minimal' && (
        <Quote className={cn('mb-4', styles.icon)} aria-hidden="true" />
      )}

      <p className={cn('leading-relaxed', styles.quote)}>
        {variant !== 'minimal' && '"'}
        {content}
        {variant !== 'minimal' && '"'}
      </p>

      {(author || source) && (
        <footer className="mt-4">
          {author && (
            <cite className="not-italic font-medium block">{author}</cite>
          )}
          {source && (
            <span className="text-sm text-muted-foreground">{source}</span>
          )}
        </footer>
      )}
    </blockquote>
  );
}
```

**Quote with Image:**

```typescript
// Testimonial card with quote styling
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col h-full bg-card border rounded-xl p-6">
      {/* Quote content */}
      <blockquote className="flex-1">
        <p className="text-muted-foreground leading-relaxed">
          "{testimonial.content}"
        </p>
      </blockquote>

      {/* Author info */}
      <footer className="mt-6 pt-6 border-t">
        <div className="flex items-center gap-4">
          <Avatar
            src={testimonial.author.avatar}
            alt={testimonial.author.name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <cite className="not-italic font-semibold block truncate">
              {testimonial.author.name}
            </cite>
            {testimonial.author.title && (
              <p className="text-sm text-muted-foreground truncate">
                {testimonial.author.title}
                {testimonial.author.company && ` at ${testimonial.author.company}`}
              </p>
            )}
          </div>
          {testimonial.rating && (
            <StarRating rating={testimonial.rating} readonly size="sm" />
          )}
        </div>
      </footer>
    </div>
  );
}
```

**Gotchas:**
- Use semantic HTML (blockquote, cite)
- Handle very long quotes with truncation/expand
- Ensure proper contrast for quote marks
- Test with various quote lengths

### 4. Star Ratings

Implement versatile star rating displays with interactive and readonly modes.

**Best Practices:**
- Support half-star ratings
- Make interactive ratings keyboard accessible
- Provide clear hover feedback
- Use proper ARIA for screen readers
- Support different sizes and colors
- Handle edge cases (0, 5, partial ratings)

**Common Patterns:**

```typescript
// Star rating component
import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (readonly) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange?.(value);
    } else if (e.key === 'ArrowRight' && value < maxRating) {
      onChange?.(Math.min(value + 1, maxRating));
    } else if (e.key === 'ArrowLeft' && value > 1) {
      onChange?.(Math.max(value - 1, 1));
    }
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={readonly ? 'img' : 'group'}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const value = index + 1;
        const isFilled = displayRating >= value;
        const isHalfFilled = !isFilled && displayRating >= value - 0.5;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onKeyDown={(e) => handleKeyDown(e, value)}
            disabled={readonly}
            className={cn(
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
              readonly ? 'cursor-default' : 'cursor-pointer'
            )}
            tabIndex={readonly ? -1 : 0}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
          >
            {isHalfFilled ? (
              <StarHalf
                className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')}
              />
            ) : (
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                )}
              />
            )}
          </button>
        );
      })}

      {showValue && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

**Rating Summary Display:**

```typescript
// Rating summary with distribution
interface RatingSummaryProps {
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

export function RatingSummary({ average, total, distribution }: RatingSummaryProps) {
  const maxCount = Math.max(...distribution.map((d) => d.count));

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      {/* Average rating */}
      <div className="text-center sm:text-left">
        <p className="text-5xl font-bold">{average.toFixed(1)}</p>
        <StarRating rating={average} readonly size="md" className="justify-center sm:justify-start mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          Based on {total.toLocaleString()} reviews
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-2">
        {distribution
          .sort((a, b) => b.stars - a.stars)
          .map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-8 text-sm text-muted-foreground">{stars} ★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-12 text-sm text-muted-foreground text-right">
                {count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
```

**Gotchas:**
- Handle fractional ratings properly
- Ensure star icons are consistent sizes
- Test keyboard navigation thoroughly
- Consider color blindness (add text/icons)

## 💡 Real-World Examples

### Example 1: SaaS Testimonials Section

```typescript
// Landing page testimonials
const testimonials: Testimonial[] = [
  {
    id: '1',
    content: 'This tool has completely transformed how our team collaborates. We\'ve seen a 40% increase in productivity since switching.',
    author: {
      name: 'Sarah Chen',
      title: 'VP of Engineering',
      company: 'TechCorp',
      avatar: '/avatars/sarah.jpg',
    },
    rating: 5,
  },
  // ... more testimonials
];

export function SaaSTestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Loved by teams everywhere</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams who have transformed their workflow with our platform.
          </p>
        </div>

        <TestimonialCarousel testimonials={testimonials} />

        {/* Social proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <AvatarGroup
            avatars={testimonials.map((t) => ({
              src: t.author.avatar,
              alt: t.author.name,
            }))}
            max={5}
          />
          <div className="text-center sm:text-left">
            <StarRating rating={4.9} readonly showValue />
            <p className="text-sm text-muted-foreground">
              Trusted by 10,000+ happy customers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Example 2: Product Reviews Grid

```typescript
// E-commerce product reviews
export function ProductReviews({ productId }: { productId: string }) {
  const { reviews, summary } = useProductReviews(productId);

  return (
    <div className="space-y-8">
      <RatingSummary
        average={summary.average}
        total={summary.total}
        distribution={summary.distribution}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {reviews.map((review) => (
          <TestimonialCard
            key={review.id}
            testimonial={{
              id: review.id,
              content: review.content,
              author: {
                name: review.author,
                avatar: review.avatar,
              },
              rating: review.rating,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## 🔗 Related Skills

- `carousel-grab` - Generic carousel patterns
- `card-grab` - Card component patterns
- `stats-grab` - Social proof statistics
- `react-grab` - Base React component patterns

## 📖 Further Reading

- [Embla Carousel](https://www.embla-carousel.com/)
- [shadcn/ui Avatar](https://ui.shadcn.com/docs/components/avatar)
- [Accessible Star Ratings](https://www.w3.org/WAI/tutorials/forms/custom-controls/)
- [CSS Quotation Marks](https://css-tricks.com/quoting-in-html-quotations-citations-and-blockquotes/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
