import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const sharedEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Inter-service communication URLs
  APP_URL: z.url().default("http://localhost:3000"),
  MICROSERVICE_URL: z.url().default("http://localhost:3001"),

  // OAuth Production URL (where OAuth callbacks are registered)
  BETTER_AUTH_URL: z.url().optional().default("http://localhost:3000"),

  // Platform-specific (auto-detected by hosting providers)
  VERCEL_URL: z.string().optional(),
  RAILWAY_PUBLIC_DOMAIN: z.string().optional(),
  FLY_APP_NAME: z.string().optional(),
});

const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.url(),
  // Auth database - uses production DB for OAuth state sharing across environments
  AUTH_DATABASE_URL: z.url().optional(),

  // Server
  PORT: z.coerce.number().default(3000),
  SERVICE_PORT: z.coerce.number().default(3001),
  TRUSTED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001,expo://,exp://")
    .transform((value) => value.split(",").map((origin) => origin.trim())),

  // Auth
  AUTH_SECRET: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Integrations (Optional)
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().optional(),
});

const clientEnvSchema = z.object({
  // Analytics
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.url().default("https://us.i.posthog.com"),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  VITE_ENABLE_ERROR_REPORTING: z.coerce.boolean().default(true),
});

/**
 * Application Environment Variables
 * Uses `@t3-oss/env-core` for validation and type safety
 * Splits variables into shared, server-only, and client-only
 * Can be used in both server & client
 */
export const env = createEnv({
  clientPrefix: "VITE_",
  shared: sharedEnvSchema.shape,
  server: serverEnvSchema.shape,
  client: clientEnvSchema.shape,
  runtimeEnv: process.env,
  skipValidation:
    process.env.NODE_ENV !== "production" &&
    (!!process.env.CI || process.env.npm_lifecycle_event === "lint"),
});
