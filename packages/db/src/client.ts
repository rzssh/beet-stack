// import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// export const client = createClient({
//   url: process.env.DATABASE_URL,
//   authToken: process.env.DATABASE_AUTH_TOKEN,
// });

export const db = drizzle(process.env.DATABASE_URL, { schema });

await migrate(db, {
  migrationsFolder: `${process.env.ROOT_DIR}/packages/db/migrations`,
});
