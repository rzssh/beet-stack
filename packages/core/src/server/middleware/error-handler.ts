import { Elysia } from "elysia";
import { AppError, type ErrorResponse } from "../errors";
import type { Logger } from "./attach";

export const errorHandler = (logger: Logger) =>
  new Elysia({ name: "error-handler" })
    .onError(({ code, error, set, request }) => {
      const requestId =
        request.headers.get("x-request-id") ?? crypto.randomUUID();
      const path = new URL(request.url).pathname;
      const timestamp = new Date().toISOString();

      if (error instanceof AppError) {
        logger.warn(
          { requestId, path, code: error.code, context: error.context },
          error.message,
        );
        set.status = error.statusCode;
        return {
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            requestId,
            timestamp,
            path,
          },
        } satisfies ErrorResponse;
      }

      if (code === "VALIDATION") {
        set.status = 400;
        return {
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            requestId,
            timestamp,
            path,
          },
        } satisfies ErrorResponse;
      }

      logger.error({ requestId, path, error }, "Unexpected request error");
      set.status = 500;
      return {
        error: {
          message: "An unexpected error occurred",
          code: "INTERNAL_ERROR",
          statusCode: 500,
          requestId,
          timestamp,
          path,
        },
      } satisfies ErrorResponse;
    })
    .as("global");
