import { treaty } from "@elysiajs/eden";
import type { App } from "./types";

/**
 * Pre-configured API client for web usage.
 * Following the official Elysia + TanStack Start integration pattern.
 */
export const api = treaty<App>("http://localhost:3001", {
  fetch: { 
    credentials: "include", 
    mode: "cors" 
  }
});