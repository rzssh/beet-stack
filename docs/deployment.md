# Deployment

`apps/server` is a standalone Elysia API: a single compiled Bun binary that runs
database migrations on start and serves the API plus `GET /health` on
`SERVICE_PORT` (default `3001`). Stateless replicas share PostgreSQL for data and
Better Auth sessions, so they scale horizontally behind a load balancer. Startup
migrations are serialized with a PostgreSQL advisory lock, so concurrent replicas
wait for the in-flight migration instead of racing on the schema.

The runtime contract is `.env.example`: `DATABASE_URL`, `AUTH_SECRET` (>= 32
characters), `NODE_ENV=production`, `TRUSTED_ORIGINS`, and `SERVICE_PORT`. The
process runs as a non-root user and exposes `/health`.

Nix is canonical. The Dockerfile is a fallback that produces the same start,
migration, health, non-root, and environment behavior.

## Build with Nix

```sh
nix build .#app        # compiled server, migrator, migrations, entrypoint
nix build .#ociImage   # OCI image tarball (dockerTools.buildLayeredImage)
```

Load and run the image:

```sh
docker load -i $(nix path-info .#ociImage)
docker run --rm -p 3001:3001 \
  -e DATABASE_URL=postgres://... \
  -e AUTH_SECRET=... beet-stack:latest
```

`nix flake check` builds the package, the OCI image, and evaluates the NixOS
module. The app derivation is a fixed-output build that pins dependencies from
`bun.lock`; `flake.nix` and `flake.lock` are excluded from that source so the
hash is a stable fixed point.

## Docker fallback

```sh
docker build -t beet-stack:latest .
```

The multi-stage `Dockerfile` compiles the same server and migrator from
`oven/bun:1.3.13`, runs as the non-root `bun` user, and declares the same
`/health` healthcheck and `SERVICE_PORT` exposure as the Nix image.

## Local and VPS with Compose

`docker-compose.yml` runs the app and PostgreSQL with a persistent database
volume, a Postgres readiness health check the app waits on, and `restart:
unless-stopped`. Secrets are placeholder-only environment variables you must set:

```sh
export POSTGRES_PASSWORD=$(openssl rand -base64 24)
export AUTH_SECRET=$(openssl rand -base64 32)
docker compose up -d --build
```

## NixOS module

`nixos/beet-stack.nix` runs the API as a hardened, dynamically-usered systemd
service backed by the Nix package. Optional `enableCaddy` terminates TLS at the
host and `enableBackup` schedules `pg_dump` dumps:

```nix
{
  beet-stack = {
    enable = true;
    environmentFile = "/run/secrets/beet-stack.env";  # DATABASE_URL, AUTH_SECRET, ...
    port = 3001;
    domain = "beet.example";
    enableCaddy = true;
    enableBackup = true;
  };
}
```

## AWS ECS/Fargate

`deploy/aws/main.tf` is a small OpenTofu example (not applied here) wiring an
ECR-backed Fargate task behind an ALB with a `/health` target-group health check,
target-tracking CPU autoscaling, Secrets Manager injection of `DATABASE_URL` and
`AUTH_SECRET`, and an external RDS PostgreSQL connection. Set the image, secret
ARNs, and VPC/subnet variables; the example creates no RDS or VPC.

## Optional OpenTelemetry observability

Telemetry is opt-in and adds no application dependencies. Elysia's official
OpenTelemetry plugin can export OTLP traces from the API process; configure the
collector endpoint with standard `OTEL_EXPORTER_OTLP_ENDPOINT` variables when you
enable it.

Collector choice depends on the backend:

- **Self-hosted or Grafana Cloud:** run Grafana Alloy as the OTLP collector
  (sidecar or host agent) and forward to your traces/logs backend.
- **AWS ECS/Fargate:** run the AWS Distributions of OpenTelemetry (ADOT) sidecar
  as the OTLP collector and forward to X-Ray or a managed backend.

This starter does not install Grafana, Prometheus, Loki, Tempo, Kubernetes,
Helm, or any application telemetry dependency. Bring your own collector and
backend; point the API's OTLP exporter at it.
