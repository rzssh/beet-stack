import {
  env,
  // securityHeaders,
  // sentryPlugin,
} from "@acme/config";
import cors from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { logger } from "~/core/logger";
import { rateLimit } from "~/lib/security";
import { auth } from "~/lib/auth-server";
import { requestContext } from "./core/context";
import { billingRoutes } from "./modules/billing/billing.routes";
import { fileRoutes } from "./modules/files/files.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { messageRoutes } from "./modules/messages/messages.routes";
import { metricsRoutes } from "./modules/metrics/count.routes";
import { pokemonRoutes } from "./modules/pokemon/pokemon.routes";
import { userRoutes } from "./modules/users/user.routes";

const securityHeaders = () =>
  new Elysia({ name: "security-headers" }).onAfterResponse(({ set }) => {
    set.headers = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    };
  });

export const app = new Elysia()
  .state("env", env)
  .decorate("logger", logger)
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .use(opentelemetry())
  .use(
    swagger({
      documentation: {
        info: {
          title: "SaaS Boilerplate API",
          version: "1.0.0",
          description:
            "Foundation API showcasing auth, billing, messaging, files, and analytics integrations.",
        },
      },
    }),
  )
  // .use(sentryPlugin())
  .use(securityHeaders())
  .use(
    rateLimit({
      windowMs: 60_000,
      maxRequests: env.NODE_ENV === "production" ? 120 : 300,
    }),
  )
  .use(requestContext)
  .get("/", () => ({
    status: "ok",
    version: "1.0.0",
  }))
  .use(healthRoutes)
  .use(userRoutes)
  .use(messageRoutes)
  .use(billingRoutes)
  .use(fileRoutes)
  .use(metricsRoutes)
  .use(pokemonRoutes)
  .onError(({ error, set }) => {
    logger.error(error, "Unhandled error");
    set.status = 500;
    return {
      error: "Internal Server Error",
    };
  });

export type App = typeof app;
