# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready full-stack monorepo built with bleeding-edge tech for maximum performance and developer experience. Built with Bun workspaces, TanStack Start frontend, and Elysia.js backend.

### Tech Stack

- **Frontend**: TanStack Start (React Router + SSR), TanStack Query, Jotai (state), shadcn/ui, PostHog analytics
- **Mobile**: React Native + Expo with shared API types via Eden Treaty
- **Backend**: Elysia.js with Better Auth, Swagger docs
- **Database**: Drizzle ORM with PostgreSQL (local via Docker or Neon cloud)
- **API Client**: Eden Treaty for end-to-end type safety across web and mobile
- **Payments**: Stripe integration
- **Email**: Resend integration
- **Storage**: AWS S3 integration
- **Analytics**: PostHog
- **Runtime**: Bun
- **Styling**: Tailwind CSS with shared config across web and mobile (NativeWind)

## Common Commands

### Development

```bash
# Start all apps in dev mode
bun dev

# Install dependencies
bun install

# Run specific app
bun --filter=backend dev
bun --filter=web dev
```

### Code Quality

```bash
# Type check all packages
bun typecheck

# Lint all packages
bun lint
bun lint:fix

# Format all packages
bun format
bun format:fix

# Check workspace dependencies
bun lint:ws
```

### Database Operations

```bash
# Generate migrations
bun db:generate

# Push schema to database
bun db:push

# Seed database
bun db:seed

# Open Drizzle Studio
bun db:studio
```

### Build & Clean

```bash
# Build all packages
bun build

# Clean all node_modules and build artifacts
bun clean
```

## Architecture

### Monorepo Structure

```
apps/
├── expo/            # React Native + Expo mobile app
├── server/          # Elysia.js API server  
└── web/             # TanStack Start frontend
packages/
├── api/             # Eden Treaty API client with shared types
├── auth/            # Better Auth configuration (server + client)
├── db/              # Drizzle ORM schemas and migrations
├── tailwind-config/ # Shared Tailwind CSS theme and configuration
├── tsconfig/        # TypeScript configurations
└── validators/      # Zod schemas for shared validation
```

### Feature Organization

Simple, flat feature structure focused on productivity:

Backend modules live under `apps/backend/src/modules/*` with `repository → service → routes` layering. Frontend keeps feature-driven folders under `apps/web/src/features/*`.

## Key Patterns

### Backend (Elysia)

- Modules follow `repository → service → routes`
- `@acme/platform` supplies env, auth, billing, storage, email, logger
- Each route file owns its own `.model` definitions (via `t.Object`)
- Use `.guard({ auth: true })` with the Better Auth macro instead of ad-hoc checks
- Log via the shared request context + `logger.child({ requestId })`

### Frontend (TanStack Start)

- Class-based controllers with Jotai atoms for state
- All hooks return objects (even single values): `return { isPending }`
- Component composition following shadcn/ui patterns
- Multiple components per file is acceptable for productivity

### Authentication

- Better Auth integration on both frontend and backend
- Session management with type-safe exports
- Authentication middleware in backend

### Database

- Drizzle ORM with PostgreSQL (local Docker or Neon cloud)
- Direct database operations for simplicity
- Migrations managed via Drizzle Kit

### Expo + Elysia Integration

**Hybrid Integration Pattern**:
1. **Standalone Server** (Primary): Expo app connects to separate Elysia server on port 3001
2. **Embedded API Routes** (Fallback): Expo API routes at `src/app/api/[...slugs]+api.ts` for offline development

**Key Features**:
- Auto-detection of development host IP for Expo Go
- Cross-platform authentication with Better Auth + Expo plugin
- Shared type safety via Eden Treaty
- CORS configured for Expo schemes (`expo://`, `exp://`) and local network IPs
- NativeWind for cross-platform Tailwind CSS styling

**Configuration**:
- Development: Auto-detects host IP from Expo's `hostUri` 
- Production: Uses `EXPO_PUBLIC_API_URL` environment variable
- Authentication: Uses `@better-auth/expo` client plugin with secure storage

## Production Features

- All production integrations live inside `packages/platform`:
  - **Email (Resend)** – templates + helper senders
  - **Payments (Stripe)** – products, subscriptions, billing portal helpers
  - **Storage (AWS S3)** – presigned uploads/downloads, key utilities
  - **Security** – Sentry + rate limiting + hardened headers
  - **Auth** – Better Auth server wired to Drizzle

### Analytics (PostHog)
- Event tracking
- User identification
- Pageview tracking
- Custom events for business metrics
- Located in `apps/web/src/lib/analytics.ts`

### Database Options

#### Local PostgreSQL (Default)
```bash
docker compose up -d
DATABASE_URL="postgres://postgres:postgres@localhost:5555/naara"
```

#### Neon Cloud Database
```bash
DATABASE_URL="postgres://username:password@host/database?sslmode=require"
```
See `docs/NEON_SETUP.md` for detailed setup instructions.

## Development Guidelines

### Code Style

- **Simplicity over architecture**: Prefer simple, direct solutions
- **Fewer files**: Combine related functionality rather than splitting into many files
- **No underscore folders**: Use simple folder names
- **kebab-case** for all files and directories
- **Direct imports**: Avoid barrel files
- **Short, descriptive names**: Avoid overly descriptive file names

## Critical Coding Standards

### Type Safety Standards

**NEVER use `any` type to solve TypeScript errors:**
```typescript
// ❌ NEVER do this
export function createApiClient(): any {
  return edenTreaty<any>(baseUrl);
}

// ✅ Correct - proper type inference or explicit types
export function createApiClient<T = App>(): EdenTreaty<T> {
  return edenTreaty<T>(baseUrl);
}
```

**Always maintain type safety:**
- Fix the root cause of type errors, don't mask them
- Use proper type inference and generic constraints
- Prefer `unknown` over `any` if you must use a top type
- Use type guards and proper narrowing

### Import Standards

**ALWAYS use absolute imports with `~` prefix:**
```typescript
// ✅ Correct
import { logger } from "~/core/logger";
import { AppError } from "~/core/errors";

// ❌ Wrong - relative imports
import { logger } from "../core/logger";
import { AppError } from "./errors";
```

**Frontend specific:**
```typescript
// ✅ Correct
import { Button } from "~/components/ui/button";
import { authClientRepo } from "~/lib/better-auth/auth-client-repo";

// ❌ Wrong
import { Button } from "src/components/ui/button";
import { authClientRepo } from "../lib/better-auth/auth-client-repo";
```

### Nullish Coalescing Standards

**ALWAYS use nullish coalescing (??) instead of logical OR (||):**
```typescript
// ✅ Correct - nullish coalescing
const value = config.timeout ?? DEFAULT_TIMEOUT;
const requestId = headers.get('x-request-id') ?? crypto.randomUUID();
const user = session?.user ?? null;

// ❌ Wrong - logical OR (treats 0, false, "" as nullish)
const value = config.timeout || DEFAULT_TIMEOUT;
const requestId = headers.get('x-request-id') || crypto.randomUUID();
const user = session?.user || null;
```

**When logical OR is appropriate (rare cases):**
```typescript
// ✅ OK - when you explicitly want falsy fallback
const shouldShow = userPreference || defaultPreference;
```

### Logging Standards (Backend Only)

**ALWAYS use logger from `~/core/logger`:**
```typescript
// ✅ Correct
import { logger } from "~/core/logger";

logger.info("User created", { userId, email });
logger.error({ error, requestId }, "Failed to process request");

// ❌ Wrong - console.log or console.error
console.log("User created");
console.error(error);
```

### Error Handling Standards (Backend)

**Use structured error classes:**
```typescript
// ✅ Correct
import { NotFoundError, ValidationError } from "~/core/errors";

throw new NotFoundError("Message", { messageId: id });
throw new ValidationError("Invalid email format", { email });

// ❌ Wrong - generic Error
throw new Error("Message not found");
throw new Error("Validation failed");
```

### Type Safety Standards

**Prefer type guards and proper narrowing:**
```typescript
// ✅ Correct - proper type checking
if (typeof error === 'object' && error && 'message' in error) {
  return error.message;
}

// ❌ Wrong - unsafe casting
return (error as Error).message;
```

**Use optional chaining extensively:**
```typescript
// ✅ Correct
const userName = user?.profile?.name ?? "Anonymous";
const count = data?.results?.length ?? 0;

// ❌ Wrong
const userName = user && user.profile ? user.profile.name : "Anonymous";
```

### File Organization

- Keep related code together
- Prefer fewer, larger files over many small files
- Use simple, clear naming conventions
- Multiple components per file is acceptable

### Performance

- Leverage Bun's performance for fast development
- Use TanStack Query for caching and state management
- PostHog for performance monitoring
- Tailwind for optimal CSS

## Environment Variables

All environment variables are in the root `.env` file:

```bash
# Database
DATABASE_URL="postgres://postgres:postgres@localhost:5555/naara"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"

# Email
RESEND_API_KEY="your_resend_api_key"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Payments
STRIPE_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_secret"

# Storage
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket"
```

## Production Deployment

This stack is optimized for:
- **Vercel** (frontend) + **Railway/Fly.io** (backend)
- **Neon** (database)
- **AWS S3** (storage)
- **Resend** (email)
- **Stripe** (payments)
- **PostHog** (analytics)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
