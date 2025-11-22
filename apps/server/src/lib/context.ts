import { Elysia } from "elysia";

/**
 * Enhanced Elysia context with common utilities
 * Provides consistent access to shared utilities across routes
 */
export interface ElysiaContext {
  requestId: string;
  requestTime: Date;
  userAgent?: string;
  ip?: string;
  utils: {
    now: () => Date;
    generateId: () => string;
    isValidEmail: (email: string) => boolean;
    isValidUuid: (uuid: string) => boolean;
  };
}

/**
 * Creates enhanced Elysia context middleware
 */
export function createElysiaContext() {
  return new Elysia({ name: "enhanced-context" })
    .derive(({ headers, request }) => {
      const requestId = headers["x-request-id"] ?? crypto.randomUUID();
      const requestTime = new Date();
      const userAgent = headers["user-agent"];
      const ip = headers["x-forwarded-for"] ?? headers["x-real-ip"] ?? "unknown";

      const utils = {
        now: () => new Date(),
        generateId: () => crypto.randomUUID(),
        isValidEmail: (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        isValidUuid: (uuid: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(uuid);
        },
      };

      return {
        requestId,
        requestTime,
        userAgent,
        ip,
        utils,
      } satisfies ElysiaContext;
    });
}