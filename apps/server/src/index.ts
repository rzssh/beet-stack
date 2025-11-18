import { env } from "@acme/config";
import { app } from "./app";
import { logger } from "~/core/logger";

// initSecurity();

const server = app.listen(env.PORT, () => {
  const url = `http://${app.server?.hostname}:${app.server?.port}`;
  logger.info({ url }, "API ready");
  logger.info({ url: `${url}/swagger` }, "Swagger docs");
});

export type { App } from "./app";
export type { Session } from "./lib/auth-server";
export { server };
