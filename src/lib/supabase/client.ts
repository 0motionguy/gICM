import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create client if configured
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Database types for ClawdBot events
export interface LiveEvent {
  id: string;
  user: string;
  action: "remixed" | "installed" | "starred";
  item: string;
  item_id?: string;
  timestamp: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
  badges: string[];
  updated_at: string;
}

export interface PointsLedger {
  id: string;
  user_id: string;
  action: string;
  points: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}
