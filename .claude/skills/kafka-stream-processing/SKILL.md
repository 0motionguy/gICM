---
name: kafka-stream-processing
description: "Event stream processing with Kafka Streams and Apache Flink for real-time data."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Kafka Stream Processing

> Event stream processing with Kafka Streams and Apache Flink for real-time data.

## Core Concepts

### Topologies
Processing topology definition.

```typescript
const topology = new KafkaStreams.Topology();

topology
  .source('input-topic')
  .map((key, value) => [key, JSON.parse(value)])
  .filter((key, value) => value.amount > 100)
  .to('output-topic');
```

### Stateless Operations
One-to-one transformations.

```typescript
stream.map((record) => ({
  ...record,
  amount_cents: record.amount * 100
}));

stream.flatMap((record) => [
  record,
  { ...record, duplicated: true }
]);

stream.filter((record) => record.status === 'active');
```

### Stateful Operations
Aggregations and joins.

```typescript
// Aggregation
stream
  .groupByKey()
  .aggregate(
    () => 0,
    (key, value, aggregate) => aggregate + value.amount,
    Materialized.as('sales-store')
  );

// Join
orders.join(users, (orderId) => orderId.userId);
```

### Windowing
Time-based aggregations.

```typescript
stream
  .groupByKey()
  .windowedBy(TimeWindows.of('5m'))
  .aggregate(
    () => ({ count: 0, sum: 0 }),
    (key, value, agg) => ({
      count: agg.count + 1,
      sum: agg.sum + value.amount
    })
  );
```

## Best Practices

1. **Exactly-Once Semantics**: Enable idempotent processing
2. **Error Handling**: Use dead letter queues
3. **State Cleanup**: Set retention policies
4. **Monitoring**: Track lag and throughput
5. **Testing**: Use TopologyTestDriver

## Related Skills

- Message Queue Patterns
- Event-Driven Architecture
- Distributed Tracing
- Data Consistency Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1123 | **Remixes**: 356
