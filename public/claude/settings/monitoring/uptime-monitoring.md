# Uptime Monitoring

Enable uptime monitoring for deployed services. Checks health endpoints periodically.

## Overview

Enables automated uptime monitoring for deployed services. Periodically checks health endpoints and alerts on failures. Essential for production monitoring.

## Configuration

**Category:** Monitoring
**Type:** Boolean
**Default:** false
**Recommended:** true for production

## Usage

```bash
# Enable uptime monitoring
npx @gicm/cli settings add monitoring/uptime-monitoring --value true

# Disable uptime monitoring (default)
npx @gicm/cli settings add monitoring/uptime-monitoring --value false
```

## Health Check Configuration

**Configure health endpoints:**
```json
{
  "uptime-monitoring": true,
  "health-checks": [
    {
      "name": "API Server",
      "url": "https://api.gicm.io/health",
      "interval-seconds": 60,
      "timeout-ms": 5000,
      "expected-status": 200
    },
    {
      "name": "Frontend",
      "url": "https://gicm.io",
      "interval-seconds": 300,
      "timeout-ms": 10000
    },
    {
      "name": "Database",
      "url": "internal://database/health",
      "interval-seconds": 30
    }
  ]
}
```

## Health Check Response

**Expected response format:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T10:30:45.123Z",
  "services": {
    "database": "up",
    "redis": "up",
    "rpc": "up"
  },
  "uptime_seconds": 86400
}
```

## Monitoring Output

**Successful check:**
```
✓ API Server - Healthy (152ms)
  Status: 200
  Response time: 152ms
  Uptime: 24h 0m
```

**Failed check:**
```
✗ API Server - Down
  Status: 503 Service Unavailable
  Error: Connection timeout after 5000ms
  Last successful check: 2 minutes ago

Alert sent to: ${SLACK_WEBHOOK_URL}
```

## Affected Components

- `monitoring-specialist` - Monitoring orchestration
- `deployment-strategist` - Deployment health

## Alert Configuration

**Configure alerts:**
```json
{
  "uptime-monitoring": true,
  "alerts": {
    "on-failure": {
      "enabled": true,
      "webhook": "${SLACK_WEBHOOK_URL}",
      "retry-before-alert": 3,
      "cooldown-minutes": 5
    },
    "on-recovery": {
      "enabled": true,
      "webhook": "${SLACK_WEBHOOK_URL}"
    },
    "on-degraded": {
      "enabled": true,
      "threshold-ms": 3000
    }
  }
}
```

## Status Levels

**Health statuses:**
- **Healthy:** Response < 1s, status 200
- **Degraded:** Response 1-3s, status 200
- **Unhealthy:** Response > 3s or status ≠ 200
- **Down:** Connection failed or timeout

## Uptime Reporting

**Generate uptime reports:**
```bash
# View current status
npx @gicm/cli uptime status

# Output:
# ╔════════════╦═════════╦══════════════╦═══════════╗
# ║ Service    ║ Status  ║ Uptime       ║ Avg Resp  ║
# ╠════════════╬═════════╬══════════════╬═══════════╣
# ║ API Server ║ Healthy ║ 99.98% (30d) ║ 145ms     ║
# ║ Frontend   ║ Healthy ║ 99.99% (30d) ║ 89ms      ║
# ║ Database   ║ Healthy ║ 100.0% (30d) ║ 12ms      ║
# ╚════════════╩═════════╩══════════════╩═══════════╝

# Historical report
npx @gicm/cli uptime report --days 30
```

## Integration with Monitoring Services

**Forward to external monitoring:**
```json
{
  "uptime-monitoring": true,
  "forward-to": {
    "datadog": {
      "enabled": true,
      "metric-name": "gicm.uptime"
    },
    "prometheus": {
      "enabled": true,
      "endpoint": "/metrics"
    }
  }
}
```

## Related Settings

- `monitoring-dashboard` - Monitoring integration
- `error-notification-webhook` - Alert notifications
- `network-timeout` - Health check timeout

## Examples

### Production Configuration
```json
{
  "uptime-monitoring": true,
  "health-checks": [
    {
      "name": "API",
      "url": "https://api.gicm.io/health",
      "interval-seconds": 60
    },
    {
      "name": "Frontend",
      "url": "https://gicm.io",
      "interval-seconds": 300
    }
  ],
  "alerts": {
    "on-failure": {
      "enabled": true,
      "webhook": "${SLACK_WEBHOOK_URL}",
      "retry-before-alert": 3
    }
  }
}
```

### Development
```json
{
  "uptime-monitoring": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
