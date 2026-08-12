import { Elysia } from "elysia";
import type { Logger } from "./attach";

const startedAt = new WeakMap<Request, number>();

export const requestLog = (logger: Logger) =>
  new Elysia({ name: "request-log" })
    .onRequest(({ request }) => {
      startedAt.set(request, Date.now());
    })
    .onAfterResponse(({ request, set }) => {
      const status = typeof set.status === "number" ? set.status : 200;
      const begunAt = startedAt.get(request);
      const detail = {
        method: request.method,
        path: new URL(request.url).pathname,
        status,
        client: request.headers.get("x-client-platform") ?? "unknown",
        ...(begunAt ? { durationMs: Date.now() - begunAt } : {}),
      };
      if (status >= 500) logger.error(detail, "request completed");
      else if (status >= 400) logger.warn(detail, "request completed");
      else logger.info(detail, "request completed");
    })
    .as("global");
