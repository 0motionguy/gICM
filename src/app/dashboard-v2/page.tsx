"use client";

import { useState } from "react";
import { HeroMetrics } from "@/components/dashboard-v2/hero/HeroMetrics";
import { LiveFeed } from "@/components/dashboard-v2/live/LiveFeed";
import { StatsPanel } from "@/components/dashboard-v2/stats/StatsPanel";
import { FOMOSection } from "@/components/dashboard-v2/fomo/FOMOSection";
import { DashboardHeader } from "@/components/dashboard-v2/DashboardHeader";
import "@/styles/dashboard-animations.css";

export default function DashboardV2Page() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className={`${theme} min-h-screen transition-colors duration-300`}>
      <div className={`
        min-h-screen
        ${theme === "dark"
          ? "bg-[#0f0f0f]"
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50"
        }
      `}>
        {/* Header */}
        <DashboardHeader theme={theme} onToggleTheme={toggleTheme} />

        {/* Main Content */}
        <main className="max-w-[1920px] mx-auto px-6 py-8 space-y-8">
          {/* Hero Metrics */}
          <section className="animate-slide-in-top">
            <HeroMetrics theme={theme} />
          </section>

          {/* Main Grid: Live Feed + Stats Panel */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Feed (60% width) */}
            <div className="lg:col-span-7 animate-slide-in-left">
              <LiveFeed theme={theme} />
            </div>

            {/* Stats Panel (40% width) */}
            <div className="lg:col-span-5 animate-slide-in-right">
              <StatsPanel theme={theme} />
            </div>
          </section>

          {/* FOMO Section */}
          <section className="animate-slide-in-bottom">
            <FOMOSection theme={theme} />
          </section>
        </main>

        {/* Footer */}
        <footer className={`
          border-t py-6 text-center text-sm
          ${theme === "dark"
            ? "border-white/8 text-zinc-400"
            : "border-black/20 text-black/60"
          }
        `}>
          <p>ClawdBot Marketplace · Real-time Dashboard · Updates every 5s</p>
        </footer>
      </div>
    </div>
  );
}
