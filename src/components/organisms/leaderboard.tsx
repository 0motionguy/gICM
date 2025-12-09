"use client";

import { Crown, Medal, Award, Flame, TrendingUp } from "lucide-react";
import type { LeaderboardUser } from "@/lib/supabase/leaderboard";
import { LeaderboardRow } from "@/components/molecules/leaderboard-row";

interface LeaderboardProps {
  users: LeaderboardUser[];
}

export function Leaderboard({ users }: LeaderboardProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <Crown className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
        <h3 className="mb-2 text-lg font-medium text-white">No Rankings Yet</h3>
        <p className="text-zinc-400">
          Be the first to create a stack and claim the top spot!
        </p>
      </div>
    );
  }

  // Top 3 podium
  const [first, second, third, ...rest] = users;

  return (
    <div className="space-y-6">
      {/* Podium for top 3 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Second Place */}
        {second && (
          <div className="order-2 md:order-1">
            <PodiumCard user={second} rank={2} />
          </div>
        )}
        {/* First Place */}
        {first && (
          <div className="order-1 md:order-2">
            <PodiumCard user={first} rank={1} />
          </div>
        )}
        {/* Third Place */}
        {third && (
          <div className="order-3">
            <PodiumCard user={third} rank={3} />
          </div>
        )}
      </div>

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium uppercase text-zinc-500">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Builder</div>
              <div className="col-span-2 text-center">Points</div>
              <div className="col-span-2 text-center">Stacks</div>
              <div className="col-span-2 text-center">Badges</div>
            </div>
          </div>
          <div className="divide-y divide-zinc-800">
            {rest.map((user) => (
              <LeaderboardRow key={user.user_id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PodiumCardProps {
  user: LeaderboardUser;
  rank: 1 | 2 | 3;
}

function PodiumCard({ user, rank }: PodiumCardProps) {
  const config = {
    1: {
      icon: Crown,
      gradient: "from-yellow-500/20 to-amber-600/20",
      border: "border-yellow-500/50",
      iconColor: "text-yellow-400",
      height: "md:h-64",
    },
    2: {
      icon: Medal,
      gradient: "from-zinc-400/20 to-zinc-500/20",
      border: "border-zinc-400/50",
      iconColor: "text-zinc-300",
      height: "md:h-56",
    },
    3: {
      icon: Award,
      gradient: "from-amber-700/20 to-orange-700/20",
      border: "border-amber-600/50",
      iconColor: "text-amber-500",
      height: "md:h-48",
    },
  }[rank];

  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} p-6 ${config.height} flex flex-col justify-end`}
    >
      {/* Rank badge */}
      <div className="absolute right-4 top-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            rank === 1
              ? "bg-yellow-500"
              : rank === 2
                ? "bg-zinc-400"
                : "bg-amber-600"
          }`}
        >
          <span className="text-lg font-bold text-black">{rank}</span>
        </div>
      </div>

      {/* Icon */}
      <Icon className={`mb-3 h-8 w-8 ${config.iconColor}`} />

      {/* User info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-white">
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
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {user.display_name || user.username}
          </h3>
          <p className="text-sm text-zinc-400">@{user.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-lime-400" />
          <span className="font-medium text-white">
            {user.total_points.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-400">pts</span>
        </div>
        {user.streak_days > 0 && (
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-zinc-300">{user.streak_days}d</span>
          </div>
        )}
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="mt-3 flex gap-1">
          {user.badges.slice(0, 4).map((badge) => (
            <span
              key={badge}
              className="rounded bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300"
            >
              {badge}
            </span>
          ))}
          {user.badges.length > 4 && (
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
              +{user.badges.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
