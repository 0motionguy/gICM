"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrambleText } from "@/components/ui/scramble-text";
import { formatProductName } from "@/lib/utils";
import {
  Zap,
  Shield,
  Code2,
  Rocket,
  TrendingUp,
  ArrowRight,
  Bot,
  Terminal,
  Plug,
} from "lucide-react";

const FEATURED_SOLANA_ITEMS = [
  {
    id: "solana-guardian-auditor",
    name: "Solana Guardian Auditor",
    type: "Agent",
    icon: Shield,
    description:
      "Security auditor for Solana programs with PDA validation, signer checks, and economic attack prevention",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800/30",
    textColor: "text-red-600 dark:text-red-400",
  },
  {
    id: "icm-anchor-architect",
    name: "Anchor Architect",
    type: "Agent",
    icon: Code2,
    description:
      "Anchor framework specialist for bonding curves, PDAs, and CPI orchestration",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/10",
    borderColor: "border-purple-200 dark:border-purple-800/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "solana-agent-kit",
    name: "Solana Agent Kit",
    type: "MCP",
    icon: Plug,
    description:
      "Complete Solana integration with RPC, wallet management, and transaction building",
    color: "from-lime-500 to-emerald-500",
    bgColor: "bg-lime-50 dark:bg-lime-900/10",
    borderColor: "border-lime-200 dark:border-lime-800/30",
    textColor: "text-lime-600 dark:text-lime-400",
  },
  {
    id: "helius-rpc",
    name: "Helius RPC",
    type: "MCP",
    icon: Zap,
    description:
      "High-performance Solana RPC with webhooks, enhanced APIs, and DAS support",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    borderColor: "border-blue-200 dark:border-blue-800/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "anchor-deployment",
    name: "Anchor Deployment",
    type: "Command",
    icon: Terminal,
    description:
      "Deploy Solana programs with Anchor framework, test validation, and network configs",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/10",
    borderColor: "border-amber-200 dark:border-amber-800/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "solana-security-audit",
    name: "Solana Security Audit",
    type: "Skill",
    icon: Shield,
    description:
      "Comprehensive security audit for Solana programs with automated vulnerability detection",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/10",
    borderColor: "border-indigo-200 dark:border-indigo-800/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
];

const WEB3_USE_CASES = [
  {
    title: "DeFi Protocols",
    description: "AMMs, lending, yield aggregators",
    icon: TrendingUp,
    stats: "12 tools",
  },
  {
    title: "NFT Infrastructure",
    description: "Metaplex, compressed NFTs, marketplace",
    icon: Rocket,
    stats: "8 agents",
  },
  {
    title: "Token Launch",
    description: "SPL tokens, liquidity, tokenomics",
    icon: Zap,
    stats: "6 templates",
  },
  {
    title: "dApp Frontends",
    description: "Wallet integration, real-time chain data",
    icon: Code2,
    stats: "15 components",
  },
];

export function SolanaShowcase() {
  const [hoverHeader, setHoverHeader] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* Header */}
      <div
        className="mb-8 text-center"
        onMouseEnter={() => setHoverHeader(true)}
        onMouseLeave={() => setHoverHeader(false)}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/50 bg-lime-300/20 px-4 py-2">
          <Zap className="h-5 w-5 text-lime-600" />
          <span className="font-bold text-lime-600">
            {hoverHeader ? (
              <ScrambleText
                text="Solana Ecosystem"
                trigger="hover"
                duration={400}
              />
            ) : (
              "Solana Ecosystem"
            )}
          </span>
        </div>

        <h2 className="mb-3 text-3xl font-black text-black dark:text-white md:text-4xl">
          Solana. Ship-ready.
        </h2>
        <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">
          24 agents. 18 DeFi tools. 12 security auditors. Audit to deploy.
        </p>
      </div>

      {/* Featured Items Grid */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURED_SOLANA_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.id} href={`/items/${item.id}`}>
              <Card
                className={`group cursor-pointer p-5 transition-all hover:shadow-lg ${item.borderColor}`}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className={`h-12 w-12 rounded-lg ${item.bgColor} border ${item.borderColor} flex flex-shrink-0 items-center justify-center`}
                  >
                    <Icon className={`h-6 w-6 ${item.textColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-bold text-black transition-colors group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-400">
                      {formatProductName(item.name)}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>

                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-lime-600 transition-all group-hover:gap-3 dark:text-lime-400">
                  <span>View details</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Use Cases Section */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-8 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-800/50">
        <h3 className="mb-6 text-center text-2xl font-black text-black dark:text-white">
          What You Can Build
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {WEB3_USE_CASES.map((useCase, idx) => {
            const Icon = useCase.icon;

            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-lime-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-lime-700"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-lime-200 bg-lime-100 dark:border-lime-800 dark:bg-lime-900/30">
                    <Icon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-bold text-black dark:text-white">
                      {useCase.title}
                    </h4>
                    <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {useCase.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-lime-200 bg-lime-50 text-xs text-lime-700 dark:border-lime-800 dark:bg-lime-900/20 dark:text-lime-400"
                    >
                      {useCase.stats}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-lime-700">
              Browse All Solana Tools
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 text-3xl font-black text-lime-600 dark:text-lime-400">
            24
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Solana Agents
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 text-3xl font-black text-purple-600 dark:text-purple-400">
            18
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            DeFi Tools
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 text-3xl font-black text-blue-600 dark:text-blue-400">
            12
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Security Auditors
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 text-3xl font-black text-amber-600 dark:text-amber-400">
            100%
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Production Ready
          </div>
        </div>
      </div>
    </div>
  );
}
