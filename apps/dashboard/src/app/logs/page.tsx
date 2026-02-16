"use client";

import { useState, useEffect, useCallback } from "react";

// Types
interface AWCNEvent {
  id: string;
  timestamp: string;
  severity: "debug" | "info" | "warning" | "error" | "critical";
  agent: string;
  message: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Severity badge colors
const severityStyles: Record<string, string> = {
  debug: "bg-gray-600 text-gray-200",
  info: "bg-blue-600 text-blue-100",
  warning: "bg-yellow-600 text-yellow-100",
  error: "bg-orange-600 text-orange-100",
  critical: "bg-red-600 text-red-100",
};

// Relative time formatter
function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const eventTime = new Date(timestamp).getTime();
  const diffMs = now - eventTime;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Log row component
function LogRow({
  event,
  expanded,
  onToggle,
}: {
  event: AWCNEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-800 transition-colors hover:bg-gray-800/50">
      <div className="flex items-center gap-4 p-4">
        {/* Timestamp */}
        <span className="w-20 flex-shrink-0 font-mono text-sm text-gray-500">
          {formatRelativeTime(event.timestamp)}
        </span>

        {/* Severity badge */}
        <span
          className={`w-16 flex-shrink-0 rounded px-2 py-0.5 text-center text-xs font-semibold uppercase ${severityStyles[event.severity]}`}
        >
          {event.severity}
        </span>

        {/* Agent badge */}
        <span className="w-28 flex-shrink-0 truncate rounded bg-purple-600/30 px-2 py-0.5 text-xs font-medium text-purple-300">
          {event.agent}
        </span>

        {/* Message */}
        <span className="flex-1 truncate font-mono text-sm text-gray-300">
          {event.message}
        </span>

        {/* Tag */}
        {event.tag && (
          <span className="flex-shrink-0 rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
            {event.tag}
          </span>
        )}

        {/* Expand button */}
        {event.data && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 rounded bg-gray-700 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-600 hover:text-white"
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
      </div>

      {/* Expanded data panel */}
      {expanded && event.data && (
        <div className="border-t border-gray-800 bg-gray-950 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-green-400">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Filter bar component
function FilterBar({
  severityFilter,
  setSeverityFilter,
  agentFilter,
  setAgentFilter,
  tagFilter,
  setTagFilter,
  autoRefresh,
  setAutoRefresh,
  agents,
  tags,
}: {
  severityFilter: string;
  setSeverityFilter: (v: string) => void;
  agentFilter: string;
  setAgentFilter: (v: string) => void;
  tagFilter: string;
  setTagFilter: (v: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  agents: string[];
  tags: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg bg-gray-800 p-4">
      {/* Severity filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Severity:</label>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Agent filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Agent:</label>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {agents.map((agent) => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>
      </div>

      {/* Tag filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Tag:</label>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-refresh toggle */}
      <div className="ml-auto flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${autoRefresh ? "animate-pulse bg-green-500" : "bg-gray-600"}`}
        />
        <label className="text-sm text-gray-400">Auto-refresh:</label>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            autoRefresh
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {autoRefresh ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded bg-gray-800 p-4"
        >
          <div className="h-4 w-16 rounded bg-gray-700" />
          <div className="h-4 w-16 rounded bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-700" />
          <div className="h-4 flex-1 rounded bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

// Error display
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
      <p className="text-red-400">Failed to load events</p>
      <p className="mt-2 font-mono text-sm text-red-300">{message}</p>
    </div>
  );
}

// Main page component
export default function LogsPage() {
  const [events, setEvents] = useState<AWCNEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filters
  const [severityFilter, setSeverityFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3100/api/awcn/events?limit=100"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setEvents(data.events || data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents]);

  // Extract unique agents and tags for filters
  const uniqueAgents = [...new Set(events.map((e) => e.agent))].sort();
  const uniqueTags = [
    ...new Set(events.filter((e) => e.tag).map((e) => e.tag!)),
  ].sort();

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (severityFilter && event.severity !== severityFilter) return false;
    if (agentFilter && event.agent !== agentFilter) return false;
    if (tagFilter && event.tag !== tagFilter) return false;
    return true;
  });

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Event Logs</h1>
            <p className="mt-1 text-gray-400">
              Real-time AWCN event stream • {filteredEvents.length} events
            </p>
          </div>
          <button
            onClick={fetchEvents}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Refresh Now
          </button>
        </header>

        {/* Filter bar */}
        <FilterBar
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          agentFilter={agentFilter}
          setAgentFilter={setAgentFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          agents={uniqueAgents}
          tags={uniqueTags}
        />

        {/* Log viewer */}
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
          {/* Column headers */}
          <div className="flex items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span className="w-20 flex-shrink-0">Time</span>
            <span className="w-16 flex-shrink-0">Level</span>
            <span className="w-28 flex-shrink-0">Agent</span>
            <span className="flex-1">Message</span>
            <span className="w-20 flex-shrink-0">Tag</span>
            <span className="w-8 flex-shrink-0" />
          </div>

          {/* Events list */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events match the current filters
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {filteredEvents.map((event) => (
                <LogRow
                  key={event.id}
                  event={event}
                  expanded={expandedIds.has(event.id)}
                  onToggle={() => toggleExpand(event.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filteredEvents.length} of {events.length} events
          </span>
          {autoRefresh && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Auto-refreshing every 30s
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
