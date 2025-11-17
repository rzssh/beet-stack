import { Elysia } from "elysia";
import { logger } from "@acme/platform";

export const requestContext = new Elysia({ name: "request-context" }).derive(
  () => {
    const requestId = crypto.randomUUID();
    return {
      requestId,
      log: logger.child({ requestId }),
      startedAt: performance.now(),
    };
  },
);
