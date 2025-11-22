import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Import all schemas
import * as authSchema from "./auth-schema";
import * as businessSchema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Create postgres connection
const connection = postgres(process.env.DATABASE_URL, {
  max: 1, // Use a single connection for serverless environments
});

// Create Drizzle instance with all schemas
export const db = drizzle(connection, {
  schema: {
    ...authSchema,
    ...businessSchema,
  },
  casing: "snake_case",
});
