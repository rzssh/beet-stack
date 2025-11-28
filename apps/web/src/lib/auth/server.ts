import { initAuth } from "@acme/core/auth";
import { env } from "@acme/core/env";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getBaseUrl } from "~/lib/utils";

export const auth = initAuth({
  baseUrl: getBaseUrl(),
  productionUrl: env.BETTER_AUTH_URL ?? getBaseUrl(),
  secret: env.AUTH_SECRET,
  providers: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  extraPlugins: [tanstackStartCookies()],
});
