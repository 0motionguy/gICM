/**
 * Trading Tools for gICM MCP Server
 */
export { getMarketData } from "./get-market-data.js";
export { analyzeToken } from "./analyze-token.js";
// Hedge Fund Integration
export { getTradingStatus, runAnalysis, getPositions, getTradeHistory, setTradingMode, executeTrade, hedgeFundTools, } from "./hedge-fund.js";
// Trading tool definitions
export const tradingTools = {
    get_market_data: {
        description: "Get real-time market data for a cryptocurrency token from DexScreener and CoinGecko",
        parameters: {
            token: {
                type: "string",
                description: "Token symbol (e.g., SOL, BONK) or contract address",
            },
            chain: {
                type: "string",
                description: "Blockchain to search on",
                enum: ["solana", "ethereum", "bsc", "arbitrum", "base", "polygon"],
                default: "solana",
                optional: true,
            },
        },
    },
    analyze_token: {
        description: "Run multi-agent AI analysis on a token using famous investor personas (Buffett, Burry, etc.) and crypto-native strategies",
        parameters: {
            token: {
                type: "string",
                description: "Token symbol or contract address to analyze",
            },
            chain: {
                type: "string",
                description: "Blockchain",
                enum: ["solana", "ethereum", "bsc", "arbitrum", "base"],
                default: "solana",
                optional: true,
            },
            mode: {
                type: "string",
                description: "Analysis mode: 'full' (all agents), 'fast' (quick screening), 'degen' (memecoin focus)",
                enum: ["full", "fast", "degen"],
                default: "full",
                optional: true,
            },
        },
    },
    quick_signal: {
        description: "Get a quick buy/sell/hold signal for a token with minimal analysis - good for screening",
        parameters: {
            token: {
                type: "string",
                description: "Token symbol or contract address",
            },
            chain: {
                type: "string",
                description: "Blockchain",
                default: "solana",
                optional: true,
            },
        },
    },
    compare_tokens: {
        description: "Compare multiple tokens side by side with quick signals",
        parameters: {
            tokens: {
                type: "array",
                description: "Array of token symbols to compare (max 5)",
                items: { type: "string" },
            },
            chain: {
                type: "string",
                description: "Blockchain",
                default: "solana",
                optional: true,
            },
        },
    },
    // Hedge Fund Tools
    hedge_fund_status: {
        description: "Get the current status of the AI Hedge Fund including trading mode, positions, P&L, and win rate",
        parameters: {},
    },
    hedge_fund_analyze: {
        description: "Run AI hedge fund analysis on a token using multiple investor personas and crypto strategies",
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
        description: "Set the trading mode for the AI Hedge Fund (paper for simulation, micro for small real trades, live for full trading)",
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
        description: "Execute a trade through the AI Hedge Fund (execution depends on current trading mode)",
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
//# sourceMappingURL=index.js.map