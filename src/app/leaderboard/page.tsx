"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Crown, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Leaderboard } from "@/components/organisms/leaderboard";
import { AchievementBadges } from "@/components/organisms/achievement-badges";
import {
  getLeaderboard,
  getBadges,
  type LeaderboardUser,
  type Badge,
} from "@/lib/supabase/leaderboard";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rankings" | "badges">("rankings");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [leaderboardData, badgesData] = await Promise.all([
          getLeaderboard(50),
          getBadges(),
        ]);
        setLeaderboard(leaderboardData);
        setBadges(badgesData);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-lime-400" />
                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>Updated live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Banner */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/20 p-3">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Top Builder</p>
                <p className="text-lg font-bold text-white">
                  {leaderboard[0]?.display_name ||
                    leaderboard[0]?.username ||
                    "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-lime-500/20 p-3">
                <Medal className="h-6 w-6 text-lime-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Builders</p>
                <p className="text-lg font-bold text-white">
                  {leaderboard.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-3">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Badges Available</p>
                <p className="text-lg font-bold text-white">{badges.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === "rankings" ? "default" : "outline"}
            onClick={() => setActiveTab("rankings")}
            className={
              activeTab === "rankings"
                ? "bg-lime-500 text-black hover:bg-lime-400"
                : ""
            }
          >
            <Trophy className="mr-2 h-4 w-4" />
            Rankings
          </Button>
          <Button
            variant={activeTab === "badges" ? "default" : "outline"}
            onClick={() => setActiveTab("badges")}
            className={
              activeTab === "badges"
                ? "bg-lime-500 text-black hover:bg-lime-400"
                : ""
            }
          >
            <Star className="mr-2 h-4 w-4" />
            Badges
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
          </div>
        ) : activeTab === "rankings" ? (
          <Leaderboard users={leaderboard} />
        ) : (
          <AchievementBadges badges={badges} />
        )}
      </main>
    </div>
  );
}
