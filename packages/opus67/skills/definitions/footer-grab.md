# Footer Grab

> **ID:** `footer-grab`
> **Tier:** 3
> **Token Cost:** 4000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts website footer designs from screenshots and converts them to accessible, responsive React/Next.js components with proper semantic HTML and SEO considerations.

- Footer layout to code with multi-column responsive grids
- Column organization with navigation links and legal pages
- Newsletter signup with validation and API integration
- Social links with proper aria labels and icons

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** footer, grab footer, site footer, bottom navigation
- **File Types:** N/A
- **Directories:** components/layout, components/footer

## 🚀 Core Capabilities

### 1. Footer Layout to Code

Transform multi-column footer designs into responsive, semantic components.

**Best Practices:**
- Use `<footer>` semantic HTML element
- Implement responsive grid that stacks on mobile
- Include skip-to-footer link for accessibility
- Add structured data for organization info
- Keep footer lightweight for performance
- Use CSS Grid for complex layouts

**Common Patterns:**

```typescript
// Main footer component with all sections
import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';
import { SocialLinks } from './social-links';
import { FooterNavigation } from './footer-navigation';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns: FooterColumn[];
  companyInfo: {
    name: string;
    description?: string;
    logo?: string;
  };
  socialLinks: { platform: string; url: string }[];
  showNewsletter?: boolean;
}

export function Footer({
  columns,
  companyInfo,
  socialLinks,
  showNewsletter = true
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto" role="contentinfo">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-4">
              {companyInfo.logo ? (
                <img
                  src={companyInfo.logo}
                  alt={companyInfo.name}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-xl font-bold">{companyInfo.name}</span>
              )}
            </Link>
            {companyInfo.description && (
              <p className="text-muted-foreground text-sm mb-4 max-w-xs">
                {companyInfo.description}
              </p>
            )}
            <SocialLinks links={socialLinks} />
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {columns.map((column) => (
                <FooterNavigation key={column.title} column={column} />
              ))}
            </div>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for updates and exclusive offers.
              </p>
              <NewsletterForm />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} {companyInfo.name}. All rights reserved.</p>
          <nav className="flex gap-4" aria-label="Legal">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

**Responsive Footer Grid:**

```typescript
// Responsive grid variations
export function FooterGrid({ children, variant = 'default' }: FooterGridProps) {
  const gridClasses = {
    default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    wide: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    compact: 'grid-cols-2 md:grid-cols-4',
    asymmetric: 'grid-cols-1 md:grid-cols-12',
  };

  return (
    <div className={cn('grid gap-8', gridClasses[variant])}>
      {children}
    </div>
  );
}

// Asymmetric layout example
<FooterGrid variant="asymmetric">
  <div className="md:col-span-4">{/* Large brand section */}</div>
  <div className="md:col-span-2">{/* Products */}</div>
  <div className="md:col-span-2">{/* Company */}</div>
  <div className="md:col-span-2">{/* Support */}</div>
  <div className="md:col-span-2">{/* Legal */}</div>
</FooterGrid>
```

**Gotchas:**
- Test footer on very small screens (320px width)
- Ensure links are not too close together on mobile
- Check that footer doesn't take excessive vertical space on mobile
- Verify footer stays at bottom on short pages (sticky footer)

### 2. Column Organization

Structured navigation columns with proper hierarchy and link styling.

**Best Practices:**
- Use clear heading hierarchy for sections
- Group related links logically
- Include visual separators between groups
- Add aria-label to navigation sections
- Highlight important links (e.g., careers with badge)

**Common Patterns:**

```typescript
// Footer navigation column component
interface FooterNavigationProps {
  column: {
    title: string;
    links: {
      label: string;
      href: string;
      external?: boolean;
      badge?: string;
    }[];
  };
}

export function FooterNavigation({ column }: FooterNavigationProps) {
  return (
    <nav aria-label={column.title}>
      <h3 className="font-semibold text-sm mb-4">{column.title}</h3>
      <ul className="space-y-3">
        {column.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              {...(link.external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {link.label}
              {link.external && (
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              )}
              {link.badge && (
                <Badge variant="secondary" className="text-xs">
                  {link.badge}
                </Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**Multi-level Footer Navigation:**

```typescript
// Footer with nested navigation groups
interface FooterGroup {
  title: string;
  sections: {
    heading?: string;
    links: FooterLink[];
  }[];
}

export function FooterNavigationGroup({ group }: { group: FooterGroup }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-4">{group.title}</h3>
      <div className="space-y-6">
        {group.sections.map((section, idx) => (
          <div key={idx}>
            {section.heading && (
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {section.heading}
              </h4>
            )}
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Gotchas:**
- Don't overload footer with too many links (cognitive overload)
- Keep link text concise and descriptive
- Consider link priority for mobile layout order
- Test screen reader navigation through footer

### 3. Newsletter Signup

Email capture with client-side validation and server integration.

**Best Practices:**
- Use proper form with `role="form"` and aria-describedby
- Implement client-side email validation
- Show loading state during submission
- Provide clear success/error feedback
- Consider GDPR consent checkbox
- Prevent double submissions

**Common Patterns:**

```typescript
// Newsletter signup form with validation
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Loader2 } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to receive emails',
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { consent: false },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Subscription failed');
      }

      setStatus('success');
      reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">Thanks for subscribing! Check your email to confirm.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="flex-1"
          aria-label="Email address"
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>

      {errors.email && (
        <p id="email-error" className="text-sm text-destructive">
          {errors.email.message}
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <div className="flex items-start gap-2">
        <Checkbox id="consent" {...register('consent')} className="mt-0.5" />
        <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
          I agree to receive marketing emails. You can unsubscribe at any time.
        </label>
      </div>
      {errors.consent && (
        <p className="text-sm text-destructive">{errors.consent.message}</p>
      )}
    </form>
  );
}
```

**Compact Newsletter (No Consent):**

```typescript
// Minimal newsletter for simpler requirements
export function CompactNewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setStatus('loading');
    await fetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setStatus('success');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="pr-24"
        disabled={status === 'loading'}
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2"
        disabled={status === 'loading'}
      >
        {status === 'success' ? '✓' : 'Join'}
      </Button>
    </form>
  );
}
```

**Gotchas:**
- Handle already-subscribed emails gracefully
- Rate limit newsletter API endpoint
- Add honeypot field for bot protection
- Consider double opt-in for compliance
- Track newsletter signups in analytics

### 4. Social Links

Accessible social media links with proper icons and hover effects.

**Best Practices:**
- Use aria-label for icon-only links
- Include all major platforms the brand uses
- Use consistent icon sizing
- Add hover/focus states for visibility
- Open social links in new tab with `rel="noopener noreferrer"`
- Consider adding social platform colors on hover

**Common Patterns:**

```typescript
// Social links component with icons
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const socialIcons: Record<string, LucideIcon> = {
  twitter: Twitter,
  x: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
};

const socialColors: Record<string, string> = {
  twitter: 'hover:text-[#1DA1F2]',
  x: 'hover:text-foreground',
  facebook: 'hover:text-[#4267B2]',
  instagram: 'hover:text-[#E4405F]',
  linkedin: 'hover:text-[#0077B5]',
  youtube: 'hover:text-[#FF0000]',
  github: 'hover:text-foreground',
};

interface SocialLinksProps {
  links: {
    platform: string;
    url: string;
    label?: string;
  }[];
  size?: 'sm' | 'md' | 'lg';
  showColors?: boolean;
}

export function SocialLinks({ links, size = 'md', showColors = false }: SocialLinksProps) {
  const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const buttonSizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

  return (
    <div className="flex items-center gap-2" role="list" aria-label="Social media links">
      {links.map((link) => {
        const Icon = socialIcons[link.platform.toLowerCase()];
        const colorClass = showColors ? socialColors[link.platform.toLowerCase()] : 'hover:text-foreground';

        if (!Icon) return null;

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center justify-center rounded-full border transition-colors',
              'text-muted-foreground hover:bg-muted',
              buttonSizes[size],
              colorClass
            )}
            aria-label={link.label || `Follow us on ${link.platform}`}
            role="listitem"
          >
            <Icon className={iconSizes[size]} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
```

**Social Links with Followers Count:**

```typescript
// Social links showing follower counts
export function SocialLinksWithStats({ links }: { links: SocialLinkWithStats[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {links.map((link) => {
        const Icon = socialIcons[link.platform.toLowerCase()];
        if (!Icon) return null;

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
          >
            <Icon className="h-4 w-4" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">{link.platform}</p>
              <p className="text-sm font-medium">{formatNumber(link.followers)}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
```

**Gotchas:**
- Always include `rel="noopener noreferrer"` for security
- Test focus states for keyboard navigation
- Don't assume which platforms are available (make configurable)
- Consider including platform-specific sharing features
- Handle missing icons gracefully

## 💡 Real-World Examples

### Example 1: SaaS Product Footer

```typescript
// Complete SaaS footer with all sections
const saasFooterData: FooterProps = {
  companyInfo: {
    name: 'Acme SaaS',
    description: 'The leading platform for team productivity and collaboration.',
    logo: '/logo.svg',
  },
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Changelog', href: '/changelog' },
        { label: 'Roadmap', href: '/roadmap' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers', badge: 'Hiring!' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Status', href: 'https://status.acme.com', external: true },
        { label: 'Community', href: '/community' },
        { label: 'Support', href: '/support' },
      ],
    },
  ],
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/acme' },
    { platform: 'GitHub', url: 'https://github.com/acme' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/acme' },
    { platform: 'YouTube', url: 'https://youtube.com/@acme' },
  ],
};

export function SaaSFooter() {
  return <Footer {...saasFooterData} showNewsletter={true} />;
}
```

### Example 2: E-commerce Footer with Trust Badges

```typescript
// E-commerce footer with payments and trust signals
export function EcommerceFooter() {
  return (
    <footer className="bg-muted">
      <div className="container py-12">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* ... columns ... */}
        </div>

        {/* Trust Badges */}
        <div className="border-t pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Secure payments:</span>
              <div className="flex gap-2">
                <img src="/payments/visa.svg" alt="Visa" className="h-6" />
                <img src="/payments/mastercard.svg" alt="Mastercard" className="h-6" />
                <img src="/payments/amex.svg" alt="American Express" className="h-6" />
                <img src="/payments/paypal.svg" alt="PayPal" className="h-6" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img src="/trust/ssl-secure.svg" alt="SSL Secure" className="h-8" />
              <img src="/trust/money-back.svg" alt="30-Day Money Back" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

## 🔗 Related Skills

- `nav-grab` - Header navigation extraction
- `form-grab` - Newsletter form patterns
- `theme-grab` - Consistent styling extraction
- `react-grab` - Base React component patterns

## 📖 Further Reading

- [Footer Design Patterns (Nielsen Norman)](https://www.nngroup.com/articles/footers/)
- [Accessible Footer Guidelines (W3C)](https://www.w3.org/WAI/tutorials/page-structure/footers/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Layout](https://tailwindcss.com/docs/container)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
