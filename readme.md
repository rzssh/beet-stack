# TanStack Start × Elysia × Better Auth — SaaS Boilerplate

Ship the next million‑dollar SaaS with a batteries‑included Bun monorepo that proves how auth, billing, messaging, storage, analytics, and observability should be wired together.

## 🔌 Apps & Packages

```
apps/
├── backend/      # Elysia API (Better Auth + Swagger + Stripe + S3)
└── web/          # TanStack Start front-end with shadcn/ui
packages/
├── db/           # Drizzle schema, migrations, helpers
├── platform/     # Shared platform layer: env, logger, auth, billing, email, storage, api client
└── tooling/*     # ESLint, Prettier, Tailwind, TS configs
```

### Platform Layer Highlights
`@acme/platform` centralises everything the apps share:
- `config/env` – typed Zod parsing + defaults
- `database` – re-exports Drizzle client & schema
- `integrations/auth-server` – Better Auth w/ openAPI plugin
- `integrations/payments` – Stripe helpers
- `integrations/storage` – S3 presigned uploads
- `integrations/email` – Resend templates
- `integrations/security` – Sentry, CORS, rate limiting, hardened headers
- `clients/backend` – Eden Treaty helper for the frontend

## 🚀 Getting Started

```sh
bun install
bun dev        # runs api + web via Bun workspaces
```

Useful scripts:
```sh
bun lint             # lint every workspace
bun typecheck        # type-check everything
bun format           # prettier --check
bun db:push          # drizzle-kit push
bun db:seed          # seed data
```

## 🔐 Environment

Create `.env` at repo root:

```
DATABASE_URL="postgres://..."
ROOT_DIR=$(pwd)
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional)
RESEND_API_KEY=

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# AWS S3 (optional)
AWS_S3_BUCKET=
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Observability (optional)
SENTRY_DSN=
```

Every module is defensive: if Stripe/S3/Resend aren’t configured the API responds with a helpful `503` so the UI can surface the next step.

## 🧱 Backend Modules

| Route | Purpose |
| --- | --- |
| `GET /health`, `/ready` | uptime & readiness probes |
| `GET /me` | current Better Auth session |
| `GET/POST /messages`, `/:id` | Drizzle‑powered CRUD scoped per user |
| `GET /count`, `POST /count/increment` | persistent metrics example (Bun file store) |
| `GET /pokemon/pair/results`, `POST /pokemon/vote` | fun Eden Treaty demo |
| `GET /billing/products`, `POST /billing/subscriptions`, `/portal` | Stripe integration |
| `POST /files/presign` | S3 presigned upload helper |

Middleware stack: CORS, OpenTelemetry, Swagger docs, Sentry, security headers, rate limiting, Better Auth session guard, request context + structured logs.

## 💻 Frontend UX

The dashboard route demonstrates how the stack fits together:
- **Account summary** powered by Better Auth session
- **Product heartbeat card** hitting the `/count` API
- **Billing card** fetching Stripe products and portal links
- **Storage card** issuing presigned upload URLs
- **Team notes** board with query-powered CRUD + toasts
- **PostHog analytics** wrapper ready to fire events

Everything uses TanStack Query loaders + Eden Treaty client so data is cached, typed, and streaming-friendly.

## ✅ Feature Checklist

- 🔐 Better Auth sessions (email/password + GitHub social ready)
- 🧱 Platform layer exporting env, auth, billing, storage, email
- 🧾 Swagger docs + Eden Treaty types end-to-end
- 📊 Stripe billing + portal helpers
- 🗂️ S3 presigned uploads using AWS SDK v3
- 💬 Messages CRUD + ownership checks
- 🧠 Request context & structured logger
- 🪵 Rate limiting + hardened headers + Sentry integration
- 🧮 Bun-native counter persistence example
- 🎯 TanStack Start dashboard showcasing real flows

## 🛣️ Next Steps

- Point `DATABASE_URL` at Postgres/Turso/Neon
- Wire Better Auth webhooks for Stripe customer mapping
- Swap the Bun counter for Redis or Drizzle table for horizontal scale
- Hook up your preferred analytics vendor via `lib/analytics.ts`

## 🙏 Credits

Inspired by [Indra Zulfi Mushoddaq](https://lnkd.in/gGW-XZNQ), the Elysia/TanStack/Better Auth teams, and everyone pushing Bun forward. Take it, remix it, and build the next unicorn. PRs welcome! 🚀
