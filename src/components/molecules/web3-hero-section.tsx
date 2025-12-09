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

  const stats = useMemo(
    () => ({
      agents: REGISTRY.filter((item) => item.kind === "agent").length,
      skills: REGISTRY.filter((item) => item.kind === "skill").length,
      commands: REGISTRY.filter((item) => item.kind === "command").length,
      workflows: WORKFLOWS.length,
      mcps: REGISTRY.filter((item) => item.kind === "mcp").length,
      settings: REGISTRY.filter((item) => item.kind === "setting").length,
    }),
    [],
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

            {/* AWS Startup Partner Badge */}
            <Badge className="bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20 px-3 py-1.5 rounded-lg">
              <svg
                className="w-3.5 h-3.5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.16-.863.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.28-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.319-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.414l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z" />
              </svg>
              AWS Startup Partner
              <span className="ml-2 text-[#FFB84D]">Up to $400k</span>
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
              <span className="text-white font-medium">
                {" "}
                {stats.agents + stats.skills + stats.commands + stats.mcps}+
                verified items
              </span>{" "}
              across agents, skills, and commands. Cross-chain compatible with
              Claude, Gemini, and OpenAI.
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
                const marketplace = document.getElementById(
                  "marketplace-section",
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
              { label: "Build Time", value: "4.2x" },
              { label: "Token Savings", value: "90%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#0F0F11] p-6 flex flex-col items-center text-center hover:bg-[#151518] transition-colors"
              >
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
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
              className={`font-mono text-[#00F0FF] text-sm tracking-wider transition-all ${hoverCA ? "" : "blur-sm"}`}
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
              <span className="font-mono text-[#00F0FF]">
                {waitlistCount}/500
              </span>{" "}
              keys claimed
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
