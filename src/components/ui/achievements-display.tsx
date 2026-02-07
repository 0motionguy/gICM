"use client";

import { Card } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { Button } from "./button";
import { Lock, Award, Sparkles, Share2, Twitter, Linkedin, Copy, Check } from "lucide-react";
import { ACHIEVEMENTS, type Achievement, type UserPoints } from "@/lib/points";
import {
  shareAchievementToTwitter,
  shareAchievementToLinkedIn,
  copyAchievementShareText,
  nativeShare,
} from "@/lib/social-share";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AchievementsDisplayProps {
  userPoints: UserPoints;
  variant?: "grid" | "list";
}

export function AchievementsDisplay({
  userPoints,
  variant = "grid",
}: AchievementsDisplayProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const unlockedIds = new Set(userPoints.achievements);

  const handleShareTwitter = (achievement: Achievement) => {
    const url = shareAchievementToTwitter(achievement, userPoints);
    window.open(url, "_blank");
    setShareMenuOpen(null);
    toast.success("Opening Twitter...");
  };

  const handleShareLinkedIn = (achievement: Achievement) => {
    const url = shareAchievementToLinkedIn(achievement, userPoints);
    window.open(url, "_blank");
    setShareMenuOpen(null);
    toast.success("Opening LinkedIn...");
  };

  const handleCopyShareText = async (achievement: Achievement) => {
    try {
      await copyAchievementShareText(achievement, userPoints);
      setCopied(achievement.id);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async (achievement: Achievement) => {
    const success = await nativeShare({
      title: `Achievement Unlocked: ${achievement.name}!`,
      text: `🎉 I just earned the "${achievement.name}" achievement on ClawdBot!\n\n${achievement.description}`,
      url: "https://clawdbot.com/profile",
    });

    if (success) {
      setShareMenuOpen(null);
    }
  };

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest(".share-menu-container")) {
          setShareMenuOpen(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareMenuOpen]);

  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const isUnlocked = unlockedIds.has(achievement.id);

    // Apply unlock filter
    if (filter === "unlocked" && !isUnlocked) return false;
    if (filter === "locked" && isUnlocked) return false;

    // Apply category filter
    if (categoryFilter !== "all" && achievement.category !== categoryFilter) return false;

    return true;
  });

  const categories = [
    { id: "all", label: "All", count: ACHIEVEMENTS.length },
    {
      id: "install",
      label: "Installation",
      count: ACHIEVEMENTS.filter((a) => a.category === "install").length,
    },
    {
      id: "stack",
      label: "Stacks",
      count: ACHIEVEMENTS.filter((a) => a.category === "stack").length,
    },
    {
      id: "social",
      label: "Social",
      count: ACHIEVEMENTS.filter((a) => a.category === "social").length,
    },
    {
      id: "special",
      label: "Special",
      count: ACHIEVEMENTS.filter((a) => a.category === "special").length,
    },
  ];

  const rarityColors = {
    common: "bg-zinc-100 text-zinc-700 border-zinc-300",
    rare: "bg-blue-100 text-blue-700 border-blue-300",
    epic: "bg-purple-100 text-purple-700 border-purple-300",
    legendary: "bg-amber-100 text-amber-700 border-amber-300",
  };

  if (variant === "list") {
    return (
      <div className="space-y-2">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);

          return (
            <Card
              key={achievement.id}
              className={`p-3 ${isUnlocked ? "" : "opacity-60"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isUnlocked ? "bg-lime-100" : "bg-zinc-100"
                  }`}
                >
                  {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-zinc-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-black">{achievement.name}</h4>
                    <Badge variant="outline" className={`text-xs ${rarityColors[achievement.rarity]}`}>
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +{achievement.points}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600">{achievement.description}</p>
                  {!isUnlocked && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Requirement: {achievement.requirement}
                    </p>
                  )}
                </div>
                {isUnlocked && (
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <Sparkles className="w-5 h-5 text-lime-600 mb-1" />
                      <span className="text-xs text-zinc-500">Unlocked</span>
                    </div>
                    <div className="relative share-menu-container">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-auto py-1"
                        onClick={() => setShareMenuOpen(shareMenuOpen === achievement.id ? null : achievement.id)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>

                      {/* Share menu */}
                      {shareMenuOpen === achievement.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden z-10 min-w-[200px]">
                          <button
                            onClick={() => handleShareTwitter(achievement)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                          >
                            <Twitter className="w-4 h-4 text-blue-500" />
                            Share to Twitter
                          </button>
                          <button
                            onClick={() => handleShareLinkedIn(achievement)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                          >
                            <Linkedin className="w-4 h-4 text-blue-700" />
                            Share to LinkedIn
                          </button>
                          <button
                            onClick={() => handleCopyShareText(achievement)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                          >
                            {copied === achievement.id ? (
                              <>
                                <Check className="w-4 h-4 text-lime-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-zinc-600" />
                                Copy share text
                              </>
                            )}
                          </button>
                          {typeof navigator !== "undefined" && "share" in navigator && (
                            <button
                              onClick={() => handleNativeShare(achievement)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-zinc-600" />
                              More share options
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            All ({ACHIEVEMENTS.length})
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === "unlocked"
                ? "bg-lime-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Unlocked ({unlockedIds.size})
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === "locked"
                ? "bg-zinc-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Locked ({ACHIEVEMENTS.length - unlockedIds.size})
          </button>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? "bg-lime-300 text-black"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);

          return (
            <Card
              key={achievement.id}
              className={`p-4 relative overflow-hidden ${
                isUnlocked ? "border-lime-300" : ""
              }`}
            >
              {/* Unlocked indicator */}
              {isUnlocked && (
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-5 h-5 text-lime-600" />
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                    isUnlocked
                      ? "bg-gradient-to-br from-lime-100 to-emerald-100 border-2 border-lime-300"
                      : "bg-zinc-100 border-2 border-zinc-300"
                  } ${!isUnlocked && "opacity-50"}`}
                >
                  {isUnlocked ? achievement.icon : <Lock className="w-8 h-8 text-zinc-400" />}
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-3">
                <h3 className="font-bold text-black mb-1">{achievement.name}</h3>
                <p className="text-sm text-zinc-600 mb-2">{achievement.description}</p>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className={`text-xs ${rarityColors[achievement.rarity]}`}>
                    {achievement.rarity}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-lime-100 text-lime-700 border-lime-300">
                    +{achievement.points} pts
                  </Badge>
                </div>
              </div>

              {/* Requirement or unlock date */}
              {isUnlocked ? (
                <div className="space-y-2">
                  <p className="text-xs text-lime-600 font-medium text-center">✓ Unlocked</p>

                  {/* Share button */}
                  <div className="relative share-menu-container">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setShareMenuOpen(shareMenuOpen === achievement.id ? null : achievement.id)}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>

                    {/* Share menu */}
                    {shareMenuOpen === achievement.id && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden z-10">
                        <button
                          onClick={() => handleShareTwitter(achievement)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-blue-500" />
                          Share to Twitter
                        </button>
                        <button
                          onClick={() => handleShareLinkedIn(achievement)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-700" />
                          Share to LinkedIn
                        </button>
                        <button
                          onClick={() => handleCopyShareText(achievement)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                        >
                          {copied === achievement.id ? (
                            <>
                              <Check className="w-4 h-4 text-lime-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-zinc-600" />
                              Copy share text
                            </>
                          )}
                        </button>
                        {typeof navigator !== "undefined" && "share" in navigator && (
                          <button
                            onClick={() => handleNativeShare(achievement)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-zinc-600" />
                            More share options
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-zinc-500 font-medium">Requirement:</p>
                  <p className="text-xs text-zinc-700 mt-0.5">{achievement.requirement}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">No achievements found</p>
          <p className="text-sm text-zinc-400 mt-1">Try changing the filters</p>
        </div>
      )}
    </div>
  );
}
