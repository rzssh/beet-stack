# BEET Stack

BEET is **B**un, **E**lysia, **E**xpo, and **T**anStack Start, with Better Auth, Drizzle, and PostgreSQL. The repository is a minimal starter: a user creates an email/password account, keeps a session, and creates, reads, updates, and deletes only their own messages.

## Architecture

One Elysia app in `packages/core/src/server` defines the full API contract. Clients consume it through Eden, so routes, validation, and response types stay in sync everywhere.

- **Web** (TanStack Start) mounts the Elysia app in-process under `/api`. Server-side rendering calls `treaty(app)` directly — no second HTTP hop. The browser makes one HTTP request per operation to `/api`.
- **Expo** talks to the standalone Elysia server (`apps/server`, port 3001) over HTTP, one request per operation.

```text
TanStack Start web ── /api (in-process) ─┐
                                         ├── shared Elysia routes ── Drizzle ── PostgreSQL
Expo native ── port 3001 (HTTP) ─────────┘
                          │
                          └── Better Auth sessions; Expo bridges the cookie via SecureStore
```

### Project layout

- `packages/core/src/contracts` — the shared Zod message contract and API error type, reused by Elysia (Standard Schema), the web forms (`zodResolver`), and both clients' domain operations. Client-safe.
- `packages/core/src/server` — Elysia routes, services, ownership-scoped queries, and auth/request-logging middleware. Server-only (`./server`, `./auth`, `./env`).
- `packages/core/src/auth.ts` — Better Auth configuration.
- `packages/db` — Drizzle schema for Better Auth tables and messages, plus migrations.
- `apps/web` — TanStack Start web app and the `/api` mount.
- `apps/server` — standalone Elysia server for Expo.
- `apps/expo` — Expo client.

### Sessions

Web sessions are Better Auth HTTP cookies issued and checked inside the `/api` mount. Expo has no browser cookie jar, so `@better-auth/expo` plus `expo-secure-store` bridge the session: the native client stores the token in SecureStore and sends it as a cookie to the standalone API. Both clients share the same Elysia routes and the same Better Auth session check.

### Security

- Every message route requires a Better Auth session; missing or expired sessions return `401`.
- List, detail, update, and delete include the authenticated user ID in the PostgreSQL predicate, so queries can only touch rows the user owns.
- Cross-user lookups return `404`, never `403`, so message existence is not disclosed.
- Request payloads are validated at the trust boundary through the shared Zod contract before the service layer runs.
- Environment variables are parsed with `@t3-oss/env-core`; invalid values fail at startup.
- The PostgreSQL integration test refuses any database host other than loopback.
- CORS trusts only the exact origins in `TRUSTED_ORIGINS`; never a production wildcard.
- `AUTH_SECRET` must be at least 32 characters. Example values in this repository are local-only.

## Prerequisites

- Bun 1.3.13 (see `packageManager`)
- PostgreSQL 15+
- Node 22.14 for Expo tooling (see `.nvmrc`)

On NixOS, enable `nix-ld` and run `direnv allow`. The flake pins the toolchain and keeps React Native DevTools libraries inside the project.

## Setup

```sh
bun install --frozen-lockfile
cp .env.example .env
# Replace AUTH_SECRET with: openssl rand -base64 32
bun run db:migrate
```

Web and standalone API:

```sh
bun run dev:web
```

- Web: http://localhost:3000
- Standalone health check: http://localhost:3001/health

Expo (second terminal):

```sh
bun run --filter=@beet/expo dev
```

Expo usually derives the API host from the dev server. If not, set `EXPO_PUBLIC_API_URL` to a LAN URL reachable from the device (e.g. `http://192.168.1.10:3001`) and, where browser CORS applies, add that origin to `TRUSTED_ORIGINS`.

## Checks

```sh
bun run test        # in-memory contract tests: session, ownership, validation
bun run check       # vite dedupe, typecheck, biome
bun run build       # all workspaces
```

PostgreSQL integration is opt-in and rejects non-loopback hosts before importing the database client:

```sh
RUN_POSTGRES_INTEGRATION=1 \
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/messages \
AUTH_SECRET=local-integration-secret-with-at-least-32-characters \
bun run test:integration
```

Disposable local PostgreSQL:

```sh
docker run --rm --name beet-messages-postgres \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=messages \
  -p 127.0.0.1:5432:5432 postgres:17
```

## Deployment

`apps/server` compiles to a single Bun binary (`bun run --filter=@beet/server build`) that runs migrations on start (`start` script) and serves the API and `/health`. Web is served from its built output (`apps/web/server.ts`). The runtime contract is the environment in `.env.example`, the health check is `/health`, and the process runs as the invoking user. The Nix flake pins the toolchain; container, Compose, ECS, and CI artifacts for reproducible production images live alongside the flake.

## Limitations

- No TLS, password reset, email verification, social login, rate limiting, payments, analytics, or cloud integrations. Better Auth email/password uses an email-shaped identifier; no outbound email is sent.
- Expo device/simulator behavior cannot be proven by TypeScript or Metro. Run the mobile checklist on each target platform.
- `401` means the session cookie is absent or expired; sign in again and confirm `AUTH_SECRET` did not change.
- Expo network errors usually mean the device cannot reach port 3001; check LAN/firewall and `EXPO_PUBLIC_API_URL`.
- CORS errors require the exact origin in `TRUSTED_ORIGINS`.
- Database errors usually mean PostgreSQL is unavailable, `DATABASE_URL` is wrong, or migrations were not run.

## Release checklist

Automated:

- [ ] `bun install --frozen-lockfile`
- [ ] `bun run test`
- [ ] guarded PostgreSQL integration command above
- [ ] `bun run check`
- [ ] `bun run build`

Web smoke:

- [ ] Create account, refresh, confirm session persists.
- [ ] Create, open, edit, and delete a message.
- [ ] Sign out and confirm `/messages` redirects to sign-in.
- [ ] A second account cannot see the first account's messages.

Mobile smoke (real target platform):

- [ ] Sign up and sign in; relaunch and confirm SecureStore restores the session.
- [ ] Create, read, edit, and delete a message.
- [ ] Sign out and confirm message data disappears.
- [ ] Repeat per iOS/Android target; record platform and OS version.

Local verification only — does not authorize a release, push, deploy, or cloud change.
