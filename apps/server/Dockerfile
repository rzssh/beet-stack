# syntax=docker/dockerfile:1
FROM oven/bun:1.3.2-alpine AS base
RUN apk add --no-cache ca-certificates curl
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build packages and server
RUN bun run --filter=@acme/core build
RUN bun run --filter=@acme/db build
RUN bun run --filter=@acme/server build

# Create non-root user
RUN addgroup -g 1001 -S server && adduser -S server -u 1001
USER server

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "--filter=@acme/server", "start"]
