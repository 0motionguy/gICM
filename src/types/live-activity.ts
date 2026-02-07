/**
 * Live Activity Types for Public Streaming Dashboard
 */

export type ActivityType =
  | "item_view"
  | "item_add_to_stack"
  | "item_remove_from_stack"
  | "bundle_created"
  | "bundle_copied"
  | "search_query"
  | "filter_applied"
  | "offspring_remix"
  | "project_completed"
  | "install_command"
  | "stack_deployed";

export type ActivityIcon =
  | "eye"
  | "plus"
  | "minus"
  | "package"
  | "download"
  | "search"
  | "filter"
  | "sparkles"
  | "check-circle"
  | "terminal"
  | "rocket";

export interface LiveActivity {
  id: string;
  type: ActivityType;
  user: string; // Anonymous name like "Alex M."
  message: string; // Display message
  timestamp: string; // ISO string
  relativeTime: string; // "2s ago", "1m ago"
  icon: ActivityIcon;
  color: "lime" | "purple" | "blue" | "green" | "yellow" | "pink";
  isSimulated?: boolean; // Internal only - stripped from public API
  metadata?: {
    itemName?: string;
    itemSlug?: string;
    stackName?: string;
    searchTerm?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface LiveStats {
  totalBuilders: number;
  activeNow: number;
  builtToday: number;
  trending: Array<{
    name: string;
    count: number;
  }>;
  lastUpdated: string;
}

export interface LiveFeedResponse {
  activities: LiveActivity[];
  meta: {
    total: number;
  };
}

export interface LiveStatsResponse extends LiveStats {}

// Anonymous user name pool
export const ANONYMOUS_NAMES = [
  "Alex",
  "Jordan",
  "Casey",
  "Quinn",
  "Riley",
  "Sam",
  "Morgan",
  "Taylor",
  "Avery",
  "Blake",
  "Drew",
  "Cameron",
  "Skyler",
  "Dakota",
  "River",
  "Parker",
  "Sage",
  "Phoenix",
  "Rowan",
  "Eden",
];

// Activity templates for simulation
export const ACTIVITY_TEMPLATES: Record<
  ActivityType,
  {
    messageTemplate: string;
    icon: ActivityIcon;
    color: LiveActivity["color"];
  }
> = {
  item_view: {
    messageTemplate: "{user} is exploring {item}",
    icon: "eye",
    color: "blue",
  },
  item_add_to_stack: {
    messageTemplate: "{user} added {item} to their stack",
    icon: "plus",
    color: "lime",
  },
  item_remove_from_stack: {
    messageTemplate: "{user} removed {item} from their stack",
    icon: "minus",
    color: "yellow",
  },
  bundle_created: {
    messageTemplate: "{user} built a {count}-item stack",
    icon: "package",
    color: "purple",
  },
  bundle_copied: {
    messageTemplate: "{user} downloaded a custom stack",
    icon: "download",
    color: "green",
  },
  search_query: {
    messageTemplate: "{user} searched for '{query}'",
    icon: "search",
    color: "blue",
  },
  filter_applied: {
    messageTemplate: "{user} filtered by {filter}",
    icon: "filter",
    color: "blue",
  },
  offspring_remix: {
    messageTemplate: "{user} remixed '{original}' → '{new}'",
    icon: "sparkles",
    color: "purple",
  },
  project_completed: {
    messageTemplate: "{user} completed '{project}'",
    icon: "check-circle",
    color: "green",
  },
  install_command: {
    messageTemplate: "{user} installed ClawdBot CLI",
    icon: "terminal",
    color: "lime",
  },
  stack_deployed: {
    messageTemplate: "{user} deployed stack to production",
    icon: "rocket",
    color: "pink",
  },
};
