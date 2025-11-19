"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, X, Package, Copy, Layers } from "lucide-react";
import { useBundleStore } from "@/lib/store/bundle";
import { Button } from "./ui/button";
import { formatProductName } from "@/lib/utils";
import { GlassCard } from "./ui/glass-card";

export function StackBuilderWidget() {
  const { getActiveStack, itemCount, openCart, closeCart, isOpen, removeItem } = useBundleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeStack = getActiveStack();
  const items = activeStack?.items || [];
  const count = items.length;

  if (count === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold px-5 py-3 rounded-full shadow-[0_0_20px_-5px_rgba(0,240,255,0.5)] transition-all hover:scale-105"
        >
          <Layers className="w-5 h-5" />
          <span className="bg-black text-[#00F0FF] rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
            {count}
          </span>
        </button>
      )}

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0F0F11] border-l border-white/10 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b border-white/10 p-6 bg-[#00F0FF]/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/30 grid place-items-center text-[#00F0FF]">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">Your Stack</h2>
                    <p className="text-sm text-zinc-400">{count} items selected</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href="/analytics"
                  onClick={closeCart}
                  className="text-zinc-400 hover:text-[#00F0FF] inline-flex items-center gap-1 transition-colors"
                >
                  📊 Analytics
                </Link>
                <span className="text-white/10">|</span>
                <Link
                  href="/workflow"
                  onClick={closeCart}
                  className="text-zinc-400 hover:text-[#00F0FF] inline-flex items-center gap-1 transition-colors"
                >
                  ✨ AI Builder
                </Link>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-zinc-600">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Your stack is empty</p>
                </div>
              ) : (
                items.map(({ item }) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-[#00F0FF]/30 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 grid place-items-center font-display font-bold text-sm text-white flex-shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-200 truncate">{formatProductName(item.name)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {item.kind}
                        </span>
                        {item.tokenSavings && (
                          <span className="text-[10px] text-[#00F0FF] font-medium">
                            {item.tokenSavings}% savings
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all text-red-500"
                      title="Remove from stack"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-6 space-y-4 bg-[#0A0A0B]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-400">Token Savings:</span>
                <span className="text-[#00F0FF] font-black text-lg">
                  {items.reduce((sum, { item }) => sum + (item.tokenSavings || 0), 0)}%
                </span>
              </div>

              <Button
                className="w-full h-12 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]"
                onClick={() => {
                  const cmd = `npx @gicm/cli add ${items.map(({ item }) => `${item.kind}/${item.slug}`).join(' ')}`;
                  navigator.clipboard.writeText(cmd);
                  closeCart();
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Install Command
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}