# Container Chief

> **ID:** `container-chief`
> **Tier:** 2
> **Token Cost:** 5000
> **MCP Connections:** docker

## What This Skill Does

- Docker container management
- Docker Compose orchestration
- Multi-stage image building
- Container networking
- Volume management
- Log inspection and debugging
- Security best practices

## When to Use

This skill is automatically loaded when:

- **Keywords:** docker, container, compose, image, dockerfile, kubernetes
- **File Types:** Dockerfile, docker-compose.yml
- **Directories:** docker/, .docker/

---

## Core Capabilities

### 1. Dockerfile Best Practices

**Multi-Stage Build for Node.js:**
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN corepack enable pnpm && pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built assets
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Multi-Stage Build for Python:**
```dockerfile
# Stage 1: Build
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Copy application
COPY --chown=appuser:appuser . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Next.js Standalone Build:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Dockerfile Security Checklist:**
```dockerfile
# 1. Use specific versions (not :latest)
FROM node:20.10.0-alpine3.18

# 2. Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

# 3. Use COPY instead of ADD (unless extracting archives)
COPY --chown=nextjs:nodejs . .

# 4. Minimize layers and clean up in same layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 5. Use .dockerignore to exclude sensitive files
# .dockerignore: .env, .git, node_modules, *.log

# 6. Don't store secrets in images - use runtime secrets
# ARG secrets are visible in image history!

# 7. Use read-only filesystem when possible
# docker run --read-only myimage

# 8. Set resource limits
# docker run --memory=512m --cpus=1 myimage
```

---

### 2. Docker Compose Orchestration

**Complete Development Stack:**
```yaml
# docker-compose.yml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: myapp
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules  # Anonymous volume for node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:16-alpine
    container_name: myapp-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes

  # Background worker
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: myapp-worker
    restart: unless-stopped
    command: ["node", "dist/worker.js"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: myapp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

**Production Override:**
```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  app:
    build:
      target: production
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 10s

  db:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

  nginx:
    deploy:
      replicas: 2

secrets:
  db_password:
    external: true
```

**Usage:**
```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f app

# Rebuild single service
docker compose up -d --build app

# Scale service
docker compose up -d --scale app=3

# Execute command in container
docker compose exec app sh

# Stop and remove
docker compose down -v  # -v removes volumes
```

---

### 3. Container Management Commands

**Essential Docker Commands:**
```bash
# Build
docker build -t myapp:latest .
docker build -t myapp:latest --target production .
docker build --no-cache -t myapp:latest .
docker build --build-arg NODE_ENV=production -t myapp:latest .

# Run
docker run -d --name myapp -p 3000:3000 myapp:latest
docker run -d --name myapp -p 3000:3000 \
  -e DATABASE_URL=... \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  myapp:latest

# Interactive shell
docker run -it --rm myapp:latest sh
docker exec -it myapp sh

# Logs
docker logs myapp
docker logs -f myapp  # Follow
docker logs --tail 100 myapp
docker logs --since 1h myapp

# Inspect
docker inspect myapp
docker inspect --format='{{.State.Health.Status}}' myapp
docker stats myapp

# Cleanup
docker stop myapp && docker rm myapp
docker system prune -af  # Remove all unused
docker image prune -af   # Remove dangling images
docker volume prune -f   # Remove unused volumes

# Copy files
docker cp myapp:/app/logs ./logs
docker cp ./config.json myapp:/app/config.json
```

**Container Debugging:**
```bash
# Check container processes
docker top myapp

# Resource usage
docker stats --no-stream

# Network inspection
docker network ls
docker network inspect app-network

# Port mapping
docker port myapp

# Environment variables
docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' myapp

# Get container IP
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myapp

# Health check status
docker inspect --format='{{json .State.Health}}' myapp | jq

# View layers
docker history myapp:latest

# Save/Load images
docker save myapp:latest > myapp.tar
docker load < myapp.tar
```

---

### 4. Volume Management

**Volume Types:**
```yaml
# docker-compose.yml
services:
  app:
    volumes:
      # Named volume (persistent, managed by Docker)
      - app_data:/app/data

      # Bind mount (host directory)
      - ./config:/app/config:ro  # Read-only

      # Anonymous volume (survives container restart)
      - /app/node_modules

      # tmpfs (in-memory, not persisted)
    tmpfs:
      - /app/tmp:size=100M

volumes:
  app_data:
    driver: local
    driver_opts:
      type: none
      device: /data/app
      o: bind
```

**Volume Operations:**
```bash
# Create volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Remove volume
docker volume rm mydata

# Backup volume
docker run --rm -v mydata:/data -v $(pwd):/backup alpine \
  tar czf /backup/mydata.tar.gz /data

# Restore volume
docker run --rm -v mydata:/data -v $(pwd):/backup alpine \
  tar xzf /backup/mydata.tar.gz -C /

# Copy between volumes
docker run --rm -v source:/from -v dest:/to alpine \
  cp -r /from/. /to/
```

---

### 5. Networking

**Network Configuration:**
```yaml
# docker-compose.yml
services:
  frontend:
    networks:
      - frontend-network

  backend:
    networks:
      - frontend-network
      - backend-network

  db:
    networks:
      - backend-network

networks:
  frontend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

  backend-network:
    driver: bridge
    internal: true  # No external access
```

**Network Commands:**
```bash
# Create network
docker network create --driver bridge mynetwork

# Connect container to network
docker network connect mynetwork myapp

# Disconnect from network
docker network disconnect mynetwork myapp

# List containers in network
docker network inspect mynetwork --format='{{range .Containers}}{{.Name}} {{end}}'
```

---

### 6. Docker Registry

**Push to Registry:**
```bash
# Login to registry
docker login registry.example.com

# Tag image
docker tag myapp:latest registry.example.com/myapp:latest
docker tag myapp:latest registry.example.com/myapp:v1.0.0

# Push
docker push registry.example.com/myapp:latest

# Pull
docker pull registry.example.com/myapp:latest
```

**GitHub Container Registry:**
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag and push
docker tag myapp:latest ghcr.io/username/myapp:latest
docker push ghcr.io/username/myapp:latest
```

**Private Registry:**
```yaml
# docker-compose.yml
services:
  registry:
    image: registry:2
    ports:
      - "5000:5000"
    volumes:
      - registry_data:/var/lib/registry
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "true"

volumes:
  registry_data:
```

---

### 7. Health Checks

**Dockerfile Health Check:**
```dockerfile
# HTTP health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# TCP health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD nc -z localhost 3000 || exit 1

# Custom script
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD ["/app/healthcheck.sh"]
```

**Health Check Script:**
```bash
#!/bin/sh
# healthcheck.sh

# Check main process
if ! pgrep -x "node" > /dev/null; then
  echo "Process not running"
  exit 1
fi

# Check HTTP endpoint
if ! curl -sf http://localhost:3000/health > /dev/null; then
  echo "HTTP check failed"
  exit 1
fi

# Check database connection
if ! node -e "require('./dist/db').ping()" 2>/dev/null; then
  echo "Database check failed"
  exit 1
fi

exit 0
```

---

## Real-World Examples

### Example 1: Full-Stack Development Environment
```yaml
# docker-compose.dev.yml
version: '3.9'

services:
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000

  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  minio_data:
```

### Example 2: CI/CD Pipeline Docker Build
```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production
```

---

## Related Skills

- `devops-engineer` - CI/CD and deployment
- `nginx-expert` - Reverse proxy configuration
- `node-backend` - Backend development
- `python-developer` - Python containerization

## Further Reading

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
