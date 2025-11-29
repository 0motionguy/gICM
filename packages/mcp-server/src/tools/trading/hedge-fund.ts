/**
 * AI Hedge Fund Integration Tools
 *
 * MCP tools to interact with the gICM AI Hedge Fund service.
 */

import { z } from "zod";

// Default hedge fund API URL
const HEDGE_FUND_API_URL = process.env.HEDGE_FUND_API_URL || "http://localhost:8001";

// ============================================================================
// SCHEMAS
// ============================================================================

const TradingModeSchema = z.enum(["paper", "micro", "live"]);

const AnalysisResultSchema = z.object({
  token: z.string(),
  signal: z.enum(["strong_buy", "buy", "hold", "sell", "strong_sell"]),
  confidence: z.number(),
  reasoning: z.string(),
  agents: z.array(z.object({
    name: z.string(),
    signal: z.string(),
    reasoning: z.string(),
  })),
  risk_score: z.number(),
  price: z.number().optional(),
  timestamp: z.string(),
});

const TradingStatusSchema = z.object({
  mode: TradingModeSchema,
  is_running: z.boolean(),
  active_positions: z.number(),
  total_pnl: z.number(),
  daily_pnl: z.number(),
  win_rate: z.number(),
  last_trade: z.string().optional(),
});

// ============================================================================
// API HELPERS
// ============================================================================

async function fetchHedgeFund<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${HEDGE_FUND_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hedge Fund API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

/**
 * Get current trading status
 */
export async function getTradingStatus(): Promise<z.infer<typeof TradingStatusSchema>> {
  try {
    const status = await fetchHedgeFund<z.infer<typeof TradingStatusSchema>>("/api/status");
    return TradingStatusSchema.parse(status);
  } catch (error) {
    // Return mock data if service is not running
    return {
      mode: "paper",
      is_running: false,
      active_positions: 0,
      total_pnl: 0,
      daily_pnl: 0,
      win_rate: 0,
      last_trade: undefined,
    };
  }
}

/**
 * Run AI analysis on a token
 */
export async function runAnalysis(
  token: string,
  mode: "full" | "fast" | "degen" = "full",
  chain: string = "solana"
): Promise<z.infer<typeof AnalysisResultSchema>> {
  try {
    const result = await fetchHedgeFund<z.infer<typeof AnalysisResultSchema>>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ token, mode, chain }),
    });
    return AnalysisResultSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to run analysis: ${error}`);
  }
}

/**
 * Get portfolio positions
 */
export async function getPositions(): Promise<Array<{
  id: string;
  token: string;
  symbol: string;
  side: "long" | "short";
  size: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
}>> {
  try {
    return await fetchHedgeFund("/api/positions");
  } catch (error) {
    return [];
  }
}

/**
 * Get trade history
 */
export async function getTradeHistory(limit: number = 50): Promise<Array<{
  id: string;
  token: string;
  side: "buy" | "sell";
  size: number;
  price: number;
  pnl: number;
  timestamp: string;
}>> {
  try {
    return await fetchHedgeFund(`/api/trades?limit=${limit}`);
  } catch (error) {
    return [];
  }
}

/**
 * Set trading mode
 */
export async function setTradingMode(
  mode: "paper" | "micro" | "live",
  approval_code?: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await fetchHedgeFund("/api/mode", {
      method: "POST",
      body: JSON.stringify({ mode, approval_code }),
    });
  } catch (error) {
    return { success: false, message: `Failed to set mode: ${error}` };
  }
}

/**
 * Execute a trade (paper/micro/live based on current mode)
 */
export async function executeTrade(params: {
  token: string;
  side: "buy" | "sell";
  amount_usd: number;
  reason?: string;
}): Promise<{
  success: boolean;
  trade_id?: string;
  message: string;
  requires_approval?: boolean;
}> {
  try {
    return await fetchHedgeFund("/api/trade", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (error) {
    return { success: false, message: `Trade failed: ${error}` };
  }
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const hedgeFundTools = {
  hedge_fund_status: {
    description:
      "Get the current status of the AI Hedge Fund including trading mode, positions, P&L, and win rate",
    parameters: {},
  },

  hedge_fund_analyze: {
    description:
      "Run AI hedge fund analysis on a token using multiple investor personas and crypto strategies",
    parameters: {
      token: {
        type: "string",
        description: "Token symbol or contract address",
      },
      mode: {
        type: "string",
        description: "Analysis mode",
        enum: ["full", "fast", "degen"],
        default: "full",
        optional: true,
      },
      chain: {
        type: "string",
        description: "Blockchain",
        default: "solana",
        optional: true,
      },
    },
  },

  hedge_fund_positions: {
    description: "Get all current positions held by the AI Hedge Fund",
    parameters: {},
  },

  hedge_fund_trades: {
    description: "Get recent trade history from the AI Hedge Fund",
    parameters: {
      limit: {
        type: "number",
        description: "Number of trades to return",
        default: 50,
        optional: true,
      },
    },
  },

  hedge_fund_set_mode: {
    description:
      "Set the trading mode for the AI Hedge Fund (paper for simulation, micro for small real trades, live for full trading)",
    parameters: {
      mode: {
        type: "string",
        description: "Trading mode to set",
        enum: ["paper", "micro", "live"],
      },
      approval_code: {
        type: "string",
        description: "Approval code required for micro/live modes",
        optional: true,
      },
    },
  },

  hedge_fund_trade: {
    description:
      "Execute a trade through the AI Hedge Fund (execution depends on current trading mode)",
    parameters: {
      token: {
        type: "string",
        description: "Token to trade",
      },
      side: {
        type: "string",
        description: "Buy or sell",
        enum: ["buy", "sell"],
      },
      amount_usd: {
        type: "number",
        description: "Amount in USD",
      },
      reason: {
        type: "string",
        description: "Reason for the trade",
        optional: true,
      },
    },
  },
};
