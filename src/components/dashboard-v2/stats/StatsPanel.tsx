"use client";

import { useState, useEffect } from "react";
import { DollarSign, Coins, TrendingUp, Zap } from "lucide-react";
import { AnimatedCounter } from "../hero/AnimatedCounter";

interface StatsPanelProps {
  theme: "dark" | "light";
}

interface TokenSavingsData {
  tokensSavedToday: number;
  costSavedToday: number;
  avgTokensPerStack: number;
  avgCostPerStack: number;
  totalTokensSaved: number;
  totalCostSaved: number;
  savingsRate: number;
  itemsSavedToday: number;
  itemsSavedTotal: number;
  formatted: {
    tokensSavedToday: string;
    costSavedToday: string;
    avgTokensPerStack: string;
    avgCostPerStack: string;
    totalTokensSaved: string;
    totalCostSaved: string;
    savingsRate: string;
  };
}

export function StatsPanel({ theme }: StatsPanelProps) {
  const [savings, setSavings] = useState<TokenSavingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavings = async () => {
    try {
      const response = await fetch("/api/analytics/token-savings");
      if (!response.ok) throw new Error("Failed to fetch");

      const data: TokenSavingsData = await response.json();
      setSavings(data);
    } catch (err) {
      // Failed to fetch token savings - component will show default values
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSavings();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !savings) {
    return (
      <div className={`
        h-[600px] rounded-2xl border p-6
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 rounded ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`} />
          <div className={`h-32 rounded ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`} />
          <div className={`h-32 rounded ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`} />
        </div>
      </div>
    );
  }
  return (
    <div className={`
      h-[600px] rounded-2xl border p-6 overflow-y-auto custom-scrollbar
      ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
    `}>
      {/* Token Savings = Money Savings */}
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className={`w-6 h-6 ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`} />
        <h3 className={`
          text-lg font-black uppercase tracking-wide
          ${theme === "dark" ? "text-white" : "text-black"}
        `}>
          💰 Token Savings = Money Savings
        </h3>
      </div>

      <div className="space-y-4">
        {/* Tokens Saved Today */}
        <div className={`
          p-4 rounded-xl border animate-pulse-glow
          ${theme === "dark"
            ? "bg-gradient-to-br from-lime-500/10 to-transparent border-lime-500/30"
            : "bg-gradient-to-br from-lime-50 to-transparent border-lime-200"
          }
        `}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-5 h-5 ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`} />
            <span className={`text-xs font-bold uppercase ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
              Tokens Saved Today
            </span>
          </div>
          <div className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-black"}`}>
            <AnimatedCounter value={savings.tokensSavedToday} /> tokens
          </div>
          <p className={`text-xl font-bold mt-1 ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
            {savings.formatted.costSavedToday} saved
          </p>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-3">
          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Coins className={`w-4 h-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Avg Tokens/Stack
                </span>
              </div>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                {savings.formatted.avgTokensPerStack} tokens
              </span>
            </div>
            <p className={`text-xs text-right ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
              {savings.formatted.avgCostPerStack} saved/stack
            </p>
          </div>

          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Total Tokens Saved
                </span>
              </div>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                {savings.formatted.totalTokensSaved}
              </span>
            </div>
            <p className={`text-xs text-right ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              {savings.formatted.totalCostSaved} total saved
            </p>
          </div>

          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Savings Rate
                </span>
              </div>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
                {savings.formatted.savingsRate} this week
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
