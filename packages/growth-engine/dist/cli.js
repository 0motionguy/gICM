#!/usr/bin/env node
import {
  GrowthEngine,
  Logger
} from "./chunk-HPTWSKIG.js";

// src/cli.ts
var logger = new Logger("CLI");
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const engine = new GrowthEngine();
  switch (command) {
    case "start":
      await engine.start();
      logger.info("Growth Engine is running. Press Ctrl+C to stop.");
      process.on("SIGINT", () => {
        engine.stop();
        process.exit(0);
      });
      break;
    case "generate":
      const type = args[1];
      if (!["blog", "tweet", "thread"].includes(type)) {
        logger.error("Usage: growth generate <blog|tweet|thread>");
        process.exit(1);
      }
      await engine.generateNow(type);
      break;
    case "keywords":
      const topic = args.slice(1).join(" ") || "AI development tools";
      await engine.researchKeywords(topic);
      break;
    case "status":
      const status = engine.getStatus();
      console.log("\n=== Growth Engine Status ===\n");
      console.log(`Running: ${status.running}`);
      console.log(`Started: ${status.startedAt ? new Date(status.startedAt).toISOString() : "N/A"}`);
      console.log("\nMetrics:");
      console.log(`  Posts published: ${status.metrics.content.postsPublished}`);
      console.log(`  Total views: ${status.metrics.content.totalViews}`);
      console.log(`  Avg engagement: ${status.metrics.content.avgEngagement}%`);
      const upcomingCount = status.upcomingContent.upcoming?.length || 0;
      console.log(`
Upcoming content: ${upcomingCount} items`);
      break;
    case "help":
    default:
      console.log(`
gICM Growth Engine CLI

Usage:
  growth start              Start the engine (runs continuously)
  growth generate <type>    Generate content (blog, tweet, thread)
  growth keywords <topic>   Research keywords for a topic
  growth status             Show engine status
  growth help               Show this help

Examples:
  growth start
  growth generate blog
  growth keywords "claude code"
      `);
      break;
  }
}
main().catch((error) => {
  logger.error(`CLI error: ${error}`);
  process.exit(1);
});
//# sourceMappingURL=cli.js.map