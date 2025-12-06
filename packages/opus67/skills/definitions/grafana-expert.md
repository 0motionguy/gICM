# Grafana Expert

> **ID:** `grafana-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

Provides comprehensive expertise in Grafana for building production-grade observability solutions covering dashboard design, data source integration, alerting strategies, provisioning automation, visualization techniques, and advanced templating for multi-tenant monitoring environments.

## When to Use

- Design monitoring dashboards for applications, infrastructure, or business metrics
- Integrate multiple data sources (Prometheus, Loki, PostgreSQL, InfluxDB)
- Implement alerting strategies with notification channels and alert rules
- Provision dashboards as code for version control and automated deployment
- Create custom visualizations for time series, logs, traces, and business data
- Build templated dashboards that work across environments and regions
- Optimize query performance for large-scale monitoring systems
- Deploy Grafana in containers (Docker, Kubernetes) with proper configuration

## Core Capabilities

### 1. Dashboard Design

Grafana dashboards consist of panels organized in rows with variables for dynamic queries.

**Best Practices:**
- Use consistent color schemes and thresholds across panels
- Group related metrics in collapsible rows
- Add annotations for deployments and incidents
- Leverage templating for reusable dashboards
- Use appropriate refresh intervals (30s-1m)
- Keep panels focused on specific metrics

**Panel Organization:**

```json
{
  "dashboard": {
    "title": "Application Performance",
    "tags": ["performance", "application"],
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(http_requests_total, environment)"
        }
      ]
    }
  }
}
```

**Gotchas:**
- Panel IDs must be unique across the dashboard
- Variable refresh settings affect performance
- Too many panels (>30) can cause performance issues
- Deep variable chains can create circular dependencies

### 2. Data Source Configuration

#### Prometheus

```yaml
# provisioning/datasources/prometheus.yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: 30s
      queryTimeout: 60s
      httpMethod: POST
```

**PromQL Patterns:**

```promql
# Request rate
rate(http_requests_total[5m])

# Error percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# P95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Top N queries
topk(10, sum by (endpoint) (rate(http_requests_total[5m])))
```

#### Loki

```yaml
# provisioning/datasources/loki.yaml
apiVersion: 1
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      maxLines: 1000
```

**LogQL Patterns:**

```logql
# Error logs
{namespace="production"} |= "error" | json | severity="ERROR"

# Rate of errors
rate({job="application"} |= "error" [5m])

# Extract status codes
sum by (status) (rate({job="nginx"} | json [5m]))
```

#### PostgreSQL

```yaml
# provisioning/datasources/postgres.yaml
apiVersion: 1
datasources:
  - name: PostgreSQL
    type: postgres
    url: postgres:5432
    database: metrics
    user: grafana
    secureJsonData:
      password: ${POSTGRES_PASSWORD}
    jsonData:
      timescaledb: true
```

**Query Examples:**

```sql
SELECT
  time_bucket
('5 minutes', time) AS time,
  service,
  avg(response_time) as avg_response_time
FROM metrics
WHERE $__timeFilter(time) AND service = 
''
GROUP BY 1, 2
ORDER BY 1
```

### 3. Alerting System

#### Alert Rules

```yaml
# provisioning/alerting/rules.yaml
apiVersion: 1
groups:
  - name: application-alerts
    interval: 1m
    rules:
      - uid: high-error-rate
        title: High Error Rate
        condition: A
        data:
          - refId: A
            expr: |
              (sum(rate(http_requests_total{status=~"5.."}[5m])) /
               sum(rate(http_requests_total[5m]))) > 0.05
        for: 5m
        annotations:
          description: "Error rate above 5%"
        labels:
          severity: critical
```

#### Notification Channels

```yaml
# provisioning/alerting/notification-policies.yaml
apiVersion: 1
contactPoints:
  - name: slack-critical
    type: slack
    settings:
      url: ${SLACK_WEBHOOK_URL}
      title: "Alert: {{ .GroupLabels.alertname }}"
  
  - name: pagerduty-critical
    type: pagerduty
    settings:
      integrationKey: ${PAGERDUTY_KEY}
      severity: critical

policies:
  - receiver: slack-critical
    object_matchers:
      - ["severity", "=", "critical"]
    group_by: ["alertname"]
    group_wait: 10s
    repeat_interval: 4h
```

### 4. Provisioning as Code

**Directory Structure:**

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   ├── prometheus.yaml
│   │   ├── loki.yaml
│   │   └── postgres.yaml
│   ├── dashboards/
│   │   ├── dashboard-config.yaml
│   │   └── dashboards/
│   ├── alerting/
│   │   ├── rules.yaml
│   │   └── notification-policies.yaml
│   └── plugins/
└── grafana.ini
```

**Docker Deployment:**

```yaml
# docker-compose.yml
version: 
'3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_DATABASE_TYPE=postgres
      - GF_DATABASE_HOST=postgres:5432
      - GF_DATABASE_NAME=grafana
    volumes:
      - grafana-data:/var/lib/grafana
      - ./provisioning:/etc/grafana/provisioning
    networks:
      - monitoring

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=grafana
      - POSTGRES_USER=grafana
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - monitoring

volumes:
  grafana-data:
  postgres-data:

networks:
  monitoring:
```

**Kubernetes Deployment:**

```yaml
# kubernetes/grafana.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:10.2.0
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: monitoring
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: grafana
```

### 5. Visualization Types

#### Time Series Panel

```json
{
  "type": "timeseries",
  "title": "Request Latency",
  "targets": [
    {
      "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
      "legendFormat": "P95"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "s",
      "thresholds": {
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1, "color": "yellow"},
          {"value": 2, "color": "red"}
        ]
      }
    }
  }
}
```

#### Stat Panel

```json
{
  "type": "stat",
  "title": "Success Rate",
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{status=~\\\"2..\\\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "thresholds": {
        "steps": [
          {"value": null, "color": "red"},
          {"value": 95, "color": "yellow"},
          {"value": 99, "color": "green"}
        ]
      }
    }
  },
  "options": {
    "colorMode": "background",
    "graphMode": "area"
  }
}
```

#### Table Panel

```json
{
  "type": "table",
  "title": "Top Endpoints",
  "targets": [
    {
      "expr": "topk(10, sum by (endpoint) (rate(http_requests_total[5m])))",
      "format": "table",
      "instant": true
    }
  ],
  "fieldConfig": {
    "overrides": [
      {
        "matcher": {"id": "byName", "options": "Value"},
        "properties": [
          {"id": "unit", "value": "reqps"},
          {"id": "custom.displayMode", "value": "gradient-gauge"}
        ]
      }
    ]
  }
}
```

#### Logs Panel

```json
{
  "type": "logs",
  "title": "Application Logs",
  "targets": [
    {
      "expr": "{namespace=\\\"$namespace\\\", pod=~\\\"$pod\\\"} |= \\\"$search\\\" | json"
    }
  ],
  "options": {
    "showTime": true,
    "showLabels": true,
    "wrapLogMessage": true
  }
}
```

#### Gauge Panel

```json
{
  "type": "gauge",
  "title": "CPU Usage",
  "targets": [
    {
      "expr": "avg(rate(container_cpu_usage_seconds_total[5m])) * 100"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "min": 0,
      "max": 100,
      "thresholds": {
        "steps": [
          {"value": null, "color": "green"},
          {"value": 70, "color": "yellow"},
          {"value": 90, "color": "red"}
        ]
      }
    }
  }
}
```

### 6. Templating & Variables

#### Query Variables

```json
{
  "name": "namespace",
  "type": "query",
  "datasource": "Prometheus",
  "query": "label_values(kube_pod_info, namespace)",
  "multi": true,
  "includeAll": true,
  "refresh": 1
}
```

#### Custom Variables

```json
{
  "name": "environment",
  "type": "custom",
  "query": "production,staging,development",
  "current": {"value": "production"}
}
```

#### Interval Variables

```json
{
  "name": "interval",
  "type": "interval",
  "query": "30s,1m,5m,10m,30m",
  "auto": true,
  "auto_count": 30
}
```

#### Chained Variables

```json
{
  "templating": {
    "list": [
      {
        "name": "cluster",
        "query": "label_values(kube_node_info, cluster)"
      },
      {
        "name": "namespace",
        "query": "label_values(kube_pod_info{cluster=\\\"$cluster\\\"}, namespace)"
      },
      {
        "name": "pod",
        "query": "label_values(kube_pod_info{namespace=\\\"$namespace\\\"}, pod)"
      }
    ]
  }
}
```

## Real-World Examples

### Example 1: Application Performance Dashboard

Complete production-ready dashboard for monitoring application metrics.

```json
{
  "dashboard": {
    "uid": "app-perf",
    "title": "Application Performance",
    "tags": ["application", "performance"],
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "query": "label_values(http_requests_total, environment)"
        },
        {
          "name": "service",
          "type": "query",
          "query": "label_values(http_requests_total{environment=\\\"$environment\\\"}, service)",
          "multi": true,
          "includeAll": true
        }
      ]
    },
    "panels": [
      {
        "id": 1,
        "type": "stat",
        "title": "Request Rate",
        "gridPos": {"h": 4, "w": 6, "x": 0, "y": 0},
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{service=~\\\"$service\\\"}[5m]))"
          }
        ],
        "fieldConfig": {"defaults": {"unit": "reqps"}}
      },
      {
        "id": 2,
        "type": "stat",
        "title": "Error Rate",
        "gridPos": {"h": 4, "w": 6, "x": 6, "y": 0},
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\\\"5..\\\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"value": null, "color": "green"},
                {"value": 1, "color": "yellow"},
                {"value": 5, "color": "red"}
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "type": "timeseries",
        "title": "Latency Percentiles",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 4},
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "P99"
          }
        ],
        "fieldConfig": {"defaults": {"unit": "s"}}
      }
    ]
  }
}
```

### Example 2: Infrastructure Overview Dashboard

Complete Kubernetes cluster monitoring dashboard.

```json
{
  "dashboard": {
    "uid": "infra-overview",
    "title": "Infrastructure Overview",
    "tags": ["infrastructure", "kubernetes"],
    "refresh": "1m",
    "templating": {
      "list": [
        {
          "name": "cluster",
          "type": "query",
          "query": "label_values(kube_node_info, cluster)"
        },
        {
          "name": "node",
          "type": "query",
          "query": "label_values(kube_node_info{cluster=\\\"$cluster\\\"}, node)",
          "multi": true,
          "includeAll": true
        }
      ]
    },
    "panels": [
      {
        "id": 1,
        "type": "stat",
        "title": "Total Nodes",
        "gridPos": {"h": 4, "w": 4, "x": 0, "y": 0},
        "targets": [
          {"expr": "count(kube_node_info{cluster=\\\"$cluster\\\"})"}
        ]
      },
      {
        "id": 2,
        "type": "timeseries",
        "title": "CPU Usage by Node",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 4},
        "targets": [
          {
            "expr": "sum by (node) (rate(node_cpu_seconds_total{cluster=\\\"$cluster\\\", mode\!=\\\"idle\\\"}[5m])) * 100",
            "legendFormat": "{{node}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "max": 100
          }
        }
      },
      {
        "id": 3,
        "type": "table",
        "title": "Top Pods by CPU",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 12},
        "targets": [
          {
            "expr": "topk(20, sum by (namespace, pod) (rate(container_cpu_usage_seconds_total[5m])) * 100)",
            "format": "table",
            "instant": true
          }
        ]
      }
    ]
  }
}
```

## Related Skills

- **prometheus-expert** - Deep Prometheus query optimization
- **loki-expert** - Advanced log aggregation and LogQL
- **kubernetes-advanced** - K8s observability strategies
- **docker-expert** - Container monitoring
- **postgres-advanced** - PostgreSQL metrics storage
- **observability-sre** - SRE observability practices
- **monitoring-architecture** - Scalable monitoring design
- **influxdb-expert** - Time series database optimization

## Further Reading

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Prometheus Integration](https://prometheus.io/docs/visualization/grafana/)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [Provisioning Guide](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Alerting Rules](https://grafana.com/docs/grafana/latest/alerting/)
- [LogQL Documentation](https://grafana.com/docs/loki/latest/logql/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards Library](https://grafana.com/grafana/dashboards/)
- [Kubernetes Monitoring Guide](https://grafana.com/docs/grafana-cloud/kubernetes-monitoring/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
