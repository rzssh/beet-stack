import { Elysia } from "elysia";

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get("/", () => ({ status: "ok" }))
  .get("/ready", () => ({
    status: "ready",
    timestamp: new Date().toISOString(),
  }));
