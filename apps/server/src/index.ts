import { env } from "@acme/core/env";
import { app } from "~/app";
import { logger } from "~/logger";

/**
 * Port priority:
 * 1. PORT (Railway/hosting provider sets this)
 * 2. SERVICE_PORT (local development default: 3001)
 */
const port = env.PORT ?? env.SERVICE_PORT;

const server = app.listen(port, () => {
  const url = `http://${app.server?.hostname}:${app.server?.port}`;
  logger.info({ url }, "API ready");
  logger.info({ url: `${url}/swagger` }, "Swagger docs");
});

export type { App } from "./app";
export { server };
