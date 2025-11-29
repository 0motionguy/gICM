import type { DataProvider, OHLCV } from "../../core/types.js";

export interface CSVDataConfig {
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

export class CSVDataProvider implements DataProvider {
  name = "csv";
  private data: Map<string, OHLCV[]> = new Map();

  async loadFromString(symbol: string, csv: string, config: Partial<CSVDataConfig> = {}): Promise<void> {
    const delimiter = config.delimiter ?? ",";
    const lines = csv.trim().split("\n");

    if (lines.length < 2) return;

    const headers = lines[0]!.split(delimiter).map((h) => h.trim().toLowerCase());

    // Find column indices
    const dateCol = headers.indexOf(config.dateColumn?.toLowerCase() ?? "date");
    const openCol = headers.indexOf(config.openColumn?.toLowerCase() ?? "open");
    const highCol = headers.indexOf(config.highColumn?.toLowerCase() ?? "high");
    const lowCol = headers.indexOf(config.lowColumn?.toLowerCase() ?? "low");
    const closeCol = headers.indexOf(config.closeColumn?.toLowerCase() ?? "close");
    const volumeCol = headers.indexOf(config.volumeColumn?.toLowerCase() ?? "volume");

    const bars: OHLCV[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (!line) continue;

      const values = line.split(delimiter);

      try {
        const timestamp = this.parseDate(values[dateCol] ?? "", config.dateFormat);
        const open = parseFloat(values[openCol] ?? "0");
        const high = parseFloat(values[highCol] ?? "0");
        const low = parseFloat(values[lowCol] ?? "0");
        const close = parseFloat(values[closeCol] ?? "0");
        const volume = parseFloat(values[volumeCol] ?? "0");

        if (!isNaN(timestamp.getTime()) && !isNaN(close)) {
          bars.push({ timestamp, open, high, low, close, volume });
        }
      } catch {
        // Skip invalid lines
        continue;
      }
    }

    // Sort by timestamp
    bars.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.data.set(symbol, bars);
  }

  private parseDate(dateStr: string, format?: string): Date {
    // Try ISO format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try Unix timestamp
    const timestamp = parseInt(dateStr);
    if (!isNaN(timestamp)) {
      // Detect if milliseconds or seconds
      if (timestamp > 1e12) {
        return new Date(timestamp);
      } else {
        return new Date(timestamp * 1000);
      }
    }

    // Default to current date if parsing fails
    return new Date();
  }

  async getOHLCV(
    symbol: string,
    _interval: string,
    start: Date,
    end: Date
  ): Promise<OHLCV[]> {
    const allData = this.data.get(symbol) ?? [];

    return allData.filter(
      (bar) => bar.timestamp >= start && bar.timestamp <= end
    );
  }

  async getLatestPrice(symbol: string): Promise<number> {
    const data = this.data.get(symbol);
    if (!data || data.length === 0) return 0;
    return data[data.length - 1]!.close;
  }

  getSymbols(): string[] {
    return Array.from(this.data.keys());
  }

  hasData(symbol: string): boolean {
    return this.data.has(symbol) && this.data.get(symbol)!.length > 0;
  }

  getDataRange(symbol: string): { start: Date; end: Date } | null {
    const data = this.data.get(symbol);
    if (!data || data.length === 0) return null;

    return {
      start: data[0]!.timestamp,
      end: data[data.length - 1]!.timestamp,
    };
  }
}
