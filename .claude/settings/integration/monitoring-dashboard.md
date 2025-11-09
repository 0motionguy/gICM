# Monitoring Dashboard

Monitoring service integration. Options: datadog, newrelic, grafana, none. Recommended: datadog for comprehensive monitoring.

## Overview

Integrates with monitoring and observability platforms for metrics, logs, and traces. Provides real-time visibility into application performance and health.

## Configuration

**Category:** Integration
**Type:** String (enum)
**Default:** none
**Options:** datadog, newrelic, grafana, prometheus, none

## Usage

```bash
# Datadog (recommended)
npx @gicm/cli settings add integration/monitoring-dashboard --value datadog

# New Relic
npx @gicm/cli settings add integration/monitoring-dashboard --value newrelic

# Grafana
npx @gicm/cli settings add integration/monitoring-dashboard --value grafana

# Prometheus
npx @gicm/cli settings add integration/monitoring-dashboard --value prometheus

# Disable monitoring (default)
npx @gicm/cli settings add integration/monitoring-dashboard --value none
```

## Service Comparison

| Service | Best For | Pricing | Cloud/Self-Hosted |
|---------|----------|---------|-------------------|
| Datadog | Full-stack observability | $15/host/mo | Cloud |
| New Relic | APM and infrastructure | Free tier available | Cloud |
| Grafana | Custom dashboards | Free (OSS) | Both |
| Prometheus | Metrics and alerting | Free (OSS) | Self-hosted |

## Environment Variables

**Datadog:**
```bash
DATADOG_API_KEY=your_api_key
DATADOG_SITE=datadoghq.com
```

**New Relic:**
```bash
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_APP_NAME=gicm-app
```

**Grafana:**
```bash
GRAFANA_API_KEY=your_api_key
GRAFANA_URL=https://your-instance.grafana.net
```

## Metrics Collected

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Throughput

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**Custom Metrics:**
- Token usage
- Agent invocations
- Deployment frequency
- Build times

## Affected Components

- `monitoring-specialist` - Monitoring orchestration
- `performance-profiler` - Performance analysis

## Dashboard Configuration

**Pre-built dashboards:**
```json
{
  "monitoring-dashboard": "datadog",
  "dashboards": {
    "application": {
      "enabled": true,
      "widgets": [
        "request-rate",
        "response-time",
        "error-rate",
        "apdex-score"
      ]
    },
    "infrastructure": {
      "enabled": true
    },
    "custom": {
      "enabled": true,
      "file": ".claude/dashboards/custom.json"
    }
  }
}
```

## Alerting

**Configure alerts:**
```json
{
  "monitoring-dashboard": "datadog",
  "alerts": {
    "high-error-rate": {
      "enabled": true,
      "threshold": 5,
      "window": "5m",
      "notification": "${SLACK_WEBHOOK_URL}"
    },
    "slow-response-time": {
      "enabled": true,
      "threshold": 1000,
      "percentile": 95
    },
    "high-cpu-usage": {
      "enabled": true,
      "threshold": 80
    }
  }
}
```

## Distributed Tracing

**Enable APM tracing:**
```json
{
  "monitoring-dashboard": "datadog",
  "tracing": {
    "enabled": true,
    "sample-rate": 0.1,
    "service-name": "gicm-api",
    "env": "production"
  }
}
```

## Log Aggregation

**Forward logs to monitoring service:**
```json
{
  "monitoring-dashboard": "datadog",
  "log-forwarding": {
    "enabled": true,
    "log-level": "info",
    "include-source": true
  }
}
```

## Cost Optimization

**Reduce monitoring costs:**
```json
{
  "monitoring-dashboard": "datadog",
  "cost-optimization": {
    "metric-sampling-rate": 0.1,
    "log-sampling-rate": 0.5,
    "trace-sampling-rate": 0.1,
    "retention-days": 15
  }
}
```

## Related Settings

- `error-reporting-service` - Error tracking
- `performance-profiling` - Local profiling
- `audit-log-enabled` - Local logging

## Examples

### Production Configuration (Datadog)
```json
{
  "monitoring-dashboard": "datadog",
  "dashboards": {
    "application": true,
    "infrastructure": true
  },
  "alerts": {
    "high-error-rate": {
      "enabled": true,
      "threshold": 5,
      "notification": "${SLACK_WEBHOOK_URL}"
    }
  },
  "tracing": {
    "enabled": true,
    "sample-rate": 0.1
  }
}
```

### Self-Hosted (Grafana + Prometheus)
```json
{
  "monitoring-dashboard": "grafana",
  "prometheus": {
    "enabled": true,
    "scrape-interval": "15s",
    "endpoint": "/metrics"
  },
  "grafana": {
    "url": "http://localhost:3000",
    "auto-provision-dashboards": true
  }
}
```

### Development
```json
{
  "monitoring-dashboard": "none"
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
