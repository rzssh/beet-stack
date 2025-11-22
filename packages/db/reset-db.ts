import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = postgres(DATABASE_URL);

try {
  console.log("🗑️  Resetting database...");
  
  // Drop and recreate the public schema
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`GRANT ALL ON SCHEMA public TO postgres`;
  await sql`GRANT ALL ON SCHEMA public TO public`;
  
  console.log("✅ Database reset complete!");
  
  await sql.end();
  process.exit(0);
} catch (error) {
  console.error("❌ Error resetting database:", error);
  await sql.end();
  process.exit(1);
}