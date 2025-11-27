import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Zap, Brain, Rocket, Code2, LucideIcon } from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";
import { ComponentType, SVGProps } from "react";

export const metadata = {
  title: "Setup Guides | gICM - Universal AI Coding Hub",
  description:
    "Step-by-step guides to set up Claude Code, Gemini AI, and OpenAI GPT for AI-powered development. Start vibe coding in minutes.",
};

type IconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  color: string;
  badge: string;
  difficulty: string;
  time: string;
  href: string;
}

const guides: Guide[] = [
  {
    id: "claude-setup",
    title: "Claude Code Setup",
    description: "Set up Claude Code with Opus 4.5 for the most powerful AI coding experience. Complete guide from API key to first agent.",
    icon: ClaudeIcon,
    color: "#D97757",
    badge: "Recommended",
    difficulty: "Beginner",
    time: "10 min",
    href: "/guides/claude-setup",
  },
  {
    id: "gemini-setup",
    title: "Gemini AI Setup",
    description: "Configure Google Gemini 2.0 Flash with multimodal capabilities, code execution, and real-time features.",
    icon: GeminiIcon,
    color: "#4E82EE",
    badge: "Multimodal",
    difficulty: "Beginner",
    time: "10 min",
    href: "/guides/gemini-setup",
  },
  {
    id: "openai-setup",
    title: "OpenAI GPT Setup",
    description: "Set up GPT-4o, o1 reasoning, and DALL-E for advanced code generation and image creation.",
    icon: OpenAIIcon,
    color: "#10A37F",
    badge: "Popular",
    difficulty: "Beginner",
    time: "10 min",
    href: "/guides/openai-setup",
  },
  {
    id: "vibe-coding",
    title: "Vibe Coding Guide",
    description: "Complete beginner guide to AI-assisted development. Learn to build full-stack apps with natural language.",
    icon: Rocket,
    color: "#FF6B6B",
    badge: "Start Here",
    difficulty: "Beginner",
    time: "20 min",
    href: "/guides/vibe-coding",
  },
];

const features = [
  {
    icon: Code2,
    title: "Multi-Model Support",
    description: "Use Claude, Gemini, or OpenAI - all from one platform",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get coding in under 10 minutes with our step-by-step guides",
  },
  {
    icon: Brain,
    title: "Best Practices",
    description: "Learn optimal prompting and token-saving techniques",
  },
];

export default function GuidesPage() {
  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-6">
            <BookOpen className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#00F0FF] font-bold text-sm tracking-wide">
              Setup Guides
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            Start Coding with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F]">
              Any AI Model
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Complete setup guides for Claude Code, Gemini AI, and OpenAI GPT.
            Choose your preferred AI model and start building in minutes.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-zinc-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
            <Link key={guide.id} href={guide.href}>
              <GlassCard className="p-6 h-full group hover:border-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: `${guide.color}40`,
                      backgroundColor: `${guide.color}10`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: guide.color }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${guide.color}20`,
                          color: guide.color,
                        }}
                      >
                        {guide.badge}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {guide.difficulty} · {guide.time}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors">
                      {guide.title}
                    </h3>

                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                      {guide.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-[#00F0FF] transition-colors">
                      Start Guide
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
          })}
        </div>

        {/* Model Comparison */}
        <GlassCard className="p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Which Model Should I Use?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-[#D97757]/5 border border-[#D97757]/20">
              <ClaudeIcon className="w-10 h-10 mx-auto mb-3 text-[#D97757]" />
              <h3 className="font-bold text-white mb-2">Claude (Opus 4.5)</h3>
              <p className="text-sm text-zinc-400 mb-3">Best for complex reasoning, long code generation, and nuanced tasks</p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>Most capable model</li>
                <li>Extended thinking</li>
                <li>Best code quality</li>
              </ul>
            </div>

            <div className="text-center p-4 rounded-xl bg-[#4E82EE]/5 border border-[#4E82EE]/20">
              <GeminiIcon className="w-10 h-10 mx-auto mb-3 text-[#4E82EE]" />
              <h3 className="font-bold text-white mb-2">Gemini 2.0 Flash</h3>
              <p className="text-sm text-zinc-400 mb-3">Best for multimodal, code execution, and real-time streaming</p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>Ultra-fast responses</li>
                <li>Native code execution</li>
                <li>Image + code generation</li>
              </ul>
            </div>

            <div className="text-center p-4 rounded-xl bg-[#10A37F]/5 border border-[#10A37F]/20">
              <OpenAIIcon className="w-10 h-10 mx-auto mb-3 text-[#10A37F]" />
              <h3 className="font-bold text-white mb-2">GPT-4o / o1</h3>
              <p className="text-sm text-zinc-400 mb-3">Best for function calling, DALL-E images, and voice interaction</p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>Best function calling</li>
                <li>DALL-E integration</li>
                <li>Realtime voice API</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="text-center">
          <p className="text-zinc-400 mb-4">
            Not sure where to start?
          </p>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-bold hover:opacity-90 transition-opacity"
          >
            <Rocket className="w-5 h-5" />
            Start the Vibe Coding Guide
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </AuroraBackground>
  );
}
