# TanStack Start + Elysia + Better Auth Template

A full-stack monorepo template showcasing the power of modern web development with end-to-end type safety, blazing performance, and seamless authentication.

## 🚀 Motivation

This project was inspired by [Indra Zulfi Mushoddaq's post](https://lnkd.in/gGW-XZNQ) about the incredible developer experience of Elysia + Eden + Better Auth combination. After trying it out, I can confirm that this stack is absolutely **GOAT** (Greatest Of All Time):

✅ **Auto-generated docs** - No more manual API documentation headaches  
✅ **E2E Type Safety** - Thanks to Eden Client + Better Auth Client  
✅ **Performance fast AF** - Even faster than server functions from Remix, Next.js, or TanStack Start  
✅ **Auth setup made easy** - From Social Sign-In to email+password (Indonesian favorite +62)  

The SSR works smoothly and is surprisingly easier to configure than Remix and Start.

## 🏗️ What's inside?

This monorepo includes the following packages/apps:

### Apps and Packages

- **`backend`**: [Elysia.js](https://elysiajs.com/) API server with Better Auth
- **`web`**: [TanStack Start](https://tanstack.com/start) frontend with SSR
- **`packages/db`**: Drizzle ORM with SQLite/Turso database
- **`packages/backend-client`**: Type-safe API client using Eden Treaty
- **`tooling/*`**: Shared configurations (ESLint, Prettier, TypeScript, Tailwind)

### Tech Stack

- **Frontend**: TanStack Start, TanStack Query, Jotai, shadcn/ui
- **Backend**: Elysia.js, Better Auth, Swagger docs
- **Database**: Drizzle ORM, SQLite/Turso
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **Type Safety**: End-to-end with Eden Treaty

### Getting Started

To install and start developing all apps, run the following command:

```sh
bun install
bun dev
```

### Development Scripts

```sh
# Type check all packages
bun typecheck

# Format all packages
bun format
bun format:fix

# Lint all packages
bun lint
bun lint:fix

# Database operations
bun db:generate    # Generate migrations
bun db:push       # Push schema to database
bun db:seed       # Seed database with sample data
bun db:studio     # Open Drizzle Studio

# Build and clean
bun build         # Build all packages
bun clean         # Clean all artifacts
```

## 🏛️ Architecture

This template follows clean architecture principles with feature-based organization:

### Monorepo Structure
```
apps/
├── backend/          # Elysia.js API server
└── web/              # TanStack Start frontend
packages/
├── backend-client/   # Type-safe API client (Eden Treaty)
└── db/              # Drizzle ORM schemas and migrations
tooling/             # Shared configs (ESLint, Prettier, TypeScript, Tailwind)
```

### Key Features Implemented

- **🔐 Authentication**: Complete flow with Better Auth (email/password + social)
- **📊 Count Demo**: File-based persistence example
- **💬 Messages**: Full CRUD operations with database
- **🎮 Pokemon**: External API integration with caching
- **📚 Auto Docs**: Swagger documentation generation
- **🔄 SSR**: Server-side rendering with TanStack Start

## 🌟 What Makes This Stack Special

1. **End-to-End Type Safety**: From database to frontend, everything is typed
2. **Performance**: Bun runtime + Elysia performance + TanStack optimizations
3. **Developer Experience**: Hot reload, auto-completion, built-in docs
4. **Modern Patterns**: Clean architecture, repository pattern, feature organization
5. **Production Ready**: Auth, database, error handling, and deployment ready

## 🤝 Contributing

This is a demonstration template, but feel free to:
- Open issues for bugs or suggestions
- Submit PRs for improvements
- Use this as a starting point for your projects

## 🙏 Acknowledgments

- Thanks to [Indra Zulfi Mushoddaq](https://lnkd.in/gGW-XZNQ) for the inspiration
- The amazing teams behind Elysia, TanStack, and Better Auth
- The TypeScript and Bun communities

---

*Sorry for messy code 🙃, but if you have suggestions, feel free to share!*

*Want to discuss minimal features or UI improvements? Drop a comment in the discussions!* 🚀
