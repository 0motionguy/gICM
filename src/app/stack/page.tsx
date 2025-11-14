"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Check, Sparkles, Package, Share2 } from "lucide-react";
import { useBundleStore } from "@/lib/store/bundle";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DependencyGraph } from "@/components/DependencyGraph";
import { ShareStackModal } from "@/components/ShareStackModal";
import { resolveDependencies } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import { formatProductName } from "@/lib/utils";

export default function StackPage() {
  const { getActiveStack, clearBundle, itemCount } = useBundleStore();
  const [copied, setCopied] = useState(false);
  const [installCommand, setInstallCommand] = useState("");
  const [allItems, setAllItems] = useState<RegistryItem[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const activeStack = getActiveStack();
  const items = activeStack?.items || [];

  useEffect(() => {
    // Resolve all dependencies
    const bundleItems = items.map(({ item }) => item);
    const resolved = resolveDependencies(
      bundleItems.map(i => i.id)
    );
    setAllItems(resolved);

    // Generate install command
    const command = `npx @gicm/cli add ${bundleItems.map(item => `${item.kind}/${item.slug}`).join(' ')}`;
    setInstallCommand(command);
  }, [items]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track bundle copied event
    const { analytics } = await import("@/lib/analytics");
    analytics.trackBundleCopied(items.length);

    // Show toast
    const { toast } = await import("sonner");
    toast.success("Install command copied to clipboard!");
  };

  const totalTokenSavings = items.reduce((sum, { item }) => sum + (item.tokenSavings || 0), 0);
  const avgTokenSavings = items.length > 0 ? Math.round(totalTokenSavings / items.length) : 0;

  if (itemCount() === 0) {
    return (
      <div className="min-h-screen radial-burst flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="h-24 w-24 rounded-3xl bg-black text-lime-300 grid place-items-center font-black text-6xl mx-auto">
            g
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-black">Your Stack is Empty</h1>
            <p className="text-black/60">Add items from the marketplace to build your custom stack</p>
          </div>
          <Link href="/">
            <Button className="bg-black hover:bg-black/90 text-lime-300 font-bold">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
      {/* Header */}
      <div className="border-b border-black/20 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center justify-between mb-3">
            <Breadcrumb items={[{ label: "Your Stack" }]} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 size={16} />
                Share Stack
              </Button>
              <Button
                onClick={clearBundle}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Stack
              </Button>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/80 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Stack Size Warning */}
        {itemCount() > 15 && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-50/50 p-4 flex items-start gap-3">
            <div className="text-yellow-600 text-lg">⚠️</div>
            <div>
              <div className="font-semibold text-black">Large Stack Detected</div>
              <p className="text-sm text-black/60 mt-1">
                Your stack has {itemCount()} items. Consider splitting into multiple smaller stacks for better organization and performance.
              </p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-black">Your Custom Stack</h1>
              <p className="text-black/60">
                {itemCount()} items selected • {allItems.length} total with dependencies
              </p>
              <p className="text-sm text-black/40">
                ⏱️ Estimated install time: ~{Math.ceil(allItems.length * 0.5)} minutes
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-lime-600">{totalTokenSavings}%</div>
              <div className="text-sm text-black/60">Total Token Savings</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-black/10">
            <div>
              <div className="text-2xl font-black text-black">
                {items.filter(({ item }) => item.kind === 'agent').length}
              </div>
              <div className="text-xs text-black/60">Agents</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {items.filter(({ item }) => item.kind === 'skill').length}
              </div>
              <div className="text-xs text-black/60">Skills</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {items.filter(({ item }) => item.kind === 'command').length}
              </div>
              <div className="text-xs text-black/60">Commands</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {items.filter(({ item }) => item.kind === 'mcp').length}
              </div>
              <div className="text-xs text-black/60">MCPs</div>
            </div>
          </div>
        </div>

        {/* Install Command */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lime-500" />
              One-Command Install
            </h2>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-black p-4 overflow-x-auto">
            <code className="text-sm text-lime-300 font-mono whitespace-pre">
              {installCommand}
            </code>
          </div>

          <p className="text-sm text-black/60">
            This command will install all {itemCount()} items plus {allItems.length - itemCount()} dependencies
          </p>
        </div>

        {/* Dependency Graph */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-6 space-y-4">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Package className="w-5 h-5" />
            Dependency Graph
          </h2>
          <div className="h-[500px] rounded-lg border border-black/10 bg-white">
            <DependencyGraph items={allItems} selectedIds={items.map(({ item }) => item.id)} />
          </div>
        </div>

        {/* Item List */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-6 space-y-4">
          <h2 className="text-lg font-bold text-black">Selected Items</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {items.map(({ item }) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-black/10 bg-white"
              >
                <div className="h-12 w-12 rounded-xl bg-black text-lime-300 grid place-items-center font-black text-lg flex-shrink-0">
                  g
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-black">{formatProductName(item.name)}</h3>
                    <span className="px-2 py-0.5 rounded bg-black/10 text-black text-xs font-medium uppercase">
                      {item.kind}
                    </span>
                  </div>
                  <p className="text-sm text-black/60 mt-1 line-clamp-2">{item.description}</p>
                  {item.tokenSavings && (
                    <p className="text-sm text-lime-600 font-medium mt-2">
                      {item.tokenSavings}% token savings
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-black/20 bg-gradient-to-br from-lime-500 to-emerald-500 p-8 text-center space-y-4">
          <h2 className="text-2xl font-black text-black">Ready to Build?</h2>
          <p className="text-black/80">
            Copy the command above and run it in your terminal to install your custom stack
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleCopy}
              size="lg"
              className="bg-black hover:bg-black/90 text-lime-300 font-bold gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy Install Command
            </Button>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-black/20 hover:bg-black/10 font-bold"
              >
                Add More Items
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareStackModal
        itemIds={items.map(({ item }) => item.id)}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
