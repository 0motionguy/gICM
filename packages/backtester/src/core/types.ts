import { z } from "zod";

export const BacktesterConfigSchema = z.object({
  initialCapital: z.number().default(10000),
  currency: z.string().default("USD"),
  slippage: z.number().default(0.001), // 0.1%
  commission: z.number().default(0.001), // 0.1%
  marginEnabled: z.boolean().default(false),
  maxLeverage: z.number().default(1),
  riskFreeRate: z.number().default(0.05), // 5% annual
});

export type BacktesterConfig = z.infer<typeof BacktesterConfigSchema>;

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
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

export interface Position {
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

export interface Order {
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

export interface PortfolioSnapshot {
  timestamp: Date;
  equity: number;
  cash: number;
  positionsValue: number;
  positions: Position[];
  drawdown: number;
  drawdownPercent: number;
}

export interface BacktestResult {
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

export interface PerformanceMetrics {
  // Returns
  totalReturn: number;
  annualizedReturn: number;
  cagr: number;

  // Risk
  volatility: number;
  maxDrawdown: number;
  maxDrawdownDuration: number; // days
  calmarRatio: number;

  // Risk-adjusted
  sharpeRatio: number;
  sortinoRatio: number;
  informationRatio?: number;

  // Trading
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  avgTradeDuration: number; // hours
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;

  // Exposure
  avgExposure: number;
  maxExposure: number;
  avgLeverage: number;
}

export interface Signal {
  symbol: string;
  action: "buy" | "sell" | "hold";
  strength: number; // 0-1
  price: number;
  timestamp: Date;
  reason?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface DataProvider {
  name: string;
  getOHLCV(symbol: string, interval: string, start: Date, end: Date): Promise<OHLCV[]>;
  getLatestPrice(symbol: string): Promise<number>;
}
