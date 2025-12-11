---
name: microservices-architecture
description: "{"
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Microservices Architecture

Enterprise patterns for building scalable, resilient microservices systems.

## Core Principles

### 1. Service Boundaries (Domain-Driven Design)
```
Token Service          NFT Service           User Service
├─ Token Creation      ├─ NFT Minting       ├─ Authentication
├─ Token Transfers     ├─ Collection Mgmt   ├─ User Profiles
└─ Token Metadata      └─ Marketplace       └─ Wallet Linking

Database per Service Pattern:
- Each service owns its data
- No direct database access between services
- Communication through APIs/events only
```

### 2. API Gateway Pattern
```typescript
// API Gateway with rate limiting & authentication
import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyJWT } from './auth';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);

// Route to microservices
app.use('/api/tokens', verifyJWT, proxy('http://token-service:3001'));
app.use('/api/nfts', verifyJWT, proxy('http://nft-service:3002'));
app.use('/api/users', verifyJWT, proxy('http://user-service:3003'));
```

### 3. Service Discovery (Consul/Eureka)
```typescript
import { ServiceRegistry } from '@consul/client';

class TokenService {
  private serviceRegistry: ServiceRegistry;

  async start() {
    // Register service with Consul
    await this.serviceRegistry.register({
      name: 'token-service',
      id: `token-service-${process.pid}`,
      address: '10.0.1.5',
      port: 3001,
      check: {
        http: 'http://10.0.1.5:3001/health',
        interval: '10s'
      }
    });
  }

  async callNFTService(endpoint: string) {
    // Discover NFT service instance
    const service = await this.serviceRegistry.discover('nft-service');
    const response = await fetch(`http://${service.address}:${service.port}${endpoint}`);
    return response.json();
  }
}
```

### 4. Circuit Breaker Pattern
```typescript
import CircuitBreaker from 'opossum';

// Protect against cascading failures
const options = {
  timeout: 3000, // If function takes longer than 3s, trigger failure
  errorThresholdPercentage: 50, // When 50% of requests fail
  resetTimeout: 30000 // After 30s, try again
};

const breaker = new CircuitBreaker(fetchNFTMetadata, options);

breaker.on('open', () => {
  console.log('Circuit breaker opened - too many failures');
});

breaker.on('halfOpen', () => {
  console.log('Circuit breaker half-open - testing recovery');
});

// Use circuit breaker
async function getNFTData(tokenId: string) {
  try {
    return await breaker.fire(tokenId);
  } catch (error) {
    // Fallback strategy
    return getCachedNFTData(tokenId);
  }
}
```

### 5. Event-Driven Architecture (Kafka)
```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'token-service',
  brokers: ['kafka1:9092', 'kafka2:9092']
});

// Producer - Token Service publishes events
const producer = kafka.producer();

async function createToken(params: TokenParams) {
  const token = await saveToken(params);

  // Publish event
  await producer.send({
    topic: 'token.created',
    messages: [{
      key: token.id,
      value: JSON.stringify({
        tokenId: token.id,
        creator: token.creator,
        timestamp: Date.now()
      })
    }]
  });

  return token;
}

// Consumer - Analytics Service subscribes to events
const consumer = kafka.consumer({ groupId: 'analytics-group' });

await consumer.subscribe({ topic: 'token.created' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    await trackTokenCreation(event);
  }
});
```

### 6. Saga Pattern (Distributed Transactions)
```typescript
// Orchestration-based Saga for token launch
class TokenLaunchSaga {
  async execute(params: LaunchParams) {
    const sagaState = {
      tokenCreated: false,
      liquidityAdded: false,
      marketingEnabled: false
    };

    try {
      // Step 1: Create token
      const token = await tokenService.create(params);
      sagaState.tokenCreated = true;

      // Step 2: Add liquidity
      await dexService.addLiquidity(token.id, params.liquidity);
      sagaState.liquidityAdded = true;

      // Step 3: Enable marketing
      await marketingService.activate(token.id);
      sagaState.marketingEnabled = true;

      return { success: true, tokenId: token.id };

    } catch (error) {
      // Compensating transactions (rollback)
      if (sagaState.marketingEnabled) {
        await marketingService.deactivate(token.id);
      }
      if (sagaState.liquidityAdded) {
        await dexService.removeLiquidity(token.id);
      }
      if (sagaState.tokenCreated) {
        await tokenService.delete(token.id);
      }

      throw new SagaError('Token launch failed', sagaState);
    }
  }
}
```

### 7. CQRS Pattern (Command Query Responsibility Segregation)
```typescript
// Write Model (Commands)
class TokenCommandService {
  async createToken(command: CreateTokenCommand) {
    // Validate command
    const token = new Token(command);

    // Save to write database
    await this.writeDB.save(token);

    // Publish event for read models
    await this.eventBus.publish('TokenCreated', token);

    return token.id;
  }
}

// Read Model (Queries)
class TokenQueryService {
  async getToken(id: string) {
    // Read from optimized read database (could be Redis, ES)
    return this.readDB.findById(id);
  }

  async searchTokens(criteria: SearchCriteria) {
    // Search in Elasticsearch for fast queries
    return this.elasticsearch.search(criteria);
  }

  // Event handler to update read model
  async onTokenCreated(event: TokenCreatedEvent) {
    await this.readDB.save(event.token);
    await this.elasticsearch.index(event.token);
    await this.redis.cache(event.token.id, event.token);
  }
}
```

### 8. Service Mesh (Istio)
```yaml
# Traffic management
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: token-service
spec:
  hosts:
  - token-service
  http:
  - match:
    - headers:
        x-version:
          exact: "v2"
    route:
    - destination:
        host: token-service
        subset: v2
  - route:
    - destination:
        host: token-service
        subset: v1
      weight: 90
    - destination:
        host: token-service
        subset: v2
      weight: 10  # Canary 10%

---
# Retry policy
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: nft-service
spec:
  hosts:
  - nft-service
  http:
  - retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure
```

## Observability Patterns

### 9. Distributed Tracing (Jaeger)
```typescript
import opentracing from 'opentracing';
import { initTracer } from 'jaeger-client';

const tracer = initTracer({
  serviceName: 'token-service',
  sampler: {
    type: 'const',
    param: 1
  }
});

// Create spans
async function createToken(params: TokenParams) {
  const span = tracer.startSpan('create_token');
  span.setTag('token.name', params.name);

  try {
    // Child span for database operation
    const dbSpan = tracer.startSpan('db.save', { childOf: span });
    const token = await db.save(params);
    dbSpan.finish();

    // Child span for event publishing
    const eventSpan = tracer.startSpan('event.publish', { childOf: span });
    await eventBus.publish('TokenCreated', token);
    eventSpan.finish();

    span.setTag('success', true);
    return token;

  } catch (error) {
    span.setTag('error', true);
    span.log({ event: 'error', message: error.message });
    throw error;

  } finally {
    span.finish();
  }
}
```

### 10. Centralized Logging (ELK Stack)
```typescript
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://elasticsearch:9200' },
      index: 'microservices-logs'
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Structured logging
logger.info('Token created', {
  service: 'token-service',
  tokenId: token.id,
  creator: user.id,
  traceId: span.context().toTraceId()
});
```

## Best Practices

- ✅ Each service owns its data (no shared databases)
- ✅ Use API Gateway for client requests
- ✅ Implement circuit breakers for resilience
- ✅ Use event-driven communication for loose coupling
- ✅ Distributed tracing for observability
- ✅ Service discovery for dynamic environments
- ❌ Don't create distributed monoliths
- ❌ Avoid chatty service-to-service calls
- ❌ Never expose internal service errors to clients

## Architecture Checklist

- [ ] Services are independently deployable
- [ ] Each service has its own database
- [ ] API Gateway for client requests
- [ ] Service discovery implemented
- [ ] Circuit breakers for external calls
- [ ] Event-driven architecture for async
- [ ] Distributed tracing configured
- [ ] Centralized logging setup
- [ ] Health checks for all services
- [ ] Auto-scaling configured

---

**Category:** Software Architecture
**Difficulty:** Advanced
**Prerequisites:** System design, distributed systems, Docker/Kubernetes
