# Dockerfile for backend-only deployment (Railway/Fly.io)
FROM oven/bun:1.1.32-alpine AS base

RUN apk add --no-cache ca-certificates curl

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build server
RUN bun run --filter=@acme/server build

# Create non-root user
RUN addgroup -g 1001 -S server
RUN adduser -S server -u 1001

# Switch to non-root user
USER server

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "--filter=@acme/server", "start"]
