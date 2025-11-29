/**
 * Analyze Token Tool
 * Proxies to AI Hedge Fund API for full multi-agent analysis
 */
interface AnalysisResult {
    token: string;
    chain: string;
    sentiment: string;
    confidence: number;
    action: string;
    conviction: string;
    summary: string;
    agentSignals: Array<{
        agent: string;
        action: string;
        confidence: number;
        reasoning: string;
    }>;
    executionPlan?: {
        entryPrice: string;
        positionSize: string;
        stopLoss: string;
        takeProfit: string[];
    };
    error?: string;
}
export declare function analyzeToken(token: string, chain?: string, mode?: "full" | "fast" | "degen"): Promise<AnalysisResult>;
export {};
//# sourceMappingURL=analyze-token.d.ts.map