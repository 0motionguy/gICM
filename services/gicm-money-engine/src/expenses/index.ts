/**
 * Expense Manager
 *
 * Tracks and auto-pays recurring expenses.
 */

import Decimal from "decimal.js";
import { CronJob } from "cron";
import type { Expense, ExpenseCategory, Budget } from "../core/types.js";
import { DEFAULT_BUDGET_LIMITS } from "../core/constants.js";
import { Logger } from "../utils/logger.js";

export class ExpenseManager {
  private expenses: Map<string, Expense> = new Map();
  private budget: Budget;
  private logger: Logger;
  private checkJob?: CronJob;
  private paymentHandler?: (expense: Expense) => Promise<boolean>;

  constructor() {
    this.logger = new Logger("Expenses");
    this.budget = this.initializeBudget();
  }

  private initializeBudget(): Budget {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      limits: {
        api_subscriptions: new Decimal(DEFAULT_BUDGET_LIMITS.api_subscriptions),
        infrastructure: new Decimal(DEFAULT_BUDGET_LIMITS.infrastructure),
        marketing: new Decimal(DEFAULT_BUDGET_LIMITS.marketing),
        tools: new Decimal(DEFAULT_BUDGET_LIMITS.tools),
        legal: new Decimal(DEFAULT_BUDGET_LIMITS.legal),
        other: new Decimal(DEFAULT_BUDGET_LIMITS.other),
      },
      spent: {
        api_subscriptions: new Decimal(0),
        infrastructure: new Decimal(0),
        marketing: new Decimal(0),
        tools: new Decimal(0),
        legal: new Decimal(0),
        other: new Decimal(0),
      },
      alertThreshold: 80,
      periodStart: startOfMonth.getTime(),
      periodEnd: endOfMonth.getTime(),
    };
  }

  /**
   * Start expense monitoring
   */
  start(paymentHandler: (expense: Expense) => Promise<boolean>): void {
    this.paymentHandler = paymentHandler;

    this.checkJob = new CronJob("0 * * * *", async () => {
      await this.checkDueExpenses();
    });
    this.checkJob.start();

    this.logger.info("Expense manager started");
  }

  /**
   * Stop expense monitoring
   */
  stop(): void {
    if (this.checkJob) {
      this.checkJob.stop();
    }
  }

  /**
   * Add a recurring expense
   */
  addExpense(expense: Omit<Expense, "id" | "status">): Expense {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newExpense: Expense = {
      ...expense,
      id,
      status: "pending",
    };

    this.expenses.set(id, newExpense);
    this.logger.info(`Added expense: ${expense.name} ($${expense.amount})`);

    return newExpense;
  }

  /**
   * Add common gICM expenses
   */
  addDefaultExpenses(): void {
    // Claude API
    this.addExpense({
      category: "api_subscriptions",
      subcategory: "llm",
      name: "Claude API",
      description: "Anthropic Claude API usage",
      amount: new Decimal(200),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card",
    });

    // Helius RPC
    this.addExpense({
      category: "api_subscriptions",
      subcategory: "blockchain",
      name: "Helius RPC",
      description: "Solana RPC provider",
      amount: new Decimal(50),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card",
    });

    // Vercel
    this.addExpense({
      category: "infrastructure",
      subcategory: "hosting",
      name: "Vercel Pro",
      description: "Frontend hosting",
      amount: new Decimal(20),
      currency: "USD",
      type: "recurring",
      frequency: "monthly",
      nextDueDate: this.getNextMonthStart(),
      autoPay: true,
      paymentMethod: "card",
    });

    // Domain
    this.addExpense({
      category: "infrastructure",
      subcategory: "domain",
      name: "gicm.dev domain",
      description: "Domain registration",
      amount: new Decimal(15),
      currency: "USD",
      type: "recurring",
      frequency: "yearly",
      nextDueDate: this.getNextYearStart(),
      autoPay: true,
      paymentMethod: "card",
    });

    this.logger.info("Added default expenses");
  }

  /**
   * Check for due expenses and auto-pay
   */
  async checkDueExpenses(): Promise<void> {
    const now = Date.now();

    for (const [, expense] of this.expenses) {
      if (expense.status === "cancelled") continue;
      if (!expense.nextDueDate) continue;

      if (expense.nextDueDate <= now) {
        if (expense.autoPay && this.paymentHandler) {
          await this.processPayment(expense);
        } else {
          expense.status = "overdue";
          this.logger.warn(`Expense overdue: ${expense.name}`);
        }
      }
    }
  }

  /**
   * Process a payment
   */
  async processPayment(expense: Expense): Promise<boolean> {
    if (!this.paymentHandler) {
      this.logger.error("No payment handler configured");
      return false;
    }

    if (!this.checkBudget(expense.category, expense.amount)) {
      this.logger.warn(`Budget exceeded for ${expense.category}`);
      return false;
    }

    try {
      this.logger.info(`Processing payment: ${expense.name} ($${expense.amount})`);

      const success = await this.paymentHandler(expense);

      if (success) {
        expense.status = "paid";
        expense.lastPaidAt = Date.now();
        expense.paidAmount = expense.amount;

        this.budget.spent[expense.category] = this.budget.spent[expense.category].add(
          expense.amount
        );

        if (expense.type === "recurring") {
          expense.nextDueDate = this.getNextDueDate(expense.frequency!);
          expense.status = "pending";
        }

        this.logger.info(`Payment successful: ${expense.name}`);
        return true;
      } else {
        expense.status = "overdue";
        this.logger.error(`Payment failed: ${expense.name}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Payment error: ${error}`);
      expense.status = "overdue";
      return false;
    }
  }

  /**
   * Check if expense fits in budget
   */
  checkBudget(category: ExpenseCategory, amount: Decimal): boolean {
    const limit = this.budget.limits[category];
    const spent = this.budget.spent[category];
    const remaining = limit.sub(spent);

    return amount.lte(remaining);
  }

  /**
   * Get budget status
   */
  getBudgetStatus(): {
    total: { limit: Decimal; spent: Decimal; remaining: Decimal };
    byCategory: Record<ExpenseCategory, { limit: Decimal; spent: Decimal; percent: number }>;
    alerts: string[];
  } {
    const alerts: string[] = [];
    const byCategory = {} as Record<
      ExpenseCategory,
      { limit: Decimal; spent: Decimal; percent: number }
    >;

    let totalLimit = new Decimal(0);
    let totalSpent = new Decimal(0);

    for (const category of Object.keys(this.budget.limits) as ExpenseCategory[]) {
      const limit = this.budget.limits[category];
      const spent = this.budget.spent[category];
      const percent = limit.isZero() ? 0 : spent.div(limit).mul(100).toNumber();

      totalLimit = totalLimit.add(limit);
      totalSpent = totalSpent.add(spent);

      byCategory[category] = { limit, spent, percent };

      if (percent >= this.budget.alertThreshold) {
        alerts.push(`${category}: ${percent.toFixed(0)}% of budget used`);
      }
    }

    return {
      total: {
        limit: totalLimit,
        spent: totalSpent,
        remaining: totalLimit.sub(totalSpent),
      },
      byCategory,
      alerts,
    };
  }

  /**
   * Get monthly expense total
   */
  getMonthlyTotal(): Decimal {
    let total = new Decimal(0);

    for (const expense of this.expenses.values()) {
      if (expense.status === "cancelled") continue;

      if (expense.frequency === "monthly") {
        total = total.add(expense.amount);
      } else if (expense.frequency === "yearly") {
        total = total.add(expense.amount.div(12));
      }
    }

    return total;
  }

  /**
   * Get all expenses
   */
  getExpenses(): Expense[] {
    return Array.from(this.expenses.values());
  }

  /**
   * Get upcoming expenses
   */
  getUpcoming(days: number = 30): Expense[] {
    const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;

    return Array.from(this.expenses.values())
      .filter((e) => e.status !== "cancelled" && e.nextDueDate && e.nextDueDate <= cutoff)
      .sort((a, b) => (a.nextDueDate || 0) - (b.nextDueDate || 0));
  }

  // Helpers
  private getNextMonthStart(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  }

  private getNextYearStart(): number {
    const now = new Date();
    return new Date(now.getFullYear() + 1, 0, 1).getTime();
  }

  private getNextDueDate(frequency: Expense["frequency"]): number {
    const now = Date.now();
    switch (frequency) {
      case "daily":
        return now + 24 * 60 * 60 * 1000;
      case "weekly":
        return now + 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return this.getNextMonthStart();
      case "yearly":
        return this.getNextYearStart();
      default:
        return now;
    }
  }
}
