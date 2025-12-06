# Prometheus Expert

> **ID:** `prometheus-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does


Transforms you into a Prometheus monitoring expert capable of designing, implementing, and optimizing production-grade observability systems. This skill provides deep knowledge of metrics collection, PromQL queries, alerting strategies, service discovery, recording rules, and multi-cluster federation.

You master the complete Prometheus ecosystem from instrumentation to visualization, including prom-client for Node.js applications, advanced PromQL for complex queries, Alertmanager for intelligent alert routing, and Kubernetes integration for cloud-native monitoring.

## When to Use

- **Instrument applications** with custom metrics using prom-client
- **Design metric collection strategies** for microservices and distributed systems
- **Write complex PromQL queries** for dashboards, alerts, and data analysis
- **Configure alerting rules** with proper thresholds and severity levels
- **Set up service discovery** for Kubernetes and Docker environments
- **Optimize query performance** with recording rules
- **Implement federation** for multi-cluster monitoring

## Core Capabilities

### 1. Metrics Collection

**Counter, Gauge, Histogram examples:**

```typescript
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

const httpDuration = new Histogram({
  name: 'http_duration_seconds',
  help: 'Request duration',
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const activeConnections = new Gauge({
  name: 'db_connections_active',
  help: 'Active DB connections',
  registers: [register]
});
```

**Express.js middleware:**

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, path: req.route?.path, status: res.statusCode.toString() });
    httpDuration.observe({ method: req.method, path: req.route?.path }, (Date.now() - start) / 1000);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 2. PromQL Mastery

```promql
# Request rate
sum by (service) (rate(http_requests_total[5m]))

# Error rate percentage
sum by (service) (rate(http_requests_total{status_code=~"5.."}[5m])) / sum by (service) (rate(http_requests_total[5m])) * 100

# 95th percentile latency
histogram_quantile(0.95, sum by (le, service) (rate(http_request_duration_seconds_bucket[5m])))

# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

### 3. Alerting Rules

```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: sum by (service) (rate(http_requests_total{status_code=~"5.."}[5m])) / sum by (service) (rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: ServiceDown
        expr: up{job=~"api-.*"} == 0
        for: 2m
        labels:
          severity: critical
```

**Alertmanager:**

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK'

route:
  group_by: ['alertname']
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
```

### 4. Service Discovery

**Kubernetes:**

```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

**ServiceMonitor:**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-server
spec:
  selector:
    matchLabels:
      app: api-server
  endpoints:
    - port: metrics
      interval: 30s
```

### 5. Recording Rules

```yaml
groups:
  - name: api_rules
    rules:
      - record: service:http_requests:rate5m
        expr: sum by (service) (rate(http_requests_total[5m]))

      - record: service:http_duration:p95
        expr: histogram_quantile(0.95, sum by (le, service) (rate(http_request_duration_seconds_bucket[5m])))
```

### 6. Federation

```yaml
scrape_configs:
  - job_name: 'federate'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{__name__=~"service:.*"}'
    static_configs:
      - targets: ['prometheus-regional.example.com:9090']
```

## Real-World Examples

### Example 1: Node.js Express Monitoring

Complete production setup with metrics collection and Prometheus configuration.

```typescript
import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register, prefix: 'nodejs_' });

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, path: req.route?.path, status: res.statusCode.toString() });
    httpDuration.observe({ method: req.method, path: req.route?.path }, (Date.now() - start) / 1000);
  });
  next();
});
```

**Prometheus config:**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nodejs-api'
    static_configs:
      - targets: ['localhost:3000']
```

### Example 2: Kubernetes Monitoring

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: main
spec:
  replicas: 2
  retention: 30d
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-server
spec:
  selector:
    matchLabels:
      app: api-server
  endpoints:
    - port: metrics
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
spec:
  groups:
    - name: api
      rules:
        - alert: HighErrorRate
          expr: sum by (pod) (rate(http_requests_total{status_code=~"5.."}[5m])) / sum by (pod) (rate(http_requests_total[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
```

## Related Skills

- `grafana-expert` - Visualization and dashboarding
- `kubernetes-monitoring` - K8s observability
- `nodejs-production` - Production Node.js practices
- `observability-patterns` - OpenTelemetry, tracing

## Further Reading

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [Google SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Thanos](https://thanos.io/)
- [VictoriaMetrics](https://victoriametrics.com/)
