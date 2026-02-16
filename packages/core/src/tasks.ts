/**
 * Task Router - Priority-based task management with SQLite persistence
 */

import { getDb } from "./db/index";

export type Priority = "P0" | "P1" | "P2" | "P3";
export type TaskStatus = "pending" | "active" | "completed" | "failed";

export interface Task {
  id: string;
  priority: Priority;
  agent: string;
  title: string;
  details: string;
  status: TaskStatus;
  created_at: string;
}

export async function createTask(
  priority: Priority,
  agent: string,
  title: string,
  details: string
): Promise<string> {
  const db = getDb();
  const input = JSON.stringify({ priority, agent, title, details });
  const stmt = db.prepare(
    `INSERT INTO tasks (tenant_id, type, status, input) VALUES (?, ?, 'pending', ?)`
  );
  const result = stmt.run(agent, title, input);
  return String(result.lastInsertRowid);
}

export async function getTasksByAgent(
  agent: string,
  status?: TaskStatus
): Promise<Task[]> {
  const db = getDb();
  const query = status
    ? `SELECT * FROM tasks WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC`
    : `SELECT * FROM tasks WHERE tenant_id = ? ORDER BY created_at DESC`;
  const rows = status
    ? db.prepare(query).all(agent, status)
    : db.prepare(query).all(agent);
  return (rows as any[]).map((row) => {
    const input = row.input ? JSON.parse(row.input) : {};
    return {
      id: String(row.id),
      priority: input.priority || "P2",
      agent: input.agent || agent,
      title: input.title || row.type,
      details: input.details || "",
      status: row.status as TaskStatus,
      created_at: row.created_at,
    };
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const db = getDb();
  db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, taskId);
}
