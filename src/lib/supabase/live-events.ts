"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured, type LiveEvent } from "./client";

interface UseLiveEventsOptions {
  limit?: number;
  pollInterval?: number;
}

interface UseLiveEventsReturn {
  events: LiveEvent[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectionType: "realtime" | "polling" | "mock";
}

// Mock data for fallback when Supabase is not configured
const MOCK_EVENTS: LiveEvent[] = [
  {
    id: "mock-1",
    user: "dev_alpha",
    action: "remixed",
    item: "ICM Anchor Architect",
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    user: "crypto_builder",
    action: "installed",
    item: "Solana Anchor Mastery",
    timestamp: new Date(Date.now() - 1000).toISOString(),
    created_at: new Date(Date.now() - 1000).toISOString(),
  },
  {
    id: "mock-3",
    user: "web3_ninja",
    action: "remixed",
    item: "Frontend Fusion Engine",
    timestamp: new Date(Date.now() - 2000).toISOString(),
    created_at: new Date(Date.now() - 2000).toISOString(),
  },
];

const MOCK_USERS = [
  "dev_alpha",
  "crypto_builder",
  "web3_ninja",
  "rust_wizard",
  "defi_dev",
  "solana_hacker",
];
const MOCK_ITEMS = [
  "ICM Anchor Architect",
  "Frontend Fusion Engine",
  "Rust Systems Architect",
  "TypeScript Precision Engineer",
  "Solana Anchor Mastery",
];
const MOCK_ACTIONS: LiveEvent["action"][] = ["remixed", "installed", "starred"];

/**
 * Hook for subscribing to live events via Supabase Realtime
 * Falls back to polling if realtime fails, or mock data if Supabase is not configured
 */
export function useLiveEvents(
  options: UseLiveEventsOptions = {},
): UseLiveEventsReturn {
  const { limit = 20, pollInterval = 30000 } = options;

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<
    "realtime" | "polling" | "mock"
  >("mock");

  // Fetch initial events
  const fetchEvents = useCallback(async () => {
    if (!supabase) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from("live_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error("Error fetching events:", err);
      return [];
    }
  }, [limit]);

  // Generate mock event for demo mode
  const generateMockEvent = useCallback((): LiveEvent => {
    return {
      id: `mock-${Date.now()}`,
      user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
      action: MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)],
      item: MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)],
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  }, []);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null =
      null;
    let pollTimer: NodeJS.Timeout | null = null;
    let mockTimer: NodeJS.Timeout | null = null;

    const init = async () => {
      // If Supabase is not configured, use mock mode
      if (!isSupabaseConfigured() || !supabase) {
        setConnectionType("mock");
        setEvents(MOCK_EVENTS);
        setIsConnected(true);
        setIsLoading(false);

        // Generate mock events periodically
        mockTimer = setInterval(() => {
          setEvents((prev) => [generateMockEvent(), ...prev].slice(0, limit));
        }, 3000);

        return;
      }

      // Try to connect via Supabase Realtime
      try {
        // Fetch initial events
        const initialEvents = await fetchEvents();
        setEvents(initialEvents);
        setIsLoading(false);

        // Subscribe to realtime updates
        channel = supabase
          .channel("live-events-channel")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "live_events",
            },
            (payload) => {
              const newEvent = payload.new as LiveEvent;
              setEvents((prev) => [newEvent, ...prev].slice(0, limit));
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setConnectionType("realtime");
              setError(null);
            } else if (status === "CHANNEL_ERROR") {
              // Fall back to polling
              setConnectionType("polling");
              setError("Realtime connection failed, falling back to polling");
              startPolling();
            }
          });
      } catch (err) {
        console.error("Error connecting to realtime:", err);
        setConnectionType("polling");
        setError("Failed to connect to realtime");
        startPolling();
      }
    };

    const startPolling = () => {
      setIsConnected(true);
      pollTimer = setInterval(async () => {
        const freshEvents = await fetchEvents();
        setEvents(freshEvents);
      }, pollInterval);
    };

    init();

    // Cleanup
    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      if (mockTimer) {
        clearInterval(mockTimer);
      }
    };
  }, [fetchEvents, generateMockEvent, limit, pollInterval]);

  return {
    events,
    isConnected,
    isLoading,
    error,
    connectionType,
  };
}

/**
 * Log a new event to Supabase
 */
export async function logLiveEvent(
  event: Omit<LiveEvent, "id" | "created_at">,
): Promise<boolean> {
  if (!supabase) {
    console.warn("Supabase not configured, event not logged");
    return false;
  }

  try {
    const { error } = await supabase.from("live_events").insert({
      user: event.user,
      action: event.action,
      item: event.item,
      item_id: event.item_id,
      timestamp: event.timestamp,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error logging event:", err);
    return false;
  }
}
