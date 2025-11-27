# Message Queue Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master asynchronous messaging patterns with RabbitMQ, Redis, and Kafka.

## Quick Reference

### Redis Queue (BullMQ)
```typescript
import { Queue, Worker } from 'bullmq'

// Producer
const emailQueue = new Queue('emails', {
  connection: { host: 'localhost', port: 6379 }
})

await emailQueue.add('welcome-email', {
  to: 'user@example.com',
  name: 'John'
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
})

// Consumer
const worker = new Worker('emails', async (job) => {
  await sendEmail(job.data)
}, {
  connection: { host: 'localhost', port: 6379 }
})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err)
})
```

### RabbitMQ
```typescript
import amqp from 'amqplib'

// Producer
const connection = await amqp.connect('amqp://localhost')
const channel = await connection.createChannel()
await channel.assertQueue('tasks')
channel.sendToQueue('tasks', Buffer.from(JSON.stringify(task)))

// Consumer
channel.consume('tasks', (msg) => {
  const task = JSON.parse(msg.content.toString())
  processTask(task)
  channel.ack(msg)
})
```

## Common Patterns

### Work Queue
- Distribute tasks among workers
- Ensure exactly-once processing
- Handle failures with retries

### Pub/Sub
- One message to many consumers
- Event broadcasting
- Decoupled services

### Request/Reply
- RPC over message queues
- Correlation IDs for responses
- Timeout handling

## Best Practices

- Use dead letter queues for failed messages
- Implement idempotent message handlers
- Monitor queue depth and lag
- Set message TTL to prevent buildup
- Use priority queues for urgent tasks
