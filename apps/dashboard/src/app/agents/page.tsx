import { Suspense } from "react";
import { StatCard } from "@/components";

interface AgentBudget {
  id: string;
  name: string;
  dailyLimit: number;
  usedToday: number;
}

interface BudgetResponse {
  agents: AgentBudget[];
  totalBudget: number;
  totalUsed: number;
}

function getStatusColor(percent: number): {
  bg: string;
  bar: string;
  badge: string;
  text: string;
} {
  if (percent < 50) {
    return {
      bg: "bg-green-500/20",
      bar: "bg-green-500",
      badge: "bg-green-500/20 text-green-400",
      text: "text-green-400",
    };
  } else if (percent < 80) {
    return {
      bg: "bg-yellow-500/20",
      bar: "bg-yellow-500",
      badge: "bg-yellow-500/20 text-yellow-400",
      text: "text-yellow-400",
    };
  } else {
    return {
      bg: "bg-red-500/20",
      bar: "bg-red-500",
      badge: "bg-red-500/20 text-red-400",
      text: "text-red-400",
    };
  }
}

function getStatusLabel(percent: number): string {
  if (percent < 50) return "Healthy";
  if (percent < 80) return "Warning";
  return "Critical";
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-red-400">
        Error
      </h2>
      <p className="mt-2 text-red-300">{message}</p>
    </section>
  );
}

function AgentCard({ agent }: { agent: AgentBudget }) {
  const percent =
    agent.dailyLimit > 0
      ? Math.round((agent.usedToday / agent.dailyLimit) * 100)
      : 0;
  const colors = getStatusColor(percent);
  const status = getStatusLabel(percent);

  return (
    <section className="space-y-3 rounded-lg bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">{agent.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Budget Used</span>
          <span className={colors.text}>{percent}%</span>
        </div>
        <div className={`h-2 w-full rounded-full ${colors.bg}`}>
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>${agent.usedToday.toFixed(2)} used</span>
        <span>${agent.dailyLimit.toFixed(2)} limit</span>
      </div>
    </section>
  );
}

async function AgentsBudgetDashboard() {
  try {
    const response = await fetch("http://localhost:3100/api/awcn/budget", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: BudgetResponse = await response.json();
    const totalPercent =
      data.totalBudget > 0
        ? Math.round((data.totalUsed / data.totalBudget) * 100)
        : 0;
    const healthyAgents = data.agents.filter(
      (a) => (a.usedToday / a.dailyLimit) * 100 < 50
    ).length;
    const criticalAgents = data.agents.filter(
      (a) => (a.usedToday / a.dailyLimit) * 100 >= 80
    ).length;

    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Total Agents"
            value={data.agents.length}
            subtitle={`${healthyAgents} healthy`}
          />
          <StatCard
            title="Total Budget"
            value={`$${data.totalBudget.toFixed(2)}`}
            subtitle={`$${data.totalUsed.toFixed(2)} used (${totalPercent}%)`}
          />
          <StatCard
            title="Critical Agents"
            value={criticalAgents}
            subtitle={criticalAgents > 0 ? "Requires attention" : "All clear"}
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Agent Budgets</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      </>
    );
  } catch (error) {
    return (
      <ErrorCard
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Agent Budgets</h1>
          <p className="mt-1 text-gray-400">
            Monitor daily budget usage across all AI agents
          </p>
        </header>

        <Suspense fallback={<LoadingSkeleton />}>
          <AgentsBudgetDashboard />
        </Suspense>
      </div>
    </main>
  );
}
