import { cors } from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import type { Auth } from "~/auth";
import { env } from "~/env";
import { rateLimit } from "~/server";
import { createAttachMiddleware, type Logger } from "~/server/middleware/attach";

type CreateServerConfigurationParams = {
  serviceName?: string;
  auth: Auth;
  logger?: Logger;
};

/**
 * Minimal Elysia server configuration template
 */
export const createServerConfiguration = ({
  serviceName,
  auth,
  logger,
}: CreateServerConfigurationParams) =>
  new Elysia()
    .use(
      cors({
        origin: env.TRUSTED_ORIGINS,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    )
    .use(createAttachMiddleware(auth, logger))
    .use(opentelemetry())
    .use(
      swagger({
        documentation: {
          info: {
            title: `${serviceName} API`,
            version: "1.0.0",
            description: `API documentation for the ${serviceName} service.`,
          },
          // tags: [
          //   { name: "Health", description: "Health check endpoints" },
          //   { name: "Auth", description: "Authentication endpoints" },
          // ],
        },
      }),
    )
    .use(rateLimit({ windowMs: 1 * 60 * 1000, maxRequests: 1000 })) // 1000 requests per minute
    .get("/health", () => ({
      status: "ok",
      service: serviceName,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }))
    .get("/me", async ({ user }) => user, { auth: true });
