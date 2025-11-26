import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Import all schemas
import * as authSchema from "./auth-schema";
import * as businessSchema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Create postgres connection for main database
const connection = postgres(process.env.DATABASE_URL, {
  max: 1, // Use a single connection for serverless environments
});

// Create Drizzle instance with all schemas
export const db = drizzle(connection, {
  schema: { ...authSchema, ...businessSchema },
  casing: "snake_case",
});

// Auth database - separate connection only in development when AUTH_DATABASE_URL is set
// This allows OAuth state to be shared with production during local development
const useAuthDb =
  process.env.NODE_ENV === "development" && process.env.AUTH_DATABASE_URL;

export const authDb = useAuthDb
  ? drizzle(postgres(process.env.AUTH_DATABASE_URL, { max: 1 }), {
      schema: authSchema,
      casing: "snake_case",
    })
  : db;
