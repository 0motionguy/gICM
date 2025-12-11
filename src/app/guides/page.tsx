import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  Brain,
  Rocket,
  Code2,
  LucideIcon,
} from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";
import { ComponentType, SVGProps } from "react";

export const metadata = {
  title: "Setup Guides | gICM - Universal AI Coding Hub",
  description:
    "Step-by-step guides to set up Claude Code, Gemini AI, and OpenAI GPT for AI-powered development. Start vibe coding in minutes.",
  keywords: [
    "Claude Code setup",
    "Gemini AI setup",
    "OpenAI GPT setup",
    "AI coding",
    "vibe coding",
    "AI development guide",
  ],
  openGraph: {
    title: "AI Setup Guides - Claude, Gemini, OpenAI | gICM",
    description:
      "Step-by-step guides to set up Claude Code, Gemini AI, and OpenAI GPT for AI-powered development.",
    url: "https://gicm.app/guides",
  },
  alternates: {
    canonical: "https://gicm.app/guides",
  },
};

type IconComponent =
  | LucideIcon
  | ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

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
    description:
      "Set up Claude Code with Opus 4.5 for the most powerful AI coding experience. Complete guide from API key to first agent.",
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
    description:
      "Configure Google Gemini 2.0 Flash with multimodal capabilities, code execution, and real-time features.",
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
    description:
      "Set up GPT-4o, o1 reasoning, and DALL-E for advanced code generation and image creation.",
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
    description:
      "Complete beginner guide to AI-assisted development. Learn to build full-stack apps with natural language.",
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
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-2">
            <BookOpen className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-bold tracking-wide text-[#00F0FF]">
              Setup Guides
            </span>
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
            Start Coding with{" "}
            <span className="bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] bg-clip-text text-transparent">
              Any AI Model
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-zinc-400">
            Complete setup guides for Claude Code, Gemini AI, and OpenAI GPT.
            Choose your preferred AI model and start building in minutes.
          </p>

          {/* Features */}
          <div className="mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <feature.icon className="h-6 w-6 text-[#00F0FF]" />
                </div>
                <h3 className="mb-1 text-sm font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.id} href={guide.href}>
                <GlassCard className="group h-full cursor-pointer p-6 transition-all duration-300 hover:border-white/20">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
                      style={{
                        borderColor: `${guide.color}40`,
                        backgroundColor: `${guide.color}10`,
                      }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: guide.color }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
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

                      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-[#00F0FF]">
                        {guide.title}
                      </h3>

                      <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                        {guide.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors group-hover:text-[#00F0FF]">
                        Start Guide
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        {/* Model Comparison */}
        <GlassCard className="mb-16 p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Which Model Should I Use?
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#D97757]/20 bg-[#D97757]/5 p-4 text-center">
              <ClaudeIcon className="mx-auto mb-3 h-10 w-10 text-[#D97757]" />
              <h3 className="mb-2 font-bold text-white">Claude (Opus 4.5)</h3>
              <p className="mb-3 text-sm text-zinc-400">
                Best for complex reasoning, long code generation, and nuanced
                tasks
              </p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>Most capable model</li>
                <li>Extended thinking</li>
                <li>Best code quality</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#4E82EE]/20 bg-[#4E82EE]/5 p-4 text-center">
              <GeminiIcon className="mx-auto mb-3 h-10 w-10 text-[#4E82EE]" />
              <h3 className="mb-2 font-bold text-white">Gemini 2.0 Flash</h3>
              <p className="mb-3 text-sm text-zinc-400">
                Best for multimodal, code execution, and real-time streaming
              </p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>Ultra-fast responses</li>
                <li>Native code execution</li>
                <li>Image + code generation</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#10A37F]/20 bg-[#10A37F]/5 p-4 text-center">
              <OpenAIIcon className="mx-auto mb-3 h-10 w-10 text-[#10A37F]" />
              <h3 className="mb-2 font-bold text-white">GPT-4o / o1</h3>
              <p className="mb-3 text-sm text-zinc-400">
                Best for function calling, DALL-E images, and voice interaction
              </p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>Best function calling</li>
                <li>DALL-E integration</li>
                <li>Realtime voice API</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-4 text-zinc-400">Not sure where to start?</p>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
          >
            <Rocket className="h-5 w-5" />
            Start the Vibe Coding Guide
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </AuroraBackground>
  );
}
