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
import { generateCollectionSchema, safeJsonLd } from "@/lib/seo/json-ld";

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
      className={`item-card relative flex h-full flex-col transition-all duration-300 ${
        active
          ? "border-[#00F0FF]/50 bg-[#00F0FF]/5 ring-1 ring-[#00F0FF]/20"
          : isHovered
            ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
            : ""
      }`}
      hoverEffect={true}
      showPlatformFooter={false} // Custom footer logic
    >
      <div className="relative z-10 flex h-full flex-col p-5">
        {/* Header: Icon + Name + Badge */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white shadow-sm">
              {IconComponent && (
                <IconComponent size={24} className="opacity-90" />
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-1 truncate font-display text-base font-bold leading-tight text-white">
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
                <span className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {item.kind}
                </span>
                <span className="hidden max-w-[100px] truncate text-[10px] text-zinc-500 sm:inline-block">
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-grow text-sm leading-relaxed text-zinc-400">
          {item.description}
        </p>

        {/* Compatibility / Stats Row */}
        <div className="mb-4 flex items-center justify-between">
          {/* Platform Icons (The "Big 3" Visual) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5">
            {showUniversalIcons ? (
              <>
                <ClaudeIcon className="h-3.5 w-3.5 text-[#D97757]" />
                <div className="h-3 w-px bg-white/10" />
                <GeminiIcon className="h-3.5 w-3.5 text-[#4E82EE]" />
                <div className="h-3 w-px bg-white/10" />
                <OpenAIIcon className="h-3.5 w-3.5 text-[#10A37F]" />
              </>
            ) : (
              // Fallback for specific tools
              <ClaudeIcon className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
            <Download size={12} />
            {formatNumber(item.installs || 0)}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 border-t border-white/[0.08] pt-4">
          {/* Primary: Add/Remove */}
          <button
            onClick={() => onPick(item.id)}
            className={`flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold transition-all ${
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
    ClawdBot: "#00F0FF",
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
        <div className="flex h-full w-full origin-center scale-[0.6] transform items-center justify-center overflow-hidden bg-zinc-950">
          <PreviewComponent />
        </div>
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <div className="text-xs text-zinc-600">Preview</div>
      </div>
    );
  };

  return (
    <div
      data-testid="ui-component-card"
      className="group relative flex h-[320px] cursor-pointer flex-col overflow-hidden rounded-xl border border-[#00F0FF]/30 bg-[#0A0A0B] transition-all duration-300 hover:border-[#00F0FF]/60 hover:shadow-[0_0_40px_-10px_rgba(0,240,255,0.4)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* HAS CODE Badge - Top Left */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/20 px-2 py-1 text-[10px] font-bold text-[#00F0FF] backdrop-blur-sm">
          <Code2 size={10} /> HAS CODE
        </span>
      </div>

      {/* Credit Badge - Top Right */}
      <div className="absolute right-3 top-3 z-10">
        <span
          className="rounded-full border px-2 py-1 text-[10px] backdrop-blur-sm"
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
        className="relative h-[45%] w-full overflow-hidden bg-black/20"
      >
        {getPreview()}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="flex items-center gap-1.5 rounded-lg bg-[#00F0FF] px-3 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex flex-1 flex-col border-t border-[#00F0FF]/10 bg-white/[0.02] p-4">
        <h3 className="font-display text-base font-bold leading-tight text-white">
          {item.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-zinc-400">
          {item.description}
        </p>

        {/* Filename */}
        <div className="mt-3 rounded-lg border border-[#00F0FF]/10 bg-black/40 p-2">
          <div className="flex items-center gap-2">
            <FileCode size={12} className="flex-shrink-0 text-[#00F0FF]" />
            <code className="flex-1 truncate font-mono text-[10px] text-[#00F0FF]">
              {item.code.filename}
            </code>
            <span className="text-[9px] text-zinc-500">
              {item.code.component.split("\n").length} lines
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded border border-[#00F0FF]/10 bg-[#00F0FF]/5 px-1.5 py-0.5 text-[9px] text-[#00F0FF]/70"
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
    null
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
    []
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
          ["React", "UI", "Component", "Tailwind", "Frontend"].includes(tag)
        )
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
    [filtered, itemsToShow]
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

  // Generate CollectionPage schema for homepage
  const collectionSchema = generateCollectionSchema(
    "ClawdBot AI Marketplace",
    "Secure alternative to OpenClaw (ClawdBot). Browse 617+ audited AI agents, skills, and MCP integrations optimized for Claude Code.",
    [
      { name: "AI Agents", url: "https://clawdbot.com/?kind=agent" },
      { name: "Skills", url: "https://clawdbot.com/?kind=skill" },
      { name: "Commands", url: "https://clawdbot.com/?kind=command" },
      { name: "MCP Integrations", url: "https://clawdbot.com/?kind=mcp" },
    ]
  );

  return (
    <AuroraBackground className="min-h-screen">
      {/* CollectionPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />

      <HeroBanner />

      {/* Agent Discovery Banner */}
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl border border-[#00F0FF]/20 bg-gradient-to-r from-[#00F0FF]/5 via-[#7B5CFF]/5 to-[#00F0FF]/5 p-6 backdrop-blur-sm"
        >
          <div className="relative z-10 flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="rounded-full bg-[#00F0FF]/10 p-3">
              <Bot className="h-8 w-8 text-[#00F0FF]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">
                🤖 For Autonomous AI Agents
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Fully compatible with{" "}
                <span className="font-semibold text-[#00F0FF]">Moltbook</span>{" "}
                (1.5M+ AI agents) and claude-marketplace-v1 protocol.
                <span className="ml-1 text-zinc-500">
                  617+ security-verified components ready for programmatic
                  installation.
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/.well-known/claude-marketplace.json"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-2 text-sm font-medium text-[#00F0FF] transition-all hover:scale-105 hover:bg-[#00F0FF]/20"
              >
                <ExternalLink size={14} />
                API Endpoint
              </a>
              <Link
                href="/docs/AGENT-DISCOVERY.md"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-white/10"
              >
                <FileCode size={14} />
                Docs
              </Link>
            </div>
          </div>
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#00F0FF]/10 via-transparent to-[#7B5CFF]/10" />
          </div>
        </motion.div>
      </div>

      <Web3HeroSection />
      <MenuBuilder selected={menuCategory} onSelect={setMenuCategory} />

      {/* Platform Filter - next to category filter */}
      <div className="mx-auto -mt-2 max-w-7xl px-6 pb-4 md:px-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1 backdrop-blur-sm">
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
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  platform === p.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p.icon && (
                  <p.icon
                    className={`h-3.5 w-3.5 ${platform === p.id ? "text-white" : p.color}`}
                  />
                )}
                {p.label}
              </button>
            ))}

            {/* Separator */}
            <div className="mx-1 h-6 w-px bg-white/10" />

            {/* React UI Filter - Opens Design Grid */}
            <button
              onClick={() =>
                setMenuCategory(menuCategory === "design" ? "all" : "design")
              }
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                menuCategory === "design"
                  ? "bg-[#61DAFB]/20 text-[#61DAFB] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ReactIcon className="h-3.5 w-3.5" />
              React UI
            </button>

            {/* Comfy UI - Image/Video - Coming Soon */}
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 opacity-50"
              title="ComfyUI workflows for image/video generation coming soon"
            >
              <ComfyUIIcon className="h-3.5 w-3.5" />
              Comfy UI - Image/Video
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">
                Soon
              </span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
        </div>
      </div>

      <div
        id="marketplace-section"
        className="mx-auto max-w-7xl px-6 py-4 pb-8 md:px-10"
      >
        {menuCategory === "design" ? (
          <div className="space-y-8">
            {/* UI Components with Actual Code - Premium Section */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  Components with Full Code
                </span>
                <span className="rounded border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-2 py-1 text-[10px] font-bold text-[#00F0FF]">
                  COPY & PASTE READY
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="mb-4 flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  External Libraries
                </span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-400">
                  Links to docs
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main Grid */}
            <div className="lg:col-span-9">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
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
                    className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-3">
              <StackPreview allItems={REGISTRY} />

              {/* Simplified Trending */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#00F0FF]" />
                  <h3 className="text-sm font-bold text-white">Trending Now</h3>
                </div>
                <div className="space-y-2">
                  {trendingItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.slug}`}
                      className="block rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <div className="truncate text-sm font-medium text-white">
                        {item.name}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
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
        className="fixed bottom-8 right-8 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#00F0FF] text-black shadow-[0_0_30px_-10px_rgba(0,240,255,0.6)] transition-transform hover:scale-110"
      >
        <Layers className="h-6 w-6" />
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
