import "dotenv/config";

import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default {
  out: "./migrations",
  schema: "./src/schema.ts",
  breakpoints: true,
  dialect: "postgresql",
  // Set driver only if you are using aws-data-api, turso, d1-http, or expo
  // driver: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // token: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  casing: "snake_case",
} satisfies Config;
