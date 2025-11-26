# AGENTS.md

Technical guidance for AI agents working with this hyper-extensible TanStack Start + Elysia.js monorepo.

## Architecture Philosophy

### Hyper-Extensible Design

This boilerplate is designed for **user needs-driven development**:

- **Don't need a server?** Just use TanStack Start's integrated API
- **Need multiple servers?** Create more apps using shared packages
- **Need to scale?** Deploy standalone services independently
- **Self-hosting or serverless?** Both patterns are supported

### One Correct Way Principle

There's typically **only one correct way** to do things:

- Import paths are descriptive and tell you exactly what the file does
- Use shared packages (`@acme/core`, `@acme/db`) for common functionality
- Use `~/` imports for app-specific code with self-explanatory paths
- Server vs client context is clearly separated

## Critical Architecture Patterns

### API Integration Strategy

```typescript
// The ONLY way to create API clients - isomorphic functions
export const api = createIsomorphicFn()
  .server(() => treaty(app, { headers: getRequest().headers }).api)
  .client(() => treaty<typeof app>(baseUrl).api);

// Server context (loaders, server functions)
const response = await api().messages.get();

// Client context (React components, hooks)
const { data } = useQuery({
  queryFn: () => api().messages.get(),
});
```

### Authentication Context Separation

```typescript
// Server-side: Direct API calls in route loaders
beforeLoad: async ({ context }) => {
  const { data: user } = await context.api().me.get();
  return { user };
};

// Client-side: React hooks only
const { data: session } = authClient.useSession();
await authClient.signIn.email({ email, password });
```

### Shared Package Usage

```typescript
// ✅ ALWAYS use shared packages for common functionality
import { createServerConfiguration } from "@acme/core/server";
import { db } from "@acme/db/client";
import { initAuth } from "@acme/core/auth";

// ❌ NEVER duplicate functionality between apps
```

## File Organization Principles

### Import Conventions (STRICT)

```typescript
// ✅ Absolute imports with descriptive paths
import { Button } from "~/components/ui/button";
import { messagesService } from "~/server/services/messages";
import { authClient } from "~/lib/auth/client";

// ❌ Relative imports - forbidden
import { Button } from "../../../components/ui/button";
```

### Path Naming Strategy

- `~/lib/api/` - API client functions and queries
- `~/lib/auth/` - Authentication utilities (client/server separated)
- `~/server/` - Server-side business logic and services
- `~/components/` - React components
- `~/routes/` - TanStack Start file-based routes

## Core Implementation Patterns

### Creating API Routes

```typescript
// Pattern: Create modular routers in shared packages
export const featureRoutes = new Elysia({ prefix: "/feature" })
  .use(createAttachMiddleware())
  .get("/", async ({ service }) => {
    return await service.getAll();
  })
  .guard({ auth: true }, (app) =>
    app.post("/", async ({ body, user, service }) => {
      return await service.create(body, user.id);
    }),
  );

// Integration point: Import and use in app
export const app = new Elysia({ prefix: "/api" })
  .use(createServerConfiguration({ serviceName: "app-name", auth }))
  .use(featureRoutes);
```

### Server-Side Data Fetching

```typescript
// Pattern: Prefetch in loaders, graceful fallbacks
export const Route = createFileRoute("/feature/")({
  loader: async () => {
    try {
      const response = await api().feature.get();
      return { data: response.data };
    } catch {
      return { data: null }; // Always provide fallbacks
    }
  },
});
```

### Client-Side Data Management

```typescript
// Pattern: Query factories for consistency
export const featureQueries = {
  all: () => ({
    queryKey: ["feature"],
    queryFn: async () => {
      const response = await api().feature.get();
      if (response.error) throw new Error(response.error.value);
      return response.data;
    },
  }),
};

// Usage: Combine server prefetch with client queries
function FeaturePage() {
  const { data: initialData } = Route.useLoaderData();
  const { data = initialData } = useQuery(featureQueries.all());
}
```

### Database Operations (Direct Pattern)

```typescript
// Pattern: Simple service objects, direct database calls
export const featureService = {
  async getAll() {
    return await db.select().from(features);
  },
  async create(data: FeatureInput) {
    const [feature] = await db.insert(features).values(data).returning();
    return feature;
  },
  async validateOwnership({ id, userId }: { id: string; userId: string }) {
    const feature = await db.query.features.findFirst({
      where: and(eq(features.id, id), eq(features.userId, userId)),
    });
    if (!feature) throw new Error("Not found or access denied");
    return feature;
  },
};

// ❌ NO repository patterns, service layers, or abstractions
```

## Environment & Configuration

### Environment Variable Separation

```typescript
// Server-only variables (no VITE_ prefix)
DATABASE_URL=postgres://...
AUTH_SECRET=secret-key

// Client-accessible variables (VITE_ prefix)
VITE_APP_URL=http://localhost:3000
VITE_POSTHOG_KEY=ph_key
```

### Shared Configuration Pattern

```typescript
// Centralized in @acme/core/env with validation
export const env = createEnv({
  server: { DATABASE_URL: z.url(), AUTH_SECRET: z.string() },
  client: { VITE_APP_URL: z.url() },
  runtimeEnv: process.env,
});
```

## Development Standards

### Code Style (NON-NEGOTIABLE)

```typescript
// ✅ Double quotes always
const message = "Hello world";

// ✅ Nullish coalescing
const value = config.timeout ?? DEFAULT_TIMEOUT;

// ✅ Direct implementation
const result = await db.select().from(table);

// ❌ Single quotes, || operator, unnecessary abstractions
```

### Type Safety Rules

```typescript
// ✅ Let TypeScript infer or use proper types
const client = createApiClient();
const user: User = getCurrentUser();

// ❌ NEVER use any - find proper solution or skip check
// @ts-expect-error - Complex type issue, will fix in next iteration
const complexResult = await complexOperation();
```

## Critical Context Rules

### Server vs Client Execution

- **`api()`** - ONLY in server contexts (loaders, server actions)
- **`authClient`** - ONLY in client contexts (React components)
- **`createIsomorphicFn()`** - Automatically handles context switching

### FORBIDDEN Patterns

```typescript
// ❌ Manual server/client detection
if (typeof window !== "undefined") {
}

// ❌ Dynamic imports for context switching
const { api } = await import("~/lib/api");

// ❌ Unnecessary abstractions
class FeatureRepository extends BaseRepository {}
interface IFeatureService {}

// ❌ Any pattern that creates indirection without value
```

## Extension Guidelines

### Adding New Features

1. **Create router in `@acme/core/server/routers/[feature]`**
2. **Export from routers index**
3. **Import in app's API integration point**
4. **Create client queries in app's `~/lib/api/[feature]`**

### Scaling Applications

- **Single app**: Use TanStack Start integrated API
- **Multiple apps**: Create standalone servers using shared packages
- **Microservices**: Each server can be deployed independently

### Deployment Flexibility

- **Self-hosted**: Run Node.js servers anywhere
- **Serverless**: Deploy individual functions or containers
- **Hybrid**: Mix integrated and standalone services as needed

## Key Success Patterns

### Shared Package Strategy

```typescript
// Maximize code reuse across applications
import { createServerConfiguration, createAttachMiddleware } from "@acme/core/server";
import { db, schema } from "@acme/db";
import { initAuth } from "@acme/core/auth";
```

### File Creation Policy

- **NEVER create files unless absolutely necessary**
- **ALWAYS prefer editing existing files**
- **NEVER create documentation unless explicitly requested**
- **Use existing patterns as templates**

### Extension Philosophy

- **Start simple, extend as needed**
- **Use shared packages to avoid duplication**
- **Follow existing import patterns**
- **Maintain type safety throughout**

## Remember

This boilerplate is designed to **grow with user needs**:

- Simple projects use integrated patterns
- Complex projects scale through shared packages
- All patterns support both self-hosting and serverless deployment
- Developer experience remains consistent regardless of scale

The goal is **hyper-fast development** with **maximum flexibility** while maintaining **consistent patterns** throughout the codebase.
