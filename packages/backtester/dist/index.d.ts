import { z } from 'zod';

declare const BacktesterConfigSchema: z.ZodObject<{
    initialCapital: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    slippage: z.ZodDefault<z.ZodNumber>;
    commission: z.ZodDefault<z.ZodNumber>;
    marginEnabled: z.ZodDefault<z.ZodBoolean>;
    maxLeverage: z.ZodDefault<z.ZodNumber>;
    riskFreeRate: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    initialCapital: number;
    currency: string;
    slippage: number;
    commission: number;
    marginEnabled: boolean;
    maxLeverage: number;
    riskFreeRate: number;
}, {
    initialCapital?: number | undefined;
    currency?: string | undefined;
    slippage?: number | undefined;
    commission?: number | undefined;
    marginEnabled?: boolean | undefined;
    maxLeverage?: number | undefined;
    riskFreeRate?: number | undefined;
}>;
type BacktesterConfig = z.infer<typeof BacktesterConfigSchema>;
interface OHLCV {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
interface Trade {
    id: string;
    symbol: string;
    side: "long" | "short";
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    entryTime: Date;
    exitTime?: Date;
    pnl?: number;
    pnlPercent?: number;
    fees: number;
    status: "open" | "closed";
    stopLoss?: number;
    takeProfit?: number;
    metadata?: Record<string, unknown>;
}
interface Position {
    symbol: string;
    side: "long" | "short";
    quantity: number;
    avgEntryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    realizedPnl: number;
    openTime: Date;
    trades: Trade[];
}
interface Order {
    id: string;
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit" | "stop" | "stopLimit";
    quantity: number;
    price?: number;
    stopPrice?: number;
    status: "pending" | "filled" | "cancelled" | "rejected";
    createdAt: Date;
    filledAt?: Date;
    filledPrice?: number;
    filledQuantity?: number;
}
interface PortfolioSnapshot {
    timestamp: Date;
    equity: number;
    cash: number;
    positionsValue: number;
    positions: Position[];
    drawdown: number;
    drawdownPercent: number;
}
interface BacktestResult {
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    finalEquity: number;
    totalReturn: number;
    totalReturnPercent: number;
    trades: Trade[];
    snapshots: PortfolioSnapshot[];
    metrics: PerformanceMetrics;
}
interface PerformanceMetrics {
    totalReturn: number;
    annualizedReturn: number;
    cagr: number;
    volatility: number;
    maxDrawdown: number;
    maxDrawdownDuration: number;
    calmarRatio: number;
    sharpeRatio: number;
    sortinoRatio: number;
    informationRatio?: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    avgTradeDuration: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    avgExposure: number;
    maxExposure: number;
    avgLeverage: number;
}
interface Signal {
    symbol: string;
    action: "buy" | "sell" | "hold";
    strength: number;
    price: number;
    timestamp: Date;
    reason?: string;
    confidence?: number;
    metadata?: Record<string, unknown>;
}
interface DataProvider {
    name: string;
    getOHLCV(symbol: string, interval: string, start: Date, end: Date): Promise<OHLCV[]>;
    getLatestPrice(symbol: string): Promise<number>;
}

declare class Portfolio {
    private cash;
    private positions;
    private trades;
    private orders;
    private snapshots;
    private config;
    private highWaterMark;
    private tradeCounter;
    private orderCounter;
    constructor(config: BacktesterConfig);
    getEquity(prices: Map<string, number>): number;
    getCash(): number;
    getPosition(symbol: string): Position | undefined;
    getAllPositions(): Position[];
    getTrades(): Trade[];
    placeOrder(order: Omit<Order, "id" | "createdAt" | "status">): Order;
    executeOrder(orderId: string, price: number, timestamp: Date): Trade | null;
    private processTrade;
    updatePrices(prices: Map<string, number>, timestamp: Date): void;
    getSnapshots(): PortfolioSnapshot[];
    getHighWaterMark(): number;
    reset(): void;
}

interface StrategyConfig {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
}
declare abstract class Strategy {
    protected name: string;
    protected description: string;
    protected parameters: Record<string, unknown>;
    constructor(config: StrategyConfig);
    abstract generateSignals(bars: OHLCV[], positions: Position[]): Promise<Signal[]>;
    abstract reset(): void;
    getName(): string;
    getDescription(): string;
    getParameters(): Record<string, unknown>;
    setParameter(key: string, value: unknown): void;
}
declare class SMACrossoverStrategy extends Strategy {
    private shortPeriod;
    private longPeriod;
    private symbol;
    constructor(config: {
        symbol: string;
        shortPeriod?: number;
        longPeriod?: number;
    });
    generateSignals(bars: OHLCV[], positions: Position[]): Promise<Signal[]>;
    private calculateSMA;
    reset(): void;
}
declare class RSIStrategy extends Strategy {
    private period;
    private oversoldThreshold;
    private overboughtThreshold;
    private symbol;
    constructor(config: {
        symbol: string;
        period?: number;
        oversoldThreshold?: number;
        overboughtThreshold?: number;
    });
    generateSignals(bars: OHLCV[], positions: Position[]): Promise<Signal[]>;
    private calculateRSI;
    reset(): void;
}

interface BacktestOptions {
    startDate: Date;
    endDate: Date;
    symbols: string[];
    interval: string;
    warmupPeriod?: number;
}
declare class BacktestEngine {
    private config;
    private portfolio;
    private strategy?;
    private dataProvider?;
    private metricsCalculator;
    constructor(config?: Partial<BacktesterConfig>);
    setStrategy(strategy: Strategy): void;
    setDataProvider(provider: DataProvider): void;
    run(options: BacktestOptions): Promise<BacktestResult>;
    private alignData;
    private executeSignal;
    private closeAllPositions;
    getPortfolio(): Portfolio;
}

declare class Indicators {
    static SMA(prices: number[], period: number): number[];
    static EMA(prices: number[], period: number): number[];
    static RSI(bars: OHLCV[], period?: number): number[];
    static MACD(prices: number[], fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): {
        macd: number[];
        signal: number[];
        histogram: number[];
    };
    static BollingerBands(prices: number[], period?: number, stdDev?: number): {
        upper: number[];
        middle: number[];
        lower: number[];
    };
    static ATR(bars: OHLCV[], period?: number): number[];
    static Stochastic(bars: OHLCV[], kPeriod?: number, dPeriod?: number): {
        k: number[];
        d: number[];
    };
    static VWAP(bars: OHLCV[]): number[];
}

declare class MetricsCalculator {
    private config;
    constructor(config: BacktesterConfig);
    calculate(snapshots: PortfolioSnapshot[], trades: Trade[], startDate: Date, endDate: Date): PerformanceMetrics;
    private calculateReturns;
    private calculateTotalReturn;
    private calculateAnnualizedReturn;
    private calculateCAGR;
    private calculateVolatility;
    private calculateMaxDrawdown;
    private calculateSharpeRatio;
    private calculateSortinoRatio;
    private calculateCalmarRatio;
    private calculateTradingMetrics;
    private calculateExposureMetrics;
}

interface VaRResult {
    var95: number;
    var99: number;
    cvar95: number;
    cvar99: number;
}
interface DrawdownAnalysis {
    currentDrawdown: number;
    maxDrawdown: number;
    avgDrawdown: number;
    drawdownPeriods: Array<{
        start: Date;
        end: Date;
        depth: number;
        duration: number;
        recovery: number;
    }>;
}
declare class RiskAnalyzer {
    calculateVaR(returns: number[]): VaRResult;
    calculateParametricVaR(mean: number, stdDev: number, confidence: number): number;
    analyzeDrawdowns(snapshots: PortfolioSnapshot[]): DrawdownAnalysis;
    calculateConcentrationRisk(snapshots: PortfolioSnapshot[]): {
        avgConcentration: number;
        maxConcentration: number;
        herfindahlIndex: number;
    };
    calculateTailRisk(returns: number[]): {
        skewness: number;
        kurtosis: number;
        tailRatio: number;
    };
    calculateTradeRisk(trades: Trade[]): {
        avgRiskRewardRatio: number;
        largestWin: number;
        largestLoss: number;
        avgWinLossRatio: number;
    };
}

interface MonteCarloResult {
    simulations: number;
    percentiles: {
        p5: SimulationOutcome;
        p25: SimulationOutcome;
        p50: SimulationOutcome;
        p75: SimulationOutcome;
        p95: SimulationOutcome;
    };
    probability: {
        profit: number;
        loss: number;
        doubling: number;
        ruin: number;
    };
    distribution: SimulationOutcome[];
}
interface SimulationOutcome {
    finalEquity: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
}
declare class MonteCarloSimulator {
    private initialCapital;
    private riskFreeRate;
    constructor(config: {
        initialCapital: number;
        riskFreeRate?: number;
    });
    runTradeResampling(trades: Trade[], simulations: number, tradesPerSimulation: number): MonteCarloResult;
    private runSingleSimulation;
    private calculateReturns;
    private calculateSharpe;
    private calculateProbabilities;
    runReturnSimulation(returns: number[], simulations: number, periodsPerSimulation: number): MonteCarloResult;
    private emptyResult;
}

interface CSVDataConfig {
    data: string;
    dateColumn?: string;
    dateFormat?: string;
    openColumn?: string;
    highColumn?: string;
    lowColumn?: string;
    closeColumn?: string;
    volumeColumn?: string;
    delimiter?: string;
}
declare class CSVDataProvider implements DataProvider {
    name: string;
    private data;
    loadFromString(symbol: string, csv: string, config?: Partial<CSVDataConfig>): Promise<void>;
    private parseDate;
    getOHLCV(symbol: string, _interval: string, start: Date, end: Date): Promise<OHLCV[]>;
    getLatestPrice(symbol: string): Promise<number>;
    getSymbols(): string[];
    hasData(symbol: string): boolean;
    getDataRange(symbol: string): {
        start: Date;
        end: Date;
    } | null;
}

export { BacktestEngine, type BacktestOptions, type BacktestResult, type BacktesterConfig, BacktesterConfigSchema, type CSVDataConfig, CSVDataProvider, type DataProvider, type DrawdownAnalysis, Indicators, MetricsCalculator, type MonteCarloResult, MonteCarloSimulator, type OHLCV, type Order, type PerformanceMetrics, Portfolio, type PortfolioSnapshot, type Position, RSIStrategy, RiskAnalyzer, SMACrossoverStrategy, type Signal, type SimulationOutcome, Strategy, type Trade, type VaRResult };
