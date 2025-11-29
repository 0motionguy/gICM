#!/usr/bin/env node
import {
  Logger,
  ProductEngine
} from "./chunk-STC4MDLB.js";

// src/cli.ts
var logger = new Logger("CLI");
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const engine = new ProductEngine();
  switch (command) {
    case "start":
      await engine.start();
      logger.info("Product Engine is running. Press Ctrl+C to stop.");
      process.on("SIGINT", () => {
        engine.stop();
        process.exit(0);
      });
      break;
    case "discover":
      logger.info("Running discovery...");
      const opportunities = await engine.runDiscovery();
      console.log(`
Discovered ${opportunities.length} opportunities:
`);
      opportunities.slice(0, 10).forEach((opp, i) => {
        console.log(`${i + 1}. [${opp.priority}] ${opp.title}`);
        console.log(`   Source: ${opp.source} | Score: ${opp.scores.overall}`);
        console.log(`   ${opp.description.slice(0, 100)}...`);
        console.log();
      });
      break;
    case "backlog":
      const backlog = engine.getBacklog();
      console.log(`
=== Product Backlog (${backlog.length} items) ===
`);
      backlog.slice(0, 20).forEach((opp, i) => {
        const icon = opp.status === "approved" ? "\u2705" : opp.status === "rejected" ? "\u274C" : "\u23F3";
        console.log(`${i + 1}. ${icon} [${opp.priority}] ${opp.title}`);
        console.log(`   ID: ${opp.id}`);
        console.log(`   Score: ${opp.scores.overall} | Source: ${opp.source}`);
        console.log();
      });
      break;
    case "approve":
      const approveId = args[1];
      if (!approveId) {
        logger.error("Usage: product approve <opportunity-id>");
        process.exit(1);
      }
      engine.approveOpportunity(approveId);
      logger.info(`Approved: ${approveId}`);
      break;
    case "reject":
      const rejectId = args[1];
      const reason = args.slice(2).join(" ") || "Rejected via CLI";
      if (!rejectId) {
        logger.error("Usage: product reject <opportunity-id> [reason]");
        process.exit(1);
      }
      engine.rejectOpportunity(rejectId, reason);
      logger.info(`Rejected: ${rejectId}`);
      break;
    case "build":
      logger.info("Processing next build...");
      const task = await engine.processNextBuild();
      if (task) {
        console.log(`
Build ${task.status}:`);
        console.log(`  ID: ${task.id}`);
        console.log(`  Type: ${task.type}`);
        console.log(`  Output: ${task.outputPath || "N/A"}`);
        if (task.error) {
          console.log(`  Error: ${task.error}`);
        }
      } else {
        console.log("No opportunities to build. Approve some first!");
      }
      break;
    case "status":
      const status = engine.getStatus();
      console.log("\n=== Product Engine Status ===\n");
      console.log(`Running: ${status.running}`);
      console.log(`Started: ${status.startedAt ? new Date(status.startedAt).toISOString() : "N/A"}`);
      console.log("\nMetrics:");
      console.log(`  Discovered: ${status.metrics.discovered}`);
      console.log(`  Built: ${status.metrics.built}`);
      console.log(`  Deployed: ${status.metrics.deployed}`);
      console.log(`  Failed: ${status.metrics.failed}`);
      console.log(`  Avg Build Time: ${Math.round(status.metrics.avgBuildTime / 1e3)}s`);
      console.log(`  Avg Quality Score: ${Math.round(status.metrics.avgQualityScore)}`);
      console.log(`
Backlog: ${status.backlog.length} items`);
      console.log(`Active Build: ${status.activeBuild?.id || "None"}`);
      console.log(`Recent Builds: ${status.recentBuilds.length}`);
      break;
    case "help":
    default:
      console.log(`
gICM Product Engine CLI

Usage:
  product start              Start the engine (runs continuously)
  product discover           Run discovery now
  product backlog            View the opportunity backlog
  product approve <id>       Approve an opportunity for building
  product reject <id> [why]  Reject an opportunity
  product build              Build next approved opportunity
  product status             Show engine status
  product help               Show this help

Examples:
  product start
  product discover
  product approve opp-gh-123456789
  product build
      `);
      break;
  }
}
main().catch((error) => {
  logger.error(`CLI error: ${error}`);
  process.exit(1);
});
