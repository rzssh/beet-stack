# syntax=docker/dockerfile:1
# Single-stage build like Railway/Railpack - preserves symlinks
FROM oven/bun:1.3.2-debian
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile --ignore-scripts

RUN bun run --filter=@acme/core build
RUN bun run --filter=@acme/db build
RUN bun run --filter=@acme/web build

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["bun", "run", "server.ts"]
