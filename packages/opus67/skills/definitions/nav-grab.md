# Navigation Grab

> **ID:** `nav-grab`
> **Tier:** 2
> **Token Cost:** 5000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts header/navigation UI patterns from screenshots and converts them to fully responsive React/Next.js navigation components with mobile menus, dropdowns, and mega menu support.

- Header navigation to responsive nav with breakpoint handling
- Dropdown menus with proper accessibility and animations
- Mobile hamburger menu with slide-out drawer
- Mega menu support for complex navigation structures

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** nav, header, navbar, grab nav, navigation, menu, top bar
- **File Types:** N/A
- **Directories:** components/layout, components/nav, components/header

## 🚀 Core Capabilities

### 1. Header Navigation to Responsive Nav

Transform header designs into responsive navigation with proper breakpoints and mobile handling.

**Best Practices:**
- Use semantic `<header>` and `<nav>` elements
- Implement skip-to-main-content link for accessibility
- Handle scroll behavior (hide/show, shrink, blur background)
- Use CSS Grid or Flexbox for layout
- Lazy-load mobile menu component
- Support RTL layouts

**Common Patterns:**

```typescript
// Main header with responsive navigation
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { DesktopNav } from './desktop-nav';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface HeaderProps {
  logo: React.ReactNode;
  items: NavItem[];
  cta?: {
    label: string;
    href: string;
  };
}

export function Header({ logo, items, cta }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {logo}
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav items={items} className="hidden lg:flex" />

            {/* CTA and Mobile Toggle */}
            <div className="flex items-center gap-4">
              {cta && (
                <Button asChild className="hidden sm:inline-flex">
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        items={items}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cta={cta}
      />

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
```

**Desktop Navigation Component:**

```typescript
// Desktop navigation with active states
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavDropdown } from './nav-dropdown';

interface DesktopNavProps {
  items: NavItem[];
  className?: string;
}

export function DesktopNav({ items, className }: DesktopNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn('items-center gap-1', className)} aria-label="Main navigation">
      {items.map((item) =>
        item.children ? (
          <NavDropdown key={item.label} item={item} />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive(item.href)
                ? 'text-foreground bg-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
```

**Gotchas:**
- Test header on multiple screen sizes, especially around breakpoints
- Ensure header doesn't cover content when focused with keyboard
- Handle long navigation labels gracefully
- Consider sticky vs fixed positioning for performance

### 2. Dropdown Menus

Accessible dropdown menus with proper keyboard navigation and animations.

**Best Practices:**
- Use Radix NavigationMenu for complex dropdowns
- Support keyboard navigation (arrows, Enter, Escape)
- Add proper ARIA attributes
- Implement hover intent delay
- Show visual indicator for items with dropdowns
- Close on click outside

**Common Patterns:**

```typescript
// Navigation dropdown using Radix
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface NavDropdownProps {
  item: {
    label: string;
    children: { label: string; href: string; description?: string }[];
  };
}

export function NavDropdown({ item }: NavDropdownProps) {
  return (
    <NavigationMenuPrimitive.Root className="relative">
      <NavigationMenuPrimitive.List>
        <NavigationMenuPrimitive.Item>
          <NavigationMenuPrimitive.Trigger
            className={cn(
              'group inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'data-[state=open]:bg-accent data-[state=open]:text-foreground'
            )}
          >
            {item.label}
            <ChevronDown
              className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </NavigationMenuPrimitive.Trigger>

          <NavigationMenuPrimitive.Content
            className={cn(
              'absolute top-full left-0 mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
            )}
          >
            <ul className="grid gap-1">
              {item.children.map((child) => (
                <li key={child.href}>
                  <NavigationMenuPrimitive.Link asChild>
                    <Link
                      href={child.href}
                      className={cn(
                        'block rounded-md p-3 transition-colors',
                        'hover:bg-accent focus:bg-accent focus:outline-none'
                      )}
                    >
                      <span className="font-medium">{child.label}</span>
                      {child.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {child.description}
                        </p>
                      )}
                    </Link>
                  </NavigationMenuPrimitive.Link>
                </li>
              ))}
            </ul>
          </NavigationMenuPrimitive.Content>
        </NavigationMenuPrimitive.Item>
      </NavigationMenuPrimitive.List>
    </NavigationMenuPrimitive.Root>
  );
}
```

**Simple Hover Dropdown:**

```typescript
// Simpler hover-based dropdown
import { useState, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export function HoverDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md',
          'text-muted-foreground hover:text-foreground',
          isOpen && 'text-foreground bg-accent'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {item.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Gotchas:**
- Implement hover delay to prevent accidental triggers
- Handle touch devices differently (tap to open)
- Close dropdown when clicking a link inside it
- Don't make dropdown too tall (scroll or paginate)

### 3. Mobile Hamburger Menu

Full-screen or slide-out mobile navigation with touch gestures.

**Best Practices:**
- Use Sheet/Drawer pattern for slide-out menu
- Animate hamburger icon to X transformation
- Support swipe-to-close gesture
- Show nested items with accordion or drill-down
- Maintain focus within open menu
- Lock body scroll when open

**Common Patterns:**

```typescript
// Mobile navigation drawer
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  cta?: { label: string; href: string };
}

export function MobileNav({ items, isOpen, onClose, cta }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-8" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {items.map((item) =>
              item.children ? (
                <MobileNavAccordion key={item.label} item={item} onNavigate={onClose} />
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center h-12 px-4 text-sm font-medium rounded-md hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        {cta && (
          <div className="absolute bottom-8 left-6 right-6">
            <Button asChild className="w-full">
              <Link href={cta.href} onClick={onClose}>
                {cta.label}
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MobileNavAccordion({
  item,
  onNavigate
}: {
  item: NavItem;
  onNavigate: () => void
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={item.label} className="border-none">
        <AccordionTrigger className="h-12 px-4 text-sm font-medium hover:bg-accent rounded-md hover:no-underline">
          {item.label}
        </AccordionTrigger>
        <AccordionContent>
          <ul className="pl-4 space-y-1">
            {item.children?.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className="flex items-center h-10 px-4 text-sm rounded-md hover:bg-accent text-muted-foreground"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

**Animated Hamburger Icon:**

```typescript
// Animated hamburger to X icon
import { cn } from '@/lib/utils';

interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

export function HamburgerIcon({ isOpen, className }: HamburgerIconProps) {
  return (
    <div className={cn('relative w-5 h-4', className)}>
      <span
        className={cn(
          'absolute left-0 w-full h-0.5 bg-current transition-all duration-200',
          isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-current transition-opacity duration-200',
          isOpen && 'opacity-0'
        )}
      />
      <span
        className={cn(
          'absolute left-0 w-full h-0.5 bg-current transition-all duration-200',
          isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
        )}
      />
    </div>
  );
}
```

**Gotchas:**
- Test touch/swipe gestures on actual mobile devices
- Handle orientation changes properly
- Consider safe areas for notched devices
- Don't make menu items too small to tap (44px min)

### 4. Mega Menu Support

Complex navigation with multiple columns and featured content.

**Best Practices:**
- Use CSS Grid for multi-column layouts
- Include featured items or promotions
- Group related links with headings
- Add icons for visual hierarchy
- Support keyboard navigation between columns
- Consider viewport width constraints

**Common Patterns:**

```typescript
// Mega menu component
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface MegaMenuItem {
  label: string;
  columns: {
    heading?: string;
    links: { label: string; href: string; icon?: React.ReactNode }[];
  }[];
  featured?: {
    title: string;
    description: string;
    href: string;
    image: string;
  };
}

export function MegaMenu({ item }: { item: MegaMenuItem }) {
  return (
    <NavigationMenuPrimitive.Root className="relative">
      <NavigationMenuPrimitive.List>
        <NavigationMenuPrimitive.Item>
          <NavigationMenuPrimitive.Trigger
            className={cn(
              'group inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'data-[state=open]:bg-accent data-[state=open]:text-foreground'
            )}
          >
            {item.label}
            <ChevronDown
              className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </NavigationMenuPrimitive.Trigger>

          <NavigationMenuPrimitive.Content
            className={cn(
              'absolute top-full left-1/2 -translate-x-1/2 mt-2',
              'w-screen max-w-4xl rounded-lg border bg-popover p-6 shadow-xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
            )}
          >
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Navigation Columns */}
              <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {item.columns.map((column, idx) => (
                  <div key={idx}>
                    {column.heading && (
                      <h3 className="font-semibold text-sm mb-3 text-foreground">
                        {column.heading}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuPrimitive.Link asChild>
                            <Link
                              href={link.href}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {link.icon}
                              {link.label}
                            </Link>
                          </NavigationMenuPrimitive.Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Featured Content */}
              {item.featured && (
                <div className="lg:col-span-1">
                  <NavigationMenuPrimitive.Link asChild>
                    <Link
                      href={item.featured.href}
                      className="block rounded-lg overflow-hidden group"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={item.featured.image}
                          alt=""
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 bg-accent/50">
                        <h4 className="font-medium text-sm">{item.featured.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.featured.description}
                        </p>
                      </div>
                    </Link>
                  </NavigationMenuPrimitive.Link>
                </div>
              )}
            </div>
          </NavigationMenuPrimitive.Content>
        </NavigationMenuPrimitive.Item>
      </NavigationMenuPrimitive.List>
    </NavigationMenuPrimitive.Root>
  );
}
```

**Full-width Mega Menu:**

```typescript
// Full-width mega menu that spans viewport
export function FullWidthMegaMenu({ item }: { item: MegaMenuItem }) {
  return (
    <NavigationMenuPrimitive.Root>
      <NavigationMenuPrimitive.List>
        <NavigationMenuPrimitive.Item>
          <NavigationMenuPrimitive.Trigger className="...">
            {item.label}
          </NavigationMenuPrimitive.Trigger>

          <NavigationMenuPrimitive.Content
            className="fixed left-0 right-0 top-16 w-full border-b bg-background shadow-lg"
          >
            <div className="container py-8">
              <div className="grid grid-cols-4 gap-8">
                {/* Columns here */}
              </div>
            </div>
          </NavigationMenuPrimitive.Content>
        </NavigationMenuPrimitive.Item>
      </NavigationMenuPrimitive.List>

      {/* Viewport for animations */}
      <NavigationMenuPrimitive.Viewport className="fixed top-16 left-0 right-0" />
    </NavigationMenuPrimitive.Root>
  );
}
```

**Gotchas:**
- Don't make mega menus too complex (cognitive overload)
- Ensure mega menu doesn't exceed viewport height
- Test with screen readers for proper announcement
- Consider lazy loading mega menu content
- Handle edge cases when menu would overflow screen

## 💡 Real-World Examples

### Example 1: SaaS Header Navigation

```typescript
// Complete SaaS header with all navigation types
const navItems: NavItem[] = [
  {
    label: 'Product',
    children: [
      { label: 'Features', href: '/features', description: 'Explore all features' },
      { label: 'Pricing', href: '/pricing', description: 'Simple, transparent pricing' },
      { label: 'Integrations', href: '/integrations', description: '100+ integrations' },
      { label: 'Changelog', href: '/changelog', description: 'Latest updates' },
    ],
  },
  {
    label: 'Solutions',
    children: [
      { label: 'For Startups', href: '/solutions/startups' },
      { label: 'For Enterprise', href: '/solutions/enterprise' },
      { label: 'For Agencies', href: '/solutions/agencies' },
    ],
  },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
];

export function SaaSHeader() {
  return (
    <Header
      logo={<Logo />}
      items={navItems}
      cta={{ label: 'Get Started', href: '/signup' }}
    />
  );
}
```

### Example 2: E-commerce Mega Menu

```typescript
// E-commerce header with product categories
const categoryMegaMenu: MegaMenuItem = {
  label: 'Shop',
  columns: [
    {
      heading: "Women's",
      links: [
        { label: 'Dresses', href: '/women/dresses' },
        { label: 'Tops', href: '/women/tops' },
        { label: 'Bottoms', href: '/women/bottoms' },
        { label: 'Accessories', href: '/women/accessories' },
      ],
    },
    {
      heading: "Men's",
      links: [
        { label: 'Shirts', href: '/men/shirts' },
        { label: 'Pants', href: '/men/pants' },
        { label: 'Outerwear', href: '/men/outerwear' },
        { label: 'Accessories', href: '/men/accessories' },
      ],
    },
    {
      heading: 'Collections',
      links: [
        { label: 'New Arrivals', href: '/collections/new' },
        { label: 'Best Sellers', href: '/collections/best-sellers' },
        { label: 'Sale', href: '/collections/sale' },
      ],
    },
  ],
  featured: {
    title: 'Summer Collection',
    description: 'Shop the latest summer styles',
    href: '/collections/summer',
    image: '/collections/summer-hero.jpg',
  },
};

export function EcommerceHeader() {
  return (
    <header className="border-b">
      <div className="container flex items-center h-16">
        <Logo />
        <MegaMenu item={categoryMegaMenu} />
        {/* Cart, Search, Account */}
      </div>
    </header>
  );
}
```

## 🔗 Related Skills

- `footer-grab` - Footer navigation patterns
- `sidebar-grab` - Sidebar navigation patterns
- `modal-grab` - Modal/sheet patterns for mobile
- `react-grab` - Base React component patterns

## 📖 Further Reading

- [Radix NavigationMenu](https://www.radix-ui.com/docs/primitives/components/navigation-menu)
- [WAI-ARIA Navigation Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [shadcn/ui Navigation Menu](https://ui.shadcn.com/docs/components/navigation-menu)
- [Tailwind CSS Header Examples](https://tailwindui.com/components/application-ui/navigation/navbars)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
