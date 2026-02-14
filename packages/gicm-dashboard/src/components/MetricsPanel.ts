import type { MetricData, DashboardTheme } from "../types.js";
import { renderStatusCard, type StatusCardRender } from "./StatusCard.js";

export interface MetricsPanelProps {
  metrics: MetricData[];
  columns?: number;
  theme?: DashboardTheme;
}

export interface MetricsPanelRender {
  cards: StatusCardRender[];
  columns: number;
  summary: { total: number; trending_up: number; trending_down: number };
}

/**
 * Render a grid of metric cards as structured data.
 */
export function renderMetricsPanel(
  props: MetricsPanelProps
): MetricsPanelRender {
  const { metrics, columns = 4, theme } = props;

  const cards = metrics.map((metric) => renderStatusCard({ metric, theme }));

  const trending_up = metrics.filter((m) => m.trend === "up").length;
  const trending_down = metrics.filter((m) => m.trend === "down").length;

  return {
    cards,
    columns,
    summary: {
      total: metrics.length,
      trending_up,
      trending_down,
    },
  };
}
