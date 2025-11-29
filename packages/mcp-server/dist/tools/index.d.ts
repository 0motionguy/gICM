/**
 * MCP Tools for gICM Context Engine
 */
export declare const tools: {
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
    search_components: {
        description: string;
        parameters: {
            query: {
                type: string;
                description: string;
            };
            kind: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
            platform: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    search_codebase: {
        description: string;
        parameters: {
            query: {
                type: string;
                description: string;
            };
            repository: {
                type: string;
                description: string;
                optional: boolean;
            };
            language: {
                type: string;
                description: string;
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    get_file_context: {
        description: string;
        parameters: {
            repository: {
                type: string;
                description: string;
            };
            file_path: {
                type: string;
                description: string;
            };
            start_line: {
                type: string;
                description: string;
            };
            end_line: {
                type: string;
                description: string;
            };
        };
    };
    index_repository: {
        description: string;
        parameters: {
            url: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
                default: string;
                optional: boolean;
            };
        };
    };
};
export declare function handleToolCall(name: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=index.d.ts.map