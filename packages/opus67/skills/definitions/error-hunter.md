# Error Hunter

> **ID:** `error-hunter`
> **Tier:** 2
> **Token Cost:** 6000
> **MCP Connections:** sentry

## 🎯 What This Skill Does

- Sentry error tracking
- Root cause analysis
- Issue triaging
- Fix suggestions

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** error, sentry, crash, bug
- **File Types:** N/A
- **Directories:** N/A

## 🚀 Core Capabilities

### 1. Sentry Error Tracking

Set up comprehensive error monitoring with Sentry for React, Next.js, and Node.js applications.

**Next.js Setup:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**Manual Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Filter out noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /Loading chunk \d+ failed/,
  ],

  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }

    return event;
  },
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: 0.1,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

**Error Boundary Component:**
```tsx
// components/ErrorBoundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

**Manual Error Capture:**
```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception with context
try {
  await processPayment(paymentData);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payment',
      paymentProvider: 'stripe',
    },
    extra: {
      paymentId: paymentData.id,
      amount: paymentData.amount,
    },
    user: {
      id: user.id,
      email: user.email,
    },
  });
  throw error;
}

// Capture message for non-exceptions
Sentry.captureMessage('Payment retried after initial failure', {
  level: 'warning',
  tags: { feature: 'payment' },
});

// Set user context globally
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Add breadcrumbs for context
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'User initiated checkout',
  level: 'info',
  data: {
    cartItems: cart.items.length,
    total: cart.total,
  },
});
```

**Best Practices:**
- Use environment-based sampling rates
- Scrub sensitive data with `beforeSend`
- Set user context on authentication
- Add breadcrumbs for user journey context

**Gotchas:**
- DSN must be different for client vs server
- High sample rates = high costs
- Session replay increases bundle size
- Some errors are browser-specific noise


### 2. Root Cause Analysis

Techniques for diagnosing and understanding error origins.

**Sentry Issue Analysis:**
```typescript
// API route to fetch Sentry issues
// app/api/sentry/issues/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch(
    `https://sentry.io/api/0/projects/${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}/issues/`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
      },
    }
  );

  const issues = await response.json();

  // Analyze patterns
  const analysis = {
    byType: groupBy(issues, 'type'),
    byLevel: groupBy(issues, 'level'),
    byTag: groupByTag(issues, 'browser'),
    mostFrequent: issues.slice(0, 10),
    recentlyIntroduced: issues.filter(
      (i) => new Date(i.firstSeen) > weekAgo
    ),
  };

  return NextResponse.json(analysis);
}
```

**Stack Trace Analysis:**
```typescript
// lib/error-analysis.ts

interface ErrorAnalysis {
  rootCause: string;
  affectedComponent: string;
  suggestedFix: string;
  relatedIssues: string[];
}

export function analyzeStackTrace(error: Error): ErrorAnalysis {
  const stack = error.stack || '';
  const lines = stack.split('\n');

  // Find the first application code (not node_modules)
  const appFrame = lines.find(
    (line) => line.includes('/src/') && !line.includes('node_modules')
  );

  // Extract file and line number
  const match = appFrame?.match(/at .+ \((.+):(\d+):(\d+)\)/);
  const [, file, line] = match || [];

  // Categorize error type
  const errorType = categorizeError(error);

  return {
    rootCause: `Error in ${file} at line ${line}`,
    affectedComponent: extractComponent(file),
    suggestedFix: getSuggestedFix(errorType, error.message),
    relatedIssues: findRelatedIssues(error),
  };
}

function categorizeError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('undefined') || message.includes('null')) {
    return 'null-reference';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'network-error';
  }
  if (message.includes('timeout')) {
    return 'timeout';
  }
  if (message.includes('permission') || message.includes('forbidden')) {
    return 'permission-error';
  }
  if (message.includes('invalid') || message.includes('validation')) {
    return 'validation-error';
  }
  return 'unknown';
}

function getSuggestedFix(type: string, message: string): string {
  const fixes: Record<string, string> = {
    'null-reference': 'Add null checks or optional chaining (?.) before accessing properties',
    'network-error': 'Check API endpoint, add retry logic, verify CORS configuration',
    'timeout': 'Increase timeout limits, optimize slow operations, add loading states',
    'permission-error': 'Verify user authentication state and role permissions',
    'validation-error': 'Add input validation, check data types and required fields',
  };

  return fixes[type] || 'Review error message and stack trace for context';
}
```

**Error Correlation:**
```typescript
// lib/error-correlation.ts
import * as Sentry from '@sentry/nextjs';

export function correlateErrors(eventId: string) {
  // Get related events within time window
  const transaction = Sentry.getCurrentScope().getTransaction();

  if (transaction) {
    // Link error to transaction
    Sentry.setContext('transaction', {
      traceId: transaction.traceId,
      spanId: transaction.spanId,
      name: transaction.name,
    });
  }

  // Add correlation ID for distributed tracing
  const correlationId = crypto.randomUUID();
  Sentry.setTag('correlation_id', correlationId);

  return correlationId;
}

// Usage in API route
export async function POST(request: Request) {
  const correlationId = correlateErrors(Sentry.lastEventId() || '');

  try {
    const result = await externalService.process(request, correlationId);
    return Response.json(result);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { correlation_id: correlationId },
    });
    throw error;
  }
}
```

**Best Practices:**
- Use correlation IDs across services
- Link errors to transactions for context
- Group similar errors by fingerprint
- Track error frequency over time

**Gotchas:**
- Stack traces may be minified in production
- Source maps must be uploaded for readable traces
- Async stack traces may be incomplete
- Browser errors may lack server context


### 3. Issue Triaging

Efficiently categorize and prioritize errors for resolution.

**Sentry Alert Rules:**
```typescript
// Configure in Sentry UI or via API
const alertRules = [
  {
    name: 'Critical Production Error',
    conditions: [
      { type: 'event_frequency', value: 10, interval: '1h' },
      { type: 'tag', key: 'level', value: 'error' },
    ],
    actions: [
      { type: 'slack', channel: '#alerts-critical' },
      { type: 'pagerduty', service: 'production-oncall' },
    ],
    filters: [
      { type: 'tag', key: 'environment', value: 'production' },
    ],
  },
  {
    name: 'New Issue Regression',
    conditions: [
      { type: 'regression', value: true },
    ],
    actions: [
      { type: 'slack', channel: '#engineering' },
    ],
  },
  {
    name: 'High Error Rate',
    conditions: [
      { type: 'error_rate', value: 0.05, interval: '5m' },
    ],
    actions: [
      { type: 'slack', channel: '#alerts-urgent' },
    ],
  },
];
```

**Triage Dashboard Component:**
```tsx
// components/ErrorDashboard.tsx
'use client';

import { useState, useEffect } from 'react';

interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  level: 'error' | 'warning' | 'info';
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  isUnhandled: boolean;
  status: 'unresolved' | 'resolved' | 'ignored';
}

export function ErrorDashboard() {
  const [issues, setIssues] = useState<SentryIssue[]>([]);
  const [filter, setFilter] = useState<'critical' | 'high' | 'medium' | 'low'>('critical');

  useEffect(() => {
    fetchIssues(filter).then(setIssues);
  }, [filter]);

  const prioritizeIssue = (issue: SentryIssue): number => {
    let score = 0;

    // Weight by user impact
    score += issue.userCount * 10;

    // Weight by frequency
    score += issue.count * 2;

    // Weight by recency
    const hoursSinceLastSeen =
      (Date.now() - new Date(issue.lastSeen).getTime()) / 3600000;
    score += Math.max(0, 100 - hoursSinceLastSeen);

    // Weight by severity
    if (issue.level === 'error') score += 50;
    if (issue.isUnhandled) score += 30;

    return score;
  };

  const sortedIssues = [...issues].sort(
    (a, b) => prioritizeIssue(b) - prioritizeIssue(a)
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={filter === level ? 'bg-blue-500 text-white' : ''}
          >
            {level}
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Users</th>
            <th>Events</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedIssues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <div className="font-medium">{issue.title}</div>
                <div className="text-sm text-gray-500">{issue.culprit}</div>
              </td>
              <td>{issue.userCount}</td>
              <td>{issue.count}</td>
              <td>{prioritizeIssue(issue).toFixed(0)}</td>
              <td>
                <button onClick={() => assignIssue(issue.id)}>Assign</button>
                <button onClick={() => ignoreIssue(issue.id)}>Ignore</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Error Fingerprinting:**
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  beforeSend(event, hint) {
    // Custom fingerprinting for grouping
    const error = hint.originalException as Error;

    if (error?.message?.includes('Network request failed')) {
      event.fingerprint = ['network-error', event.tags?.endpoint || 'unknown'];
    }

    if (error?.message?.includes('Rate limit')) {
      event.fingerprint = ['rate-limit', event.tags?.api || 'unknown'];
    }

    // Group by API endpoint for fetch errors
    if (event.request?.url) {
      const url = new URL(event.request.url);
      event.fingerprint = ['api-error', url.pathname];
    }

    return event;
  },
});
```

**Best Practices:**
- Prioritize by user impact, not just frequency
- Use custom fingerprinting for better grouping
- Set up alerts for regression and new issues
- Create SLOs for error rates

**Gotchas:**
- Too many alerts cause alert fatigue
- Default grouping may split related issues
- Resolved issues can regress
- Ignored issues should be reviewed periodically


### 4. Fix Suggestions

Generate actionable fix recommendations based on error patterns.

**Common Error Patterns and Fixes:**
```typescript
// lib/fix-suggestions.ts

interface FixSuggestion {
  pattern: RegExp;
  title: string;
  description: string;
  codeExample: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const fixPatterns: FixSuggestion[] = [
  {
    pattern: /Cannot read propert(y|ies) .+ of undefined/,
    title: 'Null Reference Error',
    description: 'Object is undefined when property is accessed',
    codeExample: `
// Before (broken)
const name = user.profile.name;

// After (fixed with optional chaining)
const name = user?.profile?.name ?? 'Unknown';

// Or with explicit check
if (user?.profile) {
  const name = user.profile.name;
}`,
    difficulty: 'easy',
  },
  {
    pattern: /Hydration failed because/,
    title: 'React Hydration Mismatch',
    description: 'Server and client render different content',
    codeExample: `
// Before (causes mismatch)
function Component() {
  return <div>{new Date().toISOString()}</div>;
}

// After (use useEffect for client-only)
function Component() {
  const [date, setDate] = useState<string>();

  useEffect(() => {
    setDate(new Date().toISOString());
  }, []);

  return <div>{date}</div>;
}

// Or use suppressHydrationWarning
<time suppressHydrationWarning>
  {new Date().toISOString()}
</time>`,
    difficulty: 'medium',
  },
  {
    pattern: /fetch failed|NetworkError|Failed to fetch/,
    title: 'Network Request Failed',
    description: 'API call failed due to network issues',
    codeExample: `
// Add retry logic with exponential backoff
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}

// Add timeout
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeout);`,
    difficulty: 'easy',
  },
  {
    pattern: /Maximum update depth exceeded/,
    title: 'React Infinite Loop',
    description: 'Component updates trigger more updates',
    codeExample: `
// Before (infinite loop)
function Component({ data }) {
  const [items, setItems] = useState([]);

  // This runs every render, causing loop
  setItems(data.filter(item => item.active));

  return <List items={items} />;
}

// After (use useEffect with dependency)
function Component({ data }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(data.filter(item => item.active));
  }, [data]);

  return <List items={items} />;
}

// Or use useMemo
function Component({ data }) {
  const items = useMemo(
    () => data.filter(item => item.active),
    [data]
  );

  return <List items={items} />;
}`,
    difficulty: 'medium',
  },
  {
    pattern: /CORS|Access-Control-Allow-Origin/,
    title: 'CORS Configuration Error',
    description: 'Cross-origin request blocked by browser',
    codeExample: `
// Next.js API route with CORS
// app/api/data/route.ts
export async function GET(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return Response.json({ data: 'value' }, { headers });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}`,
    difficulty: 'medium',
  },
];

export function getSuggestion(error: Error): FixSuggestion | null {
  for (const fix of fixPatterns) {
    if (fix.pattern.test(error.message)) {
      return fix;
    }
  }
  return null;
}
```

**Automated Fix Generation:**
```typescript
// lib/auto-fix.ts
import * as Sentry from '@sentry/nextjs';

export async function generateFix(issueId: string): Promise<string> {
  // Fetch issue details from Sentry
  const issue = await fetchSentryIssue(issueId);

  // Analyze error pattern
  const errorType = categorizeError(issue);
  const stackFrames = parseStackTrace(issue.stacktrace);

  // Get affected code
  const sourceCode = await fetchSourceCode(stackFrames[0]);

  // Generate fix based on patterns
  const suggestion = getSuggestion(new Error(issue.title));

  if (!suggestion) {
    return generateGenericSuggestion(issue, sourceCode);
  }

  return `
## Fix Suggestion: ${suggestion.title}

### Problem
${suggestion.description}

### Affected Code
\`\`\`typescript
${sourceCode}
\`\`\`

### Recommended Fix
\`\`\`typescript
${suggestion.codeExample}
\`\`\`

### Difficulty: ${suggestion.difficulty}
  `;
}

function generateGenericSuggestion(issue: any, code: string): string {
  return `
## Error Analysis

### Error Message
${issue.title}

### Affected File
${issue.culprit}

### Steps to Debug
1. Check the stack trace for the exact line
2. Add logging before the failing line
3. Verify input data is valid
4. Check for null/undefined values
5. Review recent changes to this file

### Code Context
\`\`\`typescript
${code}
\`\`\`
  `;
}
```

**Slack Integration for Fix Alerts:**
```typescript
// lib/slack-alerts.ts
export async function sendFixSuggestion(
  issueId: string,
  suggestion: string,
  channel: string
) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL!;

  await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'New Error Fix Suggestion',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: suggestion,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View in Sentry' },
              url: `https://sentry.io/issues/${issueId}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Mark as Fixed' },
              action_id: 'mark_fixed',
              value: issueId,
            },
          ],
        },
      ],
    }),
  });
}
```

**Best Practices:**
- Build a library of common error patterns
- Include code examples in suggestions
- Link to relevant documentation
- Track which suggestions lead to fixes

**Gotchas:**
- Auto-generated fixes may need adaptation
- Context is crucial for accurate suggestions
- Some errors require domain knowledge
- Keep pattern library updated


## 💡 Real-World Examples

### Example 1: Complete Sentry Setup
```typescript
// instrumentation.ts (Next.js 15+)
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,

  integrations: [
    Sentry.prismaIntegration(),
    Sentry.httpIntegration(),
  ],

  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### Example 2: Error Monitoring Dashboard
```tsx
// app/admin/errors/page.tsx
import { Suspense } from 'react';
import { ErrorDashboard } from '@/components/ErrorDashboard';

export default async function ErrorsPage() {
  const issues = await fetchSentryIssues();

  const stats = {
    total: issues.length,
    critical: issues.filter(i => i.level === 'error' && i.count > 100).length,
    new: issues.filter(i => isNewIssue(i)).length,
    trending: issues.filter(i => isTrending(i)).length,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Error Monitoring</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Issues" value={stats.total} />
        <StatCard title="Critical" value={stats.critical} variant="error" />
        <StatCard title="New (24h)" value={stats.new} variant="warning" />
        <StatCard title="Trending" value={stats.trending} />
      </div>

      <Suspense fallback={<div>Loading issues...</div>}>
        <ErrorDashboard issues={issues} />
      </Suspense>
    </div>
  );
}
```

### Example 3: Automated Error Response
```typescript
// app/api/webhooks/sentry/route.ts
import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/sentry-webhook';
import { getSuggestion, generateFix } from '@/lib/auto-fix';
import { sendFixSuggestion } from '@/lib/slack-alerts';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('sentry-hook-signature');

  if (!verifySignature(body, signature!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.action === 'created' && event.data.issue) {
    const issue = event.data.issue;

    // Generate fix suggestion
    const fix = await generateFix(issue.id);

    // Notify team
    if (issue.level === 'error') {
      await sendFixSuggestion(issue.id, fix, '#engineering-alerts');
    }

    // Auto-assign based on file path
    const owner = getCodeOwner(issue.culprit);
    if (owner) {
      await assignIssue(issue.id, owner);
    }
  }

  return NextResponse.json({ success: true });
}
```

## 🔗 Related Skills

- `monitoring-specialist` - Infrastructure monitoring
- `devops-engineer` - CI/CD and deployment
- `api-design-specialist` - Error handling in APIs
- `react-nextjs-specialist` - React error boundaries

## 📖 Further Reading

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Sentry Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Monitoring Best Practices](https://sentry.io/resources/best-practices-error-monitoring/)
- [Source Maps Configuration](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
