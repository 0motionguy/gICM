/**
 * Security Scanner for ClawdBot Marketplace
 *
 * Scans registry items for malicious patterns and security vulnerabilities.
 * Key differentiator vs ClawHub: prevents malware from reaching users.
 */

import type { RegistryItem } from "../types/registry";

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityScanResult {
  threatLevel: "none" | "low" | "medium" | "high" | "critical";
  securityScore: number; // 0-100
  vulnerabilities: Vulnerability[];
  malwarePatterns: string[];
  requiredPermissions: string[];
  sandboxViolations: string[];
  lastScanned: string; // ISO timestamp
}

export interface Vulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  pattern?: string;
  line?: number;
}

export interface MalwareDetection {
  pattern: string;
  matches: RegExpMatchArray[];
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export interface SandboxViolation {
  type: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface DependencyScan {
  vulnerablePackages: string[];
  outdatedPackages: string[];
  flaggedPackages: string[];
}

// ============================================================================
// MALWARE PATTERN LIBRARY
// ============================================================================

const MALWARE_PATTERNS = {
  codeExecution: {
    patterns: [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /exec\s*\(/gi,
      /execSync\s*\(/gi,
      /execFile\s*\(/gi,
      /spawn\s*\(/gi,
    ],
    severity: "critical" as const,
    description:
      "Detected dynamic code execution which can be used for arbitrary code execution",
  },

  dataExfiltration: {
    patterns: [
      // Suspicious external API calls (excluding known safe domains)
      /fetch\s*\(\s*["'`]https?:\/\/(?!api\.anthropic|api\.openai|api\.google|githubusercontent\.com)/gi,
      /XMLHttpRequest/gi,
      /navigator\.sendBeacon/gi,
      /WebSocket\s*\(\s*["'`]wss?:\/\/(?!localhost)/gi,
    ],
    severity: "high" as const,
    description: "Detected potential data exfiltration to external servers",
  },

  fileSystemAccess: {
    patterns: [
      /fs\.writeFile/gi,
      /fs\.writeFileSync/gi,
      /fs\.unlink/gi,
      /fs\.unlinkSync/gi,
      /fs\.rm/gi,
      /fs\.rmSync/gi,
      /fs\.rmdir/gi,
      /fs\.rmdirSync/gi,
      /fs\.rename/gi,
      /fs\.renameSync/gi,
    ],
    severity: "medium" as const,
    description:
      "Detected file system write/delete operations which may modify user files",
  },

  cryptoMining: {
    patterns: [
      /CryptoNight|Monero|coinhive/gi,
      /cryptonight|xmrig/gi,
      /stratum\+tcp/gi,
    ],
    severity: "critical" as const,
    description: "Detected cryptocurrency mining code",
  },

  obfuscation: {
    patterns: [
      /atob\s*\(|btoa\s*\(/gi, // Base64 encoding
      /String\.fromCharCode/gi, // Character code obfuscation
      /\\x[0-9a-f]{2}/gi, // Hex escape sequences (more than 10 in a row is suspicious)
      /\\u[0-9a-f]{4}/gi, // Unicode escape sequences
    ],
    severity: "medium" as const,
    description: "Detected code obfuscation which may hide malicious intent",
  },

  environmentAccess: {
    patterns: [
      /process\.env\[/gi,
      /process\.env\.(?!NODE_ENV|PUBLIC_|NEXT_PUBLIC_)/gi, // Accessing non-public env vars
      /localStorage\.setItem/gi,
      /sessionStorage\.setItem/gi,
    ],
    severity: "low" as const,
    description:
      "Detected environment variable or storage access (verify necessary)",
  },

  networkRequests: {
    patterns: [
      /net\.createServer/gi,
      /http\.createServer/gi,
      /https\.createServer/gi,
      /dgram\.createSocket/gi, // UDP sockets
    ],
    severity: "medium" as const,
    description:
      "Detected network server creation (may open unauthorized ports)",
  },

  processManipulation: {
    patterns: [
      /process\.exit/gi,
      /process\.kill/gi,
      /process\.abort/gi,
      /child_process/gi,
    ],
    severity: "high" as const,
    description:
      "Detected process manipulation which may affect system stability",
  },
};

// Known vulnerable npm packages (sample list - expand in production)
const VULNERABLE_PACKAGES = [
  "event-stream@3.3.6", // Malicious version
  "flatmap-stream", // Malicious dependency
  "eslint-scope@3.7.2", // Compromised version
];

// Packages flagged for other security concerns
const FLAGGED_PACKAGES = [
  "colors", // Protestware incident
  "faker", // Protestware incident
  "node-ipc", // Protestware incident
];

// ============================================================================
// CORE SCANNING FUNCTIONS
// ============================================================================

/**
 * Main entry point: Scan a registry item for security issues
 */
export function scanRegistryItem(item: RegistryItem): SecurityScanResult {
  const vulnerabilities: Vulnerability[] = [];
  const malwarePatterns: string[] = [];
  const requiredPermissions: string[] = [];
  const sandboxViolations: string[] = [];

  // Scan item code/scripts for malware patterns
  const codeToScan = [
    item.install,
    item.setup || "",
    item.longDescription || "",
    ...(item.files || []),
  ].join("\n");

  const malwareFindings = detectMalwarePatterns(codeToScan);
  malwareFindings.forEach((finding) => {
    vulnerabilities.push({
      id: `MW-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      severity: finding.severity,
      description: finding.description,
      pattern: finding.pattern,
    });
    malwarePatterns.push(finding.pattern);
  });

  // Scan dependencies for known vulnerabilities
  if (item.dependencies && item.dependencies.length > 0) {
    const depScan = scanDependencies(item.dependencies);
    depScan.vulnerablePackages.forEach((pkg) => {
      vulnerabilities.push({
        id: `DEP-${pkg.replace(/[^a-z0-9]/gi, "-")}`,
        severity: "high",
        description: `Vulnerable dependency detected: ${pkg}`,
      });
    });
    depScan.flaggedPackages.forEach((pkg) => {
      vulnerabilities.push({
        id: `FLAG-${pkg.replace(/[^a-z0-9]/gi, "-")}`,
        severity: "medium",
        description: `Flagged dependency detected: ${pkg}`,
      });
    });
  }

  // Validate sandbox compliance (for items with codeExecution)
  if (item.codeExecution) {
    const violations = validateSandboxCompliance(item);
    violations.forEach((violation) => {
      vulnerabilities.push({
        id: `SBX-${violation.type}`,
        severity: violation.severity,
        description: violation.description,
      });
      sandboxViolations.push(violation.type);
    });
  }

  // Determine required permissions based on findings
  if (malwareFindings.some((f) => f.pattern.includes("fs."))) {
    requiredPermissions.push("file-access");
  }
  if (
    malwareFindings.some(
      (f) => f.pattern.includes("fetch") || f.pattern.includes("WebSocket")
    )
  ) {
    requiredPermissions.push("network");
  }
  if (
    malwareFindings.some(
      (f) => f.pattern.includes("exec") || f.pattern.includes("spawn")
    )
  ) {
    requiredPermissions.push("subprocess");
  }

  // Calculate security score and threat level
  const securityScore = calculateSecurityScore(vulnerabilities);
  const threatLevel = determineThreatLevel(vulnerabilities);

  return {
    threatLevel,
    securityScore,
    vulnerabilities,
    malwarePatterns,
    requiredPermissions,
    sandboxViolations,
    lastScanned: new Date().toISOString(),
  };
}

/**
 * Detect malware patterns in code
 */
export function detectMalwarePatterns(code: string): MalwareDetection[] {
  const detections: MalwareDetection[] = [];

  Object.entries(MALWARE_PATTERNS).forEach(([category, config]) => {
    config.patterns.forEach((pattern) => {
      const matches = Array.from(code.matchAll(pattern));
      if (matches.length > 0) {
        // Filter obfuscation patterns - only flag if many occurrences
        if (category === "obfuscation" && matches.length < 10) {
          return; // Likely not malicious obfuscation
        }

        detections.push({
          pattern: pattern.source,
          matches,
          severity: config.severity,
          description: `${config.description} (${matches.length} occurrence${matches.length > 1 ? "s" : ""})`,
        });
      }
    });
  });

  return detections;
}

/**
 * Validate sandbox compliance for items with code execution
 */
export function validateSandboxCompliance(
  item: RegistryItem
): SandboxViolation[] {
  const violations: SandboxViolation[] = [];

  if (!item.codeExecution) {
    return violations;
  }

  const { sandbox, networkAccess, maxExecutionTime, memoryLimit } =
    item.codeExecution;

  // Check if sandbox is disabled
  if (sandbox === false) {
    violations.push({
      type: "no-sandbox",
      description: "Code execution without sandbox protection",
      severity: "critical",
    });
  }

  // Check if network access is enabled
  if (networkAccess === true) {
    violations.push({
      type: "network-enabled",
      description: "Code execution with network access enabled",
      severity: "medium",
    });
  }

  // Check execution time limits
  if (!maxExecutionTime || maxExecutionTime > 60000) {
    // > 60 seconds
    violations.push({
      type: "excessive-execution-time",
      description: "No execution time limit or limit exceeds 60 seconds",
      severity: "low",
    });
  }

  // Check memory limits
  if (!memoryLimit || memoryLimit > 512) {
    // > 512MB
    violations.push({
      type: "excessive-memory-limit",
      description: "No memory limit or limit exceeds 512MB",
      severity: "low",
    });
  }

  return violations;
}

/**
 * Scan dependencies for known vulnerabilities
 */
export function scanDependencies(dependencies: string[]): DependencyScan {
  const vulnerablePackages: string[] = [];
  const outdatedPackages: string[] = [];
  const flaggedPackages: string[] = [];

  dependencies.forEach((dep) => {
    // Check against known vulnerable packages
    const isVulnerable = VULNERABLE_PACKAGES.some((vuln) =>
      dep.includes(vuln.split("@")[0])
    );
    if (isVulnerable) {
      vulnerablePackages.push(dep);
    }

    // Check against flagged packages
    const isFlagged = FLAGGED_PACKAGES.some((flagged) => dep.includes(flagged));
    if (isFlagged) {
      flaggedPackages.push(dep);
    }

    // TODO: Add version checking for outdated packages
    // This would require fetching latest versions from npm registry
  });

  return {
    vulnerablePackages,
    outdatedPackages,
    flaggedPackages,
  };
}

/**
 * Calculate security score (0-100) based on findings
 */
export function calculateSecurityScore(
  vulnerabilities: Vulnerability[]
): number {
  let score = 100;

  vulnerabilities.forEach((vuln) => {
    switch (vuln.severity) {
      case "critical":
        score -= 40;
        break;
      case "high":
        score -= 20;
        break;
      case "medium":
        score -= 10;
        break;
      case "low":
        score -= 5;
        break;
    }
  });

  return Math.max(0, score); // Ensure score doesn't go negative
}

/**
 * Determine threat level based on vulnerabilities
 */
export function determineThreatLevel(
  vulnerabilities: Vulnerability[]
): "none" | "low" | "medium" | "high" | "critical" {
  if (vulnerabilities.length === 0) {
    return "none";
  }

  const hasCritical = vulnerabilities.some((v) => v.severity === "critical");
  if (hasCritical) {
    return "critical";
  }

  const highCount = vulnerabilities.filter((v) => v.severity === "high").length;
  if (highCount >= 3) {
    return "critical";
  }
  if (highCount >= 1) {
    return "high";
  }

  const mediumCount = vulnerabilities.filter(
    (v) => v.severity === "medium"
  ).length;
  if (mediumCount >= 5) {
    return "high";
  }
  if (mediumCount >= 2) {
    return "medium";
  }

  const lowCount = vulnerabilities.filter((v) => v.severity === "low").length;
  if (lowCount >= 10) {
    return "medium";
  }
  if (lowCount >= 1) {
    return "low";
  }

  return "none";
}

/**
 * Check if item is safe to use
 */
export function isSafeItem(scanResult: SecurityScanResult): boolean {
  return scanResult.threatLevel === "none" || scanResult.threatLevel === "low";
}

/**
 * Check if item should be blocked from marketplace
 */
export function shouldBlockItem(scanResult: SecurityScanResult): boolean {
  return scanResult.threatLevel === "critical";
}
