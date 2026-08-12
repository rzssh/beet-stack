import { env } from "@beet/core/env";
import { user } from "@beet/db/auth-schema";
import { db } from "@beet/db/client";
import { message } from "@beet/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "./lib/auth";

const DEMO_EMAIL = "demo@beet.local";
const DEMO_PASSWORD = "demo-password";
const DEMO_NAME = "Demo User";

const DEMO_MESSAGES = [
  {
    id: "demo-message-welcome",
    title: "Welcome to BEET",
    content:
      "This development seed created your demo account and a few starter messages.",
  },
  {
    id: "demo-message-try-api",
    title: "Try the API",
    content:
      "Sign in with the documented credentials, then create, read, update, and delete your own messages.",
  },
  {
    id: "demo-message-ownership",
    title: "Ownership is enforced",
    content:
      "Every query is scoped to your user id, so other accounts cannot read or modify your messages.",
  },
];

function assertLoopback(url: string) {
  const hostname = new URL(url).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(
      `seed refused: ${hostname} is not a loopback database host`,
    );
  }
}

export async function seed() {
  if (env.NODE_ENV === "production") {
    throw new Error("seed refused: NODE_ENV is production");
  }
  assertLoopback(env.DATABASE_URL);

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, DEMO_EMAIL));
  const userId =
    existing?.id ??
    (
      await auth.api.signUpEmail({
        body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME },
      })
    ).user.id;

  await db
    .insert(message)
    .values(DEMO_MESSAGES.map((entry) => ({ ...entry, userId })))
    .onConflictDoNothing({ target: message.id });

  console.log("beet: development seed complete");
  console.log(`  demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  seeded messages: ${DEMO_MESSAGES.length}`);
}

if (import.meta.main) {
  seed().then(() => db.$client.end());
}
