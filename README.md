# TanStack Start × Elysia × Better Auth — Hyper-Extensible Boilerplate

> **A user needs-driven full-stack monorepo that scales from simple apps to complex microservices using shared packages and battle-tested patterns.**

Built for **hyper-fast development** with maximum flexibility: start simple, extend as needed, deploy anywhere. This boilerplate grows with your requirements while maintaining consistent developer experience.

## 🚀 Philosophy: User Needs First

This architecture adapts to **your specific requirements**:

- **🎯 Simple app?** Use TanStack Start's integrated API - no separate server needed
- **⚡ Need more performance?** Add dedicated Elysia.js servers using shared packages
- **📈 Ready to scale?** Deploy services independently - full microservice support
- **🌍 Self-host or serverless?** Both patterns work out of the box

### The Power of "One Correct Way"

- **Clear import paths** that describe exactly what each file does
- **Shared packages** eliminate code duplication across applications
- **Context-aware APIs** that know whether they're running on server or client
- **Type safety** from database to frontend with zero configuration

## 🏗️ Architecture Overview

### Flexible Scaling Strategy

```
📦 Single App (Start Here)
└── TanStack Start with integrated API routes

📦 Multiple Services (Scale Up)
├── Web App (TanStack Start)
├── API Server (Bun Elysia.js)
├── Mobile App (Expo React Native)

📦 Microservices (Enterprise Scale)
└── Each deployable independently
```

## 🗂️ Project Structure

```
apps/
├── expo/            # React Native mobile app
├── server/          # Standalone Elysia.js microservice
└── web/             # TanStack Start full-stack app

packages/
├── core/            # 🧠 Server config, auth, routers, middleware
├── db/              # 🗄️ Database schemas, client, migrations
└── ui/              # 🎨 Shared React Native UI components

tooling/             # 🔧 Shared configs for linting, formatting, TypeScript
```

## ⚡ Quick Start

### 1. Install & Setup

```bash
bun install

# Environment (create .env in root)
DATABASE_URL="postgres://user:pass@localhost:5432/db"
AUTH_SECRET="your-secret-key"
```

### 2. Database

```bash
bun db:push    # Create tables
bun db:seed    # Add sample data
```

### 3. Development

```bash
bun dev        # Start all: web (3000) + server (3001) + expo

# Or start individual apps
bun --filter=@acme/web dev      # Just web app
bun --filter=@acme/server dev   # Just API server
bun --filter=@acme/expo dev     # Just mobile app
```

## 🎯 Key Features

### 🔐 **Smart Authentication**

- **Better Auth** with email/password + OAuth (Discord, GitHub, Google)
- **Context-aware**: server-side session handling, client-side React hooks
- **Cross-platform**: same auth flow works on web and mobile

### 🌐 **Type-Safe APIs**

- **Eden Treaty** provides end-to-end TypeScript safety
- **Isomorphic clients** automatically work on server and client
- **OpenAPI docs** generated automatically from your routes

### 📊 **Direct Database Access**

- **Drizzle ORM** with PostgreSQL for type-safe queries
- **No repository patterns** - direct, simple database calls
- **Automatic migrations** and schema validation

### 🎨 **Modern Frontend Stack**

- **TanStack Start** with file-based routing and SSR
- **TanStack Query** for server state management
- **Jotai** for client state management
- **Tailwind CSS v4** + **shadcn/ui** for beautiful UIs

### 📱 **Mobile Ready**

- **React Native** + **Expo** with shared API types
- **NativeWind** for consistent styling
- Same authentication and data fetching patterns

## 💻 Development Experience

### Clear Context Separation

```typescript
// Server context (loaders, server functions)
const response = await api().messages.get();

// Client context (React components)
const { data } = useQuery(messagesQuery());
```

### Descriptive Import Paths

```typescript
// Everything tells you exactly what it is
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth/client";
import { messagesService } from "~/server/services/messages";
```

### Shared Package Power

```typescript
// Reuse everything across apps
import { createServerConfiguration } from "@acme/core/server";
import { db } from "@acme/db/client";
import { initAuth } from "@acme/core/auth";
```

## 🔧 Development Commands

```bash
# Development
bun dev                    # All apps
bun dev:web               # Web + server only
bun typecheck             # Type check everything
bun lint                  # Lint all packages

# Database
bun db:generate           # Create migrations
bun db:push               # Apply schema changes
bun db:studio             # Visual database editor
bun db:seed               # Sample data

# Production
bun build                 # Build all apps
bun clean                 # Clean build artifacts
```

## 🚀 Deployment Flexibility

### Self-Hosted Options

- **Single server**: Deploy web app with integrated API
- **Multiple servers**: Run each service independently
- **Docker**: Containerized deployment ready
- **VPS/Dedicated**: Traditional hosting anywhere

### Serverless Options

- **Vercel**: Deploy web app with zero config
- **Railway**: Full-stack with database included
- **AWS/GCP**: Functions or containers
- **Fly.io**: Global edge deployment

### Scaling Strategies

```bash
# Start simple
apps/web (integrated API) → Single deployment

# Scale up
apps/web + apps/server → Two deployments, shared packages

# Microservices
Multiple apps/ → Independent services, shared @acme/*
```

## 🎨 Architecture Patterns

### Direct Implementation (No Abstractions)

```typescript
// Simple service objects, direct database calls
export const messagesService = {
  async getAll() {
    return await db.select().from(messages);
  },
  async create(data: MessageInput) {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  },
};
```

### Smart Route Protection

```typescript
// Automatic authentication checking
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.user) throw redirect({ to: "/signin" });
  },
});
```

### Isomorphic API Clients

```typescript
// Same API, works everywhere
export const api = createIsomorphicFn()
  .server(() => /* server implementation */)
  .client(() => /* client implementation */);
```

## 🛠️ Core Technologies

| Purpose       | Technology           | Why                                      |
| ------------- | -------------------- | ---------------------------------------- |
| **Runtime**   | Bun                  | Native TypeScript, incredible speed      |
| **Frontend**  | TanStack Start       | Full-stack React with file-based routing |
| **Backend**   | Elysia.js            | High-performance, TypeScript-first APIs  |
| **Mobile**    | React Native + Expo  | Cross-platform with shared types         |
| **Database**  | Drizzle + PostgreSQL | Type-safe ORM, excellent DX              |
| **Auth**      | Better Auth          | Modern, flexible authentication          |
| **API Types** | Eden Treaty          | End-to-end type safety                   |
| **Styling**   | Tailwind CSS v4      | Utility-first, design system ready       |
| **UI**        | shadcn/ui            | High-quality, customizable components    |
| **State**     | Jotai                | Atomic, bottom-up state management       |

## 📈 When to Use What

### Start with TanStack Start Integrated

- **Rapid prototyping**
- **Small to medium applications**
- **Team wants full-stack in single codebase**
- **Simplified deployment requirements**

### Add Standalone Servers When

- **Need specialized performance**
- **Multiple client applications**
- **Team separation (frontend/backend)**
- **Independent scaling requirements**

### Go Microservices When

- **Enterprise scale requirements**
- **Complex business domains**
- **Independent team deployments**
- **Advanced scalability needs**

## 🎯 Design Principles

### **Hyper-Extensible by Design**

- Start with what you need, extend when you need it
- Shared packages eliminate code duplication
- Consistent patterns regardless of scale
- Deploy anywhere: self-hosted or serverless

### **Developer Experience First**

- One correct way to do things
- Descriptive import paths
- Context-aware APIs
- Type safety everywhere

### **User Needs Driven**

- Simple projects stay simple
- Complex projects get the tools they need
- Architecture grows with requirements
- No over-engineering upfront

## 🤝 Getting Help

This boilerplate is designed for **rapid development** and **easy extension**. The patterns are battle-tested and the shared packages approach ensures consistency as you scale.

**Perfect for:**

- SaaS applications
- B2B platforms
- Mobile + web products
- API-first architectures
- Teams that value consistency

## 📄 License

MIT License - build amazing products with this foundation!

---

**Ready to move fast without breaking things?** This boilerplate removes the complexity of setting up modern full-stack applications while keeping all the flexibility you need to scale. **Start building, not configuring.** 🚀
