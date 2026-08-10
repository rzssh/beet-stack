import { db } from "@acme/db/client";
import { Elysia } from "elysia";
import type { Logger as PinoLogger } from "pino";
import type { Auth } from "../../auth";
import { createAuthMiddleware } from "./auth";
import { errorHandler } from "./error-handler";

export type Logger = Pick<
  PinoLogger,
  "debug" | "info" | "warn" | "error" | "fatal" | "trace"
>;

const noopLogger: Logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  debug: () => undefined,
  fatal: () => undefined,
  trace: () => undefined,
};

export type ElysiaWithCore = ReturnType<typeof createAttachMiddlewareBase>;
const createAttachMiddlewareBase = (auth: Auth, logger: Logger) =>
  new Elysia()
    .use(createAuthMiddleware(auth, logger))
    .decorate("logger", logger)
    .decorate("auth", auth)
    .decorate("db", db)
    .use(errorHandler(logger));

export const createAttachMiddleware = (auth?: Auth, logger?: Logger) => {
  if (!auth) return new Elysia() as unknown as ElysiaWithCore;
  return createAttachMiddlewareBase(auth, logger ?? noopLogger);
};
