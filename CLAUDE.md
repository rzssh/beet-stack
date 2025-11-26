# CLAUDE.md

AI agent guidelines for this monorepo.

## Project Structure

```
apps/
├── web/src/
│   ├── routes/              # TanStack Start file-based routes
│   ├── server/
│   │   ├── api.ts           # Elysia app mounted at /api
│   │   └── services/        # Business logic (direct DB calls)
│   ├── lib/
│   │   ├── api/             # Query options, mutations
│   │   ├── auth/client.ts   # Better Auth client
│   │   └── schema/          # Zod validation schemas
│   └── components/          # React components
├── server/src/
│   ├── app.ts               # Standalone Elysia server
│   └── lib/auth.ts          # Auth instance for microservice
└── expo/src/
    ├── app/                 # Expo Router screens
    └── utils/               # Auth, API, base URL helpers

packages/
├── core/src/
│   ├── auth.ts              # initAuth() - shared auth config
│   ├── env.ts               # Validated environment variables
│   └── server/
│       ├── index.ts         # createServerConfiguration()
│       ├── middleware/      # Auth, error handling, logging
│       └── routers/         # Shared API routes
└── db/src/
    ├── client.ts            # db, authDb exports
    ├── schema.ts            # Business tables
    └── auth-schema.ts       # Better Auth tables
```

## Code Style

- Double quotes, `??` over `||`, no `any`
- Absolute imports: `~/` for app code, `@acme/` for packages
- Comments explain WHY, not WHAT
- Edit existing files, don't create new ones unless necessary

## Key Patterns

### API Client
```typescript
// apps/web/src/lib/api/index.ts
export const api = createIsomorphicFn()
  .server(() => treaty(app, { headers: getRequest().headers }).api)
  .client(() => treaty<typeof app>(getBaseUrl()).api);
```

### Server Context (loaders, server functions)
```typescript
const { data: user } = await context.api().me.get();
```

### Client Context (React components)
```typescript
const { data: session } = authClient.useSession();
const { data } = useQuery(messagesQueries.all());
```

### Services (direct DB, no abstractions)
```typescript
export const messagesService = {
  async getAll() {
    return db.select().from(messages);
  },
  async create(data: CreateMessage, userId: string) {
    const [msg] = await db.insert(messages).values({ ...data, userId }).returning();
    return msg;
  },
};
```

### Elysia Routes
```typescript
export const featureRoutes = new Elysia({ prefix: "/feature" })
  .use(createAttachMiddleware())
  .get("/", ({ service }) => service.getAll())
  .guard({ auth: true }, (app) =>
    app.post("/", ({ body, user, service }) => service.create(body, user.id))
  );
```

### TanStack Query
```typescript
export const messagesQueries = {
  all: () => queryOptions({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await api().messages.get();
      if (res.error) throw new Error(res.error.value);
      return res.data;
    },
  }),
};
```

## Adding a New Feature

1. **Schema**: Add table to `packages/db/src/schema.ts`
2. **Service**: Create `apps/web/src/server/services/[feature].ts`
3. **Router**: Create `packages/core/src/server/routers/[feature].ts`
4. **Mount**: Import router in `apps/web/src/server/api.ts`
5. **Queries**: Create `apps/web/src/lib/api/[feature]/queries.ts`
6. **UI**: Create route in `apps/web/src/routes/`

## Environment

Server-only vars have no prefix. Client vars use `VITE_` prefix.
All validated in `packages/core/src/env.ts`.

Key vars:
- `DATABASE_URL` - PostgreSQL connection
- `AUTH_SECRET` - Better Auth secret
- `APP_URL` - Web app URL
- `MICROSERVICE_URL` - Standalone server URL

## Forbidden

- `typeof window !== "undefined"` - use `createIsomorphicFn()`
- Repository pattern / service layers
- Single quotes
- `||` for defaults (use `??`)
- Comments stating the obvious
- Creating files without necessity
