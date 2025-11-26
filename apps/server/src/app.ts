import { countRoutes, createServerConfiguration } from "@acme/core/server";
import { Elysia } from "elysia";
import { auth } from "~/lib/auth";
import { logger } from "~/logger";

export const app = new Elysia()
  .use(createServerConfiguration({ serviceName: "standalone-service", auth, logger }))
  .ws("/websocket", {
    open(ws) {
      logger.info("WebSocket connection opened");
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    },
    message(ws, message) {
      logger.info({ message }, "WebSocket message received");
      ws.send(JSON.stringify({ type: "echo", data: message, timestamp: Date.now() }));
    },
    close() {
      logger.info("WebSocket connection closed");
    },
  })
  .use(countRoutes);

export type App = typeof app;
