import { createAuthClient } from "better-auth/react";

/**
 * Simple auth client for web usage.
 * Following t3-turbo pattern - no shared package imports.
 */
export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
});