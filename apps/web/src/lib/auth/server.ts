import { initAuth } from "@acme/core/auth";
import { env } from "@acme/core/env";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = initAuth({
  baseUrl: env.APP_URL,
  secret: env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
});
