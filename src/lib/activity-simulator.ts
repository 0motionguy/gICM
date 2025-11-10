/**
 * Activity Simulator - Generates realistic viral activity for live dashboard
 */

import type { LiveActivity, ActivityType } from "@/types/live-activity";
import { ANONYMOUS_NAMES, ACTIVITY_TEMPLATES } from "@/types/live-activity";
import { LIVE_CONFIG } from "@/config/live";
import { REGISTRY } from "@/lib/registry";

// Get popular items from actual registry (randomly select from real items)
function getPopularItems(): string[] {
  // Shuffle and take 30 random items from registry for variety
  const shuffled = [...REGISTRY].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 30).map(item => item.name);
}

const POPULAR_ITEMS = getPopularItems();

// Project names for completion events
const PROJECT_NAMES = [
  "DeFi Trading Bot",
  "NFT Marketplace",
  "Real-time Analytics Dashboard",
  "Token Launch Platform",
  "Solana Staking Pool",
  "Multi-sig Wallet",
  "DEX Aggregator",
  "Yield Optimizer",
  "Cross-chain Bridge UI",
  "DAO Governance Platform",
  "Prediction Market",
  "Lending Protocol Frontend",
];

// Stack names for remix events
const STACK_TEMPLATES = [
  { original: "Web3 Starter", new: "DeFi Trading Bot" },
  { original: "Full-Stack Template", new: "NFT Marketplace" },
  { original: "Microservices Base", new: "Real-time Analytics" },
  { original: "Solana Starter", new: "Token Launch Platform" },
  { original: "React Template", new: "Multi-sig Wallet UI" },
  { original: "API Boilerplate", new: "DEX Aggregator" },
];

/**
 * Get random element from array
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random anonymous username
 */
function getRandomUser(): string {
  const firstName = getRandomElement(ANONYMOUS_NAMES);
  const lastInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${firstName} ${lastInitial}.`;
}

/**
 * Get relative time string
 */
function getRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Generate unique activity ID (using "real_" prefix to match actual user activities)
 */
function generateActivityId(): string {
  const sessionId = `sim${Math.random().toString(36).substr(2, 9)}`;
  return `real_${sessionId}_${Date.now()}`;
}

/**
 * Generate simulated activity based on type
 */
function generateSimulatedActivity(type: ActivityType): LiveActivity {
  const template = ACTIVITY_TEMPLATES[type];
  const user = getRandomUser();
  const timestamp = new Date();

  // Randomize timestamp within last 5 minutes
  timestamp.setSeconds(timestamp.getSeconds() - Math.floor(Math.random() * 300));

  let message = "";
  let metadata: any = {};

  switch (type) {
    case "item_add_to_stack":
      const item = getRandomElement(POPULAR_ITEMS);
      message = template.messageTemplate.replace("{user}", user).replace("{item}", item);
      metadata = { itemName: item };
      break;

    case "bundle_created":
      const count = Math.floor(Math.random() * 8) + 3; // 3-10 items
      message = template.messageTemplate.replace("{user}", user).replace("{count}", count.toString());
      metadata = { stackSize: count };
      break;

    case "offspring_remix":
      const stack = getRandomElement(STACK_TEMPLATES);
      message = template.messageTemplate
        .replace("{user}", user)
        .replace("{original}", stack.original)
        .replace("{new}", stack.new);
      metadata = { original: stack.original, new: stack.new };
      break;

    case "project_completed":
      const project = getRandomElement(PROJECT_NAMES);
      message = template.messageTemplate.replace("{user}", user).replace("{project}", project);
      metadata = { projectName: project };
      break;

    case "install_command":
      message = template.messageTemplate.replace("{user}", user);
      break;

    case "stack_deployed":
      message = template.messageTemplate.replace("{user}", user);
      break;

    default:
      message = template.messageTemplate.replace("{user}", user);
  }

  return {
    id: generateActivityId(),
    type,
    user,
    message,
    timestamp: timestamp.toISOString(),
    relativeTime: getRelativeTime(timestamp),
    icon: template.icon,
    color: template.color,
    isSimulated: true,
    metadata,
  };
}

/**
 * Select random activity type based on weights
 */
function selectRandomActivityType(): ActivityType {
  const types = LIVE_CONFIG.simulation.enabledTypes;
  const weights = LIVE_CONFIG.simulation.typeWeights;

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (const type of types) {
    random -= weights[type] || 0;
    if (random <= 0) {
      return type;
    }
  }

  return types[0];
}

/**
 * Generate multiple simulated activities
 */
export function generateSimulatedActivities(count: number): LiveActivity[] {
  const activities: LiveActivity[] = [];

  for (let i = 0; i < count; i++) {
    const type = selectRandomActivityType();
    activities.push(generateSimulatedActivity(type));
  }

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities;
}

/**
 * Check if more activity during "work hours" (simulates realistic traffic patterns)
 */
export function isHighActivityPeriod(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();

  // Higher activity during US/EU work hours (8am-8pm UTC)
  return hour >= 8 && hour < 20;
}

/**
 * Get simulated activity rate multiplier based on time of day
 */
export function getActivityMultiplier(): number {
  return isHighActivityPeriod() ? 1.5 : 0.6;
}
