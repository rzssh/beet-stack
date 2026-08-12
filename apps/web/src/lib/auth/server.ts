import { initAuth } from "@beet/core/auth";
import { env } from "@beet/core/env";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = initAuth({
  baseUrl: env.APP_URL,
  secret: env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
});
