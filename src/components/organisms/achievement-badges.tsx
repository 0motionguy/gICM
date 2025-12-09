"use client";

import type { Badge } from "@/lib/supabase/leaderboard";

interface AchievementBadgesProps {
  badges: Badge[];
}

const TIER_COLORS = {
  bronze: {
    bg: "bg-amber-900/20",
    border: "border-amber-700/50",
    text: "text-amber-400",
  },
  silver: {
    bg: "bg-zinc-400/10",
    border: "border-zinc-500/50",
    text: "text-zinc-300",
  },
  gold: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
  },
  platinum: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/50",
    text: "text-purple-400",
  },
};

export function AchievementBadges({ badges }: AchievementBadgesProps) {
  // Group badges by tier
  const groupedBadges = badges.reduce(
    (acc, badge) => {
      const tier = badge.tier || "bronze";
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(badge);
      return acc;
    },
    {} as Record<string, Badge[]>,
  );

  const tierOrder = ["platinum", "gold", "silver", "bronze"];

  return (
    <div className="space-y-8">
      {tierOrder.map((tier) => {
        const tierBadges = groupedBadges[tier];
        if (!tierBadges || tierBadges.length === 0) return null;

        const colors = TIER_COLORS[tier as keyof typeof TIER_COLORS];

        return (
          <div key={tier}>
            <h3 className={`mb-4 text-sm font-medium uppercase ${colors.text}`}>
              {tier} Tier ({tierBadges.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tierBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}

      {badges.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <span className="text-4xl">🏆</span>
          <h3 className="mb-2 mt-4 text-lg font-medium text-white">
            No Badges Available
          </h3>
          <p className="text-zinc-400">Check back soon for new achievements!</p>
        </div>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
}

function BadgeCard({ badge }: BadgeCardProps) {
  const colors =
    TIER_COLORS[badge.tier as keyof typeof TIER_COLORS] || TIER_COLORS.bronze;

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-transform hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{badge.icon}</div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white">{badge.name}</h4>
          <p className="mt-1 text-sm text-zinc-400">{badge.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs capitalize ${colors.bg} ${colors.text}`}
            >
              {badge.tier}
            </span>
            {badge.points_value > 0 && (
              <span className="text-xs text-lime-400">
                +{badge.points_value} pts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
