"use client";

import type { LiveActivity } from "@/types/live-activity";
import {
  Eye,
  Plus,
  Minus,
  Package,
  Download,
  Search,
  Filter,
  Sparkles,
  CheckCircle,
  Terminal,
  Rocket,
} from "lucide-react";

interface ActivityCardProps {
  activity: LiveActivity;
  theme: "dark" | "light";
}

const ICON_MAP = {
  eye: Eye,
  plus: Plus,
  minus: Minus,
  package: Package,
  download: Download,
  search: Search,
  filter: Filter,
  sparkles: Sparkles,
  "check-circle": CheckCircle,
  terminal: Terminal,
  rocket: Rocket,
};

const COLOR_MAP = {
  lime: {
    dark: "bg-lime-500/20 text-lime-400 border-lime-500/40",
    light: "bg-lime-100 text-lime-600 border-lime-200",
  },
  purple: {
    dark: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    light: "bg-purple-100 text-purple-600 border-purple-200",
  },
  blue: {
    dark: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    light: "bg-blue-100 text-blue-600 border-blue-200",
  },
  green: {
    dark: "bg-green-500/20 text-green-400 border-green-500/40",
    light: "bg-green-100 text-green-600 border-green-200",
  },
  yellow: {
    dark: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    light: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  pink: {
    dark: "bg-pink-500/20 text-pink-400 border-pink-500/40",
    light: "bg-pink-100 text-pink-600 border-pink-200",
  },
};

export function ActivityCard({ activity, theme }: ActivityCardProps) {
  const IconComponent = ICON_MAP[activity.icon];
  const colorClass = COLOR_MAP[activity.color][theme];

  // Check if activity is very recent (< 1 minute)
  const isJustNow = activity.relativeTime.includes("s ago") || activity.relativeTime === "just now";

  return (
    <div className={`
      group flex items-start gap-3 p-4 rounded-xl border transition-all
      hover-lift gpu-accelerated
      ${theme === "dark"
        ? "bg-white/5 border-white/8 hover:bg-white/10"
        : "bg-white border-black/20 hover:bg-gray-50"
      }
    `}>
      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0
        transition-transform group-hover:scale-110
        ${colorClass}
      `}>
        <IconComponent className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm font-medium leading-tight
          ${theme === "dark" ? "text-white" : "text-black"}
        `}>
          {activity.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`
            text-xs
            ${theme === "dark" ? "text-white/60" : "text-black/60"}
          `}>
            {activity.relativeTime}
          </span>

          {isJustNow && (
            <span className="badge-just-now text-xs font-bold px-2 py-0.5 rounded-full text-white">
              JUST NOW
            </span>
          )}

          {activity.isSimulated && process.env.NODE_ENV === "development" && (
            <>
              <span className={theme === "dark" ? "text-white/40" : "text-black/40"}>•</span>
              <span className={`text-xs ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>
                sim
              </span>
            </>
          )}
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
    </div>
  );
}
