import { NextResponse } from "next/server";
import type {
  AnalyticsEvent,
  AnalyticsStats,
  ItemPopularity,
  BundleCombination,
} from "@/types/analytics";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { REGISTRY } from "@/lib/registry";
import { z } from "zod";

const ANALYTICS_DIR = join(process.cwd(), ".analytics");
const EVENTS_FILE = join(ANALYTICS_DIR, "events.json");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max

const StatsParamsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    if (!existsSync(EVENTS_FILE)) {
      return [];
    }

    // Check file size before reading
    const fileStats = await stat(EVENTS_FILE);
    if (fileStats.size > MAX_FILE_SIZE) {
      console.error("Analytics file too large:", fileStats.size);
      return [];
    }

    const data = await readFile(EVENTS_FILE, "utf-8");

    // Validate JSON structure
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.error("Invalid events file format");
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Error reading events:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const parseResult = StatsParamsSchema.safeParse({
      days: searchParams.get("days") || "30",
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { days } = parseResult.data;

    // Read all events
    const allEvents = await readEvents();

    // Filter events by time window
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const events = allEvents.filter((e) => new Date(e.timestamp) >= cutoffDate);

    // Calculate popular items
    const itemStats = new Map<string, { views: number; adds: number }>();

    events.forEach((event) => {
      if (event.itemId) {
        const stats = itemStats.get(event.itemId) || { views: 0, adds: 0 };
        if (event.type === "item_view") {
          stats.views++;
        } else if (event.type === "item_add_to_stack") {
          stats.adds++;
        }
        itemStats.set(event.itemId, stats);
      }
    });

    // Convert to ItemPopularity array
    const popularItems = Array.from(itemStats.entries())
      .map(([itemId, stats]) => {
        const item = REGISTRY.find((i) => i.id === itemId);
        if (!item) return null;

        return {
          itemId,
          itemName: item.name,
          itemKind: item.kind,
          itemSlug: item.slug,
          views: stats.views,
          addedToStack: stats.adds,
          score: stats.views + stats.adds * 3, // Weight adds more heavily
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b!.score - a!.score) as ItemPopularity[];

    // Calculate trending items (comparing last 7 days vs previous 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const previous7Days = new Date();
    previous7Days.setDate(previous7Days.getDate() - 14);

    const recentEvents = events.filter(
      (e) => new Date(e.timestamp) >= last7Days,
    );
    const previousEvents = events.filter((e) => {
      const date = new Date(e.timestamp);
      return date >= previous7Days && date < last7Days;
    });

    const recentScores = new Map<string, number>();
    const previousScores = new Map<string, number>();

    recentEvents.forEach((e) => {
      if (e.itemId) {
        const score = recentScores.get(e.itemId) || 0;
        recentScores.set(
          e.itemId,
          score + (e.type === "item_add_to_stack" ? 3 : 1),
        );
      }
    });

    previousEvents.forEach((e) => {
      if (e.itemId) {
        const score = previousScores.get(e.itemId) || 0;
        previousScores.set(
          e.itemId,
          score + (e.type === "item_add_to_stack" ? 3 : 1),
        );
      }
    });

    const trendingItems: ItemPopularity[] = Array.from(recentScores.entries())
      .map(([itemId, recentScore]) => {
        const previousScore = previousScores.get(itemId) || 0;
        const growth =
          previousScore > 0
            ? (recentScore - previousScore) / previousScore
            : recentScore;

        const item = REGISTRY.find((i) => i.id === itemId);
        if (!item) return null;

        const itemData = popularItems.find((i) => i.itemId === itemId);

        return {
          itemId,
          itemName: item.name,
          itemKind: item.kind,
          itemSlug: item.slug,
          views: itemData?.views || 0,
          addedToStack: itemData?.addedToStack || 0,
          score: growth,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b!.score - a!.score) as ItemPopularity[];

    // Calculate popular combinations by analyzing items added in the same session
    const itemsBySession = new Map<string, string[]>();

    events
      .filter((e) => e.type === "item_add_to_stack" && e.itemId)
      .forEach((event) => {
        const sessionItems = itemsBySession.get(event.sessionId) || [];
        if (event.itemId && !sessionItems.includes(event.itemId)) {
          sessionItems.push(event.itemId);
        }
        itemsBySession.set(event.sessionId, sessionItems);
      });

    // Find pairs of items frequently used together
    const pairCounts = new Map<
      string,
      { count: number; sessions: Set<string> }
    >();

    itemsBySession.forEach((sessionItems, sessionId) => {
      // Only consider sessions with 2+ items (real stacks)
      if (sessionItems.length < 2) return;

      // Generate all pairs from this session
      for (let i = 0; i < sessionItems.length; i++) {
        for (let j = i + 1; j < sessionItems.length; j++) {
          // Sort to ensure consistent key
          const pair = [sessionItems[i], sessionItems[j]].sort().join("|");
          const existing = pairCounts.get(pair) || {
            count: 0,
            sessions: new Set(),
          };
          existing.count++;
          existing.sessions.add(sessionId);
          pairCounts.set(pair, existing);
        }
      }
    });

    // Convert to BundleCombination array and get top combinations
    const popularCombinations: BundleCombination[] = Array.from(
      pairCounts.entries(),
    )
      .filter(([_, data]) => data.count >= 2) // At least 2 occurrences
      .map(([pairKey, data]) => {
        const items = pairKey.split("|");
        // Calculate average bundle size for sessions containing this pair
        const sessionSizes = Array.from(data.sessions).map(
          (sid) => itemsBySession.get(sid)?.length || 0,
        );
        const avgBundleSize =
          sessionSizes.reduce((a, b) => a + b, 0) / sessionSizes.length;

        return {
          items,
          count: data.count,
          avgBundleSize: Math.round(avgBundleSize * 10) / 10,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Stats by kind
    const statsByKind = {
      agent: events.filter(
        (e) => e.itemKind === "agent" && e.type === "item_add_to_stack",
      ).length,
      skill: events.filter(
        (e) => e.itemKind === "skill" && e.type === "item_add_to_stack",
      ).length,
      command: events.filter(
        (e) => e.itemKind === "command" && e.type === "item_add_to_stack",
      ).length,
      mcp: events.filter(
        (e) => e.itemKind === "mcp" && e.type === "item_add_to_stack",
      ).length,
      setting: events.filter(
        (e) => e.itemKind === "setting" && e.type === "item_add_to_stack",
      ).length,
    };

    // Recent activity
    const recentActivity = events.slice(-50).reverse();

    // Calculate additional metrics
    const uniqueVisitors = new Set(events.map((e) => e.sessionId)).size;
    const itemsViewed = events.filter((e) => e.type === "item_view").length;
    const searchCount = events.filter((e) => e.type === "search_query").length;
    const bundleDownloads = events.filter(
      (e) => e.type === "bundle_copied",
    ).length;

    // Top items for charts
    const topItems = popularItems.slice(0, 10).map((item) => ({
      name: item.itemName,
      count: item.views,
    }));

    // Views by kind for pie chart
    const byKind: Record<string, number> = {
      agent: events.filter(
        (e) => e.itemKind === "agent" && e.type === "item_view",
      ).length,
      skill: events.filter(
        (e) => e.itemKind === "skill" && e.type === "item_view",
      ).length,
      command: events.filter(
        (e) => e.itemKind === "command" && e.type === "item_view",
      ).length,
      mcp: events.filter((e) => e.itemKind === "mcp" && e.type === "item_view")
        .length,
    };

    // Daily events for timeline (last N days)
    const dailyEvents: Array<{ date: string; count: number }> = [];
    const eventsByDate = new Map<string, number>();

    events.forEach((event) => {
      const date = event.timestamp.split("T")[0]; // Get date part only
      eventsByDate.set(date, (eventsByDate.get(date) || 0) + 1);
    });

    Array.from(eventsByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        dailyEvents.push({ date, count });
      });

    // Build stats object
    const stats: AnalyticsStats = {
      totalEvents: events.length,
      uniqueItems: itemStats.size,
      uniqueVisitors,
      itemsViewed,
      searchCount,
      bundleDownloads,
      popularItems: popularItems.slice(0, 10),
      trendingItems: trendingItems.slice(0, 10),
      popularCombinations,
      recentActivity,
      statsByKind,
      topItems,
      byKind,
      dailyEvents,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Analytics stats error:", error);
    return NextResponse.json(
      { error: "Failed to calculate stats" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
