import { auth } from "@acme/platform";
import { Elysia } from "elysia";

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
  .use(auth.handler)
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
