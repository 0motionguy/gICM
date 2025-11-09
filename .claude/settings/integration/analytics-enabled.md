# Analytics Enabled

Enable usage analytics and telemetry. Helps improve Claude Code. No sensitive data collected.

## Overview

Enables anonymous usage analytics to help improve Claude Code. Collects command usage, performance metrics, and error rates. No code, API keys, or sensitive data is collected.

## Configuration

**Category:** Integration
**Type:** Boolean
**Default:** false
**Recommended:** true (helps improve gICM)

## Usage

```bash
# Enable analytics
npx @gicm/cli settings add integration/analytics-enabled --value true

# Disable analytics (default)
npx @gicm/cli settings add integration/analytics-enabled --value false
```

## What Gets Collected

**Command Usage:**
- Command names (e.g., "install agent")
- Frequency of use
- Execution success/failure
- Execution time

**Performance Metrics:**
- Average response time
- Token usage statistics
- Build times
- Test execution duration

**Error Rates:**
- Error types (sanitized)
- Frequency of errors
- Stack traces (anonymized)

**System Info:**
- OS and version
- Node.js version
- gICM CLI version
- Installed package counts

## What Is NOT Collected

**Never collected:**
- Source code
- File contents
- API keys or credentials
- Environment variables
- Personal data
- IP addresses
- User identifiers

## Data Privacy

**Anonymization:**
- All data is anonymized
- No personally identifiable information (PII)
- Aggregated statistics only
- No individual tracking

**Data Storage:**
- Stored securely
- Encrypted at rest
- 90-day retention
- GDPR compliant

## How It Helps

**Usage analytics enable:**
1. **Feature prioritization** - Most used features get priority
2. **Performance improvements** - Identify slow operations
3. **Bug detection** - Find issues before they impact users
4. **Better defaults** - Optimize default settings based on usage

## Opt-Out

**Disable anytime:**
```bash
npx @gicm/cli settings add integration/analytics-enabled --value false
```

**Or via environment variable:**
```bash
export GICM_ANALYTICS_DISABLED=true
```

## Analytics Dashboard

**View anonymized community stats:**
```bash
npx @gicm/cli analytics view

# Shows:
# - Most popular agents
# - Most used commands
# - Average response times
# - Common error patterns
```

## Data Sharing

**Analytics shared with:**
- gICM development team only
- No third parties
- No data selling
- Open source statistics published quarterly

## Related Settings

- `audit-log-enabled` - Local audit logging
- `error-reporting-service` - Error tracking integration
- `monitoring-dashboard` - Monitoring integration

## Examples

### Enable with Transparency
```json
{
  "analytics-enabled": true,
  "analytics-opt-in-message": true,
  "analytics-dashboard-access": true
}
```

### Complete Opt-Out
```json
{
  "analytics-enabled": false,
  "error-reporting-service": "none"
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
