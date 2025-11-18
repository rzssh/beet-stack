// import { env } from "@acme/config";
// import * as Sentry from "@sentry/bun";
import { Elysia } from "elysia";
// import { logger } from "~/core/logger";

// let sentryInitialized = false;

// export const initSecurity = () => {
//   if (sentryInitialized || !env.SENTRY_DSN) {
//     return;
//   }
//
//   Sentry.init({
//     dsn: env.SENTRY_DSN,
//     environment: env.NODE_ENV,
//     tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
//   });
//
//   sentryInitialized = true;
//   logger.info("Sentry initialised");
// };

// export const sentryPlugin = () =>
//   new Elysia({ name: "sentry" })
//     .onRequest(initSecurity)
//     .onError({ as: "global" }, ({ error, path, request }) => {
//       if (!sentryInitialized) return;
//
//       Sentry.captureException(error, {
//         extra: {
//           path,
//           method: request.method,
//           url: request.url,
//         },
//       });
//     });
// // .onAfterResponse(({ status }) => {
// //   if (!sentryInitialized) return;
// //   const transaction = Sentry.getCurrentScope().getSpan();
// //   if (transaction) {
// //     transaction.setHttpStatus(status);
// //     transaction.finish();
// //   }
// // });

type RateLimitStore = Map<
  string,
  {
    count: number;
    resetTime: number;
  }
>;

const rateLimitStore: RateLimitStore = new Map();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  identifier?: (request: Request) => string;
}

export const rateLimit = (options: RateLimitOptions) =>
  new Elysia({ name: "rate-limit" }).onRequest(({ request, set }) => {
    const identifier =
      options.identifier?.(request) ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const now = Date.now();
    const stored = rateLimitStore.get(identifier) ?? {
      count: 0,
      resetTime: now + options.windowMs,
    };

    if (now > stored.resetTime) {
      stored.count = 0;
      stored.resetTime = now + options.windowMs;
    }

    stored.count += 1;
    rateLimitStore.set(identifier, stored);

    if (stored.count > options.maxRequests) {
      set.status = 429;
      return {
        error: "Too many requests",
        retryAfter: Math.ceil((stored.resetTime - now) / 1000),
      };
    }

    set.headers = {
      "X-RateLimit-Limit": options.maxRequests.toString(),
      "X-RateLimit-Remaining": Math.max(
        0,
        options.maxRequests - stored.count,
      ).toString(),
      "X-RateLimit-Reset": Math.ceil(stored.resetTime / 1000).toString(),
    };
  });
