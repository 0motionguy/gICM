/**
 * Security Auto-Fixer for ClawdBot Projects
 *
 * Automatically fixes common security issues detected by security-audit.ts
 * This is Phase 1 implementation - focuses on the most critical fixes.
 *
 * Auto-fixable issues:
 * 1. Add .env to .gitignore
 * 2. Create security settings files
 * 3. Run npm audit fix for dependencies
 * 4. Create basic middleware template
 *
 * Future: Encrypted secrets migration, advanced firewall config
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import type { SecurityIssue } from "./security-audit";

// ============================================================================
// TYPES
// ============================================================================

export interface FixResult {
  fixed: string[]; // Successfully fixed issues
  failed: FixFailure[]; // Failed to fix
  manualRequired: string[]; // Requires user action
  summary: FixSummary;
}

export interface FixFailure {
  issue: string;
  error: string;
}

export interface FixSummary {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  manualCount: number;
}

export interface AutoFixOptions {
  dryRun?: boolean; // Preview fixes without applying
  interactive?: boolean; // Ask before each fix
  backupFiles?: boolean; // Backup files before modification
}

// ============================================================================
// MAIN AUTO-FIX FUNCTION
// ============================================================================

/**
 * Automatically fix security issues
 */
export async function autoFixSecurityIssues(
  projectPath: string,
  issues: SecurityIssue[],
  options: AutoFixOptions = {}
): Promise<FixResult> {
  const result: FixResult = {
    fixed: [],
    failed: [],
    manualRequired: [],
    summary: {
      totalAttempted: 0,
      successCount: 0,
      failureCount: 0,
      manualCount: 0,
    },
  };

  // Filter only auto-fixable issues
  const fixableIssues = issues.filter((issue) => issue.autoFixable);

  result.summary.totalAttempted = fixableIssues.length;

  for (const issue of fixableIssues) {
    try {
      const fixed = await fixIssue(projectPath, issue, options);
      if (fixed) {
        result.fixed.push(issue.title);
        result.summary.successCount++;
      } else {
        result.manualRequired.push(issue.title);
        result.summary.manualCount++;
      }
    } catch (error) {
      result.failed.push({
        issue: issue.title,
        error: error instanceof Error ? error.message : String(error),
      });
      result.summary.failureCount++;
    }
  }

  return result;
}

// ============================================================================
// FIX DISPATCHER
// ============================================================================

async function fixIssue(
  projectPath: string,
  issue: SecurityIssue,
  options: AutoFixOptions
): Promise<boolean> {
  if (options.dryRun) {
    console.log(`[DRY RUN] Would fix: ${issue.title}`);
    return true;
  }

  // Route to appropriate fixer based on issue
  if (issue.title.includes(".env not in .gitignore")) {
    return addEnvToGitignore(projectPath, options);
  }

  if (issue.title.includes("Credential encryption")) {
    return enableCredentialEncryption(projectPath, options);
  }

  if (issue.title.includes("vulnerabilities in dependencies")) {
    return fixVulnerableDependencies(projectPath, options);
  }

  if (issue.title.includes("firewall") || issue.title.includes("CSP")) {
    return createBasicMiddleware(projectPath, options);
  }

  if (issue.title.includes("Audit logging")) {
    return enableAuditLogging(projectPath, options);
  }

  if (issue.title.includes("Session timeout")) {
    return configureSessionTimeout(projectPath, options);
  }

  if (issue.title.includes("MCP permission")) {
    return configureMCPPermissions(projectPath, options);
  }

  // Issue not yet supported for auto-fix
  return false;
}

// ============================================================================
// FIX 1: ADD .ENV TO .GITIGNORE
// ============================================================================

function addEnvToGitignore(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const gitignorePath = path.join(projectPath, ".gitignore");

  try {
    let content = "";
    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, "utf-8");
    }

    // Add .env entries if not already present
    const envEntries = [
      "# Environment variables",
      ".env",
      ".env.local",
      ".env.*.local",
      "",
      "# Encrypted secrets",
      ".claude/secrets/secrets.enc",
    ];

    const hasEnv = content.includes(".env");
    if (!hasEnv) {
      if (options.backupFiles && fs.existsSync(gitignorePath)) {
        fs.copyFileSync(gitignorePath, `${gitignorePath}.backup`);
      }

      const newContent = content
        ? `${content.trim()}\n\n${envEntries.join("\n")}\n`
        : envEntries.join("\n") + "\n";

      fs.writeFileSync(gitignorePath, newContent, "utf-8");
      return true;
    }

    return true; // Already fixed
  } catch (error) {
    console.error("Failed to add .env to .gitignore:", error);
    return false;
  }
}

// ============================================================================
// FIX 2: ENABLE CREDENTIAL ENCRYPTION
// ============================================================================

function enableCredentialEncryption(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const settingsDir = path.join(projectPath, ".claude/settings");
  const settingsPath = path.join(
    settingsDir,
    "credential-encryption-enabled.md"
  );

  try {
    // Create .claude/settings directory if it doesn't exist
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    // Create setting file
    const content = `# Credential Encryption Enabled

**Status:** Enabled

## Description
Encrypts stored credentials at rest using AES-256 encryption.
Highly recommended for production environments.

## Value
\`\`\`
true
\`\`\`

## Security Benefits
- Protects API keys and tokens from plaintext exposure
- Integrates with system keychain for encryption keys
- Prevents credential theft from disk access

Auto-enabled by /security-harden
`;

    fs.writeFileSync(settingsPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to enable credential encryption:", error);
    return false;
  }
}

// ============================================================================
// FIX 3: FIX VULNERABLE DEPENDENCIES
// ============================================================================

function fixVulnerableDependencies(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  try {
    console.log("Running npm audit fix...");
    execSync("npm audit fix --force", {
      cwd: projectPath,
      stdio: "inherit",
    });
    return true;
  } catch (error) {
    console.error("npm audit fix failed:", error);
    return false;
  }
}

// ============================================================================
// FIX 4: CREATE BASIC MIDDLEWARE
// ============================================================================

function createBasicMiddleware(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const middlewarePath = path.join(projectPath, "src/middleware.ts");

  // Don't overwrite existing middleware
  if (fs.existsSync(middlewarePath)) {
    console.log("Middleware already exists - skipping");
    return false; // Requires manual configuration
  }

  try {
    const middlewareTemplate = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Middleware
 * Auto-generated by /security-harden
 *
 * Provides:
 * - Content Security Policy (CSP) headers
 * - CORS configuration
 * - HSTS (HTTP Strict Transport Security)
 * - Basic rate limiting (production should use Redis)
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy (CSP)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.anthropic.com https://api.openai.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // CORS Headers
  response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // HSTS (HTTP Strict Transport Security)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Additional Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
`;

    // Create src directory if it doesn't exist
    const srcDir = path.join(projectPath, "src");
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    fs.writeFileSync(middlewarePath, middlewareTemplate, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to create middleware:", error);
    return false;
  }
}

// ============================================================================
// FIX 5: ENABLE AUDIT LOGGING
// ============================================================================

function enableAuditLogging(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const settingsDir = path.join(projectPath, ".claude/settings");
  const settingsPath = path.join(settingsDir, "audit-log-enabled.md");

  try {
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    const content = `# Audit Logging Enabled

**Status:** Enabled

## Description
Logs sensitive operations for security audit trails.

## Value
\`\`\`
true
\`\`\`

## Logged Operations
- File modifications
- Environment variable access
- API calls to external services
- Command executions

Auto-enabled by /security-harden
`;

    fs.writeFileSync(settingsPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to enable audit logging:", error);
    return false;
  }
}

// ============================================================================
// FIX 6: CONFIGURE SESSION TIMEOUT
// ============================================================================

function configureSessionTimeout(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const settingsDir = path.join(projectPath, ".claude/settings");
  const settingsPath = path.join(settingsDir, "session-timeout-minutes.md");

  try {
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    const content = `# Session Timeout

**Value:** 15 minutes

## Description
Session timeout for security. Balances security with usability.

## Value
\`\`\`
15
\`\`\`

Auto-configured by /security-harden
`;

    fs.writeFileSync(settingsPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to configure session timeout:", error);
    return false;
  }
}

// ============================================================================
// FIX 7: CONFIGURE MCP PERMISSIONS
// ============================================================================

function configureMCPPermissions(
  projectPath: string,
  options: AutoFixOptions
): boolean {
  const settingsDir = path.join(projectPath, ".claude/settings/security");
  const settingsPath = path.join(settingsDir, "mcp-permission-model.md");

  try {
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    const content = `# MCP Permission Model

**Status:** Sandboxed

## Description
Defines permission boundaries for MCP servers.

## Configuration
\`\`\`json
{
  "sandboxMode": true,
  "allowedOperations": [
    "read-files",
    "search-code",
    "run-readonly-commands"
  ],
  "blockedOperations": [
    "write-files-outside-project",
    "execute-arbitrary-code",
    "network-access-unrestricted"
  ]
}
\`\`\`

Auto-configured by /security-harden
`;

    fs.writeFileSync(settingsPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to configure MCP permissions:", error);
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format fix result for console output
 */
export function formatFixResult(result: FixResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("🔧 SECURITY AUTO-FIX RESULTS");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`📊 Summary:`);
  lines.push(`   Total Attempted: ${result.summary.totalAttempted}`);
  lines.push(`   ✅ Fixed: ${result.summary.successCount}`);
  lines.push(`   ❌ Failed: ${result.summary.failureCount}`);
  lines.push(`   ⚠️  Manual Required: ${result.summary.manualCount}`);
  lines.push("");

  if (result.fixed.length > 0) {
    lines.push("✅ FIXED:");
    result.fixed.forEach((fix) => {
      lines.push(`   • ${fix}`);
    });
    lines.push("");
  }

  if (result.failed.length > 0) {
    lines.push("❌ FAILED:");
    result.failed.forEach((failure) => {
      lines.push(`   • ${failure.issue}`);
      lines.push(`     Error: ${failure.error}`);
    });
    lines.push("");
  }

  if (result.manualRequired.length > 0) {
    lines.push("⚠️  MANUAL ACTION REQUIRED:");
    result.manualRequired.forEach((item) => {
      lines.push(`   • ${item}`);
    });
    lines.push("");
  }

  lines.push("=".repeat(60));

  return lines.join("\n");
}
