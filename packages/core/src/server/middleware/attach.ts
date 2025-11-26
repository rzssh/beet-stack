import { db } from "@acme/db/client";
import type { Level } from "pino";
import { Elysia } from "elysia";

import type { Auth } from "~/auth";
import { env } from "~/env";
import {
  createAuthMiddleware,
  createElysiaContext,
  errorHandler,
  requestLogger,
} from "~/server";

export type Logger = Record<Level, (...args: any[]) => void>;

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  fatal: () => {},
  trace: () => {},
};

export type ElysiaWithCore = ReturnType<typeof createAttachMiddlewareBase>;
const createAttachMiddlewareBase = (auth: Auth, logger: Logger) =>
  new Elysia()
    .use(requestLogger(logger))
    .use(createAuthMiddleware(auth))
    .state("env", env)
    .decorate("logger", logger)
    .decorate("auth", auth)
    .decorate("db", db)
    .use(createElysiaContext())
    .use(errorHandler(logger));

export const createAttachMiddleware = (auth?: Auth, logger?: Logger) => {
  if (!auth) {
    return new Elysia() as unknown as ElysiaWithCore;
  }

  return createAttachMiddlewareBase(auth, logger ?? noopLogger);
};
