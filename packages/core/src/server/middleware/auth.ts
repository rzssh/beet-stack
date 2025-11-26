import { db } from "@acme/db/client";
import { eq, user as userTable } from "@acme/db";
import { Elysia } from "elysia";
import type { Auth } from "~/auth";
import { env } from "~/env";
import type { Logger } from "./attach";

/**
 * Ensures user exists in local database when authenticated via external auth.
 * Required for Expo: authenticates against production but makes API calls to localhost.
 * Only runs in development mode.
 */
async function ensureUserExistsLocally(
  sessionUser: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
  },
  logger?: Logger,
) {
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
      logger?.debug({ email: sessionUser.email }, "Syncing user by email");
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

    logger?.debug({ id: sessionUser.id, email: sessionUser.email }, "Creating local user");
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

export const createAuthMiddleware = (auth: Auth, logger?: Logger) =>
  new Elysia({ name: "better-auth" })
    .mount(auth.handler)
    .macro({
      auth: {
        async resolve({ status, request: { headers } }) {
          const session = await auth.api.getSession({ headers });

          if (!session) {
            logger?.debug("No session found");
            return status(401, {
              success: false,
              message: "Unauthorized: Please check your credentials and permissions",
            });
          }

          logger?.debug({ userId: session.user.id }, "Session valid");
          await ensureUserExistsLocally(session.user, logger);

          return {
            user: session.user,
            session: session.session,
          };
        },
      },
    });
