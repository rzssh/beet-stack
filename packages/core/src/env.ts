import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    APP_URL: z.url().default("http://localhost:3000"),
    MICROSERVICE_URL: z.url().default("http://localhost:3001"),
  },
  server: {
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().default(3000),
    SERVICE_PORT: z.coerce.number().default(3001),
    TRUSTED_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://localhost:3001,beet-stack://")
      .transform((value) => value.split(",").map((origin) => origin.trim())),
    AUTH_SECRET: z.string().min(32),
  },
  runtimeEnv: process.env,
  skipValidation:
    process.env.NODE_ENV !== "production" &&
    (!!process.env.CI ||
      ["lint", "typecheck"].includes(process.env.npm_lifecycle_event ?? "")),
});
