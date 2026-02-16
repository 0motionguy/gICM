import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS for localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET"],
    credentials: true,
  })
);

app.use(express.json());

// Data directory - configurable via env
const DATA_DIR = process.env.AWCN_DATA_DIR || join(__dirname, "../../data");

interface AWCNEvent {
  timestamp: string;
  type: string;
  agentId?: string;
  data?: Record<string, unknown>;
}

interface AgentBudget {
  agentId: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface Task {
  id: string;
  agentId: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

// Parse NDJSON file line by line
function parseNDJSON<T>(filePath: string): T[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  return lines
    .map((line) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}

// Parse JSON file
function parseJSON<T>(filePath: string, defaultValue: T): T {
  if (!existsSync(filePath)) {
    return defaultValue;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

// GET /api/awcn/events - Read events.ndjson, return last N events
app.get("/api/awcn/events", (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
  const eventsPath = join(DATA_DIR, "events.ndjson");

  const events = parseNDJSON<AWCNEvent>(eventsPath);
  const lastN = events.slice(-limit);

  res.json({
    success: true,
    count: lastN.length,
    total: events.length,
    events: lastN,
  });
});

// GET /api/awcn/budget - Read budgets.json, return all agent budgets
app.get("/api/awcn/budget", (_req: Request, res: Response) => {
  const budgetsPath = join(DATA_DIR, "budgets.json");
  const budgets = parseJSON<AgentBudget[]>(budgetsPath, []);

  res.json({
    success: true,
    count: budgets.length,
    budgets,
  });
});

// GET /api/awcn/tasks - Read tasks.json, return all tasks
app.get("/api/awcn/tasks", (_req: Request, res: Response) => {
  const tasksPath = join(DATA_DIR, "tasks.json");
  const tasks = parseJSON<Task[]>(tasksPath, []);

  res.json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[API Error]", err.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`[api-layer] Running on http://localhost:${PORT}`);
  console.log(`[api-layer] Data directory: ${DATA_DIR}`);
});

export { app };
