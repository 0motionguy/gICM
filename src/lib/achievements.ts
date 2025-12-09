/**
 * Achievement System
 * Defines all available achievements and logic for earning them
 */

import { supabase, isSupabaseConfigured } from "./supabase/client";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  pointsValue: number;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type:
    | "stack_count"
    | "remix_count"
    | "category_coverage"
    | "item_type_count"
    | "streak_days"
    | "special";
  threshold?: number;
  itemKind?: string;
  category?: string;
  special?: string;
}

export interface UserProgress {
  stacksCreated: number;
  remixesReceived: number;
  categoriesUsed: Set<string>;
  itemsByKind: Record<string, number>;
  streakDays: number;
  isBetaUser: boolean;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_stack",
    name: "First Stack",
    description: "Created your first stack",
    icon: "🎯",
    tier: "bronze",
    pointsValue: 10,
    criteria: { type: "stack_count", threshold: 1 },
  },
  {
    id: "power_user",
    name: "Power User",
    description: "Created 10+ stacks",
    icon: "⚡",
    tier: "silver",
    pointsValue: 50,
    criteria: { type: "stack_count", threshold: 10 },
  },
  {
    id: "stack_master",
    name: "Stack Master",
    description: "Created 50+ stacks",
    icon: "🏆",
    tier: "gold",
    pointsValue: 150,
    criteria: { type: "stack_count", threshold: 50 },
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Your stacks were remixed 5+ times",
    icon: "🌟",
    tier: "gold",
    pointsValue: 100,
    criteria: { type: "remix_count", threshold: 5 },
  },
  {
    id: "viral_creator",
    name: "Viral Creator",
    description: "Your stacks were remixed 25+ times",
    icon: "🔥",
    tier: "platinum",
    pointsValue: 250,
    criteria: { type: "remix_count", threshold: 25 },
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Used items from all 4 categories",
    icon: "🧭",
    tier: "silver",
    pointsValue: 25,
    criteria: { type: "category_coverage", threshold: 4 },
  },
  {
    id: "web3_pioneer",
    name: "Web3 Pioneer",
    description: "Added 5+ Web3/blockchain agents",
    icon: "🔗",
    tier: "silver",
    pointsValue: 30,
    criteria: { type: "item_type_count", itemKind: "agent", threshold: 5 },
  },
  {
    id: "security_master",
    name: "Security Master",
    description: "Added 10+ security-related items",
    icon: "🛡️",
    tier: "gold",
    pointsValue: 50,
    criteria: { type: "item_type_count", category: "security", threshold: 10 },
  },
  {
    id: "skill_collector",
    name: "Skill Collector",
    description: "Used 20+ different skills",
    icon: "📚",
    tier: "silver",
    pointsValue: 40,
    criteria: { type: "item_type_count", itemKind: "skill", threshold: 20 },
  },
  {
    id: "mcp_enthusiast",
    name: "MCP Enthusiast",
    description: "Added 15+ MCP servers",
    icon: "🔌",
    tier: "silver",
    pointsValue: 35,
    criteria: { type: "item_type_count", itemKind: "mcp", threshold: 15 },
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined during beta",
    icon: "🚀",
    tier: "platinum",
    pointsValue: 100,
    criteria: { type: "special", special: "beta_user" },
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Used gICM 7 days in a row",
    icon: "🔥",
    tier: "bronze",
    pointsValue: 20,
    criteria: { type: "streak_days", threshold: 7 },
  },
  {
    id: "streak_30",
    name: "Dedication",
    description: "Used gICM 30 days in a row",
    icon: "💪",
    tier: "gold",
    pointsValue: 75,
    criteria: { type: "streak_days", threshold: 30 },
  },
  {
    id: "streak_100",
    name: "Legendary Dedication",
    description: "Used gICM 100 days in a row",
    icon: "⭐",
    tier: "platinum",
    pointsValue: 200,
    criteria: { type: "streak_days", threshold: 100 },
  },
];

/**
 * Check if a user has earned an achievement
 */
export function checkAchievement(
  achievement: Achievement,
  progress: UserProgress,
): boolean {
  const { criteria } = achievement;

  switch (criteria.type) {
    case "stack_count":
      return progress.stacksCreated >= (criteria.threshold || 0);

    case "remix_count":
      return progress.remixesReceived >= (criteria.threshold || 0);

    case "category_coverage":
      return progress.categoriesUsed.size >= (criteria.threshold || 0);

    case "item_type_count":
      if (criteria.itemKind) {
        return (
          (progress.itemsByKind[criteria.itemKind] || 0) >=
          (criteria.threshold || 0)
        );
      }
      if (criteria.category) {
        // Would need category data from items
        return false;
      }
      return false;

    case "streak_days":
      return progress.streakDays >= (criteria.threshold || 0);

    case "special":
      if (criteria.special === "beta_user") {
        return progress.isBetaUser;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Check all achievements and return newly earned ones
 */
export function checkAllAchievements(
  progress: UserProgress,
  alreadyEarned: string[],
): Achievement[] {
  const newlyEarned: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (alreadyEarned.includes(achievement.id)) continue;
    if (checkAchievement(achievement, progress)) {
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}

/**
 * Award an achievement to a user (Supabase)
 */
export async function awardAchievement(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Supabase not configured, achievement not awarded");
    return false;
  }

  try {
    // Insert user_badge record
    const { error: badgeError } = await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: achievementId,
    });

    if (badgeError && !badgeError.message.includes("duplicate")) {
      throw badgeError;
    }

    // Award bonus points for the achievement
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (achievement && achievement.pointsValue > 0) {
      await supabase.from("points_ledger").insert({
        user_id: userId,
        action: "achievement_earned",
        points: achievement.pointsValue,
        description: `Earned "${achievement.name}" badge`,
        metadata: { achievement_id: achievementId },
      });
    }

    return true;
  } catch (err) {
    console.error("Error awarding achievement:", err);
    return false;
  }
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by tier
 */
export function getAchievementsByTier(
  tier: Achievement["tier"],
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
}

/**
 * Calculate progress towards an achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  progress: UserProgress,
): { current: number; target: number; percentage: number } {
  const { criteria } = achievement;
  let current = 0;
  const target = criteria.threshold || 1;

  switch (criteria.type) {
    case "stack_count":
      current = progress.stacksCreated;
      break;
    case "remix_count":
      current = progress.remixesReceived;
      break;
    case "category_coverage":
      current = progress.categoriesUsed.size;
      break;
    case "item_type_count":
      if (criteria.itemKind) {
        current = progress.itemsByKind[criteria.itemKind] || 0;
      }
      break;
    case "streak_days":
      current = progress.streakDays;
      break;
    case "special":
      current = progress.isBetaUser ? 1 : 0;
      break;
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));

  return { current, target, percentage };
}
