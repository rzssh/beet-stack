# TanStack Start + Elysia + Better Auth

Full-stack monorepo with shared packages.

## Structure

```
apps/
├── expo/                    # React Native mobile app
│   └── src/
│       ├── app/             # Expo Router screens
│       └── utils/           # Auth client, API, base URL
├── server/                  # Standalone Elysia microservice
│   └── src/
│       ├── app.ts           # Elysia app with routes
│       └── lib/auth.ts      # Auth instance
└── web/                     # TanStack Start web app
    └── src/
        ├── routes/          # File-based routing
        ├── server/          # API routes, services
        ├── lib/             # Client utilities, queries
        └── components/      # React components

packages/
├── core/                    # Shared server code
│   └── src/
│       ├── auth.ts          # Better Auth configuration
│       ├── env.ts           # Environment validation
│       └── server/          # Elysia middleware, routers
├── db/                      # Database layer
│   └── src/
│       ├── client.ts        # Drizzle client
│       ├── schema.ts        # Business schemas
│       └── auth-schema.ts   # Auth tables
└── ui/                      # Shared UI (React Native)

tooling/                     # ESLint, TypeScript, Biome configs
```

## Setup

```bash
bun install
cp .env.example .env  # Configure DATABASE_URL, AUTH_SECRET
bun db:push
bun dev
```

## Commands

```bash
bun dev                         # All apps
bun --filter=@acme/web dev      # Web only
bun --filter=@acme/server dev   # Server only
bun --filter=@acme/expo dev     # Expo only

bun db:push                     # Apply schema
bun db:generate                 # Create migration
bun db:studio                   # Drizzle Studio

bun typecheck                   # Type check all
bun lint                        # Lint all
bun build                       # Build all
```

## Auth (Local Development)

Web and Expo use separate servers but share the same database:

```bash
# .env
APP_URL="http://localhost:3000"
MICROSERVICE_URL="http://192.168.0.4:3001"  # Your local IP

# apps/expo/.env
EXPO_PUBLIC_APP_URL="http://192.168.0.4:3001"
```

Register `http://<local-ip>:3001/api/auth/callback/<provider>` in OAuth app.

## Tech Stack

- **Runtime**: Bun
- **Web**: TanStack Start, TanStack Query, Tailwind v4, shadcn/ui
- **API**: Elysia.js, Eden Treaty
- **Mobile**: Expo, React Native, NativeWind
- **Database**: PostgreSQL, Drizzle ORM
- **Auth**: Better Auth
