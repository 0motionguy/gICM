"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  BrainCircuit,
  Code2,
  Terminal,
  Check,
} from "lucide-react";
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
    description:
      "Complex reasoning, extended thinking, nuanced code generation.",
    code: `const agent = new ClaudeAgent({
  model: "${MODEL_VERSIONS.claude.latestModelId}",
  tools: [fileSystem, git],
  max_tokens: 8192
});`,
  },
  {
    id: "gemini",
    name: MODEL_VERSIONS.gemini.featuredModel,
    provider: MODEL_VERSIONS.gemini.provider,
    icon: GeminiIcon,
    color: "#4E82EE",
    badge: "Multimodal Native",
    badgeIcon: Sparkles,
    description: "Ultra-fast multimodal. Native tool use. 1M token context.",
    code: `const agent = new GeminiAgent({
  model: "${MODEL_VERSIONS.gemini.latestModelId}",
  multimodal: true,
  tools: ["code_execution"]
});`,
  },
  {
    id: "openai",
    name: MODEL_VERSIONS.openai.featuredModel,
    provider: MODEL_VERSIONS.openai.provider,
    icon: OpenAIIcon,
    color: "#10A37F",
    badge: "Advanced Reasoning",
    badgeIcon: BrainCircuit,
    description: "Speed + capability. State-of-the-art function calling.",
    code: `const agent = new OpenAIAgent({
  model: "${MODEL_VERSIONS.openai.latestModelId}",
  function_calling: "auto",
  temperature: 0.7
});`,
  },
];

export function ModelShowcase() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
          Any model. <span className="text-[#00F0FF]">One interface.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Switch runtimes. Keep your agents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                "relative h-full overflow-hidden border-white/5 p-6 transition-all duration-500",
                hovered === model.id
                  ? "-translate-y-1 transform border-opacity-50"
                  : ""
              )}
              style={{
                borderColor: hovered === model.id ? model.color : undefined,
                boxShadow:
                  hovered === model.id
                    ? `0 0 30px -10px ${model.color}40`
                    : undefined,
              }}
            >
              {/* Ambient Glow */}
              <div
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  backgroundColor: model.color,
                  opacity: hovered === model.id ? 0.15 : 0,
                }}
              />

              {/* Header */}
              <div className="relative z-10 mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl border transition-colors duration-300"
                    style={{
                      borderColor:
                        hovered === model.id
                          ? model.color
                          : "rgba(255,255,255,0.1)",
                      backgroundColor:
                        hovered === model.id
                          ? `${model.color}10`
                          : "rgba(255,255,255,0.05)",
                      color: hovered === model.id ? model.color : "white",
                    }}
                  >
                    <model.icon className="h-6 w-6" />
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
                    style={{
                      borderColor:
                        hovered === model.id
                          ? model.color
                          : "rgba(255,255,255,0.1)",
                      backgroundColor:
                        hovered === model.id
                          ? `${model.color}10`
                          : "rgba(255,255,255,0.02)",
                      color: hovered === model.id ? model.color : "#71717a",
                    }}
                  >
                    <model.badgeIcon size={12} />
                    {model.badge}
                  </div>
                </div>

                <h3 className="mb-1 font-display text-xl font-bold text-white">
                  {model.name}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  {model.provider}
                </p>
              </div>

              {/* Description */}
              <p className="relative z-10 mb-8 text-sm leading-relaxed text-zinc-400">
                {model.description}
              </p>

              {/* Code Snippet */}
              <div className="relative z-10 mt-auto">
                <div className="group/code overflow-hidden rounded-lg border border-white/10 bg-[#050505]">
                  <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600">
                      config.ts
                    </div>
                  </div>
                  <div className="overflow-x-auto p-3">
                    <pre className="font-mono text-[10px] leading-relaxed">
                      <code
                        className="text-zinc-300"
                        dangerouslySetInnerHTML={{
                          __html: model.code
                            .replace(
                              /"([^"]+)"/g,
                              `<span style="color: ${model.color}">"$1"</span>`
                            )
                            .replace(
                              /([a-z_]+):/g,
                              '<span style="color: #a1a1aa">$1:</span>'
                            )
                            .replace(
                              /(const|new|true|false)/g,
                              '<span style="color: #c084fc">$1</span>'
                            ),
                        }}
                      />
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
