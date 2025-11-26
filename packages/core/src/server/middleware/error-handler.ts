import { Elysia } from "elysia";

import { AppError, type ErrorResponse } from "~/server/errors";
import type { Logger } from "./attach";

const isDev = process.env.NODE_ENV !== "production";

const extractErrorInfo = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    };
  }
  return { name: "Unknown", message: String(error) };
};

export const errorHandler = (logger: Logger) =>
  new Elysia({ name: "error-handler" }).onError(({ error, set, request }) => {
    const requestId =
      request.headers.get("x-request-id") ?? crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const path = new URL(request.url).pathname;
    const method = request.method;

    const baseContext = { requestId, path, method };

    // Handle known application errors
    if (error instanceof AppError) {
      const level = error.isOperational ? "warn" : "error";
      logger[level](
        { ...baseContext, code: error.code, context: error.context },
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
          context: error.context,
        },
      } satisfies ErrorResponse;
    }

    // Handle Elysia validation errors
    if ("code" in error && error.code === "VALIDATION") {
      logger.warn({ ...baseContext, validation: String(error) }, "Validation failed");

      set.status = 400;
      return {
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          requestId,
          timestamp,
          path,
          context: isDev ? { details: String(error) } : undefined,
        },
      } satisfies ErrorResponse;
    }

    // Handle auth errors
    const errorMsg = error instanceof Error ? error.message : "";
    if (errorMsg.includes("Unauthorized") || errorMsg.includes("Authentication")) {
      logger.warn({ ...baseContext }, "Authentication required");

      set.status = 401;
      return {
        error: {
          message: "Authentication required",
          code: "AUTHENTICATION_ERROR",
          statusCode: 401,
          requestId,
          timestamp,
          path,
        },
      } satisfies ErrorResponse;
    }

    // Unexpected errors
    const errorInfo = extractErrorInfo(error);
    logger.error({ ...baseContext, error: errorInfo }, `Unexpected: ${errorInfo.message}`);

    set.status = 500;
    return {
      error: {
        message: isDev ? errorInfo.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR",
        statusCode: 500,
        requestId,
        timestamp,
        path,
        context: isDev ? { name: errorInfo.name, stack: errorInfo.stack } : undefined,
      },
    } satisfies ErrorResponse;
  });
