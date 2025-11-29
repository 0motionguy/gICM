/**
 * Trading Tools for gICM MCP Server
 */
export { getMarketData } from "./get-market-data.js";
export { analyzeToken } from "./analyze-token.js";
export { getTradingStatus, runAnalysis, getPositions, getTradeHistory, setTradingMode, executeTrade, hedgeFundTools, } from "./hedge-fund.js";
export declare const tradingTools: {
    get_market_data: {
        description: string;
        parameters: {
            token: {
                type: string;
                description: string;
            };
            chain: {
                type: string;
                description: string;
                enum: string[];
                default: string;
                optional: boolean;
            };
        };
    };
    analyze_token: {
        description: string;
        parameters: {
            token: {
                type: string;
                description: string;
            };
            chain: {
                type: string;
                description: string;
                enum: string[];
                default: string;
                optional: boolean;
            };
            mode: {
                type: string;
                description: string;
                enum: string[];
                default: string;
                optional: boolean;
            };
        };
    };
    quick_signal: {
        description: string;
        parameters: {
            token: {
                type: string;
                description: string;
            };
            chain: {
                type: string;
                description: string;
                default: string;
                optional: boolean;
            };
        };
    };
    compare_tokens: {
        description: string;
        parameters: {
            tokens: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
            };
            chain: {
                type: string;
                description: string;
                default: string;
                optional: boolean;
            };
        };
    };
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
//# sourceMappingURL=index.d.ts.map