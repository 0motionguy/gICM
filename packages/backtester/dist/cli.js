#!/usr/bin/env node
import {
  BacktestEngine,
  CSVDataProvider,
  RSIStrategy,
  SMACrossoverStrategy
} from "./chunk-6GHRCX3X.js";

// src/cli.ts
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    symbol: "BTC",
    strategy: "sma",
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    endDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];
    switch (arg) {
      case "--data":
      case "-d":
        parsed.data = value;
        i++;
        break;
      case "--symbol":
      case "-s":
        parsed.symbol = value ?? parsed.symbol;
        i++;
        break;
      case "--strategy":
        parsed.strategy = value ?? parsed.strategy;
        i++;
        break;
      case "--start":
        parsed.startDate = value ?? parsed.startDate;
        i++;
        break;
      case "--end":
        parsed.endDate = value ?? parsed.endDate;
        i++;
        break;
      case "--capital":
      case "-c":
        parsed.capital = parseInt(value ?? "10000");
        i++;
        break;
      case "--output":
      case "-o":
        parsed.output = value;
        i++;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }
  return parsed;
}
function printHelp() {
  console.log(`
gICM Backtester CLI

Usage: gicm-backtest [options]

Options:
  -d, --data <file>       CSV data file path
  -s, --symbol <symbol>   Trading symbol (default: BTC)
  --strategy <name>       Strategy: sma, rsi (default: sma)
  --start <date>          Start date (YYYY-MM-DD)
  --end <date>            End date (YYYY-MM-DD)
  -c, --capital <amount>  Initial capital (default: 10000)
  -o, --output <file>     Output file for results
  -h, --help              Show this help

Examples:
  gicm-backtest -d btc.csv -s BTC --strategy sma --start 2023-01-01 --end 2024-01-01
  gicm-backtest -d eth.csv -s ETH --strategy rsi --capital 50000
`);
}
function formatResults(result) {
  const metrics = result.metrics;
  return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    BACKTEST RESULTS                            \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 Period: ${result.startDate.toISOString().split("T")[0]} to ${result.endDate.toISOString().split("T")[0]}
\u2551 Initial Capital: $${result.initialCapital.toLocaleString()}
\u2551 Final Equity: $${result.finalEquity.toLocaleString(void 0, { minimumFractionDigits: 2 })}
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 RETURNS                                                         \u2551
\u2560\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2563
\u2551 Total Return: ${result.totalReturnPercent.toFixed(2)}%
\u2551 Annualized Return: ${(metrics.annualizedReturn * 100).toFixed(2)}%
\u2551 CAGR: ${(metrics.cagr * 100).toFixed(2)}%
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 RISK                                                            \u2551
\u2560\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2563
\u2551 Volatility: ${(metrics.volatility * 100).toFixed(2)}%
\u2551 Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%
\u2551 Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
\u2551 Sortino Ratio: ${metrics.sortinoRatio.toFixed(2)}
\u2551 Calmar Ratio: ${metrics.calmarRatio.toFixed(2)}
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 TRADING                                                         \u2551
\u2560\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2563
\u2551 Total Trades: ${metrics.totalTrades}
\u2551 Win Rate: ${(metrics.winRate * 100).toFixed(1)}%
\u2551 Profit Factor: ${metrics.profitFactor.toFixed(2)}
\u2551 Avg Win: $${metrics.avgWin.toFixed(2)}
\u2551 Avg Loss: $${metrics.avgLoss.toFixed(2)}
\u2551 Max Consecutive Wins: ${metrics.maxConsecutiveWins}
\u2551 Max Consecutive Losses: ${metrics.maxConsecutiveLosses}
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`;
}
async function main() {
  const args = parseArgs();
  console.log("gICM Backtester");
  console.log("===============\n");
  const engine = new BacktestEngine({
    initialCapital: args.capital ?? 1e4
  });
  const dataProvider = new CSVDataProvider();
  if (args.data) {
    console.log(`Loading data from ${args.data}...`);
    console.log("Note: File loading requires Node.js fs module");
  } else {
    console.log("No data file provided. Using demo data...");
    const demoData = generateDemoData(args.symbol);
    await dataProvider.loadFromString(args.symbol, demoData);
  }
  engine.setDataProvider(dataProvider);
  switch (args.strategy.toLowerCase()) {
    case "rsi":
      engine.setStrategy(new RSIStrategy({ symbol: args.symbol }));
      console.log("Strategy: RSI (14 period, 30/70)");
      break;
    case "sma":
    default:
      engine.setStrategy(new SMACrossoverStrategy({ symbol: args.symbol }));
      console.log("Strategy: SMA Crossover (10/30)");
  }
  console.log(`Symbol: ${args.symbol}`);
  console.log(`Period: ${args.startDate} to ${args.endDate}
`);
  console.log("Running backtest...\n");
  try {
    const result = await engine.run({
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      symbols: [args.symbol],
      interval: "1d",
      warmupPeriod: 30
    });
    console.log(formatResults(result));
  } catch (error) {
    console.error("Backtest failed:", error);
    process.exit(1);
  }
}
function generateDemoData(symbol) {
  const lines = ["date,open,high,low,close,volume"];
  let price = 100;
  const startDate = /* @__PURE__ */ new Date("2023-01-01");
  const endDate = /* @__PURE__ */ new Date("2024-01-01");
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const change = (Math.random() - 0.48) * 3;
    price = Math.max(price + change, 10);
    const open = price;
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(1e6 + Math.random() * 5e6);
    lines.push(
      `${d.toISOString().split("T")[0]},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${volume}`
    );
  }
  return lines.join("\n");
}
main().catch(console.error);
//# sourceMappingURL=cli.js.map