import * as Sentry from "@sentry/bun";
import { Elysia } from "elysia";

import { env } from "~/env";

let sentryInitialized = false;

export const initSecurity = () => {
  if (sentryInitialized || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
  });

  sentryInitialized = true;
};

export const sentryPlugin = () =>
  new Elysia({ name: "sentry" })
    .onRequest(initSecurity)
    .onError({ as: "global" }, ({ error, path, request }) => {
      if (!sentryInitialized) return;

      Sentry.captureException(error, {
        extra: { path, method: request.method, url: request.url },
      });
    });
// .onAfterResponse(({ status }) => {
//   if (!sentryInitialized) return;
//   const transaction = Sentry.getCurrentScope().getSpan();
//   if (transaction) {
//     transaction.setHttpStatus(status);
//     transaction.finish();
//   }
// });
