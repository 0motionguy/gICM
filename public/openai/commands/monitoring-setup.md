# /monitoring-setup

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Monitoring and alerting configuration for production applications. Setup metrics collection, dashboards, logs, traces, and alert thresholds.

## Usage

```bash
/monitoring-setup
/monitoring-setup --provider=datadog
/monitoring-setup --include-traces
```

## Features

- **Metrics Collection**: CPU, memory, request rates, latency
- **Log Aggregation**: Centralized logging with filtering and search
- **Distributed Tracing**: Request flow tracking across services
- **Alerting Rules**: Configure thresholds and notification channels
- **Dashboards**: Pre-built and custom dashboards
- **Health Checks**: Endpoint and service health monitoring
- **Error Tracking**: Exception and error aggregation
- **Performance Monitoring**: APM (Application Performance Monitoring)
- **Multi-provider Support**: Datadog, New Relic, Grafana, Sentry

## Configuration

```yaml
monitoring:
  provider: "datadog" # datadog, newrelic, grafana, sentry
  metricsCollection: true
  logAggregation: true
  distributedTracing: true
  errorTracking: true
  healthChecks: true
  alerting: true
  dashboards: true
```

## Example Output

```typescript
// Generated monitoring setup
import { StatsD } from 'node-dogstatsd';
import * as Sentry from '@sentry/node';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN!,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
});

// Initialize Datadog StatsD client for metrics
export const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: process.env.DD_AGENT_PORT || 8125,
  defaultTags: [
    `env:${process.env.NODE_ENV}`,
    `version:${process.env.APP_VERSION}`,
    `service:${process.env.SERVICE_NAME}`,
  ],
});

// Express middleware for request tracing
import express from 'express';

export function monitoringMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const start = Date.now();

  // Set user context for error tracking
  if (req.user) {
    Sentry.setUser({
      id: req.user.id,
      email: req.user.email,
    });
  }

  // Override res.json to track response
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - start;

    // Track metrics
    dogstatsd.timing('request.duration', duration, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode,
    });

    dogstatsd.histogram('request.size', JSON.stringify(data).length, {
      method: req.method,
    });

    return originalJson(data);
  };

  next();
}

// Health check endpoint
export function setupHealthCheck(app: express.Application) {
  app.get('/health', async (req, res) => {
    try {
      // Check database connection
      const dbHealthy = await checkDatabase();

      // Check redis connection
      const redisHealthy = await checkRedis();

      const healthy = dbHealthy && redisHealthy;

      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'up' : 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy ? 'up' : 'down',
          redis: redisHealthy ? 'up' : 'down',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Custom metrics
export const metrics = {
  // Counter metrics
  incrementApiCalls: (method: string, status: number) => {
    dogstatsd.increment('api.calls', 1, {
      method,
      status: `${status}`,
    });
  },

  // Gauge metrics
  setQueueSize: (size: number) => {
    dogstatsd.gauge('queue.size', size);
  },

  // Timing metrics
  recordQueryTime: (duration: number, query: string) => {
    dogstatsd.timing('db.query.duration', duration, {
      query: query.substring(0, 50),
    });
  },

  // Distribution metrics
  recordCacheHitRate: (hitRate: number) => {
    dogstatsd.histogram('cache.hit_rate', hitRate);
  },
};

// Error tracking
export function captureException(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    contexts: {
      app: context,
    },
  });
}

// Performance monitoring
export function startTransaction(name: string) {
  const transaction = Sentry.startTransaction({
    name,
    op: 'transaction',
  });

  return {
    addBreadcrumb: (message: string) => {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
      });
    },
    finish: () => transaction.finish(),
  };
}
```

```typescript
// Alert configuration (Datadog/Grafana)
export const alertRules = [
  {
    name: 'High API Latency',
    condition: 'p95_latency > 1000ms',
    duration: '5m',
    severity: 'warning',
    channels: ['slack', 'pagerduty'],
  },
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5%',
    duration: '2m',
    severity: 'critical',
    channels: ['slack', 'pagerduty', 'email'],
  },
  {
    name: 'Low Cache Hit Rate',
    condition: 'cache_hit_rate < 70%',
    duration: '10m',
    severity: 'info',
    channels: ['slack'],
  },
  {
    name: 'Database Connection Pool Exhausted',
    condition: 'db_connections > 95%',
    duration: '1m',
    severity: 'critical',
    channels: ['slack', 'pagerduty'],
  },
  {
    name: 'Memory Usage Critical',
    condition: 'memory_usage > 90%',
    duration: '2m',
    severity: 'critical',
    channels: ['pagerduty'],
  },
];
```

## Key Metrics to Monitor

- **Request Metrics**: RPS, latency (p50, p95, p99), error rate
- **Application Metrics**: Active connections, queue size, cache hit rate
- **Infrastructure**: CPU, memory, disk usage, network I/O
- **Database**: Query latency, connection pool, slow queries
- **Business Metrics**: Conversion rate, revenue, user growth

## Options

- `--provider`: Monitoring provider (datadog, newrelic, grafana)
- `--include-traces`: Distributed tracing
- `--include-logs`: Log aggregation
- `--include-apm`: Application performance monitoring
- `--output`: Custom output directory

## See Also

- `/analytics-setup` - User analytics
- `/load-test` - Performance testing
- `/perf-trace` - Performance profiling
