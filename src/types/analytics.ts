export type AnalyticsEventType =
  | "item_view"
  | "item_add_to_stack"
  | "item_remove_from_stack"
  | "bundle_created"
  | "bundle_copied"
  | "search_query"
  | "filter_applied"
  | "workflow_ai_request"
  | "component_copied"
  | "component_previewed"
  | "stack_export"
  | "stack_share"
  | "category_filter"
  | "page_view"
  | "session_start"
  | "session_end"
  | "workflow_start"
  | "workflow_complete"
  | "bundle_generate"
  | "installation_start"
  | "installation_complete";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  itemId?: string;
  itemKind?: "agent" | "skill" | "command" | "mcp" | "setting";
  itemSlug?: string;
  bundleSize?: number;
  searchQuery?: string;
  filterValue?: string;
  sessionId: string;
  category?: string;
  page?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsStats {
  totalEvents: number;
  uniqueItems: number;
  uniqueVisitors?: number;
  itemsViewed?: number;
  searchCount?: number;
  bundleDownloads?: number;
  popularItems: ItemPopularity[];
  trendingItems: ItemPopularity[];
  popularCombinations: BundleCombination[];
  recentActivity: AnalyticsEvent[];
  statsByKind: {
    agent: number;
    skill: number;
    command: number;
    mcp: number;
    setting: number;
  };
  // Additional stats for dashboard
  topItems?: Array<{ name: string; count: number }>;
  byKind?: Record<string, number>;
  dailyEvents?: Array<{ date: string; count: number }>;
}

export interface ItemPopularity {
  itemId: string;
  itemName: string;
  itemKind: string;
  itemSlug: string;
  views: number;
  addedToStack: number;
  score: number;
}

export interface BundleCombination {
  items: string[];
  count: number;
  avgBundleSize: number;
}

// API Usage Tracking
export interface APIUsageEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  endpoint: string; // e.g., 'workflow/build'
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  responseTime: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
  promptHash?: string; // hash of the prompt for caching
}

export interface APIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number; // in USD
  averageResponseTime: number; // in milliseconds
  costByDay: Array<{ date: string; cost: number; requests: number }>;
  topPrompts: Array<{ prompt: string; count: number; avgCost: number }>;
  requestsByHour: Array<{ hour: number; count: number }>;
}
