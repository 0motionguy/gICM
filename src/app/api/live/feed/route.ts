import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types/analytics";
import type { LiveActivity, LiveFeedResponse } from "@/types/live-activity";
import { ACTIVITY_TEMPLATES, ANONYMOUS_NAMES } from "@/types/live-activity";
import { generateSimulatedActivities } from "@/lib/activity-simulator";
import { LIVE_CONFIG } from "@/config/live";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { REGISTRY } from "@/lib/registry";

const ANALYTICS_DIR = join(process.cwd(), ".analytics");
const EVENTS_FILE = join(ANALYTICS_DIR, "events.json");

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    if (!existsSync(EVENTS_FILE)) {
      return [];
    }
    const data = await readFile(EVENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading events:", error);
    return [];
  }
}

/**
 * Get random anonymous name
 */
function getRandomUser(): string {
  const firstName = ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
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
 * Convert analytics event to live activity
 */
function convertToLiveActivity(event: AnalyticsEvent): LiveActivity | null {
  // Skip events that are not meant for live feed (e.g., workflow_ai_request)
  if (!Object.keys(ACTIVITY_TEMPLATES).includes(event.type)) {
    return null;
  }

  const template = ACTIVITY_TEMPLATES[event.type as keyof typeof ACTIVITY_TEMPLATES];
  if (!template) return null;

  const user = getRandomUser();
  const timestamp = new Date(event.timestamp);

  // Get item details if available
  let itemName = "an item";
  if (event.itemId) {
    const item = REGISTRY.find((i) => i.id === event.itemId);
    if (item) {
      itemName = item.name;
    }
  }

  // Build message based on event type
  let message = "";
  let metadata: Record<string, string | number | undefined> = { itemId: event.itemId, itemSlug: event.itemSlug };

  switch (event.type) {
    case "item_view":
      message = template.messageTemplate.replace("{user}", user).replace("{item}", itemName);
      break;

    case "item_add_to_stack":
      message = template.messageTemplate.replace("{user}", user).replace("{item}", itemName);
      break;

    case "item_remove_from_stack":
      message = template.messageTemplate.replace("{user}", user).replace("{item}", itemName);
      break;

    case "bundle_created":
      message = template.messageTemplate.replace("{user}", user).replace("{count}", "5-8");
      break;

    case "bundle_copied":
      message = template.messageTemplate.replace("{user}", user);
      break;

    case "search_query":
      message = template.messageTemplate.replace("{user}", user).replace("{query}", "...");
      break;

    default:
      return null;
  }

  return {
    id: `real_${event.sessionId}_${timestamp.getTime()}`,
    type: event.type,
    user,
    message,
    timestamp: timestamp.toISOString(),
    relativeTime: getRelativeTime(timestamp),
    icon: template.icon,
    color: template.color,
    isSimulated: false,
    metadata,
  };
}

export async function GET() {
  try {
    // Read recent real events
    const allEvents = await readEvents();

    // Get last 100 events (last few hours)
    const recentEvents = allEvents.slice(-100);

    // Convert real events to live activities
    const realActivities: LiveActivity[] = recentEvents
      .map(convertToLiveActivity)
      .filter((a): a is LiveActivity => a !== null);

    // Calculate how many simulated events we need
    const targetTotal = LIVE_CONFIG.activityFeedSize;
    const realCount = realActivities.length;
    const simulatedCount = Math.max(
      0,
      Math.floor((targetTotal - realCount) * (1 - LIVE_CONFIG.realToSimulatedRatio) / LIVE_CONFIG.realToSimulatedRatio)
    );

    // Generate simulated activities
    const simulatedActivities = generateSimulatedActivities(simulatedCount);

    // Merge and sort by timestamp (newest first)
    const allActivities = [...realActivities, ...simulatedActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, targetTotal);

    // Update relative times
    allActivities.forEach((activity) => {
      activity.relativeTime = getRelativeTime(new Date(activity.timestamp));
    });

    // Strip isSimulated field from all activities before sending to client
    const cleanActivities = allActivities.map(({ isSimulated, ...activity }) => activity);

    const response: LiveFeedResponse = {
      activities: cleanActivities as LiveActivity[],
      meta: {
        total: cleanActivities.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Live feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live feed" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
