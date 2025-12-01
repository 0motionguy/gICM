/**
 * Pump.fun Token Launch Detector
 * Monitors for new token creations via WebSocket
 */

import { Connection, PublicKey } from "@solana/web3.js";
import WebSocket from "ws";
import { CONFIG } from "./config.js";
import { EventEmitter } from "events";

export interface TokenLaunch {
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  timestamp: number;
  bondingCurve: string;
  initialLiquidity: number;
  signature: string;
}

export class PumpDetector extends EventEmitter {
  private connection: Connection;
  private ws: WebSocket | null = null;
  private running = false;

  constructor() {
    super();
    this.connection = new Connection(CONFIG.RPC_URL, "confirmed");
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    console.log("[DETECTOR] Starting pump.fun monitor...");
    console.log(`[DETECTOR] Watching program: ${CONFIG.PUMP_PROGRAM_ID}`);

    // Subscribe to program logs
    this.subscribeToLogs();
  }

  private subscribeToLogs(): void {
    const pumpProgramId = new PublicKey(CONFIG.PUMP_PROGRAM_ID);

    this.connection.onLogs(
      pumpProgramId,
      async (logs, ctx) => {
        // Check for token creation signature
        if (logs.logs.some(log => log.includes("InitializeMint") || log.includes("Create"))) {
          try {
            const launch = await this.parseTokenLaunch(logs.signature);
            if (launch) {
              console.log(`[DETECTOR] New token: ${launch.symbol} (${launch.mint})`);
              this.emit("launch", launch);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      },
      "confirmed"
    );

    console.log("[DETECTOR] Subscribed to pump.fun logs");
  }

  private async parseTokenLaunch(signature: string): Promise<TokenLaunch | null> {
    try {
      const tx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx?.meta || tx.meta.err) return null;

      // Extract token mint from transaction
      const postTokenBalances = tx.meta.postTokenBalances || [];
      const tokenMint = postTokenBalances.find(b => b.mint)?.mint;

      if (!tokenMint) return null;

      // Get token metadata (simplified - would need metaplex in production)
      const launch: TokenLaunch = {
        mint: tokenMint,
        name: "Unknown",
        symbol: "???",
        creator: tx.transaction.message.accountKeys[0]?.pubkey?.toString() || "",
        timestamp: tx.blockTime || Date.now() / 1000,
        bondingCurve: "",
        initialLiquidity: 0,
        signature,
      };

      return launch;
    } catch {
      return null;
    }
  }

  stop(): void {
    this.running = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log("[DETECTOR] Stopped");
  }
}

// Alternative: Direct WebSocket to pump.fun API (if available)
export class PumpAPIDetector extends EventEmitter {
  private ws: WebSocket | null = null;
  private running = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    console.log("[API-DETECTOR] Connecting to pump.fun stream...");
    this.connect();
  }

  private connect(): void {
    // Pump.fun public WebSocket (simulated - actual endpoint may differ)
    this.ws = new WebSocket("wss://pumpportal.fun/api/data");

    this.ws.on("open", () => {
      console.log("[API-DETECTOR] Connected to pump.fun");

      // Subscribe to new token events
      this.ws?.send(JSON.stringify({
        method: "subscribeNewToken",
      }));
    });

    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "newToken" || msg.txType === "create") {
          const launch: TokenLaunch = {
            mint: msg.mint || msg.token,
            name: msg.name || "Unknown",
            symbol: msg.symbol || "???",
            creator: msg.creator || msg.traderPublicKey || "",
            timestamp: Date.now() / 1000,
            bondingCurve: msg.bondingCurve || "",
            initialLiquidity: msg.solAmount || 0,
            signature: msg.signature || "",
          };

          console.log(`[API-DETECTOR] New token: ${launch.symbol}`);
          this.emit("launch", launch);
        }
      } catch {
        // Ignore parse errors
      }
    });

    this.ws.on("close", () => {
      console.log("[API-DETECTOR] Disconnected");
      if (this.running) {
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      }
    });

    this.ws.on("error", (err) => {
      console.error("[API-DETECTOR] Error:", err.message);
    });
  }

  stop(): void {
    this.running = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log("[API-DETECTOR] Stopped");
  }
}
