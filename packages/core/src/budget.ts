/**
 * Budget Enforcer - Daily spending limits per agent
 * Uses SQLite for persistence via ./db/index
 */

import { getDb } from "./db/index";
import { logEvent } from "./logger";

interface DailySpend {
  agent_id: string;
  date: string;
  spent_cents: number;
  limit_cents: number;
}

const DEFAULT_DAILY_LIMIT_CENTS = 10000; // $100

function ensureTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_daily_spend (
      agent_id TEXT NOT NULL,
      date TEXT NOT NULL,
      spent_cents INTEGER NOT NULL DEFAULT 0,
      limit_cents INTEGER NOT NULL DEFAULT ${DEFAULT_DAILY_LIMIT_CENTS},
      PRIMARY KEY (agent_id, date)
    )
  `);
}

function getToday(): string {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new Error("Failed to parse date");
  return today;
}

function getOrCreateRecord(agentId: string): DailySpend {
  ensureTable();
  const db = getDb();
  const today = getToday();

  let record = db
    .prepare("SELECT * FROM agent_daily_spend WHERE agent_id = ? AND date = ?")
    .get(agentId, today) as DailySpend | undefined;

  if (!record) {
    db.prepare(
      "INSERT INTO agent_daily_spend (agent_id, date, spent_cents, limit_cents) VALUES (?, ?, 0, ?)"
    ).run(agentId, today, DEFAULT_DAILY_LIMIT_CENTS);
    record = {
      agent_id: agentId,
      date: today,
      spent_cents: 0,
      limit_cents: DEFAULT_DAILY_LIMIT_CENTS,
    };
  }

  return record;
}

export async function checkBudget(
  agentId: string,
  cost: number
): Promise<boolean> {
  const record = getOrCreateRecord(agentId);
  const costCents = Math.round(cost * 100);
  const remaining = record.limit_cents - record.spent_cents;
  const allowed = costCents <= remaining;

  logEvent("INFO", "budget", "check", {
    agentId,
    cost,
    spent: record.spent_cents / 100,
    limit: record.limit_cents / 100,
    allowed,
  });

  return allowed;
}

export async function recordSpend(
  agentId: string,
  cost: number
): Promise<void> {
  ensureTable();
  const db = getDb();
  const record = getOrCreateRecord(agentId);
  const costCents = Math.round(cost * 100);
  const newSpent = record.spent_cents + costCents;

  if (newSpent > record.limit_cents) {
    logEvent("ERROR", "budget", "exceeded", {
      agentId,
      cost,
      limit: record.limit_cents / 100,
    });
    throw new Error(`Budget exceeded for ${agentId}`);
  }

  db.prepare(
    "UPDATE agent_daily_spend SET spent_cents = ? WHERE agent_id = ? AND date = ?"
  ).run(newSpent, agentId, getToday());

  logEvent("INFO", "budget", "spend", {
    agentId,
    cost,
    newTotal: newSpent / 100,
  });
}

export async function getDailySpend(agentId: string): Promise<number> {
  const record = getOrCreateRecord(agentId);
  return record.spent_cents / 100;
}
