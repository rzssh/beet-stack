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
import { errorHandler } from "./core/middleware/error-handler";
import { requestId } from "./core/middleware/request-id";
import { billingRoutes } from "./modules/billing/billing.routes";
import { fileRoutes } from "./modules/files/files.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { messageRoutes } from "./modules/messages/messages.routes";
import { metricsRoutes } from "./modules/metrics/count.routes";
import { userRoutes } from "./modules/users/user.routes";

const securityHeaders = () =>
  new Elysia({ name: "security-headers" }).onAfterResponse(
    ({ set, headers }) => {
      set.headers = {
        ...headers,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
      };
    },
  );

export const app = new Elysia()
  .state("env", env)
  .decorate("logger", logger)
  // Add request ID tracking first
  .use(requestId())
  // Add error handling early
  .use(errorHandler())
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get('origin');
        if (!origin) return true; // Allow requests with no origin (mobile apps)
        
        const allowedOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
        
        // Check exact matches first
        if (allowedOrigins.includes(origin)) return true;
        
        // Check wildcard patterns for Expo development
        const isLocalNetwork = /^http:\/\/(192\.168\.|10\.0\.|172\.(1[6-9]|2\d|3[01])\.).+/.test(origin);
        const isExpoScheme = /^(expo|exp):\/\//.test(origin);
        
        return isLocalNetwork || isExpoScheme;
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    }),
  )
  // Mount Better Auth handler
  .mount(auth.handler)
  .use(opentelemetry())
  .use(
    swagger({
      documentation: {
        info: {
          title: "SaaS Boilerplate API",
          version: "1.0.0",
          description:
            "Production-ready API with auth, billing, messaging, files, and analytics.",
        },
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Users", description: "User management" },
          { name: "Messages", description: "Message CRUD operations" },
          { name: "Files", description: "File upload and storage" },
          { name: "Billing", description: "Stripe payment integration" },
          { name: "Metrics", description: "Application metrics" },
        ],
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
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }))
  .use(healthRoutes)
  .use(userRoutes)
  .use(messageRoutes)
  .use(billingRoutes)
  .use(fileRoutes)
  .use(metricsRoutes);

export type App = typeof app;
