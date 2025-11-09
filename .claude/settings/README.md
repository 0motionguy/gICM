# gICM Settings Catalog

Complete catalog of Claude Code settings for the gICM Stack. **48 settings** across **6 categories**.

## Quick Install

```bash
# Add a setting
npx @gicm/cli settings add <category>/<setting-name> --value <value>

# List all settings
npx @gicm/cli settings list

# Remove a setting
npx @gicm/cli settings remove <setting-id>
```

---

## Performance Settings (12)

### mcp-timeout-duration
Maximum time to wait for MCP server responses (ms). **Default: 30000**
```bash
npx @gicm/cli settings add performance/mcp-timeout-duration --value 30000
```

### mcp-retry-attempts
Maximum retry attempts for failed MCP calls. **Default: 3**
```bash
npx @gicm/cli settings add performance/mcp-retry-attempts --value 3
```

### skill-cache-ttl
Skill content cache duration (seconds). **Default: 3600**
```bash
npx @gicm/cli settings add performance/skill-cache-ttl --value 3600
```

### parallel-tool-execution
Enable parallel execution of independent tool calls. **Default: true**
```bash
npx @gicm/cli settings add performance/parallel-tool-execution --value true
```

### token-budget-limit
Maximum tokens per request. **Default: 200000**
```bash
npx @gicm/cli settings add performance/token-budget-limit --value 200000
```

### response-streaming
Enable streaming responses for real-time output. **Default: true**
```bash
npx @gicm/cli settings add performance/response-streaming --value true
```

### context-window-size
Maximum context window size in tokens. **Default: 200000**
```bash
npx @gicm/cli settings add performance/context-window-size --value 200000
```

### agent-cache-strategy
Agent prompt caching: none, session, persistent. **Default: session**
```bash
npx @gicm/cli settings add performance/agent-cache-strategy --value session
```

### batch-operation-size
Maximum items in batch operations. **Default: 10**
```bash
npx @gicm/cli settings add performance/batch-operation-size --value 10
```

### network-timeout
Network operation timeout (ms). **Default: 30000**
```bash
npx @gicm/cli settings add performance/network-timeout --value 30000
```

### lazy-skill-loading ⭐
Progressive disclosure for skills. **Saves 88-92% tokens.** **Default: true**
```bash
npx @gicm/cli settings add performance/lazy-skill-loading --value true
```

### compression-enabled
Enable response compression. **Default: true**
```bash
npx @gicm/cli settings add performance/compression-enabled --value true
```

---

## Security Settings (10)

### require-env-validation
Validate all environment variables before execution. **Default: true**
```bash
npx @gicm/cli settings add security/require-env-validation --value true
```

### sandbox-mode 🔒
Restrict file system access to project directory. **Default: false**
```bash
npx @gicm/cli settings add security/sandbox-mode --value true
```

### api-key-rotation-days
Days before API key rotation warning. **Default: 90**
```bash
npx @gicm/cli settings add security/api-key-rotation-days --value 90
```

### allowed-domains
Whitelist for external API calls (comma-separated). **Default: []**
```bash
npx @gicm/cli settings add security/allowed-domains --value "api.anthropic.com,supabase.io"
```

### audit-log-enabled
Enable security audit logging. **Default: false**
```bash
npx @gicm/cli settings add security/audit-log-enabled --value true
```

### mcp-permission-model
MCP permission model: strict, permissive, custom. **Default: permissive**
```bash
npx @gicm/cli settings add security/mcp-permission-model --value strict
```

### credential-encryption
Encrypt stored credentials at rest. **Default: false**
```bash
npx @gicm/cli settings add security/credential-encryption --value true
```

### rate-limit-per-hour
Maximum API requests per hour. **Default: 1000**
```bash
npx @gicm/cli settings add security/rate-limit-per-hour --value 1000
```

### disallowed-commands
Blacklist dangerous bash commands. **Default: ["rm -rf /", ...]**
```bash
npx @gicm/cli settings add security/disallowed-commands --value "rm -rf,dd,mkfs"
```

### require-signature-verification
Verify package signatures before installation. **Default: false**
```bash
npx @gicm/cli settings add security/require-signature-verification --value true
```

---

## Development Settings (8)

### auto-git-commit
Automatically commit after successful operations. **Default: false**
```bash
npx @gicm/cli settings add development/auto-git-commit --value true
```

### conventional-commits
Enforce conventional commit format. **Default: true**
```bash
npx @gicm/cli settings add development/conventional-commits --value true
```

### pre-commit-hooks
Enable pre-commit validation hooks. **Default: true**
```bash
npx @gicm/cli settings add development/pre-commit-hooks --value true
```

### test-before-deploy
Run tests before deployments. **Default: true**
```bash
npx @gicm/cli settings add development/test-before-deploy --value true
```

### linting-enabled
Enable automatic linting. **Default: true**
```bash
npx @gicm/cli settings add development/linting-enabled --value true
```

### format-on-save
Auto-format files after edits. **Default: true**
```bash
npx @gicm/cli settings add development/format-on-save --value true
```

### typescript-strict-mode
Enforce TypeScript strict mode. **Default: true**
```bash
npx @gicm/cli settings add development/typescript-strict-mode --value true
```

### dependency-auto-update
Auto-update dependencies: none, patch, minor, major. **Default: none**
```bash
npx @gicm/cli settings add development/dependency-auto-update --value patch
```

---

## Integration Settings (7)

### default-rpc-provider
Default blockchain RPC provider. **Default: helius**
```bash
npx @gicm/cli settings add integration/default-rpc-provider --value helius
```

### subgraph-endpoint
The Graph endpoint: hosted, studio, decentralized. **Default: studio**
```bash
npx @gicm/cli settings add integration/subgraph-endpoint --value studio
```

### wallet-adapter-priority
Wallet connection priority order. **Default: ["phantom", ...]**
```bash
npx @gicm/cli settings add integration/wallet-adapter-priority --value "phantom,solflare,backpack"
```

### ipfs-gateway-url
IPFS gateway preference. **Default: cloudflare-ipfs.com**
```bash
npx @gicm/cli settings add integration/ipfs-gateway-url --value cloudflare-ipfs.com
```

### analytics-enabled
Enable usage analytics. **Default: false**
```bash
npx @gicm/cli settings add integration/analytics-enabled --value true
```

### error-reporting-service
Error tracking: sentry, bugsnag, rollbar, none. **Default: none**
```bash
npx @gicm/cli settings add integration/error-reporting-service --value sentry
```

### monitoring-dashboard
Monitoring service: datadog, newrelic, grafana, none. **Default: none**
```bash
npx @gicm/cli settings add integration/monitoring-dashboard --value datadog
```

---

## Monitoring Settings (6)

### performance-profiling
Enable performance profiling. **Default: false**
```bash
npx @gicm/cli settings add monitoring/performance-profiling --value true
```

### memory-usage-alerts
Alert on high memory usage (MB). **Default: 0 (disabled)**
```bash
npx @gicm/cli settings add monitoring/memory-usage-alerts --value 1024
```

### slow-query-threshold-ms
Log queries exceeding threshold. **Default: 1000**
```bash
npx @gicm/cli settings add monitoring/slow-query-threshold-ms --value 1000
```

### error-notification-webhook
Webhook URL for error notifications. **Default: ""**
```bash
npx @gicm/cli settings add monitoring/error-notification-webhook --value "https://hooks.slack.com/..."
```

### uptime-monitoring
Enable uptime monitoring. **Default: false**
```bash
npx @gicm/cli settings add monitoring/uptime-monitoring --value true
```

### cost-tracking
Track API usage costs. **Default: false**
```bash
npx @gicm/cli settings add monitoring/cost-tracking --value true
```

---

## Optimization Settings (5)

### bundle-analyzer-enabled
Enable bundle analysis. **Default: false**
```bash
npx @gicm/cli settings add optimization/bundle-analyzer-enabled --value true
```

### tree-shaking
Enable tree shaking. **Default: true**
```bash
npx @gicm/cli settings add optimization/tree-shaking --value true
```

### code-splitting-strategy
Code splitting: route, component, vendor, manual. **Default: route**
```bash
npx @gicm/cli settings add optimization/code-splitting-strategy --value route
```

### image-optimization
Enable automatic image optimization. **Default: true**
```bash
npx @gicm/cli settings add optimization/image-optimization --value true
```

### cdn-caching-strategy
CDN caching: aggressive, balanced, conservative. **Default: balanced**
```bash
npx @gicm/cli settings add optimization/cdn-caching-strategy --value balanced
```

---

## Recommended Presets

### Production (Maximum Security & Performance)
```bash
# Performance
npx @gicm/cli settings add performance/lazy-skill-loading --value true
npx @gicm/cli settings add performance/compression-enabled --value true
npx @gicm/cli settings add performance/parallel-tool-execution --value true

# Security
npx @gicm/cli settings add security/sandbox-mode --value true
npx @gicm/cli settings add security/audit-log-enabled --value true
npx @gicm/cli settings add security/mcp-permission-model --value strict
npx @gicm/cli settings add security/credential-encryption --value true

# Monitoring
npx @gicm/cli settings add monitoring/cost-tracking --value true
npx @gicm/cli settings add monitoring/uptime-monitoring --value true
npx @gicm/cli settings add integration/error-reporting-service --value sentry
```

### Development (Fast Iteration)
```bash
# Performance
npx @gicm/cli settings add performance/lazy-skill-loading --value true
npx @gicm/cli settings add performance/mcp-timeout-duration --value 60000

# Development
npx @gicm/cli settings add development/linting-enabled --value true
npx @gicm/cli settings add development/format-on-save --value true
npx @gicm/cli settings add development/typescript-strict-mode --value true
```

### ICM Motion Launch Platform
```bash
# Performance (token savings critical)
npx @gicm/cli settings add performance/lazy-skill-loading --value true
npx @gicm/cli settings add performance/agent-cache-strategy --value session

# Security (protecting private keys)
npx @gicm/cli settings add security/sandbox-mode --value true
npx @gicm/cli settings add security/credential-encryption --value true

# Integration (Solana focus)
npx @gicm/cli settings add integration/default-rpc-provider --value helius
npx @gicm/cli settings add integration/wallet-adapter-priority --value "phantom,solflare,backpack"
```

---

## Settings by Component Impact

### Affects All MCPs
- `mcp-timeout-duration`
- `mcp-retry-attempts`
- `mcp-permission-model`
- `network-timeout`

### Affects All Skills
- `lazy-skill-loading` ⭐
- `skill-cache-ttl`
- `context-window-size`

### Affects All Agents
- `agent-cache-strategy`
- `token-budget-limit`
- `parallel-tool-execution`

### Blockchain Specific
- `default-rpc-provider`
- `wallet-adapter-priority`
- `subgraph-endpoint`

---

**Last Updated:** 2025-11-06
**Total Settings:** 48
**Categories:** 6
