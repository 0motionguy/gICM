#!/usr/bin/env node
import {
  AutonomySystem
} from "./chunk-J6GEFAYH.js";

// src/cli.ts
var system = new AutonomySystem();
function printHelp() {
  console.log(`
gICM Autonomy CLI - Bounded autonomous decision-making

Usage: gicm-autonomy <command> [options]

Commands:
  boundaries         Show current boundary configuration
  queue              Show pending approval queue
  approve <id>       Approve a queued action
  reject <id> [why]  Reject a queued action
  batch              Show batch summary for review
  approve-all        Approve all pending actions
  reject-all         Reject all pending actions
  stats              Show autonomy statistics
  audit [since]      Show audit log (since: hours ago)
  daily              Send daily summary notification
  help               Show this help message

Examples:
  gicm-autonomy boundaries
  gicm-autonomy queue
  gicm-autonomy approve action-1234567890-abc123
  gicm-autonomy reject action-1234567890-abc123 "Too risky"
  gicm-autonomy audit 24
`);
}
function printBoundaries() {
  const b = system.getBoundaries();
  console.log("\n=== Autonomy Boundaries ===\n");
  console.log("Financial:");
  console.log("  Max auto expense:   $" + b.financial.maxAutoExpense);
  console.log("  Max queued expense: $" + b.financial.maxQueuedExpense);
  console.log("  Max daily spend:    $" + b.financial.maxDailySpend);
  console.log("  Max trade size:     $" + b.financial.maxTradeSize);
  console.log("  Max daily loss:     " + b.financial.maxDailyTradingLoss + "%");
  console.log("  Min treasury:       $" + b.financial.minTreasuryBalance);
  console.log("\nContent:");
  console.log("  Max auto posts/day:  " + b.content.maxAutoPostsPerDay);
  console.log("  Max auto blogs/week: " + b.content.maxAutoBlogsPerWeek);
  console.log("  Review topics:       " + b.content.requireReviewForTopics.join(", "));
  console.log("\nDevelopment:");
  console.log("  Max commit lines:    " + b.development.maxAutoCommitLines);
  console.log("  Max files changed:   " + b.development.maxAutoFilesChanged);
  console.log("  Review paths:        " + b.development.requireReviewForPaths.join(", "));
  console.log("  Auto deploy staging: " + b.development.autoDeployToStaging);
  console.log("  Auto deploy prod:    " + b.development.autoDeployToProduction);
  console.log("\nTrading:");
  console.log("  Allowed bots:        " + b.trading.allowedBots.join(", "));
  console.log("  Allowed tokens:      " + b.trading.allowedTokens.join(", "));
  console.log("  Max position:        " + b.trading.maxPositionPercent + "%");
  console.log("  Approve new tokens:  " + b.trading.requireApprovalForNewTokens);
  console.log("\nTime:");
  console.log("  Active hours: " + b.time.activeHours.start + ":00 - " + b.time.activeHours.end + ":00 UTC");
  console.log("  Quiet hours:  " + b.time.quietHours.start + ":00 - " + b.time.quietHours.end + ":00 UTC");
  console.log("  Maintenance:  Day " + b.time.maintenanceWindow.day + " at " + b.time.maintenanceWindow.hour + ":00 UTC");
  console.log("");
}
function printQueue() {
  const pending = system.getPendingApprovals();
  console.log("\n=== Pending Approvals (" + pending.length + ") ===\n");
  if (pending.length === 0) {
    console.log("No actions pending approval.\n");
    return;
  }
  for (const item of pending) {
    const a = item.action;
    const age = Math.round((Date.now() - a.createdAt) / 6e4);
    console.log("ID: " + a.id);
    console.log("  Type:    " + a.type);
    console.log("  Engine:  " + a.engine);
    console.log("  Risk:    " + a.risk.level + " (" + a.risk.score + "/100)");
    console.log("  Cost:    $" + a.risk.estimatedCost);
    console.log("  Urgency: " + item.urgency);
    console.log("  Age:     " + age + " minutes");
    console.log("  Reason:  " + item.reason);
    console.log("  Suggest: " + item.recommendation.toUpperCase());
    console.log("");
  }
}
function printBatch() {
  const batch = system.getBatch();
  console.log("\n=== Batch Summary ===\n");
  console.log("Total Actions: " + batch.totalActions);
  console.log("Est. Cost:     $" + batch.estimatedTotalCost.toFixed(2));
  console.log("\nBy Engine:");
  for (const [engine, count] of Object.entries(batch.byEngine)) {
    console.log("  " + engine + ": " + count);
  }
  console.log("\nBy Risk:");
  for (const [risk, count] of Object.entries(batch.byRisk)) {
    if (count > 0) {
      console.log("  " + risk + ": " + count);
    }
  }
  console.log("");
}
async function approveAction(id) {
  console.log("Approving action: " + id);
  const success = await system.approveAction(id);
  if (success) {
    console.log("Action approved and executed successfully.");
  } else {
    console.log("Failed to approve action. It may not exist or already processed.");
  }
}
function rejectAction(id, reason) {
  console.log("Rejecting action: " + id);
  const success = system.rejectAction(id, reason);
  if (success) {
    console.log("Action rejected.");
  } else {
    console.log("Failed to reject action. It may not exist or already processed.");
  }
}
async function approveAll() {
  const batch = system.getBatch();
  console.log("Approving all " + batch.totalActions + " pending actions...");
  await batch.approveAll();
  console.log("All actions approved.");
}
async function rejectAll() {
  const batch = system.getBatch();
  console.log("Rejecting all " + batch.totalActions + " pending actions...");
  await batch.rejectAll();
  console.log("All actions rejected.");
}
function printStats() {
  const queueStats = system.getQueueStats();
  const audit = system.getAuditSummary();
  const daily = system.getDailySummary();
  console.log("\n=== Autonomy Statistics ===\n");
  console.log("Queue Status:");
  console.log("  Pending:  " + queueStats.pending);
  console.log("  Approved: " + queueStats.approved);
  console.log("  Rejected: " + queueStats.rejected);
  if (Object.keys(queueStats.byUrgency).length > 0) {
    console.log("\n  By Urgency:");
    for (const [urgency, count] of Object.entries(queueStats.byUrgency)) {
      console.log("    " + urgency + ": " + count);
    }
  }
  console.log("\nAll-Time Audit:");
  console.log("  Total Actions: " + audit.total);
  console.log("  Auto-route:    " + audit.byRoute.auto);
  console.log("  Queue-route:   " + audit.byRoute.queue);
  console.log("  Escalated:     " + audit.byRoute.escalate);
  console.log("  Success Rate:  " + audit.successRate.toFixed(1) + "%");
  console.log("  Total Cost:    $" + audit.totalCost.toFixed(2));
  console.log("  Total Revenue: $" + audit.totalRevenue.toFixed(2));
  console.log("\nToday's Summary:");
  console.log("  Auto-executed: " + daily.autoExecuted);
  console.log("  Queued:        " + daily.queued);
  console.log("  Escalated:     " + daily.escalated);
  console.log("  Cost:          $" + daily.costIncurred.toFixed(2));
  console.log("  Revenue:       $" + daily.revenueGenerated.toFixed(2));
  console.log("");
}
function printAudit(sinceHours) {
  const since = sinceHours ? Date.now() - sinceHours * 60 * 60 * 1e3 : void 0;
  const summary = system.getAuditSummary(since);
  console.log("\n=== Audit Log" + (sinceHours ? " (last " + sinceHours + "h)" : "") + " ===\n");
  console.log("Total Actions: " + summary.total);
  console.log("Success Rate:  " + summary.successRate.toFixed(1) + "%");
  console.log("Cost:          $" + summary.totalCost.toFixed(2));
  console.log("Revenue:       $" + summary.totalRevenue.toFixed(2));
  console.log("\nBy Route:");
  console.log("  Auto:     " + summary.byRoute.auto);
  console.log("  Queue:    " + summary.byRoute.queue);
  console.log("  Escalate: " + summary.byRoute.escalate);
  console.log("\nBy Status:");
  for (const [status, count] of Object.entries(summary.byStatus)) {
    console.log("  " + status + ": " + count);
  }
  console.log("\nBy Engine:");
  for (const [engine, count] of Object.entries(summary.byEngine)) {
    console.log("  " + engine + ": " + count);
  }
  console.log("");
}
async function sendDaily() {
  console.log("Sending daily summary notification...");
  await system.sendDailySummary();
  console.log("Daily summary sent (check configured notification channels).");
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === "help") {
    printHelp();
    return;
  }
  switch (command) {
    case "boundaries":
      printBoundaries();
      break;
    case "queue":
      printQueue();
      break;
    case "batch":
      printBatch();
      break;
    case "approve":
      if (!args[1]) {
        console.error("Error: Action ID required. Usage: gicm-autonomy approve <id>");
        process.exit(1);
      }
      await approveAction(args[1]);
      break;
    case "reject":
      if (!args[1]) {
        console.error("Error: Action ID required. Usage: gicm-autonomy reject <id> [reason]");
        process.exit(1);
      }
      rejectAction(args[1], args.slice(2).join(" ") || void 0);
      break;
    case "approve-all":
      await approveAll();
      break;
    case "reject-all":
      await rejectAll();
      break;
    case "stats":
      printStats();
      break;
    case "audit":
      printAudit(args[1] ? parseInt(args[1], 10) : void 0);
      break;
    case "daily":
      await sendDaily();
      break;
    default:
      console.error("Unknown command: " + command);
      printHelp();
      process.exit(1);
  }
  system.shutdown();
}
main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
//# sourceMappingURL=cli.js.map