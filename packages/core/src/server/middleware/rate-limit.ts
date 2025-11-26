// TODO: make it use upstash/backend redis

import { Elysia } from "elysia";

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

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
