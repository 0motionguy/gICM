# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files preserving directory structure
COPY packages/ ./packages/
COPY apps/dashboard/package.json ./apps/dashboard/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# Copy everything from deps
COPY --from=deps /app ./

# Copy all source code
COPY . .

# Build autonomy package (dashboard depends on it)
RUN pnpm --filter @gicm/autonomy build || echo "Autonomy build skipped"

# Build the dashboard
WORKDIR /app/apps/dashboard
RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public 2>/dev/null || true

WORKDIR /app/apps/dashboard

EXPOSE 10000

CMD ["node", "server.js"]
