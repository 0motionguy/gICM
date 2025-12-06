# Inngest Expert

> **ID:** `inngest-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

Provides expert-level knowledge for building event-driven workflows with Inngest. This skill covers everything from simple event triggers to complex multi-step functions with retries, fan-out patterns, and sophisticated error handling. You'll learn to build reliable, durable workflows that handle millions of events with built-in observability.

Inngest transforms your serverless functions into durable, multi-step workflows without managing queues, state machines, or complex infrastructure. It provides built-in retries, delays, fan-out, and observability out of the box.

## When to Use

Use this skill when you need to:

- **Build event-driven workflows** - User onboarding, payment processing, data pipelines
- **Replace complex queue systems** - Move from BullMQ/SQS to simpler event-driven architecture
- **Add background job processing** - Emails, notifications, data processing
- **Implement saga patterns** - Distributed transactions with compensating actions
- **Create scheduled jobs** - Cron jobs, delayed tasks, time-based workflows
- **Handle async operations** - Long-running tasks, external API calls with retries
- **Build reliable systems** - Automatic retries, dead letter queues, circuit breakers
- **Add observability** - Track every step, debug failed workflows, monitor performance

**Don't use this skill when:**
- You need real-time, synchronous responses (< 100ms)
- Simple one-off background tasks (use Next.js Server Actions)
- You already have a working queue system and don't need step functions

## Core Capabilities

### 1. Event-Driven Functions

Inngest functions are triggered by events. Events are JSON payloads sent to Inngest that trigger one or more functions.

#### Basic Function Definition

```typescript
import { inngest } from '@/inngest/client';

export const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    name: 'Send Welcome Email',
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    const { email, name, userId } = event.data;

    // Send email
    await step.run('send-email', async () => {
      return await sendEmail({
        to: email,
        template: 'welcome',
        data: { name },
      });
    });

    // Track in analytics
    await step.run('track-event', async () => {
      return await analytics.track(userId, 'welcome_email_sent');
    });

    return { success: true, userId };
  }
);
```

#### Event Triggering

```typescript
// From API routes
import { inngest } from '@/inngest/client';

export async function POST(req: Request) {
  const user = await req.json();

  // Send event to Inngest
  await inngest.send({
    name: 'user/created',
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  });

  return Response.json({ success: true });
}
```

#### Multiple Event Triggers

```typescript
export const processPayment = inngest.createFunction(
  {
    id: 'process-payment',
    name: 'Process Payment',
  },
  // Trigger on multiple events
  {
    event: 'payment/created',
    // OR match multiple event names
    // event: ['payment/created', 'payment/retry'],
  },
  async ({ event, step }) => {
    const payment = event.data;

    const result = await step.run('charge-card', async () => {
      return await stripe.charges.create({
        amount: payment.amount,
        currency: 'usd',
        source: payment.token,
      });
    });

    if (result.status === 'succeeded') {
      await step.run('send-receipt', async () => {
        return await sendEmail({
          to: payment.email,
          template: 'receipt',
          data: { amount: payment.amount },
        });
      });
    }

    return result;
  }
);
```

#### Event Matching with Expressions

```typescript
export const handlePremiumUser = inngest.createFunction(
  {
    id: 'handle-premium-user',
    name: 'Handle Premium User',
  },
  {
    event: 'user/created',
    // Only trigger for premium users
    if: 'event.data.plan == "premium"',
  },
  async ({ event, step }) => {
    // This only runs for premium users
    await step.run('send-premium-welcome', async () => {
      return await sendEmail({
        to: event.data.email,
        template: 'premium-welcome',
      });
    });
  }
);
```

#### Batch Event Sending

```typescript
// Send multiple events at once
await inngest.send([
  {
    name: 'user/created',
    data: { userId: '1', email: 'user1@example.com' },
  },
  {
    name: 'user/created',
    data: { userId: '2', email: 'user2@example.com' },
  },
  {
    name: 'analytics/track',
    data: { event: 'bulk_import', count: 2 },
  },
]);
```

### 2. Step Functions

Steps are the core of Inngest's durability. Each step is executed independently and retried on failure. If a function fails mid-execution, completed steps are not re-run.

#### Basic Steps

```typescript
export const userOnboarding = inngest.createFunction(
  {
    id: 'user-onboarding',
    name: 'User Onboarding Flow',
    retries: 3,
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    // Step 1: Create user in database
    const user = await step.run('create-user', async () => {
      return await db.user.create({
        data: {
          email: event.data.email,
          name: event.data.name,
        },
      });
    });

    // Step 2: Send welcome email
    await step.run('send-welcome-email', async () => {
      return await sendEmail({
        to: user.email,
        template: 'welcome',
        data: { name: user.name },
      });
    });

    // Step 3: Create trial subscription
    const subscription = await step.run('create-trial', async () => {
      return await stripe.subscriptions.create({
        customer: user.stripeId,
        items: [{ price: 'price_trial' }],
        trial_period_days: 14,
      });
    });

    // Step 4: Schedule follow-up
    await step.run('schedule-followup', async () => {
      return await inngest.send({
        name: 'user/followup',
        data: { userId: user.id },
        // Send in 3 days
        ts: Date.now() + 3 * 24 * 60 * 60 * 1000,
      });
    });

    return { user, subscription };
  }
);
```

#### Step Sleep (Delays)

```typescript
export const trialReminders = inngest.createFunction(
  {
    id: 'trial-reminders',
    name: 'Send Trial Reminders',
  },
  { event: 'user/trial-started' },
  async ({ event, step }) => {
    const { userId, email, trialEnds } = event.data;

    // Wait 7 days
    await step.sleep('wait-7-days', '7d');

    await step.run('send-7-day-reminder', async () => {
      return await sendEmail({
        to: email,
        template: 'trial-7-days-left',
      });
    });

    // Wait 6 more days (13 days total)
    await step.sleep('wait-6-days', '6d');

    await step.run('send-1-day-reminder', async () => {
      return await sendEmail({
        to: email,
        template: 'trial-1-day-left',
      });
    });

    // Wait 1 more day (14 days total)
    await step.sleep('wait-1-day', '1d');

    await step.run('convert-or-cancel', async () => {
      const user = await db.user.findUnique({ where: { id: userId } });

      if (!user.hasPaymentMethod) {
        await stripe.subscriptions.cancel(user.subscriptionId);
        await sendEmail({
          to: email,
          template: 'trial-ended',
        });
      }
    });
  }
);
```

#### Step Wait for Event

```typescript
export const paymentFlow = inngest.createFunction(
  {
    id: 'payment-flow',
    name: 'Payment Flow with Confirmation',
  },
  { event: 'payment/initiated' },
  async ({ event, step }) => {
    const { paymentId, userId, amount } = event.data;

    // Send confirmation email
    await step.run('send-confirmation-email', async () => {
      return await sendEmail({
        to: event.data.email,
        template: 'confirm-payment',
        data: {
          confirmLink: `https://app.example.com/confirm/${paymentId}`,
          amount,
        },
      });
    });

    // Wait for user to confirm (timeout after 24 hours)
    const confirmation = await step.waitForEvent('wait-for-confirmation', {
      event: 'payment/confirmed',
      match: 'data.paymentId',
      timeout: '24h',
    });

    if (!confirmation) {
      // Timeout - cancel payment
      await step.run('cancel-payment', async () => {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: 'cancelled' },
        });

        await sendEmail({
          to: event.data.email,
          template: 'payment-cancelled',
        });
      });

      return { status: 'cancelled', reason: 'timeout' };
    }

    // Process payment
    const charge = await step.run('process-payment', async () => {
      return await stripe.charges.create({
        amount,
        currency: 'usd',
        customer: confirmation.data.stripeCustomerId,
      });
    });

    await step.run('send-receipt', async () => {
      return await sendEmail({
        to: event.data.email,
        template: 'receipt',
        data: { charge },
      });
    });

    return { status: 'completed', charge };
  }
);
```

#### Step Invoke (Call other functions)

```typescript
export const processOrder = inngest.createFunction(
  {
    id: 'process-order',
    name: 'Process Order',
  },
  { event: 'order/created' },
  async ({ event, step }) => {
    const order = event.data;

    // Invoke payment function and wait for result
    const payment = await step.invoke('process-payment', {
      function: processPayment,
      data: {
        orderId: order.id,
        amount: order.total,
        customerId: order.customerId,
      },
    });

    if (payment.status === 'failed') {
      throw new Error('Payment failed');
    }

    // Invoke fulfillment function
    await step.invoke('fulfill-order', {
      function: fulfillOrder,
      data: {
        orderId: order.id,
        items: order.items,
      },
    });

    return { order, payment };
  }
);
```

### 3. Scheduling

Inngest provides powerful scheduling capabilities for cron jobs and delayed execution.

#### Cron Jobs

```typescript
export const dailyReport = inngest.createFunction(
  {
    id: 'daily-report',
    name: 'Generate Daily Report',
  },
  // Runs every day at 9 AM UTC
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const metrics = await step.run('fetch-metrics', async () => {
      return await db.metrics.aggregate({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          revenue: true,
          users: true,
        },
      });
    });

    await step.run('send-report', async () => {
      return await sendEmail({
        to: 'team@example.com',
        template: 'daily-report',
        data: metrics,
      });
    });

    return metrics;
  }
);
```

#### Multiple Cron Schedules

```typescript
export const backupDatabase = inngest.createFunction(
  {
    id: 'backup-database',
    name: 'Backup Database',
  },
  [
    // Daily at 2 AM
    { cron: '0 2 * * *' },
    // Also run weekly on Sunday at 3 AM
    { cron: '0 3 * * 0' },
  ],
  async ({ step }) => {
    const backup = await step.run('create-backup', async () => {
      return await createDatabaseBackup();
    });

    await step.run('upload-to-s3', async () => {
      return await s3.upload({
        Bucket: 'backups',
        Key: `backup-${Date.now()}.sql`,
        Body: backup,
      });
    });
  }
);
```

#### Delayed Events

```typescript
// Send event to be processed in the future
await inngest.send({
  name: 'reminder/send',
  data: {
    userId: '123',
    message: 'Complete your profile',
  },
  // Process this event in 3 days
  ts: Date.now() + 3 * 24 * 60 * 60 * 1000,
});

// Or use a specific date
await inngest.send({
  name: 'subscription/renew',
  data: { subscriptionId: '456' },
  ts: new Date('2025-01-01').getTime(),
});
```

#### Dynamic Scheduling

```typescript
export const scheduleReminders = inngest.createFunction(
  {
    id: 'schedule-reminders',
    name: 'Schedule User Reminders',
  },
  { event: 'user/preferences-updated' },
  async ({ event, step }) => {
    const { userId, reminderTime, timezone } = event.data;

    // Calculate next reminder time in user's timezone
    const nextReminder = await step.run('calculate-next-reminder', async () => {
      const now = DateTime.now().setZone(timezone);
      const [hour, minute] = reminderTime.split(':');

      let next = now.set({ hour: parseInt(hour), minute: parseInt(minute) });

      if (next < now) {
        next = next.plus({ days: 1 });
      }

      return next.toMillis();
    });

    // Schedule the reminder
    await step.run('schedule-reminder', async () => {
      return await inngest.send({
        name: 'reminder/daily',
        data: { userId },
        ts: nextReminder,
      });
    });
  }
);
```

### 4. Fan-out Patterns

Fan-out allows you to process items in parallel and aggregate results.

#### Parallel Processing

```typescript
export const processUserBatch = inngest.createFunction(
  {
    id: 'process-user-batch',
    name: 'Process User Batch',
  },
  { event: 'users/batch-import' },
  async ({ event, step }) => {
    const users = event.data.users;

    // Process each user in parallel
    const results = await Promise.all(
      users.map((user, index) =>
        step.run(`process-user-${index}`, async () => {
          // Create user
          const created = await db.user.create({ data: user });

          // Send welcome email
          await sendEmail({
            to: user.email,
            template: 'welcome',
          });

          return created;
        })
      )
    );

    // Aggregate results
    await step.run('send-summary', async () => {
      return await sendEmail({
        to: 'admin@example.com',
        template: 'batch-complete',
        data: {
          total: results.length,
          succeeded: results.filter((r) => r).length,
        },
      });
    });

    return results;
  }
);
```

#### Fan-out with Step.run for Each

```typescript
export const sendBulkNotifications = inngest.createFunction(
  {
    id: 'send-bulk-notifications',
    name: 'Send Bulk Notifications',
  },
  { event: 'notification/bulk' },
  async ({ event, step }) => {
    const { userIds, message, title } = event.data;

    // Fetch users
    const users = await step.run('fetch-users', async () => {
      return await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, preferences: true },
      });
    });

    // Send to each user in parallel
    const results = await Promise.all(
      users.map((user) =>
        step.run(`notify-${user.id}`, async () => {
          const channels = user.preferences.notificationChannels || ['email'];

          const sends = await Promise.all([
            channels.includes('email') &&
              sendEmail({
                to: user.email,
                subject: title,
                body: message,
              }),
            channels.includes('push') &&
              sendPushNotification({
                userId: user.id,
                title,
                message,
              }),
            channels.includes('sms') &&
              sendSMS({
                to: user.phone,
                message: `${title}: ${message}`,
              }),
          ]);

          return { userId: user.id, channels: sends.filter(Boolean) };
        })
      )
    );

    return {
      total: users.length,
      sent: results.length,
      results,
    };
  }
);
```

#### Fan-out with Events

```typescript
export const triggerUserMigration = inngest.createFunction(
  {
    id: 'trigger-user-migration',
    name: 'Trigger User Migration',
  },
  { event: 'migration/start' },
  async ({ event, step }) => {
    // Fetch all users to migrate
    const users = await step.run('fetch-users', async () => {
      return await db.user.findMany({
        where: { migrated: false },
      });
    });

    // Fan-out: Send event for each user
    await step.run('fan-out-events', async () => {
      return await inngest.send(
        users.map((user) => ({
          name: 'migration/process-user',
          data: { userId: user.id },
        }))
      );
    });

    return { totalUsers: users.length };
  }
);

// Handle each user migration
export const processUserMigration = inngest.createFunction(
  {
    id: 'process-user-migration',
    name: 'Process User Migration',
    retries: 5,
  },
  { event: 'migration/process-user' },
  async ({ event, step }) => {
    const { userId } = event.data;

    const user = await step.run('fetch-user', async () => {
      return await db.user.findUnique({ where: { id: userId } });
    });

    await step.run('migrate-to-new-system', async () => {
      return await newSystem.users.create({
        id: user.id,
        email: user.email,
        profile: user.profile,
      });
    });

    await step.run('mark-migrated', async () => {
      return await db.user.update({
        where: { id: userId },
        data: { migrated: true },
      });
    });
  }
);
```

#### Map-Reduce Pattern

```typescript
export const analyzeUserBehavior = inngest.createFunction(
  {
    id: 'analyze-user-behavior',
    name: 'Analyze User Behavior',
  },
  { event: 'analytics/daily-report' },
  async ({ event, step }) => {
    // Map: Fetch data for each segment
    const segments = ['enterprise', 'pro', 'free'];

    const segmentData = await Promise.all(
      segments.map((segment) =>
        step.run(`analyze-${segment}`, async () => {
          const users = await db.user.findMany({
            where: { plan: segment },
          });

          const events = await analytics.query({
            userIds: users.map((u) => u.id),
            startDate: event.data.startDate,
            endDate: event.data.endDate,
          });

          return {
            segment,
            userCount: users.length,
            totalEvents: events.length,
            avgEventsPerUser: events.length / users.length,
            topEvents: events
              .reduce((acc, e) => {
                acc[e.name] = (acc[e.name] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
          };
        })
      )
    );

    // Reduce: Combine results
    const report = await step.run('generate-report', async () => {
      const totalUsers = segmentData.reduce((sum, s) => sum + s.userCount, 0);
      const totalEvents = segmentData.reduce(
        (sum, s) => sum + s.totalEvents,
        0
      );

      return {
        date: event.data.startDate,
        totalUsers,
        totalEvents,
        avgEventsPerUser: totalEvents / totalUsers,
        bySegment: segmentData,
        trends: calculateTrends(segmentData),
      };
    });

    await step.run('send-report', async () => {
      return await sendEmail({
        to: 'analytics@example.com',
        template: 'behavior-report',
        data: report,
      });
    });

    return report;
  }
);
```

### 5. Error Handling

Inngest provides sophisticated error handling with automatic retries, failure handlers, and observability.

#### Automatic Retries

```typescript
export const chargeCustomer = inngest.createFunction(
  {
    id: 'charge-customer',
    name: 'Charge Customer',
    // Retry up to 5 times with exponential backoff
    retries: 5,
  },
  { event: 'payment/charge' },
  async ({ event, step, attempt }) => {
    console.log(`Attempt ${attempt} of 5`);

    const charge = await step.run('create-charge', async () => {
      // This will retry automatically on failure
      return await stripe.charges.create({
        amount: event.data.amount,
        currency: 'usd',
        customer: event.data.customerId,
      });
    });

    return charge;
  }
);
```

#### Custom Retry Logic

```typescript
export const fetchExternalData = inngest.createFunction(
  {
    id: 'fetch-external-data',
    name: 'Fetch External Data',
  },
  { event: 'data/sync' },
  async ({ event, step }) => {
    const data = await step.run(
      'fetch-data',
      {
        // Custom retry configuration
        retries: {
          limit: 10,
          // Wait 1 second, then 2, then 4, etc.
          backoff: 'exponential',
        },
      },
      async () => {
        const response = await fetch(event.data.url);

        if (!response.ok) {
          // Throw to trigger retry
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      }
    );

    return data;
  }
);
```

#### Failure Handlers

```typescript
export const criticalPayment = inngest.createFunction(
  {
    id: 'critical-payment',
    name: 'Critical Payment Processing',
    retries: 3,
    onFailure: async ({ error, event, step }) => {
      // This runs if all retries fail
      console.error('Payment failed after all retries:', error);

      // Log to error tracking
      await step.run('log-error', async () => {
        return await sentry.captureException(error, {
          tags: {
            paymentId: event.data.paymentId,
            userId: event.data.userId,
          },
        });
      });

      // Notify team
      await step.run('alert-team', async () => {
        return await slack.postMessage({
          channel: '#payments-alerts',
          text: `Payment failed: ${event.data.paymentId}\nError: ${error.message}`,
        });
      });

      // Notify customer
      await step.run('notify-customer', async () => {
        return await sendEmail({
          to: event.data.email,
          template: 'payment-failed',
          data: {
            paymentId: event.data.paymentId,
            supportLink: 'https://support.example.com',
          },
        });
      });

      // Store in dead letter queue
      await step.run('dead-letter-queue', async () => {
        return await db.failedPayment.create({
          data: {
            paymentId: event.data.paymentId,
            error: error.message,
            stack: error.stack,
            eventData: event.data,
          },
        });
      });
    },
  },
  { event: 'payment/process' },
  async ({ event, step }) => {
    // Process payment
    const charge = await step.run('charge-card', async () => {
      return await stripe.charges.create({
        amount: event.data.amount,
        currency: 'usd',
        customer: event.data.customerId,
      });
    });

    return charge;
  }
);
```

#### Circuit Breaker Pattern

```typescript
export const callUnreliableAPI = inngest.createFunction(
  {
    id: 'call-unreliable-api',
    name: 'Call Unreliable API',
  },
  { event: 'api/call' },
  async ({ event, step }) => {
    // Check circuit breaker state
    const circuitState = await step.run('check-circuit', async () => {
      const failures = await redis.get('api:failures:count');
      const lastFailure = await redis.get('api:failures:last');

      if (
        failures > 5 &&
        Date.now() - parseInt(lastFailure) < 5 * 60 * 1000
      ) {
        return { open: true, failures };
      }

      return { open: false, failures: failures || 0 };
    });

    if (circuitState.open) {
      // Circuit is open - fail fast
      throw new Error(
        `Circuit breaker open. ${circuitState.failures} recent failures.`
      );
    }

    try {
      const result = await step.run('call-api', async () => {
        return await fetch(event.data.url).then((r) => r.json());
      });

      // Reset failure count on success
      await step.run('reset-circuit', async () => {
        await redis.del('api:failures:count');
        await redis.del('api:failures:last');
      });

      return result;
    } catch (error) {
      // Increment failure count
      await step.run('record-failure', async () => {
        await redis.incr('api:failures:count');
        await redis.set('api:failures:last', Date.now().toString());
      });

      throw error;
    }
  }
);
```

#### Error Categorization

```typescript
class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export const smartRetry = inngest.createFunction(
  {
    id: 'smart-retry',
    name: 'Smart Retry Logic',
  },
  { event: 'task/process' },
  async ({ event, step }) => {
    const result = await step.run(
      'process-task',
      {
        retries: {
          limit: 5,
          // Only retry RetryableError
          retryIf: (error) => error instanceof RetryableError,
        },
      },
      async () => {
        const response = await fetch(event.data.url);

        if (response.status === 404) {
          // Don't retry - resource doesn't exist
          throw new NonRetryableError('Resource not found');
        }

        if (response.status === 429) {
          // Retry - rate limited
          throw new RetryableError('Rate limited');
        }

        if (response.status >= 500) {
          // Retry - server error
          throw new RetryableError(`Server error: ${response.status}`);
        }

        if (!response.ok) {
          // Don't retry - client error
          throw new NonRetryableError(
            `Client error: ${response.status}`
          );
        }

        return await response.json();
      }
    );

    return result;
  }
);
```

#### Graceful Degradation

```typescript
export const enrichUserData = inngest.createFunction(
  {
    id: 'enrich-user-data',
    name: 'Enrich User Data',
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    const user = event.data;

    // Try to enrich with external data
    const enrichment = await step.run(
      'fetch-enrichment',
      {
        retries: {
          limit: 3,
        },
      },
      async () => {
        try {
          return await clearbit.enrich({ email: user.email });
        } catch (error) {
          // Log error but don't fail the function
          console.warn('Enrichment failed:', error);
          return null;
        }
      }
    );

    // Continue even if enrichment failed
    await step.run('save-user', async () => {
      return await db.user.update({
        where: { id: user.id },
        data: {
          ...user,
          enrichment: enrichment || { status: 'unavailable' },
        },
      });
    });

    // Send welcome email regardless
    await step.run('send-welcome', async () => {
      return await sendEmail({
        to: user.email,
        template: 'welcome',
        data: {
          name: enrichment?.name || user.email,
        },
      });
    });

    return { user, enrichment };
  }
);
```

## Real-World Examples

### Example 1: User Onboarding Pipeline

Complete user onboarding with email verification, profile setup, and follow-up sequences.

```typescript
// File: src/inngest/functions/onboarding.ts

import { inngest } from '@/inngest/client';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { stripe } from '@/lib/stripe';

export const userOnboarding = inngest.createFunction(
  {
    id: 'user-onboarding',
    name: 'User Onboarding Pipeline',
    retries: 3,
  },
  { event: 'user/signup' },
  async ({ event, step }) => {
    const { email, name, signupSource } = event.data;

    // Step 1: Create user in database
    const user = await step.run('create-user', async () => {
      return await db.user.create({
        data: { email, name, signupSource, status: 'pending_verification' },
      });
    });

    // Step 2: Create verification token
    const token = await step.run('create-verification-token', async () => {
      return await db.verificationToken.create({
        data: {
          userId: user.id,
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    });

    // Step 3: Send verification email
    await step.run('send-verification-email', async () => {
      return await sendEmail({
        to: email,
        template: 'verify-email',
        data: {
          name,
          verifyLink: `https://app.example.com/verify?token=${token.token}`,
        },
      });
    });

    // Step 4: Wait for email verification
    const verification = await step.waitForEvent('wait-for-verification', {
      event: 'user/verified',
      match: 'data.userId',
      timeout: '7d',
    });

    if (!verification) {
      await step.run('handle-no-verification', async () => {
        await sendEmail({ to: email, template: 'verification-expired' });
        await db.user.delete({ where: { id: user.id } });
      });
      return { status: 'timeout', userId: user.id };
    }

    // Step 5: Create Stripe customer
    const customer = await step.run('create-stripe-customer', async () => {
      return await stripe.customers.create({
        email,
        name,
        metadata: { userId: user.id },
      });
    });

    // Step 6: Create trial subscription
    const subscription = await step.run('create-trial', async () => {
      return await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env.STRIPE_TRIAL_PRICE_ID }],
        trial_period_days: 14,
      });
    });

    // Step 7: Send welcome email
    await step.run('send-welcome-email', async () => {
      return await sendEmail({
        to: email,
        template: 'welcome',
        data: { name, dashboardLink: 'https://app.example.com/dashboard' },
      });
    });

    // Step 8: Trigger drip campaign
    await step.run('start-drip-campaign', async () => {
      return await inngest.send({
        name: 'campaign/start',
        data: { userId: user.id, campaignId: 'onboarding-drip' },
      });
    });

    return { status: 'completed', user, subscription };
  }
);
```

### Example 2: Payment Processing Workflow

Comprehensive payment processing with retries, webhooks, and failure handling.

```typescript
// File: src/inngest/functions/payments.ts

import { inngest } from '@/inngest/client';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export const processPayment = inngest.createFunction(
  {
    id: 'process-payment',
    name: 'Process Payment',
    retries: 5,
    onFailure: async ({ error, event, step }) => {
      await step.run('mark-payment-failed', async () => {
        return await db.payment.update({
          where: { id: event.data.paymentId },
          data: { status: 'failed', errorMessage: error.message },
        });
      });

      await step.run('notify-customer-failure', async () => {
        return await sendEmail({
          to: event.data.email,
          template: 'payment-failed',
          data: {
            paymentId: event.data.paymentId,
            supportLink: 'https://support.example.com/payments',
          },
        });
      });

      await step.run('alert-team', async () => {
        return await slack.postMessage({
          channel: '#payment-alerts',
          text: `Payment failed: ${event.data.paymentId}`,
        });
      });
    },
  },
  { event: 'payment/process' },
  async ({ event, step }) => {
    const { paymentId, userId, amount, currency, paymentMethodId } = event.data;

    const [user, payment] = await step.run('fetch-data', async () => {
      return await Promise.all([
        db.user.findUnique({ where: { id: userId } }),
        db.payment.findUnique({ where: { id: paymentId } }),
      ]);
    });

    const paymentIntent = await step.run('create-payment-intent', async () => {
      return await stripe.paymentIntents.create({
        amount,
        currency,
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        metadata: { userId, paymentId },
      });
    });

    if (paymentIntent.status === 'succeeded') {
      await step.run('handle-success', async () => {
        await db.order.update({
          where: { id: payment.orderId },
          data: { status: 'paid' },
        });

        await sendEmail({
          to: user.email,
          template: 'receipt',
          data: { amount: amount / 100, currency },
        });
      });

      await step.run('trigger-fulfillment', async () => {
        return await inngest.send({
          name: 'order/fulfill',
          data: { orderId: payment.orderId, userId },
        });
      });
    }

    return { paymentId, status: 'completed', paymentIntent };
  }
);
```

## Integration with Next.js

### Setup Inngest in Next.js App Router

```typescript
// File: src/inngest/client.ts

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'my-app',
  name: 'My App',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

```typescript
// File: src/app/api/inngest/route.ts

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { sendWelcomeEmail } from '@/inngest/functions/onboarding';
import { processPayment } from '@/inngest/functions/payments';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendWelcomeEmail, processPayment],
});
```

### Environment Variables

```bash
# .env.local

INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
INNGEST_BASE_URL=https://app.inngest.com
```

### Triggering Events from Server Actions

```typescript
// File: src/app/actions/user.ts

'use server';

import { inngest } from '@/inngest/client';

export async function createUser(data: { email: string; name: string }) {
  const user = await db.user.create({ data });

  await inngest.send({
    name: 'user/created',
    data: { userId: user.id, email: user.email, name: user.name },
  });

  return user;
}
```

## Related Skills

- **nodejs-backend-patterns** - Building Node.js backends with Express/Fastify
- **typescript-advanced-types** - Advanced TypeScript type patterns
- **javascript-testing-patterns** - Testing Inngest functions with Jest/Vitest

## Further Reading

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Next.js Guide](https://www.inngest.com/docs/learn/serving-inngest-functions)
- [Inngest SDK Reference](https://www.inngest.com/docs/reference/typescript)
- [Event-Driven Architecture Patterns](https://www.inngest.com/docs/learn/event-driven-architecture)
- [Durable Execution Guide](https://www.inngest.com/docs/learn/how-inngest-works)
- [Step Functions Best Practices](https://www.inngest.com/docs/guides/step-functions)
- [Error Handling Strategies](https://www.inngest.com/docs/guides/error-handling)
- [Fan-out Patterns](https://www.inngest.com/docs/guides/fan-out-jobs)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
