# Distributed Tracing

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> OpenTelemetry, Jaeger, tracing across microservices for full request visibility.

## Core Concepts

### Spans
Individual units of work in a trace.

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('app-tracer');

async function processOrder(order: Order): Promise<void> {
  const span = tracer.startSpan('processOrder');

  try {
    const reservationSpan = tracer.startSpan('reserveInventory', { parent: span });
    await inventoryService.reserve(order);
    reservationSpan.end();

    const paymentSpan = tracer.startSpan('processPayment', { parent: span });
    await paymentService.charge(order.amount);
    paymentSpan.end();
  } finally {
    span.end();
  }
}
```

### Context Propagation
Propagate trace context across service boundaries.

```typescript
import { W3CTraceContextPropagator } from '@opentelemetry/core';

const propagator = new W3CTraceContextPropagator();

// In client
const headers = {};
propagator.inject(
  context.active(),
  headers,
  (headers, key, value) => { headers[key] = value; }
);

// In server
const extractedContext = propagator.extract(
  context.active(),
  req.headers,
  (headers, key) => headers[key]
);
```

### Instrumentation
Automatic tracing of libraries.

```typescript
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';

const httpInstrumentation = new HttpInstrumentation();
const expressInstrumentation = new ExpressInstrumentation();
const mongodbInstrumentation = new MongoDBInstrumentation();
```

## Best Practices

1. **Sampling**: Use head-based sampling for high-volume services
2. **Baggage**: Pass request context through trace baggage
3. **Attributes**: Add meaningful span attributes
4. **Cardinality**: Control dimension explosion
5. **Retention**: Balance cost vs insight

## Related Skills

- Service Mesh (Istio)
- Microservices Architecture
- Monitoring & Observability

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1089 | **Remixes**: 334
