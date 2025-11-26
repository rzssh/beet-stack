import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./auth-schema";
import * as businessSchema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const connection = postgres(process.env.DATABASE_URL, { max: 1 });

export const db = drizzle(connection, {
  schema: { ...authSchema, ...businessSchema },
  casing: "snake_case",
});

// Separate auth DB when AUTH_DATABASE_URL set (for production OAuth with local dev)
const useAuthDb = process.env.NODE_ENV === "development" && process.env.AUTH_DATABASE_URL;

export const authDb = useAuthDb
  ? drizzle(postgres(process.env.AUTH_DATABASE_URL!, { max: 1 }), {
      schema: authSchema,
      casing: "snake_case",
    })
  : db;
