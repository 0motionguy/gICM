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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl pointer-events-auto"
                        >
                            <GlassCard className="relative overflow-hidden border-white/10 bg-[#0a0a0a]/90 dark:bg-[#0a0a0a]/90 p-0">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors z-10"
                                >
                                    <X size={20} />
                                </button>

                                {/* Content */}
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-xs font-bold uppercase tracking-wider mb-4">
                                            <Globe size={12} />
                                            The Universal Bridge
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-2 font-display">
                                            Write Once. <span className="text-[#00F0FF]">Run Anywhere.</span>
                                        </h2>
                                        <p className="text-white/60 max-w-md mx-auto">
                                            Aether is the first marketplace that bridges the gap between different AI runtimes.
                                        </p>
                                    </div>

                                    {/* Diagram */}
                                    <div className="relative py-8">
                                        {/* Connecting Lines */}
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent -translate-y-1/2" />

                                        <div className="grid grid-cols-3 gap-4 relative z-10">
                                            {/* Step 1: The Registry */}
                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div className="h-16 w-16 rounded-2xl bg-black border border-white/10 grid place-items-center shadow-xl relative group">
                                                    <div className="absolute inset-0 bg-[#00F0FF]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Layers size={32} className="text-white relative z-10" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">Aether Registry</div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-1">Source of Truth</div>
                                                </div>
                                            </div>

                                            {/* Step 2: The Bridge */}
                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div className="h-16 w-16 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/50 grid place-items-center shadow-[0_0_30px_-5px_rgba(0,240,255,0.3)] animate-pulse">
                                                    <ArrowRight size={32} className="text-[#00F0FF]" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#00F0FF] text-sm">Universal Adapter</div>
                                                    <div className="text-[10px] text-[#00F0FF]/60 uppercase tracking-wider font-mono mt-1">Transpiles Logic</div>
                                                </div>
                                            </div>

                                            {/* Step 3: The Runtimes */}
                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div className="flex -space-x-4">
                                                    <div className="h-12 w-12 rounded-full bg-[#D97757] border-4 border-[#0a0a0a] grid place-items-center z-30" title="Claude">
                                                        <Box size={20} className="text-white" />
                                                    </div>
                                                    <div className="h-12 w-12 rounded-full bg-[#4E82EE] border-4 border-[#0a0a0a] grid place-items-center z-20" title="Gemini">
                                                        <Sparkles size={20} className="text-white" />
                                                    </div>
                                                    <div className="h-12 w-12 rounded-full bg-[#10A37F] border-4 border-[#0a0a0a] grid place-items-center z-10" title="OpenAI">
                                                        <Zap size={20} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">Any Runtime</div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-1">Claude • Gemini • OpenAI</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <p className="text-sm text-white/80">
                                            <span className="text-[#00F0FF] font-bold">Did you know?</span> You can toggle the platform on any tool card to get the optimized install command for your specific AI agent.
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
