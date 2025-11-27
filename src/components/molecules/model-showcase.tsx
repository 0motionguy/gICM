"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, Code2, Terminal, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GeminiIcon, ClaudeIcon, OpenAIIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MODEL_VERSIONS } from "@/lib/model-versions";

const models = [
    {
        id: "claude",
        name: MODEL_VERSIONS.claude.featuredModel,
        provider: MODEL_VERSIONS.claude.provider,
        icon: ClaudeIcon,
        color: "#D97757",
        badge: "Most Capable",
        badgeIcon: Zap,
        description: "The most capable Claude model for complex reasoning, extended thinking, and nuanced code generation.",
        code: `const agent = new ClaudeAgent({
  model: "${MODEL_VERSIONS.claude.latestModelId}",
  tools: [fileSystem, git],
  max_tokens: 8192
});`
    },
    {
        id: "gemini",
        name: MODEL_VERSIONS.gemini.featuredModel,
        provider: MODEL_VERSIONS.gemini.provider,
        icon: GeminiIcon,
        color: "#4E82EE",
        badge: "Multimodal Native",
        badgeIcon: Sparkles,
        description: "Ultra-fast multimodal AI with agentic capabilities, native tool use, and 1M token context window.",
        code: `const agent = new GeminiAgent({
  model: "${MODEL_VERSIONS.gemini.latestModelId}",
  multimodal: true,
  tools: ["code_execution"]
});`
    },
    {
        id: "openai",
        name: MODEL_VERSIONS.openai.featuredModel,
        provider: MODEL_VERSIONS.openai.provider,
        icon: OpenAIIcon,
        color: "#10A37F",
        badge: "Advanced Reasoning",
        badgeIcon: BrainCircuit,
        description: "The industry standard for speed and capability, featuring state-of-the-art function calling.",
        code: `const agent = new OpenAIAgent({
  model: "${MODEL_VERSIONS.openai.latestModelId}",
  function_calling: "auto",
  temperature: 0.7
});`
    }
];

export function ModelShowcase() {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                    Power Your Stack with <span className="text-[#00F0FF]">Any Model</span>
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                    Aether creates a unified interface for the world's most powerful AI models. Switch runtimes instantly without rewriting your agents.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {models.map((model, index) => (
                    <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onMouseEnter={() => setHovered(model.id)}
                        onMouseLeave={() => setHovered(null)}
                        className="relative"
                    >
                        <GlassCard
                            className={cn(
                                "h-full p-6 relative overflow-hidden transition-all duration-500 border-white/5",
                                hovered === model.id ? "border-opacity-50 transform -translate-y-1" : ""
                            )}
                            style={{
                                borderColor: hovered === model.id ? model.color : undefined,
                                boxShadow: hovered === model.id ? `0 0 30px -10px ${model.color}40` : undefined
                            }}
                        >
                            {/* Ambient Glow */}
                            <div
                                className="absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                                style={{
                                    backgroundColor: model.color,
                                    opacity: hovered === model.id ? 0.15 : 0
                                }}
                            />

                            {/* Header */}
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="h-12 w-12 rounded-xl border grid place-items-center transition-colors duration-300"
                                        style={{
                                            borderColor: hovered === model.id ? model.color : "rgba(255,255,255,0.1)",
                                            backgroundColor: hovered === model.id ? `${model.color}10` : "rgba(255,255,255,0.05)",
                                            color: hovered === model.id ? model.color : "white"
                                        }}
                                    >
                                        <model.icon className="w-6 h-6" />
                                    </div>
                                    <div
                                        className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300"
                                        style={{
                                            borderColor: hovered === model.id ? model.color : "rgba(255,255,255,0.1)",
                                            backgroundColor: hovered === model.id ? `${model.color}10` : "rgba(255,255,255,0.02)",
                                            color: hovered === model.id ? model.color : "#71717a"
                                        }}
                                    >
                                        <model.badgeIcon size={12} />
                                        {model.badge}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white font-display mb-1">{model.name}</h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold">{model.provider}</p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-zinc-400 mb-8 leading-relaxed relative z-10">
                                {model.description}
                            </p>

                            {/* Code Snippet */}
                            <div className="relative z-10 mt-auto">
                                <div className="rounded-lg bg-[#050505] border border-white/10 overflow-hidden group/code">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="text-[10px] text-zinc-600 font-mono">config.ts</div>
                                    </div>
                                    <div className="p-3 overflow-x-auto">
                                        <pre className="font-mono text-[10px] leading-relaxed">
                                            <code className="text-zinc-300" dangerouslySetInnerHTML={{
                                                __html: model.code
                                                    .replace(/"([^"]+)"/g, `<span style="color: ${model.color}">"$1"</span>`)
                                                    .replace(/([a-z_]+):/g, '<span style="color: #a1a1aa">$1:</span>')
                                                    .replace(/(const|new|true|false)/g, '<span style="color: #c084fc">$1</span>')
                                            }} />
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}