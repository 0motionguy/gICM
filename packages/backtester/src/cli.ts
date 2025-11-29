#!/usr/bin/env node

import { BacktestEngine } from "./core/engine.js";
import { CSVDataProvider } from "./data/providers/csv.js";
import { SMACrossoverStrategy, RSIStrategy } from "./strategies/base.js";
import type { BacktestResult } from "./core/types.js";

interface CLIArgs {
  data?: string;
  symbol: string;
  strategy: string;
  startDate: string;
  endDate: string;
  capital?: number;
  output?: string;
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const parsed: CLIArgs = {
    symbol: "BTC",
    strategy: "sma",
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
    endDate: new Date().toISOString().split("T")[0]!,
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

function printHelp(): void {
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

function formatResults(result: BacktestResult): string {
  const metrics = result.metrics;

  return `
╔════════════════════════════════════════════════════════════════╗
║                    BACKTEST RESULTS                            ║
╠════════════════════════════════════════════════════════════════╣
║ Period: ${result.startDate.toISOString().split("T")[0]} to ${result.endDate.toISOString().split("T")[0]}
║ Initial Capital: $${result.initialCapital.toLocaleString()}
║ Final Equity: $${result.finalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
╠════════════════════════════════════════════════════════════════╣
║ RETURNS                                                         ║
╠────────────────────────────────────────────────────────────────╣
║ Total Return: ${(result.totalReturnPercent).toFixed(2)}%
║ Annualized Return: ${(metrics.annualizedReturn * 100).toFixed(2)}%
║ CAGR: ${(metrics.cagr * 100).toFixed(2)}%
╠════════════════════════════════════════════════════════════════╣
║ RISK                                                            ║
╠────────────────────────────────────────────────────────────────╣
║ Volatility: ${(metrics.volatility * 100).toFixed(2)}%
║ Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%
║ Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
║ Sortino Ratio: ${metrics.sortinoRatio.toFixed(2)}
║ Calmar Ratio: ${metrics.calmarRatio.toFixed(2)}
╠════════════════════════════════════════════════════════════════╣
║ TRADING                                                         ║
╠────────────────────────────────────────────────────────────────╣
║ Total Trades: ${metrics.totalTrades}
║ Win Rate: ${(metrics.winRate * 100).toFixed(1)}%
║ Profit Factor: ${metrics.profitFactor.toFixed(2)}
║ Avg Win: $${metrics.avgWin.toFixed(2)}
║ Avg Loss: $${metrics.avgLoss.toFixed(2)}
║ Max Consecutive Wins: ${metrics.maxConsecutiveWins}
║ Max Consecutive Losses: ${metrics.maxConsecutiveLosses}
╚════════════════════════════════════════════════════════════════╝
`;
}

async function main(): Promise<void> {
  const args = parseArgs();

  console.log("gICM Backtester");
  console.log("===============\n");

  // Initialize engine
  const engine = new BacktestEngine({
    initialCapital: args.capital ?? 10000,
  });

  // Set up data provider
  const dataProvider = new CSVDataProvider();

  if (args.data) {
    // Load data from file (would need fs in real implementation)
    console.log(`Loading data from ${args.data}...`);
    // In browser/limited env, you'd pass data directly
    console.log("Note: File loading requires Node.js fs module");
  } else {
    console.log("No data file provided. Using demo data...");
    // Generate demo data
    const demoData = generateDemoData(args.symbol);
    await dataProvider.loadFromString(args.symbol, demoData);
  }

  engine.setDataProvider(dataProvider);

  // Set up strategy
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
  console.log(`Period: ${args.startDate} to ${args.endDate}\n`);

  // Run backtest
  console.log("Running backtest...\n");

  try {
    const result = await engine.run({
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      symbols: [args.symbol],
      interval: "1d",
      warmupPeriod: 30,
    });

    console.log(formatResults(result));
  } catch (error) {
    console.error("Backtest failed:", error);
    process.exit(1);
  }
}

function generateDemoData(symbol: string): string {
  const lines = ["date,open,high,low,close,volume"];
  let price = 100;

  const startDate = new Date("2023-01-01");
  const endDate = new Date("2024-01-01");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Random walk with some trend
    const change = (Math.random() - 0.48) * 3; // Slight upward bias
    price = Math.max(price + change, 10);

    const open = price;
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(1000000 + Math.random() * 5000000);

    lines.push(
      `${d.toISOString().split("T")[0]},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${volume}`
    );
  }

  return lines.join("\n");
}

main().catch(console.error);
