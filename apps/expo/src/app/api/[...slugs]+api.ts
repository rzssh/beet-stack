import { Elysia, t } from "elysia";
import type { App } from "@acme/api";

// Re-export the main API app for use in Expo API routes
// This provides a fallback when the standalone server isn't available
const api = new Elysia({ prefix: "/api" })
  .get("/health", () => ({ 
    status: "ok", 
    message: "Expo API route is working",
    timestamp: new Date().toISOString()
  }))
  .get("/version", () => ({ 
    version: "1.0.0",
    platform: "expo-embedded" 
  }))
  // Add a simple echo endpoint for testing
  .post("/echo", ({ body }) => ({ echo: body }), {
    body: t.Object({
      message: t.String()
    })
  });

// Export HTTP methods for Expo API routes
export const GET = api.fetch;
export const POST = api.fetch;
export const PUT = api.fetch;
export const DELETE = api.fetch;
export const PATCH = api.fetch;

export type EmbeddedApi = typeof api;