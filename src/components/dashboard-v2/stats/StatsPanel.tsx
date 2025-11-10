"use client";

import { useState, useEffect } from "react";
import type { LiveStatsResponse } from "@/types/live-activity";
import { TrendingUp, Rocket, Zap, Target } from "lucide-react";

interface StatsPanelProps {
  theme: "dark" | "light";
}

export function StatsPanel({ theme }: StatsPanelProps) {
  const [stats, setStats] = useState<LiveStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const recentDeployments = [
    { name: "DeFi Trading Bot", time: "2m ago", success: true },
    { name: "NFT Marketplace", time: "8m ago", success: true },
    { name: "Web3 Analytics", time: "15m ago", success: true },
    { name: "Solana dApp Starter", time: "23m ago", success: false },
    { name: "DAO Governance", time: "31m ago", success: true },
  ];

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/live/stats");
      if (!response.ok) throw new Error("Failed to fetch");

      const data: LiveStatsResponse = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
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
      {/* Recent Deployments */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
          <h3 className={`
            text-sm font-bold uppercase tracking-wide
            ${theme === "dark" ? "text-white/70" : "text-black/70"}
          `}>
            Recent Deployments
          </h3>
        </div>
        <div className="space-y-2">
          {recentDeployments.map((deployment, index) => (
            <div
              key={index}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                transition-all hover-scale
                ${theme === "dark"
                  ? "bg-white/5 border-white/8 hover:bg-white/10"
                  : "bg-white border-black/20 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${deployment.success
                    ? "bg-lime-500"
                    : "bg-red-500"
                  }
                `} />
                <span className={`
                  text-sm font-medium truncate
                  ${theme === "dark" ? "text-white" : "text-black"}
                `}>
                  {deployment.name}
                </span>
              </div>
              <span className={`text-xs flex-shrink-0 ml-2 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                {deployment.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className={`w-5 h-5 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
          <h3 className={`
            text-sm font-bold uppercase tracking-wide
            ${theme === "dark" ? "text-white/70" : "text-black/70"}
          `}>
            Quick Stats
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className={`text-xs mb-1 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Avg. Stack Size
            </div>
            <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-black"}`}>
              7.2
            </div>
          </div>
          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className={`text-xs mb-1 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Success Rate
            </div>
            <div className={`text-2xl font-black ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
              94%
            </div>
          </div>
          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className={`text-xs mb-1 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Fastest Build
            </div>
            <div className={`text-2xl font-black ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
              4:23
            </div>
          </div>
          <div className={`
            p-3 rounded-lg border
            ${theme === "dark"
              ? "bg-white/5 border-white/8"
              : "bg-white border-black/20"
            }
          `}>
            <div className={`text-xs mb-1 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Top Category
            </div>
            <div className={`text-lg font-black ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
              DeFi
            </div>
          </div>
        </div>
      </div>

      {/* Trending - Expanded to 10 items */}
      {stats.trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className={`w-5 h-5 ${theme === "dark" ? "text-white/70" : "text-black/70"}`} />
            <h3 className={`
              text-sm font-bold uppercase tracking-wide
              ${theme === "dark" ? "text-white/70" : "text-black/70"}
            `}>
              Trending Items
            </h3>
          </div>
          <div className="space-y-2">
            {stats.trending.slice(0, 10).map((item, index) => (
              <div
                key={item.name}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  transition-all hover-scale
                  ${theme === "dark"
                    ? "bg-white/5 border-white/8 hover:bg-white/10"
                    : "bg-white border-black/20 hover:bg-gray-50"
                  }
                  ${index === 0 && "animate-pulse-glow border-yellow-500/50"}
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`
                    w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                      : index === 1
                      ? (theme === "dark" ? "bg-gray-400/20 text-gray-400" : "bg-gray-100 text-gray-600")
                      : index === 2
                      ? (theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600")
                      : (theme === "dark" ? "bg-white/10 text-white/60" : "bg-black/5 text-black/60")
                    }
                  `}>
                    {index === 0 ? "🔥" : index + 1}
                  </div>
                  <span className={`
                    text-sm font-medium truncate
                    ${theme === "dark" ? "text-white" : "text-black"}
                  `}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`
                    text-sm font-bold tabular-nums
                    ${theme === "dark" ? "text-lime-400" : "text-lime-600"}
                  `}>
                    {item.count}
                  </span>
                  {index < 3 && (
                    <Zap className={`w-4 h-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
