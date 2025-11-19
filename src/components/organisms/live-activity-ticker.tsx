"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { LiveActivity, LiveFeedResponse } from "@/types/live-activity";
import { ActivityItem } from "@/components/molecules/activity-item";
import { LIVE_CONFIG } from "@/config/live";
import { Loader2 } from "lucide-react";

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/live/feed");
      if (!response.ok) throw new Error("Failed to fetch");

      const data: LiveFeedResponse = await response.json();
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
    }, LIVE_CONFIG.pollInterval);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!containerRef.current || activities.length === 0) return;

    let currentIndex = 0;
    const scrollInterval = setInterval(() => {
      if (!containerRef.current) return;

      currentIndex = (currentIndex + 1) % activities.length;

      const itemHeight = LIVE_CONFIG.display.itemHeight + LIVE_CONFIG.display.itemGap;
      containerRef.current.scrollTo({
        top: currentIndex * itemHeight,
        behavior: "smooth",
      });
    }, LIVE_CONFIG.scrollSpeed);

    return () => clearInterval(scrollInterval);
  }, [activities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <button
            onClick={fetchActivities}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-3">
        <h2 className="text-lg font-black text-white uppercase tracking-wide">
          Live Activity Feed
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {activities.length} recent events
        </p>
      </div>

      {/* Activity List */}
      <div
        ref={containerRef}
        className="h-[calc(100%-80px)] overflow-y-auto scroll-smooth px-4 py-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#84cc16 transparent",
        }}
      >
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
