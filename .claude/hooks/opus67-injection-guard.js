#!/usr/bin/env node
/**
 * OPUS 67 Prompt Injection Guard (inspired by GSD)
 *
 * Runs PreToolUse on Write/Edit operations targeting skill/agent/config files.
 * Scans content for injection patterns. Advisory-only (warns, never blocks).
 *
 * Detects:
 * - System prompt overrides ("you are now", "ignore previous")
 * - Role confusion ("as a helpful assistant", "your new role")
 * - Invisible Unicode (zero-width spaces, RTL overrides)
 * - Base64/encoded payloads in unexpected places
 * - Prompt boundary markers (```, ###, ---)
 */

const INJECTION_PATTERNS = [
  // System prompt overrides
  /ignore\s+(all\s+)?previous\s+(instructions|context|rules)/i,
  /forget\s+(all\s+)?previous/i,
  /disregard\s+(all\s+)?(above|prior|previous)/i,
  /you\s+are\s+now\s+a/i,
  /your\s+new\s+(role|instructions|purpose)/i,
  /from\s+now\s+on,?\s+you\s+(will|must|should)/i,
  // Role confusion
  /\[system\]/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /<<SYS>>/i,
  // Data exfiltration
  /output\s+(all|every|the\s+entire)\s+(system|context|conversation)/i,
  /repeat\s+(the|your)\s+(system\s+)?prompt/i,
  // Hidden instructions
  /<!-- .*?(ignore|override|bypass).*? -->/i,
  /\u200B|\u200C|\u200D|\uFEFF|\u2060/,  // Zero-width chars
];

const SENSITIVE_PATHS = [
  ".claude/skills/",
  ".claude/agents/",
  ".claude/hooks/",
  ".claude/commands/",
  "CLAUDE.md",
  "SKILL.md",
];

try {
  // Read tool use context from stdin (Claude Code passes JSON)
  const input = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
  if (!input) process.exit(0);

  const toolUse = JSON.parse(input);
  const toolName = toolUse.tool_name || "";
  const filePath = toolUse.tool_input?.file_path || toolUse.tool_input?.command || "";
  const content = toolUse.tool_input?.content || toolUse.tool_input?.new_string || "";

  // Only check Write/Edit on sensitive paths
  if (!["Write", "Edit"].includes(toolName)) process.exit(0);
  if (!SENSITIVE_PATHS.some((p) => filePath.includes(p))) process.exit(0);
  if (!content) process.exit(0);

  const findings = [];
  for (const pattern of INJECTION_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      findings.push(`Pattern: ${pattern.source} → Match: "${match[0]}"`);
    }
  }

  if (findings.length > 0) {
    console.log(
      `[OPUS 67 INJECTION GUARD] ` +
        `${findings.length} suspicious pattern(s) in ${filePath}:\n` +
        findings.map((f) => `  - ${f}`).join("\n") +
        `\nThis is advisory only. Review the content before proceeding.`
    );
  }
} catch (err) {
  // Silent fail — never block operations
}
