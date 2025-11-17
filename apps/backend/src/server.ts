import { env, initSecurity, logger } from "@acme/platform";
import { app } from "./app";

initSecurity();

const server = app.listen(env.PORT, () => {
  const url = `http://${app.server?.hostname}:${app.server?.port}`;
  logger.info("API ready", {
    url,
  });
  logger.info("Swagger docs", {
    url: `${url}/swagger`,
  });
});

export type { App } from "./app";
export { server };
