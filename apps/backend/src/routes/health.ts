import { Elysia } from "elysia";
import { db } from "@acme/db/client";

export const health = new Elysia({ prefix: "/health" })
  .get("/", async () => {
    try {
      // Check database connection
      await db.execute("SELECT 1");

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "unknown",
        environment: process.env.NODE_ENV || "unknown",
        database: "connected",
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "unknown",
        environment: process.env.NODE_ENV || "unknown",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/ready", async ({ set }) => {
    try {
      // More comprehensive readiness check
      await db.execute("SELECT 1");

      // Check if environment variables are set
      const requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];

      const missingEnvVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar],
      );

      if (missingEnvVars.length > 0) {
        set.status = 503;
        return {
          status: "not ready",
          reason: "Missing environment variables",
          missing: missingEnvVars,
        };
      }

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      set.status = 503;
      return {
        status: "not ready",
        reason: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
