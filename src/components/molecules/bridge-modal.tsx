"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Box, Sparkles, Zap, Layers, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BridgeModal({ isOpen, onClose }: BridgeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto w-full max-w-2xl"
            >
              <GlassCard className="relative overflow-hidden border-white/10 bg-[#0a0a0a]/90 p-0 dark:bg-[#0a0a0a]/90">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                      <Globe size={12} />
                      The Universal Bridge
                    </div>
                    <h2 className="mb-2 font-display text-3xl font-black text-white">
                      Write Once.{" "}
                      <span className="text-[#00F0FF]">Run Anywhere.</span>
                    </h2>
                    <p className="mx-auto max-w-md text-white/60">
                      gICM is the first marketplace that bridges the gap between
                      different AI runtimes.
                    </p>
                  </div>

                  {/* Diagram */}
                  <div className="relative py-8">
                    {/* Connecting Lines */}
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent" />

                    <div className="relative z-10 grid grid-cols-3 gap-4">
                      {/* Step 1: The Registry */}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="group relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-black shadow-xl">
                          <div className="absolute inset-0 bg-[#00F0FF]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                          <Layers
                            size={32}
                            className="relative z-10 text-white"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            gICM Registry
                          </div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
                            Source of Truth
                          </div>
                        </div>
                      </div>

                      {/* Step 2: The Bridge */}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="grid h-16 w-16 animate-pulse place-items-center rounded-full border border-[#00F0FF]/50 bg-[#00F0FF]/10 shadow-[0_0_30px_-5px_rgba(0,240,255,0.3)]">
                          <ArrowRight size={32} className="text-[#00F0FF]" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#00F0FF]">
                            Universal Adapter
                          </div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#00F0FF]/60">
                            Transpiles Logic
                          </div>
                        </div>
                      </div>

                      {/* Step 3: The Runtimes */}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex -space-x-4">
                          <div
                            className="z-30 grid h-12 w-12 place-items-center rounded-full border-4 border-[#0a0a0a] bg-[#D97757]"
                            title="Claude"
                          >
                            <Box size={20} className="text-white" />
                          </div>
                          <div
                            className="z-20 grid h-12 w-12 place-items-center rounded-full border-4 border-[#0a0a0a] bg-[#4E82EE]"
                            title="Gemini"
                          >
                            <Sparkles size={20} className="text-white" />
                          </div>
                          <div
                            className="z-10 grid h-12 w-12 place-items-center rounded-full border-4 border-[#0a0a0a] bg-[#10A37F]"
                            title="OpenAI"
                          >
                            <Zap size={20} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Any Runtime
                          </div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
                            Claude • Gemini • OpenAI
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                    <p className="text-sm text-white/80">
                      <span className="font-bold text-[#00F0FF]">
                        Did you know?
                      </span>{" "}
                      You can toggle the platform on any tool card to get the
                      optimized install command for your specific AI agent.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
