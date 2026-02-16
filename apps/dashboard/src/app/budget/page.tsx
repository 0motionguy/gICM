"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components";

interface AgentBudget {
  id: string;
  name: string;
  dailyLimit: number;
  usedToday: number;
  trend?: "up" | "down" | "stable";
  color?: string;
}

interface BudgetResponse {
  agents: AgentBudget[];
  totalBudget: number;
  totalUsed: number;
}

const AGENT_COLORS: Record<string, string> = {
  default: "bg-blue-500",
  research: "bg-purple-500",
  trading: "bg-green-500",
  analysis: "bg-amber-500",
  security: "bg-red-500",
  data: "bg-cyan-500",
};

function getAgentColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("research")) return AGENT_COLORS.research;
  if (lower.includes("trade") || lower.includes("trading"))
    return AGENT_COLORS.trading;
  if (lower.includes("analy")) return AGENT_COLORS.analysis;
  if (lower.includes("security") || lower.includes("audit"))
    return AGENT_COLORS.security;
  if (lower.includes("data")) return AGENT_COLORS.data;
  return AGENT_COLORS.default;
}

function getStatusColor(percent: number): {
  bg: string;
  stroke: string;
  badge: string;
  text: string;
  label: string;
} {
  if (percent < 50) {
    return {
      bg: "bg-emerald-500/10",
      stroke: "stroke-emerald-500",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      text: "text-emerald-400",
      label: "Healthy",
    };
  } else if (percent < 80) {
    return {
      bg: "bg-amber-500/10",
      stroke: "stroke-amber-500",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      text: "text-amber-400",
      label: "Warning",
    };
  } else {
    return {
      bg: "bg-red-500/10",
      stroke: "stroke-red-500",
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
      text: "text-red-400",
      label: "Critical",
    };
  }
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function CircularProgress({
  percent,
  size = 80,
  strokeWidth = 6,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const colors = getStatusColor(percent);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.stroke} transition-all duration-500`}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${colors.text}`}>{percent}%</span>
      </div>
    </div>
  );
}

function TrendIndicator({ trend }: { trend?: "up" | "down" | "stable" }) {
  if (!trend || trend === "stable") {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <span className="text-gray-500">→</span> Stable
      </span>
    );
  }

  if (trend === "up") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Increasing
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-emerald-400">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Decreasing
    </span>
  );
}

function AgentBudgetCard({ agent }: { agent: AgentBudget }) {
  const percent =
    agent.dailyLimit > 0
      ? Math.round((agent.usedToday / agent.dailyLimit) * 100)
      : 0;
  const colors = getStatusColor(percent);
  const agentColor = agent.color || getAgentColor(agent.name);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-5 backdrop-blur-sm transition-all hover:border-gray-600/50 hover:shadow-lg hover:shadow-black/20">
      {/* Accent line */}
      <div className={`absolute left-0 top-0 h-1 w-full ${agentColor}`} />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${agentColor}`} />
          <h3 className="font-semibold text-white">{agent.name}</h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${colors.badge}`}
        >
          {colors.label}
        </span>
      </div>

      {/* Main content */}
      <div className="flex items-center gap-6">
        {/* Progress circle */}
        <CircularProgress percent={percent} size={90} strokeWidth={7} />

        {/* Budget details */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Used Today
            </p>
            <p className="text-xl font-bold text-white">
              {formatUSD(agent.usedToday)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Daily Limit
            </p>
            <p className="text-sm font-medium text-gray-300">
              {formatUSD(agent.dailyLimit)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-700/50 pt-3">
        <TrendIndicator trend={agent.trend} />
        <span className="text-xs text-gray-500">
          {formatUSD(agent.dailyLimit - agent.usedToday)} remaining
        </span>
      </div>
    </article>
  );
}

function SummaryCard({
  totalBudget,
  totalUsed,
  agentCount,
  criticalCount,
}: {
  totalBudget: number;
  totalUsed: number;
  agentCount: number;
  criticalCount: number;
}) {
  const percent =
    totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;
  const colors = getStatusColor(percent);

  return (
    <section className="col-span-full rounded-xl border border-gray-700/50 bg-gradient-to-r from-gray-800/90 via-gray-800/70 to-gray-900/90 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Title & Progress */}
        <div className="flex items-center gap-6">
          <CircularProgress percent={percent} size={100} strokeWidth={8} />
          <div>
            <h2 className="text-2xl font-bold text-white">Total Budget</h2>
            <p className="mt-1 text-gray-400">
              {agentCount} agents monitored
              {criticalCount > 0 && (
                <span className="ml-2 text-red-400">
                  • {criticalCount} critical
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Used
            </p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {formatUSD(totalUsed)}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Limit
            </p>
            <p className="text-2xl font-bold text-white">
              {formatUSD(totalBudget)}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Remaining
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatUSD(totalBudget - totalUsed)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary skeleton */}
      <div className="h-36 rounded-xl bg-gray-800" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-52 rounded-xl bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
        <svg
          className="h-6 w-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-400">
        Failed to Load Budget Data
      </h3>
      <p className="mt-2 text-sm text-red-300/80">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
      >
        Retry
      </button>
    </section>
  );
}

export default function BudgetPage() {
  const [data, setData] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3100/api/awcn/budget", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json: BudgetResponse = await response.json();

      // Add mock trends if not present
      const agentsWithTrends = json.agents.map((agent, i) => ({
        ...agent,
        trend: agent.trend || (["up", "down", "stable"] as const)[i % 3],
      }));

      setData({ ...json, agents: agentsWithTrends });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBudget, 30000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = data
    ? data.agents.filter((a) => (a.usedToday / a.dailyLimit) * 100 >= 80).length
    : 0;

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budget Overview</h1>
            <p className="mt-1 text-gray-400">
              Real-time budget monitoring across all AI agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-400">Live</span>
          </div>
        </header>

        {/* Content */}
        {loading && !data ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={fetchBudget} />
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <SummaryCard
              totalBudget={data.totalBudget}
              totalUsed={data.totalUsed}
              agentCount={data.agents.length}
              criticalCount={criticalCount}
            />

            {/* Agent Cards Grid */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Agent Budgets
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.agents.map((agent) => (
                  <AgentBudgetCard key={agent.id} agent={agent} />
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
