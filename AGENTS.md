# Project agent memory

## Product boundary

Repository is the BEET Stack monorepo (Bun, Elysia, Expo, TanStack Start): Better Auth email/password sessions and user-owned message CRUD through TanStack Start, Elysia, Expo, Drizzle, and PostgreSQL. Do not reintroduce mock integrations, cloud deployment claims, or speculative features.

## Authoritative paths

- Shared API and ownership rules: `packages/core/src/server/routers/messages/`
- Auth configuration: `packages/core/src/auth.ts`
- PostgreSQL schema and migrations: `packages/db/`
- Web API mount and UI: `apps/web/src/routes/api/$.ts` and `apps/web/src/routes/_protected/messages/index.tsx`
- Expo client contract and UI: `apps/expo/src/utils/api.tsx` and `apps/expo/src/app/`
- Verified setup, checks, and release checklist: `README.md`

Use `~/` imports inside apps and `@acme/` imports across workspaces. Use double quotes. Keep trust-boundary validation, server-side ownership filters, and explicit error handling.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
