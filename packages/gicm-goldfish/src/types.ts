import { z } from "zod";

export const BudgetPeriodSchema = z.enum(["daily", "weekly", "monthly"]);
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;

export const ThresholdLevelSchema = z.enum(["soft", "throttle", "hard"]);
export type ThresholdLevel = z.infer<typeof ThresholdLevelSchema>;

export const BudgetConfigSchema = z.object({
  daily: z.object({
    amount: z.number().positive(),
    resetAt: z.string().default("00:00"),
  }),
  weekly: z.object({
    amount: z.number().positive(),
    resetDay: z.string().default("monday"),
  }),
  monthly: z.object({
    amount: z.number().positive(),
    resetDay: z.number().min(1).max(28).default(1),
  }),
  perSession: z
    .object({
      amount: z.number().positive(),
    })
    .optional(),
  perAgent: z
    .object({
      amount: z.number().positive(),
    })
    .optional(),
  thresholds: z.object({
    soft: z.number().min(0).max(1).default(0.7),
    throttle: z.number().min(0).max(1).default(0.9),
    hard: z.number().min(0).max(1).default(1.0),
  }),
});
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;

export interface CostEvent {
  timestamp: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cost: number;
  agentId: string;
  sessionId: string;
  taskType: string;
  tier: number;
}

export interface BudgetStatus {
  period: BudgetPeriod;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  level: ThresholdLevel | "ok";
  periodStart: string;
  periodEnd: string;
}

export interface GoldfishEvents {
  "budget:soft": (status: BudgetStatus) => void;
  "budget:throttle": (status: BudgetStatus) => void;
  "budget:hard": (status: BudgetStatus) => void;
  "cost:recorded": (event: CostEvent) => void;
}
