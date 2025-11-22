// import { drizzle } from "drizzle-orm/postgres-js";
// import { migrate } from "drizzle-orm/postgres-js/migrator";

import { account, user } from "./auth-schema";
import { note } from "./schema";
import { db } from "./client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  // await migrate(db, {
  //   migrationsFolder: `${process.env.ROOT_DIR}/packages/db/migrations`,
  // });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const newUser = (
    await db
      .insert(user)
      .values({
        id: Bun.randomUUIDv7(),
        email: "rachel@remix.run",
        emailVerified: true,
        name: "Rachel",
      })
      .returning()
  ).at(0)!;

  const hash = await Bun.password.hash("racheliscool");
  await db.insert(account).values({
    id: Bun.randomUUIDv7(),
    userId: newUser.id,
    accountId: newUser.id,
    providerId: "credential",
    password: hash,
  });

  await db.insert(note).values([
    {
      title: "My first note",
      body: "This is my first note",
      userId: newUser.id,
    },
    {
      title: "My second note",
      body: "This is my second note",
      userId: newUser.id,
    },
  ]);

  console.log("Database has been seeded. 🌱");
  process.exit(0);
}

void seed();
