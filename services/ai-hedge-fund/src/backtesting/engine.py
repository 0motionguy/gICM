"""
Backtesting Engine
Test trading strategies on historical data
"""

from dataclasses import dataclass, field
from typing import Any, Literal
from datetime import datetime, timedelta
import httpx


@dataclass
class Trade:
    """Represents a single trade"""
    token: str
    action: Literal["buy", "sell"]
    price: float
    size: float
    timestamp: datetime
    signal_confidence: float
    pnl: float = 0.0
    pnl_pct: float = 0.0
    closed: bool = False
    close_price: float | None = None
    close_timestamp: datetime | None = None


@dataclass
class BacktestResult:
    """Results from a backtest run"""
    token: str
    start_date: datetime
    end_date: datetime
    initial_balance: float
    final_balance: float
    total_pnl: float
    total_pnl_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    max_drawdown: float
    sharpe_ratio: float
    trades: list[Trade] = field(default_factory=list)
    equity_curve: list[dict] = field(default_factory=list)


class BacktestEngine:
    """
    Backtesting engine for testing trading strategies
    Uses CoinGecko historical data (free tier)
    """

    COINGECKO_BASE = "https://api.coingecko.com/api/v3"

    def __init__(
        self,
        initial_balance: float = 10000.0,
        position_size_pct: float = 10.0,
        stop_loss_pct: float = 5.0,
        take_profit_pct: float = 15.0,
    ):
        self.initial_balance = initial_balance
        self.position_size_pct = position_size_pct
        self.stop_loss_pct = stop_loss_pct
        self.take_profit_pct = take_profit_pct

    async def fetch_historical_data(
        self,
        token_id: str,
        days: int = 30,
    ) -> list[dict]:
        """Fetch historical OHLC data from CoinGecko"""
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.COINGECKO_BASE}/coins/{token_id}/ohlc"
                response = await client.get(url, params={"vs_currency": "usd", "days": days})

                if response.status_code != 200:
                    return []

                data = response.json()
                # Format: [timestamp, open, high, low, close]
                return [
                    {
                        "timestamp": datetime.fromtimestamp(d[0] / 1000),
                        "open": d[1],
                        "high": d[2],
                        "low": d[3],
                        "close": d[4],
                    }
                    for d in data
                ]
            except Exception:
                return []

    async def run_backtest(
        self,
        token_id: str,
        signals: list[dict],
        days: int = 30,
    ) -> BacktestResult:
        """
        Run backtest with provided signals

        Args:
            token_id: CoinGecko token ID
            signals: List of signals with timestamp, action, confidence
            days: Number of days to backtest

        Returns:
            BacktestResult with performance metrics
        """
        # Fetch historical data
        candles = await self.fetch_historical_data(token_id, days)

        if not candles:
            return BacktestResult(
                token=token_id,
                start_date=datetime.now() - timedelta(days=days),
                end_date=datetime.now(),
                initial_balance=self.initial_balance,
                final_balance=self.initial_balance,
                total_pnl=0,
                total_pnl_pct=0,
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                win_rate=0,
                max_drawdown=0,
                sharpe_ratio=0,
            )

        # Initialize
        balance = self.initial_balance
        position: Trade | None = None
        trades: list[Trade] = []
        equity_curve: list[dict] = []
        peak_balance = balance

        # Process each candle
        for candle in candles:
            current_price = candle["close"]

            # Check if we have a position
            if position:
                # Calculate unrealized PnL
                if position.action == "buy":
                    unrealized_pnl_pct = ((current_price - position.price) / position.price) * 100
                else:
                    unrealized_pnl_pct = ((position.price - current_price) / position.price) * 100

                # Check stop loss
                if unrealized_pnl_pct <= -self.stop_loss_pct:
                    position.closed = True
                    position.close_price = current_price
                    position.close_timestamp = candle["timestamp"]
                    position.pnl_pct = unrealized_pnl_pct
                    position.pnl = position.size * (unrealized_pnl_pct / 100)
                    balance += position.size + position.pnl
                    trades.append(position)
                    position = None

                # Check take profit
                elif unrealized_pnl_pct >= self.take_profit_pct:
                    position.closed = True
                    position.close_price = current_price
                    position.close_timestamp = candle["timestamp"]
                    position.pnl_pct = unrealized_pnl_pct
                    position.pnl = position.size * (unrealized_pnl_pct / 100)
                    balance += position.size + position.pnl
                    trades.append(position)
                    position = None

            # Check for new signals
            for signal in signals:
                signal_time = signal.get("timestamp")
                if signal_time and abs((signal_time - candle["timestamp"]).total_seconds()) < 3600:
                    action = signal.get("action", "").lower()
                    confidence = signal.get("confidence", 50)

                    # Only trade on high confidence signals
                    if confidence >= 60 and action in ["buy", "bullish"] and not position:
                        size = balance * (self.position_size_pct / 100)
                        position = Trade(
                            token=token_id,
                            action="buy",
                            price=current_price,
                            size=size,
                            timestamp=candle["timestamp"],
                            signal_confidence=confidence,
                        )
                        balance -= size

            # Track equity
            current_equity = balance
            if position:
                if position.action == "buy":
                    pnl_pct = ((current_price - position.price) / position.price) * 100
                else:
                    pnl_pct = ((position.price - current_price) / position.price) * 100
                current_equity += position.size * (1 + pnl_pct / 100)

            equity_curve.append({
                "timestamp": candle["timestamp"],
                "equity": current_equity,
                "price": current_price,
            })

            # Track max drawdown
            if current_equity > peak_balance:
                peak_balance = current_equity

        # Close any remaining position at last price
        if position:
            final_price = candles[-1]["close"]
            if position.action == "buy":
                pnl_pct = ((final_price - position.price) / position.price) * 100
            else:
                pnl_pct = ((position.price - final_price) / position.price) * 100

            position.closed = True
            position.close_price = final_price
            position.close_timestamp = candles[-1]["timestamp"]
            position.pnl_pct = pnl_pct
            position.pnl = position.size * (pnl_pct / 100)
            balance += position.size + position.pnl
            trades.append(position)

        # Calculate metrics
        winning = [t for t in trades if t.pnl > 0]
        losing = [t for t in trades if t.pnl <= 0]
        win_rate = len(winning) / len(trades) * 100 if trades else 0

        # Max drawdown
        max_dd = 0
        peak = self.initial_balance
        for point in equity_curve:
            if point["equity"] > peak:
                peak = point["equity"]
            dd = (peak - point["equity"]) / peak * 100
            if dd > max_dd:
                max_dd = dd

        # Sharpe ratio (simplified)
        returns = []
        for i in range(1, len(equity_curve)):
            ret = (equity_curve[i]["equity"] - equity_curve[i-1]["equity"]) / equity_curve[i-1]["equity"]
            returns.append(ret)

        if returns:
            avg_return = sum(returns) / len(returns)
            std_return = (sum((r - avg_return) ** 2 for r in returns) / len(returns)) ** 0.5
            sharpe = (avg_return / std_return) * (252 ** 0.5) if std_return > 0 else 0
        else:
            sharpe = 0

        return BacktestResult(
            token=token_id,
            start_date=candles[0]["timestamp"],
            end_date=candles[-1]["timestamp"],
            initial_balance=self.initial_balance,
            final_balance=balance,
            total_pnl=balance - self.initial_balance,
            total_pnl_pct=((balance - self.initial_balance) / self.initial_balance) * 100,
            total_trades=len(trades),
            winning_trades=len(winning),
            losing_trades=len(losing),
            win_rate=win_rate,
            max_drawdown=max_dd,
            sharpe_ratio=sharpe,
            trades=trades,
            equity_curve=equity_curve,
        )
