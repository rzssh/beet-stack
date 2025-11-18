import { Elysia } from "elysia";
import { auth } from "~/lib/auth-server";

const resolveSession = async (headers: Headers) => {
  try {
    return await auth.api.getSession({
      headers,
    });
  } catch {
    return null;
  }
};

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive(async ({ request }) => {
    const session = await resolveSession(request.headers);

    return {
      currentUser: session?.user ?? null,
      currentSession: session?.session ?? null,
    };
  })
  .macro({
    auth: {
      async resolve({ status, request }) {
        const session = await resolveSession(request.headers);

        if (!session) {
          return status(401);
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
