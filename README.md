# BEET Stack

BEET stands for Bun, Elysia, Expo, and TanStack Start. Better Auth, Drizzle, and PostgreSQL are the explicitly named supporting layers for auth, schema, and storage. The repository does one thing: users create an email/password account, keep a session, and create, read, update, and delete only their own messages.

## Architecture

One Elysia app defines the full API contract in `packages/core/src/server/routers/`, exposed through Eden so clients get the routes, validation, and response types for free. TanStack Start web mounts that contract under `/api`; a standalone Elysia server mounts the same app on port 3001 for Expo. Web and native therefore consume the exact same API surface.

```text
TanStack Start web ── /api ─┐
                             ├── shared Elysia routes ── Drizzle ── PostgreSQL
Expo native ── port 3001 ───┘
                    │
                    └── Better Auth + SecureStore cookie bridge
```

- `packages/core/src/auth.ts` owns Better Auth configuration.
- `packages/core/src/server/routers/messages/` owns API validation, service behavior, and ownership-scoped queries.
- `packages/db/` owns Better Auth tables, message table, and migrations.
- `apps/web/src/routes/api/$.ts` mounts the shared API under TanStack Start's `/api` route.
- `apps/server/src/app.ts` mounts the same API for Expo.
- `apps/expo/src/utils/api.tsx` derives the mobile client from the standalone Elysia app type.

### Web and native boundaries

Web sessions are Better Auth HTTP cookies, issued and checked inside the `/api` mount. Native Expo does not inherit a browser cookie jar, so `@better-auth/expo` plus `expo-secure-store` bridge the session: the native client keeps the session token in SecureStore and sends it with every request to the standalone API. Both mounts share the same Elysia routes and the same Better Auth session check, which keeps route behavior aligned across clients.

### Security decisions

- Every message route requires a Better Auth session; a missing or expired session returns `401`.
- List, detail, update, and delete include the authenticated user ID in the PostgreSQL predicate, so queries can only touch rows the user owns.
- Cross-user lookups return `404` rather than `403`, so message existence is never disclosed to another account.
- Request payloads are validated at the trust boundary: route schemas reject blank and malformed input before the service layer runs.
- Environment variables are parsed with `@t3-oss/env-core`; missing or invalid values fail at startup instead of silently degrading.
- The PostgreSQL integration guard refuses any database host other than loopback before importing the database client.
- CORS trusts only the exact origins in `TRUSTED_ORIGINS` — localhost web and API, plus the `beet-stack://` app scheme — and never a production wildcard.
- `AUTH_SECRET` must be at least 32 characters. Example values in this repository are local-only and contain no usable secret.

## Prerequisites

- Bun 1.3.13, matching `packageManager` in `package.json`
- PostgreSQL 15 or newer
- Node 22.14 when running Expo tooling, matching `.nvmrc`
- Expo Go or a local Android/iOS development build for device checks

No cloud account is required. Example values are local-only and contain no usable secret.

On NixOS, enable `nix-ld` and run `direnv allow` once. The optional flake pins the toolchain and keeps React Native DevTools libraries inside this project.

## Setup

```sh
bun install --frozen-lockfile
cp .env.example .env
# Replace AUTH_SECRET with: openssl rand -base64 32
bun run db:migrate
```

Start web and standalone API:

```sh
bun run dev:web
```

- Web: `http://localhost:3000`
- Standalone health check: `http://localhost:3001/health`

Start Expo in a second terminal:

```sh
bun run --filter=@acme/expo dev
```

Expo normally derives the API host from the development server. If that fails, set `EXPO_PUBLIC_API_URL` to a LAN URL reachable from the device, such as `http://192.168.1.10:3001`, and include the corresponding origin in `TRUSTED_ORIGINS` when browser CORS applies.

## Verified commands

```sh
bun run test
bun run typecheck
bun run check
bun run build
```

`bun run test` runs in-memory contract tests for session-required access, owner CRUD, blank-input rejection, empty cross-user lists, and cross-user read/update/delete denial.

PostgreSQL integration is opt-in and rejects non-loopback database hosts before importing the database client. It migrates the local database, exercises Better Auth sign-up/sign-out/sign-in/session plus owner CRUD and cross-user denial, then removes its generated users through cascade deletes.

```sh
RUN_POSTGRES_INTEGRATION=1 \
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/messages \
AUTH_SECRET=local-integration-secret-with-at-least-32-characters \
bun run test:integration
```

A disposable local PostgreSQL option:

```sh
docker run --rm --name beet-messages-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=messages \
  -p 127.0.0.1:5432:5432 postgres:17
```

## Dependency policy

Small coherent upgrades were applied and locked in `bun.lock`:

- Better Auth 1.6.26 and `@better-auth/expo` 1.6.26
- Elysia 1.4.29, Eden 1.4.9, and CORS 1.4.2
- TanStack Start 1.168.42, Router 1.170.25, and Query 5.101.4
- Drizzle ORM 0.45.2, Drizzle Kit 0.31.10, and postgres.js 3.4.9
- Expo SDK 55.0.28, React Native 0.83.10, and React 19.2.0
- Vite 7.3.6 and TypeScript 5.9.3

Official sources used:

- TanStack Start setup: <https://tanstack.com/start/latest/docs/framework/react/build-from-scratch>
- Elysia Eden contract: <https://elysiajs.com/eden/overview>
- Better Auth Expo integration: <https://better-auth.com/docs/integrations/expo>
- Expo SDK compatibility table: <https://docs.expo.dev/versions/latest/>
- Expo monorepo and isolated-install support: <https://docs.expo.dev/guides/monorepos/>
- Drizzle PostgreSQL setup and migrations: <https://orm.drizzle.team/docs/get-started/postgresql-new>

Deliberate compatibility ceilings:

- Expo stays on stable SDK 55 because Better Auth's current Expo guide explicitly targets SDK 55. SDK 57 is newer, but moving two native SDK generations without iOS/Android builds would be dishonest.
- React is exact `19.2.0`, matching Expo SDK 55's supported React line.
- TypeScript is exact `5.9.3`; Expo SDK 55's config loader fails under TypeScript 7 (`Cannot read properties of undefined (reading 'CommonJS')`).
- Vite stays on major 7. Vite 8 is unrelated to this slice and requires a separate compatibility pass through TanStack Start and its React plugin.

## Removed integrations

Repository no longer claims or configures email delivery, social OAuth, Stripe, billing, S3 storage, PostHog, Sentry, OpenTelemetry, rate limiting, WebSockets, fake analytics, fake profile controls, Railway, Docker deployment images, EAS deployment, or cloud release workflows. Better Auth email/password means credentials use an email-shaped account identifier; no verification or outbound email is sent.

## Limitations and troubleshooting

- Production hosting, TLS, password reset, email verification, social login, and rate limiting are intentionally out of scope.
- Expo device/simulator behavior cannot be proven by TypeScript or Metro export. Complete the mobile checklist below on each target platform.
- `expo-doctor` currently reports duplicate native module installations under Bun's isolated workspace layout. `bun pm why react-native` resolves one locked version and Android Metro export succeeds, but a native device build remains required.
- `401` means the session cookie is absent or expired. Sign in again and verify `AUTH_SECRET` did not change between requests.
- Expo network errors usually mean the phone cannot reach port `3001`. Check LAN routing/firewall and set `EXPO_PUBLIC_API_URL`.
- CORS errors require the exact web or app origin in `TRUSTED_ORIGINS`; never use a production wildcard.
- Database errors usually mean PostgreSQL is unavailable, `DATABASE_URL` points at the wrong database, or `bun run db:migrate` was not run.

## Local release checklist

Automated:

- [ ] `bun install --frozen-lockfile`
- [ ] `bun run test`
- [ ] guarded PostgreSQL integration command above
- [ ] `bun run check`
- [ ] `bun run build`

Web smoke check:

- [ ] Create account, refresh, and confirm session persists.
- [ ] Create, open, edit, and delete a message.
- [ ] Sign out and confirm `/messages` redirects to sign-in.
- [ ] Use a second account and confirm the first account's messages never appear.

Mobile smoke check on real target platform:

- [ ] Sign up and sign in through Expo; relaunch and confirm SecureStore restores the session.
- [ ] Create, read, edit, and delete a message.
- [ ] Sign out and confirm message data disappears.
- [ ] Repeat on each intended iOS and Android target; record platform and OS version.

Checklist is local verification only. It does not authorize a release, push, deploy, account change, DNS change, or cloud resource mutation.
