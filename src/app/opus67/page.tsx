"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Zap,
  Copy,
  Check,
  Terminal,
  Sparkles,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalDisplay } from "@/components/ui/terminal-display";
import {
  BENCHMARK_ASCII,
  BENCHMARK_INSTALL_COMMAND,
  BENCHMARK_METRICS,
} from "@/lib/benchmark-data";
import { toast } from "sonner";
import { ArchitectureCard } from "@/components/ui/architecture-card";
import {
  OPUS67_ARCHITECTURE_ASCII,
  MEMORY_ARCHITECTURE_ASCII,
  USP_ASCII,
} from "@/lib/architecture-ascii";

export default function Opus67BenchmarkPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(BENCHMARK_INSTALL_COMMAND);
      setCopied(true);
      toast.success("Install command copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://gicm.app">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </a>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-[#00F0FF]" />
                <h1 className="text-xl font-bold text-white">
                  OPUS 67 <span className="text-zinc-500">Benchmark</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Sparkles className="h-4 w-4 text-[#00F0FF]" />
              <span>v6.2.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {Object.values(BENCHMARK_METRICS).map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-xs text-zinc-500">{metric.label}</p>
              <p className="text-[10px] text-[#00F0FF]">{metric.delta}</p>
            </div>
          ))}
        </div>

        {/* Install Command */}
        <div className="mb-8 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-[#00F0FF]" />
              <code className="font-mono text-lg text-white">
                {BENCHMARK_INSTALL_COMMAND}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyInstall}
              className="gap-2 text-zinc-400 hover:text-white"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Architecture Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ArchitectureCard
            title="Architecture"
            icon={<Zap className="h-6 w-6" />}
            iconColor="text-[#00F0FF]"
            description="141 Skills • 83 MCPs • 30 Modes • 108 Agents"
            asciiContent={OPUS67_ARCHITECTURE_ASCII}
          />
          <ArchitectureCard
            title="Memory"
            icon={<Brain className="h-6 w-6" />}
            iconColor="text-purple-400"
            description="5 Adapters • Cross-session • Multi-hop reasoning"
            asciiContent={MEMORY_ARCHITECTURE_ASCII}
          />
          <ArchitectureCard
            title="Why OPUS 67"
            icon={<Sparkles className="h-6 w-6" />}
            iconColor="text-yellow-400"
            description="One command, everything works"
            asciiContent={USP_ASCII}
          />
        </div>

        {/* Full Benchmark Display */}
        <TerminalDisplay content={BENCHMARK_ASCII} showCopy={true} />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>141 Skills | 108 Agents | 83 MCPs | 30 Modes | 5 Memory Sources</p>
          <p className="mt-1">
            Built with Claude Opus 4.5 + Unified Memory + Multi-Model Routing
          </p>
        </div>
      </main>
    </div>
  );
}
