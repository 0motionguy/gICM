# Sidebar Grab

> **ID:** `sidebar-grab`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** context7

## 🎯 What This Skill Does

Extracts sidebar/side navigation UI patterns from screenshots and converts them to production-ready React components with collapsible sections, active state handling, and mobile drawer support.

- Sidebar navigation screenshot to code with proper structure
- Collapsible menu generation with smooth animations
- Active state handling with route awareness
- Mobile drawer conversion for responsive layouts

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** sidebar, navigation, menu, grab sidebar, side nav, drawer
- **File Types:** N/A
- **Directories:** components/layout, components/sidebar, components/nav

## 🚀 Core Capabilities

### 1. Sidebar Navigation Screenshot to Code

Transform sidebar designs into semantic, accessible navigation components.

**Best Practices:**
- Use semantic `<aside>` and `<nav>` elements
- Implement proper heading hierarchy for sections
- Support both fixed and collapsible sidebar layouts
- Handle overflow with scrollable container
- Use CSS Grid for sidebar + content layouts
- Include resize handle for adjustable width

**Common Patterns:**

```typescript
// Main sidebar layout component
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { useSidebarStore } from '@/stores/sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarLayout({ children, defaultCollapsed = false }: SidebarLayoutProps) {
  const { isCollapsed, setCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed, setMobileOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-muted/30 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <span className="font-semibold text-lg">Dashboard</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!isCollapsed)}
            className="ml-auto"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <SidebarNav collapsed={isCollapsed} />
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          {!isCollapsed && (
            <UserMenu />
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center border-b bg-background px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="ml-4 font-semibold">Dashboard</span>
      </div>

      {/* Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
```

**Sidebar State Management:**

```typescript
// Zustand store for sidebar state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  expandedGroups: string[];
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  toggleGroup: (groupId: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      expandedGroups: ['main'],
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      toggleGroup: (groupId) =>
        set((state) => ({
          expandedGroups: state.expandedGroups.includes(groupId)
            ? state.expandedGroups.filter((id) => id !== groupId)
            : [...state.expandedGroups, groupId],
        })),
    }),
    { name: 'sidebar-state' }
  )
);
```

**Gotchas:**
- Persist collapsed state in localStorage for returning users
- Handle keyboard navigation (Tab, Arrow keys)
- Test sidebar width on various content types
- Consider right-to-left (RTL) layout support

### 2. Collapsible Menu Generation

Create expandable/collapsible menu sections with smooth animations.

**Best Practices:**
- Use Radix Accordion or Collapsible for accessibility
- Animate height changes smoothly
- Show expand/collapse indicators
- Remember expanded state across sessions
- Support nested menu groups
- Handle long menu labels with truncation

**Common Patterns:**

```typescript
// Collapsible sidebar navigation
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarNavProps {
  groups: NavGroup[];
  collapsed?: boolean;
}

export function SidebarNav({ groups, collapsed }: SidebarNavProps) {
  const { expandedGroups, toggleGroup } = useSidebarStore();
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="p-2 space-y-4" aria-label="Sidebar navigation">
        {groups.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <NavItemComponent
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

function NavItemComponent({
  item,
  collapsed,
  pathname,
  expandedGroups,
  toggleGroup,
  depth = 0,
}: {
  item: NavItem;
  collapsed?: boolean;
  pathname: string;
  expandedGroups: string[];
  toggleGroup: (id: string) => void;
  depth?: number;
}) {
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : false;

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedGroups.includes(item.label);

  const Icon = item.icon;

  // Collapsed tooltip wrapper
  const NavContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        collapsed && 'justify-center px-2',
        depth > 0 && 'ml-4'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </>
      )}
    </div>
  );

  // Simple link without children
  if (!hasChildren) {
    if (collapsed) {
      return (
        <li>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={item.href!} aria-current={isActive ? 'page' : undefined}>
                {NavContent}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.label}
              {item.badge && <span className="text-xs">({item.badge})</span>}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return (
      <li>
        <Link href={item.href!} aria-current={isActive ? 'page' : undefined}>
          {NavContent}
        </Link>
      </li>
    );
  }

  // Collapsible group with children
  return (
    <li>
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(item.label)}>
        <CollapsibleTrigger asChild>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-full">{NavContent}</button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <button className="w-full">{NavContent}</button>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.label}
                item={child}
                collapsed={collapsed}
                pathname={pathname}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                depth={depth + 1}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
```

**CSS for Collapsible Animation:**

```css
/* tailwind.config.js keyframes */
@keyframes collapsible-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
}

@keyframes collapsible-up {
  from {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
```

**Gotchas:**
- Handle deeply nested menus carefully (limit depth)
- Provide visual indication of current expanded state
- Consider auto-collapsing other groups on expand
- Test with very long menu labels

### 3. Active State Handling

Implement route-aware active states with visual indicators.

**Best Practices:**
- Match routes including nested paths
- Show visual indicator (background, border, icon color)
- Auto-expand parent group when child is active
- Handle dynamic routes with params
- Support external links differently
- Consider multiple active states (active, selected, focused)

**Common Patterns:**

```typescript
// Active state detection hook
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface NavItem {
  href?: string;
  children?: NavItem[];
}

export function useActiveNavItem(items: NavItem[]) {
  const pathname = usePathname();

  return useMemo(() => {
    function findActiveItem(items: NavItem[], parents: NavItem[] = []): {
      item: NavItem | null;
      parents: NavItem[];
    } {
      for (const item of items) {
        // Check if current item matches
        if (item.href && isActiveRoute(item.href, pathname)) {
          return { item, parents };
        }

        // Check children recursively
        if (item.children) {
          const result = findActiveItem(item.children, [...parents, item]);
          if (result.item) {
            return result;
          }
        }
      }

      return { item: null, parents: [] };
    }

    return findActiveItem(items);
  }, [items, pathname]);
}

function isActiveRoute(href: string, pathname: string): boolean {
  // Exact match for root
  if (href === '/') return pathname === '/';

  // Prefix match for nested routes
  return pathname === href || pathname.startsWith(href + '/');
}

// Auto-expand parents of active item
export function useAutoExpandActiveParents(
  items: NavItem[],
  expandedGroups: string[],
  toggleGroup: (id: string) => void
) {
  const { parents } = useActiveNavItem(items);

  useEffect(() => {
    for (const parent of parents) {
      if (parent.label && !expandedGroups.includes(parent.label)) {
        toggleGroup(parent.label);
      }
    }
  }, [parents, expandedGroups, toggleGroup]);
}
```

**Visual Active State Styling:**

```typescript
// Different active state styles
const activeStyles = {
  // Background highlight
  background: cn(
    isActive
      ? 'bg-primary/10 text-primary'
      : 'hover:bg-muted'
  ),

  // Left border indicator
  border: cn(
    'relative',
    isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r before:bg-primary'
  ),

  // Bold text
  text: cn(
    isActive
      ? 'font-semibold text-foreground'
      : 'font-normal text-muted-foreground'
  ),

  // Icon color change
  icon: cn(
    'h-4 w-4',
    isActive ? 'text-primary' : 'text-muted-foreground'
  ),

  // Combined modern style
  modern: cn(
    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
    isActive
      ? 'bg-accent text-accent-foreground font-medium'
      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
  ),
};
```

**Gotchas:**
- Handle query params and hash in route matching
- Consider partial matches for deeply nested routes
- Update active state on navigation without full refresh
- Test with client-side navigation

### 4. Mobile Drawer Conversion

Convert sidebar to slide-out drawer on mobile devices.

**Best Practices:**
- Use Sheet/Drawer component from UI library
- Support swipe-to-close gesture
- Add overlay to indicate modal behavior
- Lock body scroll when open
- Close on navigation
- Maintain consistent navigation structure

**Common Patterns:**

```typescript
// Mobile sidebar drawer
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function MobileSidebarDrawer({ isOpen, onClose, children }: MobileSidebarDrawerProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="flex h-14 items-center justify-between border-b px-4">
          <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          {children || <SidebarNav collapsed={false} />}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
```

**Responsive Sidebar Hook:**

```typescript
// Hook for responsive sidebar behavior
import { useState, useEffect } from 'react';

export function useResponsiveSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false); // Close drawer when switching to desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    isOpen,
    openSidebar: () => setIsOpen(true),
    closeSidebar: () => setIsOpen(false),
    toggleSidebar: () => setIsOpen((prev) => !prev),
  };
}
```

**Swipe Gesture Support:**

```typescript
// Swipe-to-open sidebar
import { useRef, useEffect } from 'react';

export function useSwipeToOpenSidebar(onOpen: () => void) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only detect swipes starting from left edge
      if (e.touches[0].clientX < 20) {
        touchStartX.current = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      // Swipe right to open (at least 50px)
      if (deltaX > 50) {
        onOpen();
      }

      touchStartX.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onOpen]);
}
```

**Gotchas:**
- Test on actual mobile devices for gesture accuracy
- Handle safe areas for notched phones
- Consider accessibility for users who can't swipe
- Ensure drawer doesn't interfere with scroll

## 💡 Real-World Examples

### Example 1: Admin Dashboard Sidebar

```typescript
// Complete admin sidebar configuration
const adminNavGroups: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'New' },
      { label: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      {
        label: 'Users',
        icon: Users,
        children: [
          { label: 'All Users', href: '/users', icon: Users },
          { label: 'Roles', href: '/users/roles', icon: Shield },
          { label: 'Permissions', href: '/users/permissions', icon: Lock },
        ],
      },
      {
        label: 'Content',
        icon: FileStack,
        children: [
          { label: 'Posts', href: '/content/posts', icon: FileText },
          { label: 'Pages', href: '/content/pages', icon: Layout },
          { label: 'Media', href: '/content/media', icon: Image },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { label: 'General', href: '/settings', icon: Settings },
      { label: 'Integrations', href: '/settings/integrations', icon: Plug },
      { label: 'Billing', href: '/settings/billing', icon: CreditCard },
    ],
  },
];

export function AdminSidebar() {
  return (
    <SidebarLayout>
      <SidebarNav groups={adminNavGroups} />
    </SidebarLayout>
  );
}
```

### Example 2: Documentation Sidebar

```typescript
// Documentation-style sidebar with sections
const docsNavGroups: NavGroup[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs', icon: BookOpen },
      { label: 'Installation', href: '/docs/installation', icon: Download },
      { label: 'Quick Start', href: '/docs/quick-start', icon: Zap },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    items: [
      {
        label: 'UI Components',
        icon: Layers,
        children: [
          { label: 'Button', href: '/docs/components/button', icon: Square },
          { label: 'Input', href: '/docs/components/input', icon: Type },
          { label: 'Card', href: '/docs/components/card', icon: CreditCard },
          { label: 'Dialog', href: '/docs/components/dialog', icon: MessageSquare },
        ],
      },
      {
        label: 'Layout',
        icon: Layout,
        children: [
          { label: 'Container', href: '/docs/layout/container', icon: Box },
          { label: 'Grid', href: '/docs/layout/grid', icon: Grid },
          { label: 'Stack', href: '/docs/layout/stack', icon: Layers },
        ],
      },
    ],
  },
  {
    id: 'api',
    label: 'API Reference',
    items: [
      { label: 'Overview', href: '/docs/api', icon: Code },
      { label: 'Hooks', href: '/docs/api/hooks', icon: Hook },
      { label: 'Utilities', href: '/docs/api/utilities', icon: Wrench },
    ],
  },
];

export function DocsSidebar() {
  return (
    <aside className="w-64 border-r">
      <ScrollArea className="h-screen py-6">
        <SidebarNav groups={docsNavGroups} />
      </ScrollArea>
    </aside>
  );
}
```

### Example 3: Minimal Collapsed Sidebar

```typescript
// Icon-only sidebar for apps with limited space
export function MinimalSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-muted/20 transition-all duration-300',
        expanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md p-3 transition-colors',
                  'hover:bg-accent'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    'transition-opacity duration-300',
                    expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

## 🔗 Related Skills

- `nav-grab` - Header navigation patterns
- `modal-grab` - Sheet/drawer patterns for mobile
- `footer-grab` - Footer navigation patterns
- `react-grab` - Base React component patterns

## 📖 Further Reading

- [Radix Collapsible](https://www.radix-ui.com/docs/primitives/components/collapsible)
- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)
- [Tailwind CSS Sidebar Examples](https://tailwindui.com/components/application-ui/application-shells/sidebar)
- [WAI-ARIA Navigation Landmarks](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
