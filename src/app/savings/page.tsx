import { TokenSavingsCalculator } from "@/components/organisms/token-savings-calculator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingDown,
  Zap,
  Clock,
  Check,
  ArrowLeft,
  Gauge,
  Activity,
} from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

export const metadata = {
  title: "Performance | ClawdBot - The Agent Marketplace",
  description:
    "92% context reduction. 12x faster responses. Calculate your token savings with Progressive Disclosure.",
};

export default function SavingsPage() {
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
            <Sparkles className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-bold tracking-wide text-[#00F0FF]">
              92% Less Context. Same Output.
            </span>
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
            Fewer tokens.{" "}
            <span className="bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] bg-clip-text text-transparent">
              Faster output.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-zinc-400">
            Progressive Disclosure loads only what matters. 92% smaller prompts.
            12x faster responses.
          </p>

          {/* Key Benefits */}
          <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <GlassCard className="group p-8 text-center transition-colors hover:border-[#00F0FF]/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 transition-transform duration-300 group-hover:scale-110">
                <TrendingDown className="h-8 w-8 text-[#00F0FF]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                90% Smaller Context
              </h3>
              <p className="text-sm text-zinc-400">
                Same quality. 10x less input.
              </p>
            </GlassCard>

            <GlassCard className="group p-8 text-center transition-colors hover:border-[#00F0FF]/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 transition-transform duration-300 group-hover:scale-110">
                <Gauge className="h-8 w-8 text-[#00F0FF]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                12x Faster Responses
              </h3>
              <p className="text-sm text-zinc-400">
                Less in, faster out. Simple math.
              </p>
            </GlassCard>

            <GlassCard className="group p-8 text-center transition-colors hover:border-[#00F0FF]/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 transition-transform duration-300 group-hover:scale-110">
                <Activity className="h-8 w-8 text-[#00F0FF]" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                Peak Efficiency
              </h3>
              <p className="text-sm text-zinc-400">
                More output per token. Every time.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Calculator */}
        <div className="mb-20">
          <TokenSavingsCalculator />
        </div>

        {/* Performance Examples */}
        <div className="mb-20 mt-16">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-white">
            Real Numbers. Real Savings.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Solo Dev */}
            <GlassCard className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-[60px]" />
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/20 text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Solo Developer
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Building a SaaS product
                  </p>
                </div>
              </div>

              <div className="relative z-10 mb-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">10 skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Claude Sonnet 3.5</span>
                </div>
              </div>

              <div className="relative z-10 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Tokens Saved Daily
                  </span>
                  <span className="text-2xl font-black text-[#00F0FF]">
                    115K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Response Boost</span>
                  <span className="text-3xl font-black text-[#00F0FF]">
                    12.7x faster
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* 5-Person Team */}
            <GlassCard className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-[60px]" />
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/20 text-2xl">
                  👥
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    5-Person Team
                  </h3>
                  <p className="text-sm text-zinc-400">Web3 startup</p>
                </div>
              </div>

              <div className="relative z-10 mb-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">
                    25 skill uses per day (total)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Mix of Sonnet & Opus</span>
                </div>
              </div>

              <div className="relative z-10 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Tokens Saved Daily
                  </span>
                  <span className="text-2xl font-black text-[#00F0FF]">
                    288K
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Response Boost</span>
                  <span className="text-3xl font-black text-[#00F0FF]">
                    11.3x faster
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Agency */}
            <GlassCard className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-[60px]" />
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/20 text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    20-Person Agency
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Full-service development
                  </p>
                </div>
              </div>

              <div className="relative z-10 mb-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">100 skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Heavy Opus usage</span>
                </div>
              </div>

              <div className="relative z-10 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Tokens Saved Daily
                  </span>
                  <span className="text-2xl font-black text-[#00F0FF]">
                    1.15M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Response Boost</span>
                  <span className="text-3xl font-black text-[#00F0FF]">
                    10.8x faster
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Enterprise */}
            <GlassCard className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-[60px]" />
              <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/20 text-2xl">
                  🏗️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Enterprise Team
                  </h3>
                  <p className="text-sm text-zinc-400">Large-scale platform</p>
                </div>
              </div>

              <div className="relative z-10 mb-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">500+ skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00F0FF]/20">
                    <Check className="h-3 w-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">
                    Opus for complex workflows
                  </span>
                </div>
              </div>

              <div className="relative z-10 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Tokens Saved Daily
                  </span>
                  <span className="text-2xl font-black text-[#00F0FF]">
                    5.75M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Response Boost</span>
                  <span className="text-3xl font-black text-[#00F0FF]">
                    12.1x faster
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mb-12">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-white">
            How It Works
          </h2>

          <GlassCard className="mx-auto max-w-5xl p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Badge variant="destructive" className="px-3 py-1 text-sm">
                    Traditional
                  </Badge>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                  Sends everything. Every time. 12,500 tokens per request.
                </p>
                <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/50 p-5 font-mono">
                  <code className="block text-xs leading-loose text-zinc-400">
                    // Sends 12,500 tokens
                    <br />
                    - Full codebase (8,000 tokens)
                    <br />
                    - All documentation (3,200 tokens)
                    <br />
                    - Examples (800 tokens)
                    <br />- Your question (500 tokens)
                  </code>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Badge className="bg-[#00F0FF] px-3 py-1 text-sm text-black hover:bg-[#00F0FF]/90">
                    Progressive
                  </Badge>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                  Loads only what matters. 980 tokens. Same output quality.
                </p>
                <div className="rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/10 p-5 font-mono">
                  <code className="block text-xs leading-loose text-[#00F0FF]">
                    // Sends 980 tokens
                    <br />
                    - Relevant code snippet (400 tokens)
                    <br />
                    - Key docs section (350 tokens)
                    <br />
                    - Focused example (130 tokens)
                    <br />- Your question (100 tokens)
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="mb-6 flex items-center justify-center gap-3">
                <Zap className="h-6 w-6 text-[#00F0FF]" />
                <h3 className="text-lg font-bold text-white">The Result</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
                <div className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-4">
                  <p className="text-3xl font-black text-[#00F0FF]">92%</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
                    Context Reduction
                  </p>
                </div>
                <div className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-4">
                  <p className="text-3xl font-black text-[#00F0FF]">12.7x</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
                    Faster Responses
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
                    Quality Output
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </AuroraBackground>
  );
}
