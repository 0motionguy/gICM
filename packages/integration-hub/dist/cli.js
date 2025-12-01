#!/usr/bin/env node
import {
  IntegrationHub,
  setHubInstance
} from "./chunk-OW2SLFFR.js";

// src/cli.ts
import { Command } from "commander";
var program = new Command();
program.name("gicm-hub").description("gICM Integration Hub - Central event bus and API gateway").version("0.1.0");
program.command("start").description("Start the integration hub").option("-p, --port <port>", "API port", "3001").option("--no-workflows", "Disable automated workflows").action(async (options) => {
  console.log("Starting gICM Integration Hub...\n");
  const hub = new IntegrationHub({
    apiPort: parseInt(options.port, 10),
    enableWorkflows: options.workflows !== false
  });
  setHubInstance(hub);
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await hub.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await hub.stop();
    process.exit(0);
  });
  try {
    await hub.start();
    console.log("\n" + "=".repeat(50));
    console.log("gICM Integration Hub is running!");
    console.log("=".repeat(50));
    console.log("");
    console.log("API Endpoints:");
    console.log("  REST:      http://localhost:" + options.port + "/api");
    console.log("  WebSocket: ws://localhost:" + options.port + "/ws");
    console.log("  Health:    http://localhost:" + options.port + "/health");
    console.log("");
    console.log("Press Ctrl+C to stop");
    console.log("");
  } catch (error) {
    console.error("Failed to start hub:", error);
    process.exit(1);
  }
});
program.command("status").description("Show hub status (requires running hub)").option("-p, --port <port>", "API port", "3001").action(async (options) => {
  const port = options.port;
  try {
    const response = await fetch("http://localhost:" + port + "/api/status");
    const data = await response.json();
    console.log("gICM Integration Hub Status\n");
    console.log("API Port:", port);
    console.log("Status:", data.ok ? "OK" : "DEGRADED");
    console.log("");
    console.log("Engine Status:");
    const { engines } = data;
    console.log("  Healthy:", engines.status.healthy);
    console.log("  Degraded:", engines.status.degraded);
    console.log("  Offline:", engines.status.offline);
    console.log("");
    console.log("Engine Details:");
    for (const engine of engines.details) {
      const statusIcon = engine.status === "healthy" ? "+" : engine.status === "degraded" ? "!" : "-";
      console.log("  [" + statusIcon + "] " + engine.id + ": " + engine.status);
    }
  } catch (error) {
    console.error("Failed to connect to hub on port", port);
    console.error("Is the hub running? Start it with: gicm-hub start");
    process.exit(1);
  }
});
program.command("events").description("Show recent events").option("-p, --port <port>", "API port", "3001").option("-n, --limit <limit>", "Number of events", "20").action(async (options) => {
  const port = options.port;
  const limit = options.limit;
  try {
    const response = await fetch(
      "http://localhost:" + port + "/api/events?limit=" + limit
    );
    const data = await response.json();
    console.log("Recent Events (" + data.count + ")\n");
    for (const event of data.events) {
      const time = new Date(event.timestamp).toISOString().slice(11, 19);
      console.log("[" + time + "] " + event.source + " -> " + event.type);
      if (Object.keys(event.payload).length > 0) {
        console.log("        " + JSON.stringify(event.payload));
      }
    }
  } catch (error) {
    console.error("Failed to connect to hub on port", port);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=cli.js.map