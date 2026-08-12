import { createApiApp } from "@acme/core/server";
import { auth } from "./lib/auth";
import { logger } from "./logger";

export const app = createApiApp({
  serviceName: "standalone-api",
  auth,
  logger,
});
