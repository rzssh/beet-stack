FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
RUN bun run --filter=@beet/server build
RUN cp deploy/migrate.ts packages/db/_beet_migrate.ts \
 && cd packages/db && bun build --compile _beet_migrate.ts --outfile /app/migrate \
 && rm _beet_migrate.ts
RUN chmod +x apps/server/server migrate

FROM oven/bun:1.3.13 AS runtime
ENV NODE_ENV=production \
    BEET_APP_DIR=/app \
    SERVICE_PORT=3001 \
    HOME=/home/bun
WORKDIR /app
COPY --from=builder --chown=bun:bun /app/apps/server/server ./server
COPY --from=builder --chown=bun:bun /app/migrate ./migrate
COPY --chown=bun:bun packages/db/migrations ./packages/db/migrations
COPY --chown=bun:bun deploy/entrypoint.sh deploy/healthcheck.sh ./deploy/
RUN chmod +x deploy/entrypoint.sh deploy/healthcheck.sh server migrate
USER bun
EXPOSE 3001
ENTRYPOINT ["deploy/entrypoint.sh"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD ["deploy/healthcheck.sh"]
