# Dockerfile for backend-only deployment (Railway/Fly.io)
FROM oven/bun:1.1.32-alpine AS base

RUN apk add --no-cache ca-certificates curl

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build backend
RUN bun run --filter=backend build

# Create non-root user
RUN addgroup -g 1001 -S backend
RUN adduser -S backend -u 1001

# Switch to non-root user
USER backend

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "--filter=backend", "start"]
