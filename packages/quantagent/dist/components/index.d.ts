import * as react_jsx_runtime from 'react/jsx-runtime';

interface TokenInfo {
    symbol: string;
    name: string;
    address?: string;
    chain: "solana" | "ethereum" | "base" | "other";
    poolAddress?: string;
}
interface IndicatorResult {
    name: string;
    value: number;
    signal: "bullish" | "bearish" | "neutral";
    strength: number;
    description: string;
}
interface PatternResult {
    pattern: string;
    confidence: number;
    direction: "bullish" | "bearish" | "neutral";
    priceTarget?: number;
    description: string;
    visualization?: string;
}
interface TrendResult {
    direction: "up" | "down" | "sideways";
    strength: number;
    support: number;
    resistance: number;
    momentum: number;
    description: string;
}
interface RiskResult {
    riskScore: number;
    rewardRatio: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    warnings: string[];
}
interface TradeDecision {
    action: "LONG" | "SHORT" | "HOLD" | "EXIT";
    confidence: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    timeframe: string;
    rationale: string;
    indicators: IndicatorResult[];
    pattern: PatternResult | null;
    trend: TrendResult;
    risk: RiskResult;
    timestamp: number;
    token: TokenInfo;
}

interface QuantAgentWidgetProps {
    token: TokenInfo;
    timeframe?: "1h" | "4h" | "1d";
    apiEndpoint?: string;
    onDecision?: (decision: TradeDecision) => void;
    theme?: "dark" | "light";
    compact?: boolean;
}
declare function QuantAgentWidget({ token, timeframe, apiEndpoint, onDecision, theme, compact, }: QuantAgentWidgetProps): react_jsx_runtime.JSX.Element;

export { QuantAgentWidget, type QuantAgentWidgetProps };
