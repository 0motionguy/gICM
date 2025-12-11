---
name: docker-best-practices
description: "{process.exit(r.statusCode === 200 ? 0 : 1)})\""
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Docker Best Practices

## Quick Reference

```dockerfile
# Multi-stage build template
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Essential Commands
```bash
# Build with cache
docker build -t app:latest .

# Build with BuildKit
DOCKER_BUILDKIT=1 docker build -t app:latest .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t app:latest .

# Prune everything
docker system prune -a --volumes
```

### Layer Optimization Checklist
- [ ] Use specific base image tags (not `latest`)
- [ ] Combine RUN commands with `&&`
- [ ] Copy package files before source code
- [ ] Use `.dockerignore` file
- [ ] Multi-stage builds for smaller images
- [ ] Non-root user for runtime

## Core Concepts

### 1. Image Layers

Each Dockerfile instruction creates a layer. Layers are cached and reused.

```dockerfile
# BAD - 3 layers, cache-inefficient
FROM node:20-alpine
COPY . .
RUN npm install
RUN npm run build

# GOOD - Optimized layer ordering
FROM node:20-alpine
WORKDIR /app
# Dependencies layer (changes infrequently)
COPY package*.json ./
RUN npm ci
# Source code layer (changes frequently)
COPY . .
RUN npm run build
```

### 2. Multi-Stage Builds

Separate build and runtime environments to minimize final image size.

```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 3. BuildKit Features

Enhanced build performance with caching and parallelization.

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine

# Cache mount for npm
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

WORKDIR /app

# Cache mount for dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
```

### 4. Security Layers

```dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Set ownership before switching user
COPY --chown=nodejs:nodejs . .

# Install dependencies as non-root
USER nodejs
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "server.js"]
```

## Common Patterns

### Pattern 1: Node.js Production Build

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production dependencies
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Runner stage
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
```

### Pattern 2: Go Application with Scratch Base

```dockerfile
# syntax=docker/dockerfile:1

FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

WORKDIR /src

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o /app/server ./cmd/server

# Runtime stage with scratch
FROM scratch

# Copy CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy binary
COPY --from=builder /app/server /server

# Non-root user
USER 65534:65534

EXPOSE 8080
ENTRYPOINT ["/server"]
```

### Pattern 3: Python with Poetry

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    POETRY_VERSION=1.7.0 \
    POETRY_HOME="/opt/poetry" \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true

ENV PATH="$POETRY_HOME/bin:$PATH"

# Install poetry
RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /app

# Dependencies stage
FROM base AS deps

COPY pyproject.toml poetry.lock ./
RUN poetry install --only=main --no-root

# Build stage
FROM base AS builder

COPY --from=deps /app/.venv /app/.venv
COPY . .
RUN poetry install --only=main

# Runtime stage
FROM python:3.11-slim AS runner

ENV PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

COPY --from=builder --chown=appuser:appuser /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appuser /app/src /app/src

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Pattern 4: Monorepo with Turborepo

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo pnpm
WORKDIR /app

# Prune workspace
FROM base AS pruner
COPY . .
RUN turbo prune --scope=@myapp/api --docker

# Build dependencies
FROM base AS deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build application
FROM base AS builder
COPY --from=pruner /app/out/full/ .
COPY --from=deps /app/node_modules ./node_modules
RUN turbo run build --filter=@myapp/api...

# Production dependencies
FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

USER nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## Advanced Techniques

### 1. BuildKit Cache Mounts

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Persistent cache for npm
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

# Bind mount source for build (not copied into image)
RUN --mount=type=bind,source=.,target=/app \
    --mount=type=cache,target=/app/.next/cache \
    npm run build

# Secret mount for API keys
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm install @private/package
```

### 2. Multi-Platform Builds

```dockerfile
# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETARCH

RUN echo "Building on $BUILDPLATFORM for $TARGETPLATFORM ($TARGETARCH)"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
```

**Build command:**
```bash
docker buildx create --name multiplatform --use
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag myapp:latest \
  --push \
  .
```

### 3. Development with Hot Reload

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
RUN npm install -g nodemon

# Copy package files
COPY package*.json ./
RUN npm install

# Source code mounted as volume
VOLUME /app

EXPOSE 3000 9229

CMD ["nodemon", "--inspect=0.0.0.0:9229", "src/index.js"]
```

**docker-compose.yml:**
```yaml
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - ./src:/app/src
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"
    environment:
      NODE_ENV: development
```

### 4. Distroless Images

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Use distroless for minimal attack surface
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER nonroot:nonroot

EXPOSE 3000

CMD ["dist/index.js"]
```

## Production Examples

### Example 1: Next.js with Standalone Output

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build with standalone output
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**next.config.js:**
```javascript
module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
}
```

### Example 2: Nginx with Static Assets

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Run as non-root
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "public, max-age=3600";
        }

        location /static {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Example 3: Full-Stack with Docker Compose

```dockerfile
# API Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

USER nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/main.js"]
```

**docker-compose.yml:**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-myapp}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - backend

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: runner
      cache_from:
        - type=registry,ref=myregistry/api:buildcache
      cache_to:
        - type=registry,ref=myregistry/api:buildcache,mode=max
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-myapp}
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend
      - frontend
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
    depends_on:
      - api
    networks:
      - frontend

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web
      - api
    networks:
      - frontend

volumes:
  postgres_data:
  redis_data:

networks:
  frontend:
  backend:
```

## Best Practices

### 1. Image Size Optimization

```dockerfile
# Use Alpine-based images
FROM node:20-alpine  # 40MB vs node:20 (300MB+)

# Multi-stage builds
FROM node:20 AS builder  # Large build image
FROM node:20-alpine AS runner  # Small runtime

# Remove dev dependencies
RUN npm ci --only=production

# Clean cache
RUN npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*
```

### 2. Security Hardening

```dockerfile
# Specific version tags
FROM node:20.10.0-alpine3.18  # Not :latest

# Run as non-root
USER node

# Read-only root filesystem
RUN chmod -R 555 /app

# Scan with Trivy
RUN apk add --no-cache trivy && \
    trivy filesystem --exit-code 1 --severity HIGH,CRITICAL /
```

### 3. Build Performance

```dockerfile
# Use BuildKit
# syntax=docker/dockerfile:1

# Cache mounts
RUN --mount=type=cache,target=/root/.npm npm ci

# Parallel builds
RUN npm run build:client & npm run build:server & wait

# .dockerignore
node_modules
.git
.env
*.log
```

**.dockerignore:**
```
node_modules
npm-debug.log
.git
.gitignore
.dockerignore
Dockerfile
.env*
.DS_Store
dist
coverage
.next
```

### 4. Debugging Support

```dockerfile
FROM node:20-alpine AS development

ENV NODE_ENV=development

RUN npm install -g nodemon

EXPOSE 3000 9229

CMD ["nodemon", "--inspect=0.0.0.0:9229", "src/index.js"]
```

### 5. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# For Node.js
HEALTHCHECK CMD node healthcheck.js

# For Go
HEALTHCHECK CMD ["/app/healthcheck"]
```

## Common Pitfalls

### 1. Layer Caching Issues

```dockerfile
# BAD - Cache invalidated on any file change
COPY . .
RUN npm install

# GOOD - Leverage layer caching
COPY package*.json ./
RUN npm install
COPY . .
```

### 2. Running as Root

```dockerfile
# BAD - Security risk
FROM node:20-alpine
COPY . .
CMD ["node", "server.js"]

# GOOD - Non-root user
FROM node:20-alpine
USER node
COPY --chown=node:node . .
CMD ["node", "server.js"]
```

### 3. Large Image Sizes

```dockerfile
# BAD - 1GB+ image
FROM node:20
RUN apt-get update && apt-get install -y build-essential python3
COPY . .
RUN npm install

# GOOD - Sub-100MB image
FROM node:20-alpine AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
```

### 4. Missing .dockerignore

```bash
# Create .dockerignore
node_modules
.git
.env
*.log
dist
coverage
```

### 5. Hardcoded Secrets

```dockerfile
# BAD - Secrets in image
ENV API_KEY=sk-1234567890

# GOOD - Runtime secrets
CMD ["sh", "-c", "node server.js"]
# Pass via: docker run -e API_KEY=$API_KEY
```

## Resources

### Documentation
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### Tools
- [Dive](https://github.com/wagoodman/dive) - Image layer analysis
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter
- [Trivy](https://github.com/aquasecurity/trivy) - Vulnerability scanner
- [Docker Slim](https://github.com/docker-slim/docker-slim) - Image minifier

### Base Images
- [Alpine Linux](https://alpinelinux.org/) - Minimal base
- [Distroless](https://github.com/GoogleContainerTools/distroless) - Google's minimal images
- [Chainguard Images](https://www.chainguard.dev/chainguard-images) - Hardened images

### Security
- [Snyk Container](https://snyk.io/product/container-vulnerability-management/)
- [Docker Bench Security](https://github.com/docker/docker-bench-security)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
