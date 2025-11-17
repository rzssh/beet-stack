import { Elysia } from "elysia";
import { auth } from "~/libs/better-auth/server";

const authService = new Elysia().all("/api/auth/*", (context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];

  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  }

  return context.status(405);
});

export { authService };
