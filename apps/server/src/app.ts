import { createServerConfiguration, messagesRoutes } from "@acme/core/server";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { logger } from "./logger";

export const app = new Elysia()
  .use(
    createServerConfiguration({
      serviceName: "standalone-api",
      auth,
      logger,
    }),
  )
  .use(messagesRoutes);

export type App = typeof app;
