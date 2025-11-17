# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready full-stack monorepo built with bleeding-edge tech for maximum performance and developer experience. Built with Bun workspaces, TanStack Start frontend, and Elysia.js backend.

### Tech Stack

- **Frontend**: TanStack Start (React Router + SSR), TanStack Query, Jotai (state), shadcn/ui, PostHog analytics
- **Backend**: Elysia.js with Better Auth, Swagger docs
- **Database**: Drizzle ORM with PostgreSQL (local via Docker or Neon cloud)
- **Payments**: Stripe integration
- **Email**: Resend integration
- **Storage**: AWS S3 integration
- **Analytics**: PostHog
- **Runtime**: Bun
- **Styling**: Tailwind CSS

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
├── backend/          # Elysia.js API server
└── web/              # TanStack Start frontend
packages/
├── backend-client/   # Type-safe API client (Eden Treaty)
├── db/              # Drizzle ORM schemas and migrations
├── email/           # Resend email integration
├── payments/        # Stripe payments integration
└── storage/         # S3 storage integration
tooling/             # Shared configs (ESLint, Prettier, TypeScript, Tailwind)
```

### Feature Organization

Simple, flat feature structure focused on productivity:

```
features/
└── feature-name/
    ├── components.tsx   # All React components for this feature
    ├── routes.ts       # API routes (backend)
    ├── service.ts      # Business logic
    ├── db.ts           # Database operations
    ├── models.ts       # Type definitions/validation
    └── controller.ts   # Frontend state management
```

## Key Patterns

### Backend (Elysia)

- Simple file structure: `models.ts`, `db.ts`, `service.ts`, `routes.ts`
- Elysia instances as routers with method chaining
- Group routes with prefixes and include Swagger `detail` property
- Class-based services with arrow function methods
- Direct database operations (no repository pattern overhead)

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

## Production Features

### Email (Resend)
- Template-based email system
- Welcome emails, password reset, notifications
- Located in `packages/email`

### Payments (Stripe)
- Payment intents for one-time payments
- Subscription management
- Customer management
- Billing portal integration
- Webhook handling
- Located in `packages/payments`

### Storage (AWS S3)
- File uploads with presigned URLs
- Direct uploads from client
- File validation and processing
- Located in `packages/storage`

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