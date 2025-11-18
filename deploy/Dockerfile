# Dockerfile for self-hosted deployment (Coolify/VPS)
FROM oven/bun:1.1.32-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache ca-certificates

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY packages/*/package.json ./packages/*/
COPY tooling/*/package.json ./tooling/*/
COPY apps/*/package.json ./apps/*/
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/dist ./apps/web/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start both frontend and backend
CMD ["bun", "run", "start"]
