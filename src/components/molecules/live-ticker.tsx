"use client";

import { motion } from "framer-motion";
import { GitBranch, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useLiveEvents } from "@/lib/supabase/live-events";
import type { LiveEvent } from "@/lib/supabase/client";

/**
 * LiveTicker Component
 * Horizontal scrolling ticker showing real-time offspring/remix activity
 * Connected to Supabase Realtime for live updates
 */
export function LiveTicker() {
  const { events, isConnected, connectionType } = useLiveEvents({ limit: 20 });

  const getActionIcon = (action: LiveEvent["action"]) => {
    if (action === "remixed")
      return <GitBranch size={14} className="text-lime-300" />;
    if (action === "starred")
      return <Sparkles size={14} className="text-yellow-400" />;
    return <div className="h-2 w-2 rounded-full bg-emerald-400" />;
  };

  const getActionColor = (action: LiveEvent["action"]) => {
    if (action === "remixed") return "text-lime-300";
    if (action === "starred") return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <div className="w-full overflow-hidden py-1.5">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="relative flex overflow-hidden bg-black/90 backdrop-blur border-y border-lime-300/20 rounded-lg py-1.5 px-4">
          <motion.div
            className="flex gap-4 whitespace-nowrap"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate events for seamless loop */}
            {[...events, ...events, ...events].map((event, idx) => (
              <div
                key={`${event.id}-${idx}`}
                className="flex items-center gap-2 text-sm"
              >
                {getActionIcon(event.action)}
                <span className="text-white/60">{event.user}</span>
                <span
                  className={`font-semibold ${getActionColor(event.action)}`}
                >
                  {event.action}
                </span>
                <span className="text-white/90">{event.item}</span>
                <span className="text-white/30 mx-2">•</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
