# Node.js Backend Expert

> **ID:** `node-backend`
> **Tier:** 3
> **Token Cost:** 8000
> **MCP Connections:** postgres, supabase

## What This Skill Does

- Build REST and GraphQL APIs
- Implement middleware patterns
- Handle authentication (JWT, OAuth)
- Configure Express/Fastify/Hono
- Manage async operations and error handling
- Database integration patterns
- API security best practices

## When to Use

This skill is automatically loaded when:

- **Keywords:** node, express, fastify, hono, backend, api, middleware, jwt, rest
- **File Types:** .ts, .js
- **Directories:** server/, api/, backend/, routes/

---

## Core Capabilities

### 1. Express.js Production Setup

**Project Structure:**
```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server bootstrap
├── config/
│   ├── index.ts           # Configuration management
│   └── database.ts        # Database config
├── middleware/
│   ├── auth.ts            # Authentication
│   ├── errorHandler.ts    # Global error handling
│   ├── rateLimiter.ts     # Rate limiting
│   └── validation.ts      # Request validation
├── routes/
│   ├── index.ts           # Route aggregation
│   ├── users.ts           # User routes
│   └── products.ts        # Product routes
├── controllers/
│   ├── userController.ts
│   └── productController.ts
├── services/
│   ├── userService.ts
│   └── productService.ts
├── models/
│   └── types.ts           # TypeScript types
└── utils/
    ├── logger.ts
    └── helpers.ts
```

**Express App Configuration:**
```typescript
// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import routes from './routes';
import { logger } from './utils/logger';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: () => config.env === 'test',
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Health check (before auth)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
```

**Server Bootstrap:**
```typescript
// src/server.ts
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Create and start server
    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        logger.info('Database disconnected');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
```

---

### 2. Fastify High-Performance Setup

**Fastify Application:**
```typescript
// src/app.ts
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { config } from './config';
import { userRoutes } from './routes/users';
import { productRoutes } from './routes/products';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: config.env === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
    trustProxy: true,
  });

  // Register plugins
  await app.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  await app.register(helmet);
  await app.register(sensible); // Adds httpErrors, assert, etc.

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
      servers: [{ url: config.baseUrl }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Register routes
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(productRoutes, { prefix: '/api/v1/products' });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = statusCode === 500
      ? 'Internal Server Error'
      : error.message;

    reply.status(statusCode).send({
      error: true,
      message,
      ...(config.env === 'development' && { stack: error.stack }),
    });
  });

  return app;
}

// Fastify route example with schema validation
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', {
    schema: {
      body: zodToJsonSchema(createUserSchema),
      response: {
        201: zodToJsonSchema(userResponseSchema),
      },
    },
    handler: async (request, reply) => {
      const data = createUserSchema.parse(request.body);
      const user = await userService.create(data);
      return reply.status(201).send(user);
    },
  });
};
```

---

### 3. Hono Edge-Ready Framework

**Hono Application:**
```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Type-safe environment
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

type Variables = {
  user: { id: string; email: string } | null;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: ['https://myapp.com'],
  credentials: true,
}));

// Rate limiting
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'anonymous',
}));

// Auth middleware
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    c.set('user', null);
    return next();
  }

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    c.set('user', payload);
  } catch {
    c.set('user', null);
  }

  return next();
};

app.use('*', authMiddleware);

// Routes
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

app.post('/api/users', zValidator('json', userSchema), async (c) => {
  const data = c.req.valid('json');
  const user = await createUser(data, c.env.DATABASE_URL);
  return c.json(user, 201);
});

app.get('/api/users/:id', async (c) => {
  const { id } = c.req.param();
  const user = await getUser(id, c.env.DATABASE_URL);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

// Protected route
app.get('/api/me', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json(user);
});

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;
```

---

### 4. Middleware Patterns

**Authentication Middleware:**
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as AuthRequest['user'];

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(error);
  }
};

// Role-based access control
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Usage
router.get('/admin', authenticate, authorize('admin'), adminController.dashboard);
```

**Validation Middleware:**
```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = <T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[target]);
      req[target] = data; // Replace with validated/transformed data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Usage
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/users', validate(createUserSchema), userController.create);
```

**Error Handler Middleware:**
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: true,
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { details: error.details }),
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: true,
        code: 'DUPLICATE',
        message: 'Resource already exists',
      });
    }
  }

  // Default to 500
  res.status(500).json({
    error: true,
    message: config.env === 'production'
      ? 'Internal server error'
      : error.message,
    ...(config.env !== 'production' && { stack: error.stack }),
  });
};
```

---

### 5. JWT Authentication

**Complete JWT Implementation:**
```typescript
// services/authService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { prisma } from '../config/database';
import { UnauthorizedError } from '../middleware/errorHandler';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Generate tokens
  generateTokens(payload: TokenPayload): Tokens {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn, // e.g., '15m'
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn } // e.g., '7d'
    );

    return { accessToken, refreshToken };
  },

  // Verify access token
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },

  // Verify refresh token
  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as { userId: string };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },

  // Register user
  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  },

  // Login
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  },

  // Refresh tokens
  async refreshTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const tokens = this.generateTokens({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  },

  // Logout
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  // Logout all sessions
  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },
};
```

---

### 6. Database Integration Patterns

**Repository Pattern:**
```typescript
// repositories/baseRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';

export abstract class BaseRepository<
  Model extends { id: string },
  CreateInput,
  UpdateInput
> {
  constructor(
    protected prisma: PrismaClient,
    protected modelName: Prisma.ModelName
  ) {}

  protected get model() {
    return this.prisma[this.modelName.toLowerCase() as keyof PrismaClient] as any;
  }

  async findById(id: string): Promise<Model | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<Model[]> {
    return this.model.findMany(options);
  }

  async create(data: CreateInput): Promise<Model> {
    return this.model.create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<Model> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Model> {
    return this.model.delete({ where: { id } });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }
}

// repositories/userRepository.ts
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'User');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }

  async findWithPosts(id: string): Promise<User & { posts: any[] } | null> {
    return this.model.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  async searchUsers(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.model.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.model.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

**Transaction Handling:**
```typescript
// services/orderService.ts
import { prisma } from '../config/database';

export const orderService = {
  async createOrder(userId: string, items: OrderItem[]) {
    return prisma.$transaction(async (tx) => {
      // Calculate total
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });

      const total = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        return sum + product.price * item.quantity;
      }, 0);

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: products.find((p) => p.id === item.productId)!.price,
            })),
          },
        },
        include: { items: true },
      });

      // Update stock
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return order;
    });
  },
};
```

---

### 7. Async Patterns & Error Handling

**Async Handler Wrapper:**
```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
}));
```

**Retry Pattern:**
```typescript
// utils/retry.ts
interface RetryOptions {
  retries: number;
  delay: number;
  backoff: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retries) {
        throw lastError;
      }

      onRetry?.(lastError, attempt);

      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

// Usage
const data = await withRetry(
  () => externalApi.fetchData(),
  {
    retries: 3,
    delay: 1000,
    onRetry: (error, attempt) => {
      logger.warn(`Retry attempt ${attempt}: ${error.message}`);
    },
  }
);
```

**Parallel Processing with Limits:**
```typescript
// utils/parallelLimit.ts
export async function parallelLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const promise = fn(items[i], i).then((result) => {
      results[i] = result;
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

// Usage - process 100 items with max 10 concurrent operations
const results = await parallelLimit(
  items,
  10,
  async (item) => processItem(item)
);
```

---

## Real-World Examples

### Example 1: Complete REST API with CRUD
```typescript
// routes/products.ts
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { productService } from '../services/productService';

const router = Router();

// Schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid(),
});

const updateProductSchema = createProductSchema.partial();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// List products (public)
router.get('/', validate(querySchema, 'query'), asyncHandler(async (req, res) => {
  const result = await productService.findMany(req.query);
  res.json(result);
}));

// Get single product (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await productService.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
}));

// Create product (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  })
);

// Update product (admin only)
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  })
);

// Delete product (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    await productService.delete(req.params.id);
    res.status(204).send();
  })
);

export default router;
```

### Example 2: WebSocket Integration
```typescript
// websocket/index.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;

    // Join user's private room
    socket.join(`user:${userId}`);

    console.log(`User ${userId} connected`);

    socket.on('join:room', (roomId: string) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user:joined', { userId });
    });

    socket.on('message:send', async (data: { roomId: string; content: string }) => {
      const message = await messageService.create({
        roomId: data.roomId,
        userId,
        content: data.content,
      });

      io.to(`room:${data.roomId}`).emit('message:new', message);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}

// Emit from anywhere in the app
export function emitToUser(io: Server, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}
```

---

## Related Skills

- `prisma-drizzle-orm` - Database ORM patterns
- `trpc-fullstack` - Type-safe APIs
- `devops-engineer` - Deployment and CI/CD
- `container-chief` - Docker containerization

## Further Reading

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Hono Documentation](https://hono.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
