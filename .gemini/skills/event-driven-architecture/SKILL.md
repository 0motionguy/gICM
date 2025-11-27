# Event-Driven Architecture

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Publish-subscribe, event brokers, reactive systems, and loose coupling with events.

## Core Concepts

### Event Broker Pattern
Central event distribution.

```typescript
class EventBroker {
  private subscribers: Map<string, Function[]> = new Map();

  subscribe(eventType: string, handler: Function): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
  }

  async emit(eventType: string, data: any): Promise<void> {
    const handlers = this.subscribers.get(eventType) || [];
    await Promise.all(handlers.map(h => h(data)));
  }
}
```

### Producer-Consumer Pattern
Decoupled event publishing and consumption.

```typescript
class EventProducer {
  async publishEvent(event: DomainEvent): Promise<void> {
    await this.eventBroker.emit(event.type, event);
  }
}

class EventConsumer {
  async startConsuming(): Promise<void> {
    this.eventBroker.subscribe('order.created', async (event) => {
      await this.handleOrderCreated(event);
    });

    this.eventBroker.subscribe('payment.processed', async (event) => {
      await this.handlePaymentProcessed(event);
    });
  }

  private async handleOrderCreated(event: OrderCreated): Promise<void> {
    // Process order
  }
}
```

### Event Enrichment
Add context to events.

```typescript
class EventEnricher {
  async enrich(event: DomainEvent): Promise<EnrichedEvent> {
    const user = await this.userService.getUser(event.userId);
    const metadata = await this.metadataService.getMetadata(event.id);

    return {
      ...event,
      user,
      metadata,
      processedAt: new Date()
    };
  }
}
```

### Error Handling
Dead letter queues for failed processing.

```typescript
class RobustEventConsumer {
  async processEvent(event: DomainEvent): Promise<void> {
    try {
      await this.handleEvent(event);
    } catch (error) {
      await this.deadLetterQueue.add({
        event,
        error: error.message,
        timestamp: new Date()
      });
    }
  }
}
```

## Best Practices

1. **Event Versioning**: Version event schemas
2. **Ordering Guarantees**: Understand per-partition ordering
3. **Exactly-Once Processing**: Handle duplicates
4. **Monitoring**: Track event flow
5. **Testing**: Test failure scenarios

## Related Skills

- Event Sourcing Patterns
- CQRS Implementation
- Saga Pattern Implementation
- Kafka Stream Processing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1345 | **Remixes**: 412
