import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for TanStack Start
 * No baseURL needed - it will default to /api/auth which is correct
 * for TanStack Start's file-based routing
 * Cannot be named without a reference (TS issue,
 * probably will fix itself with time or updating some packages)
 */
export const authClient = createAuthClient();
