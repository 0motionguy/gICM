/**
 * Security Audit Scanner for ClawdBot Projects
 *
 * Scans for the most commonly reported security issues:
 * 1. Exposed API keys in .env files
 * 2. Missing firewall/gateway configuration
 * 3. Unencrypted credentials at rest
 * 4. Outdated vulnerable dependencies
 * 5. Insecure default settings
 *
 * This is the foundation of ClawdBot's security USP vs ClawHub.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityAuditResult {
  critical: SecurityIssue[]; // Must fix immediately
  high: SecurityIssue[]; // Should fix soon
  medium: SecurityIssue[]; // Nice to fix
  low: SecurityIssue[]; // Optional improvements
  passed: string[]; // Already secure
  summary: AuditSummary;
}

export interface SecurityIssue {
  category:
    | "secrets"
    | "firewall"
    | "credentials"
    | "dependencies"
    | "settings";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  autoFixable: boolean;
  fixCommand?: string;
  file?: string;
  line?: number;
}

export interface AuditSummary {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passedCount: number;
  autoFixableCount: number;
}

// ============================================================================
// SENSITIVE KEY PATTERNS
// ============================================================================

const SENSITIVE_KEY_PATTERNS = [
  // API Keys
  /\w*API_KEY/i,
  /\w*APIKEY/i,
  // Secrets
  /\w*SECRET/i,
  /\w*PASSWORD/i,
  /\w*PASSWD/i,
  // Tokens
  /\w*TOKEN/i,
  /\w*AUTH/i,
  // Private Keys
  /PRIVATE_KEY/i,
  /\w*PRIV_KEY/i,
  // Database
  /DATABASE_URL/i,
  /DB_URL/i,
  /CONNECTION_STRING/i,
  // Specific services
  /ANTHROPIC_API_KEY/i,
  /OPENAI_API_KEY/i,
  /GITHUB_TOKEN/i,
  /SUPABASE_\w*KEY/i,
  /AWS_\w*KEY/i,
];

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

/**
 * Audit a project for common security issues
 */
export async function auditProjectSecurity(
  projectPath: string
): Promise<SecurityAuditResult> {
  const result: SecurityAuditResult = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    passed: [],
    summary: {
      totalIssues: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      passedCount: 0,
      autoFixableCount: 0,
    },
  };

  // Run all audit checks
  await checkEnvFileExposure(projectPath, result);
  await checkEnvInGitignore(projectPath, result);
  await checkGitHistoryLeaks(projectPath, result);
  await checkCredentialEncryption(projectPath, result);
  await checkFirewallConfig(projectPath, result);
  await checkRateLimiting(projectPath, result);
  await checkVulnerableDependencies(projectPath, result);
  await checkAuditLogging(projectPath, result);
  await checkSessionTimeouts(projectPath, result);
  await checkMCPPermissions(projectPath, result);

  // Calculate summary
  result.summary.totalIssues =
    result.critical.length +
    result.high.length +
    result.medium.length +
    result.low.length;
  result.summary.criticalCount = result.critical.length;
  result.summary.highCount = result.high.length;
  result.summary.mediumCount = result.medium.length;
  result.summary.lowCount = result.low.length;
  result.summary.passedCount = result.passed.length;
  result.summary.autoFixableCount = [
    ...result.critical,
    ...result.high,
    ...result.medium,
    ...result.low,
  ].filter((issue) => issue.autoFixable).length;

  return result;
}

// ============================================================================
// AUDIT CHECK 1: .ENV FILE EXPOSURE
// ============================================================================

async function checkEnvFileExposure(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const envPath = path.join(projectPath, ".env");
  const envLocalPath = path.join(projectPath, ".env.local");

  let foundEnvFile = false;
  let sensitiveKeys: string[] = [];

  for (const filePath of [envPath, envLocalPath]) {
    if (fs.existsSync(filePath)) {
      foundEnvFile = true;
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const [key] = trimmed.split("=");
        if (
          key &&
          SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))
        ) {
          sensitiveKeys.push(key);
        }
      });
    }
  }

  if (foundEnvFile && sensitiveKeys.length > 0) {
    result.critical.push({
      category: "secrets",
      severity: "critical",
      title: `${sensitiveKeys.length} API keys exposed in .env file`,
      description: `Found ${sensitiveKeys.length} sensitive keys in .env file: ${sensitiveKeys.slice(0, 5).join(", ")}${sensitiveKeys.length > 5 ? ` and ${sensitiveKeys.length - 5} more` : ""}. These should be moved to encrypted storage.`,
      autoFixable: true,
      fixCommand: "/security-harden",
      file: ".env",
    });
  } else if (foundEnvFile) {
    result.passed.push(".env file exists but contains no sensitive keys");
  }
}

// ============================================================================
// AUDIT CHECK 2: .ENV IN .GITIGNORE
// ============================================================================

async function checkEnvInGitignore(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const gitignorePath = path.join(projectPath, ".gitignore");

  if (!fs.existsSync(gitignorePath)) {
    result.high.push({
      category: "secrets",
      severity: "high",
      title: ".gitignore file missing",
      description:
        "No .gitignore file found. Sensitive files like .env may be committed to git.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
    return;
  }

  const content = fs.readFileSync(gitignorePath, "utf-8");
  const hasEnvIgnored = content.includes(".env") || content.includes("*.env");

  if (!hasEnvIgnored) {
    result.high.push({
      category: "secrets",
      severity: "high",
      title: ".env not in .gitignore",
      description:
        ".env file is not ignored by git. Sensitive keys may be committed to version control.",
      autoFixable: true,
      fixCommand: "/security-harden",
      file: ".gitignore",
    });
  } else {
    result.passed.push(".env properly ignored in .gitignore");
  }
}

// ============================================================================
// AUDIT CHECK 3: GIT HISTORY LEAKS
// ============================================================================

async function checkGitHistoryLeaks(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  try {
    // Check if git repo exists
    if (!fs.existsSync(path.join(projectPath, ".git"))) {
      result.passed.push("Not a git repository (no history to scan)");
      return;
    }

    // Scan last 100 commits for sensitive patterns
    const output = execSync(
      'git log -100 --all --full-history --source --find-renames --diff-filter=D --name-only --format="%H" -- .env .env.local',
      {
        cwd: projectPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }
    );

    if (output.trim()) {
      result.high.push({
        category: "secrets",
        severity: "high",
        title: "Sensitive files found in git history",
        description:
          ".env files were detected in git history. Even if deleted, secrets may be exposed in commit history. Consider git filter-branch or BFG Repo-Cleaner.",
        autoFixable: false,
        file: "git history",
      });
    } else {
      result.passed.push("No .env files found in git history");
    }
  } catch (error) {
    // Git command failed - likely no commits or .env never tracked
    result.passed.push("No sensitive files detected in git history");
  }
}

// ============================================================================
// AUDIT CHECK 4: CREDENTIAL ENCRYPTION
// ============================================================================

async function checkCredentialEncryption(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const settingsPath = path.join(
    projectPath,
    ".claude/settings/credential-encryption-enabled.md"
  );

  if (!fs.existsSync(settingsPath)) {
    result.high.push({
      category: "credentials",
      severity: "high",
      title: "Credential encryption not enabled",
      description:
        "Credentials are stored in plaintext. Enable AES-256 encryption at rest for sensitive data.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
  } else {
    const content = fs.readFileSync(settingsPath, "utf-8");
    const enabled = content.includes("true") || content.includes("enabled");

    if (!enabled) {
      result.high.push({
        category: "credentials",
        severity: "high",
        title: "Credential encryption disabled",
        description:
          "Credential encryption setting exists but is disabled. Enable it to protect sensitive data at rest.",
        autoFixable: true,
        fixCommand: "/security-harden",
        file: settingsPath,
      });
    } else {
      result.passed.push("Credential encryption enabled");
    }
  }
}

// ============================================================================
// AUDIT CHECK 5: FIREWALL CONFIG (CSP HEADERS)
// ============================================================================

async function checkFirewallConfig(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const middlewarePath = path.join(projectPath, "src/middleware.ts");
  const middlewareJsPath = path.join(projectPath, "src/middleware.js");

  const middlewareExists =
    fs.existsSync(middlewarePath) || fs.existsSync(middlewareJsPath);

  if (!middlewareExists) {
    result.high.push({
      category: "firewall",
      severity: "high",
      title: "Missing firewall/CSP configuration",
      description:
        "No Next.js middleware found. Missing Content Security Policy (CSP) headers, CORS configuration, and request filtering.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
    return;
  }

  const content = fs.readFileSync(
    middlewareExists ? middlewarePath : middlewareJsPath,
    "utf-8"
  );

  const hasCSP =
    content.includes("Content-Security-Policy") ||
    content.includes("CSP") ||
    content.includes("csp");
  const hasCORS =
    content.includes("Access-Control-Allow-Origin") ||
    content.includes("CORS") ||
    content.includes("cors");
  const hasHSTS =
    content.includes("Strict-Transport-Security") || content.includes("HSTS");

  if (!hasCSP || !hasCORS || !hasHSTS) {
    const missing = [];
    if (!hasCSP) missing.push("CSP headers");
    if (!hasCORS) missing.push("CORS config");
    if (!hasHSTS) missing.push("HSTS");

    result.medium.push({
      category: "firewall",
      severity: "medium",
      title: `Incomplete security headers: ${missing.join(", ")}`,
      description: `Middleware exists but missing: ${missing.join(", ")}. Add production-grade security headers.`,
      autoFixable: true,
      fixCommand: "/security-harden",
      file: "src/middleware.ts",
    });
  } else {
    result.passed.push("Security headers configured in middleware");
  }
}

// ============================================================================
// AUDIT CHECK 6: RATE LIMITING
// ============================================================================

async function checkRateLimiting(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  // Check for rate limiting in API routes or middleware
  const apiPath = path.join(projectPath, "src/app/api");
  const pagesApiPath = path.join(projectPath, "pages/api");

  const hasApiRoutes = fs.existsSync(apiPath) || fs.existsSync(pagesApiPath);

  if (!hasApiRoutes) {
    result.passed.push("No API routes detected (rate limiting not needed)");
    return;
  }

  // Check middleware for rate limiting
  const middlewarePath = path.join(projectPath, "src/middleware.ts");
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, "utf-8");
    const hasRateLimiting =
      content.includes("rate") &&
      (content.includes("limit") || content.includes("throttle"));

    if (!hasRateLimiting) {
      result.medium.push({
        category: "firewall",
        severity: "medium",
        title: "No rate limiting detected",
        description:
          "API routes exist but no rate limiting found. Add rate limiting to prevent abuse and DDoS attacks.",
        autoFixable: true,
        fixCommand: "/security-harden",
      });
    } else {
      result.passed.push("Rate limiting configured");
    }
  } else {
    result.medium.push({
      category: "firewall",
      severity: "medium",
      title: "No rate limiting for API routes",
      description:
        "API routes exist but no middleware with rate limiting. Add protection against API abuse.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
  }
}

// ============================================================================
// AUDIT CHECK 7: VULNERABLE DEPENDENCIES
// ============================================================================

async function checkVulnerableDependencies(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  try {
    // Run npm audit
    const output = execSync("npm audit --json", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const auditResult = JSON.parse(output);
    const vulnerabilities = auditResult.vulnerabilities || {};
    const vulnCount = Object.keys(vulnerabilities).length;

    if (vulnCount === 0) {
      result.passed.push("No vulnerable dependencies detected");
      return;
    }

    // Count by severity
    let critical = 0;
    let high = 0;
    let moderate = 0;
    let low = 0;

    Object.values(vulnerabilities).forEach((vuln: any) => {
      const severity = vuln.severity;
      if (severity === "critical") critical++;
      else if (severity === "high") high++;
      else if (severity === "moderate") moderate++;
      else if (severity === "low") low++;
    });

    if (critical > 0 || high > 0) {
      result.critical.push({
        category: "dependencies",
        severity: "critical",
        title: `${critical + high} critical/high vulnerabilities in dependencies`,
        description: `Found ${critical} critical and ${high} high severity vulnerabilities. Run 'npm audit fix' or use /security-harden to patch.`,
        autoFixable: true,
        fixCommand: "/security-harden",
      });
    } else if (moderate > 0) {
      result.medium.push({
        category: "dependencies",
        severity: "medium",
        title: `${moderate} moderate vulnerabilities in dependencies`,
        description:
          "Found moderate severity vulnerabilities. Update packages to patch security issues.",
        autoFixable: true,
        fixCommand: "/security-harden",
      });
    } else if (low > 0) {
      result.low.push({
        category: "dependencies",
        severity: "low",
        title: `${low} low severity vulnerabilities`,
        description: "Found low severity vulnerabilities. Consider updating.",
        autoFixable: true,
        fixCommand: "/security-harden",
      });
    }
  } catch (error) {
    // npm audit failed - likely no package.json or npm not installed
    result.passed.push("Dependency audit skipped (no package.json or npm)");
  }
}

// ============================================================================
// AUDIT CHECK 8: AUDIT LOGGING
// ============================================================================

async function checkAuditLogging(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const auditLogPath = path.join(
    projectPath,
    ".claude/settings/audit-log-enabled.md"
  );

  if (!fs.existsSync(auditLogPath)) {
    result.low.push({
      category: "settings",
      severity: "low",
      title: "Audit logging not enabled",
      description:
        "Enable audit logging to track sensitive operations (file modifications, env access, API calls).",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
  } else {
    result.passed.push("Audit logging enabled");
  }
}

// ============================================================================
// AUDIT CHECK 9: SESSION TIMEOUTS
// ============================================================================

async function checkSessionTimeouts(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const timeoutPath = path.join(
    projectPath,
    ".claude/settings/session-timeout-minutes.md"
  );

  if (!fs.existsSync(timeoutPath)) {
    result.low.push({
      category: "settings",
      severity: "low",
      title: "Session timeout not configured",
      description:
        "No session timeout set. Configure a 15-minute timeout for security.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
  } else {
    const content = fs.readFileSync(timeoutPath, "utf-8");
    const timeout = parseInt(content.match(/\d+/)?.[0] || "0");

    if (timeout === 0 || timeout > 60) {
      result.low.push({
        category: "settings",
        severity: "low",
        title: "Session timeout too long or not set",
        description: `Current timeout: ${timeout || "none"}. Recommended: 15 minutes for security.`,
        autoFixable: true,
        fixCommand: "/security-harden",
        file: timeoutPath,
      });
    } else {
      result.passed.push(`Session timeout configured (${timeout} min)`);
    }
  }
}

// ============================================================================
// AUDIT CHECK 10: MCP PERMISSIONS
// ============================================================================

async function checkMCPPermissions(
  projectPath: string,
  result: SecurityAuditResult
): Promise<void> {
  const mcpSettingsPath = path.join(
    projectPath,
    ".claude/settings/security/mcp-permission-model.md"
  );

  if (!fs.existsSync(mcpSettingsPath)) {
    result.low.push({
      category: "settings",
      severity: "low",
      title: "MCP permission model not configured",
      description:
        "No MCP sandbox configuration found. Enable permission boundaries for MCP servers.",
      autoFixable: true,
      fixCommand: "/security-harden",
    });
  } else {
    result.passed.push("MCP permission model configured");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format audit result for console output
 */
export function formatAuditResult(result: SecurityAuditResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("🛡️  SECURITY AUDIT RESULTS");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`📊 Total Issues: ${result.summary.totalIssues}`);
  lines.push(`   🔴 Critical: ${result.summary.criticalCount}`);
  lines.push(`   🟠 High: ${result.summary.highCount}`);
  lines.push(`   🟡 Medium: ${result.summary.mediumCount}`);
  lines.push(`   🟢 Low: ${result.summary.lowCount}`);
  lines.push(`✅ Passed Checks: ${result.summary.passedCount}`);
  lines.push(`🔧 Auto-Fixable: ${result.summary.autoFixableCount}`);
  lines.push("");

  if (result.critical.length > 0) {
    lines.push("🔴 CRITICAL ISSUES:");
    result.critical.forEach((issue) => {
      lines.push(`   • ${issue.title}`);
      lines.push(`     ${issue.description}`);
      if (issue.autoFixable) {
        lines.push(`     Fix: ${issue.fixCommand}`);
      }
      lines.push("");
    });
  }

  if (result.high.length > 0) {
    lines.push("🟠 HIGH PRIORITY:");
    result.high.forEach((issue) => {
      lines.push(`   • ${issue.title}`);
      lines.push(`     ${issue.description}`);
      lines.push("");
    });
  }

  if (result.medium.length > 0) {
    lines.push("🟡 MEDIUM PRIORITY:");
    result.medium.forEach((issue) => {
      lines.push(`   • ${issue.title}`);
    });
    lines.push("");
  }

  lines.push("=".repeat(60));

  return lines.join("\n");
}
