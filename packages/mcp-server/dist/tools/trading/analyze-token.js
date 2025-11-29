/**
 * Analyze Token Tool
 * Proxies to AI Hedge Fund API for full multi-agent analysis
 */
// Default to local AI Hedge Fund API
const AI_HEDGE_FUND_URL = process.env.AI_HEDGE_FUND_URL || "http://localhost:8001";
export async function analyzeToken(token, chain = "solana", mode = "full") {
    try {
        const response = await fetch(`${AI_HEDGE_FUND_URL}/api/v1/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, chain, mode }),
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        // Calculate aggregate sentiment
        const signals = data.agent_signals || [];
        const bullish = signals.filter((s) => s.action === "bullish").length;
        const bearish = signals.filter((s) => s.action === "bearish").length;
        let sentiment = "neutral";
        if (bullish > bearish * 2)
            sentiment = "very_bullish";
        else if (bullish > bearish)
            sentiment = "bullish";
        else if (bearish > bullish * 2)
            sentiment = "very_bearish";
        else if (bearish > bullish)
            sentiment = "bearish";
        const avgConfidence = signals.length > 0
            ? signals.reduce((sum, s) => sum + s.confidence, 0) /
                signals.length
            : 0;
        const decision = data.final_decision || {};
        const plan = decision.execution_plan;
        return {
            token: data.token,
            chain: data.chain,
            sentiment,
            confidence: avgConfidence,
            action: decision.action || "hold",
            conviction: decision.conviction || "low",
            summary: data.summary || "",
            agentSignals: signals.map((s) => ({
                agent: s.agent,
                action: s.action,
                confidence: s.confidence,
                reasoning: s.reasoning?.substring(0, 200) || "",
            })),
            executionPlan: plan
                ? {
                    entryPrice: plan.entry_price || "market",
                    positionSize: `${plan.position_size_pct || 0}%`,
                    stopLoss: plan.stop_loss || "N/A",
                    takeProfit: plan.take_profit || [],
                }
                : undefined,
        };
    }
    catch (error) {
        // If AI Hedge Fund API is not running, provide basic analysis
        return await fallbackAnalysis(token, chain);
    }
}
async function fallbackAnalysis(token, chain) {
    // Fallback: just get market data and provide basic signal
    const DEXSCREENER_BASE = "https://api.dexscreener.com/latest";
    try {
        const response = await fetch(`${DEXSCREENER_BASE}/dex/search?q=${encodeURIComponent(token)}`);
        const data = await response.json();
        const pair = data.pairs?.[0];
        if (!pair) {
            return {
                token,
                chain,
                sentiment: "unknown",
                confidence: 0,
                action: "avoid",
                conviction: "low",
                summary: `Could not find market data for ${token}`,
                agentSignals: [],
                error: "No market data available",
            };
        }
        const change24h = parseFloat(pair.priceChange?.h24 || "0");
        const volume = parseFloat(pair.volume?.h24 || "0");
        const liquidity = parseFloat(pair.liquidity?.usd || "0");
        // Simple sentiment based on price action
        let sentiment = "neutral";
        let action = "hold";
        if (change24h > 20) {
            sentiment = "very_bullish";
            action = "caution"; // Might be overheated
        }
        else if (change24h > 5) {
            sentiment = "bullish";
            action = "buy";
        }
        else if (change24h < -20) {
            sentiment = "very_bearish";
            action = "avoid";
        }
        else if (change24h < -5) {
            sentiment = "bearish";
            action = "sell";
        }
        return {
            token,
            chain,
            sentiment,
            confidence: 50, // Low confidence without full analysis
            action,
            conviction: "low",
            summary: `Basic analysis for ${token}: ${change24h.toFixed(1)}% 24h change, $${volume.toLocaleString()} volume, $${liquidity.toLocaleString()} liquidity. Note: AI Hedge Fund API not available for full analysis.`,
            agentSignals: [
                {
                    agent: "Basic Analysis",
                    action: sentiment.includes("bullish")
                        ? "bullish"
                        : sentiment.includes("bearish")
                            ? "bearish"
                            : "neutral",
                    confidence: 50,
                    reasoning: `Price changed ${change24h.toFixed(1)}% in 24h with $${liquidity.toLocaleString()} liquidity`,
                },
            ],
        };
    }
    catch (e) {
        return {
            token,
            chain,
            sentiment: "unknown",
            confidence: 0,
            action: "avoid",
            conviction: "low",
            summary: "Failed to analyze token",
            agentSignals: [],
            error: e instanceof Error ? e.message : "Unknown error",
        };
    }
}
//# sourceMappingURL=analyze-token.js.map