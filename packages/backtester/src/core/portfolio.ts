import type { Position, Trade, PortfolioSnapshot, Order, BacktesterConfig } from "./types.js";

export class Portfolio {
  private cash: number;
  private positions: Map<string, Position> = new Map();
  private trades: Trade[] = [];
  private orders: Map<string, Order> = new Map();
  private snapshots: PortfolioSnapshot[] = [];
  private config: BacktesterConfig;
  private highWaterMark: number;
  private tradeCounter = 0;
  private orderCounter = 0;

  constructor(config: BacktesterConfig) {
    this.config = config;
    this.cash = config.initialCapital;
    this.highWaterMark = config.initialCapital;
  }

  getEquity(prices: Map<string, number>): number {
    let positionsValue = 0;
    for (const [symbol, position] of this.positions) {
      const price = prices.get(symbol) ?? position.currentPrice;
      positionsValue += position.quantity * price;
    }
    return this.cash + positionsValue;
  }

  getCash(): number {
    return this.cash;
  }

  getPosition(symbol: string): Position | undefined {
    return this.positions.get(symbol);
  }

  getAllPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getTrades(): Trade[] {
    return this.trades;
  }

  placeOrder(order: Omit<Order, "id" | "createdAt" | "status">): Order {
    const newOrder: Order = {
      ...order,
      id: `order_${++this.orderCounter}`,
      createdAt: new Date(),
      status: "pending",
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  executeOrder(orderId: string, price: number, timestamp: Date): Trade | null {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "pending") return null;

    // Apply slippage
    const slippage = order.side === "buy"
      ? price * (1 + this.config.slippage)
      : price * (1 - this.config.slippage);
    const executionPrice = slippage;

    // Calculate commission
    const commission = order.quantity * executionPrice * this.config.commission;

    // Check if we have enough cash for buys
    if (order.side === "buy") {
      const totalCost = order.quantity * executionPrice + commission;
      if (totalCost > this.cash) {
        order.status = "rejected";
        return null;
      }
    }

    // Update order status
    order.status = "filled";
    order.filledAt = timestamp;
    order.filledPrice = executionPrice;
    order.filledQuantity = order.quantity;

    // Create or update position
    const trade = this.processTrade(order, executionPrice, timestamp, commission);
    return trade;
  }

  private processTrade(
    order: Order,
    price: number,
    timestamp: Date,
    commission: number
  ): Trade {
    const symbol = order.symbol;
    let position = this.positions.get(symbol);

    const trade: Trade = {
      id: `trade_${++this.tradeCounter}`,
      symbol,
      side: order.side === "buy" ? "long" : "short",
      entryPrice: price,
      quantity: order.quantity,
      entryTime: timestamp,
      fees: commission,
      status: "open",
    };

    if (order.side === "buy") {
      // Opening or adding to long position
      this.cash -= order.quantity * price + commission;

      if (!position) {
        position = {
          symbol,
          side: "long",
          quantity: order.quantity,
          avgEntryPrice: price,
          currentPrice: price,
          unrealizedPnl: 0,
          realizedPnl: 0,
          openTime: timestamp,
          trades: [trade],
        };
      } else {
        // Average up/down
        const totalQuantity = position.quantity + order.quantity;
        position.avgEntryPrice =
          (position.avgEntryPrice * position.quantity + price * order.quantity) /
          totalQuantity;
        position.quantity = totalQuantity;
        position.trades.push(trade);
      }
    } else {
      // Closing long position or opening short
      if (position && position.side === "long") {
        const closeQuantity = Math.min(position.quantity, order.quantity);
        const pnl = (price - position.avgEntryPrice) * closeQuantity - commission;

        trade.exitPrice = price;
        trade.exitTime = timestamp;
        trade.pnl = pnl;
        trade.pnlPercent = (pnl / (position.avgEntryPrice * closeQuantity)) * 100;
        trade.status = "closed";

        this.cash += closeQuantity * price - commission;
        position.realizedPnl += pnl;
        position.quantity -= closeQuantity;

        if (position.quantity <= 0) {
          this.positions.delete(symbol);
        }
      }
    }

    if (position && position.quantity > 0) {
      this.positions.set(symbol, position);
    }

    this.trades.push(trade);
    return trade;
  }

  updatePrices(prices: Map<string, number>, timestamp: Date): void {
    for (const [symbol, position] of this.positions) {
      const price = prices.get(symbol);
      if (price !== undefined) {
        position.currentPrice = price;
        position.unrealizedPnl =
          (price - position.avgEntryPrice) * position.quantity *
          (position.side === "long" ? 1 : -1);
      }
    }

    // Record snapshot
    const equity = this.getEquity(prices);
    this.highWaterMark = Math.max(this.highWaterMark, equity);
    const drawdown = this.highWaterMark - equity;
    const drawdownPercent = this.highWaterMark > 0 ? (drawdown / this.highWaterMark) * 100 : 0;

    this.snapshots.push({
      timestamp,
      equity,
      cash: this.cash,
      positionsValue: equity - this.cash,
      positions: this.getAllPositions().map((p) => ({ ...p })),
      drawdown,
      drawdownPercent,
    });
  }

  getSnapshots(): PortfolioSnapshot[] {
    return this.snapshots;
  }

  getHighWaterMark(): number {
    return this.highWaterMark;
  }

  reset(): void {
    this.cash = this.config.initialCapital;
    this.positions.clear();
    this.trades = [];
    this.orders.clear();
    this.snapshots = [];
    this.highWaterMark = this.config.initialCapital;
    this.tradeCounter = 0;
    this.orderCounter = 0;
  }
}
