"use client";

import { useState, useEffect } from "react";

type Priority = "P0" | "P1" | "P2" | "P3";
type TaskStatus = "active" | "complete";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
}

interface TasksResponse {
  tasks: Task[];
  total: number;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> =
  {
    P0: {
      label: "P0",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    P1: {
      label: "P1",
      className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    P2: {
      label: "P2",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    P3: {
      label: "P3",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
  };

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> =
  {
    active: { label: "Active", className: "bg-blue-500/20 text-blue-400" },
    complete: { label: "Complete", className: "bg-gray-500/20 text-gray-400" },
  };

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function TaskCard({ task }: { task: Task }) {
  const formattedDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-gray-600">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-white">{task.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      {task.description && (
        <p className="line-clamp-2 text-sm text-gray-400">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created by: {task.createdBy}</span>
        <span>{formattedDate}</span>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-16 rounded-lg bg-gray-800" />
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

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-red-400">
        Error
      </h2>
      <p className="mt-2 text-red-300">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
      >
        Retry
      </button>
    </section>
  );
}

function FilterButton({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? `${className} border-transparent`
          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3100/api/awcn/tasks");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TasksResponse = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks =
    priorityFilter === "all"
      ? tasks
      : tasks.filter((task) => task.priority === priorityFilter);

  const taskCounts = {
    all: tasks.length,
    P0: tasks.filter((t) => t.priority === "P0").length,
    P1: tasks.filter((t) => t.priority === "P1").length,
    P2: tasks.filter((t) => t.priority === "P2").length,
    P3: tasks.filter((t) => t.priority === "P3").length,
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="mt-1 text-gray-400">
            View and manage tasks across all agents
          </p>
        </header>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchTasks} />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                label={`All (${taskCounts.all})`}
                active={priorityFilter === "all"}
                onClick={() => setPriorityFilter("all")}
                className="bg-gray-600 text-white"
              />
              <FilterButton
                label={`P0 (${taskCounts.P0})`}
                active={priorityFilter === "P0"}
                onClick={() => setPriorityFilter("P0")}
                className="bg-red-500/30 text-red-400"
              />
              <FilterButton
                label={`P1 (${taskCounts.P1})`}
                active={priorityFilter === "P1"}
                onClick={() => setPriorityFilter("P1")}
                className="bg-orange-500/30 text-orange-400"
              />
              <FilterButton
                label={`P2 (${taskCounts.P2})`}
                active={priorityFilter === "P2"}
                onClick={() => setPriorityFilter("P2")}
                className="bg-yellow-500/30 text-yellow-400"
              />
              <FilterButton
                label={`P3 (${taskCounts.P3})`}
                active={priorityFilter === "P3"}
                onClick={() => setPriorityFilter("P3")}
                className="bg-green-500/30 text-green-400"
              />
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center">
                <p className="text-gray-400">
                  {priorityFilter === "all"
                    ? "No tasks found"
                    : `No ${priorityFilter} tasks found`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
