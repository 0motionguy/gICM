import { NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/types/analytics';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { incrementItemInstalls } from '@/lib/item-stats';

// Store events in a JSON file for persistence
const ANALYTICS_DIR = join(process.cwd(), '.analytics');
const EVENTS_FILE = join(ANALYTICS_DIR, 'events.json');

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
    const data = await readFile(EVENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

async function writeEvents(events: AnalyticsEvent[]): Promise<void> {
  try {
    await ensureAnalyticsDir();
    await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Error writing events:', error);
  }
}

export async function POST(request: Request) {
  try {
    const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = await request.json();

    // Validate event
    if (!event.type || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, sessionId' },
        { status: 400 }
      );
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
    if (fullEvent.type === 'item_add_to_stack' && fullEvent.itemId) {
      try {
        incrementItemInstalls(fullEvent.itemId, fullEvent.sessionId);
      } catch (error) {
        console.error('Failed to increment item installs:', error);
        // Don't fail the analytics event if stats update fails
      }
    }

    // Keep only last 10,000 events to prevent file from growing too large
    const trimmedEvents = events.slice(-10000);

    // Write back to file
    await writeEvents(trimmedEvents);

    return NextResponse.json({
      success: true,
      eventId: fullEvent.id
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    const itemId = searchParams.get('itemId');

    // Read all events
    let events = await readEvents();

    // Apply filters
    if (type) {
      events = events.filter(e => e.type === type);
    }
    if (itemId) {
      events = events.filter(e => e.itemId === itemId);
    }

    // Sort by timestamp descending (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    events = events.slice(0, limit);

    return NextResponse.json({
      events,
      total: events.length
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
