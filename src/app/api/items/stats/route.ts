import { NextRequest, NextResponse } from 'next/server';
import { readItemStats, incrementItemInstalls, incrementItemRemixes } from '@/lib/item-stats';
import type { IncrementStatsRequest } from '@/types/item-stats';

/**
 * GET /api/items/stats
 * Returns all item statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = readItemStats();

    // Return just the items object for easier consumption
    return NextResponse.json({
      success: true,
      data: stats.items,
      meta: stats.meta,
    });
  } catch (error) {
    console.error('Error fetching item stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items/stats
 * Increment install or remix count for an item
 *
 * Body: { itemId: string, type: 'install' | 'remix', sessionId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as IncrementStatsRequest;

    if (!body.itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['install', 'remix'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'type must be "install" or "remix"' },
        { status: 400 }
      );
    }

    if (body.type === 'install') {
      incrementItemInstalls(body.itemId, body.sessionId);
    } else {
      incrementItemRemixes(body.itemId);
    }

    return NextResponse.json({
      success: true,
      message: `${body.type} count incremented for ${body.itemId}`,
    });
  } catch (error) {
    console.error('Error incrementing item stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment item stats' },
      { status: 500 }
    );
  }
}
