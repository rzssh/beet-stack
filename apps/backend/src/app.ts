import cors from "@elysiajs/cors";
import { opentelemetry } from "@elysiajs/opentelemetry";
import swagger from "@elysiajs/swagger";
import {
  env,
  logger,
  rateLimit,
  securityHeaders,
  sentryPlugin,
} from "@acme/platform";
import { Elysia } from "elysia";
import { requestContext } from "./core/context";
import { billingRoutes } from "./modules/billing/billing.routes";
import { fileRoutes } from "./modules/files/files.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { messageRoutes } from "./modules/messages/messages.routes";
import { metricsRoutes } from "./modules/metrics/count.routes";
import { pokemonRoutes } from "./modules/pokemon/pokemon.routes";
import { userRoutes } from "./modules/users/user.routes";

export const app = new Elysia()
  .state("env", env)
  .decorate("logger", logger)
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  )
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
  .use(sentryPlugin())
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
    logger.error("Unhandled error", error);
    set.status = 500;
    return {
      error: "Internal Server Error",
    };
  });

export type App = typeof app;
