"use client";

import { Moon, Sun, Activity } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function DashboardHeader({ theme, onToggleTheme }: DashboardHeaderProps) {
  return (
    <header className={`
      sticky top-0 z-50 backdrop-blur-lg border-b transition-colors
      ${theme === "dark"
        ? "bg-[#0f0f0f]/80 border-white/8"
        : "bg-white/80 border-black/20"
      }
    `}>
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`h-12 w-12 rounded-xl shadow-lg grid place-items-center transform group-hover:scale-110 transition-transform ${
                theme === "dark" ? "bg-lime-400" : "bg-[#D1FD0A]"
              }`}>
                <span className="text-black font-black text-2xl">g</span>
              </div>
              <div>
                <h1 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-black"}`}>
                  gICM<span className={theme === "dark" ? "text-lime-400" : "text-[#D1FD0A]"}>://LIVE</span>
                </h1>
                <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-black/60"}`}>
                  Real-time Activity Dashboard
                </p>
              </div>
            </Link>
          </div>

          {/* Right Side: Live Indicator + Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full border
              ${theme === "dark"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-red-50 border-red-200"
              }
            `}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-live-pulse" />
              <span className={`text-sm font-bold uppercase tracking-wide ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                LIVE
              </span>
            </div>

            {/* Activity Badge */}
            <div className={`
              hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card
              ${theme === "light" && "glass-card-light"}
            `}>
              <Activity className={`w-4 h-4 ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`} />
              <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                234 online
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`
                p-3 rounded-xl transition-all hover-scale
                ${theme === "dark"
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-black/10 hover:bg-black/20 text-black"
                }
              `}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
