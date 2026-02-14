import { z } from "zod";

// Theme
export type DashboardTheme = "light" | "dark";

// Metrics
export interface MetricData {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  prefix?: string; // "$", etc.
  suffix?: string; // "%", "ms", etc.
  trend?: "up" | "down" | "flat";
  trendValue?: number; // percentage change
  color?: string;
}

// Activity
export type ActivityType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "agent"
  | "cost"
  | "security"
  | "deploy";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Health
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface ServiceHealth {
  id: string;
  name: string;
  status: HealthStatus;
  latency?: number; // ms
  uptime?: number; // percentage
  lastCheck?: Date;
  message?: string;
}

// Cost
export interface CostDataPoint {
  date: string; // ISO date or label
  cost: number;
  budget?: number;
  savings?: number;
}

// Chart
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Config
export const DashboardConfigSchema = z.object({
  theme: z.enum(["light", "dark"]).default("dark"),
  pollInterval: z.number().min(1000).default(5000),
  maxActivityItems: z.number().int().positive().default(50),
  locale: z.string().default("en-US"),
  currency: z.string().default("USD"),
});
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;

// Events
export type DashboardEvents = {
  "metric:updated": [MetricData];
  "activity:added": [ActivityEvent];
  "health:changed": [ServiceHealth];
};
