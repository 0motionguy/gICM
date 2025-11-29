/**
 * Expense Tracker
 *
 * Tracks and manages recurring and one-time expenses.
 */

import Decimal from "decimal.js";
import type {
  Expense,
  ExpenseCategory,
  ExpenseFrequency,
  Budget,
  BudgetStatus,
} from "../core/types.js";
import { Logger } from "../utils/logger.js";

const DEFAULT_BUDGET_LIMITS: Record<ExpenseCategory, Decimal> = {
  api_subscriptions: new Decimal(500),
  infrastructure: new Decimal(200),
  marketing: new Decimal(300),
  tools: new Decimal(100),
  legal: new Decimal(100),
  other: new Decimal(100),
};

export class ExpenseTracker {
  private expenses: Map<string, Expense> = new Map();
  private budget: Budget;
  private logger: Logger;

  constructor(budgetLimits?: Partial<Record<ExpenseCategory, number>>) {
    this.logger = new Logger("Expenses");
    this.budget = this.initializeBudget(budgetLimits);
  }

  private initializeBudget(limits?: Partial<Record<ExpenseCategory, number>>): Budget {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budgetLimits: Record<ExpenseCategory, Decimal> = { ...DEFAULT_BUDGET_LIMITS };
    if (limits) {
      for (const [category, amount] of Object.entries(limits)) {
        budgetLimits[category as ExpenseCategory] = new Decimal(amount);
      }
    }

    return {
      limits: budgetLimits,
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
   * Add an expense
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
   * Add default gICM expenses
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

    // Birdeye API
    this.addExpense({
      category: "api_subscriptions",
      subcategory: "data",
      name: "Birdeye API",
      description: "Token data and analytics",
      amount: new Decimal(100),
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

    this.logger.info("Added default gICM expenses");
  }

  /**
   * Mark expense as paid
   */
  markPaid(expenseId: string, txSignature?: string): boolean {
    const expense = this.expenses.get(expenseId);
    if (!expense) {
      this.logger.warn(`Expense not found: ${expenseId}`);
      return false;
    }

    expense.status = "paid";
    expense.lastPaidAt = Date.now();
    expense.paidAmount = expense.amount;
    if (txSignature) {
      expense.txSignature = txSignature;
    }

    // Update budget spent
    this.budget.spent[expense.category] = this.budget.spent[expense.category].add(expense.amount);

    // Schedule next payment for recurring
    if (expense.type === "recurring" && expense.frequency) {
      expense.nextDueDate = this.getNextDueDate(expense.frequency);
      expense.status = "pending";
    }

    this.logger.info(`Expense paid: ${expense.name} - $${expense.amount}`);
    return true;
  }

  /**
   * Get expenses due within N days
   */
  getUpcoming(days: number = 30): Expense[] {
    const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;

    return Array.from(this.expenses.values())
      .filter(e => e.status !== "cancelled" && e.nextDueDate && e.nextDueDate <= cutoff)
      .sort((a, b) => (a.nextDueDate || 0) - (b.nextDueDate || 0));
  }

  /**
   * Get overdue expenses
   */
  getOverdue(): Expense[] {
    const now = Date.now();

    return Array.from(this.expenses.values())
      .filter(e => e.status !== "cancelled" && e.status !== "paid" && e.nextDueDate && e.nextDueDate < now);
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
  getBudgetStatus(): BudgetStatus {
    const alerts: string[] = [];
    const byCategory: Record<string, { limit: Decimal; spent: Decimal; percent: number }> = {};

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
      byCategory: byCategory as Record<ExpenseCategory, { limit: Decimal; spent: Decimal; percent: number }>,
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
   * Reset budget for new period
   */
  resetBudgetPeriod(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.budget.periodStart = startOfMonth.getTime();
    this.budget.periodEnd = endOfMonth.getTime();

    // Reset spent
    for (const category of Object.keys(this.budget.spent) as ExpenseCategory[]) {
      this.budget.spent[category] = new Decimal(0);
    }

    this.logger.info("Budget period reset");
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

  private getNextDueDate(frequency: ExpenseFrequency): number {
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
