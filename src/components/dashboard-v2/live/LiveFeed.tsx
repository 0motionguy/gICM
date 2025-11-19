"use client";

import { useState, useEffect, useRef } from "react";
import type { LiveActivity } from "@/types/live-activity";
import { ActivityCard } from "./ActivityCard";
import { Loader2 } from "lucide-react";

interface LiveFeedProps {
  theme: "dark" | "light";
}

export function LiveFeed({ theme }: LiveFeedProps) {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/live/feed");
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setActivities(data.activities);
      setError(null);
    } catch (err) {
      setError("Failed to load activity feed");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, []);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivities();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`
        h-[600px] rounded-2xl border p-6 flex items-center justify-center
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <Loader2 className={`w-8 h-8 animate-spin ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`
        h-[600px] rounded-2xl border p-6 flex items-center justify-center
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <div className="text-center">
          <p className={theme === "dark" ? "text-red-400 text-sm mb-2" : "text-red-600 text-sm mb-2"}>
            {error}
          </p>
          <button
            onClick={fetchActivities}
            className={`
              text-xs underline transition-colors
              ${theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"}
            `}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`
        h-[600px] rounded-2xl border p-6 flex items-center justify-center
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <p className={theme === "dark" ? "text-white/40 text-sm" : "text-black/40 text-sm"}>
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className={`
      h-[600px] rounded-2xl border overflow-hidden
      ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
    `}>
      {/* Header */}
      <div className={`
        sticky top-0 z-10 backdrop-blur-lg border-b px-6 py-4
        ${theme === "dark"
          ? "bg-[#0f0f0f]/80 border-white/8"
          : "bg-white/80 border-black/20"
        }
      `}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`
              text-lg font-black uppercase tracking-wide
              ${theme === "dark" ? "text-white" : "text-black"}
            `}>
              🔴 Live Activity Feed
            </h2>
            <p className={`
              text-xs mt-1
              ${theme === "dark" ? "text-white/60" : "text-black/60"}
            `}>
              {activities.length} recent events · Updates every 5s
            </p>
          </div>
          <div className="pulse-indicator w-3 h-3 rounded-full bg-lime-500 animate-pulse-glow" />
        </div>
      </div>

      {/* Activity List */}
      <div
        ref={containerRef}
        className="h-[calc(100%-80px)] overflow-y-auto custom-scrollbar smooth-scroll px-6 py-4"
      >
        <div className="space-y-3">
          {activities.slice(0, 20).map((activity, index) => (
            <div
              key={activity.id}
              className={`animate-slide-in-left stagger-${Math.min(index + 1, 6)}`}
              style={{ animationFillMode: "backwards" }}
            >
              <ActivityCard activity={activity} theme={theme} />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-20 pointer-events-none
        ${theme === "dark"
          ? "bg-gradient-to-t from-[#0f0f0f] to-transparent"
          : "bg-gradient-to-t from-white to-transparent"
        }
      `} />
    </div>
  );
}
