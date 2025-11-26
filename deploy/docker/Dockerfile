# Multi-stage Dockerfile optimized for Bun and production deployment
FROM oven/bun:1.3.2-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
  ca-certificates \
  curl \
  && rm -rf /var/cache/apk/*

WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN bun install --frozen-lockfile --production

# Stage 2: Build
FROM base AS builder

# Copy source code and dependencies
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN cd apps/server && bun run build

# Stage 3: Runtime
FROM base AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bun

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy built application
COPY --from=builder --chown=bun:nodejs /app/apps/server/server ./server
COPY --from=builder --chown=bun:nodejs /app/apps/server/package.json ./package.json

# Switch to non-root user
USER bun

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["./server"]