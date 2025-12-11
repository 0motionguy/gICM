---
name: error-handling-patterns
description: "="
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Error Handling Patterns

## Quick Reference

```typescript
// Result type pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Custom error class
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error wrapper
async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

// Error boundary (React)
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Error Categories
- **Operational** - Expected errors (network, validation)
- **Programmer** - Bugs, type errors, null refs
- **System** - Out of memory, file system full

### Retry Strategies
- **Exponential Backoff** - Increase delay exponentially
- **Linear Backoff** - Fixed delay between retries
- **Jittered** - Random delay to avoid thundering herd

## Core Concepts

### 1. Custom Error Classes

```typescript
// Base error class
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

class RateLimitError extends AppError {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429)
  }
}

// Usage
throw new ValidationError('Invalid email', { email: 'Must be a valid email' })
throw new NotFoundError('User', '123')
throw new UnauthorizedError()
```

### 2. Result Type Pattern

```typescript
// Result type
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Result utilities
const Ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
})

const Err = <E extends Error>(error: E): Result<never, E> => ({
  success: false,
  error,
})

// Async result wrapper
async function withResult<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn()
    return Ok(data)
  } catch (error) {
    return Err(error as Error)
  }
}

// Usage
async function getUser(id: string): Promise<Result<User>> {
  return withResult(async () => {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundError('User', id)
    }
    return user
  })
}

// Consumer
const result = await getUser('123')

if (result.success) {
  console.log(result.data.name) // Type-safe: data is User
} else {
  console.error(result.error.message) // Type-safe: error is Error
}

// Map and chain
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  return result.success ? Ok(fn(result.data)) : result
}

function chainResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  return result.success ? fn(result.data) : result
}
```

### 3. Error Boundaries (React)

```typescript
// Error boundary component
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button onClick={this.resetError}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <ErrorFallback error={error} onReset={reset} />
      )}
      onError={(error, errorInfo) => {
        logToSentry(error, errorInfo)
      }}
    >
      <MyApp />
    </ErrorBoundary>
  )
}

// Async error boundary hook
function useAsyncError() {
  const [, setError] = useState()

  return useCallback(
    (error: Error) => {
      setError(() => {
        throw error
      })
    },
    [setError]
  )
}

// Usage in async component
function AsyncComponent() {
  const throwError = useAsyncError()

  useEffect(() => {
    fetchData().catch(throwError)
  }, [throwError])

  return <div>Content</div>
}
```

### 4. Retry Logic

```typescript
// Retry configuration
interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  shouldRetry?: (error: Error) => boolean
  onRetry?: (error: Error, attempt: number) => void
}

// Exponential backoff with jitter
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay =
    config.initialDelay * Math.pow(config.backoffFactor, attempt)

  const cappedDelay = Math.min(exponentialDelay, config.maxDelay)

  // Add jitter (±25%)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1)

  return Math.max(0, cappedDelay + jitter)
}

// Retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    shouldRetry: error => {
      // Retry on network errors and 5xx
      if (error instanceof AppError) {
        return error.statusCode >= 500
      }
      return true
    },
    ...config,
  }

  let lastError: Error

  for (let attempt = 0; attempt < fullConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      const shouldRetry = fullConfig.shouldRetry?.(lastError) ?? true

      if (!shouldRetry || attempt === fullConfig.maxAttempts - 1) {
        throw lastError
      }

      const delay = calculateDelay(attempt, fullConfig)

      fullConfig.onRetry?.(lastError, attempt + 1)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Usage
const data = await withRetry(
  () => fetch('https://api.example.com/data').then(r => r.json()),
  {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 10000,
    shouldRetry: error => {
      // Don't retry on client errors
      return !(error instanceof AppError && error.statusCode < 500)
    },
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt} after error:`, error.message)
    },
  }
)
```

## Common Patterns

### Pattern 1: Global Error Handler (Express)

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from './errors'

// Error handler middleware
function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  })

  // Send appropriate response
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { fields: error.fields }),
      },
    })
  }

  // Unexpected errors
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    })
  }

  // Development mode - include stack trace
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      stack: error.stack,
    },
  })
}

// Async route wrapper
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.user.findUnique({ where: { id: req.params.id } })

    if (!user) {
      throw new NotFoundError('User', req.params.id)
    }

    res.json({ user })
  })
)

// Must be last middleware
app.use(errorHandler)

// Unhandled rejection handler
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason)
  // Log to monitoring service
  process.exit(1)
})

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  // Log to monitoring service
  process.exit(1)
})
```

### Pattern 2: Circuit Breaker

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  successThreshold: number // Successes needed to close from half-open
  timeout: number          // Time to wait before trying again (ms)
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private nextAttempt = Date.now()

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN')
      }
      // Try half-open
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.successCount = 0
      }
    }
  }

  private onFailure() {
    this.failureCount++
    this.successCount = 0

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      this.nextAttempt = Date.now() + this.config.timeout
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Usage
const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
})

async function callExternalAPI() {
  return apiCircuitBreaker.execute(async () => {
    const response = await fetch('https://api.example.com/data')
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  })
}
```

### Pattern 3: Structured Logging

```typescript
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any
}

class Logger {
  constructor(private context: LogContext = {}) {}

  private log(level: LogLevel, message: string, meta?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...meta,
    }

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to DataDog, Sentry, etc.
      console.log(JSON.stringify(logEntry))
    } else {
      // Pretty print in development
      console.log(`[${timestamp}] ${level}: ${message}`, meta)
    }
  }

  debug(message: string, meta?: LogContext) {
    this.log(LogLevel.DEBUG, message, meta)
  }

  info(message: string, meta?: LogContext) {
    this.log(LogLevel.INFO, message, meta)
  }

  warn(message: string, meta?: LogContext) {
    this.log(LogLevel.WARN, message, meta)
  }

  error(message: string, error?: Error, meta?: LogContext) {
    this.log(LogLevel.ERROR, message, {
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError && {
          code: error.code,
          statusCode: error.statusCode,
        }),
      } : undefined,
    })
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context })
  }
}

// Global logger
export const logger = new Logger()

// Request-scoped logger (Express middleware)
function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID()
  const requestLogger = logger.child({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
  })

  req.logger = requestLogger
  requestLogger.info('Request started')

  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    requestLogger.info('Request completed', {
      statusCode: res.statusCode,
      duration,
    })
  })

  next()
}

// Usage
app.use(loggerMiddleware)

app.get('/users/:id', async (req, res) => {
  try {
    req.logger.debug('Fetching user', { userId: req.params.id })

    const user = await getUser(req.params.id)

    req.logger.info('User fetched successfully', { userId: user.id })

    res.json({ user })
  } catch (error) {
    req.logger.error('Failed to fetch user', error as Error, {
      userId: req.params.id,
    })
    throw error
  }
})
```

### Pattern 4: Graceful Degradation

```typescript
// Feature flags with fallbacks
interface FeatureConfig<T> {
  name: string
  primaryFn: () => Promise<T>
  fallbackFn: () => Promise<T>
  shouldFallback?: (error: Error) => boolean
  onFallback?: (error: Error) => void
}

async function withFallback<T>(config: FeatureConfig<T>): Promise<T> {
  try {
    return await config.primaryFn()
  } catch (error) {
    const shouldFallback = config.shouldFallback?.(error as Error) ?? true

    if (!shouldFallback) {
      throw error
    }

    logger.warn(`Feature ${config.name} failed, using fallback`, {
      error: (error as Error).message,
    })

    config.onFallback?.(error as Error)

    return await config.fallbackFn()
  }
}

// Usage - External API with cache fallback
async function getRecommendations(userId: string) {
  return withFallback({
    name: 'recommendations',
    primaryFn: async () => {
      const response = await fetch(`https://api.example.com/recommendations/${userId}`)
      if (!response.ok) throw new Error('API failed')
      return response.json()
    },
    fallbackFn: async () => {
      // Return cached or default recommendations
      const cached = await cache.get(`recommendations:${userId}`)
      return cached || getDefaultRecommendations()
    },
    shouldFallback: error => {
      // Don't fallback on auth errors
      return !(error instanceof UnauthorizedError)
    },
    onFallback: error => {
      // Track degradation
      metrics.increment('recommendations.fallback', { error: error.message })
    },
  })
}

// Multi-source data fetching
async function getUserProfile(userId: string) {
  const [
    baseProfile,
    preferences,
    socialData,
  ] = await Promise.allSettled([
    fetchBaseProfile(userId),
    fetchUserPreferences(userId),
    fetchSocialData(userId),
  ])

  // Always return base profile, optionally include others
  if (baseProfile.status === 'rejected') {
    throw new NotFoundError('User', userId)
  }

  return {
    ...baseProfile.value,
    preferences: preferences.status === 'fulfilled'
      ? preferences.value
      : getDefaultPreferences(),
    social: socialData.status === 'fulfilled'
      ? socialData.value
      : null,
  }
}
```

## Advanced Techniques

### 1. Error Recovery Strategies

```typescript
// Timeout wrapper
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(timeoutError || new Error('Operation timed out')),
        timeoutMs
      )
    ),
  ])
}

// Cancellable promise
class CancellablePromise<T> {
  private cancelled = false

  constructor(
    private executor: (
      resolve: (value: T) => void,
      reject: (error: Error) => void,
      onCancel: (fn: () => void) => void
    ) => void
  ) {}

  async execute(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let cancelHandler: (() => void) | undefined

      const onCancel = (fn: () => void) => {
        cancelHandler = fn
      }

      this.executor(
        value => {
          if (!this.cancelled) resolve(value)
        },
        error => {
          if (!this.cancelled) reject(error)
        },
        onCancel
      )
    })
  }

  cancel() {
    this.cancelled = true
  }
}

// Usage
const cancellable = new CancellablePromise<Data>((resolve, reject, onCancel) => {
  const controller = new AbortController()

  onCancel(() => controller.abort())

  fetch('https://api.example.com/data', { signal: controller.signal })
    .then(r => r.json())
    .then(resolve)
    .catch(reject)
})

// Cancel after 5 seconds
setTimeout(() => cancellable.cancel(), 5000)
```

### 2. Error Aggregation

```typescript
// Collect multiple errors
class AggregateError extends Error {
  constructor(
    public errors: Error[],
    message = `Multiple errors occurred (${errors.length})`
  ) {
    super(message)
    this.name = 'AggregateError'
  }
}

// Parallel execution with error collection
async function executeAll<T>(
  tasks: Array<() => Promise<T>>,
  { continueOnError = false } = {}
): Promise<{ results: T[]; errors: Error[] }> {
  const results: T[] = []
  const errors: Error[] = []

  await Promise.all(
    tasks.map(async (task, index) => {
      try {
        results[index] = await task()
      } catch (error) {
        errors.push(error as Error)
        if (!continueOnError) {
          throw error
        }
      }
    })
  )

  if (errors.length > 0 && !continueOnError) {
    throw new AggregateError(errors)
  }

  return { results, errors }
}

// Usage
const { results, errors } = await executeAll(
  [
    () => fetchUsers(),
    () => fetchPosts(),
    () => fetchComments(),
  ],
  { continueOnError: true }
)

if (errors.length > 0) {
  logger.warn('Some operations failed', {
    errorCount: errors.length,
    errors: errors.map(e => e.message),
  })
}
```

### 3. Error Context Propagation

```typescript
// Error with context
class ContextualError extends AppError {
  constructor(
    message: string,
    code: string,
    public context: Record<string, any> = {},
    public cause?: Error
  ) {
    super(message, code)
  }

  withContext(context: Record<string, any>): ContextualError {
    return new ContextualError(
      this.message,
      this.code,
      { ...this.context, ...context },
      this.cause
    )
  }

  wrap(cause: Error): ContextualError {
    return new ContextualError(
      this.message,
      this.code,
      this.context,
      cause
    )
  }
}

// Usage
async function processOrder(orderId: string) {
  try {
    const order = await fetchOrder(orderId)
    await validateOrder(order)
    await chargePayment(order)
    await shipOrder(order)
  } catch (error) {
    throw new ContextualError(
      'Failed to process order',
      'ORDER_PROCESSING_FAILED',
      { orderId, timestamp: Date.now() }
    ).wrap(error as Error)
  }
}

// Error chain logging
function logErrorChain(error: Error) {
  let current: Error | undefined = error

  while (current) {
    logger.error(current.message, current, {
      ...(current instanceof ContextualError && { context: current.context }),
    })

    current = current instanceof ContextualError ? current.cause : undefined
  }
}
```

### 4. Health Checks

```typescript
interface HealthCheck {
  name: string
  check: () => Promise<boolean>
  critical?: boolean
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, {
    status: 'pass' | 'fail'
    responseTime: number
    error?: string
  }>
  timestamp: string
}

class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map()

  register(check: HealthCheck) {
    this.checks.set(check.name, check)
  }

  async getStatus(): Promise<HealthStatus> {
    const results = await Promise.allSettled(
      Array.from(this.checks.entries()).map(async ([name, check]) => {
        const start = Date.now()
        try {
          const result = await withTimeout(check.check(), 5000)
          return {
            name,
            status: result ? 'pass' : 'fail',
            responseTime: Date.now() - start,
            critical: check.critical ?? false,
          }
        } catch (error) {
          return {
            name,
            status: 'fail' as const,
            responseTime: Date.now() - start,
            error: (error as Error).message,
            critical: check.critical ?? false,
          }
        }
      })
    )

    const checks: HealthStatus['checks'] = {}
    let hasCriticalFailure = false
    let hasNonCriticalFailure = false

    results.forEach((result, index) => {
      const [name] = Array.from(this.checks.keys())[index]

      if (result.status === 'fulfilled') {
        checks[name] = result.value

        if (result.value.status === 'fail') {
          if (result.value.critical) {
            hasCriticalFailure = true
          } else {
            hasNonCriticalFailure = true
          }
        }
      }
    })

    return {
      status: hasCriticalFailure
        ? 'unhealthy'
        : hasNonCriticalFailure
        ? 'degraded'
        : 'healthy',
      checks,
      timestamp: new Date().toISOString(),
    }
  }
}

// Setup
const health = new HealthMonitor()

health.register({
  name: 'database',
  check: async () => {
    await db.$queryRaw`SELECT 1`
    return true
  },
  critical: true,
})

health.register({
  name: 'redis',
  check: async () => {
    await redis.ping()
    return true
  },
  critical: false,
})

health.register({
  name: 'external-api',
  check: async () => {
    const response = await fetch('https://api.example.com/health')
    return response.ok
  },
  critical: false,
})

// Health endpoint
app.get('/health', async (req, res) => {
  const status = await health.getStatus()

  const httpStatus = status.status === 'healthy'
    ? 200
    : status.status === 'degraded'
    ? 200
    : 503

  res.status(httpStatus).json(status)
})
```

## Production Examples

### Example 1: Complete API Error Handling

```typescript
// errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// middleware/error-handler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id

  // Log error with context
  logger.error('Request failed', error, {
    requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  })

  // API Error
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    })
  }

  // Validation errors (Zod)
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors,
        requestId,
      },
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists',
          requestId,
        },
      })
    }
  }

  // Rate limit
  if (error instanceof RateLimitError) {
    res.setHeader('Retry-After', error.retryAfter)
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        retryAfter: error.retryAfter,
        requestId,
      },
    })
  }

  // Unknown errors
  const statusCode = 500
  const errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      requestId,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  }

  res.status(statusCode).json(errorResponse)
}

// services/user-service.ts
export class UserService {
  async createUser(data: CreateUserDTO): Promise<User> {
    // Validate input
    const validated = CreateUserSchema.parse(data)

    // Check for existing user
    const existing = await db.user.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      throw new APIError(
        'User with this email already exists',
        'USER_EXISTS',
        409,
        { email: validated.email }
      )
    }

    // Create user with retry
    const user = await withRetry(
      () => db.user.create({ data: validated }),
      {
        maxAttempts: 3,
        shouldRetry: error => {
          // Only retry on connection errors
          return error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P1001'
        },
      }
    )

    logger.info('User created', { userId: user.id, email: user.email })

    return user
  }
}
```

### Example 2: React Query Error Handling

```typescript
// hooks/use-query-error.ts
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export function useQueryError() {
  const queryClient = useQueryClient()

  return useCallback((error: Error) => {
    if (error instanceof APIError) {
      // Handle specific error codes
      switch (error.code) {
        case 'UNAUTHORIZED':
          queryClient.clear()
          window.location.href = '/login'
          break

        case 'NOT_FOUND':
          toast.error('Resource not found')
          break

        case 'VALIDATION_ERROR':
          toast.error(error.message)
          break

        default:
          toast.error('An error occurred')
      }
    } else {
      // Network or unknown errors
      toast.error('Connection error. Please try again.')
    }

    // Log to error tracking
    logError(error)
  }, [queryClient])
}

// hooks/use-user.ts
export function useUser(userId: string) {
  const handleError = useQueryError()

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new APIError(
          error.message,
          error.code,
          response.status
        )
      }

      return response.json()
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof APIError && error.statusCode < 500) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: handleError,
  })
}
```

### Example 3: Comprehensive Logging System

```typescript
// logger.ts
import winston from 'winston'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new LogtailTransport(logtail),
  ],
})

// Error tracking integration
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof APIError && {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      }),
    },
    ...context,
  })

  // Send to Sentry
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
}

export default logger
```

## Best Practices

### 1. Fail Fast
```typescript
// Validate early
function processUser(user: unknown) {
  const validated = UserSchema.parse(user) // Throws immediately
  // Continue with validated data
}
```

### 2. Provide Context
```typescript
// BAD
throw new Error('Invalid input')

// GOOD
throw new ValidationError('Invalid email format', {
  email: 'Expected format: user@example.com',
  received: userInput,
})
```

### 3. Use Type-Safe Errors
```typescript
// Use discriminated unions
type APIResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: APIError }
```

### 4. Log Appropriately
```typescript
// DEBUG: Verbose details
logger.debug('Processing request', { userId, action })

// INFO: Normal operation
logger.info('User created', { userId })

// WARN: Unexpected but handled
logger.warn('Cache miss', { key })

// ERROR: Requires attention
logger.error('Database connection failed', error)
```

### 5. Handle Async Errors
```typescript
// Always use try/catch with async
async function fetchData() {
  try {
    return await api.getData()
  } catch (error) {
    logger.error('Failed to fetch data', error)
    throw error
  }
}

// Or use wrapper
const result = await withResult(() => api.getData())
```

## Common Pitfalls

### 1. Swallowing Errors
```typescript
// BAD
try {
  await riskyOperation()
} catch (error) {
  // Silent failure
}

// GOOD
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error)
  throw error // Or handle appropriately
}
```

### 2. Generic Error Messages
```typescript
// BAD
throw new Error('Error')

// GOOD
throw new ValidationError(
  'Email validation failed: invalid format',
  { email: input.email }
)
```

### 3. Not Using Error Boundaries
```typescript
// BAD - Unhandled errors crash app
function App() {
  return <MyComponent />
}

// GOOD
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### 4. Retrying Non-Idempotent Operations
```typescript
// BAD - May create duplicates
await withRetry(() => createPayment(amount))

// GOOD - Use idempotency key
await withRetry(() => createPayment(amount, idempotencyKey))
```

### 5. Ignoring Error Context
```typescript
// BAD
catch (error) {
  throw new Error('Failed')
}

// GOOD - Preserve context
catch (error) {
  throw new ContextualError('Failed to process order', 'ORDER_FAILED', {
    orderId,
    userId,
  }).wrap(error)
}
```

## Resources

### Libraries
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [winston](https://github.com/winstonjs/winston) - Logging
- [Sentry](https://sentry.io/) - Error tracking
- [@tanstack/react-query](https://tanstack.com/query) - Data fetching with retry

### Documentation
- [Error Handling in Node.js](https://nodejs.org/en/docs/guides/error-handling/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [MDN Error Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

### Patterns
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Retry Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)
- [Result Type](https://www.rust-lang.org/what/error-handling)

### Tools
- [Sentry](https://sentry.io/) - Application monitoring
- [DataDog](https://www.datadoghq.com/) - Logging and APM
- [LogRocket](https://logrocket.com/) - Frontend error tracking
