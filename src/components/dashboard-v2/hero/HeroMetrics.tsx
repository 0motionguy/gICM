"use client";

import { useState, useEffect } from "react";
import { Flame, Zap, Package, TrendingUp, Users, Sparkles } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendArrow } from "./TrendArrow";

interface HeroMetricsProps {
  theme: "dark" | "light";
}

interface MetricData {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: "purple" | "lime" | "yellow" | "blue" | "orange" | "pink";
}

export function HeroMetrics({ theme }: HeroMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      label: "Total Builders",
      value: 2847,
      change: 12.8,
      icon: <Users className="w-7 h-7" />,
      color: "lime",
    },
    {
      label: "Building Now",
      value: 18,
      change: 24.5,
      icon: <Zap className="w-7 h-7" />,
      color: "lime",
    },
    {
      label: "Built Today",
      value: 143,
      change: 8.3,
      icon: <Package className="w-7 h-7" />,
      color: "yellow",
    },
    {
      label: "Trending Stacks",
      value: 67,
      change: 15.2,
      icon: <TrendingUp className="w-7 h-7" />,
      color: "blue",
    },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        if (metric.label === "Building Now") {
          // Random variation for active users
          const variation = Math.floor(Math.random() * 5) - 2;
          return {
            ...metric,
            value: Math.max(15, Math.min(25, metric.value + variation)),
          };
        }
        return metric;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string, isLight: boolean) => {
    const colors = {
      purple: isLight
        ? "bg-purple-500/10 text-purple-600 border-purple-200"
        : "bg-purple-500/20 text-purple-400 border-purple-500/40",
      lime: isLight
        ? "bg-lime-500/10 text-lime-600 border-lime-200"
        : "bg-lime-500/20 text-lime-400 border-lime-500/40",
      yellow: isLight
        ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      blue: isLight
        ? "bg-blue-500/10 text-blue-600 border-blue-200"
        : "bg-blue-500/20 text-blue-400 border-blue-500/40",
      orange: isLight
        ? "bg-orange-500/10 text-orange-600 border-orange-200"
        : "bg-orange-500/20 text-orange-400 border-orange-500/40",
      pink: isLight
        ? "bg-pink-500/10 text-pink-600 border-pink-200"
        : "bg-pink-500/20 text-pink-400 border-pink-500/40",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`
            group relative overflow-hidden rounded-2xl border p-6
            transition-all duration-300 hover-lift gpu-accelerated
            ${theme === "dark" ? "glass-card" : "glass-card-light"}
            ${metric.label === "Building Now" && "animate-pulse-glow"}
            stagger-${index + 1}
          `}
        >
          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-xl border flex items-center justify-center mb-4
            transition-transform group-hover:scale-110
            ${getColorClasses(metric.color, theme === "light")}
          `}>
            {metric.icon}
          </div>

          {/* Value */}
          <div className={`
            text-5xl font-black mb-2 tabular-nums
            ${theme === "dark" ? "text-white" : "text-black"}
          `}>
            <AnimatedCounter value={metric.value} />
          </div>

          {/* Label */}
          <div className={`
            text-sm font-semibold uppercase tracking-wide mb-2
            ${theme === "dark" ? "text-white/60" : "text-black/60"}
          `}>
            {metric.label}
          </div>

          {/* Trend */}
          <div className="flex items-center gap-2">
            <TrendArrow value={metric.change} theme={theme} />
            <span className={`
              text-sm font-bold
              ${metric.change >= 0
                ? (theme === "dark" ? "text-lime-400" : "text-lime-600")
                : (theme === "dark" ? "text-red-400" : "text-red-600")
              }
            `}>
              {metric.change >= 0 ? "+" : ""}{metric.change.toFixed(1)}%
            </span>
            <span className={`
              text-xs
              ${theme === "dark" ? "text-white/40" : "text-black/40"}
            `}>
              vs last week
            </span>
          </div>

          {/* Glow effect on hover */}
          {metric.label === "Building Now" && (
            <div className="absolute inset-0 bg-gradient-to-br from-lime-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          )}
        </div>
      ))}
    </div>
  );
}
