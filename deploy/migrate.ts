import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const appDir = process.env.BEET_APP_DIR ?? "/app";
const migrationsFolder =
  process.env.BEET_MIGRATIONS ?? `${appDir}/packages/db/migrations`;

const sql = postgres(url, { max: 1 });
const db = drizzle(sql);
await migrate(db, { migrationsFolder });
await sql.end();
console.log("beet: database migrations applied");
