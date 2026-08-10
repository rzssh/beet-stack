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
