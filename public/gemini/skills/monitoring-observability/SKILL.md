# Monitoring and Observability

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master application monitoring, logging, metrics, and tracing for production systems.

## Quick Reference

### Three Pillars of Observability

1. **Metrics**: Quantitative data (CPU, memory, request rate)
2. **Logs**: Event records with context
3. **Traces**: Request flow through distributed systems

### Example Prometheus Metrics
```typescript
import { Counter, Histogram, Gauge } from 'prom-client'

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
})

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
})

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Active WebSocket connections'
})
```

### Structured Logging
```typescript
logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: Date.now(),
  requestId: req.id
})
```

## Best Practices

- Set up alerts for critical metrics (error rate, latency)
- Use distributed tracing for microservices
- Implement health check endpoints
- Monitor business metrics, not just technical ones
- Set up dashboards for key metrics
