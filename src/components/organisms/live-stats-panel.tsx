"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { LiveStatsResponse } from "@/types/live-activity";
import { LIVE_CONFIG } from "@/config/live";
import { Flame, Zap, Package, TrendingUp } from "lucide-react";
import { formatProductName } from "@/lib/utils";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;

    if (Math.abs(value - displayValue) < 1) {
      setDisplayValue(value);
      return;
    }

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue((prev) => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <span className="tabular-nums">
      {Math.floor(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
}

export function LiveStatsPanel() {
  const [stats, setStats] = useState<LiveStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/live/stats");
      if (!response.ok) throw new Error("Failed to fetch");

      const data: LiveStatsResponse = await response.json();
      setStats(data);
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    } catch (err) {
      // Stats fetch failed - component will retry on next interval
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, LIVE_CONFIG.statsUpdateInterval);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="h-full bg-black/50 backdrop-blur rounded-xl border border-white/10 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4" />
          <div className="h-16 bg-white/10 rounded mb-4" />
          <div className="h-16 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black/50 backdrop-blur rounded-xl border border-white/10 p-6">
      {/* Total Builders */}
      <motion.div
        animate={{ scale: pulse ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-lime-400" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
            Total Builders
          </h3>
        </div>
        <div className="text-4xl font-black text-white">
          <AnimatedCounter value={stats.totalBuilders} />
        </div>
      </motion.div>

      {/* Active Now */}
      <motion.div
        animate={{
          scale: pulse ? 1.05 : 1,
          boxShadow: pulse
            ? "0 0 20px rgba(132, 204, 22, 0.3)"
            : "0 0 10px rgba(132, 204, 22, 0.1)",
        }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="mb-6 p-4 rounded-lg bg-lime-500/10 border border-lime-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-lime-400 animate-pulse" />
          <h3 className="text-xs font-bold text-lime-400 uppercase tracking-wide">
            Building Now
          </h3>
        </div>
        <div className="text-3xl font-black text-lime-400">
          <AnimatedCounter value={stats.activeNow} />
        </div>
        <p className="text-xs text-lime-400/70 mt-1">Active in last 5 min</p>
      </motion.div>

      {/* Built Today */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-white/70" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
            Built Today
          </h3>
        </div>
        <div className="text-3xl font-black text-white">
          <AnimatedCounter value={stats.builtToday} />
        </div>
      </div>

      {/* Trending */}
      {stats.trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              Trending
            </h3>
          </div>
          <div className="space-y-2">
            {stats.trending.slice(0, 3).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/90 truncate flex-1 mr-2">
                  {formatProductName(item.name)}
                </span>
                <span className="text-lime-400 font-bold tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
