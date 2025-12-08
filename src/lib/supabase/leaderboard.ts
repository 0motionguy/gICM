"use client";

import { supabase, isSupabaseConfigured } from "./client";

export interface LeaderboardUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
  stacks_created: number;
  remixes_received: number;
  badges: string[];
  streak_days: number;
  last_activity: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points_value: number;
}

export interface PointAction {
  action: string;
  points: number;
  description: string;
}

// Point values for different actions
export const POINT_VALUES: Record<string, PointAction> = {
  stack_created: {
    action: "stack_created",
    points: 10,
    description: "Created a stack",
  },
  stack_remix: {
    action: "stack_remix",
    points: 15,
    description: "Remixed a stack",
  },
  stack_shared: {
    action: "stack_shared",
    points: 5,
    description: "Shared a stack",
  },
  item_installed: {
    action: "item_installed",
    points: 2,
    description: "Installed an item",
  },
  first_stack: {
    action: "first_stack",
    points: 25,
    description: "Created first stack bonus",
  },
  daily_login: {
    action: "daily_login",
    points: 3,
    description: "Daily activity bonus",
  },
  streak_bonus: {
    action: "streak_bonus",
    points: 5,
    description: "Streak bonus",
  },
};

// Mock data for when Supabase is not configured
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  {
    user_id: "mock-1",
    username: "solana_hacker",
    display_name: "Solana Hacker",
    avatar_url: null,
    total_points: 2850,
    rank: 1,
    stacks_created: 45,
    remixes_received: 120,
    badges: ["power_user", "influencer", "web3_pioneer"],
    streak_days: 14,
    last_activity: new Date().toISOString(),
  },
  {
    user_id: "mock-2",
    username: "defi_wizard",
    display_name: "DeFi Wizard",
    avatar_url: null,
    total_points: 2340,
    rank: 2,
    stacks_created: 38,
    remixes_received: 85,
    badges: ["power_user", "security_master"],
    streak_days: 7,
    last_activity: new Date().toISOString(),
  },
  {
    user_id: "mock-3",
    username: "rust_builder",
    display_name: "Rust Builder",
    avatar_url: null,
    total_points: 1920,
    rank: 3,
    stacks_created: 32,
    remixes_received: 52,
    badges: ["explorer", "streak_7"],
    streak_days: 21,
    last_activity: new Date().toISOString(),
  },
  {
    user_id: "mock-4",
    username: "typescript_pro",
    display_name: "TypeScript Pro",
    avatar_url: null,
    total_points: 1650,
    rank: 4,
    stacks_created: 28,
    remixes_received: 41,
    badges: ["first_stack", "explorer"],
    streak_days: 5,
    last_activity: new Date().toISOString(),
  },
  {
    user_id: "mock-5",
    username: "web3_dev",
    display_name: "Web3 Dev",
    avatar_url: null,
    total_points: 1420,
    rank: 5,
    stacks_created: 24,
    remixes_received: 33,
    badges: ["web3_pioneer"],
    streak_days: 3,
    last_activity: new Date().toISOString(),
  },
];

const MOCK_BADGES: Badge[] = [
  {
    id: "first_stack",
    name: "First Stack",
    description: "Created your first stack",
    icon: "🎯",
    tier: "bronze",
    points_value: 10,
  },
  {
    id: "power_user",
    name: "Power User",
    description: "Created 10+ stacks",
    icon: "⚡",
    tier: "silver",
    points_value: 50,
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Your stacks were remixed 5+ times",
    icon: "🌟",
    tier: "gold",
    points_value: 100,
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Used items from all categories",
    icon: "🧭",
    tier: "silver",
    points_value: 25,
  },
  {
    id: "web3_pioneer",
    name: "Web3 Pioneer",
    description: "Added 5+ Web3 agents to stacks",
    icon: "🔗",
    tier: "silver",
    points_value: 30,
  },
  {
    id: "security_master",
    name: "Security Master",
    description: "Added 10+ security items",
    icon: "🛡️",
    tier: "gold",
    points_value: 50,
  },
];

/**
 * Fetch the leaderboard
 */
export async function getLeaderboard(
  limit: number = 50,
): Promise<LeaderboardUser[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_LEADERBOARD.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from("leaderboard_cache")
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return MOCK_LEADERBOARD.slice(0, limit);
  }
}

/**
 * Get user's rank and stats
 */
export async function getUserStats(
  userId: string,
): Promise<LeaderboardUser | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_LEADERBOARD.find((u) => u.user_id === userId) || null;
  }

  try {
    const { data, error } = await supabase
      .from("leaderboard_cache")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching user stats:", err);
    return null;
  }
}

/**
 * Award points to a user
 */
export async function awardPoints(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Supabase not configured, points not awarded");
    return false;
  }

  const pointAction = POINT_VALUES[action];
  if (!pointAction) {
    console.error("Unknown point action:", action);
    return false;
  }

  try {
    const { error } = await supabase.from("points_ledger").insert({
      user_id: userId,
      action: pointAction.action,
      points: pointAction.points,
      description: pointAction.description,
      metadata: metadata || {},
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error awarding points:", err);
    return false;
  }
}

/**
 * Get all available badges
 */
export async function getBadges(): Promise<Badge[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_BADGES;
  }

  try {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("tier", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching badges:", err);
    return MOCK_BADGES;
  }
}

/**
 * Get badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (!isSupabaseConfigured() || !supabase) {
    const user = MOCK_LEADERBOARD.find((u) => u.user_id === userId);
    return MOCK_BADGES.filter((b) => user?.badges.includes(b.id));
  }

  try {
    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_id, badges(*)")
      .eq("user_id", userId);

    if (error) throw error;
    return (
      data?.map((ub: { badge_id: string; badges: Badge }) => ub.badges) || []
    );
  } catch (err) {
    console.error("Error fetching user badges:", err);
    return [];
  }
}

/**
 * Get or create a user
 */
export async function getOrCreateUser(
  username: string,
): Promise<LeaderboardUser | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_LEADERBOARD.find((u) => u.username === username) || null;
  }

  try {
    // Try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from("gicm_users")
      .select("*")
      .eq("username", username)
      .single();

    if (existingUser && !findError) {
      // Get their leaderboard entry
      const { data: leaderboardEntry } = await supabase
        .from("leaderboard_cache")
        .select("*")
        .eq("user_id", existingUser.id)
        .single();

      return (
        leaderboardEntry || {
          user_id: existingUser.id,
          username: existingUser.username,
          display_name: existingUser.display_name,
          avatar_url: existingUser.avatar_url,
          total_points: 0,
          rank: 0,
          stacks_created: 0,
          remixes_received: 0,
          badges: [],
          streak_days: 0,
          last_activity: null,
        }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("gicm_users")
      .insert({ username })
      .select()
      .single();

    if (createError) throw createError;

    return {
      user_id: newUser.id,
      username: newUser.username,
      display_name: null,
      avatar_url: null,
      total_points: 0,
      rank: 0,
      stacks_created: 0,
      remixes_received: 0,
      badges: [],
      streak_days: 0,
      last_activity: null,
    };
  } catch (err) {
    console.error("Error getting/creating user:", err);
    return null;
  }
}
