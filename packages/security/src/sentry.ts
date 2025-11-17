import * as Sentry from "@sentry/node";
import { Elysia } from "elysia";

// Initialize Sentry
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn("SENTRY_DSN not found, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.nodeContextIntegration(),
    ],
  });
}

// Sentry middleware for Elysia
export function sentryMiddleware() {
  return new Elysia({ name: "sentry" })
    .onError({ as: "global" }, ({ error, path, request }) => {
      // Capture the error with context
      Sentry.captureException(error, {
        extra: {
          path,
          method: request.method,
          url: request.url,
          userAgent: request.headers.get("user-agent"),
        },
        tags: {
          section: "api",
          path,
        },
      });
    })
    .onRequest(({ request, path }) => {
      // Start a new transaction for each request
      const transaction = Sentry.startTransaction({
        name: `${request.method} ${path}`,
        op: "http",
      });
      Sentry.getCurrentScope().setSpan(transaction);
    })
    .onResponse(({ response }) => {
      // Finish the transaction
      const transaction = Sentry.getCurrentScope().getSpan();
      if (transaction) {
        transaction.setHttpStatus(response.status);
        transaction.finish();
      }
    });
}

export { Sentry };
