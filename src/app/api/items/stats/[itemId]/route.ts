import { NextRequest, NextResponse } from 'next/server';
import { getItemStat } from '@/lib/item-stats';

/**
 * GET /api/items/stats/[itemId]
 * Returns statistics for a specific item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId is required' },
        { status: 400 }
      );
    }

    const stat = getItemStat(itemId);

    if (!stat) {
      return NextResponse.json({
        success: true,
        data: {
          itemId,
          installs: 0,
          remixes: 0,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        ...stat,
      },
    });
  } catch (error) {
    console.error('Error fetching item stat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item stat' },
      { status: 500 }
    );
  }
}
