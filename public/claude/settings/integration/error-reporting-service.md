# Error Reporting Service

Error tracking service. Options: sentry, bugsnag, rollbar, none. Recommended: sentry for production.

## Overview

Configures error tracking and reporting service. Automatically reports errors, exceptions, and crashes for monitoring and debugging. Essential for production deployments.

## Configuration

**Category:** Integration
**Type:** String (enum)
**Default:** none
**Options:** sentry, bugsnag, rollbar, none

## Usage

```bash
# Sentry (recommended)
npx @gicm/cli settings add integration/error-reporting-service --value sentry

# Bugsnag
npx @gicm/cli settings add integration/error-reporting-service --value bugsnag

# Rollbar
npx @gicm/cli settings add integration/error-reporting-service --value rollbar

# Disable error reporting (default)
npx @gicm/cli settings add integration/error-reporting-service --value none
```

## Service Comparison

| Service | Features | Pricing | Best For |
|---------|----------|---------|----------|
| Sentry | Source maps, releases, performance | Free tier: 5k errors/mo | Most teams |
| Bugsnag | Stability score, sessions | Free tier: 7.5k events/mo | Mobile apps |
| Rollbar | Deploy tracking, RQL queries | Free tier: 5k events/mo | Web apps |

## Environment Variables

**Sentry:**
```bash
SENTRY_DSN=https://xxx@sentry.io/123
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Bugsnag:**
```bash
BUGSNAG_API_KEY=your_api_key
```

**Rollbar:**
```bash
ROLLBAR_ACCESS_TOKEN=your_token
```

## Error Capture

**Automatically captures:**
- Unhandled exceptions
- Promise rejections
- API errors
- Build failures
- Test failures
- Deployment errors

**Context included:**
- Stack traces
- User actions leading to error
- Environment info
- Request data (sanitized)
- Breadcrumbs (last 100 events)

## Data Sanitization

**Sensitive data removed:**
```json
{
  "error-reporting-service": "sentry",
  "sanitize-data": {
    "remove-api-keys": true,
    "remove-passwords": true,
    "remove-tokens": true,
    "sanitize-urls": true,
    "patterns": [
      "ANTHROPIC_API_KEY",
      "DATABASE_URL",
      "PRIVATE_KEY"
    ]
  }
}
```

## Affected Components

- `monitoring-specialist` - Error monitoring
- All agents (error reporting)

## Alerting Rules

**Configure alerts:**
```json
{
  "error-reporting-service": "sentry",
  "alerts": {
    "new-error": {
      "enabled": true,
      "webhook": "https://hooks.slack.com/..."
    },
    "spike-detection": {
      "enabled": true,
      "threshold": 10,
      "window-minutes": 5
    }
  }
}
```

## Source Maps

**Upload source maps for better stack traces:**
```bash
# During build
npm run build
npx sentry-cli sourcemaps upload ./dist

# Or configure auto-upload
{
  "error-reporting-service": "sentry",
  "upload-source-maps": true
}
```

## Release Tracking

**Track deployments:**
```bash
# Tag errors with release version
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Or configure in settings
{
  "error-reporting-service": "sentry",
  "release-tracking": {
    "enabled": true,
    "auto-detect": true
  }
}
```

## Performance Monitoring

**Enable performance tracking:**
```json
{
  "error-reporting-service": "sentry",
  "performance-monitoring": {
    "enabled": true,
    "sample-rate": 0.1,
    "traces-sample-rate": 0.1
  }
}
```

## Related Settings

- `monitoring-dashboard` - Complementary monitoring
- `audit-log-enabled` - Local error logging
- `error-notification-webhook` - Webhook alerts

## Examples

### Production Configuration
```json
{
  "error-reporting-service": "sentry",
  "sanitize-data": {
    "remove-api-keys": true,
    "remove-passwords": true
  },
  "alerts": {
    "new-error": {
      "enabled": true,
      "webhook": "${SLACK_WEBHOOK_URL}"
    }
  },
  "performance-monitoring": {
    "enabled": true
  }
}
```

### Development
```json
{
  "error-reporting-service": "none"
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
