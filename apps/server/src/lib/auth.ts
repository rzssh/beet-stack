import { initAuth } from "@acme/core/auth";
import { env } from "@acme/core/env";

export const auth = initAuth({
  baseUrl: env.MICROSERVICE_URL,
  productionUrl: env.BETTER_AUTH_URL,
  secret: env.AUTH_SECRET,
  providers: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
});
