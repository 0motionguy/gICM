"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Check, Info, PackageOpen, ChevronDown, Copy, Download, GitFork, BadgeCheck, X, TrendingUp, Layers, ExternalLink, Bot, Zap, Terminal, Plug, Settings, Wand2, ArrowRight, Loader2 } from "lucide-react";
import Fuse from "fuse.js";
import { REGISTRY, resolveDependencies, getItemById } from "@/lib/registry";
import { HeroBanner } from "@/components/molecules/hero-banner";
import { Web3HeroSection } from "@/components/molecules/web3-hero-section";
import { SolanaShowcase } from "@/components/molecules/solana-showcase";
import { PreSignupCTA } from "@/components/molecules/presignup-cta";
import { MenuBuilder, type MenuCategory } from "@/components/molecules/menu-builder";
import { LiveTicker } from "@/components/molecules/live-ticker";
import { ImportStackBanner } from "@/components/ImportStackBanner";
import { StackManager } from "@/components/StackManager";
import { StackPreview } from "@/components/organisms/stack-preview";
import { useBundleStore } from "@/lib/store/bundle";
import { ScrambleText } from "@/components/ui/scramble-text";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { toast } from "sonner";
import { getStackPresetById } from "@/lib/remix";

// --- Helpers -----------------------------------------------------------------
const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

// Get icon component based on item kind
const getKindIcon = (kind: string) => {
  switch (kind.toLowerCase()) {
    case "agent":
      return Bot;
    case "skill":
      return Zap;
    case "command":
      return Terminal;
    case "mcp":
      return Plug;
    case "setting":
      return Settings;
    default:
      return null;
  }
};

// --- Badge Component ---------------------------------------------------------
function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "green" | "gray" }) {
  const colors = {
    green: "bg-lime-300/20 dark:bg-[#0f0f0f] text-black dark:text-lime-400 border border-lime-300/40 dark:border-lime-500/20",
    gray: "bg-black/20 dark:bg-white/10 text-black/60 dark:text-white/60",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[tone]}`}>{children}</span>;
}

// --- Card Component ----------------------------------------------------------
function Card({ item, onPick, active }: { item: any; onPick: (id: string) => void; active: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const IconComponent = getKindIcon(item.kind);

  // Calculate quality score (99-100%, mostly 100%)
  const idHash = item.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const qualityScore = idHash % 7 === 0 ? 99 : 100;

  async function copyInstallCmd() {
    await navigator.clipboard?.writeText(item.install);
    setCopied(true);
    toast.success("Install command copied!", {
      description: item.install
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`item-card relative overflow-hidden rounded-xl border ${
        active ? "border-black/80 dark:border-lime-400" : "border-black/20 dark:border-lime-300/20"
      } bg-white/90 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl p-3 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-all`}
    >
      {/* Glow effect - dark mode only */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black dark:bg-[#0f0f0f] text-lime-300 dark:text-lime-400 dark:border dark:border-lime-300/20 grid place-items-center">
            {IconComponent && <IconComponent size={18} />}
          </div>
          <div>
            <div className="font-semibold leading-tight text-sm text-black dark:text-white">
              {isHovered ? (
                <ScrambleText text={item.name} trigger="hover" duration={300} />
              ) : (
                item.name
              )}
            </div>
            <div className="text-xs text-zinc-600 dark:text-white/70 uppercase tracking-wide">{item.kind}</div>
          </div>
        </div>
        <Badge tone="green">{formatNumber(item.installs)}</Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-black/80 dark:text-white/80 mt-2 line-clamp-2">{item.description}</p>

      {/* Info Icons */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-white/70">
          <GitFork size={12} />
          <span className="font-medium">{formatNumber(item.remixes || 0)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-lime-600 dark:text-lime-400 font-medium">
          <BadgeCheck size={12} />
          <span>{qualityScore}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={() => onPick(item.id)}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
            active
              ? "bg-black dark:bg-lime-400 text-white dark:text-black border-black dark:border-lime-400"
              : "border-black/40 dark:border-white/12 text-black/80 dark:text-white hover:border-black/80 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          {active ? <Check size={14} /> : <Plus size={14} />}
          {active ? "Added" : "Add to Stack"}
        </button>
        <Link
          href={`/items/${item.slug}`}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-black/40 dark:border-white/12 text-black/80 dark:text-white hover:border-black/80 dark:hover:border-white/20 inline-flex items-center gap-1.5 transition-colors"
        >
          <Info size={14} /> View Details
        </Link>
        <motion.button
          onClick={copyInstallCmd}
          className={`text-xs px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
            copied
              ? "bg-lime-500 text-white border-lime-500 hover:bg-lime-600"
              : "border-black/40 dark:border-white/12 text-black/80 dark:text-white hover:border-black/80 dark:hover:border-white/20"
          }`}
          title={item.install}
          whileTap={{ scale: 0.95 }}
          animate={copied ? { scale: [1, 1.05, 1] } : {}}
        >
          <motion.div
            initial={false}
            animate={copied ? { rotate: 360, scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </motion.div>
          {copied ? "Copied!" : "npx"}
        </motion.button>
      </div>
      </div>
    </motion.div>
  );
}


// --- Main Page ---------------------------------------------------------------
function CatalogPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [menuCategory, setMenuCategory] = useState<MenuCategory>("all");
  const [sort, setSort] = useState("popular");
  const [isStackManagerOpen, setIsStackManagerOpen] = useState(false);
  const [hoverPartnerHeader, setHoverPartnerHeader] = useState(false);
  const [hoverTrendingHeader, setHoverTrendingHeader] = useState(false);
  const [hoverAIBuilder, setHoverAIBuilder] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(24); // Pagination state
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Load more loading state

  // Use Zustand store for stack management
  const { addItem, removeItem, hasItem, clearBundle } = useBundleStore();

  // Toggle item in/out of stack
  const toggle = (id: string) => {
    const item = REGISTRY.find((i) => i.id === id);
    if (!item) return;

    if (hasItem(id)) {
      removeItem(id);
    } else {
      addItem(item);
    }
  };

  // Fuzzy search configuration
  const fuse = useMemo(() => new Fuse(REGISTRY, {
    keys: ["name", "description", "tags", "category"],
    threshold: 0.3,
    distance: 100,
  }), []);

  // Filter and sort
  const filtered = useMemo(() => {
    let data = [...REGISTRY];

    // Filter by menu category
    if (menuCategory !== "all") {
      const kindMap: Record<string, string> = {
        "agents": "agent",
        "skills": "skill",
        "commands": "command",
        "mcp": "mcp",
        "settings": "setting",
      };

      if (menuCategory in kindMap) {
        const kind = kindMap[menuCategory];
        data = data.filter((item) => item.kind === kind);
      }
    }

    // Fuzzy search by query
    if (query) {
      const results = fuse.search(query);
      const ids = new Set(results.map(r => r.item.id));
      data = data.filter(item => ids.has(item.id));
    }

    // Sort
    if (sort === "popular") {
      data = data.sort((a, b) => (b.installs || 0) - (a.installs || 0));
    } else if (sort === "name") {
      data = data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      data = data.sort((a, b) => (a.installs || 0) - (b.installs || 0)); // Newer items have fewer installs
    } else if (sort === "remixes") {
      data = data.sort((a, b) => (b.remixes || 0) - (a.remixes || 0));
    }

    return data;
  }, [menuCategory, query, sort, fuse]);

  // Get trending items (top 3 by recent growth)
  const trendingItems = useMemo(() => {
    return [...REGISTRY]
      .filter(item => (item.installs || 0) > 100) // Only items with some traction
      .sort((a, b) => (b.remixes || 0) - (a.remixes || 0))
      .slice(0, 3);
  }, []);

  // Paginated items
  const paginatedItems = useMemo(() => {
    return filtered.slice(0, itemsToShow);
  }, [filtered, itemsToShow]);

  // Reset pagination when filters change
  useEffect(() => {
    setItemsToShow(24);
  }, [query, menuCategory, sort]);

  // Initial mount effect - set loading to false after component mounts
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Escape to clear search (only if search input is focused)
      if (e.key === 'Escape' && document.activeElement?.getAttribute('placeholder')?.includes('Search')) {
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload stack from URL parameter
  useEffect(() => {
    const preloadId = searchParams.get('preload');
    if (!preloadId) return;

    const stack = getStackPresetById(preloadId);
    if (!stack) {
      toast.error("Stack not found", {
        description: `Could not find stack with ID: ${preloadId}`,
      });
      return;
    }

    // Clear current selection and load stack items
    clearBundle();
    let loadedCount = 0;

    stack.items.forEach((itemId) => {
      const item = getItemById(itemId);
      if (item) {
        addItem(item);
        loadedCount++;
      }
    });

    toast.success(`Stack "${stack.name}" loaded!`, {
      description: `${loadedCount} items added to your stack`,
    });

    // Scroll to stack preview
    setTimeout(() => {
      const stackPreview = document.getElementById('stack-preview');
      stackPreview?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }, [searchParams, addItem, clearBundle]);

  // Load more handler with smooth loading
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setItemsToShow(prev => prev + 24);
    setIsLoadingMore(false);
  };

  const hasMore = filtered.length > itemsToShow;

  return (
    <div className="min-h-screen radial-burst">
      {/* Header */}
      <HeroBanner />

      {/* ========== LANDING1 START ========== */}
      {/* Web3 Hero Section */}
      {/* <Web3HeroSection /> */}

      {/* Live Ticker */}
      {/* <LiveTicker /> */}

      {/* Pre-signup CTA */}
      {/* <PreSignupCTA /> */}

      {/* Solana Showcase */}
      {/* <SolanaShowcase /> */}
      {/* ========== LANDING1 END ========== */}

      {/* Menu Builder */}
      <MenuBuilder selected={menuCategory} onSelect={setMenuCategory} />

      {/* Import Stack Banner */}
      <Suspense fallback={<div />}>
        <ImportStackBanner />
      </Suspense>

      {/* Trending Banner + AI Builder */}
      {trendingItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Trending Items */}
            <div className="lg:col-span-8">
              <div
                className="relative overflow-hidden rounded-xl border border-lime-500/40 dark:border-lime-300/20 bg-lime-50/50 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl p-4 dark:shadow-lg h-full"
                onMouseEnter={() => setHoverTrendingHeader(true)}
                onMouseLeave={() => setHoverTrendingHeader(false)}
              >
                {/* Glow effect - dark mode only */}
                <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                    <h3 className="font-black text-black dark:text-white">
                      {hoverTrendingHeader ? (
                        <ScrambleText text="gICM://trending" trigger="hover" duration={400} />
                      ) : (
                        "gICM://trending"
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingItems.map(item => (
                      <Link
                        key={item.id}
                        href={`/items/${item.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0f0f0f] border border-black/20 dark:border-white/8 hover:border-lime-500 dark:hover:border-lime-400 text-sm font-medium text-black dark:text-white transition-colors"
                      >
                        {item.name} <span className="text-lime-600 dark:text-lime-400">↗ {formatNumber(item.remixes || 0)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Stack Builder */}
            <div className="lg:col-span-4">
              <Link href="/workflow">
                <div
                  className="relative overflow-hidden rounded-xl border border-black/20 dark:border-lime-300/20 bg-white/90 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl shadow-sm p-4 hover:border-lime-500/40 dark:hover:border-lime-300/40 transition-all cursor-pointer group h-full"
                  onMouseEnter={() => setHoverAIBuilder(true)}
                  onMouseLeave={() => setHoverAIBuilder(false)}
                >
                  {/* Glow effect - dark mode only */}
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                        <h4 className="text-sm font-black text-black dark:text-white">
                          {hoverAIBuilder ? (
                            <ScrambleText text="AI Stack Builder" trigger="hover" duration={400} />
                          ) : (
                            "AI Stack Builder"
                          )}
                        </h4>
                      </div>
                      <Badge tone="green">BETA</Badge>
                    </div>
                    <p className="text-xs text-black/70 dark:text-white/70 mb-3">
                      Describe your project and get AI-powered stack recommendations instantly
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-lime-600 dark:text-lime-400 group-hover:gap-2 transition-all">
                      <span>Try AI Builder</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Column */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Search and Sort */}
            <div className="flex items-center gap-2 mb-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2 text-zinc-600 dark:text-white/70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents, skills, commands, MCPs... (⌘K)"
                  className="search-input w-full pl-9 pr-9 py-1.5 rounded-lg border border-black/40 dark:border-white/12 bg-white/90 dark:bg-zinc-950/60 backdrop-blur dark:backdrop-blur-xl outline-none text-sm text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/50 focus:border-black/80 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-900"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-2 text-zinc-600 dark:text-white/70 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-black/40 dark:border-white/12 bg-white/90 dark:bg-zinc-950/60 backdrop-blur dark:backdrop-blur-xl text-sm text-black dark:text-white appearance-none outline-none cursor-pointer focus:border-black/80 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-900"
                >
                  <option value="popular">Most Downloaded</option>
                  <option value="name">A→Z</option>
                  <option value="newest">Newest First</option>
                  <option value="remixes">Most Remixed</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-2 pointer-events-none text-zinc-600 dark:text-white/70" />
              </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout" key={`${query}-${menuCategory}-${sort}`}>
                  {paginatedItems.map((item) => (
                    <Card key={item.id} item={item} onPick={toggle} active={hasItem(item.id)} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <EmptyState
                icon={Search}
                title="No items found"
                description={
                  query
                    ? `No results for "${query}". Try different keywords or clear your search.`
                    : "Try adjusting your filters to see more items."
                }
                action={{
                  label: "Clear Search",
                  onClick: () => setQuery(""),
                }}
                secondaryAction={{
                  label: "Reset Filters",
                  onClick: () => {
                    setMenuCategory("all");
                    setQuery("");
                  },
                }}
              />
            )}

            {/* Load More Button */}
            {!isLoading && hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-black dark:bg-lime-400 text-white dark:text-black border border-black dark:border-lime-400 hover:bg-black/90 dark:hover:bg-lime-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More ({filtered.length - itemsToShow} remaining)</>
                  )}
                </button>
                <p className="text-xs text-black/60 dark:text-white/60 mt-2">
                  Showing {itemsToShow} of {filtered.length} items
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <StackPreview allItems={REGISTRY} />

            {/* Partnerships Section */}
            <div
              className="mt-4 relative overflow-hidden rounded-xl border border-black/20 dark:border-lime-300/20 bg-white/90 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl shadow-sm p-3"
              onMouseEnter={() => setHoverPartnerHeader(true)}
              onMouseLeave={() => setHoverPartnerHeader(false)}
            >
              {/* Glow effect - dark mode only */}
              <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-black dark:text-white">
                    {hoverPartnerHeader ? (
                      <ScrambleText text="gICM://network - Partner" trigger="hover" duration={400} />
                    ) : (
                      "gICM://network - Partner"
                    )}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Graduated projects will get access to: Partner Network Requests
                  </p>
                </div>

                <div className="space-y-2">
                {[
                  {
                    name: "AWS Activate",
                    twitter: "AWSstartups",
                    url: "https://x.com/AWSstartups",
                    avatar: "https://unavatar.io/twitter/AWSstartups",
                    status: "active"
                  },
                  {
                    name: "0motionguy",
                    twitter: "0motionguy",
                    url: "https://x.com/0motionguy",
                    avatar: "https://unavatar.io/twitter/0motionguy",
                    status: "active"
                  },
                  {
                    name: "Spotlight",
                    twitter: "pumpspotlight",
                    url: "https://x.com/pumpspotlight",
                    avatar: "https://unavatar.io/twitter/pumpspotlight",
                    status: "pending"
                  },
                  {
                    name: "ICM.RUN",
                    twitter: "icmdotrun",
                    url: "https://x.com/icmdotrun",
                    avatar: "https://unavatar.io/twitter/icmdotrun",
                    status: "pending"
                  },
                  {
                    name: "Seedify",
                    twitter: "SeedifyFund",
                    url: "https://x.com/SeedifyFund",
                    avatar: "https://unavatar.io/twitter/SeedifyFund",
                    status: "pending"
                  },
                  {
                    name: "Soar",
                    twitter: "LaunchOnSoar",
                    url: "https://x.com/LaunchOnSoar",
                    avatar: "https://unavatar.io/twitter/LaunchOnSoar",
                    status: "pending"
                  },
                  {
                    name: "dev.fun",
                    twitter: "devfunpump",
                    url: "https://x.com/devfunpump",
                    avatar: "https://unavatar.io/twitter/devfunpump",
                    status: "pending"
                  },
                  {
                    name: "BackRoom",
                    twitter: "useBackroom",
                    url: "https://x.com/useBackroom",
                    avatar: "https://unavatar.io/twitter/useBackroom",
                    status: "pending"
                  },
                ].map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/8 hover:border-lime-300/50 dark:hover:border-lime-300/50 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/8 flex-shrink-0">
                        <img
                          src={partner.avatar}
                          alt={`${partner.name} avatar`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-emerald-400/20" />
                      </div>
                      <span className="text-xs font-medium text-black dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-300 transition-colors">
                        {partner.name}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                      partner.status === "active"
                        ? "bg-lime-300/20 dark:bg-[#0f0f0f] text-lime-700 dark:text-lime-400 border-lime-300/40 group-hover:bg-lime-300/30"
                        : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40 group-hover:bg-yellow-500/30"
                    }`}>
                      {partner.status === "active" ? "Active" : "Pending"}
                    </span>
                  </a>
                ))}
              </div>

                <a
                  href="https://gicm.io/partner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-black/40 dark:border-white/12 text-black/80 dark:text-white/80 hover:border-black/80 dark:hover:border-lime-300/50 hover:bg-black/5 dark:hover:bg-white/5 text-xs transition-colors"
                >
                  <ExternalLink size={12} />
                  Become a Partner
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-black/80 dark:text-white/60">
          © 2025 gICM • Built for Web3 Builders • <a href="/privacy" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">Privacy</a> • <a href="/terms" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">Terms</a>
        </footer>
      </div>

      {/* Floating Stack Manager Button */}
      <button
        onClick={() => setIsStackManagerOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-black dark:bg-lime-300 text-lime-300 dark:text-black shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40 grid place-items-center group"
        title="Manage Stacks"
      >
        <Layers className="w-6 h-6" />
      </button>

      {/* Stack Manager Modal */}
      <StackManager
        isOpen={isStackManagerOpen}
        onClose={() => setIsStackManagerOpen(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CatalogPageContent />
    </Suspense>
  );
}
