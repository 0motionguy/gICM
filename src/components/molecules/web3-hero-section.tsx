"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrambleText } from "@/components/ui/scramble-text";
import { InfiniteScramble } from "@/components/ui/infinite-scramble";
import { WaitlistModal } from "@/components/WaitlistModal";
import { REGISTRY } from "@/lib/registry";
import { WORKFLOWS } from "@/lib/workflows";
import {
  Zap,
  Code2,
  Rocket,
  Upload,
  Eye,
  Github,
  ExternalLink,
  Sparkles,
  Cpu,
} from "lucide-react";

export function Web3HeroSection() {
  const [hoverSolana, setHoverSolana] = useState(false);
  const [hoverCA, setHoverCA] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(289);

  const stats = useMemo(() => ({
    agents: REGISTRY.filter(item => item.kind === 'agent').length,
    skills: REGISTRY.filter(item => item.kind === 'skill').length,
    commands: REGISTRY.filter(item => item.kind === 'command').length,
    workflows: WORKFLOWS.length,
    mcps: REGISTRY.filter(item => item.kind === 'mcp').length,
    settings: REGISTRY.filter(item => item.kind === 'setting').length,
  }), []);

  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => { if (data.count) setWaitlistCount(data.count); })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
      {/* Main Hero Card - Deep Charcoal with Aether Glow */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F0F11] p-8 md:p-12 shadow-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F0FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <a
              href="https://github.com/Kermit457/gICM"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Badge className="bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white transition-all px-3 py-1.5 cursor-pointer rounded-lg">
                <Github className="w-3.5 h-3.5 mr-2" />
                <span className="font-medium">GitHub</span>
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-50 group-hover:opacity-100" />
              </Badge>
            </a>

            <Badge className="bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20 px-3 py-1.5 rounded-lg">
              <Code2 className="w-3.5 h-3.5 mr-2" />
              Claude Code
            </Badge>

            <Badge className="bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Gemini 3.0 Pro
            </Badge>

            <Badge className="bg-[#7000FF]/10 text-[#A060FF] border-[#7000FF]/20 px-3 py-1.5 rounded-lg">
              <Cpu className="w-3.5 h-3.5 mr-2" />
              GPT-5.1 Codex
            </Badge>
          </div>

          {/* Headline Area */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              The Universal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                AI Dev Marketplace.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              Aether connects every runtime. Build with 
              <span className="text-white font-medium"> {stats.agents + stats.skills + stats.commands + stats.mcps}+ verified items</span> across agents, skills, and commands. 
              Cross-chain compatible with Claude, Gemini, and OpenAI.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link href="/guides/vibe-coding">
              <button className="px-8 py-4 bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]">
                Start Vibe Coding
              </button>
            </Link>

            <button
              className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              onClick={() => {
                const marketplace = document.getElementById('marketplace-section');
                marketplace?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Explore Catalog
            </button>

            <Link href="/projects">
              <button className="px-8 py-4 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm">
                View Projects
              </button>
            </Link>
          </div>

          {/* Install Command */}
          <div className="mt-8 inline-flex items-center gap-3 px-4 py-3 bg-[#05050A] border border-white/10 rounded-xl">
            <span className="text-zinc-500">$</span>
            <code className="font-mono text-sm text-[#00F0FF]">
              npx @gicm/cli list agents
            </code>
            <span className="text-zinc-600 text-sm hidden sm:inline-block ml-2 border-l border-white/10 pl-3">
               Browse Catalog
            </span>
          </div>

          {/* Stats Grid - Minimal & Clean */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-white/5 mt-16 rounded-xl overflow-hidden border border-white/5">
            {[
              { label: "Agents", value: stats.agents },
              { label: "Skills", value: stats.skills },
              { label: "Commands", value: stats.commands },
              { label: "MCPs", value: stats.mcps },
              { label: "Platforms", value: "3" },
              { label: "Token Savings", value: "90%" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0F0F11] p-6 flex flex-col items-center text-center hover:bg-[#151518] transition-colors">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Studio Access Bar */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border border-white/[0.05] bg-gradient-to-r from-zinc-900/50 to-[#0F0F11]/50 backdrop-blur-md">
        {/* LEFT: CA Scramble */}
        <div
          className="flex items-center gap-4 cursor-pointer group mb-4 md:mb-0"
          onMouseEnter={() => setHoverCA(true)}
          onMouseLeave={() => setHoverCA(false)}
        >
          <div className="h-10 w-10 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">CA:</span>
            <InfiniteScramble
              length={32}
              active={hoverCA}
              className={`font-mono text-[#00F0FF] text-sm tracking-wider transition-all ${hoverCA ? '' : 'blur-sm'}`}
            />
          </div>
        </div>

        {/* RIGHT: Private Alpha Access */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Private Alpha Access</h3>
            <p className="text-sm text-zinc-400">
              <span className="font-mono text-[#00F0FF]">{waitlistCount}/500</span> keys claimed
            </p>
          </div>
          <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden hidden md:block">
            <div
              className="h-full bg-[#00F0FF] rounded-full"
              style={{ width: `${(waitlistCount / 500) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setWaitlistOpen(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors whitespace-nowrap"
          >
            Join Waitlist
          </button>
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}