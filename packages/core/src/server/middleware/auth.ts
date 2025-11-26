import { db } from "@acme/db/client";
import { user as userTable, eq } from "@acme/db";
import { Elysia } from "elysia";
import type { Auth } from "~/auth";
import { env } from "~/env";

/**
 * Ensures user exists in local database when authenticated via external auth.
 * Required for Expo: authenticates against production but makes API calls to localhost.
 * Only runs in development mode.
 */
async function ensureUserExistsLocally(sessionUser: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
}) {
  if (env.NODE_ENV !== "development") return;

  try {
    const existingById = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, sessionUser.id))
      .limit(1);

    if (existingById.length > 0) return;

    const existingByEmail = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, sessionUser.email))
      .limit(1);

    if (existingByEmail.length > 0) {
      await db
        .update(userTable)
        .set({
          id: sessionUser.id,
          name: sessionUser.name,
          emailVerified: sessionUser.emailVerified,
          image: sessionUser.image,
        })
        .where(eq(userTable.email, sessionUser.email));
      return;
    }

    await db.insert(userTable).values({
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      emailVerified: sessionUser.emailVerified,
      image: sessionUser.image,
    });
  } catch {
    // Ignore - user might already exist from race condition
  }
}

export const createAuthMiddleware = (auth: Auth) =>
  new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session)
          return status(401, {
            success: false,
            message:
              "Unauthorized: Please check your credentials and permissions",
          });

        // Sync user to local DB if needed (for oAuthProxy flow in development)
        await ensureUserExistsLocally(session.user);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
