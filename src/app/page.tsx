"use client";

import { useMemo, useState, Suspense, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Check,
  Info,
  PackageOpen,
  ChevronDown,
  Copy,
  Download,
  GitFork,
  BadgeCheck,
  X,
  TrendingUp,
  Layers,
  ExternalLink,
  Bot,
  Zap,
  Terminal,
  Plug,
  Settings,
  Wand2,
  ArrowRight,
  Loader2,
  Workflow,
  Box,
  Cpu,
  Code2,
  FileCode,
} from "lucide-react";
import { ReactIcon, ComfyUIIcon } from "@/components/ui/icons";
import Fuse from "fuse.js";
import { REGISTRY, resolveDependencies, getItemById } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import { HeroBanner } from "@/components/molecules/hero-banner";
import { Web3HeroSection } from "@/components/molecules/web3-hero-section";
import { SolanaShowcase } from "@/components/molecules/solana-showcase";
import { PreSignupCTA } from "@/components/molecules/presignup-cta";
import {
  MenuBuilder,
  type MenuCategory,
} from "@/components/molecules/menu-builder";
import { LiveTicker } from "@/components/molecules/live-ticker";
import { ImportStackBanner } from "@/components/ImportStackBanner";
import { StackManager } from "@/components/StackManager";
import { StackPreview } from "@/components/organisms/stack-preview";
import { useBundleStore } from "@/lib/store/bundle";
import { ScrambleText } from "@/components/ui/scramble-text";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { toast } from "sonner";
import { getStackPresetById } from "@/lib/remix";
import { formatProductName } from "@/lib/utils";
import { ModelShowcase } from "@/components/molecules/model-showcase";
import { DesignCard } from "@/components/molecules/design-card";
import { DESIGN_ASSETS, UI_COMPONENTS } from "@/lib/registry-design";
import { PREVIEW_COMPONENTS } from "@/components/registry";
import { DesignDetailModal } from "@/components/molecules/design-detail-modal";
import { UIComponentModal } from "@/components/molecules/ui-component-modal";
import type { UIComponent } from "@/types/registry";

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
    case "workflow":
      return Workflow;
    default:
      return null;
  }
};

import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";

const platformIcons: {
  [key: string]: { icon: React.ElementType; color: string };
} = {
  claude: { icon: ClaudeIcon, color: "text-[#D97757]" },
  gemini: { icon: GeminiIcon, color: "text-[#4E82EE]" },
  openai: { icon: OpenAIIcon, color: "text-[#10A37F]" },
};

// --- Card Component ----------------------------------------------------------
const Card = memo(function Card({
  item,
  onPick,
  active,
}: {
  item: RegistryItem;
  onPick: (id: string) => void;
  active: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const IconComponent = getKindIcon(item.kind);

  // Calculate quality score
  const idHash = item.id
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const qualityScore = idHash % 7 === 0 ? 99 : 100;

  // Logic: All text-based agents/skills are inherently universal via the bridge.
  // So we show all 3 icons to signify "Universal Compatibility".
  const showUniversalIcons =
    item.kind === "agent" || item.kind === "skill" || item.kind === "workflow";

  async function copyInstallCmd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard?.writeText(item.install);
    setCopied(true);
    toast.success("Install command copied!", {
      description: item.install,
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassCard
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`item-card relative flex flex-col h-full transition-all duration-300 ${
        active
          ? "border-[#00F0FF]/50 ring-1 ring-[#00F0FF]/20 bg-[#00F0FF]/5"
          : isHovered
            ? "border-blue-500/50 ring-1 ring-blue-500/20 bg-blue-500/5"
            : ""
      }`}
      hoverEffect={true}
      showPlatformFooter={false} // Custom footer logic
    >
      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Header: Icon + Name + Badge */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/[0.08] grid place-items-center text-white flex-shrink-0 shadow-sm">
              {IconComponent && (
                <IconComponent size={24} className="opacity-90" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-base text-white font-display truncate leading-tight mb-1">
                {isHovered ? (
                  <ScrambleText
                    text={formatProductName(item.name)}
                    trigger="hover"
                    duration={400}
                  />
                ) : (
                  formatProductName(item.name)
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  {item.kind}
                </span>
                <span className="text-[10px] text-zinc-500 truncate max-w-[100px] hidden sm:inline-block">
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 flex-grow mb-4">
          {item.description}
        </p>

        {/* Compatibility / Stats Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Platform Icons (The "Big 3" Visual) */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/5">
            {showUniversalIcons ? (
              <>
                <ClaudeIcon className="w-3.5 h-3.5 text-[#D97757]" />
                <div className="w-px h-3 bg-white/10" />
                <GeminiIcon className="w-3.5 h-3.5 text-[#4E82EE]" />
                <div className="w-px h-3 bg-white/10" />
                <OpenAIIcon className="w-3.5 h-3.5 text-[#10A37F]" />
              </>
            ) : (
              // Fallback for specific tools
              <ClaudeIcon className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
            <Download size={12} />
            {formatNumber(item.installs || 0)}
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 mt-auto pt-4 border-t border-white/[0.08]">
          {/* Primary: Add/Remove */}
          <button
            onClick={() => onPick(item.id)}
            className={`h-9 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              active
                ? "bg-[#00F0FF] text-black shadow-[0_0_15px_-5px_rgba(0,240,255,0.5)] hover:bg-[#00F0FF]/90"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {active ? (
              <>
                <Check size={14} strokeWidth={3} /> Added
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={3} /> Add
              </>
            )}
          </button>

          {/* Secondary: Copy Command */}
          <button
            onClick={copyInstallCmd}
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Copy Install Command"
          >
            {copied ? (
              <Check size={14} className="text-[#00F0FF]" />
            ) : (
              <Terminal size={14} />
            )}
          </button>

          {/* Tertiary: Details Link */}
          <Link
            href={`/items/${item.slug}`}
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="View Details"
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
});

// --- UI Component Card --------------------------------------------------------
const UIComponentCard = memo(function UIComponentCard({
  item,
  onClick,
}: {
  item: UIComponent;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const libraryColors: Record<string, string> = {
    "Aceternity UI": "#00F0FF",
    "Magic UI": "#7C3AED",
    gICM: "#00F0FF",
  };
  const libraryColor = libraryColors[item.credit.library] || "#71717A";

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.code.component);
      setCopied(true);
      toast.success("Component code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Get preview using PREVIEW_COMPONENTS map
  const getPreview = () => {
    const PreviewComponent = PREVIEW_COMPONENTS[item.id];
    if (PreviewComponent) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden transform scale-[0.6] origin-center">
          <PreviewComponent />
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-600 text-xs">Preview</div>
      </div>
    );
  };

  return (
    <div
      data-testid="ui-component-card"
      className="group relative rounded-xl border border-[#00F0FF]/30 bg-[#0A0A0B] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#00F0FF]/60 hover:shadow-[0_0_40px_-10px_rgba(0,240,255,0.4)] h-[320px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* HAS CODE Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-[10px] px-2 py-1 rounded-full bg-[#00F0FF]/20 backdrop-blur-sm border border-[#00F0FF]/30 text-[#00F0FF] font-bold flex items-center gap-1">
          <Code2 size={10} /> HAS CODE
        </span>
      </div>

      {/* Credit Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className="text-[10px] px-2 py-1 rounded-full backdrop-blur-sm border"
          style={{
            borderColor: `${libraryColor}40`,
            color: libraryColor,
            backgroundColor: `${libraryColor}10`,
          }}
        >
          {item.credit.library}
        </span>
      </div>

      {/* Preview Area */}
      <div
        data-testid="preview-area"
        className="h-[45%] w-full relative overflow-hidden bg-black/20"
      >
        {getPreview()}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="px-3 py-2 rounded-lg bg-[#00F0FF] text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 p-4 flex flex-col border-t border-[#00F0FF]/10 bg-white/[0.02]">
        <h3 className="text-base font-bold text-white font-display leading-tight">
          {item.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Filename */}
        <div className="mt-3 p-2 rounded-lg bg-black/40 border border-[#00F0FF]/10">
          <div className="flex items-center gap-2">
            <FileCode size={12} className="text-[#00F0FF] flex-shrink-0" />
            <code className="text-[10px] text-[#00F0FF] font-mono truncate flex-1">
              {item.code.filename}
            </code>
            <span className="text-[9px] text-zinc-500">
              {item.code.component.split("\n").length} lines
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#00F0FF]/5 border border-[#00F0FF]/10 text-[#00F0FF]/70"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="text-[9px] text-zinc-600">
              +{item.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// --- Main Page Content -------------------------------------------------------
function CatalogPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [menuCategory, setMenuCategory] = useState<MenuCategory>("all");
  const [platform, setPlatform] = useState<
    "all" | "claude" | "gemini" | "openai"
  >("all");
  const [contentFilter, setContentFilter] = useState<"all" | "react">("all");
  const [sort, setSort] = useState("popular");
  const [isStackManagerOpen, setIsStackManagerOpen] = useState(false);
  const [hoverTrendingHeader, setHoverTrendingHeader] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<RegistryItem | null>(
    null,
  );
  const [selectedUIComponent, setSelectedUIComponent] =
    useState<UIComponent | null>(null);

  const { addItem, removeItem, hasItem, clearBundle } = useBundleStore();

  const toggle = (id: string) => {
    const item = REGISTRY.find((i) => i.id === id);
    if (!item) return;
    hasItem(id) ? removeItem(id) : addItem(item);
  };

  const fuse = useMemo(
    () =>
      new Fuse(REGISTRY, {
        keys: ["name", "description", "tags", "category"],
        threshold: 0.3,
        distance: 100,
      }),
    [],
  );

  const filtered = useMemo(() => {
    let data = [...REGISTRY];

    if (menuCategory !== "all" && menuCategory !== "design") {
      const kindMap: Record<string, string> = {
        agents: "agent",
        skills: "skill",
        commands: "command",
        mcp: "mcp",
        settings: "setting",
        workflows: "workflow",
      };
      if (menuCategory in kindMap)
        data = data.filter((item) => item.kind === kindMap[menuCategory]);
    }

    if (platform !== "all") {
      data = data.filter((item) => {
        const itemPlatforms =
          item.platforms ||
          (item.tags.includes("Gemini") ? ["gemini"] : ["claude"]);
        return itemPlatforms.includes(platform);
      });
    }

    if (contentFilter === "react") {
      data = data.filter((item) =>
        item.tags.some((tag) =>
          ["React", "UI", "Component", "Tailwind", "Frontend"].includes(tag),
        ),
      );
    }

    if (query) {
      const results = fuse.search(query);
      const ids = new Set(results.map((r) => r.item.id));
      data = data.filter((item) => ids.has(item.id));
    }

    if (sort === "popular")
      data = data.sort((a, b) => (b.installs || 0) - (a.installs || 0));
    else if (sort === "name")
      data = data.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "newest")
      data = data.sort((a, b) => (a.installs || 0) - (b.installs || 0));

    return data;
  }, [menuCategory, query, sort, fuse, platform, contentFilter]);

  const trendingItems = useMemo(() => {
    return [...REGISTRY]
      .filter((item) => (item.installs || 0) > 100)
      .slice(0, 3);
  }, []);

  const paginatedItems = useMemo(
    () => filtered.slice(0, itemsToShow),
    [filtered, itemsToShow],
  );

  useEffect(() => {
    setItemsToShow(12);
  }, [query, menuCategory, sort, platform, contentFilter]);
  useEffect(() => {
    setContentFilter("all");
  }, [menuCategory]);
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setItemsToShow((prev) => prev + 12);
    setIsLoadingMore(false);
  };

  return (
    <AuroraBackground className="min-h-screen">
      <HeroBanner />

      <Web3HeroSection />
      <MenuBuilder selected={menuCategory} onSelect={setMenuCategory} />

      {/* Platform Filter - next to category filter */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-4 -mt-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
            {[
              { id: "all", label: "All", icon: null },
              {
                id: "claude",
                label: "Claude",
                icon: ClaudeIcon,
                color: "text-[#D97757]",
              },
              {
                id: "gemini",
                label: "Gemini",
                icon: GeminiIcon,
                color: "text-[#4E82EE]",
              },
              {
                id: "openai",
                label: "OpenAI",
                icon: OpenAIIcon,
                color: "text-[#10A37F]",
              },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  platform === p.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p.icon && (
                  <p.icon
                    className={`w-3.5 h-3.5 ${platform === p.id ? "text-white" : p.color}`}
                  />
                )}
                {p.label}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* React UI Filter - Opens Design Grid */}
            <button
              onClick={() =>
                setMenuCategory(menuCategory === "design" ? "all" : "design")
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                menuCategory === "design"
                  ? "bg-[#61DAFB]/20 text-[#61DAFB] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ReactIcon className="w-3.5 h-3.5" />
              React UI
            </button>

            {/* Comfy UI - Image/Video - Coming Soon */}
            <button
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 cursor-not-allowed flex items-center gap-2 opacity-50"
              title="ComfyUI workflows for image/video generation coming soon"
            >
              <ComfyUIIcon className="w-3.5 h-3.5" />
              Comfy UI - Image/Video
              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
            />
          </div>
        </div>
      </div>

      <div
        id="marketplace-section"
        className="max-w-7xl mx-auto px-6 md:px-10 py-4 pb-8"
      >
        {menuCategory === "design" ? (
          <div className="space-y-8">
            {/* UI Components with Actual Code - Premium Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-white">
                  Components with Full Code
                </span>
                <span className="text-[10px] px-2 py-1 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 font-bold">
                  COPY & PASTE READY
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {UI_COMPONENTS.map((item) => (
                  <UIComponentCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedUIComponent(item)}
                  />
                ))}
              </div>
            </div>

            {/* Regular Design Assets */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-white">
                  External Libraries
                </span>
                <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/10">
                  Links to docs
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DESIGN_ASSETS.map((item) => (
                  <DesignCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedDesign(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Grid */}
            <div className="lg:col-span-9">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedItems.map((item) => (
                      <Card
                        key={item.id}
                        item={item}
                        onPick={toggle}
                        active={hasItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!isLoading && filtered.length > itemsToShow && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium transition-colors"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <StackPreview allItems={REGISTRY} />

              {/* Simplified Trending */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-[#00F0FF]" />
                  <h3 className="text-sm font-bold text-white">Trending Now</h3>
                </div>
                <div className="space-y-2">
                  {trendingItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.slug}`}
                      className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-sm font-medium text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {formatNumber(item.installs || 0)} installs
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModelShowcase />

      <button
        onClick={() => setIsStackManagerOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-[#00F0FF] text-black shadow-[0_0_30px_-10px_rgba(0,240,255,0.6)] hover:scale-110 transition-transform z-40 grid place-items-center"
      >
        <Layers className="w-6 h-6" />
      </button>

      <StackManager
        isOpen={isStackManagerOpen}
        onClose={() => setIsStackManagerOpen(false)}
      />
      <DesignDetailModal
        item={selectedDesign}
        isOpen={!!selectedDesign}
        onClose={() => setSelectedDesign(null)}
      />
      <UIComponentModal
        item={selectedUIComponent}
        isOpen={!!selectedUIComponent}
        onClose={() => setSelectedUIComponent(null)}
      />
    </AuroraBackground>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
      <CatalogPageContent />
    </Suspense>
  );
}
