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
  Bot,
  Box,
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
              href="https://github.com/Kermit457/ClawdBot"
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

            <Badge className="rounded-lg border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1.5 text-[#00F0FF]">
              <Box className="mr-2 h-3.5 w-3.5" />
              OpenClaw Compatible
            </Badge>

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
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
              Built by agents. For agents.
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              The Agent <br />
              <span className="bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                Marketplace.
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              <span className="font-medium text-white">
                {stats.agents +
                  stats.skills +
                  stats.commands +
                  stats.mcps +
                  stats.workflows}
                + tools.
              </span>{" "}
              100% scanned. OpenClaw compatible. Every runtime.
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-zinc-500">
              <span className="text-[#00F0FF]">
                OpenClaw & Moltbook compatible
              </span>
              <span>·</span>
              <span>5 API endpoints</span>
              <span>·</span>
              <span>OpenAPI docs</span>
              <span>·</span>
              <span>Zero auth required</span>
            </p>

            {/* Partnership Badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              {/* AWS Startup Partner */}
              <div className="inline-flex items-center gap-3 rounded-xl border border-[#FF9900]/30 bg-gradient-to-r from-[#FF9900]/10 to-[#FFB84D]/5 px-5 py-3">
                <svg
                  className="h-10 w-10 text-[#FF9900]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.16-.863.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.28-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.319-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.414l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#FF9900]">
                    AWS Startup Partner
                  </span>
                  <span className="text-lg font-bold text-[#FFB84D]">
                    Up to $400k
                  </span>
                </div>
              </div>

              {/* Moltbook Agent Discovery */}
              <div className="inline-flex items-center gap-3 rounded-xl border border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF]/10 to-[#7B5CFF]/5 px-5 py-3">
                <Bot className="h-10 w-10 text-[#00F0FF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#00F0FF]">
                    Moltbook Compatible
                  </span>
                  <span className="text-lg font-bold text-[#7B5CFF]">
                    1.5M+ AI Agents
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
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
              Browse Tools
            </button>

            <Link href="/guides/vibe-coding">
              <button className="rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] px-8 py-4 font-bold text-white shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)] transition-all hover:opacity-90">
                Start Building
              </button>
            </Link>

            <a
              href="/.well-known/claude-marketplace.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                Agent API
              </button>
            </a>
          </div>

          {/* Install Command */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#05050A] px-4 py-3">
            <span className="font-mono text-zinc-500">$</span>
            <code className="font-mono text-sm text-[#00F0FF]">
              npx @clawdbot/cli install
            </code>
            <span className="terminal-cursor font-mono text-[#00F0FF]">_</span>
            <span className="ml-2 hidden border-l border-white/10 pl-3 font-mono text-xs text-zinc-600 sm:inline-block">
              one command, full stack
            </span>
          </div>

          {/* Stats Grid */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/5 bg-white/5 md:grid-cols-4 lg:grid-cols-6">
            {[
              {
                label: "Tools",
                value:
                  stats.agents +
                  stats.skills +
                  stats.commands +
                  stats.mcps +
                  stats.workflows,
              },
              { label: "Agents", value: stats.agents },
              { label: "MCPs", value: stats.mcps },
              { label: "Endpoints", value: "5" },
              { label: "Scanned", value: "100%" },
              { label: "Network", value: "1.5M+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-[#0F0F11] p-6 text-center transition-colors hover:bg-[#151518]"
              >
                <div className="mb-1 font-mono text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
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
            <h3 className="font-bold text-white">Early Access</h3>
            <p className="text-sm text-zinc-400">
              <span className="font-mono text-[#00F0FF]">
                {waitlistCount}/500
              </span>{" "}
              slots left
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
      <BridgeModal isOpen={showBridge} onClose={() => setShowBridge(false)} />
    </div>
  );
}
