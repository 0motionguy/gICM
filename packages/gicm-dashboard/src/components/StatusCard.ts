import type { MetricData, DashboardTheme } from "../types.js";
import {
  formatPrice,
  formatLargeNumber,
  formatPercent,
  getTrendColor,
} from "../formatters.js";

export interface StatusCardProps {
  metric: MetricData;
  theme?: DashboardTheme;
}

export interface StatusCardRender {
  label: string;
  formattedValue: string;
  trend: {
    direction: "up" | "down" | "flat";
    value: string;
    color: string;
  } | null;
  color: string;
}

/**
 * Render a single metric card as structured data.
 */
export function renderStatusCard(props: StatusCardProps): StatusCardRender {
  const { metric, theme: _theme } = props;

  // Format the value based on prefix/suffix hints
  let formattedValue: string;
  if (metric.prefix === "$") {
    formattedValue = formatPrice(metric.value);
  } else if (metric.suffix === "%") {
    formattedValue = formatPercent(metric.value);
  } else if (metric.value >= 1000 && !metric.suffix) {
    formattedValue = formatLargeNumber(metric.value);
  } else {
    formattedValue = metric.value.toLocaleString();
  }

  // Add prefix/suffix if not already handled
  if (metric.prefix && metric.prefix !== "$") {
    formattedValue = `${metric.prefix}${formattedValue}`;
  }
  if (metric.suffix && metric.suffix !== "%") {
    formattedValue = `${formattedValue}${metric.suffix}`;
  }

  // Build trend info
  let trend: StatusCardRender["trend"] = null;
  if (metric.trend) {
    const trendValue =
      metric.trendValue !== undefined
        ? `${metric.trendValue >= 0 ? "+" : ""}${metric.trendValue.toFixed(1)}%`
        : metric.trend === "up"
          ? "+0.0%"
          : metric.trend === "down"
            ? "-0.0%"
            : "0.0%";

    trend = {
      direction: metric.trend,
      value: trendValue,
      color: getTrendColor(metric.trend),
    };
  }

  return {
    label: metric.label,
    formattedValue,
    trend,
    color: metric.color ?? "#6b7280",
  };
}
