# GitHub Copilot Instructions

This file provides specific instructions for GitHub Copilot when working in this codebase.

## Import Rules
- ALWAYS use `~/` for absolute imports
- NEVER use relative imports like `../` or `./`

## Operators
- Use `??` instead of `||` for null/undefined checks
- Use optional chaining `?.` extensively

## Backend Patterns
- Import logger: `import { logger } from "~/core/logger";`
- Import errors: `import { NotFoundError } from "~/core/errors";`
- Throw structured errors: `throw new NotFoundError("Resource", { id })`
- Use structured logging: `logger.info("Event", { context })`

## Frontend Patterns
- Route loaders: `const { user } = Route.useLoaderData();`
- Components: `const { data: session } = authClientRepo.useSession();`
- Session server: `const session = await getSessionFn();`

## Never Use
- `console.log` or `console.error` (backend)
- Relative imports (`../`, `./`)
- Generic `Error` class (backend)
- Logical OR `||` for null checks (use `??`)
- Type assertions `as` (use type guards)

## File Structure
- Files: `kebab-case.ts`
- Folders: `kebab-case/`
- No underscore folders