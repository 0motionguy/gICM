"use client";

import { Flame } from "lucide-react";
import type { LeaderboardUser } from "@/lib/supabase/leaderboard";

interface LeaderboardRowProps {
  user: LeaderboardUser;
}

export function LeaderboardRow({ user }: LeaderboardRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 transition-colors hover:bg-zinc-800/50">
      {/* Rank */}
      <div className="col-span-1 flex items-center justify-center">
        <span className="text-lg font-bold text-zinc-400">#{user.rank}</span>
      </div>

      {/* Builder info */}
      <div className="col-span-5 flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            user.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-white">
            {user.display_name || user.username}
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>@{user.username}</span>
            {user.streak_days > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <Flame className="h-3 w-3" />
                {user.streak_days}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-medium text-lime-400">
          {user.total_points.toLocaleString()}
        </span>
      </div>

      {/* Stacks */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="text-zinc-300">{user.stacks_created}</span>
      </div>

      {/* Badges */}
      <div className="col-span-2 flex items-center justify-center gap-1">
        {user.badges.length > 0 ? (
          <>
            {user.badges.slice(0, 3).map((badge) => (
              <span
                key={badge}
                className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                title={badge}
              >
                {getBadgeIcon(badge)}
              </span>
            ))}
            {user.badges.length > 3 && (
              <span className="text-xs text-zinc-500">
                +{user.badges.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </div>
    </div>
  );
}

function getBadgeIcon(badgeId: string): string {
  const icons: Record<string, string> = {
    first_stack: "🎯",
    power_user: "⚡",
    influencer: "🌟",
    explorer: "🧭",
    web3_pioneer: "🔗",
    security_master: "🛡️",
    early_adopter: "🚀",
    streak_7: "🔥",
    streak_30: "🔥",
  };
  return icons[badgeId] || "🏆";
}
