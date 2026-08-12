import { env } from "@beet/core/env";
import { app } from "./app";
import { logger } from "./logger";

const server = app.listen(env.SERVICE_PORT, () => {
  logger.info(
    { url: `http://${app.server?.hostname}:${app.server?.port}` },
    "API ready",
  );
});

export { server };
