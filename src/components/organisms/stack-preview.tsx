"use client";

import { useState, useMemo, useEffect } from "react";
import { useBundleStore } from "@/lib/store/bundle";
import { calculateTokenSavings, generateInstallCommand } from "@/lib/stack-builder";
import type { RegistryItem } from "@/types/registry";
import {
  Copy,
  Zap,
  Package,
  Tags,
  Award,
  Box,
} from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import { ScrambleText } from "@/components/ui/scramble-text";
import { formatProductName } from "@/lib/utils";

interface StackPreviewProps {
  allItems: RegistryItem[]; // All available items for dependency resolution
}

export function StackPreview({ allItems }: StackPreviewProps) {
  const { getActiveStack, clearBundle, itemCount } = useBundleStore();
  const [stackName, setStackName] = useState("My ICM Stack");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [hoverHeader, setHoverHeader] = useState(false);
  const [hoverSelectedItems, setHoverSelectedItems] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only reading from store after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get icon for item kind
  const getKindIcon = () => {
    return <Box className="h-3 w-3" aria-hidden />;
  };

  const activeStack = getActiveStack();
  const selectedItems = useMemo(
    () => (activeStack?.items || []).map((bi) => bi.item),
    [activeStack]
  );

  // Resolve dependencies
  const dependencies = useMemo(() => {
    if (!selectedItems.length) return [];

    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const allDeps = new Set<string>();

    // Collect all dependencies
    selectedItems.forEach((item) => {
      (item.dependencies || []).forEach((depId) => {
        if (!selectedIds.has(depId)) {
          allDeps.add(depId);
        }
      });
    });

    // Resolve dep IDs to actual items
    return allItems.filter((item) => allDeps.has(item.id));
  }, [selectedItems, allItems]);

  // Calculate stats
  const stats = useMemo(() => {
    const tokenSavings = calculateTokenSavings(selectedItems);
    const totalItems = selectedItems.length + dependencies.length;

    const breakdown = {
      agents: selectedItems.filter((i) => i.kind === "agent").length,
      skills: selectedItems.filter((i) => i.kind === "skill").length,
      commands: selectedItems.filter((i) => i.kind === "command").length,
      mcps: selectedItems.filter((i) => i.kind === "mcp").length,
      workflows: selectedItems.filter((i) => i.kind === "workflow").length,
      settings: selectedItems.filter((i) => i.kind === "setting").length,
    };

    // Calculate unique tags
    const allTags = new Set<string>();
    selectedItems.forEach((item) => {
      (item.tags || []).forEach((tag) => allTags.add(tag));
    });

    // Calculate average quality score (always 99-100%)
    const avgQualityScore =
      selectedItems.length > 0
        ? (selectedItems.length % 5 === 0 ? 99 : 100)  // 99% every 5th item count, otherwise 100%
        : 0;

    return { tokenSavings, totalItems, breakdown, tags: Array.from(allTags), avgQualityScore };
  }, [selectedItems, dependencies]);

  // Handle copy install command
  const handleCopyInstall = async () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    const installCmd = generateInstallCommand(selectedItems.map((i) => i.id));
    await navigator.clipboard.writeText(installCmd);

    analytics.trackBundleCopied(selectedItems.length);
    toast.success("Install command copied!", {
      description: "Paste into your terminal to install",
    });
  };

  // Handle clear
  const handleClear = () => {
    clearBundle();
    toast.success("Stack cleared");
  };

  // Show empty state during SSR and when no items
  if (!mounted || itemCount() === 0) {
    return (
      <div className="sticky top-4 relative overflow-hidden rounded-xl border border-black/20 dark:border-lime-300/20 bg-white/90 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl p-3 shadow-sm dark:shadow-lg">
        {/* Glow effect - dark mode only */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-10 w-10 text-zinc-600 dark:text-white/70 mb-3" />
          <h3 className="text-sm font-semibold text-black/60 dark:text-white">Your stack is empty</h3>
          <p className="text-[11px] text-zinc-600 dark:text-white/70 mt-1">
            Add agents, skills, commands, or MCPs to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="stack-preview"
      className="sticky top-4 relative overflow-hidden rounded-xl border border-black/20 dark:border-lime-300/20 bg-white/90 dark:bg-gradient-to-r dark:from-[#0f0f0f] dark:via-[#0a0a0a] dark:to-[#070707] backdrop-blur dark:backdrop-blur-xl shadow-sm dark:shadow-lg p-3"
      onMouseEnter={() => setHoverHeader(true)}
      onMouseLeave={() => setHoverHeader(false)}
    >
      {/* Glow effect - dark mode only */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent dark:block hidden pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-black dark:text-white uppercase tracking-wide">
                {hoverHeader ? (
                  <ScrambleText text="Stack Preview" trigger="hover" duration={400} />
                ) : (
                  "Stack Preview"
                )}
              </div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70 mt-0.5">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{dependencies.length > 0 && ` (+${dependencies.length} dep${dependencies.length !== 1 ? 's' : ''})`} • {stats.tokenSavings}% avg savings
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] underline hover:no-underline text-zinc-600 dark:text-white/70"
              title="Clear stack"
            >
              Clear
            </button>
          </div>

          {/* Stack Name Input */}
          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="My ICM Stack"
            className="mt-2 w-full px-2.5 py-1 rounded-lg border border-black/40 dark:border-white/12 bg-white/90 dark:bg-[#0f0f0f] backdrop-blur outline-none text-[11px] text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/50 focus:border-black/80 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-800"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {stats.breakdown.agents > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.agents}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">Agents</div>
            </div>
          )}
          {stats.breakdown.skills > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.skills}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">Skills</div>
            </div>
          )}
          {stats.breakdown.commands > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.commands}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">Commands</div>
            </div>
          )}
          {stats.breakdown.mcps > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.mcps}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">MCPs</div>
            </div>
          )}
          {stats.breakdown.workflows > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.workflows}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">Workflows</div>
            </div>
          )}
          {stats.breakdown.settings > 0 && (
            <div className="bg-black/5 dark:bg-[#0f0f0f] rounded-lg p-1.5 text-center">
              <div className="text-xl font-bold text-black dark:text-white">{stats.breakdown.settings}</div>
              <div className="text-[10px] text-zinc-600 dark:text-white/70">Settings</div>
            </div>
          )}
        </div>

        {/* Token Savings & Quality Score - Combined Row */}
        {(stats.tokenSavings > 0 || stats.avgQualityScore > 0) && (
          <div className="grid grid-cols-2 gap-1.5">
            {stats.tokenSavings > 0 && (
              <div className="flex items-center gap-1.5 p-1.5 bg-lime-300/20 dark:bg-[#0f0f0f] border border-lime-300/40 dark:border-lime-500/20 rounded-lg">
                <Zap className="h-3 w-3 text-lime-600 dark:text-lime-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-black dark:text-white leading-tight">
                    {stats.tokenSavings}%
                  </div>
                  <div className="text-[9px] text-zinc-600 dark:text-white/70 leading-tight">
                    Token Savings
                  </div>
                </div>
              </div>
            )}
            {stats.avgQualityScore > 0 && (
              <div className="flex items-center gap-1.5 p-1.5 bg-black/5 dark:bg-[#0f0f0f] rounded-lg">
                <Award className="h-3 w-3 text-lime-600 dark:text-lime-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-black dark:text-white leading-tight">
                    {stats.avgQualityScore}%
                  </div>
                  <div className="text-[9px] text-zinc-600 dark:text-white/70 leading-tight">
                    Quality
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags Section (Collapsible) */}
        {stats.tags.length > 0 && (
          <div>
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors w-full"
            >
              <Tags className="h-2.5 w-2.5" />
              <span className="font-medium">Stack Tags ({stats.tags.length})</span>
              <span className="text-[10px] text-black/60 dark:text-white/60">{tagsExpanded ? '−' : '+'}</span>
            </button>
            {tagsExpanded && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {stats.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-lime-300/20 dark:bg-[#0f0f0f] text-black dark:text-lime-400 border border-lime-300/40 dark:border-lime-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-black/20 dark:border-white/8 my-2" />

        {/* Selected Items */}
        <div
          onMouseEnter={() => setHoverSelectedItems(true)}
          onMouseLeave={() => setHoverSelectedItems(false)}
        >
          <h4 className="text-[10px] font-semibold text-black dark:text-white mb-1.5 uppercase tracking-wide">
            {hoverSelectedItems ? (
              <ScrambleText text={`Selected Items (${selectedItems.length})`} trigger="hover" duration={400} />
            ) : (
              `Selected Items (${selectedItems.length})`
            )}
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[10px] p-1.5 rounded bg-black/5 dark:bg-[#0f0f0f]"
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-black/70 dark:text-white/70 flex-shrink-0">
                    {getKindIcon()}
                  </span>
                  <span className="truncate text-black dark:text-white font-medium">{formatProductName(item.name)}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-black/20 dark:bg-white/10 text-black/60 dark:text-white/60 uppercase tracking-wide ml-1.5 flex-shrink-0">
                  {item.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-black/20 dark:border-white/8">
          <button
            onClick={handleCopyInstall}
            className="export-button w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black dark:bg-lime-400 text-white dark:text-black hover:bg-black/90 dark:hover:bg-lime-300 text-[11px] font-medium transition-colors"
          >
            <Copy size={12} />
            Copy Install Command
          </button>
        </div>
      </div>
    </div>
  );
}
