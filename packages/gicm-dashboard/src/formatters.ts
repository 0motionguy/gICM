import type { HealthStatus, ActivityType } from "./types.js";

/**
 * Format a price value with appropriate precision.
 * Handles micro-prices ($0.000001) through large values ($1.5M).
 * Edge cases: 0, negative, NaN, Infinity are handled gracefully.
 */
export function formatPrice(
  price: number,
  locale = "en-US",
  currency = "USD"
): string {
  // Edge cases
  if (Number.isNaN(price)) return "$NaN";
  if (!Number.isFinite(price)) return price > 0 ? "$Infinity" : "-$Infinity";
  if (price === 0) return "$0.00";

  const isNegative = price < 0;
  const abs = Math.abs(price);
  let formatted: string;

  if (abs >= 1e9) {
    formatted = `$${(abs / 1e9).toFixed(2)}B`;
  } else if (abs >= 1e6) {
    formatted = `$${(abs / 1e6).toFixed(2)}M`;
  } else if (abs >= 1e3) {
    formatted = `$${abs.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (abs >= 100) {
    formatted = `$${abs.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (abs >= 1) {
    formatted = `$${abs.toFixed(4)}`;
  } else if (abs >= 0.001) {
    formatted = `$${abs.toFixed(6)}`;
  } else {
    // Micro-prices: show enough decimals
    formatted = `$${abs.toFixed(8)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format large numbers with K/M/B suffixes.
 * 1500 -> "1.5K", 1500000 -> "1.5M", 1500000000 -> "1.5B"
 */
export function formatLargeNumber(num: number): string {
  if (Number.isNaN(num)) return "NaN";
  if (!Number.isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";

  const isNegative = num < 0;
  const abs = Math.abs(num);
  let formatted: string;

  if (abs >= 1e9) {
    formatted = `${(abs / 1e9).toFixed(1)}B`;
  } else if (abs >= 1e6) {
    formatted = `${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    formatted = `${(abs / 1e3).toFixed(1)}K`;
  } else {
    formatted = abs.toFixed(0);
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format milliseconds into a human-readable duration.
 * 3661000 -> "1h 1m 1s", 45000 -> "45s"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

  return parts.join(" ") || "0s";
}

/**
 * Format a decimal value as a percentage.
 * 0.856 -> "85.6%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a token count with K/M/B suffix.
 * 1500000 -> "1.5M tokens"
 */
export function formatTokens(count: number): string {
  return `${formatLargeNumber(count)} tokens`;
}

/**
 * Format byte count into human-readable form.
 * 1536 -> "1.5 KB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return `-${formatBytes(-bytes)}`;

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/**
 * Get a relative time string from a Date.
 * Returns "just now", "2m ago", "1h ago", "3d ago", etc.
 */
export function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) return "in the future";
  if (diffMs < 10_000) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// --- Color mappings ---

/**
 * Get a color string for a health status.
 */
export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case "healthy":
      return "#22c55e"; // green-500
    case "degraded":
      return "#eab308"; // yellow-500
    case "unhealthy":
      return "#ef4444"; // red-500
    case "unknown":
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get a color string for a metric trend direction.
 */
export function getTrendColor(trend: "up" | "down" | "flat"): string {
  switch (trend) {
    case "up":
      return "#22c55e"; // green-500
    case "down":
      return "#ef4444"; // red-500
    case "flat":
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get a color string for an activity event type.
 */
export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case "success":
      return "#22c55e"; // green-500
    case "error":
      return "#ef4444"; // red-500
    case "warning":
      return "#eab308"; // yellow-500
    case "info":
      return "#3b82f6"; // blue-500
    case "agent":
      return "#a855f7"; // purple-500
    case "cost":
      return "#f97316"; // orange-500
    case "security":
      return "#ec4899"; // pink-500
    case "deploy":
      return "#06b6d4"; // cyan-500
    default:
      return "#6b7280"; // gray-500
  }
}
