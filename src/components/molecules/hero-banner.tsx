"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BridgeModal } from "./bridge-modal";
import { Network, Sparkles } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

/**
 * HeroBanner Component
 * Premium Aether branding header
 */
export function HeroBanner() {
  const [showBridge, setShowBridge] = useState(false);

  return (
    <>
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-2">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Info */}
          <div className="flex items-center gap-5">
            {/* Animated Logo */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] rounded-2xl opacity-40 blur-lg group-hover:opacity-70 transition-opacity duration-500" />
              <div className="relative h-16 w-16 rounded-2xl bg-black border border-white/10 grid place-items-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[#00F0FF] font-black text-4xl font-display tracking-tighter group-hover:scale-110 transition-transform duration-300">A</span>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display flex items-center gap-3">
                Aether
                <span className="px-2 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider border border-[#00F0FF]/20">
                  v2.0
                </span>
              </h1>
              <p className="text-white/60 text-sm font-medium flex items-center gap-2 mt-1">
                The Universal AI Workflow Marketplace
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBridge(true)}
              className="hidden md:flex group relative px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Network size={16} className="text-[#00F0FF]" />
                Universal Bridge
              </span>
            </button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
      <BridgeModal isOpen={showBridge} onClose={() => setShowBridge(false)} />
    </>
  );
}