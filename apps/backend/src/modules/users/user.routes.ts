import { Elysia } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";

export const userRoutes = new Elysia({ prefix: "/me" })
  .use(authMiddleware)
  .guard(
    {
      auth: true,
    },
    (app) =>
      app.get("/", ({ user, session }) => ({
        user,
        session,
      })),
  );
