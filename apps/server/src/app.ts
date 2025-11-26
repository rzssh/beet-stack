import { countRoutes, createServerConfiguration } from "@acme/core/server";
import { Elysia } from "elysia";
import { auth } from "~/lib/auth";
import { logger } from "~/logger";

/**
 * Standalone Elysia server for specific features that need
 * to run separately from the main TanStack Start integrated server.
 *
 * Use cases include:
 * - WebSockets for real-time features
 * - File uploads and processing
 * - Background jobs and queues
 * - Complex business logic that needs separate scaling
 * - Third-party webhooks
 *
 * Auth and simple CRUD are handled by TanStack Start integrated API routes
 * This server only runs when you need separate services for specific features
 */
export const app = new Elysia()
  .use(createServerConfiguration({ serviceName: "standalone-service", auth, logger }))
  .ws("/websocket", {
    open(ws) {
      logger.info("WebSocket connection opened");
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    },
    message(ws, message) {
      logger.info({ message }, "WebSocket message received");
      // Echo back for now - implement real-time features here
      ws.send(
        JSON.stringify({
          type: "echo",
          data: message,
          timestamp: Date.now(),
        }),
      );
    },
    close(_ws) {
      logger.info("WebSocket connection closed");
    },
  })
  .use(countRoutes);

export type App = typeof app;
