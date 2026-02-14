/**
 * CLI entry point for gicm-install.
 *
 * Usage:
 *   npx @gicm/installer              # Install all 9 skills
 *   npx @gicm/installer router       # Install just router
 *   npx @gicm/installer --list       # Show installed status
 *   npx @gicm/installer --dry-run    # Preview without writing
 *   npx @gicm/installer --target /path  # Custom target dir
 */

import {
  installAll,
  checkInstalled,
  getOpenClawSkillsDir,
  GICM_PACKAGES,
} from "./index.js";

function main(): void {
  const args = process.argv.slice(2);

  // Parse flags
  const dryRun = args.includes("--dry-run");
  const listOnly = args.includes("--list");
  const targetIdx = args.indexOf("--target");
  const target = targetIdx !== -1 ? args[targetIdx + 1] : undefined;

  // Filter out flags to get package names
  const packageFilter = args.filter(
    (a) =>
      !a.startsWith("--") &&
      (targetIdx === -1 || args.indexOf(a) !== targetIdx + 1)
  );

  const skillsDir = target || getOpenClawSkillsDir();

  console.log("");
  console.log("  gICM Skill Pack Installer");
  console.log("  -------------------------");
  console.log(`  Target: ${skillsDir}`);
  console.log("");

  // List mode
  if (listOnly) {
    const installed = checkInstalled(target);
    for (const pkg of GICM_PACKAGES) {
      const status = installed.get(pkg.name) ? "installed" : "not installed";
      const icon = installed.get(pkg.name) ? "+" : "-";
      console.log(
        `  [${icon}] ${pkg.name.padEnd(20)} ${status.padEnd(15)} ${pkg.description}`
      );
    }
    console.log("");
    return;
  }

  // Install mode
  if (dryRun) {
    console.log("  DRY RUN — no files will be written\n");
  }

  const results = installAll({
    targetBase: target,
    filter: packageFilter.length > 0 ? packageFilter : undefined,
    dryRun,
  });

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      const action = dryRun ? "would install" : "installed";
      console.log(`  + ${result.package} — ${action} to ${result.targetDir}`);
    } else {
      failCount++;
      console.log(`  x ${result.package} — FAILED: ${result.error}`);
    }
  }

  console.log("");
  console.log(`  Done: ${successCount} installed, ${failCount} failed`);

  if (!dryRun && successCount > 0) {
    console.log("");
    console.log("  Skills are now available to OpenClaw.");
    console.log(
      "  No restart needed — OpenClaw watches for new skills automatically."
    );
    console.log("");
    console.log(
      "  Your SOUL.md, MEMORY.md, and openclaw.json were NOT modified."
    );
  }

  console.log("");
}

main();
