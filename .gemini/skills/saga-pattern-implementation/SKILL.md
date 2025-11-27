# Saga Pattern Implementation

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Distributed transactions: orchestration vs choreography patterns for multi-service transactions.

## Core Concepts

### Orchestrator-Based Saga
Central coordinator orchestrates transaction flow.

```typescript
class OrderSaga {
  async executeOrder(order: Order): Promise<void> {
    // Step 1: Reserve inventory
    const reservationId = await this.inventoryService.reserve(order);

    try {
      // Step 2: Process payment
      const paymentId = await this.paymentService.charge(order.amount);

      // Step 3: Confirm order
      await this.orderService.confirm(order.id);
    } catch (error) {
      // Compensating transactions
      await this.inventoryService.release(reservationId);
      throw error;
    }
  }
}
```

### Choreography-Based Saga
Services react to events without central coordinator.

```typescript
// Order Service
async function createOrder(order: Order): Promise<void> {
  await db.orders.insert(order);
  await eventBus.emit('order.created', order);
}

// Inventory Service
eventBus.on('order.created', async (order) => {
  const reserved = await inventoryService.reserve(order);
  await eventBus.emit('inventory.reserved', { order, reserved });
});

// Payment Service
eventBus.on('inventory.reserved', async (event) => {
  await paymentService.charge(event.order.amount);
  await eventBus.emit('payment.completed', event);
});
```

### Compensating Transactions
Undo operations on failure.

```typescript
interface SagaStep {
  action: () => Promise<any>;
  compensate: (result: any) => Promise<void>;
}

async function executeSaga(steps: SagaStep[]): Promise<void> {
  const results: any[] = [];

  try {
    for (const step of steps) {
      results.push(await step.action());
    }
  } catch (error) {
    // Rollback in reverse order
    for (let i = results.length - 1; i >= 0; i--) {
      await steps[i].compensate(results[i]);
    }
    throw error;
  }
}
```

## Best Practices

1. **Idempotency**: Make all operations idempotent
2. **Timeout Handling**: Define timeouts for each step
3. **Monitoring**: Track saga execution flow
4. **Error Handling**: Clear error recovery paths
5. **Testing**: Test both happy and failure paths

## Related Skills

- Event Sourcing Patterns
- CQRS Implementation
- Event-Driven Architecture
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 912 | **Remixes**: 298
