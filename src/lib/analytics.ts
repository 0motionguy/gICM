"use client";

import type { AnalyticsEventType } from '@/types/analytics';

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('gicm-session-id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('gicm-session-id', sessionId);
  }
  return sessionId;
}

interface TrackEventOptions {
  itemId?: string;
  itemKind?: 'agent' | 'skill' | 'command' | 'mcp';
  itemSlug?: string;
  bundleSize?: number;
  searchQuery?: string;
  filterValue?: string;
}

export async function trackEvent(
  type: AnalyticsEventType,
  options: TrackEventOptions = {}
): Promise<void> {
  try {
    const sessionId = getSessionId();

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        sessionId,
        ...options,
      }),
    });
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error('Analytics tracking failed:', error);
  }
}

// Convenience functions
export const analytics = {
  trackItemView: (itemId: string, itemKind: string, itemSlug: string) =>
    trackEvent('item_view', { itemId, itemKind: itemKind as any, itemSlug }),

  trackItemAddToStack: (itemId: string, itemKind: string, itemSlug: string) =>
    trackEvent('item_add_to_stack', { itemId, itemKind: itemKind as any, itemSlug }),

  trackItemRemoveFromStack: (itemId: string, itemKind: string, itemSlug: string) =>
    trackEvent('item_remove_from_stack', { itemId, itemKind: itemKind as any, itemSlug }),

  trackBundleCreated: (bundleSize: number) =>
    trackEvent('bundle_created', { bundleSize }),

  trackBundleCopied: (bundleSize: number) =>
    trackEvent('bundle_copied', { bundleSize }),

  trackSearchQuery: (query: string) =>
    trackEvent('search_query', { searchQuery: query }),

  trackFilterApplied: (filterValue: string) =>
    trackEvent('filter_applied', { filterValue }),

  trackComponentCopied: (itemId: string, itemKind: string, itemSlug: string) =>
    trackEvent('component_copied', { itemId, itemKind: itemKind as any, itemSlug }),

  trackComponentPreviewed: (itemId: string, itemKind: string, itemSlug: string) =>
    trackEvent('component_previewed', { itemId, itemKind: itemKind as any, itemSlug }),
};
