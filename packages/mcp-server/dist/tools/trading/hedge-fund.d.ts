/**
 * AI Hedge Fund Integration Tools
 *
 * MCP tools to interact with the gICM AI Hedge Fund service.
 */
import { z } from "zod";
declare const AnalysisResultSchema: z.ZodObject<{
    token: z.ZodString;
    signal: z.ZodEnum<["strong_buy", "buy", "hold", "sell", "strong_sell"]>;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    agents: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        signal: z.ZodString;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        signal: string;
        reasoning: string;
    }, {
        name: string;
        signal: string;
        reasoning: string;
    }>, "many">;
    risk_score: z.ZodNumber;
    price: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    confidence: number;
    signal: "hold" | "buy" | "sell" | "strong_buy" | "strong_sell";
    reasoning: string;
    agents: {
        name: string;
        signal: string;
        reasoning: string;
    }[];
    risk_score: number;
    timestamp: string;
    price?: number | undefined;
}, {
    token: string;
    confidence: number;
    signal: "hold" | "buy" | "sell" | "strong_buy" | "strong_sell";
    reasoning: string;
    agents: {
        name: string;
        signal: string;
        reasoning: string;
    }[];
    risk_score: number;
    timestamp: string;
    price?: number | undefined;
}>;
declare const TradingStatusSchema: z.ZodObject<{
    mode: z.ZodEnum<["paper", "micro", "live"]>;
    is_running: z.ZodBoolean;
    active_positions: z.ZodNumber;
    total_pnl: z.ZodNumber;
    daily_pnl: z.ZodNumber;
    win_rate: z.ZodNumber;
    last_trade: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mode: "paper" | "micro" | "live";
    is_running: boolean;
    active_positions: number;
    total_pnl: number;
    daily_pnl: number;
    win_rate: number;
    last_trade?: string | undefined;
}, {
    mode: "paper" | "micro" | "live";
    is_running: boolean;
    active_positions: number;
    total_pnl: number;
    daily_pnl: number;
    win_rate: number;
    last_trade?: string | undefined;
}>;
/**
 * Get current trading status
 */
export declare function getTradingStatus(): Promise<z.infer<typeof TradingStatusSchema>>;
/**
 * Run AI analysis on a token
 */
export declare function runAnalysis(token: string, mode?: "full" | "fast" | "degen", chain?: string): Promise<z.infer<typeof AnalysisResultSchema>>;
/**
 * Get portfolio positions
 */
export declare function getPositions(): Promise<Array<{
    id: string;
    token: string;
    symbol: string;
    side: "long" | "short";
    size: number;
    entry_price: number;
    current_price: number;
    pnl: number;
    pnl_percent: number;
}>>;
/**
 * Get trade history
 */
export declare function getTradeHistory(limit?: number): Promise<Array<{
    id: string;
    token: string;
    side: "buy" | "sell";
    size: number;
    price: number;
    pnl: number;
    timestamp: string;
}>>;
/**
 * Set trading mode
 */
export declare function setTradingMode(mode: "paper" | "micro" | "live", approval_code?: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Execute a trade (paper/micro/live based on current mode)
 */
export declare function executeTrade(params: {
    token: string;
    side: "buy" | "sell";
    amount_usd: number;
    reason?: string;
}): Promise<{
    success: boolean;
    trade_id?: string;
    message: string;
    requires_approval?: boolean;
}>;
export declare const hedgeFundTools: {
    hedge_fund_status: {
        description: string;
        parameters: {};
    };
    hedge_fund_analyze: {
        description: string;
        parameters: {
            token: {
                type: string;
                description: string;
            };
            mode: {
                type: string;
                description: string;
                enum: string[];
                default: string;
                optional: boolean;
            };
            chain: {
                type: string;
                description: string;
                default: string;
                optional: boolean;
            };
        };
    };
    hedge_fund_positions: {
        description: string;
        parameters: {};
    };
    hedge_fund_trades: {
        description: string;
        parameters: {
            limit: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    hedge_fund_set_mode: {
        description: string;
        parameters: {
            mode: {
                type: string;
                description: string;
                enum: string[];
            };
            approval_code: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    hedge_fund_trade: {
        description: string;
        parameters: {
            token: {
                type: string;
                description: string;
            };
            side: {
                type: string;
                description: string;
                enum: string[];
            };
            amount_usd: {
                type: string;
                description: string;
            };
            reason: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
};
export {};
//# sourceMappingURL=hedge-fund.d.ts.map