"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrambleText } from "@/components/ui/scramble-text";
import { InfiniteScramble } from "@/components/ui/infinite-scramble";
import {
  Zap,
  Shield,
  Code2,
  Rocket,
  TrendingUp,
  ExternalLink,
  Eye,
} from "lucide-react";

export function Web3HeroSection() {
  const [hoverSolana, setHoverSolana] = useState(false);
  const [hoverCA, setHoverCA] = useState(false);

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
          <div className="flex flex-wrap gap-2 mb-4">
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
              <Shield className="w-3 h-3 mr-1.5" />
              DeFi Ready
            </Badge>

            <Badge className="bg-white/10 text-zinc-300 border-white/20 px-3 py-1">
              <Rocket className="w-3 h-3 mr-1.5" />
              Production Grade
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            The AI Dev Stack
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-lime-400">
              Built for Web3 Builders
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mb-4">
            90 specialized agents, 96 progressive skills, 33 orchestration workflows, and 82 MCP integrations optimized for
            Solana, DeFi, and Web3 development. Ship faster with 88-92% token savings.
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-lime-300 mb-1">
                24
              </div>
              <div className="text-xs text-zinc-400">Solana Agents</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                18
              </div>
              <div className="text-xs text-zinc-400">DeFi Integrations</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                12
              </div>
              <div className="text-xs text-zinc-400">Web3 Security Tools</div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                92%
              </div>
              <div className="text-xs text-zinc-400">Token Savings</div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-300/10 border border-lime-300/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-lime-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">
                  Solana Program Development
                </h3>
                <p className="text-xs text-zinc-400">
                  Anchor framework, PDA patterns, CPI orchestration, and Solana security audits
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">
                  DeFi Protocol Integration
                </h3>
                <p className="text-xs text-zinc-400">
                  Aave, Uniswap V3, concentrated liquidity, and yield optimization strategies
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">
                  Production Web3 Apps
                </h3>
                <p className="text-xs text-zinc-400">
                  Wallet integration, transaction handling, and real-time blockchain data
                </p>
              </div>
            </div>
          </div>

          {/* Ecosystem Links */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-lime-300/50 transition-all text-xs text-zinc-300 hover:text-lime-300"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <span>Solana Ecosystem</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://github.com/solana-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-lime-300/50 transition-all text-xs text-zinc-300 hover:text-lime-300"
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Solana Labs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://www.anchor-lang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-lime-300/50 transition-all text-xs text-zinc-300 hover:text-lime-300"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Anchor Framework</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://helius.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-lime-300/50 transition-all text-xs text-zinc-300 hover:text-lime-300"
            >
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Helius RPC</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
