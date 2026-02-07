"use client";

import { useState, useMemo, useEffect } from "react";
import { useBundleStore } from "@/lib/store/bundle";
import {
  calculateTokenSavings,
  generateInstallCommand,
} from "@/lib/stack-builder";
import type { RegistryItem } from "@/types/registry";
import { Copy, Zap, Package, Tags, Award, Box, Share2 } from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import { ScrambleText } from "@/components/ui/scramble-text";
import { formatProductName } from "@/lib/utils";
import { ShareRemixPanel } from "./share-remix-panel";

interface StackPreviewProps {
  allItems: RegistryItem[]; // All available items for dependency resolution
}

export function StackPreview({ allItems }: StackPreviewProps) {
  const { getActiveStack, clearBundle, itemCount } = useBundleStore();
  const [stackName, setStackName] = useState("My ClawdBot Stack");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [hoverHeader, setHoverHeader] = useState(false);
  const [hoverSelectedItems, setHoverSelectedItems] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getKindIcon = () => {
    return <Box className="h-3 w-3" aria-hidden />;
  };

  const activeStack = getActiveStack();
  const selectedItems = useMemo(
    () => (activeStack?.items || []).map((bi) => bi.item),
    [activeStack]
  );

  const dependencies = useMemo(() => {
    if (!selectedItems.length) return [];

    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const allDeps = new Set<string>();

    selectedItems.forEach((item) => {
      (item.dependencies || []).forEach((depId) => {
        if (!selectedIds.has(depId)) {
          allDeps.add(depId);
        }
      });
    });

    return allItems.filter((item) => allDeps.has(item.id));
  }, [selectedItems, allItems]);

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

    const allTags = new Set<string>();
    selectedItems.forEach((item) => {
      (item.tags || []).forEach((tag) => allTags.add(tag));
    });

    const avgQualityScore = selectedItems.length > 0 ? 100 : 0;

    return {
      tokenSavings,
      totalItems,
      breakdown,
      tags: Array.from(allTags),
      avgQualityScore,
    };
  }, [selectedItems, dependencies]);

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

  const handleClear = () => {
    clearBundle();
    toast.success("Stack cleared");
  };

  // Empty State
  if (!mounted || itemCount() === 0) {
    return (
      <div className="relative sticky top-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F0F11] p-6 shadow-lg">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Package className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Stack Empty</h3>
            <p className="mx-auto mt-1 max-w-[200px] text-xs text-zinc-500">
              Select items from the catalog to build your custom workflow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="stack-preview"
      className="relative sticky top-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F0F11] p-4 shadow-2xl"
      onMouseEnter={() => setHoverHeader(true)}
      onMouseLeave={() => setHoverHeader(false)}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 border-b border-white/5 pb-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                {hoverHeader ? (
                  <ScrambleText
                    text="Current Stack"
                    trigger="hover"
                    duration={400}
                  />
                ) : (
                  "Current Stack"
                )}
              </div>
              <div className="mt-1 text-[10px] text-zinc-400">
                {selectedItems.length} items • {stats.tokenSavings}% efficiency
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] text-zinc-500 transition-colors hover:text-white"
            >
              Clear
            </button>
          </div>

          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="My ClawdBot Stack"
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#00F0FF]/50"
          />
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {Object.entries(stats.breakdown).map(([key, value]) => {
            if (value === 0) return null;
            return (
              <div
                key={key}
                className="rounded-lg border border-white/[0.02] bg-white/[0.03] p-2 text-center"
              >
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {key}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Items List */}
        <div className="mb-4">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Manifest
          </h4>
          <div className="scrollbar-thin max-h-48 space-y-1 overflow-y-auto pr-1">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-transparent bg-white/[0.03] p-2 text-xs transition-colors hover:border-white/5 hover:bg-white/[0.06]"
              >
                <span className="max-w-[140px] truncate font-medium text-zinc-300">
                  {formatProductName(item.name)}
                </span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
                  {item.kind}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyInstall}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#00F0FF] py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#00F0FF]/90 hover:shadow-[0_0_20px_-5px_rgba(0,240,255,0.5)]"
          >
            <Copy size={14} />
            Copy CLI
          </button>
          <button
            onClick={() => setIsSharePanelOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-zinc-700"
            title="Share Stack"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Share Panel */}
      <ShareRemixPanel
        isOpen={isSharePanelOpen}
        onClose={() => setIsSharePanelOpen(false)}
        stackConfig={{
          id: `stack_${Date.now()}`,
          name: stackName,
          description: "Custom ClawdBot stack",
          items: selectedItems.map((i) => i.id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
        }}
      />
    </div>
  );
}
