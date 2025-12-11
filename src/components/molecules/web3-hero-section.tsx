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
  ArrowLeftRight,
} from "lucide-react";
import { BridgeModal } from "./bridge-modal";

export function Web3HeroSection() {
  const [hoverSolana, setHoverSolana] = useState(false);
  const [hoverCA, setHoverCA] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(289);
  const [showBridge, setShowBridge] = useState(false);

  const stats = useMemo(
    () => ({
      agents: REGISTRY.filter((item) => item.kind === "agent").length,
      skills: REGISTRY.filter((item) => item.kind === "skill").length,
      commands: REGISTRY.filter((item) => item.kind === "command").length,
      workflows: WORKFLOWS.length,
      mcps: REGISTRY.filter((item) => item.kind === "mcp").length,
      settings: REGISTRY.filter((item) => item.kind === "setting").length,
    }),
    []
  );

  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setWaitlistCount(data.count);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Main Hero Card - Deep Charcoal with Aether Glow */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F0F11] p-8 shadow-2xl md:p-12">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#00F0FF]/5 blur-[100px]" />

        <div className="relative z-10">
          {/* Top Badges */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/Kermit457/gICM"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Badge className="cursor-pointer rounded-lg border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 transition-all hover:bg-white/10 hover:text-white">
                <Github className="mr-2 h-3.5 w-3.5" />
                <span className="font-medium">GitHub</span>
                <ExternalLink className="ml-1.5 h-3 w-3 opacity-50 group-hover:opacity-100" />
              </Badge>
            </a>

            <Badge className="rounded-lg border-[#D97757]/20 bg-[#D97757]/10 px-3 py-1.5 text-[#D97757]">
              <Code2 className="mr-2 h-3.5 w-3.5" />
              Claude Code
            </Badge>

            <Badge className="rounded-lg border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1.5 text-[#00F0FF]">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Gemini 3.0 Pro
            </Badge>

            <Badge className="rounded-lg border-[#7000FF]/20 bg-[#7000FF]/10 px-3 py-1.5 text-[#A060FF]">
              <Cpu className="mr-2 h-3.5 w-3.5" />
              GPT-5.1 Codex
            </Badge>

            {/* Universal Bridge Button */}
            <button
              onClick={() => setShowBridge(true)}
              className="flex items-center rounded-lg border border-cyan-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1.5 text-sm font-medium text-cyan-400 transition-all hover:from-blue-500/30 hover:to-cyan-500/30"
            >
              <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
              Universal Bridge
            </button>
          </div>

          {/* Headline Area */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              The Universal <br />
              <span className="bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                AI Dev Marketplace.
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              Aether connects every runtime. Build with
              <span className="font-medium text-white">
                {" "}
                {stats.agents + stats.skills + stats.commands + stats.mcps}+
                verified items
              </span>{" "}
              across agents, skills, and commands. Cross-chain compatible with
              Claude, Gemini, and OpenAI.
            </p>
          </div>

          {/* Action Bar */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/guides/vibe-coding">
              <button className="rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] px-8 py-4 font-bold text-white shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)] transition-all hover:opacity-90">
                Start Vibe Coding
              </button>
            </Link>

            <button
              className="rounded-xl bg-white px-8 py-4 font-bold text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:bg-zinc-200"
              onClick={() => {
                const marketplace = document.getElementById(
                  "marketplace-section"
                );
                marketplace?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Explore Catalog
            </button>

            <Link href="/projects">
              <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                View Projects
              </button>
            </Link>
          </div>

          {/* Install Command */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#05050A] px-4 py-3">
            <span className="text-zinc-500">$</span>
            <code className="font-mono text-sm text-[#00F0FF]">
              npx @gicm/cli list agents
            </code>
            <span className="ml-2 hidden border-l border-white/10 pl-3 text-sm text-zinc-600 sm:inline-block">
              Browse Catalog
            </span>
          </div>

          {/* Stats Grid - Minimal & Clean */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/5 bg-white/5 md:grid-cols-4 lg:grid-cols-6">
            {[
              { label: "Agents", value: stats.agents },
              { label: "Skills", value: stats.skills },
              { label: "Commands", value: stats.commands },
              { label: "MCPs", value: stats.mcps },
              { label: "Build Time", value: "4.2x" },
              { label: "Token Savings", value: "90%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-[#0F0F11] p-6 text-center transition-colors hover:bg-[#151518]"
              >
                <div className="mb-1 text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Studio Access Bar */}
      <div className="mt-6 flex flex-col items-center justify-between rounded-2xl border border-white/[0.05] bg-gradient-to-r from-zinc-900/50 to-[#0F0F11]/50 p-6 backdrop-blur-md md:flex-row">
        {/* LEFT: CA Scramble */}
        <div
          className="group mb-4 flex cursor-pointer items-center gap-4 md:mb-0"
          onMouseEnter={() => setHoverCA(true)}
          onMouseLeave={() => setHoverCA(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10">
            <Eye className="h-5 w-5 text-[#00F0FF]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CA:</span>
            <InfiniteScramble
              length={32}
              active={hoverCA}
              className={`font-mono text-sm tracking-wider text-[#00F0FF] transition-all ${hoverCA ? "" : "blur-sm"}`}
            />
          </div>
        </div>

        {/* RIGHT: Private Alpha Access */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10">
            <Zap className="h-5 w-5 text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="font-bold text-white">Private Alpha Access</h3>
            <p className="text-sm text-zinc-400">
              <span className="font-mono text-[#00F0FF]">
                {waitlistCount}/500
              </span>{" "}
              keys claimed
            </p>
          </div>
          <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-white/5 md:block">
            <div
              className="h-full rounded-full bg-[#00F0FF]"
              style={{ width: `${(waitlistCount / 500) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setWaitlistOpen(true)}
            className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Join Waitlist
          </button>
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
