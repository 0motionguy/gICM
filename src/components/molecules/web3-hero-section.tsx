"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrambleText } from "@/components/ui/scramble-text";
import { InfiniteScramble } from "@/components/ui/infinite-scramble";
import {
  Zap,
  Code2,
  Rocket,
  Upload,
  Eye,
} from "lucide-react";

export function Web3HeroSection() {
  const [hoverSolana, setHoverSolana] = useState(false);
  const [hoverCA, setHoverCA] = useState(false);
  const [copied, setCopied] = useState(false);

  const awsCode = "xxxx-xxxx-xxxx-xxxx";

  const handleCopy = () => {
    navigator.clipboard.writeText(awsCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-zinc-900 to-black border border-lime-300/30 p-8 md:p-10">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>

        <div className="relative z-10">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div
              onMouseEnter={() => setHoverSolana(true)}
              onMouseLeave={() => setHoverSolana(false)}
              className="group"
            >
              <Badge className="bg-lime-300/20 text-lime-300 border-lime-300/50 hover:bg-lime-300/30 transition-all cursor-default px-3 py-1">
                <Zap className="w-3 h-3 mr-1.5" />
                {hoverSolana ? (
                  <ScrambleText text="Solana First" trigger="hover" duration={300} />
                ) : (
                  "Solana First"
                )}
              </Badge>
            </div>

            <Badge className="bg-white/10 text-zinc-300 border-white/20 px-3 py-1">
              <Code2 className="w-3 h-3 mr-1.5" />
              Web3 Native
            </Badge>

            <Badge className="bg-white/10 text-zinc-300 border-white/20 px-3 py-1">
              <Rocket className="w-3 h-3 mr-1.5" />
              Production Grade
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
            The AI Dev Stack for Web3.
          </h1>

          {/* Subheadline */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-lime-400">
              Built for Pro teams / Solo Devs
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mb-4">
            Remix agents, skills, and Web3 stacks. Ship today. <span className="font-semibold">Studio</span> (prompt→code→product) is in private alpha.
          </p>

          {/* Contract Address Teaser */}
          <div
            className="flex items-center justify-center gap-2 text-xs mb-6 cursor-pointer group"
            onMouseEnter={() => setHoverCA(true)}
            onMouseLeave={() => setHoverCA(false)}
          >
            <Eye size={14} className="text-zinc-400 group-hover:text-lime-400 transition-colors" />
            <span className="text-zinc-400 font-medium">CA:</span>
            <InfiniteScramble
              length={44}
              active={hoverCA}
              className={`font-mono text-lime-300/70 tracking-wider transition-all ${hoverCA ? '' : 'blur-sm'}`}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-6 py-3 bg-lime-300 text-black font-bold rounded-lg hover:bg-lime-400 transition-colors">
              Start Remixing
            </button>
            <button className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              Try AI Stack Builder
            </button>
          </div>

          {/* AWS Activate Partner Section */}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-sm">
            <div className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-zinc-300 font-medium">
              AWS Activate Partner
            </div>
            <span className="text-zinc-400">Up to $100k credits</span>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">CA:</span>
              <span className="text-zinc-500 font-mono">{awsCode}</span>
              <button
                onClick={handleCopy}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-lime-300 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Studio Alpha Key Section */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-100 transition-colors">
                Request Studio Alpha Key
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 md:w-48">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Alpha keys</span>
                    <span className="font-mono">289/500</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-300 to-emerald-400 rounded-full transition-all"
                      style={{ width: '57.8%' }}
                    />
                  </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-lime-300 border border-white/10 rounded-lg hover:border-lime-300/50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Share to boost
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                90
              </div>
              <div className="text-xs text-zinc-400">Agents</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                96
              </div>
              <div className="text-xs text-zinc-400">Skills</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                33
              </div>
              <div className="text-xs text-zinc-400">Workflows</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                82
              </div>
              <div className="text-xs text-zinc-400">MCP Integrations</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                ×4.2
              </div>
              <div className="text-xs text-zinc-400">Build Speed</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                88–92%
              </div>
              <div className="text-xs text-zinc-400">Context Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
