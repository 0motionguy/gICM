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
  title: "Performance Calculator | Aether",
  description:
    "Calculate your context reduction, token savings, and speed improvements with Progressive Disclosure technology.",
};

export default function SavingsPage() {
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
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#00F0FF] font-bold text-sm tracking-wide">
              88-92% Context Reduction
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            Supercharge Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F]">
              AI Performance
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Progressive Disclosure technology loads only the context you need,
            when you need it. The result? Dramatically smaller prompts, faster
            responses, and more efficient AI interactions.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <GlassCard className="p-8 text-center group hover:border-[#00F0FF]/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-[#00F0FF]/20">
                <TrendingDown className="w-8 h-8 text-[#00F0FF]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                90% Smaller Context
              </h3>
              <p className="text-sm text-zinc-400">
                Dramatically reduce prompt size without sacrificing quality
              </p>
            </GlassCard>

            <GlassCard className="p-8 text-center group hover:border-[#00F0FF]/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-[#00F0FF]/20">
                <Gauge className="w-8 h-8 text-[#00F0FF]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                10-12x Faster Responses
              </h3>
              <p className="text-sm text-zinc-400">
                Less context means faster processing and quicker results
              </p>
            </GlassCard>

            <GlassCard className="p-8 text-center group hover:border-[#00F0FF]/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-[#00F0FF]/20">
                <Activity className="w-8 h-8 text-[#00F0FF]" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Maximum Efficiency
              </h3>
              <p className="text-sm text-zinc-400">
                Get more done with fewer tokens and faster turnaround
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Calculator */}
        <div className="mb-20">
          <TokenSavingsCalculator />
        </div>

        {/* Performance Examples */}
        <div className="mt-16 mb-20">
          <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
            Real-World Performance Gains
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo Dev */}
            <GlassCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 blur-[60px] rounded-full" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center text-2xl border border-[#00F0FF]/30">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">
                    Solo Developer
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Building a SaaS product
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">10 skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Claude Sonnet 3.5</span>
                </div>
              </div>

              <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
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
            <GlassCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 blur-[60px] rounded-full" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center text-2xl border border-[#00F0FF]/30">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">
                    5-Person Team
                  </h3>
                  <p className="text-sm text-zinc-400">Web3 startup</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">
                    25 skill uses per day (total)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Mix of Sonnet & Opus</span>
                </div>
              </div>

              <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
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
            <GlassCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 blur-[60px] rounded-full" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center text-2xl border border-[#00F0FF]/30">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">
                    20-Person Agency
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Full-service development
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">100 skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">Heavy Opus usage</span>
                </div>
              </div>

              <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
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
            <GlassCard className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 blur-[60px] rounded-full" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center text-2xl border border-[#00F0FF]/30">
                  🏗️
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">
                    Enterprise Team
                  </h3>
                  <p className="text-sm text-zinc-400">Large-scale platform</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">500+ skill uses per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#00F0FF]" />
                  </div>
                  <span className="text-zinc-300">
                    Opus for complex workflows
                  </span>
                </div>
              </div>

              <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
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
          <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
            How It Works
          </h2>

          <GlassCard className="p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="destructive" className="text-sm px-3 py-1">
                    Traditional
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Traditional prompts send entire codebases, documentation, and
                  context in every request, even when most of it isn't needed.
                </p>
                <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-5 font-mono">
                  <code className="text-xs text-zinc-400 block leading-loose">
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
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="text-sm px-3 py-1 bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90">
                    Progressive
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Progressive Disclosure intelligently loads only relevant
                  context for each step, dramatically reducing token usage while
                  maintaining quality.
                </p>
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl p-5 font-mono">
                  <code className="text-xs text-[#00F0FF] block leading-loose">
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

            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <Zap className="w-6 h-6 text-[#00F0FF]" />
                <h3 className="font-bold text-white text-lg">The Result</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-4">
                  <p className="text-3xl font-black text-[#00F0FF]">92%</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">
                    Context Reduction
                  </p>
                </div>
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl p-4">
                  <p className="text-3xl font-black text-[#00F0FF]">12.7x</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">
                    Faster Responses
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">
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
