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
  const [stackName, setStackName] = useState("My Aether Stack");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [hoverHeader, setHoverHeader] = useState(false);
  const [hoverSelectedItems, setHoverSelectedItems] = useState(false);
  const [mounted, setMounted] = useState(false);

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

    return { tokenSavings, totalItems, breakdown, tags: Array.from(allTags), avgQualityScore };
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
      <div className="sticky top-4 relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F0F11] p-6 shadow-lg">
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
             <Package className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
             <h3 className="text-sm font-bold text-white">Stack Empty</h3>
             <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">
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
      className="sticky top-4 relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F0F11] p-4 shadow-2xl"
      onMouseEnter={() => setHoverHeader(true)}
      onMouseLeave={() => setHoverHeader(false)}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
                {hoverHeader ? (
                  <ScrambleText text="Current Stack" trigger="hover" duration={400} />
                ) : (
                  "Current Stack"
                )}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                {selectedItems.length} items • {stats.tokenSavings}% efficiency
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] text-zinc-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>

          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="My Aether Stack"
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/20 outline-none text-sm text-white placeholder:text-zinc-600 focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(stats.breakdown).map(([key, value]) => {
             if (value === 0) return null;
             return (
                <div key={key} className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/[0.02]">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{key}</div>
                </div>
             );
          })}
        </div>

        {/* Selected Items List */}
        <div className="mb-4">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
             Manifest
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/5 transition-colors"
              >
                <span className="truncate text-zinc-300 font-medium max-w-[140px]">{formatProductName(item.name)}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-zinc-500 uppercase">
                  {item.kind}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Install Button */}
        <button
            onClick={handleCopyInstall}
            className="w-full py-3 rounded-lg bg-[#00F0FF] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00F0FF]/90 hover:shadow-[0_0_20px_-5px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-2"
        >
            <Copy size={14} />
            Copy CLI Command
        </button>
      </div>
    </div>
  );
}