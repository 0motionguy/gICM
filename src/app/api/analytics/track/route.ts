import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types/analytics";
import { writeFile, readFile, mkdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { incrementItemInstalls } from "@/lib/item-stats";
import { z } from "zod";

// Store events in a JSON file for persistence
const ANALYTICS_DIR = join(process.cwd(), ".analytics");
const EVENTS_FILE = join(ANALYTICS_DIR, "events.json");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size

// Zod schema for analytics events
const EventTypeSchema = z.enum([
  "item_view",
  "item_add_to_stack",
  "item_remove_from_stack",
  "stack_export",
  "stack_share",
  "search_query",
  "category_filter",
  "page_view",
  "session_start",
  "session_end",
  "workflow_start",
  "workflow_complete",
  "bundle_generate",
  "installation_start",
  "installation_complete",
]);

const AnalyticsEventSchema = z.object({
  type: EventTypeSchema,
  sessionId: z.string().min(1).max(100),
  itemId: z.string().max(100).optional(),
  searchQuery: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  page: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const GetParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  type: EventTypeSchema.optional(),
  itemId: z.string().max(100).optional(),
});

async function ensureAnalyticsDir() {
  if (!existsSync(ANALYTICS_DIR)) {
    await mkdir(ANALYTICS_DIR, { recursive: true });
  }
}

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    await ensureAnalyticsDir();
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

async function writeEvents(events: AnalyticsEvent[]): Promise<void> {
  try {
    await ensureAnalyticsDir();
    await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error("Error writing events:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate event with Zod
    const parseResult = AnalyticsEventSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const event = parseResult.data;

    // Check file size before writing
    try {
      if (existsSync(EVENTS_FILE)) {
        const fileStats = await stat(EVENTS_FILE);
        if (fileStats.size > MAX_FILE_SIZE) {
          console.warn("Analytics file size exceeded, skipping write");
          return NextResponse.json({
            success: true,
            eventId: "skipped-size-limit",
          });
        }
      }
    } catch {
      // Continue if we can't check file size
    }

    // Create full event with ID and timestamp
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // Read existing events
    const events = await readEvents();

    // Add new event
    events.push(fullEvent);

    // Track item installs when adding to stack
    if (fullEvent.type === "item_add_to_stack" && fullEvent.itemId) {
      try {
        incrementItemInstalls(fullEvent.itemId, fullEvent.sessionId);
      } catch (error) {
        console.error("Failed to increment item installs:", error);
        // Don't fail the analytics event if stats update fails
      }
    }

    // Keep only last 10,000 events to prevent file from growing too large
    const trimmedEvents = events.slice(-10000);

    // Write back to file
    await writeEvents(trimmedEvents);

    return NextResponse.json({
      success: true,
      eventId: fullEvent.id,
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = GetParamsSchema.safeParse({
      limit: searchParams.get("limit") || "100",
      type: searchParams.get("type") || undefined,
      itemId: searchParams.get("itemId") || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { limit, type, itemId } = parseResult.data;

    // Read all events
    let events = await readEvents();

    // Apply filters
    if (type) {
      events = events.filter((e) => e.type === type);
    }
    if (itemId) {
      events = events.filter((e) => e.itemId === itemId);
    }

    // Sort by timestamp descending (newest first)
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply limit
    events = events.slice(0, limit);

    return NextResponse.json({
      events,
      total: events.length,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
