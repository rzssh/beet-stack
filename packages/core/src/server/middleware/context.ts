import { Elysia } from "elysia";

export interface ElysiaContext {
  requestId: string;
  requestTime: Date;
  userAgent?: string;
  ip?: string;
}

export function createElysiaContext() {
  return new Elysia({ name: "enhanced-context" }).resolve(({ set }) => {
    const requestId =
      String(set.headers["x-request-id"]) ??
      String(set.headers["x-correlation-id"]) ??
      Bun.randomUUIDv7();

    set.headers["x-request-id"] = requestId;

    const requestTime = new Date();
    const userAgent = String(set.headers["user-agent"]);
    const ip =
      String(set.headers["x-forwarded-for"]) ??
      String(set.headers["x-real-ip"]) ??
      "unknown";

    return {
      requestId,
      requestTime,
      userAgent,
      ip,
    } satisfies ElysiaContext;
  });
}
