import { Elysia } from "elysia";
import type { Auth } from "../../auth";
import { UnauthorizedError } from "../errors";
import type { Logger } from "./attach";

export const createAuthMiddleware = (auth: Auth, logger?: Logger) =>
  new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({ headers });

        if (!session) {
          logger?.debug("No session found");
          throw new UnauthorizedError(
            "Unauthorized: Please check your credentials and permissions",
          );
        }

        logger?.debug({ userId: session.user.id }, "Session valid");

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
