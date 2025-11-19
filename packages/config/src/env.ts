import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  BACKEND_URL: z.url().default("http://localhost:3001"),
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ROOT_DIR: z.string().default(process.env.ROOT_DIR ?? process.cwd()),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const env = envSchema.parse({
  ...process.env,
  ROOT_DIR: process.env.ROOT_DIR ?? process.cwd(),
});

export type Env = typeof env;

export { env, envSchema };
