import type { ServiceHealth, DashboardTheme } from "../types.js";
import {
  getStatusColor,
  formatDuration,
  formatPercent,
  getRelativeTime,
} from "../formatters.js";

export interface HealthGridProps {
  services: ServiceHealth[];
  theme?: DashboardTheme;
}

export interface HealthGridItem {
  id: string;
  name: string;
  status: ServiceHealth["status"];
  statusColor: string;
  latency: string | null;
  uptime: string | null;
  lastCheck: string | null;
  message?: string;
}

export interface HealthGridRender {
  items: HealthGridItem[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}

/**
 * Render a service health grid as structured data.
 */
export function renderHealthGrid(props: HealthGridProps): HealthGridRender {
  const { services, theme: _theme } = props;

  const items: HealthGridItem[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    status: service.status,
    statusColor: getStatusColor(service.status),
    latency:
      service.latency !== undefined ? formatDuration(service.latency) : null,
    uptime:
      service.uptime !== undefined
        ? formatPercent(service.uptime / 100, 2)
        : null,
    lastCheck:
      service.lastCheck !== undefined
        ? getRelativeTime(service.lastCheck)
        : null,
    message: service.message,
  }));

  const summary = {
    total: services.length,
    healthy: services.filter((s) => s.status === "healthy").length,
    degraded: services.filter((s) => s.status === "degraded").length,
    unhealthy: services.filter((s) => s.status === "unhealthy").length,
    unknown: services.filter((s) => s.status === "unknown").length,
  };

  return { items, summary };
}
