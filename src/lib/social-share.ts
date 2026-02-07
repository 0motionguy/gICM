/**
 * Social Sharing Utilities
 * Generate share links for achievements, stacks, and stats
 */

import type { Achievement, UserPoints } from "./points";
import type { StackConfig } from "./remix";

/**
 * Generate Twitter share URL for an achievement
 */
export function shareAchievementToTwitter(
  achievement: Achievement,
  userPoints: UserPoints
): string {
  const text = `🎉 I just earned the "${achievement.name}" achievement on @clawdbot_io!\n\n${achievement.description}\n\n+${achievement.points} points • ${achievement.rarity} rarity\n\nJoin me in building faster with AI! 🚀`;

  const url = "https://clawdbot.com/profile";
  const hashtags = "ClawdBot,Web3,AI,BuildInPublic";

  const params = new URLSearchParams({
    text,
    url,
    hashtags,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL for an achievement
 */
export function shareAchievementToLinkedIn(
  achievement: Achievement,
  userPoints: UserPoints
): string {
  const summary = `I just earned the "${achievement.name}" achievement on ClawdBot - The AI Marketplace for Web3 Builders! ${achievement.description}`;

  const url = "https://clawdbot.com/profile";

  const params = new URLSearchParams({
    url,
    summary,
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generate achievement image data URL (for Open Graph)
 */
export function generateAchievementImage(
  achievement: Achievement,
  userPoints: UserPoints
): string {
  // For MVP, return a data URL with SVG
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a3e635;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#grad1)"/>

      <!-- Content -->
      <text x="600" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">
        🎉 Achievement Unlocked!
      </text>

      <text x="600" y="300" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">
        ${achievement.icon || "🏆"} ${achievement.name}
      </text>

      <text x="600" y="380" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)" text-anchor="middle">
        ${achievement.description}
      </text>

      <text x="600" y="480" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        +${achievement.points} points • ${achievement.rarity} rarity
      </text>

      <text x="600" y="560" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle">
        ClawdBot - The AI Marketplace for Web3 Builders
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate Twitter share URL for a stack
 */
export function shareStackToTwitter(stack: StackConfig): string {
  const text = `🚀 Check out my "${stack.name}" stack on @clawdbot_io!\n\n${stack.description || "Custom AI development stack"}\n\n${stack.items.length} items • Built for Web3\n\nBuild your own: `;

  const url = `https://clawdbot.com/stacks?import=${encodeURIComponent(stack.id)}`;
  const hashtags = "ClawdBot,Web3,AI,DevTools";

  const params = new URLSearchParams({
    text,
    url,
    hashtags,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL for a stack
 */
export function shareStackToLinkedIn(stack: StackConfig): string {
  const summary = `I built a custom AI development stack "${stack.name}" on ClawdBot. ${stack.description || ""} Check it out and build your own!`;

  const url = `https://clawdbot.com/stacks?import=${encodeURIComponent(stack.id)}`;

  const params = new URLSearchParams({
    url,
    summary,
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generate Twitter share URL for points milestone
 */
export function sharePointsMilestoneToTwitter(
  userPoints: UserPoints,
  milestone: number
): string {
  const level = userPoints.currentLevel;
  const text = `🎯 Just hit ${milestone} points on @clawdbot_io!\n\nLevel ${level.level}: ${level.name} ${level.badge}\n\nBuilding faster with AI-powered Web3 tools 🚀\n\nJoin me: `;

  const url = "https://clawdbot.com";
  const hashtags = "ClawdBot,Web3,AI,Milestone";

  const params = new URLSearchParams({
    text,
    url,
    hashtags,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Copy achievement share text to clipboard
 */
export async function copyAchievementShareText(
  achievement: Achievement,
  userPoints: UserPoints
): Promise<void> {
  const text = `🎉 Achievement Unlocked: "${achievement.name}"!

${achievement.description}

+${achievement.points} points • ${achievement.rarity} rarity
Level ${userPoints.currentLevel.level}: ${userPoints.currentLevel.name} ${userPoints.currentLevel.badge}

Built with ClawdBot - The AI Marketplace for Web3 Builders
https://clawdbot.com/profile`;

  await navigator.clipboard.writeText(text);
}

/**
 * Native share API (mobile-friendly)
 */
export async function nativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      // User cancelled or error
      return false;
    }
  }
  return false;
}
