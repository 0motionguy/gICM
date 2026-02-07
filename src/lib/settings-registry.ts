import type { Setting } from "@/types/registry";

// ============================================================================
// SETTINGS REGISTRY (48 Total across 6 Categories)
// ============================================================================

export const SETTINGS: Setting[] = [
  // === PERFORMANCE SETTINGS (12) ===
  {
    id: "mcp-timeout-duration",
    kind: "setting",
    name: "MCP Timeout Duration",
    slug: "mcp-timeout-duration",
    description:
      "Maximum time to wait for MCP server responses before timeout (milliseconds). Recommended: 30000ms production, 60000ms development.",
    longDescription:
      "Controls how long Claude will wait for responses from MCP servers before timing out. Lower values improve responsiveness but may cause failures on slow networks. Higher values increase reliability but may cause delays. Affects all MCP integrations including Supabase, GitHub, Alchemy, and custom MCP servers.",
    category: "Performance",
    tags: ["MCP", "Timeout", "Performance", "Network"],
    dependencies: [],
    files: [".claude/settings/performance/mcp-timeout-duration.md"],
    install:
      "npx @clawdbot/cli add setting/mcp-timeout-duration",
    settingType: "number",
    defaultValue: 30000,
    affectedComponents: [
      "supabase-mcp",
      "github-mcp",
      "alchemy-mcp",
      "infura-mcp",
      "thegraph-mcp",
      "quicknode-mcp",
      "tenderly-mcp",
      "context7-mcp",
      "e2b-mcp",
      "filesystem-mcp",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 5000,
      max: 300000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "mcp-retry-attempts",
    kind: "setting",
    name: "MCP Retry Attempts",
    slug: "mcp-retry-attempts",
    description:
      "Maximum number of retry attempts for failed MCP calls. Recommended: 3 for production, 1 for development.",
    longDescription:
      "Determines how many times Claude will retry a failed MCP server call before giving up. Higher values increase reliability but may cause delays. Set to 0 to disable retries.",
    category: "Performance",
    tags: ["MCP", "Retry", "Reliability", "Performance"],
    dependencies: [],
    files: [".claude/settings/performance/mcp-retry-attempts.md"],
    install:
      "npx @clawdbot/cli add setting/mcp-retry-attempts",
    settingType: "number",
    defaultValue: 3,
    affectedComponents: [
      "supabase-mcp",
      "github-mcp",
      "alchemy-mcp",
      "infura-mcp",
      "thegraph-mcp",
      "quicknode-mcp",
      "tenderly-mcp",
      "context7-mcp",
      "e2b-mcp",
      "filesystem-mcp",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 0,
      max: 10,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "skill-cache-ttl",
    kind: "setting",
    name: "Skill Cache TTL",
    slug: "skill-cache-ttl",
    description:
      "Time to live for cached skill content in seconds. Recommended: 3600 (1 hour) for production.",
    longDescription:
      "Controls how long skill content is cached before being reloaded. Helps reduce token usage by caching progressive disclosure content. Set to 0 to disable caching.",
    category: "Performance",
    tags: ["Skills", "Cache", "Performance", "Memory"],
    dependencies: [],
    files: [".claude/settings/performance/skill-cache-ttl.md"],
    install:
      "npx @clawdbot/cli add setting/skill-cache-ttl",
    settingType: "number",
    defaultValue: 3600,
    affectedComponents: [], // Affects all skills
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 0,
      max: 86400,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "parallel-tool-execution",
    kind: "setting",
    name: "Parallel Tool Execution",
    slug: "parallel-tool-execution",
    description:
      "Enable parallel execution of independent tool calls. Significantly improves performance for multi-step operations.",
    longDescription:
      "When enabled, Claude can execute multiple independent tool calls simultaneously instead of sequentially. Dramatically improves performance for operations like reading multiple files, running parallel searches, or making concurrent API calls.",
    category: "Performance",
    tags: ["Tools", "Parallel", "Performance", "Optimization"],
    dependencies: [],
    files: [".claude/settings/performance/parallel-tool-execution.md"],
    install:
      "npx @clawdbot/cli add setting/parallel-tool-execution",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [
      "project-coordinator",
      "fullstack-orchestrator",
      "context-sculptor",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "token-budget-limit",
    kind: "setting",
    name: "Token Budget Limit",
    slug: "token-budget-limit",
    description:
      "Maximum tokens per request. Recommended: 200000 for complex tasks, 100000 for standard operations.",
    longDescription:
      "Sets the maximum number of tokens that can be used in a single request. Helps control costs and prevents runaway token usage. Lower limits force more efficient prompting.",
    category: "Performance",
    tags: ["Tokens", "Budget", "Cost", "Limits"],
    dependencies: [],
    files: [".claude/settings/performance/token-budget-limit.md"],
    install:
      "npx @clawdbot/cli add setting/token-budget-limit",
    settingType: "number",
    defaultValue: 200000,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 10000,
      max: 200000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "response-streaming",
    kind: "setting",
    name: "Response Streaming",
    slug: "response-streaming",
    description:
      "Enable streaming responses for real-time output. Improves perceived performance and user experience.",
    longDescription:
      "When enabled, Claude will stream responses token by token instead of waiting for the complete response. Provides immediate feedback and better user experience for long-running operations.",
    category: "Performance",
    tags: ["Streaming", "UX", "Performance", "Real-time"],
    dependencies: [],
    files: [".claude/settings/performance/response-streaming.md"],
    install:
      "npx @clawdbot/cli add setting/response-streaming",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "context-window-size",
    kind: "setting",
    name: "Context Window Size",
    slug: "context-window-size",
    description:
      "Maximum context window size in tokens. Recommended: 200000 for Opus/Sonnet.",
    longDescription:
      "Controls the maximum size of the context window. Larger windows allow more context but use more tokens. Adjust based on your model and use case.",
    category: "Performance",
    tags: ["Context", "Window", "Tokens", "Memory"],
    dependencies: [],
    files: [".claude/settings/performance/context-window-size.md"],
    install:
      "npx @clawdbot/cli add setting/context-window-size",
    settingType: "number",
    defaultValue: 200000,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 10000,
      max: 200000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "agent-cache-strategy",
    kind: "setting",
    name: "Agent Cache Strategy",
    slug: "agent-cache-strategy",
    description:
      "Agent prompt caching strategy. Options: none, session, persistent. Recommended: session for most use cases.",
    longDescription:
      "Controls how agent prompts are cached. 'none' disables caching, 'session' caches for the duration of the session, 'persistent' caches across sessions. Session caching provides best balance of performance and flexibility.",
    category: "Performance",
    tags: ["Cache", "Agents", "Performance", "Memory"],
    dependencies: [],
    files: [".claude/settings/performance/agent-cache-strategy.md"],
    install:
      "npx @clawdbot/cli add setting/agent-cache-strategy",
    settingType: "string",
    defaultValue: "session",
    affectedComponents: [], // Affects all agents
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["none", "session", "persistent"],
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "batch-operation-size",
    kind: "setting",
    name: "Batch Operation Size",
    slug: "batch-operation-size",
    description:
      "Maximum items to process in a single batch operation. Recommended: 10 for file operations, 50 for data processing.",
    longDescription:
      "Controls the batch size for bulk operations like file processing, data transformations, or API calls. Larger batches are more efficient but may hit rate limits or memory constraints.",
    category: "Performance",
    tags: ["Batch", "Bulk", "Performance", "Optimization"],
    dependencies: [],
    files: [".claude/settings/performance/batch-operation-size.md"],
    install:
      "npx @clawdbot/cli add setting/batch-operation-size",
    settingType: "number",
    defaultValue: 10,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 1,
      max: 100,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "network-timeout",
    kind: "setting",
    name: "Network Timeout",
    slug: "network-timeout",
    description:
      "Network operation timeout in milliseconds. Recommended: 30000ms for most operations.",
    longDescription:
      "Sets the timeout for all network operations including API calls, RPC requests, and external service connections. Adjust based on your network conditions and service reliability.",
    category: "Performance",
    tags: ["Network", "Timeout", "API", "Reliability"],
    dependencies: [],
    files: [".claude/settings/performance/network-timeout.md"],
    install:
      "npx @clawdbot/cli add setting/network-timeout",
    settingType: "number",
    defaultValue: 30000,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 5000,
      max: 120000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "lazy-skill-loading",
    kind: "setting",
    name: "Lazy Skill Loading",
    slug: "lazy-skill-loading",
    description:
      "Enable progressive disclosure for skills. Loads full skill content only when needed. Saves 88-92% tokens.",
    longDescription:
      "When enabled, skills use progressive disclosure pattern: start with 30-50 token summaries, expand to full content only when specifically needed. Dramatically reduces token usage without sacrificing capability.",
    category: "Performance",
    tags: ["Skills", "Progressive Disclosure", "Tokens", "Optimization"],
    dependencies: [],
    files: [".claude/settings/performance/lazy-skill-loading.md"],
    install:
      "npx @clawdbot/cli add setting/lazy-skill-loading",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [], // Affects all 32 skills
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "compression-enabled",
    kind: "setting",
    name: "Compression Enabled",
    slug: "compression-enabled",
    description:
      "Enable response compression for large outputs. Reduces bandwidth and improves transfer speed.",
    longDescription:
      "Enables gzip compression for API responses. Significantly reduces bandwidth usage for large responses, especially beneficial for reading large files or receiving extensive code generation.",
    category: "Performance",
    tags: ["Compression", "Bandwidth", "Network", "Optimization"],
    dependencies: [],
    files: [".claude/settings/performance/compression-enabled.md"],
    install:
      "npx @clawdbot/cli add setting/compression-enabled",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },

  // === SECURITY SETTINGS (10) ===
  {
    id: "require-env-validation",
    kind: "setting",
    name: "Require Environment Validation",
    slug: "require-env-validation",
    description:
      "Validate all required environment variables before execution. Prevents runtime errors from missing config.",
    longDescription:
      "When enabled, Claude will check that all required environment variables are set and valid before executing operations that depend on them. Catches configuration errors early and provides clear error messages.",
    category: "Security",
    tags: ["Environment", "Validation", "Security", "Configuration"],
    dependencies: [],
    files: [".claude/settings/security/require-env-validation.md"],
    install:
      "npx @clawdbot/cli add setting/require-env-validation",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "sandbox-mode",
    kind: "setting",
    name: "Sandbox Mode",
    slug: "sandbox-mode",
    description:
      "Restrict file system access to project directory. Prevents accidental modification of system files.",
    longDescription:
      "Enables sandbox mode which restricts Claude's file system access to the current project directory and its subdirectories. Provides an additional security layer by preventing accidental or malicious access to system files.",
    category: "Security",
    tags: ["Sandbox", "File System", "Security", "Isolation"],
    dependencies: [],
    files: [".claude/settings/security/sandbox-mode.md"],
    install: "npx @clawdbot/cli add setting/sandbox-mode",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "api-key-rotation-days",
    kind: "setting",
    name: "API Key Rotation Days",
    slug: "api-key-rotation-days",
    description:
      "Days before showing API key rotation warning. Recommended: 90 days for production keys.",
    longDescription:
      "Sets the number of days after which Claude will warn you to rotate your API keys. Regular key rotation is a security best practice. Set to 0 to disable rotation warnings.",
    category: "Security",
    tags: ["API Keys", "Rotation", "Security", "Best Practices"],
    dependencies: [],
    files: [".claude/settings/security/api-key-rotation-days.md"],
    install:
      "npx @clawdbot/cli add setting/api-key-rotation-days",
    settingType: "number",
    defaultValue: 90,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 0,
      max: 365,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "allowed-domains",
    kind: "setting",
    name: "Allowed Domains",
    slug: "allowed-domains",
    description:
      "Whitelist of domains for external API calls. Comma-separated list. Empty allows all domains.",
    longDescription:
      "Restricts external API calls to specified domains only. Provides additional security by preventing calls to unexpected or malicious endpoints. Leave empty to allow all domains (default).",
    category: "Security",
    tags: ["Domains", "Whitelist", "Security", "API"],
    dependencies: [],
    files: [".claude/settings/security/allowed-domains.md"],
    install:
      "npx @clawdbot/cli add setting/allowed-domains",
    settingType: "array",
    defaultValue: [],
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "audit-log-enabled",
    kind: "setting",
    name: "Audit Log Enabled",
    slug: "audit-log-enabled",
    description:
      "Enable security audit logging for all sensitive operations. Recommended for production environments.",
    longDescription:
      "When enabled, logs all sensitive operations including file modifications, environment variable access, API calls, and command executions. Essential for security compliance and debugging.",
    category: "Security",
    tags: ["Audit", "Logging", "Security", "Compliance"],
    dependencies: [],
    files: [".claude/settings/security/audit-log-enabled.md"],
    install:
      "npx @clawdbot/cli add setting/audit-log-enabled",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "mcp-permission-model",
    kind: "setting",
    name: "MCP Permission Model",
    slug: "mcp-permission-model",
    description:
      "MCP server permission model. Options: strict, permissive, custom. Recommended: strict for production.",
    longDescription:
      "Controls permission model for MCP servers. 'strict' requires explicit approval for each operation, 'permissive' auto-approves known safe operations, 'custom' uses custom permission rules.",
    category: "Security",
    tags: ["MCP", "Permissions", "Security", "Access Control"],
    dependencies: [],
    files: [".claude/settings/security/mcp-permission-model.md"],
    install:
      "npx @clawdbot/cli add setting/mcp-permission-model",
    settingType: "string",
    defaultValue: "permissive",
    affectedComponents: [
      "supabase-mcp",
      "github-mcp",
      "alchemy-mcp",
      "infura-mcp",
      "thegraph-mcp",
      "quicknode-mcp",
      "tenderly-mcp",
      "context7-mcp",
      "e2b-mcp",
      "filesystem-mcp",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["strict", "permissive", "custom"],
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "credential-encryption",
    kind: "setting",
    name: "Credential Encryption",
    slug: "credential-encryption",
    description:
      "Encrypt stored credentials at rest. Highly recommended for production environments.",
    longDescription:
      "Enables encryption for all stored credentials including API keys, database passwords, and authentication tokens. Uses AES-256 encryption with system keychain integration.",
    category: "Security",
    tags: ["Encryption", "Credentials", "Security", "API Keys"],
    dependencies: [],
    files: [".claude/settings/security/credential-encryption.md"],
    install:
      "npx @clawdbot/cli add setting/credential-encryption",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "rate-limit-per-hour",
    kind: "setting",
    name: "Rate Limit Per Hour",
    slug: "rate-limit-per-hour",
    description:
      "Maximum API requests per hour. Recommended: 1000 for development, 5000 for production.",
    longDescription:
      "Sets rate limit for API requests to prevent runaway costs and detect potential issues. When limit is reached, Claude will pause and warn before continuing.",
    category: "Security",
    tags: ["Rate Limit", "API", "Cost Control", "Security"],
    dependencies: [],
    files: [".claude/settings/security/rate-limit-per-hour.md"],
    install:
      "npx @clawdbot/cli add setting/rate-limit-per-hour",
    settingType: "number",
    defaultValue: 1000,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 10,
      max: 100000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "disallowed-commands",
    kind: "setting",
    name: "Disallowed Commands",
    slug: "disallowed-commands",
    description:
      "Blacklist dangerous bash commands. Comma-separated list. Recommended: rm -rf, dd, mkfs.",
    longDescription:
      "Prevents execution of specified bash commands that could cause data loss or system damage. Commands are matched by prefix, so 'rm -rf' blocks 'rm -rf /' but allows 'rm file.txt'.",
    category: "Security",
    tags: ["Bash", "Commands", "Security", "Blacklist"],
    dependencies: [],
    files: [".claude/settings/security/disallowed-commands.md"],
    install:
      "npx @clawdbot/cli add setting/disallowed-commands",
    settingType: "array",
    defaultValue: ["rm -rf /", "dd if=", "mkfs", ":(){ :|:& };:"],
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "require-signature-verification",
    kind: "setting",
    name: "Require Signature Verification",
    slug: "require-signature-verification",
    description:
      "Verify package signatures before installation. Recommended for production environments.",
    longDescription:
      "Enables cryptographic signature verification for all installed packages, agents, skills, and commands. Ensures code authenticity and prevents tampering.",
    category: "Security",
    tags: ["Signatures", "Verification", "Security", "Integrity"],
    dependencies: [],
    files: [".claude/settings/security/require-signature-verification.md"],
    install:
      "npx @clawdbot/cli add setting/require-signature-verification",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },

  // === DEVELOPMENT SETTINGS (8) ===
  {
    id: "auto-git-commit",
    kind: "setting",
    name: "Auto Git Commit",
    slug: "auto-git-commit",
    description:
      "Automatically commit changes after successful operations. Creates detailed commit messages.",
    longDescription:
      "When enabled, Claude will automatically create git commits after completing tasks. Commit messages follow conventional commit format and include detailed descriptions of changes made.",
    category: "Development",
    tags: ["Git", "Commits", "Automation", "Version Control"],
    dependencies: [],
    files: [".claude/settings/development/auto-git-commit.md"],
    install:
      "npx @clawdbot/cli add setting/auto-git-commit",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: ["git-workflow-specialist", "code-review-orchestrator"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "conventional-commits",
    kind: "setting",
    name: "Conventional Commits",
    slug: "conventional-commits",
    description:
      "Enforce conventional commit message format (feat:, fix:, docs:, etc.). Improves changelog generation.",
    longDescription:
      "Enforces conventional commit message format for all commits created by Claude. Format: <type>(<scope>): <description>. Types: feat, fix, docs, style, refactor, test, chore.",
    category: "Development",
    tags: ["Git", "Commits", "Conventions", "Standards"],
    dependencies: [],
    files: [".claude/settings/development/conventional-commits.md"],
    install:
      "npx @clawdbot/cli add setting/conventional-commits",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: ["git-workflow-specialist"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "pre-commit-hooks",
    kind: "setting",
    name: "Pre-Commit Hooks",
    slug: "pre-commit-hooks",
    description:
      "Enable pre-commit validation hooks. Runs linting, formatting, and tests before commits.",
    longDescription:
      "Enables pre-commit hooks that run validation checks before creating commits. Includes linting, formatting, type checking, and optionally tests. Prevents committing broken code.",
    category: "Development",
    tags: ["Git", "Hooks", "Validation", "Quality"],
    dependencies: [],
    files: [".claude/settings/development/pre-commit-hooks.md"],
    install:
      "npx @clawdbot/cli add setting/pre-commit-hooks",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: ["git-workflow-specialist", "test-automation-engineer"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "test-before-deploy",
    kind: "setting",
    name: "Test Before Deploy",
    slug: "test-before-deploy",
    description:
      "Run all tests before deployments. Prevents deploying broken code to production.",
    longDescription:
      "Automatically runs full test suite before any deployment operations. Deployment is blocked if any tests fail. Essential for maintaining production stability.",
    category: "Development",
    tags: ["Testing", "Deployment", "CI/CD", "Quality"],
    dependencies: [],
    files: [".claude/settings/development/test-before-deploy.md"],
    install:
      "npx @clawdbot/cli add setting/test-before-deploy",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [
      "test-automation-engineer",
      "ci-cd-architect",
      "deployment-strategist",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "linting-enabled",
    kind: "setting",
    name: "Linting Enabled",
    slug: "linting-enabled",
    description:
      "Enable automatic linting for generated code. Ensures code quality and consistency.",
    longDescription:
      "Automatically runs linters (ESLint, Prettier, Rustfmt, etc.) on all generated code. Ensures consistent code style and catches common issues early.",
    category: "Development",
    tags: ["Linting", "Code Quality", "Style", "Standards"],
    dependencies: [],
    files: [".claude/settings/development/linting-enabled.md"],
    install:
      "npx @clawdbot/cli add setting/linting-enabled",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "format-on-save",
    kind: "setting",
    name: "Format On Save",
    slug: "format-on-save",
    description:
      "Auto-format files after edits. Ensures consistent formatting across the codebase.",
    longDescription:
      "Automatically formats files using appropriate formatters (Prettier, Black, Rustfmt) after Claude makes edits. Maintains consistent code style without manual intervention.",
    category: "Development",
    tags: ["Formatting", "Code Style", "Automation", "Quality"],
    dependencies: [],
    files: [".claude/settings/development/format-on-save.md"],
    install:
      "npx @clawdbot/cli add setting/format-on-save",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "typescript-strict-mode",
    kind: "setting",
    name: "TypeScript Strict Mode",
    slug: "typescript-strict-mode",
    description:
      "Enforce TypeScript strict mode for all generated TypeScript code. Catches more bugs at compile time.",
    longDescription:
      "Ensures all generated TypeScript code uses strict mode with full type checking enabled. Catches potential runtime errors at compile time and enforces best practices.",
    category: "Development",
    tags: ["TypeScript", "Type Safety", "Strict Mode", "Quality"],
    dependencies: [],
    files: [".claude/settings/development/typescript-strict-mode.md"],
    install:
      "npx @clawdbot/cli add setting/typescript-strict-mode",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: ["typescript-precision-engineer"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "dependency-auto-update",
    kind: "setting",
    name: "Dependency Auto-Update",
    slug: "dependency-auto-update",
    description:
      "Automatically update dependencies during operations. Options: none, patch, minor, major.",
    longDescription:
      "Controls automatic dependency updates. 'none' disables auto-updates, 'patch' updates patch versions (1.0.x), 'minor' updates minor versions (1.x.0), 'major' updates all versions.",
    category: "Development",
    tags: ["Dependencies", "Updates", "Maintenance", "Security"],
    dependencies: [],
    files: [".claude/settings/development/dependency-auto-update.md"],
    install:
      "npx @clawdbot/cli add setting/dependency-auto-update",
    settingType: "string",
    defaultValue: "none",
    affectedComponents: ["package-manager-expert"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["none", "patch", "minor", "major"],
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },

  // === INTEGRATION SETTINGS (7) ===
  {
    id: "default-rpc-provider",
    kind: "setting",
    name: "Default RPC Provider",
    slug: "default-rpc-provider",
    description:
      "Default blockchain RPC provider. Options: alchemy, infura, quicknode, helius. Recommended: helius for Solana.",
    longDescription:
      "Sets the default RPC provider for blockchain interactions. Different providers offer different performance, reliability, and pricing. Helius recommended for Solana, Alchemy/Infura for EVM chains.",
    category: "Integration",
    tags: ["RPC", "Blockchain", "Provider", "Web3"],
    dependencies: [],
    files: [".claude/settings/integration/default-rpc-provider.md"],
    install:
      "npx @clawdbot/cli add setting/default-rpc-provider",
    settingType: "string",
    defaultValue: "helius",
    affectedComponents: [
      "icm-anchor-architect",
      "alchemy-mcp",
      "infura-mcp",
      "quicknode-mcp",
    ],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["alchemy", "infura", "quicknode", "helius", "custom"],
    },
    envKeys: ["RPC_ENDPOINT"],
    installs: 0,
    remixes: 0,
  },
  {
    id: "subgraph-endpoint",
    kind: "setting",
    name: "Subgraph Endpoint",
    slug: "subgraph-endpoint",
    description:
      "The Graph subgraph endpoint preference. Options: hosted, studio, decentralized.",
    longDescription:
      "Selects which The Graph network to use. 'hosted' uses legacy hosted service (being deprecated), 'studio' uses Subgraph Studio, 'decentralized' uses the decentralized network (recommended for production).",
    category: "Integration",
    tags: ["The Graph", "Subgraph", "Indexing", "Web3"],
    dependencies: [],
    files: [".claude/settings/integration/subgraph-endpoint.md"],
    install:
      "npx @clawdbot/cli add setting/subgraph-endpoint",
    settingType: "string",
    defaultValue: "studio",
    affectedComponents: ["thegraph-mcp", "graph-protocol-indexer"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["hosted", "studio", "decentralized"],
    },
    envKeys: ["GRAPH_API_KEY"],
    installs: 0,
    remixes: 0,
  },
  {
    id: "wallet-adapter-priority",
    kind: "setting",
    name: "Wallet Adapter Priority",
    slug: "wallet-adapter-priority",
    description:
      "Wallet connection priority order. Comma-separated list. Example: phantom,solflare,backpack for Solana.",
    longDescription:
      "Defines the order in which wallet adapters are attempted when connecting. First available wallet in the list will be used. Customize based on your target user base.",
    category: "Integration",
    tags: ["Wallet", "Web3", "Connection", "Priority"],
    dependencies: [],
    files: [".claude/settings/integration/wallet-adapter-priority.md"],
    install:
      "npx @clawdbot/cli add setting/wallet-adapter-priority",
    settingType: "array",
    defaultValue: ["phantom", "solflare", "backpack"],
    affectedComponents: ["frontend-fusion-engine"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "ipfs-gateway-url",
    kind: "setting",
    name: "IPFS Gateway URL",
    slug: "ipfs-gateway-url",
    description:
      "IPFS gateway preference. Options: ipfs.io, cloudflare-ipfs.com, dweb.link, custom.",
    longDescription:
      "Sets the IPFS gateway for retrieving NFT metadata and assets. Cloudflare gateway offers better performance and reliability. Can specify custom gateway URL.",
    category: "Integration",
    tags: ["IPFS", "Gateway", "NFT", "Storage"],
    dependencies: [],
    files: [".claude/settings/integration/ipfs-gateway-url.md"],
    install:
      "npx @clawdbot/cli add setting/ipfs-gateway-url",
    settingType: "string",
    defaultValue: "cloudflare-ipfs.com",
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "analytics-enabled",
    kind: "setting",
    name: "Analytics Enabled",
    slug: "analytics-enabled",
    description:
      "Enable usage analytics and telemetry. Helps improve Claude Code. No sensitive data collected.",
    longDescription:
      "Enables anonymous usage analytics to help improve Claude Code. Collects command usage, performance metrics, and error rates. No code, API keys, or sensitive data is collected.",
    category: "Integration",
    tags: ["Analytics", "Telemetry", "Usage", "Metrics"],
    dependencies: [],
    files: [".claude/settings/integration/analytics-enabled.md"],
    install:
      "npx @clawdbot/cli add setting/analytics-enabled",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "error-reporting-service",
    kind: "setting",
    name: "Error Reporting Service",
    slug: "error-reporting-service",
    description:
      "Error tracking service. Options: sentry, bugsnag, rollbar, none. Recommended: sentry for production.",
    longDescription:
      "Configures error tracking and reporting service. Automatically reports errors, exceptions, and crashes for monitoring and debugging. Essential for production deployments.",
    category: "Integration",
    tags: ["Errors", "Monitoring", "Tracking", "Debugging"],
    dependencies: [],
    files: [".claude/settings/integration/error-reporting-service.md"],
    install:
      "npx @clawdbot/cli add setting/error-reporting-service",
    settingType: "string",
    defaultValue: "none",
    affectedComponents: ["monitoring-specialist"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["sentry", "bugsnag", "rollbar", "none"],
    },
    envKeys: ["SENTRY_DSN", "BUGSNAG_API_KEY", "ROLLBAR_ACCESS_TOKEN"],
    installs: 0,
    remixes: 0,
  },
  {
    id: "monitoring-dashboard",
    kind: "setting",
    name: "Monitoring Dashboard",
    slug: "monitoring-dashboard",
    description:
      "Monitoring service integration. Options: datadog, newrelic, grafana, none. Recommended: datadog for comprehensive monitoring.",
    longDescription:
      "Integrates with monitoring and observability platforms for metrics, logs, and traces. Provides real-time visibility into application performance and health.",
    category: "Integration",
    tags: ["Monitoring", "Observability", "Metrics", "APM"],
    dependencies: [],
    files: [".claude/settings/integration/monitoring-dashboard.md"],
    install:
      "npx @clawdbot/cli add setting/monitoring-dashboard",
    settingType: "string",
    defaultValue: "none",
    affectedComponents: ["monitoring-specialist", "performance-profiler"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["datadog", "newrelic", "grafana", "prometheus", "none"],
    },
    envKeys: ["DATADOG_API_KEY", "NEW_RELIC_LICENSE_KEY", "GRAFANA_API_KEY"],
    installs: 0,
    remixes: 0,
  },

  // === MONITORING SETTINGS (6) ===
  {
    id: "performance-profiling-setting",
    kind: "setting",
    name: "Performance Profiling (Setting)",
    slug: "performance-profiling-setting",
    description:
      "Enable performance profiling for operations. Tracks execution time and resource usage.",
    longDescription:
      "Enables detailed performance profiling for all operations. Tracks execution time, memory usage, and token consumption. Useful for identifying bottlenecks and optimizing workflows.",
    category: "Monitoring",
    tags: ["Performance", "Profiling", "Metrics", "Optimization"],
    dependencies: [],
    files: [".claude/settings/monitoring/performance-profiling.md"],
    install:
      "npx @clawdbot/cli add setting/performance-profiling-setting",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: ["performance-profiler", "context-sculptor"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "memory-usage-alerts",
    kind: "setting",
    name: "Memory Usage Alerts",
    slug: "memory-usage-alerts",
    description:
      "Alert on high memory usage. Threshold in MB. Recommended: 1024 for most systems.",
    longDescription:
      "Monitors memory usage and alerts when threshold is exceeded. Helps prevent out-of-memory errors and identifies memory leaks. Set to 0 to disable alerts.",
    category: "Monitoring",
    tags: ["Memory", "Alerts", "Resources", "Monitoring"],
    dependencies: [],
    files: [".claude/settings/monitoring/memory-usage-alerts.md"],
    install:
      "npx @clawdbot/cli add setting/memory-usage-alerts",
    settingType: "number",
    defaultValue: 0,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 0,
      max: 32768,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "slow-query-threshold-ms",
    kind: "setting",
    name: "Slow Query Threshold",
    slug: "slow-query-threshold-ms",
    description:
      "Log queries exceeding threshold in milliseconds. Recommended: 1000ms for database queries.",
    longDescription:
      "Logs database queries, API calls, and operations that exceed the specified threshold. Helps identify performance issues and optimization opportunities.",
    category: "Monitoring",
    tags: ["Performance", "Queries", "Database", "Logging"],
    dependencies: [],
    files: [".claude/settings/monitoring/slow-query-threshold-ms.md"],
    install:
      "npx @clawdbot/cli add setting/slow-query-threshold-ms",
    settingType: "number",
    defaultValue: 1000,
    affectedComponents: ["database-schema-oracle"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      min: 0,
      max: 60000,
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "error-notification-webhook",
    kind: "setting",
    name: "Error Notification Webhook",
    slug: "error-notification-webhook",
    description:
      "Webhook URL for error notifications. Supports Slack, Discord, custom endpoints.",
    longDescription:
      "Sends error notifications to specified webhook URL. Supports Slack webhooks, Discord webhooks, and custom endpoints. Useful for real-time error alerting.",
    category: "Monitoring",
    tags: ["Errors", "Webhook", "Notifications", "Alerts"],
    dependencies: [],
    files: [".claude/settings/monitoring/error-notification-webhook.md"],
    install:
      "npx @clawdbot/cli add setting/error-notification-webhook",
    settingType: "string",
    defaultValue: "",
    affectedComponents: [],
    configLocation: ".env",
    validationSchema: {},
    envKeys: ["ERROR_WEBHOOK_URL"],
    installs: 0,
    remixes: 0,
  },
  {
    id: "uptime-monitoring",
    kind: "setting",
    name: "Uptime Monitoring",
    slug: "uptime-monitoring",
    description:
      "Enable uptime monitoring for deployed services. Checks health endpoints periodically.",
    longDescription:
      "Enables automated uptime monitoring for deployed services. Periodically checks health endpoints and alerts on failures. Essential for production monitoring.",
    category: "Monitoring",
    tags: ["Uptime", "Health Checks", "Monitoring", "Reliability"],
    dependencies: [],
    files: [".claude/settings/monitoring/uptime-monitoring.md"],
    install:
      "npx @clawdbot/cli add setting/uptime-monitoring",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: ["monitoring-specialist", "deployment-strategist"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "cost-tracking",
    kind: "setting",
    name: "Cost Tracking",
    slug: "cost-tracking",
    description:
      "Track API usage costs in real-time. Shows estimated costs for Claude API, RPC calls, and external services.",
    longDescription:
      "Enables real-time cost tracking for all API usage including Claude API calls, blockchain RPC requests, and external service integrations. Provides cost estimates and budget alerts.",
    category: "Monitoring",
    tags: ["Cost", "Budget", "Tracking", "Usage"],
    dependencies: [],
    files: [".claude/settings/monitoring/cost-tracking.md"],
    install:
      "npx @clawdbot/cli add setting/cost-tracking",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: [],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },

  // === OPTIMIZATION SETTINGS (5) ===
  {
    id: "bundle-analyzer-enabled",
    kind: "setting",
    name: "Bundle Analyzer Enabled",
    slug: "bundle-analyzer-enabled",
    description:
      "Enable bundle analysis for frontend builds. Identifies optimization opportunities.",
    longDescription:
      "Automatically runs bundle analyzer after builds to identify large dependencies, duplicate code, and optimization opportunities. Essential for keeping bundle sizes small.",
    category: "Optimization",
    tags: ["Bundle", "Analysis", "Frontend", "Optimization"],
    dependencies: [],
    files: [".claude/settings/optimization/bundle-analyzer-enabled.md"],
    install:
      "npx @clawdbot/cli add setting/bundle-analyzer-enabled",
    settingType: "boolean",
    defaultValue: false,
    affectedComponents: ["bundler-optimizer", "performance-profiler"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "tree-shaking",
    kind: "setting",
    name: "Tree Shaking",
    slug: "tree-shaking",
    description:
      "Enable tree shaking to remove unused code. Significantly reduces bundle size.",
    longDescription:
      "Enables tree shaking (dead code elimination) in bundlers. Removes unused exports and code paths, dramatically reducing bundle sizes. Essential for production builds.",
    category: "Optimization",
    tags: ["Tree Shaking", "Bundle", "Optimization", "Dead Code"],
    dependencies: [],
    files: [".claude/settings/optimization/tree-shaking.md"],
    install:
      "npx @clawdbot/cli add setting/tree-shaking",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: ["bundler-optimizer", "build-system-engineer"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "code-splitting-strategy",
    kind: "setting",
    name: "Code Splitting Strategy",
    slug: "code-splitting-strategy",
    description:
      "Code splitting strategy. Options: route, component, vendor. Recommended: route for Next.js apps.",
    longDescription:
      "Defines how code is split into separate bundles. 'route' splits by page routes (recommended for Next.js), 'component' splits by component, 'vendor' separates vendor code from app code.",
    category: "Optimization",
    tags: ["Code Splitting", "Bundle", "Optimization", "Loading"],
    dependencies: [],
    files: [".claude/settings/optimization/code-splitting-strategy.md"],
    install:
      "npx @clawdbot/cli add setting/code-splitting-strategy",
    settingType: "string",
    defaultValue: "route",
    affectedComponents: ["bundler-optimizer", "frontend-fusion-engine"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["route", "component", "vendor", "manual"],
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "image-optimization",
    kind: "setting",
    name: "Image Optimization",
    slug: "image-optimization",
    description:
      "Enable automatic image optimization. Converts to WebP, generates responsive sizes.",
    longDescription:
      "Automatically optimizes images by converting to WebP format, generating responsive sizes, and lazy loading. Dramatically improves page load times and Core Web Vitals scores.",
    category: "Optimization",
    tags: ["Images", "Optimization", "Performance", "WebP"],
    dependencies: [],
    files: [".claude/settings/optimization/image-optimization.md"],
    install:
      "npx @clawdbot/cli add setting/image-optimization",
    settingType: "boolean",
    defaultValue: true,
    affectedComponents: ["frontend-fusion-engine", "performance-profiler"],
    configLocation: ".claude/settings.json",
    validationSchema: {},
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
  {
    id: "cdn-caching-strategy",
    kind: "setting",
    name: "CDN Caching Strategy",
    slug: "cdn-caching-strategy",
    description:
      "CDN cache strategy. Options: aggressive, balanced, conservative. Recommended: balanced for most apps.",
    longDescription:
      "Controls CDN caching behavior. 'aggressive' caches everything with long TTLs (best for static sites), 'balanced' caches static assets with moderate TTLs (recommended), 'conservative' minimal caching with short TTLs (for frequently updated content).",
    category: "Optimization",
    tags: ["CDN", "Caching", "Performance", "Delivery"],
    dependencies: [],
    files: [".claude/settings/optimization/cdn-caching-strategy.md"],
    install:
      "npx @clawdbot/cli add setting/cdn-caching-strategy",
    settingType: "string",
    defaultValue: "balanced",
    affectedComponents: ["deployment-strategist"],
    configLocation: ".claude/settings.json",
    validationSchema: {
      enum: ["aggressive", "balanced", "conservative"],
    },
    envKeys: [],
    installs: 0,
    remixes: 0,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSettingsByCategory(category: string): Setting[] {
  return SETTINGS.filter((setting) => setting.category === category);
}

export function getSettingById(id: string): Setting | undefined {
  return SETTINGS.find((setting) => setting.id === id);
}

export function getSettingBySlug(slug: string): Setting | undefined {
  return SETTINGS.find((setting) => setting.slug === slug);
}

export function getAffectedComponents(settingId: string): string[] {
  const setting = getSettingById(settingId);
  return setting?.affectedComponents || [];
}

export function getCategories(): string[] {
  return Array.from(new Set(SETTINGS.map((s) => s.category)));
}

export function getSettingsByTag(tag: string): Setting[] {
  return SETTINGS.filter((s) => s.tags.includes(tag));
}
