"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Check, Plus, Wand2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBundleStore } from "@/lib/store/bundle";
import type { RegistryItem } from "@/types/registry";
import { formatProductName } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";

interface WorkflowRecommendation {
  items: RegistryItem[];
  reasoning: string;
  totalTokenSavings: number;
  breakdown: {
    agents: number;
    skills: number;
    commands: number;
    mcps: number;
    workflows: number;
    settings: number;
  };
}

export default function WorkflowPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<WorkflowRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem, hasItem } = useBundleStore();

  const examples = [
    "I need a full-stack DeFi project with Solana backend and Next.js frontend",
    "Build a smart contract audit and security testing workflow",
    "Create a Web3 development environment with testing and deployment tools",
    "Set up an AI-powered code review and optimization pipeline",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      let sessionId = sessionStorage.getItem('gicm-session-id');
      if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('gicm-session-id', sessionId);
      }

      const res = await fetch('/api/workflow/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.message || 'Rate limit exceeded. Please try again later.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: RegistryItem) => {
    if (!hasItem(item.id)) {
      addItem(item);
    }
  };

  const handleAddAll = () => {
    if (recommendation) {
      recommendation.items.forEach(item => {
        if (!hasItem(item.id)) {
          addItem(item);
        }
      });
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 border border-white/10 grid place-items-center mx-auto shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)]">
            <Wand2 className="w-10 h-10 text-[#00F0FF]" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              AI Stack Builder
            </h1>
            <p className="text-lg text-zinc-400 mt-3 max-w-2xl mx-auto">
              Describe your project in plain English, and Aether will architect the perfect toolchain for you.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-3">
                What are you building?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I'm building a DeFi lending protocol on Solana. I need tools for smart contract development, security auditing, and a React frontend..."
                className="w-full h-40 px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-zinc-600 focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 outline-none resize-none transition-all"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="w-full h-12 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-base shadow-[0_0_20px_-5px_rgba(0,240,255,0.5)] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Architecting Stack...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Architecture
                </>
              )}
            </Button>
          </form>

          {/* Examples */}
          <div className="pt-6 mt-6 border-t border-white/10">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Try these blueprints:</p>
            <div className="grid gap-2">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  disabled={loading}
                  className="w-full text-left text-sm text-zinc-400 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors border border-transparent hover:border-white/5"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center backdrop-blur-sm">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendation && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats */}
            <GlassCard className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display">Recommended Architecture</h2>
                  <p className="text-sm text-zinc-400 mt-1">Optimized for performance and cost efficiency</p>
                </div>
                <Button
                  onClick={handleAddAll}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10 font-semibold"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Add All to Stack
                </Button>
              </div>

              {/* Reasoning */}
              <div className="p-4 rounded-xl bg-[#00F0FF]/5 border border-[#00F0FF]/20 mb-6">
                <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-[#00F0FF] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">{recommendation.reasoning}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-3xl font-bold text-white">{recommendation.items.length}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Total Items</div>
                </div>

                {recommendation.breakdown.agents > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-3xl font-bold text-white">{recommendation.breakdown.agents}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Agents</div>
                  </div>
                )}

                {/* Token Savings Highlight */}
                <div className="p-4 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold text-[#00F0FF]">{recommendation.totalTokenSavings}%</div>
                  <div className="text-xs text-[#00F0FF]/70 uppercase tracking-wider mt-1">Efficiency Boost</div>
                </div>
              </div>
            </GlassCard>

            {/* Items List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white px-2">Components</h3>
              {recommendation.items.map((item) => {
                const inBundle = hasItem(item.id);
                return (
                  <GlassCard
                    key={item.id}
                    className={`p-0 overflow-hidden transition-all ${
                      inBundle ? "border-[#00F0FF]/50" : ""
                    }`}
                  >
                    <div className="p-6 flex items-start gap-5">
                        <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 grid place-items-center flex-shrink-0">
                            <span className="font-display font-bold text-2xl text-white">{item.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{formatProductName(item.name)}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider border border-white/5">
                                            {item.kind}
                                        </span>
                                        {item.tokenSavings && (
                                            <span className="text-xs text-[#00F0FF]">
                                                {item.tokenSavings}% savings
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleAddItem(item)}
                                    disabled={inBundle}
                                    size="sm"
                                    className={inBundle 
                                        ? "bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20" 
                                        : "bg-white text-black hover:bg-zinc-200"
                                    }
                                >
                                    {inBundle ? (
                                        <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Added
                                        </>
                                    ) : (
                                        <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}