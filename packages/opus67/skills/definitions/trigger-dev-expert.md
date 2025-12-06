# Trigger.dev Expert

> **ID:** `trigger-dev-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

Enables building production-ready background job infrastructure using Trigger.dev v3. This skill provides expertise in creating reliable, observable, and scalable async task systems that handle long-running operations, scheduled jobs, webhook processing, and third-party integrations without serverless timeout constraints.

Trigger.dev transforms your Next.js/Remix app into a background processing powerhouse with:
- Tasks that run for hours without timeout
- Built-in retries and error handling
- Real-time logging and monitoring
- Type-safe task definitions
- Integrated scheduling and webhooks
- Automatic deployment and versioning

## When to Use

Use this skill when you need to:
- Execute tasks longer than serverless limits (30-60s)
- Process videos, generate AI content, or run data pipelines
- Schedule recurring jobs (reports, cleanups, notifications)
- Handle webhook callbacks from Stripe, Clerk, GitHub
- Build reliable async workflows with retries
- Monitor and debug background tasks in production
- Integrate with OpenAI, Resend, Slack, Supabase

Don't use for:
- Simple API routes that finish in <10s
- Real-time request-response patterns
- Tasks requiring instant feedback to users

## Core Capabilities

### 1. Long-Running Tasks

Trigger.dev removes serverless timeout constraints, allowing tasks to run for minutes or hours.

#### Basic Task Definition

```typescript
// trigger/hello-world.ts
import { task } from "@trigger.dev/sdk/v3";

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { name: string }) => {
    console.log("Hello from Trigger.dev!", payload);

    // This can run for hours
    await someExpensiveOperation();

    return {
      message: `Hello, ${payload.name}!`,
      completedAt: new Date().toISOString(),
    };
  },
});
```

#### Task with Checkpointing

Break long tasks into resumable segments:

```typescript
// trigger/video-processing.ts
import { task, wait } from "@trigger.dev/sdk/v3";

interface VideoProcessingPayload {
  videoUrl: string;
  outputFormat: "mp4" | "webm" | "gif";
  userId: string;
}

interface ProcessingResult {
  downloadUrl: string;
  duration: number;
  fileSize: number;
}

export const processVideo = task({
  id: "process-video",
  run: async (payload: VideoProcessingPayload): Promise<ProcessingResult> => {
    // Step 1: Download video (checkpoint)
    console.log("Downloading video...", { url: payload.videoUrl });
    const videoBuffer = await downloadVideo(payload.videoUrl);

    // Wait creates a checkpoint - task can resume from here
    await wait.for({ seconds: 1 });

    // Step 2: Transcode (checkpoint)
    console.log("Transcoding video...", { format: payload.outputFormat });
    const transcodedBuffer = await transcodeVideo(videoBuffer, payload.outputFormat);

    await wait.for({ seconds: 1 });

    // Step 3: Upload to storage (checkpoint)
    console.log("Uploading to storage...");
    const uploadedUrl = await uploadToS3(transcodedBuffer, {
      key: `processed/${payload.userId}/${Date.now()}.${payload.outputFormat}`,
    });

    await wait.for({ seconds: 1 });

    // Step 4: Notify user
    console.log("Sending notification...");
    await notifyUser(payload.userId, uploadedUrl);

    return {
      downloadUrl: uploadedUrl,
      duration: 0,
      fileSize: transcodedBuffer.length,
    };
  },
});

async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function transcodeVideo(buffer: Buffer, format: string): Promise<Buffer> {
  return buffer;
}

async function uploadToS3(buffer: Buffer, options: { key: string }): Promise<string> {
  return `https://cdn.example.com/${options.key}`;
}

async function notifyUser(userId: string, url: string): Promise<void> {
  console.log(`Notified user ${userId} about ${url}`);
}
```

#### Task with Retries and Timeout

```typescript
// trigger/api-scraper.ts
import { task, retry } from "@trigger.dev/sdk/v3";

interface ScraperPayload {
  urls: string[];
  selector: string;
}

export const scrapeWebsites = task({
  id: "scrape-websites",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: ScraperPayload) => {
    const results = [];

    for (const url of payload.urls) {
      const content = await retry.fetch(url, {
        retry: {
          maxAttempts: 5,
          factor: 1.5,
        },
      }).then(r => r.text());

      const data = extractData(content, payload.selector);
      results.push({ url, data });
    }

    return results;
  },
});

function extractData(html: string, selector: string): any {
  return { extracted: true };
}
```

**Best Practices:**
- Use `wait.for()` to create checkpoints for long tasks
- Break tasks into logical segments (download, process, upload)
- Configure retry policies at task or operation level
- Return structured results for easier debugging

**Common Patterns:**
- Video/image processing pipelines
- Large data migrations
- Multi-step AI workflows
- Batch processing operations

**Gotchas:**
- `wait.for()` creates checkpoints but adds latency
- Each checkpoint persists state to resume on failure
- Long-running tasks consume more resources

### 2. Background Jobs

Execute async tasks without blocking user requests.

#### Triggering from API Routes (Next.js)

```typescript
// app/api/upload/route.ts
import { processVideo } from "@/trigger/video-processing";

export async function POST(request: Request) {
  const { videoUrl, userId } = await request.json();

  const handle = await processVideo.trigger({
    videoUrl,
    outputFormat: "mp4",
    userId,
  });

  return Response.json({
    message: "Video processing started",
    taskId: handle.id,
  });
}
```

#### Checking Task Status

```typescript
// app/api/status/[taskId]/route.ts
import { runs } from "@trigger.dev/sdk/v3";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const run = await runs.retrieve(params.taskId);

  return Response.json({
    id: run.id,
    status: run.status,
    output: run.output,
    createdAt: run.createdAt,
    completedAt: run.completedAt,
  });
}
```

#### Batch Processing

```typescript
// trigger/batch-processor.ts
import { task, wait } from "@trigger.dev/sdk/v3";

interface BatchPayload {
  items: Array<{ id: string; data: any }>;
  batchSize: number;
}

export const batchProcessor = task({
  id: "batch-processor",
  run: async (payload: BatchPayload) => {
    const results = [];

    for (let i = 0; i < payload.items.length; i += payload.batchSize) {
      const batch = payload.items.slice(i, i + payload.batchSize);

      console.log(`Processing batch ${i / payload.batchSize + 1}`, {
        items: batch.length,
      });

      const batchResults = await Promise.all(
        batch.map(item => processItem(item))
      );

      results.push(...batchResults);

      if (i + payload.batchSize < payload.items.length) {
        await wait.for({ seconds: 2 });
      }
    }

    return {
      totalProcessed: results.length,
      results,
    };
  },
});

async function processItem(item: { id: string; data: any }) {
  return { id: item.id, status: "processed" };
}
```

**Best Practices:**
- Return task handles immediately to users
- Store task IDs for status polling
- Use child tasks for complex workflows
- Process items in batches to avoid memory issues

**Common Patterns:**
- Fan-out/fan-in workflows
- Batch processing with checkpoints
- Multi-stage pipelines
- Parallel processing

**Gotchas:**
- Task handles don't include output until complete
- Use `waitFor()` to wait for child task completion
- Large batch sizes can cause memory issues

### 3. Task Scheduling

Run tasks on a schedule using cron patterns.

#### Basic Scheduled Task

```typescript
// trigger/daily-report.ts
import { schedules } from "@trigger.dev/sdk/v3";

export const dailyReport = schedules.task({
  id: "daily-report",
  cron: "0 9 * * *",
  run: async (payload) => {
    console.log("Generating daily report", {
      scheduledTime: payload.timestamp,
    });

    const metrics = await fetchDailyMetrics();
    const report = await generateReport(metrics);
    await sendReportEmail(report);

    return { reportId: report.id, metrics };
  },
});

async function fetchDailyMetrics() {
  return {
    users: 1250,
    revenue: 45600,
    signups: 23,
  };
}

async function generateReport(metrics: any) {
  return { id: "report-123", ...metrics };
}

async function sendReportEmail(report: any) {
  console.log("Email sent", report);
}
```

#### Advanced Scheduling Patterns

```typescript
// trigger/scheduled-tasks.ts
import { schedules } from "@trigger.dev/sdk/v3";

// Every 15 minutes
export const frequentSync = schedules.task({
  id: "frequent-sync",
  cron: "*/15 * * * *",
  run: async () => {
    await syncData();
    return { synced: true };
  },
});

// Every Monday at 8 AM
export const weeklyCleanup = schedules.task({
  id: "weekly-cleanup",
  cron: "0 8 * * 1",
  run: async () => {
    await cleanupOldRecords();
    return { cleaned: true };
  },
});

// First day of month at midnight
export const monthlyInvoicing = schedules.task({
  id: "monthly-invoicing",
  cron: "0 0 1 * *",
  run: async () => {
    const invoices = await generateMonthlyInvoices();
    await sendInvoices(invoices);
    return { invoiceCount: invoices.length };
  },
});

async function syncData() {}
async function cleanupOldRecords() {}
async function generateMonthlyInvoices() { return []; }
async function sendInvoices(invoices: any[]) {}
```

**Best Practices:**
- Use standard cron syntax for reliability
- Schedule reports during off-peak hours
- Add error notifications for critical scheduled tasks
- Test cron patterns with online validators

**Common Patterns:**
- Daily/weekly/monthly reports
- Database cleanup jobs
- Health checks and monitoring
- Recurring data syncs

**Gotchas:**
- Cron uses UTC timezone by default
- Use `*/N` for "every N units" intervals
- First day of month is `1`, not `0`

### 4. Webhooks

Handle HTTP callbacks from external services.

#### Stripe Webhook Handler

```typescript
// trigger/stripe-webhook.ts
import { task } from "@trigger.dev/sdk/v3";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

interface StripeWebhookPayload {
  event: Stripe.Event;
}

export const handleStripeWebhook = task({
  id: "stripe-webhook",
  run: async (payload: StripeWebhookPayload) => {
    const { event } = payload;

    console.log("Processing Stripe event", {
      type: event.type,
      id: event.id,
    });

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { processed: true, eventType: event.type };
  },
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment succeeded", { id: paymentIntent.id });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed", { id: paymentIntent.id });
}
```

**Best Practices:**
- Verify webhook signatures before processing
- Return 200 immediately, process async
- Handle all relevant event types
- Log unhandled events for monitoring

**Common Patterns:**
- Payment processing (Stripe)
- User authentication (Clerk)
- CI/CD triggers (GitHub)
- Communication events (Slack)

**Gotchas:**
- Webhooks may be sent multiple times
- Always verify signatures for security
- Return 200 quickly to avoid retries

### 5. Realtime Logs

Monitor and debug tasks with structured logging.

#### Structured Logging

```typescript
// trigger/data-pipeline.ts
import { task, logger } from "@trigger.dev/sdk/v3";

interface PipelinePayload {
  source: string;
  destination: string;
}

export const dataPipeline = task({
  id: "data-pipeline",
  run: async (payload: PipelinePayload) => {
    logger.info("Pipeline started", {
      source: payload.source,
      destination: payload.destination,
    });

    try {
      logger.debug("Extracting data...", { source: payload.source });
      const data = await extractData(payload.source);
      logger.info("Data extracted", { recordCount: data.length });

      logger.debug("Transforming data...");
      const transformed = await transformData(data);
      logger.info("Data transformed", {
        inputRecords: data.length,
        outputRecords: transformed.length,
      });

      logger.debug("Loading data...", { destination: payload.destination });
      await loadData(transformed, payload.destination);
      logger.info("Data loaded successfully");

      return {
        status: "success",
        recordsProcessed: transformed.length,
      };
    } catch (error) {
      logger.error("Pipeline failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },
});

async function extractData(source: string): Promise<any[]> {
  return [{ id: 1 }, { id: 2 }];
}

async function transformData(data: any[]): Promise<any[]> {
  return data.map(d => ({ ...d, processed: true }));
}

async function loadData(data: any[], destination: string): Promise<void> {
  console.log(`Loaded ${data.length} records to ${destination}`);
}
```

**Best Practices:**
- Use appropriate log levels (debug/info/warn/error)
- Include structured metadata for filtering
- Log timestamps for performance tracking
- Avoid logging sensitive information

**Common Patterns:**
- Pipeline progress tracking
- Error debugging with context
- Performance monitoring
- Audit trails

**Gotchas:**
- Logs have size limits per task
- High log volume affects performance
- Use debug level sparingly in production

### 6. Integrations

Connect with third-party services using official integrations.

#### OpenAI Integration

```typescript
// trigger/ai-content-generator.ts
import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentPayload {
  topic: string;
  tone: "professional" | "casual" | "technical";
  length: "short" | "medium" | "long";
}

export const generateContent = task({
  id: "generate-content",
  run: async (payload: ContentPayload) => {
    const wordCount = {
      short: 150,
      medium: 500,
      long: 1000,
    }[payload.length];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a ${payload.tone} content writer. Write approximately ${wordCount} words.`,
        },
        {
          role: "user",
          content: `Write about: ${payload.topic}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    return {
      content,
      topic: payload.topic,
      wordCount: content?.split(" ").length || 0,
      model: completion.model,
    };
  },
});
```

#### Resend Email Integration

```typescript
// trigger/email-sender.ts
import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = task({
  id: "send-email",
  retry: {
    maxAttempts: 3,
    factor: 2,
  },
  run: async (payload: EmailPayload) => {
    const result = await resend.emails.send({
      from: payload.from || "noreply@example.com",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (result.error) {
      throw new Error(`Email send failed: ${result.error.message}`);
    }

    return {
      emailId: result.data?.id,
      to: payload.to,
      sentAt: new Date().toISOString(),
    };
  },
});
```

**Best Practices:**
- Store API keys in environment variables
- Use official SDK packages when available
- Handle API errors gracefully
- Add retries for flaky services

**Common Patterns:**
- AI content generation (OpenAI)
- Transactional emails (Resend)
- Data persistence (Supabase)
- Team notifications (Slack)

**Gotchas:**
- API rate limits apply
- Some services charge per API call
- Always handle authentication errors

## Real-World Examples

### Example 1: Video Processing Pipeline

Complete video processing workflow with transcoding, thumbnail generation, and user notification.

```typescript
// trigger/video-pipeline.ts
import { task, wait, logger } from "@trigger.dev/sdk/v3";

interface VideoPipelinePayload {
  videoId: string;
  videoUrl: string;
  userId: string;
  userEmail: string;
}

export const videoPipeline = task({
  id: "video-pipeline",
  retry: {
    maxAttempts: 3,
    factor: 2,
  },
  run: async (payload: VideoPipelinePayload) => {
    const startTime = Date.now();

    logger.info("Starting video pipeline", {
      videoId: payload.videoId,
      userId: payload.userId,
    });

    logger.info("Downloading source video");
    const sourceBuffer = await downloadVideo(payload.videoUrl);

    await wait.for({ seconds: 1 });

    logger.info("Extracting metadata");
    const metadata = await extractMetadata(sourceBuffer);
    logger.info("Metadata extracted", metadata);

    await wait.for({ seconds: 1 });

    logger.info("Processing video formats");
    const [thumbnailUrl, mp4Url, webmUrl] = await Promise.all([
      generateThumbnail(sourceBuffer).then(b => uploadToStorage(b, `thumbnails/${payload.videoId}.jpg`)),
      transcodeVideo(sourceBuffer, "mp4").then(b => uploadToStorage(b, `videos/${payload.videoId}.mp4`)),
      transcodeVideo(sourceBuffer, "webm").then(b => uploadToStorage(b, `videos/${payload.videoId}.webm`)),
    ]);

    logger.info("All processing complete");

    const processingTime = Date.now() - startTime;

    return {
      videoId: payload.videoId,
      outputs: { mp4Url, webmUrl, thumbnailUrl },
      duration: metadata.duration,
      processingTime,
    };
  },
});

async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url);
  return Buffer.from(await response.arrayBuffer());
}

async function extractMetadata(buffer: Buffer) {
  return { duration: 120, width: 1920, height: 1080 };
}

async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return buffer;
}

async function transcodeVideo(buffer: Buffer, format: string): Promise<Buffer> {
  return buffer;
}

async function uploadToStorage(buffer: Buffer, key: string): Promise<string> {
  return `https://cdn.example.com/${key}`;
}
```

### Example 2: AI Content Generation Workflow

Multi-step AI workflow with SEO optimization and publishing.

```typescript
// trigger/content-workflow.ts
import { task, wait, logger } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentWorkflowPayload {
  topic: string;
  keywords: string[];
  userId: string;
}

export const contentWorkflow = task({
  id: "content-workflow",
  run: async (payload: ContentWorkflowPayload) => {
    logger.info("Starting content workflow", {
      topic: payload.topic,
      keywords: payload.keywords,
    });

    logger.info("Generating article outline");
    const outline = await generateOutline(payload.topic, payload.keywords);

    await wait.for({ seconds: 2 });

    logger.info("Generating full article");
    const article = await generateArticle(outline, payload.keywords);

    await wait.for({ seconds: 2 });

    logger.info("Optimizing for SEO");
    const optimized = await optimizeForSEO(article, payload.keywords);

    await wait.for({ seconds: 2 });

    logger.info("Generating hero image");
    const imageUrl = await generateHeroImage(optimized.title);

    const articleId = `article_${Date.now()}`;

    logger.info("Content workflow complete", { articleId });

    return {
      articleId,
      title: optimized.title,
      content: optimized.content,
      imageUrl,
    };
  },
});

async function generateOutline(topic: string, keywords: string[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert content strategist. Create detailed article outlines.",
      },
      {
        role: "user",
        content: `Create an outline for: ${topic}\nKeywords: ${keywords.join(", ")}`,
      },
    ],
  });
  return completion.choices[0].message.content || "";
}

async function generateArticle(outline: string, keywords: string[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `Write articles incorporating: ${keywords.join(", ")}`,
      },
      {
        role: "user",
        content: `Write based on:\n\n${outline}`,
      },
    ],
  });
  return completion.choices[0].message.content || "";
}

async function optimizeForSEO(content: string, keywords: string[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Optimize content for search engines.",
      },
      {
        role: "user",
        content: `Optimize for: ${keywords.join(", ")}\n\n${content}\n\nReturn JSON with: title, content, metaDescription`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const result = JSON.parse(completion.choices[0].message.content || "{}");
  return {
    title: result.title || "Untitled",
    content: result.content || content,
    metaDescription: result.metaDescription || "",
  };
}

async function generateHeroImage(title: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Professional hero image for: "${title}"`,
    size: "1792x1024",
  });
  return response.data[0].url || "";
}
```

## Project Setup

### Installation

```bash
npm install @trigger.dev/sdk@latest
npm install -D @trigger.dev/cli@latest
```

### Initialize Project

```bash
npx trigger.dev@latest init
```

### Configuration

```typescript
// trigger.config.ts
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_your-project-id",
  runtime: "node",
  logLevel: "info",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
    },
  },
  dirs: ["./trigger"],
});
```

### Development

```bash
npx trigger.dev@latest dev
```

### Deployment

```bash
npx trigger.dev@latest deploy
```

## Best Practices

### Task Organization

```
trigger/
├── core/
│   ├── email.ts
│   ├── notifications.ts
│   └── database.ts
├── workflows/
│   ├── video-pipeline.ts
│   ├── content-workflow.ts
│   └── data-sync.ts
├── integrations/
│   ├── stripe-webhook.ts
│   ├── github-webhook.ts
│   └── clerk-webhook.ts
└── scheduled/
    ├── daily-reports.ts
    └── cleanup.ts
```

### Error Handling

```typescript
import { task, logger } from "@trigger.dev/sdk/v3";

export const resilientTask = task({
  id: "resilient-task",
  retry: {
    maxAttempts: 3,
    factor: 2,
  },
  run: async (payload: any) => {
    try {
      await riskyOperation();
    } catch (error) {
      logger.error("Operation failed", {
        error: error instanceof Error ? error.message : "Unknown",
        payload,
      });

      if (isRetryable(error)) {
        throw error;
      } else {
        await notifyOps(error);
        return { status: "failed", error: String(error) };
      }
    }
  },
});

function isRetryable(error: any): boolean {
  return error.code === "ECONNRESET" || error.code === "ETIMEDOUT";
}

async function riskyOperation() {}
async function notifyOps(error: any) {}
```

### Type Safety

```typescript
import { task } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const PayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  data: z.record(z.any()),
});

type Payload = z.infer<typeof PayloadSchema>;

export const typedTask = task({
  id: "typed-task",
  run: async (payload: Payload) => {
    const validated = PayloadSchema.parse(payload);
    console.log(validated.email);
    return validated;
  },
});
```

## Related Skills

- **nodejs-backend-patterns** - Node.js server patterns and middleware
- **typescript-advanced-types** - Advanced TypeScript type patterns
- **nextjs-app-router** - Next.js App Router integration

## Further Reading

- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Trigger.dev v3 Migration Guide](https://trigger.dev/docs/v3/migration)
- [Task Examples Repository](https://github.com/triggerdotdev/trigger.dev/tree/main/examples)
- [Trigger.dev Discord Community](https://discord.gg/triggerdotdev)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
