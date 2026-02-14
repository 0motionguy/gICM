/**
 * @gicm/installer — Install gICM skill pack into OpenClaw
 *
 * Copies SKILL.md files from each @gicm/* package into ~/.openclaw/skills/
 * so OpenClaw discovers them automatically. Does NOT modify openclaw.json,
 * SOUL.md, MEMORY.md, or any other OpenClaw core files.
 */

import { homedir, platform } from "os";
import { join, resolve, dirname } from "path";
import { existsSync, mkdirSync, cpSync, readdirSync, readFileSync } from "fs";

export interface SkillPackage {
  name: string;
  skillDir: string;
  description: string;
}

export interface InstallResult {
  package: string;
  targetDir: string;
  success: boolean;
  error?: string;
}

export interface InstallerConfig {
  /** Override target directory (default: ~/.openclaw/skills/) */
  targetBase?: string;
  /** Only install specific packages */
  filter?: string[];
  /** Dry run — report what would happen without writing */
  dryRun?: boolean;
}

/**
 * All 11 gICM packages that ship skills.
 */
export const GICM_PACKAGES: SkillPackage[] = [
  {
    name: "gicm-router",
    skillDir: "@gicm/router",
    description: "Token-aware LLM routing",
  },
  {
    name: "gicm-goldfish",
    skillDir: "@gicm/goldfish",
    description: "Token budget management",
  },
  {
    name: "gicm-soul",
    skillDir: "@gicm/soul",
    description: "Dynamic identity fragments",
  },
  {
    name: "gicm-memory",
    skillDir: "@gicm/memory",
    description: "4-layer memory engine",
  },
  {
    name: "gicm-cache",
    skillDir: "@gicm/cache",
    description: "3-layer prompt caching",
  },
  {
    name: "gicm-context",
    skillDir: "@gicm/context",
    description: "Precision context injection",
  },
  {
    name: "gicm-shield",
    skillDir: "@gicm/shield",
    description: "6-layer security stack",
  },
  {
    name: "gicm-orchestrator",
    skillDir: "@gicm/orchestrator",
    description: "Multi-agent orchestration",
  },
  {
    name: "gicm-dashboard",
    skillDir: "@gicm/dashboard",
    description: "Dashboard components",
  },
  {
    name: "gicm-polyclaw-pro",
    skillDir: "@gicm/polyclaw-pro",
    description: "7-strategy prediction market engine",
  },
  {
    name: "opus67",
    skillDir: "@gicm/opus67",
    description: "Self-evolving AI runtime",
  },
];

/**
 * Get the default OpenClaw skills directory.
 * Works on macOS, Linux, Android (Termux), and Windows (WSL2).
 */
export function getOpenClawSkillsDir(): string {
  const home = homedir();
  return join(home, ".openclaw", "skills");
}

/**
 * Resolve the skill/ directory for a given package.
 * Looks in node_modules/@gicm/<name>/skill/ or a local monorepo path.
 */
export function resolveSkillDir(packageName: string): string | null {
  // Try node_modules first (installed via npm)
  const nodeModulesPath = join(
    "node_modules",
    "@gicm",
    packageName.replace("gicm-", ""),
    "skill"
  );
  if (existsSync(nodeModulesPath)) {
    return resolve(nodeModulesPath);
  }

  // Try monorepo structure (packages/gicm-<name>/skill/)
  const monoRepoPath = join("packages", packageName, "skill");
  if (existsSync(monoRepoPath)) {
    return resolve(monoRepoPath);
  }

  // Try relative to this file (when installed as dependency)
  const relativePath = join(dirname(dirname(__dirname)), packageName, "skill");
  if (existsSync(relativePath)) {
    return resolve(relativePath);
  }

  return null;
}

/**
 * Install a single skill package to the OpenClaw skills directory.
 */
export function installSkill(
  pkg: SkillPackage,
  targetBase: string,
  dryRun = false
): InstallResult {
  const skillSource = resolveSkillDir(pkg.name);

  if (!skillSource) {
    return {
      package: pkg.name,
      targetDir: "",
      success: false,
      error: `Could not find skill/ directory for ${pkg.name}`,
    };
  }

  // Check that SKILL.md exists in source
  const skillMdPath = join(skillSource, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    return {
      package: pkg.name,
      targetDir: "",
      success: false,
      error: `No SKILL.md found in ${skillSource}`,
    };
  }

  const targetDir = join(targetBase, pkg.name);

  if (dryRun) {
    return {
      package: pkg.name,
      targetDir,
      success: true,
    };
  }

  try {
    // Create target directory
    mkdirSync(targetDir, { recursive: true });

    // Copy entire skill/ directory contents to target
    cpSync(skillSource, targetDir, { recursive: true });

    return {
      package: pkg.name,
      targetDir,
      success: true,
    };
  } catch (err) {
    return {
      package: pkg.name,
      targetDir,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Install all gICM skills (or a filtered subset) into OpenClaw.
 */
export function installAll(config: InstallerConfig = {}): InstallResult[] {
  const targetBase = config.targetBase || getOpenClawSkillsDir();
  const dryRun = config.dryRun || false;

  let packages = GICM_PACKAGES;
  if (config.filter && config.filter.length > 0) {
    const filterSet = new Set(
      config.filter.map((f) => f.replace("@gicm/", "gicm-"))
    );
    packages = packages.filter((p) => filterSet.has(p.name));
  }

  // Ensure base target directory exists
  if (!dryRun) {
    mkdirSync(targetBase, { recursive: true });
  }

  return packages.map((pkg) => installSkill(pkg, targetBase, dryRun));
}

/**
 * Check which gICM skills are currently installed in OpenClaw.
 */
export function checkInstalled(targetBase?: string): Map<string, boolean> {
  const base = targetBase || getOpenClawSkillsDir();
  const result = new Map<string, boolean>();

  for (const pkg of GICM_PACKAGES) {
    const skillMd = join(base, pkg.name, "SKILL.md");
    result.set(pkg.name, existsSync(skillMd));
  }

  return result;
}
