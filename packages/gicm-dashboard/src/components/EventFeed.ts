import type { ActivityEvent, ActivityType, DashboardTheme } from "../types.js";
import { getRelativeTime, getActivityColor } from "../formatters.js";

export interface EventFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  theme?: DashboardTheme;
}

export interface EventFeedItem {
  id: string;
  message: string;
  relativeTime: string;
  type: ActivityType;
  color: string;
  source?: string;
}

export interface EventFeedRender {
  items: EventFeedItem[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Render an activity event feed as structured data.
 * Events are sorted newest-first, then capped at maxItems.
 */
export function renderEventFeed(props: EventFeedProps): EventFeedRender {
  const { events, maxItems = 50, theme: _theme } = props;

  // Sort newest first
  const sorted = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const totalCount = sorted.length;
  const capped = sorted.slice(0, maxItems);

  const items: EventFeedItem[] = capped.map((event) => ({
    id: event.id,
    message: event.message,
    relativeTime: getRelativeTime(event.timestamp),
    type: event.type,
    color: getActivityColor(event.type),
    source: event.source,
  }));

  return {
    items,
    totalCount,
    hasMore: totalCount > maxItems,
  };
}
